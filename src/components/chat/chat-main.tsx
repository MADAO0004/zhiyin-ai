"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ReasoningArea } from "./reasoning-area";
import { MarkdownRenderer } from "./markdown-renderer";
import type { Message } from "@/types/chat";
import type { DbMessage } from "@/types/database";
import { cn } from "@/lib/utils";
import { Send, Square } from "lucide-react";

function dbMessageToMessage(db: DbMessage): Message {
  return {
    id: db.id,
    role: db.role,
    content: db.content,
    reasoning: db.reasoning ?? "",
    isThinking: false,
  };
}

const REASONING_PREFIX = "REASONING:";
const CONTENT_PREFIX = "CONTENT:";
const ERROR_PREFIX = "ERROR:";

function parseStreamChunk(
  buffer: string,
  onReasoning: (text: string) => void,
  onContent: (text: string) => void,
  onError: (msg: string) => void
): string {
  let i = 0;
  let mode: "idle" | "reasoning" | "content" = "idle";
  const MAX_PREFIX = 10;

  while (i < buffer.length) {
    const nextR = buffer.indexOf(REASONING_PREFIX, i);
    const nextC = buffer.indexOf(CONTENT_PREFIX, i);
    const nextE = buffer.indexOf(ERROR_PREFIX, i);
    const candidates: [number, string][] = [];
    if (nextR >= 0) candidates.push([nextR, "R"]);
    if (nextC >= 0) candidates.push([nextC, "C"]);
    if (nextE >= 0) candidates.push([nextE, "E"]);
    const first = candidates.sort((a, b) => a[0] - b[0])[0];

    if (!first) {
      const remainder = buffer.slice(i);
      if (mode === "reasoning") {
        onReasoning(remainder);
        return "";
      }
      if (mode === "content") {
        onContent(remainder);
        return "";
      }
      if (remainder.length < MAX_PREFIX) return remainder;
      return remainder.slice(-MAX_PREFIX);
    }

    const [pos, type] = first;
    const chunk = buffer.slice(i, pos);
    if (chunk && mode === "reasoning") onReasoning(chunk);
    if (chunk && mode === "content") onContent(chunk);

    if (type === "R") {
      mode = "reasoning";
      i = pos + REASONING_PREFIX.length;
    } else if (type === "C") {
      mode = "content";
      i = pos + CONTENT_PREFIX.length;
    } else {
      onError(buffer.slice(pos + ERROR_PREFIX.length));
      return "";
    }
  }

  return "";
}

interface ChatMainProps {
  conversationId?: string | null;
  newChatTrigger?: number;
  initialInput?: string | null;
  onInitialInputConsumed?: () => void;
  onConversationUpdate?: () => void;
  onKnowledgeExtract?: () => void;
}

