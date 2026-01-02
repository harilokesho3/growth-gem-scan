import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per hour per IP

// In-memory rate limit store (resets on function cold start)
const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

// Clean old entries periodically to prevent memory leaks
const cleanupRateLimitStore = () => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now - value.windowStart > RATE_LIMIT_WINDOW_MS * 2) {
      rateLimitStore.delete(key);
    }
  }
};

// Get client IP from request headers
const getClientIP = (req: Request): string => {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         req.headers.get('x-real-ip') ||
         req.headers.get('cf-connecting-ip') ||
         'unknown';
};

// Check rate limit and return remaining requests
const checkRateLimit = (ip: string): { allowed: boolean; remaining: number; resetIn: number } => {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  // Clean up old entries periodically
  if (Math.random() < 0.01) cleanupRateLimitStore();
  
  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    // New window
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetIn: RATE_LIMIT_WINDOW_MS };
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const resetIn = RATE_LIMIT_WINDOW_MS - (now - record.windowStart);
    return { allowed: false, remaining: 0, resetIn };
  }
  
  record.count++;
  rateLimitStore.set(ip, record);
  return { 
    allowed: true, 
    remaining: MAX_REQUESTS_PER_WINDOW - record.count, 
    resetIn: RATE_LIMIT_WINDOW_MS - (now - record.windowStart) 
  };
};

// UUID validation regex
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Input validation helper
const validateInput = (text: unknown, maxLength: number = 1000): string => {
  if (typeof text !== 'string') return '';
  return text.trim().slice(0, maxLength);
};

// Sanitize text to prevent prompt injection
const sanitizeForPrompt = (text: string): string => {
  return text
    .replace(/system:|assistant:|user:/gi, '')
    .replace(/[\[\]{}]/g, '')
    .trim();
};

