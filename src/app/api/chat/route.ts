import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { streamText, generateText } from "ai";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, stream = true, model = "openai", pdfBase64 } = await req.json();

  // Use Claude for PDF parsing with direct Anthropic SDK
  if (pdfBase64) {
    try {
      const client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      // Extract the system message if any
      const systemMessage = messages.find((m: any) => m.role === "system")?.content || "";
      const userMessage = messages[messages.length - 1].content;

      const response = await client.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4096,
        system: systemMessage,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: userMessage,
              },
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: pdfBase64,
                },
              },
            ],
          },
        ],
      });

      const textContent = response.content.find((c) => c.type === "text");
      return new Response(textContent?.text || "", {
        headers: { "Content-Type": "text/plain" },
      });
    } catch (error) {
      console.error("Claude PDF parsing error:", error);
      throw error;
    }
  }

  // Use OpenAI for text/markdown
  if (!stream) {
    const result = await generateText({
      model: openai("gpt-4o"),
      messages,
    });

    return new Response(result.text, {
      headers: { "Content-Type": "text/plain" },
    });
  }

  // For streaming requests (like chat wizard)
  const result = streamText({
    model: openai("gpt-4o"),
    messages,
  });

  return result.toDataStreamResponse();
}
