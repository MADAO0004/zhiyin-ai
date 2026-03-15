"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  FileText,
  MessageSquare,
  Compass,
  BarChart3,
  PanelLeft,
  LogOut,
} from "lucide-react";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";

const NAV_ITEMS = [
  { href: "/resume", label: "简历", icon: FileText },
  { href: "/interview", label: "面试", icon: MessageSquare },
  { href: "/career", label: "就业", icon: Compass },
  { href: "/dashboard", label: "仪表盘", icon: BarChart3 },
] as const;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside
        className={cn(
          "flex h-full w-64 shrink-0 flex-col border-r border-border bg-card transition-transform",
          "fixed inset-y-0 left-0 z-50 md:relative",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <Link href="/dashboard" className="font-semibold tracking-tight">
            职引AI
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <PanelLeft className="size-4" />
          </Button>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <Button
                variant={pathname === href ? "default" : "ghost"}
                className="w-full justify-start gap-2"
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="size-4" />
                {label}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="space-y-2 border-t border-border p-3">
          <div className="w-full">
            <ThemeSwitcher />
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" />
            退出登录
          </Button>
        </div>
      </aside>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}
      <main className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center border-b border-border px-4 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <PanelLeft className="size-4" />
          </Button>
        </header>
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