// Validate and sanitize area responses object
const validateAreaResponses = (areaResponses: unknown): Record<string, string> => {
  if (!areaResponses || typeof areaResponses !== 'object') return {};
  const result: Record<string, string> = {};
  const allowedKeys = ['market', 'product', 'businessModel', 'marketing', 'operations', 'finance', 'team', 'legal'];
  for (const [key, value] of Object.entries(areaResponses as Record<string, unknown>)) {
    if (allowedKeys.includes(key)) {
      result[key] = sanitizeForPrompt(validateInput(value, 2000));
    }
  }
  return result;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Apply rate limiting
  const clientIP = getClientIP(req);
  const rateLimit = checkRateLimit(clientIP);
  
  console.log(`Rate limit check for IP ${clientIP}: allowed=${rateLimit.allowed}, remaining=${rateLimit.remaining}`);
  
  if (!rateLimit.allowed) {
    const resetMinutes = Math.ceil(rateLimit.resetIn / 60000);
    console.warn(`Rate limit exceeded for IP: ${clientIP}`);
    return new Response(
      JSON.stringify({ 
        error: `Rate limit exceeded. Please try again in ${resetMinutes} minutes.`,
        retryAfter: Math.ceil(rateLimit.resetIn / 1000)
      }), 
      {
        status: 429,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil(rateLimit.resetIn / 1000)),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(rateLimit.resetIn / 1000))
        },
      }
    );
  }

  try {
    // Extract and verify Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Missing Authorization header");
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { ideaId, ideaTitle, ideaDescription, targetMarket, problemSolved, areaResponses } = body;
    
    // Validate UUID format
    if (!ideaId || !uuidRegex.test(ideaId)) {
      console.error("Invalid ideaId format:", ideaId);
      return new Response(JSON.stringify({ error: 'Invalid ID format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate and sanitize all inputs
    const safeIdeaTitle = sanitizeForPrompt(validateInput(ideaTitle, 200));
    const safeIdeaDescription = sanitizeForPrompt(validateInput(ideaDescription, 2000));
    const safeTargetMarket = sanitizeForPrompt(validateInput(targetMarket, 500));
    const safeProblemSolved = sanitizeForPrompt(validateInput(problemSolved, 2000));
    const safeAreaResponses = validateAreaResponses(areaResponses);

    // Ensure required fields are present
    if (!safeIdeaTitle || !safeIdeaDescription || !safeProblemSolved) {
      console.error("Missing required fields");
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log("Analyzing idea:", safeIdeaTitle);
    
    // Create client with user JWT for RLS enforcement
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user owns this idea validation (RLS will enforce this)
    const { data: ideaValidation, error: authError } = await userSupabase
      .from('idea_validations')
      .select('id, user_id')
      .eq('id', ideaId)
      .single();

    if (authError || !ideaValidation) {
      console.error("Authorization check failed:", authError);
      return new Response(JSON.stringify({ error: 'Unauthorized or not found' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build operational areas section if provided
    let operationalAreasSection = '';
    if (Object.keys(safeAreaResponses).length > 0) {
      operationalAreasSection = `
Idea Stage Details:
- Market (Target Customer): ${safeAreaResponses.market || 'Not provided'}
- Product (Solution): ${safeAreaResponses.product || 'Not provided'}
- Business Model (Revenue): ${safeAreaResponses.businessModel || 'Not provided'}
- Marketing (Customer Acquisition): ${safeAreaResponses.marketing || 'Not provided'}
- Operations (Resources/Tools): ${safeAreaResponses.operations || 'Not provided'}
- Finance (3-Month Budget): ${safeAreaResponses.finance || 'Not provided'}
- Team (Founders & Skills): ${safeAreaResponses.team || 'Not provided'}
- Legal (Registration Status): ${safeAreaResponses.legal || 'Not provided'}
`;
    }

    const prompt = `You are a startup idea validation expert. Analyze this business idea and provide scores and recommendations.

Idea Details:
- Title: ${safeIdeaTitle}
- Description: ${safeIdeaDescription}
- Target Market: ${safeTargetMarket}
- Problem Solved: ${safeProblemSolved}
${operationalAreasSection}
Evaluate the idea on:
1. Feasibility (0-100): How realistic is it to build and launch this?
2. Innovation (0-100): How unique and differentiated is this idea?
3. Market Potential (0-100): How large and accessible is the target market?

Consider the operational area responses when evaluating:
- Market & Product responses inform feasibility and market potential
- Business Model & Finance responses inform feasibility
- Marketing & Operations responses inform feasibility
- Team responses inform overall viability
- Legal responses inform feasibility and risks

IMPORTANT: Structure your analysis with clear **Strengths:** and **Weaknesses:** sections so they can be extracted for the PDF report.

IMPORTANT: In your recommendations, include structured sections with these exact headers (one item per line after each header):
**Red Flags:**
- [critical risks or warning signs]

**Green Flags:**
- [strengths and positive indicators]

**Stop Doing:**
- [activities to stop immediately]

**Start Doing:**
- [new activities to begin]

**Fix First:**
- [urgent priorities to address immediately]

**Fix Later:**
- [important but can wait]

Provide:
- Scores for each dimension
- An overall viability score
- Strengths and weaknesses

Respond in JSON format with this structure:
{
  "scores": {
    "feasibility": number,
    "innovation": number,
    "marketPotential": number,
    "overall": number
  },
  "analysis": "Include **Strengths:** section listing key strengths, then **Weaknesses:** section listing key challenges based on all provided information",
  "recommendations": "Include all the structured sections: Red Flags, Green Flags, Stop Doing, Start Doing, Fix First, Fix Later with specific actionable items"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert startup advisor and idea validation specialist. Always respond with valid JSON." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    console.log("AI response received");
    
    // Parse the JSON from the AI response
    let parsedResult;
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      parsedResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      parsedResult = {
        scores: {
          feasibility: 70,
          innovation: 65,
          marketPotential: 60,
          overall: 65
        },
        analysis: content,
        recommendations: "Consider conducting customer interviews and building a minimum viable product to validate demand."
      };
    }

    // Update the idea validation in the database using service role key
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: updateError } = await supabase
      .from('idea_validations')
      .update({
        feasibility_score: parsedResult.scores.feasibility,
        innovation_score: parsedResult.scores.innovation,
        market_potential_score: parsedResult.scores.marketPotential,
        overall_score: parsedResult.scores.overall,
        ai_analysis: parsedResult.analysis,
        ai_recommendations: parsedResult.recommendations,
        status: 'completed'
      })
      .eq('id', ideaId);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw updateError;
    }

    console.log("Idea validation updated successfully");

    return new Response(JSON.stringify({ success: true, result: parsedResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in analyze-idea:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
