import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { websiteUrl } = await req.json();

    if (!websiteUrl) {
      console.error('No website URL provided');
      return new Response(
        JSON.stringify({ success: false, error: 'Website URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlApiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format URL
    let formattedUrl = websiteUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log('Scraping website:', formattedUrl);

    // Scrape the website using Firecrawl
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown'],
        onlyMainContent: true,
      }),
    });

    const scrapeData = await scrapeResponse.json();

    if (!scrapeResponse.ok) {
      console.error('Firecrawl API error:', scrapeData);
      return new Response(
        JSON.stringify({ success: false, error: scrapeData.error || 'Failed to scrape website' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const websiteContent = scrapeData.data?.markdown || scrapeData.markdown || '';
    const metadata = scrapeData.data?.metadata || scrapeData.metadata || {};

    console.log('Website scraped successfully, content length:', websiteContent.length);

    if (!websiteContent || websiteContent.length < 50) {
      return new Response(
        JSON.stringify({ success: false, error: 'Could not extract enough content from the website. Please try a different URL or fill the form manually.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use AI to analyze the website and extract diagnostic information
    const systemPrompt = `You are an expert startup analyst. Analyze the given website content and extract information to complete a startup diagnostic form.

Based on the website content, extract and infer the following information. Be as specific as possible based on what you can find. If something isn't explicitly stated, make reasonable inferences based on the content.

Return a JSON object with this exact structure:
{
  "companyInfo": {
    "companyName": "Company name from the website",
    "industry": "One of: saas, fintech, healthtech, ecommerce, edtech, marketplace, ai-ml, other",
    "stage": "Best guess from: idea, mvp, pre-seed, seed, series-a, series-b+",
    "teamSize": "Best guess from: 1, 2-5, 6-10, 11-25, 26-50, 50+"
  },
  "responses": {
    "market": {
      "q0": "Who is their ideal customer and their biggest pain point (max 50 words)",
      "q1": "Who are main competitors and what makes them different (max 50 words)"
    },
    "product": {
      "q0": "Product description and how it solves customer problems (max 50 words)",
      "q1": "Yes or No - do they have an MVP launched?",
      "q2": "Yes or No - do they have paying customers?"
    },
    "businessModel": {
      "q0": "How do they make money? Their pricing model (max 50 words)",
      "q1": "Best guess for margin: < 0%, 0–10%, 10–30%, or >30%"
    },
    "marketing": {
      "q0": "How do customers discover their product (max 50 words)",
      "q1": "Best guess of what they track: CAC, LTV, Channel-wise ROI, or None (comma separated)"
    },
    "operations": {
      "q0": "What tools and processes they use (max 50 words)",
      "q1": "Yes or No - are core processes documented?"
    },
    "finance": {
      "q0": "Current financial situation and runway (max 50 words)",
      "q1": "Yes or No - do they have external funding?",
      "q2": "Yes or No - do they track key financial metrics?"
    },
    "team": {
      "q0": "Founding team description and key skills (max 50 words)",
      "q1": "Yes or No - do they have skill gaps?"
    },
    "legal": {
      "q0": "Legal structure and registration status (max 50 words)",
      "q1": "Yes or No - is IP protected?",
      "q2": "Yes or No - are they compliant with regulations?"
    }
  }
}

Important:
- Keep all text responses under 50 words
- For yes/no questions, respond with exactly "Yes" or "No"
- For choice questions, use exactly one of the provided options
- For multiselect, use comma-separated values from the options
- Make reasonable inferences where information isn't explicit
- Return ONLY valid JSON, no markdown formatting`;

    const userPrompt = `Website URL: ${formattedUrl}
Website Title: ${metadata.title || 'Unknown'}
Website Description: ${metadata.description || 'None'}

Website Content:
${websiteContent.substring(0, 15000)}`;

    console.log('Sending to AI for analysis...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'AI credits required. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: false, error: 'AI analysis failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      console.error('No AI content received');
      return new Response(
        JSON.stringify({ success: false, error: 'AI did not return analysis' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('AI response received, parsing...');

    // Parse the JSON from AI response
    let extractedData;
    try {
      // Remove markdown code blocks if present
      let cleanContent = aiContent.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3);
      }
      extractedData = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, aiContent);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to parse AI analysis. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Website analysis complete');

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: extractedData,
        websiteTitle: metadata.title || formattedUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error analyzing website:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Failed to analyze website' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
