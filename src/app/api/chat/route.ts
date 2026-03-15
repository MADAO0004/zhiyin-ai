import OpenAI from "openai";
import { NextRequest } from "next/server";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

export async function POST(request: NextRequest) {
  try {
    const { messages } = (await request.json()) as {
      messages: OpenAI.ChatCompletionMessageParam[];
    };
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages 数组不能为空" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const stream = await openai.chat.completions.create({
      model: "deepseek-reasoner",
      messages,
      stream: true,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const choice = chunk.choices?.[0];
            const delta = choice?.delta as {
              content?: string;
              reasoning_content?: string;
            } | undefined;
            if (!delta) continue;

            if (delta.reasoning_content != null && delta.reasoning_content !== "") {
              controller.enqueue(
                encoder.encode(`REASONING:${delta.reasoning_content}`)
              );
            }
            if (delta.content != null && delta.content !== "") {
              controller.enqueue(encoder.encode(`CONTENT:${delta.content}`));
            }
          }
          controller.close();
        } catch (err) {
          const msg = err instanceof Error ? err.message : "流式传输发生错误";
          controller.enqueue(encoder.encode(`ERROR:${msg}`));
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "请求处理失败";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
