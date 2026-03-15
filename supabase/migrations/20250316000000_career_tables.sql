-- 职引AI 求职相关表

-- 简历历史
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  original_text TEXT NOT NULL,
  optimized_text TEXT,
  target_role TEXT,
  issues_json JSONB,
  match_score INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 八股题库
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  model_answer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 错题/复习计划（间隔重复）
CREATE TABLE IF NOT EXISTS question_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  next_review_at TIMESTAMPTZ,
  review_level INT DEFAULT 0,
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 职业规划
CREATE TABLE IF NOT EXISTS career_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  input_data JSONB,
  plan_json JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- conversations 增加 type 字段
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'chat';

-- 索引
CREATE INDEX IF NOT EXISTS idx_resumes_user ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_question_reviews_user ON question_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_question_reviews_next ON question_reviews(next_review_at) WHERE next_review_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_career_plans_user ON career_plans(user_id);

-- RLS
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_plans ENABLE ROW LEVEL SECURITY;

-- questions 为公开只读（题库）
CREATE POLICY "questions_read_all" ON questions FOR SELECT USING (true);

-- resumes, question_reviews, career_plans 按 user_id
CREATE POLICY "resumes_user" ON resumes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "question_reviews_user" ON question_reviews FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "career_plans_user" ON career_plans FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
