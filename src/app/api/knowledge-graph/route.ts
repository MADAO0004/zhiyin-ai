import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/knowledge-graph
 * 返回 { nodes, links } 格式，供 react-force-graph 使用
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversation_id");

    let nodeIds: string[] = [];

    if (conversationId) {
      const { data: links } = await supabase
        .from("conversation_knowledge_links")
        .select("knowledge_node_id")
        .eq("conversation_id", conversationId);
      nodeIds = [...new Set((links ?? []).map((l) => l.knowledge_node_id))];
    }

    const { data: nodesData, error: nodesError } = await supabase
      .from("knowledge_nodes")
      .select("id, name")
      .order("created_at", { ascending: true });

    if (nodesError) throw nodesError;

    let nodeList = nodesData ?? [];
    if (nodeIds.length > 0) {
      const idSet = new Set(nodeIds);
      nodeList = nodeList.filter((n) => idSet.has(n.id));
    }

    const { data: edgesData, error: edgesError } = await supabase
      .from("knowledge_edges")
      .select("id, source_node_id, target_node_id, relation_type");

    if (edgesError) throw edgesError;

    const nodeMap = new Map(nodeList.map((n) => [n.id, n]));
    const validNodeIds = new Set(nodeMap.keys());

    const links = (edgesData ?? [])
      .filter((e) => validNodeIds.has(e.source_node_id) && validNodeIds.has(e.target_node_id))
      .map((e) => ({
        id: e.id,
        source: e.source_node_id,
        target: e.target_node_id,
      }));

    const nodes = nodeList.map((n) => ({
      id: n.id,
      name: n.name,
    }));

    return Response.json({ nodes, links });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "获取知识图谱失败";
    return Response.json({ error: msg }, { status: 500 });
  }
}
