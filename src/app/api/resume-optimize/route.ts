import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const RESUME_PROMPT = `你是一位腾讯/阿里资深招聘官。请分析以下简历文本，针对目标岗位给出优化建议。

目标岗位：{{targetRole}}
简历原文：
---
{{text}}
---

请严格按以下 JSON 格式输出，不要输出其他内容：
{
  "issues": [
    {
      "type": "关键词缺失|量化不足|格式混乱|ATS不友好|其他",
      "description": "具体问题描述",
      "suggestion": "改进建议"
    }
  ],
  "optimized": "优化后的完整简历文本（保留原有结构，只做修改）",
  "score": 0-100的匹配度分数
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
    const { text, targetRole = "后端开发" } = body as {
      text?: string;
      targetRole?: string;
    };

    if (!text || typeof text !== "string") {
      return Response.json(
        { error: "缺少简历文本" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com",
    });

    const prompt = RESUME_PROMPT.replace("{{targetRole}}", targetRole).replace(
      "{{text}}",
      text.slice(0, 8000)
    );

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let parsed: {
      issues?: { type: string; description: string; suggestion: string }[];
      optimized?: string;
      score?: number;
    };
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { issues: [], optimized: raw, score: 60 };
    }

    const issues = Array.isArray(parsed.issues) ? parsed.issues : [];
    const optimized = parsed.optimized ?? text;
    const score = typeof parsed.score === "number" ? parsed.score : 60;

    const { data: resume, error } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        original_text: text,
        optimized_text: optimized,
        target_role: targetRole,
        issues_json: issues,
        match_score: score,
      })
      .select("id")
      .single();

    if (error) {
      console.error("resume insert error:", error);
    }

    return Response.json({
      issues,
      optimized,
      score,
      id: resume?.id,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "请求失败";
    return Response.json({ error: msg }, { status: 500 });
  }
}
