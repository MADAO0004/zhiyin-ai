import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/learning-report
 * 学习周报：汇总近 N 天的学习数据
 * Query: days=7 (默认 7 天)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = Math.min(Math.max(Number(searchParams.get("days")) || 7, 1), 90);

    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString();

    const [
      { data: newNodes },
      { data: reviewedNodes },
      { data: conversations },
      { count: totalNodes },
    ] = await Promise.all([
      supabase
        .from("knowledge_nodes")
        .select("id, name, created_at")
        .gte("created_at", sinceStr)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("knowledge_nodes")
        .select("id, name, last_reviewed_at")
        .gte("last_reviewed_at", sinceStr)
        .order("last_reviewed_at", { ascending: false })
        .limit(50),
      supabase
        .from("conversations")
        .select("id, title, created_at")
        .gte("created_at", sinceStr)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase.from("knowledge_nodes").select("id", { count: "exact", head: true }),
    ]);

    const newConcepts = (newNodes ?? []).map((n) => ({
      id: n.id,
      name: n.name,
      createdAt: n.created_at,
    }));

    const reviewedConcepts = (reviewedNodes ?? []).map((n) => ({
      id: n.id,
      name: n.name,
      reviewedAt: n.last_reviewed_at,
    }));

    return Response.json({
      days,
      since: sinceStr,
      summary: {
        newConceptsCount: newConcepts.length,
        reviewedCount: reviewedConcepts.length,
        conversationCount: (conversations ?? []).length,
        totalKnowledgeNodes: totalNodes ?? 0,
      },
      newConcepts,
      reviewedConcepts,
      recentConversations: (conversations ?? []).slice(0, 10),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "生成学习周报失败";
    return Response.json({ error: msg }, { status: 500 });
  }
}
