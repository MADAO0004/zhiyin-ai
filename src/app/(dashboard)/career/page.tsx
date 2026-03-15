"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Compass, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const ReactFlowEditor = dynamic(
  () => import("@/components/career/career-flow").then((m) => m.CareerFlow),
  { ssr: false, loading: () => <div className="h-96 animate-pulse rounded bg-muted" /> }
);

interface PlanData {
  nodes?: { id: string; label: string; type?: string; desc?: string }[];
  edges?: { source: string; target: string }[];
  resources?: { phase: string; title: string; url?: string; desc?: string }[];
  summary?: string;
}

export default function CareerPage() {
  const [major, setMajor] = useState("");
  const [interest, setInterest] = useState("");
  const [targetIndustry, setTargetIndustry] = useState("");
  const [projectExp, setProjectExp] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPlan(null);
    try {
      const res = await fetch("/api/career-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          major,
          interest,
          targetIndustry,
          projectExp,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "生成失败");
      }
      const data = await res.json();
      setPlan(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败");
    } finally {
      setLoading(false);
    }
  }, [major, interest, targetIndustry, projectExp]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">就业规划</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        输入背景，AI 生成职业路径与学习路线
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">专业</label>
          <input
            type="text"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            placeholder="如：计算机科学与技术"
            className={cn(
              "mt-1 block w-full rounded border border-input bg-background px-3 py-2 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">兴趣方向</label>
          <input
            type="text"
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            placeholder="如：后端开发、算法、前端"
            className={cn(
              "mt-1 block w-full rounded border border-input bg-background px-3 py-2 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">目标行业</label>
          <input
            type="text"
            value={targetIndustry}
            onChange={(e) => setTargetIndustry(e.target.value)}
            placeholder="如：互联网、金融科技"
            className={cn(
              "mt-1 block w-full rounded border border-input bg-background px-3 py-2 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">项目/实习经历</label>
          <textarea
            value={projectExp}
            onChange={(e) => setProjectExp(e.target.value)}
            placeholder="简要描述"
            rows={2}
            className={cn(
              "mt-1 block w-full rounded border border-input bg-background px-3 py-2 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
          />
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={loading}
        className="mt-4 gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            生成中…
          </>
        ) : (
          <>
            <Compass className="size-4" />
            生成职业路径
          </>
        )}
      </Button>

      {error && (
        <p className="mt-4 text-sm text-destructive">{error}</p>
      )}

      {plan && (
        <div className="mt-8 space-y-4">
          {plan.summary && (
            <p className="text-muted-foreground">{plan.summary}</p>
          )}
          {plan.nodes && plan.nodes.length > 0 && (
            <div className="h-96 rounded-lg border border-border">
              <ReactFlowEditor
                nodes={plan.nodes}
                edges={plan.edges ?? []}
              />
            </div>
          )}
          {plan.resources && plan.resources.length > 0 && (
            <div>
              <h3 className="font-medium">学习资源</h3>
              <ul className="mt-2 space-y-2">
                {plan.resources.map((r, i) => (
                  <li
                    key={i}
                    className="rounded border border-border bg-card p-3 text-sm"
                  >
                    <span className="font-medium">{r.phase}</span> - {r.title}
                    {r.desc && (
                      <p className="mt-1 text-muted-foreground">{r.desc}</p>
                    )}
                    {r.url && (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 block text-primary hover:underline"
                      >
                        {r.url}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
