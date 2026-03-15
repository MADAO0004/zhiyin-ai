import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await _request.json();
    const title = body.title as string | undefined;

    if (!title) {
      return Response.json({ error: "缺少 title" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("conversations")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("id, title, updated_at")
      .single();

    if (error) throw error;
    return Response.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "更新对话失败";
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase.from("conversations").delete().eq("id", id);

    if (error) throw error;
    return Response.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "删除对话失败";
    return Response.json({ error: msg }, { status: 500 });
  }
}
