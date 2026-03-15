"use client";

import { useCallback, useState } from "react";
import { ChatMain } from "@/components/chat/chat-main";
import { TaskBoard } from "@/components/tasks/task-board";
import { KnowledgeGraph } from "@/components/knowledge/knowledge-graph";
import { ReviewList } from "@/components/review/review-list";
import { LearningReport } from "@/components/review/learning-report";
import { Sidebar } from "@/components/layout/sidebar";
import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<"chat" | "tasks" | "graph" | "review" | "report">("chat");
  const [reviewPrefill, setReviewPrefill] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversationsRefreshKey, setConversationsRefreshKey] = useState(0);
  const [knowledgeGraphRefreshKey, setKnowledgeGraphRefreshKey] = useState(0);

  const handleHistoryClick = useCallback((conversationId: string) => {
    setActiveView("chat");
    setActiveConversationId(conversationId);
    setSidebarOpen(false);
  }, []);

  const [newChatTrigger, setNewChatTrigger] = useState(0);
  const handleNewChat = useCallback(() => {
    setActiveView("chat");
    setActiveConversationId(null);
    setNewChatTrigger((t) => t + 1);
    setSidebarOpen(false);
  }, []);

  const handleTasksClick = useCallback(() => {
    setActiveView("tasks");
    setSidebarOpen(false);
  }, []);

  const handleGraphClick = useCallback(() => {
    setActiveView("graph");
    setSidebarOpen(false);
  }, []);

  const handleReviewClick = useCallback(() => {
    setActiveView("review");
    setSidebarOpen(false);
  }, []);

  const handleReportClick = useCallback(() => {
    setActiveView("report");
    setSidebarOpen(false);
  }, []);

  const handleStartReview = useCallback((conceptName: string) => {
    const msg = `请帮我复习【${conceptName}】，用提问的方式检验我是否掌握，每次只问一个问题`;
    setReviewPrefill(msg);
    setActiveView("chat");
    setActiveConversationId(null);
    setNewChatTrigger((t) => t + 1);
    setSidebarOpen(false);
  }, []);

  const handleConversationUpdate = useCallback(() => {
    setConversationsRefreshKey((k) => k + 1);
  }, []);

  const handleConversationDelete = useCallback((deletedId: string) => {
    setConversationsRefreshKey((k) => k + 1);
    if (activeConversationId === deletedId) {
      setActiveConversationId(null);
      setNewChatTrigger((t) => t + 1);
    }
  }, [activeConversationId]);

  const handleKnowledgeExtract = useCallback(() => {
    setKnowledgeGraphRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onHistoryClick={handleHistoryClick}
        onNewChat={handleNewChat}
        onConversationDelete={handleConversationDelete}
        onTasksClick={handleTasksClick}
        onGraphClick={handleGraphClick}
        onReviewClick={handleReviewClick}
        onReportClick={handleReportClick}
        activeView={activeView}
        refreshKey={conversationsRefreshKey}
      />
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
        {activeView === "chat" && (
          <ChatMain
            conversationId={activeConversationId}
            newChatTrigger={newChatTrigger}
            initialInput={reviewPrefill}
            onInitialInputConsumed={() => setReviewPrefill(null)}
            onConversationUpdate={handleConversationUpdate}
            onKnowledgeExtract={handleKnowledgeExtract}
          />
        )}
        {activeView === "tasks" && <TaskBoard />}
        {activeView === "review" && (
          <div className="flex flex-1 flex-col p-4">
            <h2 className="mb-4 text-sm font-medium text-muted-foreground">复习计划</h2>
            <ReviewList
              onStartReview={handleStartReview}
              onRefresh={() => setKnowledgeGraphRefreshKey((k) => k + 1)}
            />
          </div>
        )}
        {activeView === "report" && (
          <div className="flex flex-1 flex-col overflow-auto p-4">
            <h2 className="mb-4 text-sm font-medium text-muted-foreground">学习周报</h2>
            <LearningReport days={7} />
          </div>
        )}
        {activeView === "graph" && (
          <div className="flex flex-1 flex-col p-4">
            <h2 className="mb-3 text-sm font-medium text-muted-foreground">知识图谱</h2>
            <KnowledgeGraph
              conversationId={activeConversationId}
              refreshKey={knowledgeGraphRefreshKey}
            />
          </div>
        )}
      </main>
    </div>
  );
}
