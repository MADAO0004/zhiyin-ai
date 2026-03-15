import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "未登录" }, { status: 401 });
    }

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from("question_reviews")
      .select(`
        id,
        question_id,
        next_review_at,
        review_level,
        questions (id, category, question, model_answer)
      `)
      .eq("user_id", user.id)
      .or(`next_review_at.is.null,next_review_at.lte.${now}`)
      .order("next_review_at", { ascending: true, nullsFirst: true })
      .limit(50);

    if (error) throw error;

    const items = (data ?? []).map((r) => {
      const q = (r.questions as unknown) as
        | { id: string; category: string; question: string; model_answer: string | null }
        | null
        | undefined;
      return {
        id: r.id,
        questionId: r.question_id,
        question: q?.question ?? "",
        category: q?.category ?? "",
        modelAnswer: q?.model_answer ?? "",
        nextReviewAt: r.next_review_at,
        reviewLevel: r.review_level ?? 0,
      };
    });

    return Response.json({ items });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "获取失败";
    return Response.json({ error: msg }, { status: 500 });
  }
}
