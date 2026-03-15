import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const CAREER_PROMPT = `你是职业规划师。请根据用户信息生成 3-5 年职业路径。

用户输入：
{{input}}

请严格按以下 JSON 格式输出：
{
  "nodes": [
    { "id": "节点ID", "label": "阶段名称", "type": "start|milestone|end", "desc": "简短描述" }
  ],
  "edges": [
    { "source": "源节点ID", "target": "目标节点ID" }
  ],
  "resources": [
    { "phase": "阶段", "title": "资源名", "url": "链接或为空", "desc": "说明" }
  ],
  "summary": "整体路径摘要"
}`;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "未登录" }, { status: 401 });
    }

    const body = await request.json();
    const input = body as Record<string, unknown>;

    const openai = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com",
    });

    const prompt = CAREER_PROMPT.replace(
      "{{input}}",
      JSON.stringify(input, null, 2)
    );

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let planJson: Record<string, unknown>;
    try {
      planJson = JSON.parse(raw);
    } catch {
      planJson = {
        nodes: [],
        edges: [],
        resources: [],
        summary: "生成失败，请重试",
      };
    }

    await supabase.from("career_plans").insert({
      user_id: user.id,
      input_data: input,
      plan_json: planJson,
    });

    return Response.json(planJson);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "生成失败";
    return Response.json({ error: msg }, { status: 500 });
  }
}
