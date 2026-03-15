"use client";

import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code?: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ code, language = "text", className }: CodeBlockProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-card shadow-sm",
        className
      )}
      data-code-block
    >
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground">
          {language}
        </span>
      </div>
      <pre className="overflow-x-auto p-4">
        <code className="font-mono text-sm text-foreground">
          {code || "// 代码将在此展示"}
        </code>
      </pre>
    </div>
  );
}
