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
    const { title, topic, audience } = await req.json();

    if (!title) {
      return new Response(
        JSON.stringify({ error: "Title is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const systemPrompt = `You are a digital product strategist and writer. Create a complete PDF guide outline for a beginner creating their first digital product. Write in warm, simple, conversational language. Grade 5 reading level. No jargon. The outline should have 10 sections. Each section gets: a clear title, one sentence describing what it covers, and 3 bullet points of specific content inside it. The outline should flow logically from the reader's problem all the way to the solution and a clear action plan. Return the outline as a JSON array with this exact structure for each section:
{
  "title": "Section title",
  "description": "One sentence description",
  "bullets": ["bullet 1", "bullet 2", "bullet 3"]
}

Return ONLY the JSON array, no other text.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: `Product title: ${title}. Target audience: ${audience || 'beginners'}. Topic: ${topic || 'general'}.`,
          },
        ],
        system: systemPrompt,
      }),
    });

    const data = await response.json();
    const outlineText = data.content[0].text.trim();

    // Parse the JSON from the response
    const jsonMatch = outlineText.match(/\[[\s\S]*\]/);
    let outline = [];
    if (jsonMatch) {
      outline = JSON.parse(jsonMatch[0]);
    }

    return new Response(JSON.stringify({ outline }), {
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
