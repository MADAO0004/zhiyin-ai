/**
 * 本地执行：往 Supabase 插入 25 条演示对话
 * 运行: pnpm seed  或  npx tsx scripts/seed-db.ts
 * 会读取 .env.local 中的 Supabase 配置
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

const DATA = [
  { title: "React Hooks 与 useState 用法", q: "React Hooks 中 useState 和 useEffect 的区别？", a: "useState 用于状态，useEffect 用于副作用。", r: "Hooks 是 React 16.8 引入的。" },
  { title: "TypeScript 泛型进阶", q: "TypeScript 泛型约束 extends 怎么用？", a: "extends 约束泛型类型，如 T extends keyof Obj。", r: "泛型约束让类型更安全。" },
  { title: "Next.js 服务端渲染", q: "getServerSideProps 和 getStaticProps 区别？", a: "前者每次请求执行，后者构建时执行。", r: "SSR 和 SSG 是 Next.js 核心能力。" },
  { title: "闭包与内存泄漏", q: "闭包会导致内存泄漏吗？", a: "会持有引用，需及时解除监听、清空引用。", r: "闭包是 JS 基础。" },
  { title: "Promise 和 async/await", q: "Promise.all 和 Promise.allSettled 区别？", a: "all 任一失败即失败，allSettled 等待全部返回状态。", r: "Promise 组合 API 很常用。" },
  { title: "Tailwind CSS 响应式", q: "Tailwind sm md lg 断点是多少？", a: "sm:640px, md:768px, lg:1024px。", r: "响应式是前端必备。" },
  { title: "Vue3 Composition API", q: "Vue3 setup 和 Options API 如何选？", a: "新项目建议 Composition API。", r: "受 React Hooks 启发。" },
  { title: "算法：二分查找", q: "二分查找为什么是 O(log n)？", a: "每次淘汰一半，最多 log₂n 次。", r: "二分是基础算法。" },
  { title: "Redux 状态管理", q: "Redux 和 Zustand 优缺点？", a: "Redux 生态完善，Zustand 轻量简单。", r: "按项目规模选型。" },
  { title: "前端性能优化", q: "首屏加载慢怎么优化？", a: "代码分割、懒加载、CDN、图片压缩、SSR。", r: "要结合 profiling。" },
  { title: "Node.js 事件循环", q: "事件循环的六个阶段？", a: "timers、pending、idle、poll、check、close。", r: "是 Node 异步基石。" },
  { title: "CSS Flexbox 布局", q: "justify-content 和 align-items 区别？", a: "前者主轴，后者交叉轴。", r: "Flexbox 是布局首选。" },
  { title: "GraphQL 与 REST", q: "GraphQL 相比 REST 优势？", a: "按需查询、强类型、单端点。", r: "适合复杂关联数据。" },
  { title: "Docker 容器化", q: "CMD 和 ENTRYPOINT 区别？", a: "CMD 可覆盖，ENTRYPOINT 不可。", r: "Docker 已是部署标配。" },
  { title: "Git 分支管理", q: "Git flow 和 GitHub flow 区别？", a: "Git flow 有 develop/release，GitHub flow 只有 main。", r: "影响协作效率。" },
  { title: "Webpack 打包优化", q: "tree-shaking 怎么实现？", a: "ESM 静态分析，识别未引用 export。", r: "CommonJS 难以分析。" },
  { title: "Python 装饰器", q: "@wraps 的作用？", a: "把原函数元信息复制到装饰后函数。", r: "装饰器是语法糖。" },
  { title: "LeetCode 动态规划", q: "状态转移方程怎么找？", a: "定义状态、找子问题、写转移式。", r: "DP 需大量练习。" },
  { title: "Redis 缓存策略", q: "LRU 淘汰策略如何配置？", a: "maxmemory-policy 配置 allkeys-lru 等。", r: "影响系统性能。" },
  { title: "RESTful API 设计", q: "PUT 和 PATCH 区别？", a: "PUT 全量更新，PATCH 部分更新。", r: "API 设计影响协作。" },
  { title: "前端面试准备", q: "常见手写题有哪些？", a: "防抖节流、深拷贝、手写 Promise 等。", r: "面试要系统准备。" },
  { title: "JavaScript 原型链", q: "原型链的终点？", a: "Object.prototype，其 __proto__ 为 null。", r: "是 JS 继承基础。" },
  { title: "Vite 构建原理", q: "Vite 为什么比 Webpack 快？", a: "ESM 原生支持、esbuild 预构建。", r: "代表工具链新方向。" },
  { title: "PostgreSQL 索引", q: "B-tree 和 Hash 索引适用场景？", a: "B-tree 支持范围排序，Hash 只支持等值。", r: "索引是性能关键。" },
  { title: "React useMemo", q: "useMemo 和 useCallback 什么时候用？", a: "useMemo 缓存结果，useCallback 缓存函数。", r: "避免过度优化。" },
];

async function main() {
  console.log("开始插入 25 条对话...");
  for (let i = 0; i < DATA.length; i++) {
    const d = DATA[i];
    const ts = new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000).toISOString();
    const { data: conv, error: e1 } = await supabase
      .from("conversations")
      .insert({ title: d.title, created_at: ts, updated_at: ts })
      .select("id")
      .single();
    if (e1) {
      console.error(`对话 ${i + 1} 失败:`, e1.message);
      continue;
    }
    const { error: e2 } = await supabase.from("messages").insert([
      { conversation_id: conv!.id, role: "user", content: d.q, created_at: ts },
      { conversation_id: conv!.id, role: "assistant", content: d.a, reasoning: d.r, created_at: ts },
    ]);
    if (e2) console.error(`消息 ${i + 1} 失败:`, e2.message);
    else console.log(`${i + 1}/25 ${d.title}`);
  }
  console.log("完成");
}

main().catch(console.error);
