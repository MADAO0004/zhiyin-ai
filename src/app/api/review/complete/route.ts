import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

/** 复习间隔（天）：0->1, 1->3, 2->7, 3->14, 4->30 */
const INTERVALS = [1, 3, 7, 14, 30];

/**
 * POST /api/review/complete
 * 标记知识节点已复习，按遗忘曲线更新下次复习时间
 * Body: { nodeId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const nodeId = body?.nodeId;

    if (!nodeId) {
      return Response.json({ error: "缺少 nodeId" }, { status: 400 });
    }

    const { data: node } = await supabase
      .from("knowledge_nodes")
      .select("id, review_level")
      .eq("id", nodeId)
      .single();

    if (!node) {
      return Response.json({ error: "节点不存在" }, { status: 404 });
    }

    const level = Math.min((node.review_level ?? 0) + 1, INTERVALS.length - 1);
    const days = INTERVALS[level];
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + days);

    const { error } = await supabase
      .from("knowledge_nodes")
      .update({
        review_level: level,
        last_reviewed_at: new Date().toISOString(),
        next_review_at: nextReview.toISOString(),
      })
      .eq("id", nodeId);

    if (error) throw error;

    return Response.json({
      ok: true,
      nextReviewAt: nextReview.toISOString(),
      reviewLevel: level,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "更新复习记录失败";
    return Response.json({ error: msg }, { status: 500 });
  }
}
