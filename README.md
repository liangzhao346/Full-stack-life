# Vue3 + Node.js 全栈应用

通用脚手架项目，Vue3 + Vite 前端 + Node.js (Express) 后端 + MySQL (Prisma ORM)。

## 技术栈

| 层 | 技术 |
|---|------|
| 前端 | Vue 3 + Vite + TypeScript + Pinia + Vue Router + Axios |
| 后端 | Node.js + Express + TypeScript + Prisma + Zod |
| 数据库 | MySQL |
| 开发工具 | tsx (热重载), concurrently (并行启动) |

## 快速开始

### 1. 安装依赖

```bash
npm run install:all
```

### 2. 配置环境变量

```bash
# 后端
cp server/.env.example server/.env
# 编辑 server/.env，填写你的 MySQL 连接字符串

# 前端
cp client/.env.example client/.env
```

### 3. 数据库迁移

确保 MySQL 已启动，然后执行：

```bash
cd server
npx prisma migrate dev --name init
```

### 4. 启动开发服务

```bash
# 在项目根目录
npm run dev
```

- 后端: http://localhost:3000
- 前端: http://localhost:5173

### 5. 生产构建

```bash
npm run build
```

## 项目结构

```
program/
├── server/                    # 后端 (Express + Prisma)
│   ├── src/
│   │   ├── app.ts              # 应用入口
│   │   ├── tasks/              # Task 功能模块 (feature-first)
│   │   │   ├── task.controller.ts
│   │   │   ├── task.service.ts
│   │   │   ├── task.repository.ts
│   │   │   └── task.dto.ts
│   │   └── shared/
│   │       ├── config/         # 配置管理 (Zod 验证, fail-fast)
│   │       ├── errors/         # 类型化错误体系
│   │       ├── middleware/     # 中间件 (requestID, errorHandler)
│   │       └── utils/          # 工具 (结构化日志)
│   └── prisma/schema.prisma    # 数据库 schema
├── client/                    # 前端 (Vue3 + Vite)
│   ├── src/
│   │   ├── api/                # API client (Axios 封装 + 错误映射)
│   │   ├── stores/             # Pinia 状态管理
│   │   ├── views/              # 页面组件
│   │   ├── router/             # Vue Router
│   │   └── types/              # TypeScript 类型定义
│   └── vite.config.ts          # Vite 配置 (含 /api 代理)
└── package.json                # Monorepo 脚本
```

## API 端点

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /health | 健康检查 |
| GET | /ready | 就绪检查 (含数据库状态) |
| GET | /api/tasks | 获取所有任务 |
| GET | /api/tasks/:id | 获取单个任务 |
| POST | /api/tasks | 创建任务 |
| PUT | /api/tasks/:id | 更新任务 |
| DELETE | /api/tasks/:id | 删除任务 |

## 架构设计

- **Feature-first 目录结构**: 按功能模块组织，不按技术层分
- **三层架构**: Controller (HTTP) → Service (业务逻辑) → Repository (数据访问)
- **类型化错误**: AppError 基类 + NotFoundError/ValidationError/ConflictError 等
- **结构化 JSON 日志**: 带请求 ID，可搜索可过滤
- **输入验证**: Zod 在边界层验证所有输入
- **优雅关闭**: SIGTERM 信号处理 + 数据库连接释放
- **前端 API 代理**: Vite dev server 代理 /api 到后端，无需 CORS 配置
# Full-stack-life
# Full-stack-life
