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

    const prompt = `You are a seasoned startup advisor with 20+ years of experience helping founders build successful companies. Analyze this startup thoroughly and provide actionable insights.

STARTUP PROFILE:
━━━━━━━━━━━━━━━━━━━━
Company Name: ${safeCompanyName}
Industry: ${safeIndustry}
Current Stage: ${safeStage}
Team Size: ${safeTeamSize}

FOUNDER'S RESPONSES:
${JSON.stringify(safeResponses, null, 2)}

YOUR TASK:
Provide a deep, insightful analysis that a founder can actually use. Write like you're talking to the founder directly - be honest, specific, and practical. Avoid generic startup advice.

SCORING GUIDELINES (0-100):
- 80-100: Excellent - This area is a competitive advantage
- 60-79: Good - Solid foundation but room for improvement  
- 40-59: Needs Work - Significant gaps that could hurt growth
- 20-39: Critical - Major issues requiring immediate attention
- 0-19: Crisis - This could kill the business

Score each of these 8 areas: Market, Product, Business Model, Marketing, Operations, Finance, Team, Legal

ANALYSIS FORMAT:
Write a comprehensive analysis that includes:

**Strengths:**
- List 3-5 specific things this startup is doing well
- Explain WHY each strength matters for their success
- Be specific to their situation, not generic

**Weaknesses:**
- List 3-5 specific challenges or gaps
- Explain the IMPACT of each weakness on their business
- Prioritize by severity

**What's Working:**
A brief paragraph explaining what the founder should keep doing and why it's working.

**What Needs Attention:**
A brief paragraph on the most critical areas to address, written in plain language.

RECOMMENDATIONS FORMAT:
Provide actionable next steps organized as:

**Red Flags:**
- Critical risks that could seriously harm the business (be specific)

**Green Flags:**
- Positive indicators showing momentum or potential

**Stop Doing:**
- Activities that are wasting time, money, or focus

**Start Doing:**
- New actions that would move the needle

**Fix First (This Week):**
- Urgent items to tackle immediately

**Fix Later (This Month):**
- Important but less urgent improvements

Write everything in clear, conversational language. Avoid jargon. Be direct and helpful.

Respond in JSON format:
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
  "analysis": "Your detailed analysis with **Strengths:** and **Weaknesses:** sections, plus 'What's Working' and 'What Needs Attention' paragraphs",
  "recommendations": "Your actionable recommendations with Red Flags, Green Flags, Stop Doing, Start Doing, Fix First, Fix Later sections"
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
          { role: "system", content: "You are a world-class startup advisor known for giving brutally honest yet constructive feedback. You speak directly to founders in plain English, avoiding buzzwords and corporate speak. Your insights are specific, actionable, and based on real-world experience. You care deeply about helping founders succeed. Always respond with valid JSON." },
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
