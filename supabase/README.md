# Supabase 数据库配置

## 1. 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 创建新项目，获取 **Project URL** 和 **anon public** Key
3. 将二者填入 `.env.local`：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 2. 执行 Schema

1. 打开 Supabase Dashboard → **SQL Editor**
2. 复制 `supabase/schema.sql` 中的内容
3. 粘贴并执行

执行后将创建以下表：

- `conversations` - 对话
- `messages` - 消息
- `knowledge_nodes` - 知识图谱节点
- `knowledge_edges` - 知识图谱边
- `message_knowledge_links` - 消息与知识节点关联
- `conversation_knowledge_links` - 对话与知识节点关联
- `learning_plans` - 学习计划
- `tasks` - 任务
- `documents` - RAG 文档（预留）
