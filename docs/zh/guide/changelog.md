# 更新日志

记录 NaviHive 的所有版本更新和重要变更。

## v1.1.0（2025-01-XX）

### 新增功能

#### 访客模式（公开/私有内容控制）

允许未登录用户访问公开内容，同时保护私有内容。

- **配置选项**：新增 `AUTH_REQUIRED_FOR_READ` 环境变量
  - `false`（默认）：启用访客模式，允许查看公开内容
  - `true`：所有内容需要认证（v1.0.x 行为）

- **数据库字段**：`groups` 和 `sites` 表新增 `is_public` 字段
  - `1`：公开可见（访客和管理员）
  - `0`：私有内容（仅管理员）

- **访问控制**：
  - 访客：仅查看 `is_public=1` 的分组和站点
  - 管理员：查看所有内容
  - 写操作始终需要认证

- **性能优化**：
  - 在 `is_public` 字段上创建索引
  - 根据认证状态优化查询

#### 登录速率限制

防止暴力破解攻击的安全功能。

- **限制规则**：每 IP 15 分钟内最多 5 次登录尝试
- **实现方式**：`SimpleRateLimiter` 类（内存存储）
- **超限响应**：返回 429 状态码
- **日志记录**：记录触发速率限制的 IP 地址

### 安全改进

#### Phase 1：关键安全修复（Critical）

- **CR-001**：JWT 签名实现
  - 使用 Web Crypto API 的 HMAC-SHA256 算法
  - 替换不安全的自定义签名实现

- **CR-002**：SQL 注入防护
  - 所有查询使用 D1 参数化语句
  - 使用 `.bind()` 方法，永不拼接字符串
  - 字段白名单验证

- **CR-003**：XSS 防护
  - 自定义 CSS 过滤危险模式
  - 移除 `javascript:`、`data:text/html`、`vbscript:` 协议
  - 移除 `@import`、`expression()`、`-moz-binding`
  - 移除事件处理器和内联脚本

- **CR-004**：SSRF 防护
  - URL 验证阻止私有 IP 范围
    - 本地回环（127.0.0.1、::1）
    - 私有 IPv4（10.0.0.0/8、172.16.0.0/12、192.168.0.0/16）
    - 链路本地（169.254.0.0/16、fe80::/10）
  - 仅允许 HTTPS 和 data:image/ 协议

#### Phase 2：高优先级修复（High）

- **HS-001**：HttpOnly Cookie
  - 令牌主要存储在 HttpOnly Cookie 中（防止 XSS 窃取）
  - localStorage 作为兼容性备用
  - Cookie 自动随请求发送

- **HS-002**：登录速率限制
  - 5 次尝试 / 15 分钟限制
  - 内存存储（SimpleRateLimiter）
  - IP 级别限制

- **HS-003**：bcrypt 密码哈希
  - 使用 bcrypt-edge（Cloudflare Workers 兼容）
  - 10 轮盐值
  - 提供 `pnpm hash-password` 命令生成哈希

- **HS-004**：CORS 配置
  - 白名单来源验证
  - 自动允许同源请求
  - 支持 workers.dev 子域名（开发环境）
  - 启用凭证支持（cookie 认证）

- **HS-005**：结构化错误处理
  - 唯一错误 ID（追踪和调试）
  - 用户友好错误消息（不泄露敏感信息）
  - 详细服务端日志
  - 请求上下文记录（路径、方法）

#### Phase 3：中等优先级修复（Medium）

- **MS-001**：TypeScript 严格模式
  - 启用所有严格检查选项
  - 修复 65+ 类型错误
  - 禁止隐式 any
  - 严格空值检查
  - 禁止未检查的索引访问

- **MS-005**：请求体大小限制
  - 最大 1MB 限制（防止内存耗尽）
  - 超限返回 413 状态码

- **MS-007**：深度数据验证
  - 导入操作的全面验证
  - 结构、类型、URL 格式检查
  - 字段白名单
  - 所有用户输入验证

### 数据库变更

新增字段和索引以支持访客模式：

```sql
-- groups 表新增字段
ALTER TABLE groups ADD COLUMN is_public INTEGER DEFAULT 1;

-- sites 表新增字段
ALTER TABLE sites ADD COLUMN is_public INTEGER DEFAULT 1;

-- 性能优化索引
CREATE INDEX IF NOT EXISTS idx_groups_is_public ON groups(is_public);
CREATE INDEX IF NOT EXISTS idx_sites_is_public ON sites(is_public);
```

### 迁移指南

从 v1.0.x 升级到 v1.1.0 需要执行数据库迁移：

```bash
# 1. 备份数据
wrangler d1 export navigation-db --output=backup.sql

# 2. 执行迁移
wrangler d1 execute navigation-db --file=migrations/002_add_is_public.sql

# 3. 部署新版本
pnpm deploy
```

### 环境变量变更

新增环境变量（可选）：

```jsonc
{
  "vars": {
    "AUTH_REQUIRED_FOR_READ": "false"  // 新增：启用访客模式
  }
}
```

### 提交记录

总计 14 个安全和功能提交：

- 4 个关键安全修复
- 5 个高优先级安全修复
- 3 个中等优先级安全修复
- 2 个 v1.1.0 功能实现

所有变更已提交并部署到生产环境。

### 致谢

感谢社区反馈和安全研究人员的贡献，帮助 NaviHive 成为更安全的导航管理系统。

