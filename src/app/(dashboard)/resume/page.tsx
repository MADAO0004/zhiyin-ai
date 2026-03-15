"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  FileText,
  Upload,
  Loader2,
  Download,
  AlertCircle,
  FileEdit,
  FilePlus2,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { ResumeBuilder } from "@/components/resume/resume-builder";
import { DEFAULT_RESUME } from "@/types/resume";

type TabKey = "edit" | "generate";

export default function ResumePage() {
  const [tab, setTab] = useState<TabKey>("edit");
  const [resumeData, setResumeData] = useState(DEFAULT_RESUME);
  const [originalText, setOriginalText] = useState("");
  const [targetRole, setTargetRole] = useState("后端开发");
  const [issues, setIssues] = useState<
    { type: string; description: string; suggestion: string }[]
  >([]);
  const [optimized, setOptimized] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [parseLoading, setParseLoading] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setParseError(null);
    setOriginalText("");
    setIssues([]);
    setOptimized("");
    setScore(null);
    setParseLoading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch("/api/resume-parse", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "解析失败");
      }
      const data = await res.json();
      const text = (data.text ?? "").trim();
      setOriginalText(text);
      if (!text) {
        setParseError("empty");
      }
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "解析失败");
    } finally {
      setParseLoading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile]
  );

  const handleAnalyze = async () => {
    if (!originalText.trim()) return;
    setLoading(true);
    setIssues([]);
    setOptimized("");
    setScore(null);
    try {
      const res = await fetch("/api/resume-optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: originalText, targetRole }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "分析失败");
      }
      const data = await res.json();
      setIssues(data.issues ?? []);
      setOptimized(data.optimized ?? "");
      setScore(data.score ?? null);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "分析失败");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!optimized) return;
    const doc = new jsPDF({ unit: "mm" });
    doc.setFont("helvetica");
    const lines = doc.splitTextToSize(optimized, 180);
    let y = 20;
    for (const line of lines) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, 15, y);
      y += 6;
    }
    doc.save("简历-优化版.pdf");
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">简历</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {tab === "edit"
              ? "上传简历，AI 分析问题并生成优化版"
              : "在线填写表单，生成专业简历并导出 PDF"}
          </p>
        </div>
        <div className="flex gap-1 rounded-lg border border-border p-1 bg-muted/30">
          <button
            type="button"
            onClick={() => setTab("edit")}
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              tab === "edit"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileEdit className="size-4" />
            简历修改
          </button>
          <button
            type="button"
            onClick={() => setTab("generate")}
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              tab === "generate"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FilePlus2 className="size-4" />
            生成简历
          </button>
        </div>
      </div>

      {tab === "generate" ? (
        <div className="mt-6">
          <ResumeBuilder data={resumeData} onChange={setResumeData} />
        </div>
      ) : (
        <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => !parseLoading && document.getElementById("resume-upload")?.click()}
        onKeyDown={(e) => e.key === "Enter" && !parseLoading && document.getElementById("resume-upload")?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "mt-6 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors cursor-pointer",
          isDragging ? "border-primary bg-primary/5" : "border-border"
        )}
      >
        {parseLoading ? (
          <>
            <Loader2 className="size-12 animate-spin text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">正在解析简历…</p>
          </>
        ) : (
          <>
            <Upload className="size-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              拖拽文件到此处，或点击选择
            </p>
            <p className="text-xs text-muted-foreground">
              支持 PDF、Word、TXT
            </p>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleSelect}
              className="mt-4 hidden"
              id="resume-upload"
            />
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => document.getElementById("resume-upload")?.click()}
              disabled={parseLoading}
            >
              选择文件
            </Button>
          </>
        )}
      </div>

      {parseError === "empty" && (
        <div className="mt-4 space-y-3 rounded-md border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm">
          <p className="text-amber-700 dark:text-amber-400">
            未能提取到文字，可能是扫描版 PDF。您可以：
          </p>
          <ul className="list-inside list-disc space-y-1 text-amber-600 dark:text-amber-500">
            <li>重新上传包含可复制文字的 PDF 或 Word/TXT</li>
            <li>或直接在下框粘贴简历文字</li>
          </ul>
          <textarea
            placeholder="在此粘贴或输入简历内容…"
            rows={6}
            className={cn(
              "w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
            onChange={(e) => {
              const v = e.target.value.trim();
              setOriginalText(v);
              if (v) setParseError(null);
            }}
          />
        </div>
      )}
      {parseError && parseError !== "empty" && (
        <div className="mt-4 flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {parseError}
        </div>
      )}

      {originalText && (
        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium">目标岗位</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="例如：后端开发、前端开发"
              className={cn(
                "mt-1 block w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-ring"
              )}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium">原文</h3>
              <pre className="mt-1 max-h-64 overflow-auto rounded border border-border bg-muted/30 p-3 text-xs whitespace-pre-wrap">
                {originalText}
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-medium">优化版</h3>
              {optimized ? (
                <pre className="mt-1 max-h-64 overflow-auto rounded border border-border bg-muted/30 p-3 text-xs whitespace-pre-wrap">
                  {optimized}
                </pre>
              ) : (
                <div className="mt-1 flex h-48 items-center justify-center rounded border border-border text-muted-foreground text-sm">
                  点击分析后显示
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleAnalyze}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  分析中…
                </>
              ) : (
                <>
                  <FileText className="size-4" />
                  AI 分析优化
                </>
              )}
            </Button>
            {optimized && (
              <Button
                variant="outline"
                onClick={handleExport}
                className="gap-2"
              >
                <Download className="size-4" />
                导出 PDF
              </Button>
            )}
          </div>

          {issues.length > 0 && (
            <div>
              <h3 className="text-sm font-medium">问题与建议</h3>
              <div className="mt-2 space-y-2">
                {issues.map((item, i) => (
                  <div
                    key={i}
                    className="rounded border border-border bg-card p-3 text-sm"
                  >
                    <span className="font-medium text-primary">
                      {item.type}
                    </span>
                    <p className="mt-1 text-muted-foreground">
                      {item.description}
                    </p>
                    <p className="mt-1 text-foreground">
                      建议：{item.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {score != null && (
            <p className="text-sm text-muted-foreground">
              岗位匹配度：<span className="font-medium text-foreground">{score}</span> 分
            </p>
          )}
        </div>
      )}
        </>
      )}
    </div>
  );
}
