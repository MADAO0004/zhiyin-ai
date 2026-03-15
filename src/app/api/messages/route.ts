import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return Response.json({ error: "缺少 conversationId" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("messages")
      .select("id, conversation_id, role, content, reasoning, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return Response.json(data ?? []);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "获取消息失败";
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversation_id, role, content, reasoning } = body as {
      conversation_id: string;
      role: "user" | "assistant";
      content?: string;
      reasoning?: string;
    };

    if (!conversation_id || !role) {
      return Response.json({ error: "缺少 conversation_id 或 role" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id,
        role,
        content: content ?? "",
        reasoning: reasoning ?? "",
      })
      .select("id, conversation_id, role, content, reasoning, created_at")
      .single();

    if (error) throw error;

    // 更新 conversation 的 updated_at
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversation_id);

    return Response.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "保存消息失败";
    return Response.json({ error: msg }, { status: 500 });
  }
}
