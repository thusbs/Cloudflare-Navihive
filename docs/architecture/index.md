# 架构概览

NaviHive 是一个现代化的网站导航管理系统，采用全栈架构部署在 Cloudflare Workers 上。本页面详细介绍系统的技术架构、设计模式和核心实现。

## 技术栈总览

### 前端技术栈

- **核心框架**: React 19 + TypeScript
- **UI 组件库**: Material UI 7.0（基于 Emotion 样式引擎）
- **样式方案**:
  - Tailwind CSS 4.1（实用类样式）
  - CSS-in-JS（Emotion，用于动态样式）
- **拖拽功能**: DND Kit（实现分组和站点的可拖拽排序）
- **构建工具**: Vite 6 + Cloudflare 插件
- **API 层**: 客户端抽象（支持真实 API 和 Mock 模式）
- **状态管理**: React Context（PreferencesContext、ThemeContext）
- **本地服务**: IconCacheService（图标缓存）、SearchHistoryService（搜索历史）

### 后端技术栈

- **运行时**: Cloudflare Workers（全球边缘计算，无服务器）
- **数据库**: Cloudflare D1（基于 SQLite 的分布式数据库）
- **认证方案**:
  - JWT 令牌（使用 Web Crypto API 的 HMAC-SHA256 签名）
  - 密码加密（bcrypt，10轮盐值）
  - HttpOnly Cookie 存储（防止 XSS 攻击）
- **入口文件**: `worker/index.ts`（处理所有 API 路由）
- **API 模块**: `worker/api/`（用户偏好设置等 API 端点）
- **工具模块**: `worker/utils/`（设备识别、用户识别等工具函数）
- **验证模块**: `worker/validation/`（请求数据验证）
- **安全特性**: 请求验证、大小限制、CORS、错误处理

## 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         用户浏览器                            │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  React 19   │  │  Material UI │  │  Tailwind CSS│       │
│  │  前端应用    │  │  组件库       │  │  样式框架     │       │
│  └──────┬──────┘  └──────────────┘  └──────────────┘       │
│         │                                                    │
│         │ HTTP/HTTPS 请求                                    │
└─────────┼────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│              Cloudflare 全球边缘网络                          │
│  ┌───────────────────────────────────────────────────┐      │
│  │            Cloudflare Workers                      │      │
│  │  ┌─────────────────────────────────────────────┐  │      │
│  │  │  worker/index.ts (API 路由处理器)            │  │      │
│  │  │  ┌────────────┐  ┌────────────┐             │  │      │
│  │  │  │ 认证中间件  │  │ 输入验证   │             │  │      │
│  │  │  └────────────┘  └────────────┘             │  │      │
│  │  │  ┌────────────────────────────────────┐     │  │      │
│  │  │  │  API 路由                           │     │  │      │
│  │  │  │  - /api/groups (分组管理)           │     │  │      │
│  │  │  │  - /api/sites (站点管理)            │     │  │      │
│  │  │  │  - /api/configs (配置管理)          │     │  │      │
│  │  │  │  - /api/login (用户认证)            │     │  │      │
│  │  │  │  - /api/export (数据导出)           │     │  │      │
│  │  │  │  - /api/import (数据导入)           │     │  │      │
│  │  │  └────────────────────────────────────┘     │  │      │
│  │  └──────────────────┬──────────────────────────┘  │      │
│  └─────────────────────┼─────────────────────────────┘      │
└────────────────────────┼──────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   Cloudflare D1      │
              │   (SQLite 数据库)     │
              │  ┌────────────────┐  │
              │  │  groups 表     │  │
              │  │  sites 表      │  │
              │  │  configs 表    │  │
              │  └────────────────┘  │
              └──────────────────────┘
