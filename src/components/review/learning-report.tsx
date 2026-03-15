"use client";

import { useCallback, useEffect, useState } from "react";
import { BarChart3, BookOpen, MessageSquare, RotateCcw } from "lucide-react";

interface ReportData {
  days: number;
  summary: {
    newConceptsCount: number;
    reviewedCount: number;
    conversationCount: number;
    totalKnowledgeNodes: number;
  };
  newConcepts: { id: string; name: string; createdAt: string }[];
  reviewedConcepts: { id: string; name: string; reviewedAt: string }[];
  recentConversations: { id: string; title: string; created_at: string }[];
}

interface LearningReportProps {
  days?: number;
}

export function LearningReport({ days = 7 }: LearningReportProps) {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/learning-report?days=${days}`);
      if (!res.ok) throw new Error("获取失败");
      const d = await res.json();
      setData(d);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center py-12 text-sm text-muted-foreground">
        加载失败，请刷新重试
      </div>
    );
  }

  const { summary, newConcepts, reviewedConcepts } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <BarChart3 className="size-4" />
        近 {data.days} 天学习概览
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BookOpen className="size-4" />
            <span className="text-xs">新学概念</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{summary.newConceptsCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <RotateCcw className="size-4" />
            <span className="text-xs">复习次数</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{summary.reviewedCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageSquare className="size-4" />
            <span className="text-xs">对话数</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{summary.conversationCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <BookOpen className="size-4" />
            <span className="text-xs">知识库总量</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{summary.totalKnowledgeNodes}</p>
        </div>
      </div>

      {newConcepts.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium">新学知识点</h3>
          <div className="flex flex-wrap gap-2">
            {newConcepts.map((c) => (
              <span
                key={c.id}
                className="rounded-md bg-primary/10 px-2.5 py-1 text-sm"
              >
                {c.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {reviewedConcepts.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium">已复习知识点</h3>
          <div className="flex flex-wrap gap-2">
            {reviewedConcepts.map((c) => (
              <span
                key={c.id}
                className="rounded-md bg-green-500/10 px-2.5 py-1 text-sm text-green-700 dark:text-green-400"
              >
                {c.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {newConcepts.length === 0 && reviewedConcepts.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          暂无近期学习记录，开始对话学习吧
        </p>
      )}
    </div>
  );
}
