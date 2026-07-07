# 个人博客系统

一个功能完整的全栈个人博客系统，前端采用 React + HeroUI，后端采用 Fastify + Prisma，支持一键部署到 Vercel。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript + Vite 5 |
| UI 组件库 | HeroUI + Tailwind CSS + Framer Motion |
| 富文本编辑器 | AiEditor（内置 AI 续写/润色/扩写/精简/翻译/总结） |
| 前端搜索 | FlexSearch（客户端全文检索） |
| 后端框架 | Fastify 4 + TypeScript |
| 数据库 ORM | Prisma（支持 SQLite / MySQL / PostgreSQL） |
| 认证 | @fastify/jwt + bcrypt |
| AI 集成 | LangChain + DeepSeek（编辑器内 AI 续写/润色/扩写/精简/翻译/总结、标题/摘要生成、博客分身对话） |
| IP 归属地 | ip2region.js（离线解析） |
| 数据分析 | Microsoft Clarity |
| 部署平台 | Vercel（Serverless Functions） |

## 功能特性

### 前台博客

- **首页** — Bento Grid 布局展示最新文章、分类、标签云
- **文章列表** — 支持分页浏览，按分类/标签筛选
- **文章详情** — 富文本渲染、标签展示、阅读量统计、SEO 元数据、选中文本"问博客分身"浮出菜单
- **全局搜索** — FlexSearch 客户端全文模糊搜索，`Ctrl/Cmd+K` 快捷键唤起
- **评论系统** — 游客评论、回复功能、IP 归属地展示（基于 ip2region 离线解析）
- **关于页面** — 站点配置动态渲染（AiEditor 富文本编辑）
- **博客分身** — 全局 AI 聊天机器人，基于博客内容与访客对话（SSE 流式 + 打字机效果 + 文章标题自动链接）
- **SEO 优化** — Open Graph / Twitter Card / 结构化数据 / react-helmet-async
- **Microsoft Clarity** — 前台页面数据埋点（后台管理不加载）

### 后台管理

- **仪表盘** — 文章/分类/标签/评论数量统计、近 7 天发布趋势、最新评论
- **文章管理** — 增删改查、状态控制（发布/草稿）、AiEditor 富文本编辑
  - **AI 工具栏**：续写（focusBefore）、润色/扩写/精简（selected）
  - **气泡面板**：选中文本后浮出 — 优化写作、拼写检查、翻译、总结
  - **AI 辅助**：标题生成、摘要提取（作用于表单字段，SSE 流式逐字输出 + 打字机效果）
- **分类管理** — CRUD 操作、排序
- **标签管理** — CRUD 操作
- **评论管理** — 分页查询、关键词搜索、删除、IP/归属地展示
- **友链管理** — CRUD 操作、排序
- **站点配置** — 博客标题、副标题、备案号、关于页面内容
- **图片上传** — 本地文件存储

### 安全与部署

- **敏感词过滤** — 730KB+ 完整敏感词库，评论提交时实时检测
- **管理员自动初始化** — 首次访问首页自动创建管理员，随机密码展示给用户（10-18 位字母+数字）
- **JWT 认证** — 7 天有效期 Token 鉴权
- **Vercel 部署** — Serverless Functions 架构，支持 PostgreSQL 数据库

## 项目结构

```
blog/
├── api/                          # Vercel Serverless Functions 入口
│   └── index.js
├── blog-frontend/                # 前端项目
│   ├── src/
│   │   ├── api/                  # API 请求封装
│   │   ├── components/           # 公共组件（AiEditor、SeoMeta、ArticleCard、GlobalSearch、BlogChatBot）
│   │   ├── pages/
│   │   │   ├── front/            # 前台页面（Home、ArticleList、ArticleDetail、Search、About）
│   │   │   └── admin/            # 后台页面（Dashboard、ArticleManage、CategoryManage 等）
│   │   ├── router/               # 路由配置
│   │   └── lib/                  # Axios 请求实例
│   ├── index.html
│   ├── vite.config.ts
│   └── tailwind.config.js
├── blog-backend/                 # 后端项目
│   ├── src/
│   │   ├── modules/              # 业务模块路由（user、article、category、tag、comment 等）
│   │   ├── plugins/              # Fastify 插件（cors、jwt、prisma、swagger、static）
│   │   ├── utils/                # 工具函数（bcrypt、dateFormat、sensitiveWords、ipRegion）
│   │   ├── schemas/              # 通用响应格式
│   │   ├── app.ts                # Fastify 应用构建
│   │   ├── server.ts             # 本地启动入口
│   │   └── vercel-handler.ts     # Vercel Serverless 适配器
│   ├── data/
│   │   ├── sensitive_words.txt   # 敏感词库
│   │   └── ip2region_v4.xdb      # IP 归属地数据库
│   ├── prisma/
│   │   ├── schema.prisma         # 当前使用的 Schema
│   │   ├── schema.sqlite.prisma  # SQLite Schema 模板
│   │   ├── schema.mysql.prisma   # MySQL Schema 模板
│   │   └── schema.postgresql.prisma # PostgreSQL Schema 模板（Vercel）
│   ├── scripts/
│   │   └── switch-db.ts          # 数据库切换脚本
│   └── tsconfig.json
├── vercel.json                   # Vercel 部署配置
├── package.json                  # Monorepo 根配置
└── .gitignore
```

