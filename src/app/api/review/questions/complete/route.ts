import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

const INTERVALS = [1, 3, 7, 14, 30];

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
    const { reviewId } = body as { reviewId: string };
    if (!reviewId) {
      return Response.json({ error: "缺少 reviewId" }, { status: 400 });
    }

    const { data: review, error: fetchError } = await supabase
      .from("question_reviews")
      .select("id, review_level")
      .eq("id", reviewId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !review) {
      return Response.json({ error: "记录不存在" }, { status: 404 });
    }

    const level = Math.min((review.review_level ?? 0) + 1, INTERVALS.length - 1);
    const days = INTERVALS[level];
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + days);

    const { error: updateError } = await supabase
      .from("question_reviews")
      .update({
        review_level: level,
        next_review_at: nextReview.toISOString(),
        last_reviewed_at: new Date().toISOString(),
      })
      .eq("id", reviewId)
      .eq("user_id", user.id);

    if (updateError) throw updateError;

    return Response.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "操作失败";
    return Response.json({ error: msg }, { status: 500 });
  }
}