---

## v1.0.0（2024-12-XX）

### 首次发布

NaviHive 的第一个稳定版本，提供完整的网站导航管理功能。

### 核心功能

#### 前端特性

- **现代化 UI**：
  - 基于 React 19 和 Material UI 7.0
  - 支持深色/浅色主题切换
  - 响应式设计，适配移动端

- **分组管理**：
  - 创建、编辑、删除导航分组
  - 拖拽排序
  - 可折叠/展开

- **站点管理**：
  - 添加、编辑、删除网站链接
  - 自动获取网站图标
  - 支持描述和备注
  - 拖拽排序

- **全局配置**：
  - 自定义站点标题
  - 自定义站点名称
  - 自定义 CSS 样式

- **数据管理**：
  - JSON 格式导出所有数据
  - JSON 格式导入数据（智能合并）

#### 后端特性

- **Cloudflare Workers**：
  - 全球边缘计算部署
  - 无服务器架构
  - 自动扩展

- **Cloudflare D1 数据库**：
  - 基于 SQLite 的分布式数据库
  - 关系型数据模型
  - 事务支持

- **认证系统**：
  - 用户名/密码认证
  - JWT 令牌
  - 受保护的 API 路由

- **RESTful API**：
  - `/api/groups` - 分组管理
  - `/api/sites` - 站点管理
  - `/api/configs` - 配置管理
  - `/api/login` - 用户认证
  - `/api/export` - 数据导出
  - `/api/import` - 数据导入

### 技术栈

**前端**：
- React 19
- TypeScript
- Material UI 7.0
- Tailwind CSS 4.1
- DND Kit（拖拽）
- Vite 6

**后端**：
- Cloudflare Workers
- Cloudflare D1（SQLite）
- Web Crypto API（JWT）

**开发工具**：
- pnpm（包管理）
- Wrangler（Cloudflare CLI）
- ESLint + Prettier（代码质量）

### 数据库结构

三个核心表：

**groups（分组表）**：
- id（主键）
- name（分组名称）
- order_num（排序号）
- created_at、updated_at（时间戳）

**sites（站点表）**：
- id（主键）
- group_id（外键，关联分组）
- name（站点名称）
- url（站点链接）
- icon（图标 URL）
- description（描述）
- notes（备注）
- order_num（排序号）
- created_at、updated_at（时间戳）

**configs（配置表）**：
- key（主键，配置项名称）
- value（配置值）
- created_at、updated_at（时间戳）

### 部署方式

支持多种部署方式：

1. **Cloudflare Workers 直接部署**（推荐）
2. **自定义域名部署**
3. **workers.dev 子域名部署**

### 配置选项

通过 `wrangler.jsonc` 配置：

- `AUTH_ENABLED`：启用/禁用认证
- `AUTH_USERNAME`：管理员用户名
- `AUTH_PASSWORD`：管理员密码（明文，v1.1.0 改为哈希）
- `AUTH_SECRET`：JWT 签名密钥
- D1 数据库绑定

### 开发特性

- **双 API 模式**：
  - 真实 API（连接 Cloudflare Workers）
  - Mock API（内存模拟，快速开发）

- **热模块替换**：Vite 提供快速的开发体验

- **类型安全**：完整的 TypeScript 支持

### 已知限制

- 密码存储为明文（v1.1.0 已修复）
- JWT 签名不够安全（v1.1.0 已修复）
- 无速率限制（v1.1.0 已添加）
- 所有内容需要认证访问（v1.1.0 添加访客模式）
- 缺少部分输入验证（v1.1.0 已完善）

### 未来计划

- ✅ 访客模式（已在 v1.1.0 实现）
- ✅ 安全加固（已在 v1.1.0 实现）
- 用户权限系统
- 站点分类标签
- 站点搜索功能
- 导入浏览器书签
- API 文档
- 单元测试和集成测试

### 致谢

感谢所有早期用户的反馈和建议！

---

## 版本命名规则

NaviHive 遵循 [语义化版本规范](https://semver.org/lang/zh-CN/)：

- **主版本号**（MAJOR）：不兼容的 API 变更
- **次版本号**（MINOR）：向下兼容的功能新增
- **修订号**（PATCH）：向下兼容的问题修复

示例：
- `1.0.0` → `1.1.0`：新增访客模式功能（向下兼容）
- `1.1.0` → `1.1.1`：修复 bug（向下兼容）
- `1.1.0` → `2.0.0`：重大架构变更（可能不兼容）

## 如何获取更新

### 自托管用户

```bash
# 1. 查看当前版本
git describe --tags

# 2. 拉取最新代码
git pull origin main

# 3. 查看更新日志
git log

# 4. 安装依赖
pnpm install

# 5. 执行必要的迁移（如有）
# 查看 migrations/ 目录

# 6. 部署更新
pnpm deploy
```

### 订阅更新通知

- **Watch GitHub 仓库**：点击仓库右上角 "Watch" → "Custom" → 勾选 "Releases"
- **Star 仓库**：及时收到推送通知
- **RSS 订阅**：订阅 GitHub Releases RSS

## 贡献变更日志

如果您提交了功能或修复，请在 PR 中更新本文档的 "Unreleased" 部分，方便维护者整理发版。

格式示例：
```markdown
## Unreleased

### Added
- 新功能描述 (#PR号)

### Fixed
- 修复的问题描述 (#PR号)
```
