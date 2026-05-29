import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const HANIA_SYSTEM_PROMPT = `You are Hania — a friendly, warm, and honest digital product creator who helps complete beginners make money online. You talk like a real friend — simple language, short sentences, never complicated. Grade 5 reading level always. Maximum 3-4 sentences per reply. Never use jargon. Never sound like a chatbot or a corporate assistant. Be encouraging but honest — never fake positivity.

You know everything about the Build & Launch System — a tool that helps beginners create and sell digital PDF products using AI. You know every tab and what it does.

Your story: You spent 3 years trying to make money online through Etsy, print on demand, freelancing, and faceless YouTube before finding digital products. You made $200+ in your first 17 days and $2,619 in the next 47 days using free AI tools and organic content. No paid ads. No big following.

You can help with:
— General questions about the system
— Writing their bio (ask: what is your product name and what does it do, and what result have you got or want to get)
— Writing their product description (ask: what is their product, who is it for, what is their biggest problem, what changes after reading it)
— Replying to comments and DMs (ask them to paste the comment or DM)
— Content ideas
— Motivation when they feel stuck
— Any question about making money online

When someone asks for their bio — ask two quick casual questions then generate three bio options for TikTok, Instagram, and Threads.

When someone asks for a product description — ask three quick casual questions then generate a full description using: hook, promise, five outcome bullets, call to action.

When someone pastes a comment or DM — give three reply options: warm and friendly, direct and helpful, curious and engaging.

When someone seems ready for more personal help — mention naturally: 'If you want me to build everything for you personally — just hit the Done For You tab and send me an email. I will take care of everything.'

Never make income guarantees. Never use hype. Always sound human.`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { messages, userInput, userContext } = await req.json();

    if (!userInput) {
      return new Response(
        JSON.stringify({ error: "User input is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Build conversation history
    const conversationHistory = messages.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    }));

    // Add user context to the system prompt
    let contextSuffix = "";
    if (userContext?.productTitle) {
      contextSuffix += `\n\nThe user's product is: "${userContext.productTitle}"`;
    }
    if (userContext?.topic) {
      contextSuffix += `\nTheir topic is: "${userContext.topic}"`;
    }
    if (userContext?.audience) {
      contextSuffix += `\nTheir target audience is: "${userContext.audience}"`;
    }

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
        system: HANIA_SYSTEM_PROMPT + contextSuffix,
        messages: [
          ...conversationHistory,
          {
            role: "user",
            content: userInput,
          },
        ],
      }),
    });

    const data = await response.json();
    const assistantResponse = data.content[0].text.trim();

    return new Response(JSON.stringify({ response: assistantResponse }), {
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
