import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// 构建时若未配置，使用占位值以通过编译（运行时会报错提示配置）
const hasConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient = createClient(
  hasConfig ? supabaseUrl : "https://placeholder.supabase.co",
  hasConfig ? supabaseAnonKey : "placeholder-anon-key"
);

if (!hasConfig) {
  console.warn(
    "Supabase 未配置：请在 .env.local 中设置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}
