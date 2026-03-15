"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LearningPlan, Task } from "@/types/database";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Trash2,
  Calendar,
  GripVertical,
} from "lucide-react";

const COLUMNS: { status: Task["status"]; label: string }[] = [
  { status: "todo", label: "待办" },
  { status: "in_progress", label: "进行中" },
  { status: "done", label: "已完成" },
];

export function TaskBoard() {
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newPlanName, setNewPlanName] = useState("");
  const [showNewPlan, setShowNewPlan] = useState(false);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/learning-plans");
      if (!res.ok) throw new Error("获取失败");
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch {
      setPlans([]);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      const url = selectedPlanId
        ? `/api/tasks?learning_plan_id=${selectedPlanId}`
        : "/api/tasks";
      const res = await fetch(url);
      if (!res.ok) throw new Error("获取失败");
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch {
      setTasks([]);
    }
  }, [selectedPlanId]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    setLoading(true);
    fetchTasks().finally(() => setLoading(false));
  }, [fetchTasks]);

  const handleCreateTask = useCallback(async () => {
    const title = newTaskTitle.trim();
    if (!title) return;
    setNewTaskTitle("");
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learning_plan_id: selectedPlanId,
          title,
          status: "todo",
        }),
      });
      if (!res.ok) throw new Error("创建失败");
      await fetchTasks();
    } catch {
      // 静默失败
    }
  }, [newTaskTitle, selectedPlanId, fetchTasks]);

  const handleCreatePlan = useCallback(async () => {
    const name = newPlanName.trim();
    if (!name) return;
    setNewPlanName("");
    setShowNewPlan(false);
    try {
      const res = await fetch("/api/learning-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("创建失败");
      const plan = await res.json();
      setSelectedPlanId(plan.id);
      await fetchPlans();
    } catch {
      // 静默失败
    }
  }, [newPlanName, fetchPlans]);

  const handleUpdateTaskStatus = useCallback(
    async (taskId: string, status: Task["status"]) => {
      try {
        const res = await fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error("更新失败");
        await fetchTasks();
      } catch {
        // 静默失败
      }
    },
    [fetchTasks]
  );

  const handleDeleteTask = useCallback(
    async (e: React.MouseEvent, taskId: string) => {
      e.stopPropagation();
      try {
        const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("删除失败");
        await fetchTasks();
      } catch {
        // 静默失败
      }
    },
    [fetchTasks]
  );

  const handleDeletePlan = useCallback(
    async (e: React.MouseEvent, planId: string) => {
      e.stopPropagation();
      try {
        const res = await fetch(`/api/learning-plans/${planId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("删除失败");
        if (selectedPlanId === planId) setSelectedPlanId(null);
        await fetchPlans();
        await fetchTasks();
      } catch {
        // 静默失败
      }
    },
    [selectedPlanId, fetchPlans, fetchTasks]
  );

  const tasksByStatus = COLUMNS.reduce(
    (acc, { status }) => {
      acc[status] = tasks.filter((t) => t.status === status);
      return acc;
    },
    {} as Record<Task["status"], Task[]>
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* 顶部：计划选择 + 新建 */}
      <div className="shrink-0 border-b border-border px-4 py-3">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
            <button
              type="button"
              onClick={() => setSelectedPlanId(null)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm transition-colors",
                !selectedPlanId
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              全部任务
            </button>
            {plans.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPlanId(p.id)}
                className={cn(
                  "group flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition-colors",
                  selectedPlanId === p.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {p.name}
                <span
                  onClick={(e) => handleDeletePlan(e, p.id)}
                  className="ml-1 opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                  aria-label="删除计划"
                >
                  <Trash2 className="size-3" />
                </span>
              </button>
            ))}
            {showNewPlan ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreatePlan();
                }}
                className="flex items-center gap-1"
              >
                <input
                  type="text"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  placeholder="计划名称"
                  className="w-24 rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-ring"
                  autoFocus
                />
                <Button type="submit" size="sm" variant="ghost">
                  添加
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowNewPlan(false);
                    setNewPlanName("");
                  }}
                >
                  取消
                </Button>
              </form>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowNewPlan(true)}
                className="text-muted-foreground"
              >
                <Plus className="size-4" />
                新建计划
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 添加任务 */}
      <div className="shrink-0 border-b border-border px-4 py-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateTask();
          }}
          className="mx-auto flex max-w-4xl gap-2"
        >
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="添加新任务..."
            className="flex-1 rounded-lg border border-border bg-muted/30 px-4 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/40"
          />
          <Button type="submit" disabled={!newTaskTitle.trim()}>
            <Plus className="size-4" />
            添加
          </Button>
        </form>
      </div>

      {/* 看板 */}
      <div className="flex-1 min-h-0 overflow-auto p-4">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="mx-auto flex max-w-4xl gap-4">
            {COLUMNS.map(({ status, label }) => (
              <div
                key={status}
                className="flex min-w-[220px] flex-1 flex-col rounded-xl border border-border bg-muted/20"
              >
                <div className="border-b border-border px-4 py-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {label}
                  </h3>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto p-3">
                  {tasksByStatus[status]?.map((task) => {
                    const colIndex = COLUMNS.findIndex((c) => c.status === status);
                    const prevStatus = COLUMNS[colIndex - 1]?.status;
                    const nextStatus = COLUMNS[colIndex + 1]?.status;
                    return (
                      <div
                        key={task.id}
                        className={cn(
                          "group flex items-start gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm transition-colors hover:bg-accent/50",
                          status === "done" && "opacity-60"
                        )}
                      >
                        <GripVertical className="mt-0.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100" />
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "truncate",
                              status === "done" && "line-through text-muted-foreground"
                            )}
                          >
                            {task.title}
                          </p>
                          {task.due_date && (
                            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="size-3" />
                              {task.due_date}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100">
                          {prevStatus && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateTaskStatus(task.id, prevStatus);
                              }}
                              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                              aria-label="移至上一列"
                            >
                              <ChevronLeft className="size-4" />
                            </button>
                          )}
                          {nextStatus && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateTaskStatus(task.id, nextStatus);
                              }}
                              className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                              aria-label="移至下一列"
                            >
                              <ChevronRight className="size-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteTask(e, task.id)}
                            className="rounded p-1 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
                            aria-label="删除任务"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
