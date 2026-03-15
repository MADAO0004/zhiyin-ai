"use client";

import type { ResumeData } from "@/types/resume";
import { cn } from "@/lib/utils";

// 仅用于导出的内联样式，避免 html2canvas 解析 Tailwind 的 lab() 颜色报错
const exportStyles = {
  root: {
    minHeight: "400px",
    padding: 24,
    fontSize: 13,
    lineHeight: 1.6,
    color: "#1f2937",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  } as React.CSSProperties,
  header: { borderBottom: "1px solid #d1d5db", paddingBottom: 12 },
  title: { fontSize: 20, fontWeight: 700, color: "#111827" },
  meta: { marginTop: 4, display: "flex" as const, flexWrap: "wrap" as const, gap: "0 16px", fontSize: 14, color: "#4b5563" },
  primary: { color: "#0d9488" },
  section: { marginTop: 16 },
  sectionTitle: { borderBottom: "1px solid #e5e7eb", paddingBottom: 4, fontSize: 14, fontWeight: 600, color: "#111827" },
  list: { marginTop: 8, listStyle: "none" as const, padding: 0, margin: 0 },
  item: { marginBottom: 8 },
  itemHeader: { display: "flex", justifyContent: "space-between" },
  itemTitle: { fontWeight: 500 },
  itemTime: { color: "#6b7280" },
  itemSub: { color: "#4b5563", fontSize: 14 },
  itemDesc: { marginTop: 4, color: "#374151", whiteSpace: "pre-wrap" as const },
};

interface ResumePreviewProps {
  data: ResumeData;
  className?: string;
  /** 导出模式：仅用内联样式，避免 html2canvas 解析 lab() 报错 */
  exportMode?: boolean;
}

export function ResumePreview({ data, className, exportMode }: ResumePreviewProps) {
  const hasContent =
    data.name ||
    data.email ||
    data.phone ||
    data.targetRole ||
    data.education.some((e) => e.school || e.major) ||
    data.experience.some((e) => e.company || e.role) ||
    data.skills.length > 0 ||
    data.intro;

  if (!hasContent) {
    if (exportMode) {
      return (
        <div style={{ ...exportStyles.root, display: "flex", alignItems: "center", justifyContent: "center" }}>
          填写左侧信息后实时预览
        </div>
      );
    }
    return (
      <div
        className={cn(
          "flex min-h-[400px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 text-sm text-muted-foreground",
          className
        )}
      >
        填写左侧信息后实时预览
      </div>
    );
  }

  if (exportMode) {
    return (
      <div style={exportStyles.root} className={className}>
        <div style={exportStyles.header}>
          <h1 style={exportStyles.title}>{data.name || "姓名"}</h1>
          <div style={exportStyles.meta}>
            {data.email && <span>{data.email}</span>}
            {data.phone && <span>{data.phone}</span>}
            {data.targetRole && (
              <span style={exportStyles.primary}>求职意向：{data.targetRole}</span>
            )}
          </div>
        </div>
        {data.education.some((e) => e.school || e.major) && (
          <section style={exportStyles.section}>
            <h2 style={exportStyles.sectionTitle}>教育背景</h2>
            <ul style={exportStyles.list}>
              {data.education.map(
                (e, i) =>
                  (e.school || e.major) && (
                    <li key={i} style={exportStyles.item}>
                      <div style={exportStyles.itemHeader}>
                        <span style={exportStyles.itemTitle}>{e.school || "学校"}</span>
                        <span style={exportStyles.itemTime}>{e.time}</span>
                      </div>
                      <div style={exportStyles.itemSub}>
                        {e.degree} · {e.major}
                      </div>
                    </li>
                  )
              )}
            </ul>
          </section>
        )}
        {data.experience.some((e) => e.company || e.role) && (
          <section style={exportStyles.section}>
            <h2 style={exportStyles.sectionTitle}>项目/实习经历</h2>
            <ul style={exportStyles.list}>
              {data.experience.map(
                (e, i) =>
                  (e.company || e.role) && (
                    <li key={i} style={exportStyles.item}>
                      <div style={exportStyles.itemHeader}>
                        <span style={exportStyles.itemTitle}>{e.company || "公司"}</span>
                        <span style={exportStyles.itemTime}>{e.time}</span>
                      </div>
                      <div style={exportStyles.itemSub}>{e.role}</div>
                      {e.desc && (
                        <div style={exportStyles.itemDesc}>{e.desc}</div>
                      )}
                    </li>
                  )
              )}
            </ul>
          </section>
        )}
        {data.skills.length > 0 && (
          <section style={exportStyles.section}>
            <h2 style={exportStyles.sectionTitle}>技能特长</h2>
            <p style={{ marginTop: 8, color: "#374151" }}>{data.skills.join("、")}</p>
          </section>
        )}
        {data.intro && (
          <section style={exportStyles.section}>
            <h2 style={exportStyles.sectionTitle}>自我评价</h2>
            <p style={{ marginTop: 8, color: "#374151", whiteSpace: "pre-wrap" }}>{data.intro}</p>
          </section>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-[400px] rounded-lg border border-border bg-white p-6 text-gray-800 shadow-sm",
        "text-[13px] leading-relaxed",
        className
      )}
    >
      <div className="border-b border-gray-300 pb-3">
        <h1 className="text-xl font-bold text-gray-900">{data.name || "姓名"}</h1>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0 text-sm text-gray-600">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>{data.phone}</span>}
          {data.targetRole && (
            <span className="text-primary">求职意向：{data.targetRole}</span>
          )}
        </div>
      </div>

      {data.education.some((e) => e.school || e.major) && (
        <section className="mt-4">
          <h2 className="border-b border-gray-200 pb-1 text-sm font-semibold text-gray-900">
            教育背景
          </h2>
          <ul className="mt-2 space-y-2">
            {data.education.map(
              (e, i) =>
                (e.school || e.major) && (
                  <li key={i}>
                    <div className="flex justify-between">
                      <span className="font-medium">{e.school || "学校"}</span>
                      <span className="text-gray-500">{e.time}</span>
                    </div>
                    <div className="text-gray-600">
                      {e.degree} · {e.major}
                    </div>
                  </li>
                )
            )}
          </ul>
        </section>
      )}

      {data.experience.some((e) => e.company || e.role) && (
        <section className="mt-4">
          <h2 className="border-b border-gray-200 pb-1 text-sm font-semibold text-gray-900">
            项目/实习经历
          </h2>
          <ul className="mt-2 space-y-3">
            {data.experience.map(
              (e, i) =>
                (e.company || e.role) && (
                  <li key={i}>
                    <div className="flex justify-between">
                      <span className="font-medium">{e.company || "公司"}</span>
                      <span className="text-gray-500">{e.time}</span>
                    </div>
                    <div className="text-gray-600">{e.role}</div>
                    {e.desc && (
                      <div className="mt-1 whitespace-pre-wrap text-gray-700">
                        {e.desc}
                      </div>
                    )}
                  </li>
                )
            )}
          </ul>
        </section>
      )}

      {data.skills.length > 0 && (
        <section className="mt-4">
          <h2 className="border-b border-gray-200 pb-1 text-sm font-semibold text-gray-900">
            技能特长
          </h2>
          <p className="mt-2 text-gray-700">
            {data.skills.join("、")}
          </p>
        </section>
      )}

      {data.intro && (
        <section className="mt-4">
          <h2 className="border-b border-gray-200 pb-1 text-sm font-semibold text-gray-900">
            自我评价
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-gray-700">{data.intro}</p>
        </section>
      )}
    </div>
  );
}
