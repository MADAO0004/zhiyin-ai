/**
 * 从对话内容中提取技术/知识点关键词
 * 规则：反引号内的词、常见技术词、连续大写开头的词组
 */

const TECH_TERMS = new Set([
  "React", "Vue", "Angular", "Next.js", "Nuxt", "Svelte", "Remix",
  "TypeScript", "JavaScript", "Python", "Rust", "Go", "Java", "C++",
  "Node.js", "Express", "FastAPI", "Django", "Flask",
  "Hooks", "useState", "useEffect", "useCallback", "useMemo", "useRef",
  "Redux", "Zustand", "Pinia", "MobX",
  "Tailwind", "CSS", "HTML", "GraphQL", "REST", "API",
  "Webpack", "Vite", "esbuild", "Turbo",
  "Git", "Docker", "Kubernetes", "PostgreSQL", "MongoDB", "Redis",
  "算法", "数据结构", "闭包", "原型链", "异步", "Promise", "async",
  "考研", "面试", "LeetCode", "前端", "后端", "全栈",
]);

// 从反引号中提取
function extractFromBackticks(text: string): string[] {
  const matches = text.matchAll(/`([^`]{2,40})`/g);
  return [...matches].map((m) => m[1].trim()).filter(Boolean);
}

// 匹配已知技术词
function extractTechTerms(text: string): string[] {
  const result: string[] = [];
  for (const term of TECH_TERMS) {
    if (text.includes(term)) result.push(term);
  }
  return result;
}

// 匹配连续大写开头的词组（如 React Hooks）
function extractCapitalizedPhrases(text: string): string[] {
  const matches = text.matchAll(/\b([A-Z][a-zA-Z0-9]*(?:\s+[A-Z][a-zA-Z0-9]*){0,2})\b/g);
  return [...matches]
    .map((m) => m[1].trim())
    .filter((s) => s.length >= 2 && s.length <= 30);
}

export function extractKeywords(text: string): string[] {
  if (!text || typeof text !== "string") return [];

  const combined = new Set<string>();
  const parts = [extractFromBackticks(text), extractTechTerms(text), extractCapitalizedPhrases(text)];

  for (const part of parts) {
    for (const term of part) {
      const normalized = term.trim();
      if (normalized.length >= 2 && normalized.length <= 40) {
        combined.add(normalized);
      }
    }
  }

  return Array.from(combined);
}
