"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { FileText, MessageSquare, Compass, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardData {
  resumeCount: number;
  careerCount: number;
  reviewCount: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("获取失败");
      const d = await res.json();
      setData(d);
    } catch {
      setData({ resumeCount: 0, careerCount: 0, reviewCount: 0 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const stats = data ?? {
    resumeCount: 0,
    careerCount: 0,
    reviewCount: 0,
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">求职仪表盘</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        你的求职进度概览
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link href="/resume">
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6 transition-colors hover:bg-accent/50">
            <FileText className="size-10 text-primary" />
            <div>
              <p className="text-2xl font-bold">{stats.resumeCount}</p>
              <p className="text-sm text-muted-foreground">简历优化次数</p>
            </div>
            <Button variant="outline" size="sm">
              去优化
            </Button>
          </div>
        </Link>
        <Link href="/interview">
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6 transition-colors hover:bg-accent/50">
            <MessageSquare className="size-10 text-primary" />
            <div>
              <p className="text-2xl font-bold">{stats.reviewCount}</p>
              <p className="text-sm text-muted-foreground">待复习错题</p>
            </div>
            <Button variant="outline" size="sm">
              去复习
            </Button>
          </div>
        </Link>
        <Link href="/career">
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-6 transition-colors hover:bg-accent/50">
            <Compass className="size-10 text-primary" />
            <div>
              <p className="text-2xl font-bold">{stats.careerCount}</p>
              <p className="text-sm text-muted-foreground">职业规划数</p>
            </div>
            <Button variant="outline" size="sm">
              去规划
            </Button>
          </div>
        </Link>
      </div>

      <div className="mt-8 flex items-center gap-2 rounded-lg border border-border bg-card p-4">
        <BarChart3 className="size-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          持续使用职引AI，完善简历、刷题、规划职业，提升求职成功率
        </p>
      </div>
    </div>
  );
}
