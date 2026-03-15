import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const learningPlanId = searchParams.get("learning_plan_id");

    let query = supabase
      .from("tasks")
      .select("id, learning_plan_id, title, description, status, position, due_date, created_at, updated_at")
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });

    if (learningPlanId) {
      query = query.eq("learning_plan_id", learningPlanId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return Response.json(data ?? []);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "获取任务失败";
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { learning_plan_id, title, description, status } = body as {
      learning_plan_id?: string | null;
      title?: string;
      description?: string | null;
      status?: "todo" | "in_progress" | "done";
    };

    if (!title || typeof title !== "string") {
      return Response.json({ error: "缺少 title" }, { status: 400 });
    }

    const { data: maxPosData } = await supabase
      .from("tasks")
      .select("position")
      .eq("learning_plan_id", learning_plan_id ?? null)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();

    const position = ((maxPosData?.position as number) ?? -1) + 1;

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        learning_plan_id: learning_plan_id ?? null,
        title,
        description: description ?? null,
        status: status ?? "todo",
        position,
      })
      .select("id, learning_plan_id, title, description, status, position, due_date, created_at, updated_at")
      .single();

    if (error) throw error;
    return Response.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "创建任务失败";
    return Response.json({ error: msg }, { status: 500 });
  }
}
