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
    const { sectionNumber, section, title, topic, audience } = await req.json();

    if (!section) {
      return new Response(
        JSON.stringify({ error: "Section data is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const systemPrompt = `You are writing a section of a beginner's digital PDF guide. Write in a warm, direct, conversational tone — like a knowledgeable friend talking to someone doing this for the first time. Short paragraphs. Plain language. Grade 5 reading level. No jargon. No filler. At least one concrete real-world example per section. Every sentence must earn its place. Make the reader feel capable and clear, not overwhelmed. Write approximately 150-200 words for this section. Return only the section content, no headings or titles.`;

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
            content: `Write section ${sectionNumber}: ${section.title}. Description: ${section.description}. Cover these points: ${section.bullets.join(', ')}.`,
          },
        ],
        system: systemPrompt,
      }),
    });

    const data = await response.json();
    const content = data.content[0].text.trim();

    return new Response(JSON.stringify({ content }), {
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
