"use client";

import { cn } from "@/lib/utils";

interface ReasoningAreaProps {
  content?: string;
  isThinking?: boolean;
  className?: string;
}

export function ReasoningArea({
  content,
  isThinking = false,
  className,
}: ReasoningAreaProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground shadow-sm",
        "transition-opacity duration-300",
        className
      )}
      data-reasoning-area
    >
      <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary/80">
        <span
          className={cn(
            "size-1.5 rounded-full bg-primary/60",
            isThinking && "animate-pulse"
          )}
        />
        {isThinking ? "思考中..." : "思考过程"}
      </div>
      <div className="min-h-[2.5rem] whitespace-pre-wrap transition-opacity duration-200">
        {content || (
          <span className="text-muted-foreground/60">
            此处将展示 AI 的推理链路
          </span>
        )}
      </div>
    </div>
  );
}
