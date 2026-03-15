import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("learning_plans")
      .select("id, name, total_days, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return Response.json(data ?? []);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "获取学习计划失败";
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, total_days } = body as { name?: string; total_days?: number };

    if (!name || typeof name !== "string") {
      return Response.json({ error: "缺少 name" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("learning_plans")
      .insert({ name, total_days: total_days ?? null })
      .select("id, name, total_days, created_at, updated_at")
      .single();

    if (error) throw error;
    return Response.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "创建学习计划失败";
    return Response.json({ error: msg }, { status: 500 });
  }
}
