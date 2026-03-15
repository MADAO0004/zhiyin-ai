import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/review/due
 * 返回待复习的知识节点（next_review_at <= now 或从未设置过的旧节点）
 */
export async function GET(_request: NextRequest) {
  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("knowledge_nodes")
      .select("id, name, next_review_at, review_level")
      .or(`next_review_at.lte.${now},next_review_at.is.null`)
      .order("next_review_at", { ascending: true, nullsFirst: true })
      .limit(20);

    if (error) throw error;

    const items = (data ?? []).map((n) => ({
      id: n.id,
      name: n.name,
      nextReviewAt: n.next_review_at,
      reviewLevel: n.review_level ?? 0,
    }));

    return Response.json({ items });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "获取待复习列表失败";
    return Response.json({ error: msg }, { status: 500 });
  }
}
