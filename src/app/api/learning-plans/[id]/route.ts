import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, total_days } = body as { name?: string; total_days?: number };

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name;
    if (total_days !== undefined) updates.total_days = total_days;

    const { data, error } = await supabase
      .from("learning_plans")
      .update(updates)
      .eq("id", id)
      .select("id, name, total_days, updated_at")
      .single();

    if (error) throw error;
    return Response.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "更新学习计划失败";
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase.from("learning_plans").delete().eq("id", id);

    if (error) throw error;
    return Response.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "删除学习计划失败";
    return Response.json({ error: msg }, { status: 500 });
  }
}
