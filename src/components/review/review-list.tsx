"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, CheckCircle, Loader2, MessageSquare } from "lucide-react";

interface DueItem {
  id: string;
  name: string;
  nextReviewAt: string | null;
  reviewLevel: number;
}

interface ReviewListProps {
  onStartReview?: (name: string) => void;
  onRefresh?: () => void;
}

export function ReviewList({ onStartReview, onRefresh }: ReviewListProps) {
  const [items, setItems] = useState<DueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const fetchDue = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/review/due");
      if (!res.ok) throw new Error("获取失败");
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDue();
  }, [fetchDue]);

  const handleComplete = useCallback(
    async (item: DueItem) => {
      if (completingId) return;
      try {
        setCompletingId(item.id);
        const res = await fetch("/api/review/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodeId: item.id }),
        });
        if (!res.ok) throw new Error("标记失败");
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        onRefresh?.();
      } catch {
        setCompletingId(null);
      } finally {
        setCompletingId(null);
      }
    },
    [completingId, onRefresh]
  );

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
        <BookOpen className="size-12 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">暂无待复习内容</p>
        <p className="text-xs text-muted-foreground/80">
          与 AI 对话学习后，知识点会自动加入复习计划
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="mb-4 text-sm text-muted-foreground">
        共 {items.length} 个知识点待复习（基于遗忘曲线）
      </p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3"
          >
            <span className="font-medium">{item.name}</span>
            <div className="flex shrink-0 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStartReview?.(item.name)}
                className="gap-1.5"
              >
                <MessageSquare className="size-3.5" />
                去复习
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleComplete(item)}
                disabled={completingId === item.id}
                className="gap-1.5 text-green-600 hover:bg-green-500/10 hover:text-green-600"
              >
                {completingId === item.id ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <CheckCircle className="size-3.5" />
                )}
                已掌握
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
