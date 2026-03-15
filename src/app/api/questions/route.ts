import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 100);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    let query = supabase
      .from("questions")
      .select("id, category, question, model_answer")
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: true });

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (error) throw error;

    const categoriesRes = await supabase
      .from("questions")
      .select("category")
      .limit(500);
    const cats = [...new Set((categoriesRes.data ?? []).map((r) => r.category))];

    return Response.json({
      questions: data ?? [],
      categories: cats.sort(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "获取失败";
    return Response.json({ error: msg }, { status: 500 });
  }
}