```

## 核心设计模式

### 1. API 路由结构

所有 API 路由统一使用 `/api/` 前缀，在 `worker/index.ts` 中集中处理：

- **认证中间件**: 自动检查 JWT 令牌，验证受保护路由的访问权限
- **输入验证**: 在处理前验证所有请求数据，防止恶意输入
- **路由分类**:
  - `groups`: 分组的 CRUD 操作
  - `sites`: 站点的 CRUD 操作
  - `configs`: 全局配置管理
  - `login`: 用户认证
  - `export/import`: 数据的导出导入
  - `preferences`: 用户偏好设置（视图模式、主题、自定义颜色等）

### 2. 客户端架构（双模式设计）

系统提供两种 API 客户端实现，通过环境变量切换：

**真实 API 客户端** (`src/API/client.ts`)
- 发送真实 HTTP 请求到 Cloudflare Workers 后端
- 用于生产环境和本地开发（需启动 Workers）
- 通过 `VITE_USE_REAL_API=true` 启用

**Mock 客户端** (`src/API/mock.ts`)
- 内存中的模拟数据和操作
- 用于快速开发和测试，无需后端依赖
- 默认开发模式

**优势**:
- 前端开发无需依赖后端启动
- 单元测试更加简单
- 统一的接口抽象，易于切换

### 3. 状态管理策略

采用 React Context + 组件级状态管理，避免全局状态库的复杂性：

- **Context 管理**: 
  - `PreferencesContext`: 管理用户偏好设置（视图模式、主题模式、自定义颜色）
  - `ThemeContext`: 管理主题状态和切换
- **React Hooks**: 使用 `useState`、`useEffect` 管理组件状态
- **状态缓存**: API 响应缓存在组件状态中
- **拖拽状态**: 由 DND Kit 自动管理
- **本地存储**: 使用 `localStorage` 工具函数进行持久化

**优势**:
- 降低学习成本
- 减少依赖复杂度
- 适合中小型应用
- Context 提供跨组件状态共享

### 4. 项目结构

#### 前端结构 (`src/`)

```
src/
├── API/                    # API 客户端层
│   ├── client.ts          # 真实 API 客户端
│   ├── http.ts            # HTTP 请求封装
│   └── mock.ts            # Mock 数据客户端
├── assets/                # 静态资源
│   ├── Cloudflare_Logo.svg
│   └── react.svg
├── components/            # React 组件
│   ├── EditGroupDialog.tsx      # 编辑分组对话框
│   ├── GroupCard.tsx            # 分组卡片
│   ├── HighlightedText.tsx      # 高亮文本组件
│   ├── ListView.tsx             # 列表视图
│   ├── LoginForm.tsx            # 登录表单
│   ├── SearchBox.tsx            # 搜索框
│   ├── SearchResultPanel.tsx    # 搜索结果面板
│   ├── SiteCard.tsx             # 站点卡片
│   ├── SiteSettingsModal.tsx    # 站点设置模态框
│   ├── SortableGroupItem.tsx    # 可排序分组项
│   ├── ThemeCustomizer.tsx      # 主题自定义器
│   ├── ThemeToggle.tsx          # 主题切换
│   └── ViewModeToggle.tsx       # 视图模式切换
├── config/                # 配置文件
│   └── searchEngines.ts   # 搜索引擎配置
├── contexts/              # React Context
│   ├── PreferencesContext.tsx   # 用户偏好上下文
│   └── ThemeContext.tsx         # 主题上下文
├── services/              # 前端服务
│   ├── IconCacheService.ts      # 图标缓存服务
│   └── SearchHistoryService.ts  # 搜索历史服务
├── types/                 # TypeScript 类型定义
│   └── preferences.ts     # 偏好设置类型
├── utils/                 # 工具函数
│   ├── bookmarkImport.ts  # 书签导入工具
│   ├── deviceIdentifier.ts # 设备识别
│   ├── localStorage.ts    # 本地存储工具
│   ├── search.ts          # 搜索工具
│   └── url.ts             # URL 工具
├── App.tsx                # 主应用组件
├── main.tsx               # 应用入口
└── types.ts               # 全局类型定义
```

#### 后端结构 (`worker/`)

```
worker/
├── api/                   # API 端点
│   ├── __tests__/        # API 测试
│   └── preferences.ts    # 用户偏好 API
├── utils/                # 工具函数
│   ├── __tests__/        # 工具测试
│   ├── deviceIdentifier.ts  # 设备识别
│   └── userIdentifier.ts    # 用户识别
├── validation/           # 数据验证
│   ├── __tests__/        # 验证测试
│   └── preferences.ts    # 偏好设置验证
└── index.ts              # Worker 入口文件
```

### 5. 数据库设计（六表结构）

**groups 表（分组）**
- 存储导航分类
- `order_num`: 排序字段
- `is_public`: 公开/私有标识（v1.1.0 新增）

**sites 表（站点）**
- 存储网站链接
- `group_id`: 关联分组（外键，级联删除）
- `order_num`: 排序字段
- `is_public`: 公开/私有标识（v1.1.0 新增）

**configs 表（配置）**
- 键值对存储
- 存储站点标题、名称、自定义 CSS 等全局配置

**user_favorites 表（用户收藏）**
- 存储用户收藏的站点
- `user_id`: 用户标识
- `site_id`: 站点 ID（外键，级联删除）
- 支持跨设备同步收藏

**user_preferences 表（用户偏好）**
- 存储用户个性化设置
- `user_id`: 用户标识（主键）
- `view_mode`: 视图模式（card/list）
- `theme_mode`: 主题模式（light/dark/system）
- `custom_colors`: 自定义颜色配置（JSON 格式）
- `updated_at`: 更新时间
- 支持跨设备同步偏好设置

**user_recent_visits 表（最近访问）**
- 记录用户访问历史
- `user_id`: 用户标识
- `site_id`: 站点 ID（外键，级联删除）
- `visited_at`: 访问时间
- 支持访问统计和热门推荐

## 数据流说明

### 读取数据流程（访客模式）

1. **用户访问页面** → 前端应用加载
2. **检查认证状态** → 调用 `/api/auth/status`
3. **获取分组和站点** → 调用 `/api/groups-with-sites`
4. **后端判断权限**:
   - 如果有有效令牌 → 返回所有数据
   - 如果无令牌且 `AUTH_REQUIRED_FOR_READ=false` → 仅返回 `is_public=1` 的数据
   - 如果无令牌且 `AUTH_REQUIRED_FOR_READ=true` → 返回 401 错误
5. **前端渲染** → 显示可访问的分组和站点

### 写入数据流程（需认证）

1. **用户操作** → 添加/编辑/删除分组或站点
2. **发送请求** → 携带 JWT 令牌（Cookie 或 Authorization 头）
3. **认证中间件验证**:
   - 验证令牌签名和有效期
   - 无效 → 返回 401 错误
4. **输入验证** → 检查数据格式和内容
5. **数据库操作** → 使用参数化查询（防 SQL 注入）
6. **返回结果** → 更新成功或错误信息
7. **前端更新** → 刷新本地状态

### 拖拽排序流程

1. **用户点击"编辑排序"** → 进入排序模式
2. **拖拽操作** → DND Kit 提供可视化交互
3. **保存排序** → 批量更新 `order_num` 字段
4. **API 调用**:
   - 分组排序 → `/api/group-orders`
   - 站点排序 → `/api/site-orders`
5. **后端事务更新** → 确保数据一致性
6. **前端刷新** → 显示新顺序

## 安全架构

### 认证与授权流程

```
用户登录
    ↓
