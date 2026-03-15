import Link from "next/link";
import { FileText, MessageSquare, Compass, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-background">
      <header className="border-b border-border px-4 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">职引AI</h1>
          <div className="flex gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                登录
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">注册</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            AI 赋能大学生求职一站式平台
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            简历修改、面试八股学习、就业方向规划 —— 用 DeepSeek 国产大模型，助你拿到理想 Offer
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/resume">
            <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-6 transition-colors hover:bg-accent/50">
              <FileText className="size-12 text-primary" />
              <h3 className="font-semibold">简历修改</h3>
              <p className="text-center text-sm text-muted-foreground">
                AI 分析问题，优化关键词，提升通过率
              </p>
              <Button variant="outline" size="sm">
                进入
              </Button>
            </div>
          </Link>
          <Link href="/interview">
            <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-6 transition-colors hover:bg-accent/50">
              <MessageSquare className="size-12 text-primary" />
              <h3 className="font-semibold">八股学习</h3>
              <p className="text-center text-sm text-muted-foreground">
                题库刷题、模拟面试、错题本复习
              </p>
              <Button variant="outline" size="sm">
                进入
              </Button>
            </div>
          </Link>
          <Link href="/career">
            <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-6 transition-colors hover:bg-accent/50">
              <Compass className="size-12 text-primary" />
              <h3 className="font-semibold">就业规划</h3>
              <p className="text-center text-sm text-muted-foreground">
                职业路径、学习路线、岗位匹配
              </p>
              <Button variant="outline" size="sm">
                进入
              </Button>
            </div>
          </Link>
          <Link href="/dashboard">
            <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card p-6 transition-colors hover:bg-accent/50">
              <BarChart3 className="size-12 text-primary" />
              <h3 className="font-semibold">仪表盘</h3>
              <p className="text-center text-sm text-muted-foreground">
                求职进度、数据统计、整体概览
              </p>
              <Button variant="outline" size="sm">
                进入
              </Button>
            </div>
          </Link>
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          使用国产大模型 DeepSeek，数据安全自主可控
        </p>
      </main>

      <div className="fixed bottom-4 left-4 z-30">
        <ThemeSwitcher />
      </div>
    </div>
  );
}
