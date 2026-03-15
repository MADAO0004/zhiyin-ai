import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, status, position, due_date } = body as {
      title?: string;
      description?: string | null;
      status?: "todo" | "in_progress" | "done";
      position?: number;
      due_date?: string | null;
    };

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (position !== undefined) updates.position = position;
    if (due_date !== undefined) updates.due_date = due_date;

    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", id)
      .select("id, learning_plan_id, title, description, status, position, due_date, updated_at")
      .single();

    if (error) throw error;
    return Response.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "更新任务失败";
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) throw error;
    return Response.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "删除任务失败";
    return Response.json({ error: msg }, { status: 500 });
  }
}