## 本地开发

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
# 安装根目录和子项目依赖
npm install
cd blog-frontend && npm install && cd ..
cd blog-backend && npm install && cd ..
```

### 配置环境变量

复制 `blog-backend/.env.example` 为 `blog-backend/.env`，按需修改：

```env
DATABASE_PROVIDER=sqlite
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-jwt-secret"
PORT=3000
LLM_BASE_URL="http://your-llm-server:8080"
LLM_API_KEY="your-key"
LLM_MODEL="deepseek-v4-pro"
```

### 初始化数据库

```bash
cd blog-backend
npx prisma generate
npx prisma db push
```

### 启动开发服务器

```bash
# 根目录一键启动（前后端并行）
npm run dev

# 或分别启动
npm run dev:frontend   # 前端 http://localhost:5173
npm run dev:backend    # 后端 http://localhost:3000
```

### 首次访问

打开首页后，系统会自动检测是否已初始化管理员。如果没有，会自动创建管理员账户并在页面顶部展示**随机密码**（仅展示一次，请立即保存）。使用该账号密码登录 `/login` 进入后台管理。

## 部署到 Vercel

### 1. 推送到 GitHub

```bash
git init
git add .
git commit -m "init: blog system"
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

### 2. 在 Vercel 导入项目

1. 登录 [Vercel](https://vercel.com)
2. 点击 "New Project" → 导入 GitHub 仓库
3. Vercel 会自动检测 `vercel.json` 配置

### 3. 配置环境变量

在 Vercel 项目的 Settings → Environment Variables 中添加：

| 变量 | 说明 | 示例值 |
|------|------|--------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | `postgresql://user:pass@host:5432/db?pgbouncer=true&connect_timeout=15` |
| `JWT_SECRET` | JWT 密钥 | 生成一个随机字符串 |
| `LLM_BASE_URL` | AI 模型 API 地址（可选） | `http://your-llm-server:8080` |
| `LLM_API_KEY` | AI 模型 API Key（可选） | `your-key` |
| `LLM_MODEL` | AI 模型名称（可选） | `deepseek-v4-pro` |

### 4. 添加 PostgreSQL 数据库

Vercel 部署**默认使用 PostgreSQL**，构建时会自动切换到 PostgreSQL schema 并生成 Prisma Client。

1. 进入 Vercel 项目 Storage 标签，创建 Postgres 数据库（免费额度）
2. 创建后 Vercel 会自动将连接字符串注入为 `DATABASE_URL` 环境变量
3. 部署完成后，首次访问首页会自动触发数据库表创建（通过管理员初始化接口）

### 5. 切换数据库 Schema（如需）

```bash
cd blog-backend

# 切换到 PostgreSQL（Vercel 部署）
npx tsx scripts/switch-db.ts postgresql
npx prisma generate
npx prisma db push

# 切换回 SQLite（本地开发）
npx tsx scripts/switch-db.ts sqlite
npx prisma generate
npx prisma db push
```

## 数据库切换

项目支持三种数据库，通过 `switch-db.ts` 脚本一键切换：

| 数据库 | 用途 | Schema 模板 |
|--------|------|-------------|
| SQLite | 本地开发 | `schema.sqlite.prisma` |
| MySQL | 自建服务器 | `schema.mysql.prisma` |
| PostgreSQL | Vercel 部署 | `schema.postgresql.prisma` |

## License

MIT
