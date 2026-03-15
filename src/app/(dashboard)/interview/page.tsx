"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Loader2,
  BookOpen,
  ChevronRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";

interface Question {
  id: string;
  category: string;
  question: string;
  model_answer: string | null;
}

interface ReviewItem {
  id: string;
  questionId: string;
  question: string;
  category: string;
  modelAnswer: string;
  nextReviewAt: string | null;
  reviewLevel: number;
}

export default function InterviewPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    feedback: string;
    followUp: string;
    isPass: boolean;
  } | null>(null);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [activeTab, setActiveTab] = useState<"practice" | "review">("practice");

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const url = selectedCategory
        ? `/api/questions?category=${encodeURIComponent(selectedCategory)}`
        : "/api/questions";
      const res = await fetch(url);
      if (!res.ok) throw new Error("获取失败");
      const data = await res.json();
      setQuestions(data.questions ?? []);
      setCategories(data.categories ?? []);
      if (!currentQuestion && (data.questions ?? []).length > 0) {
        setCurrentQuestion(
          data.questions[Math.floor(Math.random() * data.questions.length)]
        );
      }
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  const fetchReviewItems = useCallback(async () => {
    try {
      const res = await fetch("/api/review/questions/due");
      if (!res.ok) return;
      const data = await res.json();
      setReviewItems(data.items ?? []);
    } catch {
      setReviewItems([]);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    if (activeTab === "review") fetchReviewItems();
  }, [activeTab, fetchReviewItems]);

  const handleRandomQuestion = () => {
    if (questions.length === 0) return;
    setCurrentQuestion(questions[Math.floor(Math.random() * questions.length)]);
    setUserAnswer("");
    setResult(null);
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || !userAnswer.trim() || evaluating) return;
    setEvaluating(true);
    setResult(null);
    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion.question,
          modelAnswer: currentQuestion.model_answer,
          userAnswer: userAnswer.trim(),
          questionId: currentQuestion.id,
        }),
      });
      if (!res.ok) throw new Error("评估失败");
      const data = await res.json();
      setResult(data);
      if (activeTab === "review") fetchReviewItems();
    } catch {
      setResult({
        score: 0,
        feedback: "评估失败，请重试",
        followUp: "",
        isPass: false,
      });
    } finally {
      setEvaluating(false);
    }
  };

  const handleCompleteReview = async (reviewId: string) => {
    try {
      const res = await fetch("/api/review/questions/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId }),
      });
      if (res.ok) setReviewItems((prev) => prev.filter((r) => r.id !== reviewId));
    } catch {
      // ignore
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">面试八股学习</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        题库刷题、AI 评分、错题本间隔复习
      </p>

      <div className="mt-4 flex gap-2">
        <Button
          variant={activeTab === "practice" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("practice")}
        >
          <MessageSquare className="size-4" />
          刷题
        </Button>
        <Button
          variant={activeTab === "review" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("review")}
        >
          <BookOpen className="size-4" />
          错题复习 ({reviewItems.length})
        </Button>
      </div>

      {activeTab === "practice" && (
        <div className="mt-6 space-y-4">
          <div>
            <p className="text-sm font-medium">分类</p>
            <div className="mt-2 flex flex-wrap gap-1">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSelectedCategory(null);
                  setCurrentQuestion(null);
                }}
              >
                全部
              </Button>
              {categories.map((c) => (
                <Button
                  key={c}
                  variant={selectedCategory === c ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(c);
                    setCurrentQuestion(null);
                  }}
                >
                  {c}
                </Button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {currentQuestion ? (
                <div className="space-y-4 rounded-lg border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground">
                    {currentQuestion.category}
                  </p>
                  <h3 className="font-medium">{currentQuestion.question}</h3>
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="在此输入你的回答…"
                    rows={5}
                    className={cn(
                      "w-full rounded border border-input bg-background px-3 py-2 text-sm",
                      "focus:outline-none focus:ring-2 focus:ring-ring"
                    )}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={evaluating || !userAnswer.trim()}
                      className="gap-2"
                    >
                      {evaluating ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          评分中…
                        </>
                      ) : (
                        "提交并评分"
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleRandomQuestion}>
                      下一题
                    </Button>
                  </div>

                  {result && (
                    <div
                      className={cn(
                        "space-y-2 rounded border p-4",
                        result.isPass
                          ? "border-green-500/50 bg-green-500/5"
                          : "border-amber-500/50 bg-amber-500/5"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {result.isPass ? (
                          <CheckCircle className="size-5 text-green-600" />
                        ) : (
                          <XCircle className="size-5 text-amber-600" />
                        )}
                        <span className="font-medium">
                          得分：{result.score}/10
                          {result.isPass ? "（通过）" : "（已加入错题本）"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {result.feedback}
                      </p>
                      {currentQuestion.model_answer && (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-primary">
                            查看标准答案
                          </summary>
                          <p className="mt-2 text-muted-foreground">
                            {currentQuestion.model_answer}
                          </p>
                        </details>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  暂无题目，请先执行 seed_questions.sql 导入题库
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === "review" && (
        <div className="mt-6 space-y-3">
          {reviewItems.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              暂无待复习错题
            </div>
          ) : (
            reviewItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    {item.category}
                  </p>
                  <p className="mt-1 truncate font-medium">{item.question}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setActiveTab("practice");
                    setCurrentQuestion({
                      id: item.questionId,
                      category: item.category,
                      question: item.question,
                      model_answer: item.modelAnswer,
                    });
                    setUserAnswer("");
                    setResult(null);
                  }}
                >
                  <ChevronRight className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCompleteReview(item.id)}
                >
                  已掌握
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