export function ChatMain({
  conversationId,
  newChatTrigger,
  initialInput,
  onInitialInputConsumed,
  onConversationUpdate,
  onKnowledgeExtract,
}: ChatMainProps = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(initialInput ?? "");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const userScrolledRef = useRef(false);
  const lastScrollHeightRef = useRef(0);

  const scrollToBottom = useCallback((force = false) => {
    if (!force && userScrolledRef.current) return;
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
      userScrolledRef.current = false;
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const nearBottom = scrollHeight - scrollTop - clientHeight < 80;
      if (!nearBottom && scrollHeight > lastScrollHeightRef.current) {
        userScrolledRef.current = true;
      }
      if (nearBottom) userScrolledRef.current = false;
      lastScrollHeightRef.current = scrollHeight;
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) return;
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // 当 conversationId 变化时加载消息
  useEffect(() => {
    if (conversationId) {
      setCurrentConversationId(conversationId);
      setMessages([]);
      let cancelled = false;
      fetch(`/api/messages?conversationId=${encodeURIComponent(conversationId)}`)
        .then((res) => res.ok ? res.json() : [])
        .then((data: DbMessage[]) => {
          if (!cancelled && Array.isArray(data)) {
            setMessages(data.map(dbMessageToMessage));
          }
        })
        .catch(() => {
          if (!cancelled) setMessages([]);
        });
      return () => { cancelled = true; };
    } else {
      setCurrentConversationId(null);
    }
  }, [conversationId]);

  useEffect(() => {
    if ((newChatTrigger ?? 0) > 0) {
      setMessages([]);
      setInput(initialInput ?? "");
      setCurrentConversationId(null);
    }
  }, [newChatTrigger, initialInput]);

  useEffect(() => {
    if (initialInput) {
      setInput(initialInput);
    }
  }, [initialInput]);

  const stopStreaming = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    let convId = currentConversationId;
    const isNewConversation = !convId;

    if (isNewConversation) {
      try {
        const title = text.length > 30 ? text.slice(0, 30) + "…" : text;
        const createRes = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });
        if (!createRes.ok) throw new Error("创建对话失败");
        const conv = await createRes.json();
        convId = conv.id;
        setCurrentConversationId(convId);
        onConversationUpdate?.();
      } catch (e) {
        setMessages((prev) => [...prev, {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `[错误] 无法创建对话：${(e as Error).message}`,
          reasoning: "",
          isThinking: false,
        }]);
        return;
      }
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      reasoning: "",
      isThinking: false,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    onInitialInputConsumed?.();
    setIsStreaming(true);

    const assistantMsg: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
      reasoning: "",
      isThinking: true,
    };
    setMessages((prev) => [...prev, assistantMsg]);

    const controller = new AbortController();
    abortRef.current = controller;

    const apiMessages = [
      ...messages,
      userMsg,
    ].map((m) => ({ role: m.role, content: m.content }));

    let buffer = "";
    let fullReasoning = "";
    let fullContent = "";
    const decoder = new TextDecoder();
    const onReasoning = (t: string) => {
      fullReasoning += t;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id ? { ...m, reasoning: fullReasoning } : m
        )
      );
    };
    const onContent = (t: string) => {
      fullContent += t;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: fullContent, isThinking: false }
            : m
        )
      );
    };
    const onError = (msg: string) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? { ...m, content: `[错误] ${msg}`, isThinking: false }
            : m
        )
      );
    };

    // 持久化用户消息
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: convId,
          role: "user",
          content: text,
        }),
      });
    } catch {
      // 忽略保存失败，不阻塞对话
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
        signal: controller.signal,
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error("无响应体");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer = parseStreamChunk(
          buffer + decoder.decode(value, { stream: true }),
          onReasoning,
          onContent,
          onError
        );
      }

      // 流式结束后持久化助手消息，并提取知识关键词
      try {
        const msgRes = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversation_id: convId,
            role: "assistant",
            content: fullContent,
            reasoning: fullReasoning,
          }),
        });
        onConversationUpdate?.();
        if (msgRes.ok && fullContent) {
          const savedMsg = await msgRes.json();
          fetch("/api/knowledge-extract", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message_id: savedMsg.id,
              conversation_id: convId,
              content: text + "\n\n" + fullContent,
            }),
          })
            .then(() => onKnowledgeExtract?.())
            .catch(() => {});
        }
      } catch {
        // 忽略
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsg.id
            ? {
                ...m,
                content: `[请求失败] ${(e as Error).message}`,
                isThinking: false,
              }
            : m
        )
      );
    } finally {
      abortRef.current = null;
      setIsStreaming(false);
    }
  }, [input, isStreaming, messages, currentConversationId, onConversationUpdate, onKnowledgeExtract]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  const isEmpty = messages.length === 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6"
      >
        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-12 sm:py-16">
            <div className="text-center">
              <h1 className="bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-3xl font-semibold tracking-tight sm:text-4xl">
                CodeSatori
              </h1>
              <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                码悟 · 与 AI 一同思考，见证顿悟时刻
              </p>
            </div>
            <div className="w-full max-w-2xl rounded-xl border border-dashed border-border/60 bg-muted/20 px-6 py-5 text-center text-sm text-muted-foreground">
              在下方输入问题开始对话
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex flex-col gap-3",
                  m.role === "user"
                    ? "items-end"
                    : "items-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-4 py-3",
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-foreground"
                  )}
                >
                  {m.role === "user" ? (
                    <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                  ) : (
                    <>
                      {m.reasoning && (
                        <ReasoningArea
                          content={m.reasoning}
                          isThinking={m.isThinking}
                          className="mb-3"
                        />
                      )}
                      {m.content ? (
                        <MarkdownRenderer
                          content={m.content}
                          className="[&_p]:my-2 [&_pre]:my-2 [&_code]:bg-muted/50 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded text-sm"
                        />
                      ) : m.isThinking && !m.reasoning ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="size-1.5 animate-pulse rounded-full bg-primary/60" />
                          思考中...
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border p-4">
        <div className="mx-auto flex max-w-3xl items-end gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm ring-1 ring-border/50 transition-shadow focus-within:ring-2 focus-within:ring-ring/40">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的问题... (Shift+Enter 换行)"
            rows={1}
            className="max-h-32 min-h-[2.25rem] flex-1 resize-none bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
            disabled={isStreaming}
          />
          {isStreaming ? (
            <button
              type="button"
              onClick={stopStreaming}
              className="shrink-0 rounded-lg bg-destructive/90 px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive"
            >
              <Square className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={sendMessage}
              disabled={!input.trim()}
              className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            >
              <Send className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
