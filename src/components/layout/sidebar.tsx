"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageSquarePlus, Settings, History, PanelLeftClose, Loader2, ListTodo, Network, Trash2, BookOpen, BarChart3 } from "lucide-react";
import type { Conversation } from "@/types/database";

interface SidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onHistoryClick?: (conversationId: string) => void;
  onNewChat?: () => void;
  onConversationDelete?: (conversationId: string) => void;
  onTasksClick?: () => void;
  onGraphClick?: () => void;
  onReviewClick?: () => void;
  onReportClick?: () => void;
  activeView?: "chat" | "tasks" | "graph" | "review" | "report";
  refreshKey?: number;
}

export function Sidebar({ className, isOpen, onClose, onHistoryClick, onNewChat, onConversationDelete, onTasksClick, onGraphClick, onReviewClick, onReportClick, activeView, refreshKey }: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = useCallback(
    async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (deletingId) return;
      try {
        setDeletingId(id);
        const res = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("删除失败");
        setConversations((prev) => prev.filter((c) => c.id !== id));
        onConversationDelete?.(id);
      } catch {
        setDeletingId(null);
      } finally {
        setDeletingId(null);
      }
    },
    [deletingId, onConversationDelete]
  );

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/conversations");
      if (!res.ok) throw new Error("获取失败");
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : []);
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations, refreshKey]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "flex h-full w-64 shrink-0 flex-col border-r border-border bg-card transition-transform md:translate-x-0",
          "fixed inset-y-0 left-0 z-50 md:relative",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className
        )}
      >
      <div className="relative flex flex-col gap-2 p-3">
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 md:hidden"
            onClick={onClose}
          >
            <PanelLeftClose className="size-4" />
          </Button>
        )}
        <div className="flex flex-wrap gap-1">
          <Button
            variant={activeView === "chat" ? "default" : "outline"}
            size="sm"
            className="flex-1 justify-center gap-1 font-medium"
            onClick={() => {
              onNewChat?.();
              onClose?.();
            }}
          >
            <MessageSquarePlus className="size-3.5" />
            对话
          </Button>
          <Button
            variant={activeView === "tasks" ? "default" : "outline"}
            size="sm"
            className="flex-1 justify-center gap-1 font-medium"
            onClick={() => {
              onTasksClick?.();
              onClose?.();
            }}
          >
            <ListTodo className="size-3.5" />
            计划
          </Button>
          <Button
            variant={activeView === "graph" ? "default" : "outline"}
            size="sm"
            className="flex-1 justify-center gap-1 font-medium"
            onClick={() => {
              onGraphClick?.();
              onClose?.();
            }}
          >
            <Network className="size-3.5" />
            图谱
          </Button>
          <Button
            variant={activeView === "review" ? "default" : "outline"}
            size="sm"
            className="flex-1 justify-center gap-1 font-medium"
            onClick={() => {
              onReviewClick?.();
              onClose?.();
            }}
          >
            <BookOpen className="size-3.5" />
            复习
          </Button>
          <Button
            variant={activeView === "report" ? "default" : "outline"}
            size="sm"
            className="flex-1 justify-center gap-1 font-medium"
            onClick={() => {
              onReportClick?.();
              onClose?.();
            }}
          >
            <BarChart3 className="size-3.5" />
            周报
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {activeView === "chat" && (
          <>
            <div className="flex items-center gap-2 px-2 py-2 text-xs font-medium text-muted-foreground">
              <History className="size-3.5" />
              历史记录
            </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ul className="space-y-0.5">
            {conversations.map((c) => (
              <li key={c.id}>
                <div
                  className="group flex items-center gap-1 rounded-md transition-colors hover:bg-accent"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onHistoryClick?.(c.id);
                      onClose?.();
                    }}
                    className="min-w-0 flex-1 truncate px-3 py-2 text-left text-sm text-foreground transition-colors hover:text-accent-foreground"
                  >
                    {c.title}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, c.id)}
                    disabled={deletingId === c.id}
                    className="shrink-0 rounded p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 disabled:opacity-50"
                    title="删除"
                  >
                    {deletingId === c.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
          </>
        )}
        {activeView === "tasks" && (
          <div className="px-2 py-4 text-center text-xs text-muted-foreground">
            在主区域管理学习计划与任务
          </div>
        )}
        {activeView === "graph" && (
          <div className="px-2 py-4 text-center text-xs text-muted-foreground">
            主区域展示知识图谱，对话中的技术关键词会自动提取并关联
          </div>
        )}
        {activeView === "review" && (
          <div className="px-2 py-4 text-center text-xs text-muted-foreground">
            基于遗忘曲线，按时复习巩固
          </div>
        )}
        {activeView === "report" && (
          <div className="px-2 py-4 text-center text-xs text-muted-foreground">
            近期的学习数据汇总
          </div>
        )}
      </div>

      <div className="border-t border-border px-3 py-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 py-2.5"
        >
          <Settings className="size-4 shrink-0" />
          <span className="truncate">个人设置</span>
        </Button>
      </div>
    </aside>
    </>
  );
}
