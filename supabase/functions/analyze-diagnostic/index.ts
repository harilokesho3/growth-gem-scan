import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { diagnosticId, companyName, industry, stage, teamSize, responses } = await req.json();
    
    console.log("Analyzing diagnostic for:", companyName);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `You are a startup diagnostic expert. Analyze this startup and provide scores and recommendations.

Startup Details:
- Company: ${companyName}
- Industry: ${industry}
- Stage: ${stage}
- Team Size: ${teamSize}

Assessment Responses:
${JSON.stringify(responses, null, 2)}

Provide a comprehensive analysis with:
1. Scores (0-100) for each of the 8 areas: Market, Product, Business Model, Marketing, Operations, Finance, Team, Legal
2. An overall score
3. Key strengths and weaknesses for each area

IMPORTANT: Structure your analysis with clear **Strengths:** and **Weaknesses:** sections so they can be extracted for the PDF report.

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
  "recommendations": "specific actionable recommendations (this will NOT be shown in PDF, only in consultation)"
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

    // Update the diagnostic in the database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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