┌─────────────────────────────────────────┐
│ 1. 提交用户名和密码                      │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ 2. Worker 验证凭证                       │
│    - 检查用户名匹配                      │
│    - bcrypt 验证密码哈希                 │
│    - 检查速率限制（5次/15分钟）           │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ 3. 生成 JWT 令牌                         │
│    - 使用 Web Crypto API 签名            │
│    - HMAC-SHA256 算法                    │
│    - 有效期：7天（或30天"记住我"）         │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ 4. 令牌存储                              │
│    - HttpOnly Cookie（主要，防XSS）      │
│    - localStorage（兼容性备用）           │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ 5. 后续请求自动携带令牌                  │
│    - Cookie 自动发送                     │
│    - 支持 Authorization 头备用           │
└─────────────────────────────────────────┘
```

### 多层安全防护

**1. 认证安全**
- JWT 令牌签名（Web Crypto API）
- bcrypt 密码哈希（10轮盐值）
- HttpOnly Cookie（防止 XSS 窃取）
- 速率限制（防暴力破解）

**2. 输入验证**
- 请求体大小限制：1MB
- 深度验证（结构、类型、格式）
- 字段白名单（防止非法字段注入）

**3. SQL 注入防护**
- D1 参数化查询（`.bind()` 方法）
- 永不拼接 SQL 字符串
- 字段白名单验证

**4. XSS 防护**
- React 自动转义输出
- 自定义 CSS 过滤危险模式
- URL 协议白名单

**5. SSRF 防护**
- URL 验证阻止私有 IP
- 仅允许 HTTPS 和 data:image/ 协议

**6. CORS 配置**
- 白名单来源验证
- 凭证支持（cookie 认证）

**7. 错误处理**
- 结构化日志（唯一错误 ID）
- 用户友好错误消息（不泄露细节）
- 服务端详细日志（调试用）

**8. 类型安全**
- TypeScript 严格模式
- 禁止隐式 any
- 严格空值检查

## 性能优化

### 前端优化

1. **代码分割**
   - Vite 自动分割 chunks
   - 动态导入减少初始加载

2. **资源优化**
   - Tailwind CSS 按需打包
   - Material UI 树摇（Tree Shaking）
   - 图标使用 Data URL 或外部 CDN

3. **渲染优化**
   - React 虚拟 DOM 高效更新
   - 组件级状态避免全局重渲染

### 后端优化

1. **边缘计算**
   - Cloudflare Workers 全球部署
   - 就近处理请求，低延迟

2. **数据库优化**
   - D1 索引（`is_public` 字段）
   - 批量操作（排序更新）
   - 参数化查询性能优秀

3. **缓存策略**
   - 静态资源 CDN 缓存
   - API 响应前端缓存

### 访客模式性能（v1.1.0）

- **索引优化**: 在 `groups` 和 `sites` 表的 `is_public` 字段上创建索引
- **查询优化**: 根据认证状态只查询需要的数据
- **减少数据传输**: 访客仅接收公开内容

## 可扩展性设计

### 水平扩展

- **Cloudflare Workers**: 自动全球扩展，无需手动配置
- **D1 数据库**: Cloudflare 管理的分布式架构
- **无状态设计**: Worker 无状态，可任意扩展实例

### 垂直扩展

- **数据库**: D1 支持更大数据集
- **Worker**: Cloudflare 自动分配资源
- **存储**: 可集成 R2 存储大文件（如图标）

### 功能扩展

- **插件系统**: 通过自定义 CSS 和配置扩展
- **API 扩展**: 易于添加新路由和功能
- **前端扩展**: 组件化设计，易于添加新 UI

## 开发与部署架构

### 本地开发环境

```
开发者电脑
    │
    ├─ Vite Dev Server (前端热更新)
    │    ↓
    │  React 应用 (端口 5173)
    │
    └─ Wrangler Dev (Workers 本地模拟)
         ↓
       Cloudflare Workers (端口 8787)
         ↓
       本地 D1 数据库 (.wrangler/state/)
```

### 生产部署架构

```
GitHub Repository
    ↓
 git push
    ↓
开发者本地
    ↓
 pnpm deploy
    ↓
Cloudflare 全球网络
    ├─ Workers (无服务器函数)
    ├─ D1 数据库 (分布式 SQLite)
    └─ CDN (静态资源缓存)
```

### CI/CD 考虑

- **手动部署**: 当前使用 `pnpm deploy`
- **未来集成**: 可集成 GitHub Actions 自动部署
- **数据库迁移**: 需手动执行 SQL 迁移脚本

## 总结

NaviHive 的架构设计充分利用了 Cloudflare 平台的优势，实现了：

- **高性能**: 全球边缘计算，低延迟响应
- **高安全**: 多层安全防护，企业级标准
- **易维护**: 清晰的代码结构，良好的文档
- **易扩展**: 模块化设计，支持功能扩展
- **低成本**: 无服务器架构，按需计费

这是一个适合个人、团队和企业使用的现代导航管理系统。
