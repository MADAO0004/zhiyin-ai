# 职引AI - Vercel 部署指南

## 前置准备

已确认：`pnpm build` 构建成功 ✅

---

## 第一步：初始化 Git 仓库（如未初始化）

在项目根目录打开终端：

```bash
git init
git add .
git commit -m "Initial commit for deployment"
```

> 若已是 Git 项目，确保 `.env.local` 未被提交（已在 .gitignore 中）

---

## 第二步：推送代码到 GitHub

1. 在 [GitHub](https://github.com/new) 创建新仓库（如 `zhiyin-ai`）
2. 不要勾选「添加 README」
3. 复制仓库地址，执行：

```bash
git remote add origin https://github.com/你的用户名/zhiyin-ai.git
git branch -M main
git push -u origin main
```

---

## 第三步：在 Vercel 创建项目

1. 打开 [vercel.com](https://vercel.com) 并登录（可用 GitHub 登录）
2. 点击 **Add New** → **Project**
3. 在 **Import Git Repository** 中，选择刚推送的仓库
4. 点击 **Import**

---

## 第四步：配置环境变量

在 Vercel 的 **Configure Project** 页面：

1. 找到 **Environment Variables**
2. 添加以下变量（注意区分 Production / Preview / Development）：

| 变量名 | 值来源 | 备注 |
|-------|--------|------|
| `DEEPSEEK_API_KEY` | 你的 `.env.local` | 必填，服务端用 |
| `NEXT_PUBLIC_SUPABASE_URL` | 你的 `.env.local` | 必填 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 你的 `.env.local` | 必填 |

3. 每个变量可勾选 **Production**、**Preview**（预览部署）、**Development**（本地开发）
4. 点击 **Add** 添加，然后 **Deploy**

---

## 第五步：等待部署完成

- 首次部署约 2–5 分钟
- 成功后会有类似 `https://zhiyin-ai-xxx.vercel.app` 的访问地址
- 点击 **Visit** 即可打开线上版本

---

## 第六步：配置 Supabase 生产环境（重要）

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard) → 选择项目
2. 进入 **Authentication** → **URL Configuration**
3. 在 **Site URL** 填入：`https://你的vercel域名.vercel.app`
4. 在 **Redirect URLs** 添加：`https://你的vercel域名.vercel.app/**`
5. 保存

否则登录、注册的重定向可能失败。

---

## 常见问题

### 部署失败

- 查看 Vercel 的 **Deployments** 日志，确认错误信息
- 检查环境变量是否都已正确配置

### 登录/注册后跳转异常

- 确认 Supabase 的 Site URL 和 Redirect URLs 已按第六步配置

### API 报 500

- 在 Vercel **Project → Settings → Environment Variables** 检查 `DEEPSEEK_API_KEY` 是否填写正确

---

## 一键部署（Vercel CLI 可选）

若已安装 Vercel CLI：

```bash
pnpm add -g vercel
vercel login
vercel
```

按提示选择或创建项目，并按要求配置环境变量。
