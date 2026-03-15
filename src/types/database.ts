export interface Conversation {
  id: string;
  user_id: string | null;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface DbMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  reasoning: string;
  created_at: string;
}

export interface KnowledgeNode {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  created_at: string;
}

export interface KnowledgeEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  relation_type: string;
  weight: number;
  created_at: string;
}

export interface Task {
  id: string;
  learning_plan_id: string | null;
  user_id: string | null;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  position: number;
  due_date: string | null;
  knowledge_node_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface LearningPlan {
  id: string;
  user_id: string | null;
  name: string;
  total_days: number | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  user_id: string | null;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  embedding: number[] | null;
  created_at: string;
}

export interface Resume {
  id: string;
  user_id: string;
  original_text: string;
  optimized_text: string | null;
  target_role: string | null;
  issues_json: Record<string, unknown>[] | null;
  match_score: number | null;
  created_at: string;
}

export interface Question {
  id: string;
  category: string;
  question: string;
  model_answer: string | null;
  created_at: string;
}

export interface QuestionReview {
  id: string;
  user_id: string;
  question_id: string;
  next_review_at: string | null;
  review_level: number;
  last_reviewed_at: string | null;
  created_at: string;
}

export interface CareerPlan {
  id: string;
  user_id: string;
  input_data: Record<string, unknown> | null;
  plan_json: Record<string, unknown> | null;
  created_at: string;
}
