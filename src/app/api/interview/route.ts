import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const INTERVIEW_PROMPT = `你是大厂技术面试官。请根据以下信息评估用户回答。

题目：{{question}}
标准答案要点：{{modelAnswer}}

用户回答：
---
{{userAnswer}}
---

请严格按以下 JSON 格式输出：
{
  "score": 1-10 的分数,
  "feedback": "详细反馈：正确点、不足、改进建议",
  "followUp": "下一题或追问（若无则空字符串）",
  "isPass": true/false，6分以上为 true
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
    const {
      question,
      modelAnswer,
      userAnswer,
      questionId,
    } = body as {
      question: string;
      modelAnswer?: string;
      userAnswer: string;
      questionId?: string;
    };

    if (!question || !userAnswer) {
      return Response.json({ error: "缺少题目或回答" }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com",
    });

    const prompt = INTERVIEW_PROMPT.replace("{{question}}", question)
      .replace("{{modelAnswer}}", modelAnswer ?? "无")
      .replace("{{userAnswer}}", userAnswer.slice(0, 4000));

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let parsed: {
      score?: number;
      feedback?: string;
      followUp?: string;
      isPass?: boolean;
    };
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { score: 5, feedback: "解析失败", followUp: "", isPass: false };
    }

    const score = typeof parsed.score === "number" ? parsed.score : 5;
    const isPass = parsed.isPass ?? score >= 6;

    if (questionId && !isPass) {
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + 1);
      const { data: existing } = await supabase
        .from("question_reviews")
        .select("id")
        .eq("user_id", user.id)
        .eq("question_id", questionId)
        .maybeSingle();
      if (existing) {
        await supabase
          .from("question_reviews")
          .update({
            next_review_at: nextReview.toISOString(),
            review_level: 0,
            last_reviewed_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("question_reviews").insert({
          user_id: user.id,
          question_id: questionId,
          next_review_at: nextReview.toISOString(),
          review_level: 0,
          last_reviewed_at: new Date().toISOString(),
        });
      }
    }

    return Response.json({
      score,
      feedback: parsed.feedback ?? "",
      followUp: parsed.followUp ?? "",
      isPass,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "评估失败";
    return Response.json({ error: msg }, { status: 500 });
  }
}
