import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { extractKeywords } from "@/lib/keyword-extract";

/**
 * POST /api/knowledge-extract
 * 从对话内容中提取关键词，创建/关联知识节点
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message_id, conversation_id, content } = body as {
      message_id: string;
      conversation_id: string;
      content?: string;
    };

    if (!message_id || !conversation_id) {
      return Response.json({ error: "缺少 message_id 或 conversation_id" }, { status: 400 });
    }

    const text = content ?? "";
    const keywords = extractKeywords(text);
    if (keywords.length === 0) return Response.json({ extracted: 0 });

    const nodeIds: string[] = [];

    for (const name of keywords) {
      const { data: existing } = await supabase
        .from("knowledge_nodes")
        .select("id")
        .eq("name", name)
        .limit(1)
        .maybeSingle();

      let nodeId: string;
      if (existing) {
        nodeId = existing.id;
        const { data: node } = await supabase
          .from("knowledge_nodes")
          .select("next_review_at")
          .eq("id", nodeId)
          .single();
        if (node?.next_review_at == null) {
          const nextReview = new Date();
          nextReview.setDate(nextReview.getDate() + 1);
          await supabase
            .from("knowledge_nodes")
            .update({ next_review_at: nextReview.toISOString() })
            .eq("id", nodeId);
        }
      } else {
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + 1);
        const { data: inserted, error } = await supabase
          .from("knowledge_nodes")
          .insert({ name, next_review_at: nextReview.toISOString(), review_level: 0 })
          .select("id")
          .single();
        if (error) continue;
        nodeId = inserted!.id;
      }
      nodeIds.push(nodeId);

      const { data: existingLink } = await supabase
        .from("message_knowledge_links")
        .select("id")
        .eq("message_id", message_id)
        .eq("knowledge_node_id", nodeId)
        .maybeSingle();
      if (!existingLink) {
        await supabase.from("message_knowledge_links").insert({
          message_id,
          knowledge_node_id: nodeId,
        });
      }

      const { data: existingConvLink } = await supabase
        .from("conversation_knowledge_links")
        .select("id")
        .eq("conversation_id", conversation_id)
        .eq("knowledge_node_id", nodeId)
        .maybeSingle();
      if (!existingConvLink) {
        await supabase.from("conversation_knowledge_links").insert({
          conversation_id,
          knowledge_node_id: nodeId,
        });
      }
    }

    for (let i = 0; i < nodeIds.length; i++) {
      for (let j = i + 1; j < nodeIds.length; j++) {
        const [a, b] = [nodeIds[i], nodeIds[j]];
        const { data: existingEdge } = await supabase
          .from("knowledge_edges")
          .select("id")
          .eq("source_node_id", a)
          .eq("target_node_id", b)
          .maybeSingle();
        if (!existingEdge) {
          await supabase.from("knowledge_edges").insert({
            source_node_id: a,
            target_node_id: b,
            relation_type: "related_to",
          });
        }
      }
    }

    return Response.json({ extracted: keywords.length, nodes: nodeIds.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "知识提取失败";
    return Response.json({ error: msg }, { status: 500 });
  }
}
