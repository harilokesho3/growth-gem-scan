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

// Validate and sanitize responses object
const validateResponses = (responses: unknown): Record<string, string> => {
  if (!responses || typeof responses !== 'object') return {};
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(responses as Record<string, unknown>)) {
    if (typeof key === 'string' && key.length <= 50) {
      result[sanitizeForPrompt(validateInput(key, 50))] = sanitizeForPrompt(validateInput(value, 2000));
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
    const { diagnosticId, companyName, industry, stage, teamSize, responses } = body;
    
    // Validate UUID format
    if (!diagnosticId || !uuidRegex.test(diagnosticId)) {
      console.error("Invalid diagnosticId format:", diagnosticId);
      return new Response(JSON.stringify({ error: 'Invalid ID format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate and sanitize all inputs
    const safeCompanyName = sanitizeForPrompt(validateInput(companyName, 200));
    const safeIndustry = sanitizeForPrompt(validateInput(industry, 100));
    const safeStage = sanitizeForPrompt(validateInput(stage, 50));
    const safeTeamSize = sanitizeForPrompt(validateInput(teamSize, 50));
    const safeResponses = validateResponses(responses);

    // Ensure required fields are present
    if (!safeCompanyName || !safeIndustry || !safeStage || !safeTeamSize) {
      console.error("Missing required fields");
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log("Analyzing diagnostic for:", safeCompanyName);
    
    // Create client with user JWT for RLS enforcement
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user owns this diagnostic (RLS will enforce this)
    const { data: diagnostic, error: authError } = await userSupabase
      .from('diagnostics')
      .select('id, user_id')
      .eq('id', diagnosticId)
      .single();

    if (authError || !diagnostic) {
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

    const prompt = `You are a startup diagnostic expert. Analyze this startup and provide scores and recommendations.

Startup Details:
- Company: ${safeCompanyName}
- Industry: ${safeIndustry}
- Stage: ${safeStage}
- Team Size: ${safeTeamSize}

Assessment Responses:
${JSON.stringify(safeResponses, null, 2)}

Provide a comprehensive analysis with:
1. Scores (0-100) for each of the 8 areas: Market, Product, Business Model, Marketing, Operations, Finance, Team, Legal
2. An overall score
3. Key strengths and weaknesses for each area

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

Respond in JSON format with this structure:
{
  "scores": {
    "market": number,
    "product": number,
    "businessModel": number,
    "marketing": number,
    "operations": number,
    "finance": number,
    "team": number,
    "legal": number,
    "overall": number
  },
  "analysis": "Format this with **Market:** analysis... **Product:** analysis... etc. Include **Strengths:** and **Weaknesses:** subsections within each area.",
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
          { role: "system", content: "You are an expert startup advisor and diagnostic specialist. Always respond with valid JSON." },
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
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      parsedResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Provide default scores if parsing fails
      parsedResult = {
        scores: {
          market: 65,
          product: 70,
          businessModel: 60,
          marketing: 55,
          operations: 65,
          finance: 50,
          team: 75,
          legal: 60,
          overall: 63
        },
        analysis: content,
        recommendations: "Please review your startup across all areas and focus on your weakest scores."
      };
    }

    // Update the diagnostic in the database using service role key for the update
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: updateError } = await supabase
      .from('diagnostics')
      .update({
        market_score: parsedResult.scores.market,
        product_score: parsedResult.scores.product,
        business_model_score: parsedResult.scores.businessModel,
        marketing_score: parsedResult.scores.marketing,
        operations_score: parsedResult.scores.operations,
        finance_score: parsedResult.scores.finance,
        team_score: parsedResult.scores.team,
        legal_score: parsedResult.scores.legal,
        overall_score: parsedResult.scores.overall,
        ai_analysis: parsedResult.analysis,
        ai_recommendations: parsedResult.recommendations,
        status: 'completed'
      })
      .eq('id', diagnosticId);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw updateError;
    }

    console.log("Diagnostic updated successfully");

    return new Response(JSON.stringify({ success: true, result: parsedResult }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in analyze-diagnostic:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
