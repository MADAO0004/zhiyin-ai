"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ResumePreview } from "./resume-preview";
import type { ResumeData } from "@/types/resume";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Download } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface ResumeBuilderProps {
  data: ResumeData;
  onChange: (data: ResumeData) => void;
}

export function ResumeBuilder({ data, onChange }: ResumeBuilderProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const update = (patch: Partial<ResumeData>) => {
    onChange({ ...data, ...patch });
  };

  const addEducation = () => {
    update({
      education: [...data.education, { school: "", major: "", degree: "", time: "" }],
    });
  };
  const removeEducation = (i: number) => {
    if (data.education.length <= 1) return;
    update({ education: data.education.filter((_, j) => j !== i) });
  };

  const addExperience = () => {
    update({
      experience: [...data.experience, { company: "", role: "", time: "", desc: "" }],
    });
  };
  const removeExperience = (i: number) => {
    if (data.experience.length <= 1) return;
    update({ experience: data.experience.filter((_, j) => j !== i) });
  };

  const updateSkillsFromText = (text: string) => {
    update({ skills: text.split(/[,，、\n]/).map((s) => s.trim()).filter(Boolean) });
  };

  const handleExport = async () => {
    // 使用 exportMode 的预览（纯内联样式），避免 html2canvas 解析 Tailwind 的 lab() 报错
    const el = exportRef.current ?? previewRef.current;
    if (!el) return;
    const hasContent =
      data.name ||
      data.email ||
      data.phone ||
      data.targetRole ||
      data.education.some((e) => e.school || e.major) ||
      data.experience.some((e) => e.company || e.role) ||
      data.skills.length > 0 ||
      data.intro;
    if (!hasContent) return;
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        onclone: (_, clonedEl) => {
          // 移除克隆文档中的样式表，避免 lab() 等不支持的颜色函数
          clonedEl.ownerDocument.querySelectorAll("style, link[rel=stylesheet]").forEach((s) => s.remove());
        },
      });
      const imgData = canvas.toDataURL("image/png", 1);
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, w, h);
      if (h > pdf.internal.pageSize.getHeight()) {
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, -(pdf.internal.pageSize.getHeight()), w, h);
      }
      pdf.save("我的简历.pdf");
    } catch (err) {
      console.error(err);
    }
  };

  const inputCls = cn(
    "mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
    "focus:outline-none focus:ring-2 focus:ring-ring"
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">姓名</label>
          <input
            value={data.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder="张三"
            className={inputCls}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">邮箱</label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => update({ email: e.target.value })}
              placeholder="your@email.com"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">电话</label>
            <input
              value={data.phone}
              onChange={(e) => update({ phone: e.target.value })}
              placeholder="138xxxxxxxx"
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">求职意向</label>
          <input
            value={data.targetRole}
            onChange={(e) => update({ targetRole: e.target.value })}
            placeholder="后端开发、前端开发"
            className={inputCls}
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium">教育背景</label>
            <Button type="button" variant="ghost" size="sm" onClick={addEducation}>
              <Plus className="size-4" />
            </Button>
          </div>
          {data.education.map((e, i) => (
            <div key={i} className="mt-2 space-y-2 rounded border border-border p-3">
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEducation(i)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <input
                value={e.school}
                onChange={(ev) => {
                  const next = [...data.education];
                  next[i] = { ...next[i], school: ev.target.value };
                  update({ education: next });
                }}
                placeholder="学校"
                className={inputCls}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={e.major}
                  onChange={(ev) => {
                    const next = [...data.education];
                    next[i] = { ...next[i], major: ev.target.value };
                    update({ education: next });
                  }}
                  placeholder="专业"
                  className={inputCls}
                />
                <input
                  value={e.degree}
                  onChange={(ev) => {
                    const next = [...data.education];
                    next[i] = { ...next[i], degree: ev.target.value };
                    update({ education: next });
                  }}
                  placeholder="学历"
                  className={inputCls}
                />
              </div>
              <input
                value={e.time}
                onChange={(ev) => {
                  const next = [...data.education];
                  next[i] = { ...next[i], time: ev.target.value };
                  update({ education: next });
                }}
                placeholder="时间 如 2020.09-2024.06"
                className={inputCls}
              />
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium">项目/实习经历</label>
            <Button type="button" variant="ghost" size="sm" onClick={addExperience}>
              <Plus className="size-4" />
            </Button>
          </div>
          {data.experience.map((ex, i) => (
            <div key={i} className="mt-2 space-y-2 rounded border border-border p-3">
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExperience(i)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <input
                value={ex.company}
                onChange={(ev) => {
                  const next = [...data.experience];
                  next[i] = { ...next[i], company: ev.target.value };
                  update({ experience: next });
                }}
                placeholder="公司/项目名称"
                className={inputCls}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  value={ex.role}
                  onChange={(ev) => {
                    const next = [...data.experience];
                    next[i] = { ...next[i], role: ev.target.value };
                    update({ experience: next });
                  }}
                  placeholder="角色"
                  className={inputCls}
                />
                <input
                  value={ex.time}
                  onChange={(ev) => {
                    const next = [...data.experience];
                    next[i] = { ...next[i], time: ev.target.value };
                    update({ experience: next });
                  }}
                  placeholder="时间"
                  className={inputCls}
                />
              </div>
              <textarea
                value={ex.desc}
                onChange={(ev) => {
                  const next = [...data.experience];
                  next[i] = { ...next[i], desc: ev.target.value };
                  update({ experience: next });
                }}
                placeholder="工作内容、成果（可量化）"
                rows={3}
                className={inputCls}
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium">技能特长</label>
          <textarea
            value={data.skills.join("、")}
            onChange={(e) => updateSkillsFromText(e.target.value)}
            placeholder="用顿号、逗号或换行分隔，如：Java、React、MySQL"
            rows={2}
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">自我评价</label>
          <textarea
            value={data.intro}
            onChange={(e) => update({ intro: e.target.value })}
            placeholder="简要介绍自己的优势、职业规划"
            rows={4}
            className={inputCls}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">简历预览</h3>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-1">
            <Download className="size-4" />
            导出 PDF
          </Button>
        </div>
        <div ref={previewRef} className="resume-export-source">
          <ResumePreview data={data} />
        </div>
        {/* 仅用于导出的副本（纯内联样式），避免 html2canvas 解析 lab() 报错 */}
        <div
          ref={exportRef}
          style={{
            position: "fixed",
            left: -9999,
            top: 0,
            width: "210mm",
            backgroundColor: "#ffffff",
          }}
          aria-hidden
        >
          <ResumePreview data={data} exportMode />
        </div>
      </div>
    </div>
  );
}
