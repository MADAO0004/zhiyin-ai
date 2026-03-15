import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return Response.json({ error: "未登录" }, { status: 401 });
    }

    const [resumesRes, careerRes, reviewRes] = await Promise.all([
      supabase
        .from("resumes")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("career_plans")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
      supabase
        .from("question_reviews")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

    const resumeCount = resumesRes.count ?? 0;
    const careerCount = careerRes.count ?? 0;
    const reviewCount = reviewRes.count ?? 0;

    return Response.json({
      resumeCount,
      careerCount,
      reviewCount,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "获取失败";
    return Response.json({ error: msg }, { status: 500 });
  }
}
