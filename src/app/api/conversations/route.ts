import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("conversations")
      .select("id, title, created_at, updated_at")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return Response.json(data ?? []);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "获取对话列表失败";
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const title = (body.title as string) || "新对话";

    const { data, error } = await supabase
      .from("conversations")
      .insert({ title })
      .select("id, title, created_at, updated_at")
      .single();

    if (error) throw error;
    return Response.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "创建对话失败";
    return Response.json({ error: msg }, { status: 500 });
  }
}
