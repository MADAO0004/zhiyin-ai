/**
 * 导入八股题库到 Supabase
 * 运行: pnpm seed:questions  或  npx tsx scripts/seed-questions.ts
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const m = line.match(/^([^=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  } catch {}
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("请配置 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const QUESTIONS = [
  { category: "算法", question: "二分查找的时间复杂度为什么是 O(log n)？", model_answer: "每次比较淘汰一半元素，n 个元素最多比较 log₂n 次。" },
  { category: "算法", question: "动态规划的状态转移方程怎么找？", model_answer: "定义状态、找子问题、写转移式、确定初值和计算顺序。" },
  { category: "Java", question: "Java 中 == 和 equals 的区别？", model_answer: "== 比较引用，equals 比较内容（可重写）。" },
  { category: "Java", question: "HashMap 和 Hashtable 的区别？", model_answer: "HashMap 线程不安全、允许 null，Hashtable 反之。" },
  { category: "操作系统", question: "进程和线程的区别？", model_answer: "进程是资源分配单位，线程是调度单位。同一进程内线程共享内存。" },
  { category: "网络", question: "TCP 和 UDP 的区别？", model_answer: "TCP 面向连接、可靠、有序；UDP 无连接、不可靠、低延迟。" },
  { category: "前端", question: "React Hooks 中 useState 和 useEffect 的使用场景？", model_answer: "useState 存状态，useEffect 处理副作用（请求、订阅）。" },
  { category: "数据库", question: "MySQL 的 InnoDB 和 MyISAM 区别？", model_answer: "InnoDB 支持事务、行锁、外键；MyISAM 表锁、不支持事务。" },
  { category: "HR", question: "为什么要换工作/找实习？", model_answer: "结合个人发展、学习机会、行业兴趣，正面表达。" },
];

async function main() {
  console.log("开始导入八股题库...");
  const { data, error } = await supabase
    .from("questions")
    .insert(QUESTIONS)
    .select("id");
  if (error) {
    console.error("导入失败:", error.message);
    process.exit(1);
  }
  console.log(`成功导入 ${data?.length ?? 0} 道题目`);
}

main().catch(console.error);
