# 职引AI

AI 赋能大学生求职一站式平台 —— 简历修改、面试八股学习、就业方向规划。

## 功能

- **简历修改**：上传 PDF/Word/TXT，AI 分析问题、生成优化版、导出 PDF
- **面试八股**：题库刷题、AI 评分、错题本、间隔重复复习
- **就业规划**：输入背景，AI 生成职业路径与学习资源

## 技术栈

- Next.js 16 + TypeScript + Tailwind CSS
- Supabase (Auth + PostgreSQL)
- DeepSeek API（国产大模型）
- React Flow（职业路径图）

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`，填写：

- `DEEPSEEK_API_KEY`：DeepSeek API Key（[platform.deepseek.com](https://platform.deepseek.com)）
- `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`：Supabase 项目配置

### 3. 初始化数据库

在 Supabase Dashboard → SQL Editor 中依次执行：

- `supabase/schema.sql`（若未执行过）
- `supabase/migrations/20250315_review_spaced_repetition.sql`（若存在）
- `supabase/migrations/20250316000000_career_tables.sql`
- `supabase/seed_questions.sql`（或运行 `pnpm seed:questions` 导入题库）

### 4. 启动

```bash
pnpm dev
```

访问 http://localhost:3000 ，注册/登录后使用。

## 项目结构

```
src/
├── app/
│   ├── (dashboard)/     # 需登录的仪表盘
│   │   ├── resume/      简历修改
│   │   ├── interview/   八股学习
│   │   ├── career/      就业规划
│   │   └── dashboard/   仪表盘
│   ├── login、signup    登录注册
│   └── api/             API 路由
├── components/
└── lib/
```

## 大赛说明

本项目使用指定国产 AI 工具 **DeepSeek**，聚焦大学生求职痛点。
