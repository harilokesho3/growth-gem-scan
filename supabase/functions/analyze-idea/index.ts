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
    const { ideaId, ideaTitle, ideaDescription, targetMarket, problemSolved, areaResponses } = await req.json();
    
    console.log("Analyzing idea:", ideaTitle);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build operational areas section if provided
    let operationalAreasSection = '';
    if (areaResponses) {
      operationalAreasSection = `
Idea Stage Details:
- Market (Target Customer): ${areaResponses.market || 'Not provided'}
- Product (Solution): ${areaResponses.product || 'Not provided'}
- Business Model (Revenue): ${areaResponses.businessModel || 'Not provided'}
- Marketing (Customer Acquisition): ${areaResponses.marketing || 'Not provided'}
- Operations (Resources/Tools): ${areaResponses.operations || 'Not provided'}
- Finance (3-Month Budget): ${areaResponses.finance || 'Not provided'}
- Team (Founders & Skills): ${areaResponses.team || 'Not provided'}
- Legal (Registration Status): ${areaResponses.legal || 'Not provided'}
`;
    }

    const prompt = `You are a startup idea validation expert. Analyze this business idea and provide scores and recommendations.

Idea Details:
- Title: ${ideaTitle}
- Description: ${ideaDescription}
- Target Market: ${targetMarket}
- Problem Solved: ${problemSolved}
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
  "recommendations": "specific next steps to validate and develop the idea (this will NOT be shown in PDF, only in consultation)"
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

    // Update the idea validation in the database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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
