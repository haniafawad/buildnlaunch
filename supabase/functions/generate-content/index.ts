import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { productTitle, audience, topic, contentType, format, angle } = await req.json();

    if (!contentType || !format) {
      return new Response(
        JSON.stringify({ error: "Content type and format are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const systemPrompt = `You are a social media content strategist for a digital product creator. Create one piece of short-form content for TikTok and Instagram Reels. Write in simple conversational language — grade 5 reading level. Sound like a real person talking to a friend — not a marketer. No income guarantees. No hype. Short punchy lines — one idea per line. The content should feel genuine and human. Never salesy.

Content type today: ${contentType}
Format today: ${format}

Output exactly this structure as JSON:
{
  "contentType": "${contentType}",
  "format": "${format}",
  "textOverlay": "3-5 short punchy lines — ready to add to video",
  "caption": "short punchy lines, one idea per line, ends with comment CTA or bio link CTA",
  "hashtags": "5-7 relevant hashtags"
}

Return ONLY the JSON object, no other text.`;

    const userMessage = `Product: ${productTitle || 'digital product'}. Audience: ${audience || 'beginners'}. Topic: ${topic || 'general'}. Specific angle if any: ${angle || 'none'}.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: userMessage,
          },
        ],
        system: systemPrompt,
      }),
    });

    const data = await response.json();
    const contentText = data.content[0].text.trim();

    // Parse the JSON from the response
    const jsonMatch = contentText.match(/\{[\s\S]*\}/);
    let content;
    if (jsonMatch) {
      content = JSON.parse(jsonMatch[0]);
    } else {
      // Fallback structure
      content = {
        contentType: contentType,
        format: format,
        textOverlay: "Your product can change everything",
        caption: "Link in bio",
        hashtags: "#digitalproduct #makemoney"
      };
    }

    return new Response(JSON.stringify(content), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Something went wrong" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
