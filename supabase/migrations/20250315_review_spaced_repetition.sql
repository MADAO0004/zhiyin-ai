-- 遗忘曲线 / 间隔重复：为 knowledge_nodes 添加复习调度字段
ALTER TABLE knowledge_nodes
ADD COLUMN IF NOT EXISTS next_review_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS review_level INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_reviewed_at TIMESTAMPTZ;

-- 索引：查询待复习节点
CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_next_review
ON knowledge_nodes(next_review_at)
WHERE next_review_at IS NOT NULL;

COMMENT ON COLUMN knowledge_nodes.next_review_at IS '下次复习时间（遗忘曲线）';
COMMENT ON COLUMN knowledge_nodes.review_level IS '复习等级 0=新 1=3天 2=7天 3=14天 4=30天';
COMMENT ON COLUMN knowledge_nodes.last_reviewed_at IS '上次复习时间';
