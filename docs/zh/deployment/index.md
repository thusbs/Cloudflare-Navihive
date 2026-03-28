# 部署概览

NaviHive 专为 Cloudflare Workers 平台设计，提供全球边缘计算能力和优秀的性能表现。本页面介绍部署的基本概念和快速入门。

## 为什么选择 Cloudflare Workers？

### 核心优势

- **全球边缘网络**：部署到 200+ 个城市的边缘节点，用户就近访问
- **零冷启动**：无服务器架构，无需预热，即时响应
- **自动扩展**：根据流量自动扩缩容，无需手动配置
- **低成本**：免费套餐每天 10 万次请求，个人使用完全够用
- **简单部署**：一条命令部署到全球，无需复杂配置

### 性能对比

| 指标 | Cloudflare Workers | 传统服务器 | 其他 Serverless |
|------|-------------------|-----------|----------------|
| 全球延迟 | < 50ms | 100-500ms | 50-200ms |
| 冷启动 | 0ms | N/A | 100-1000ms |
| 扩展性 | 自动无限 | 手动配置 | 自动有限 |
| 运维成本 | 零运维 | 高 | 低 |
| 价格 | 免费/低价 | 中高 | 中 |

## 环境要求

### 软件要求

- **Node.js**：16.13 或更高版本（推荐 LTS）
- **pnpm**：8.0 或更高版本（包管理器）
- **Git**：用于代码管理（可选）

### Cloudflare 账号

1. 注册 [Cloudflare 账号](https://dash.cloudflare.com/sign-up)（免费）
2. 完成邮箱验证
3. 进入 "Workers & Pages" 页面
4. 设置 workers.dev 子域名（首次使用）

::: tip 免费套餐
Cloudflare Workers 免费套餐提供：
- 每天 10 万次请求
- 10ms CPU 时间/请求
- 无限 Workers 脚本
- 基础 D1 数据库（5GB 存储）

对个人和小团队完全足够！
:::

## 部署方式选择

NaviHive 支持多种部署方式，根据您的需求选择：

### 1. 快速部署（推荐新手）

使用 Wrangler CLI 一键部署到 workers.dev 子域名。

**适合场景**：
- 个人使用
- 快速体验
- 开发测试

**优点**：
- 5 分钟完成部署
- 无需域名
- 零配置

**限制**：
- 使用 workers.dev 子域名
- 无法自定义域名外观

[查看详细步骤 →](/zh/deployment/quick-start)

### 2. 自定义域名部署（推荐生产环境）

将应用部署到您自己的域名。

**适合场景**：
- 生产环境
- 对外服务
- 品牌需求

**优点**：
- 专业域名（如 nav.yourdomain.com）
- 完全控制
- SEO 友好

**要求**：
- 拥有域名
- 域名使用 Cloudflare DNS

[查看详细步骤 →](/zh/deployment/custom-domain)

### 3. Docker 部署（实验性）

在本地或服务器上使用 Docker 运行。

**适合场景**：
- 完全自托管
- 内网部署
- 特殊网络环境

**注意**：
- Cloudflare Workers 不支持 Docker
- 需要自行适配运行环境
- 不推荐用于生产环境

[查看详细步骤 →](/zh/deployment/docker)

## 快速部署步骤

以下是使用 workers.dev 快速部署的简化步骤：

### 步骤 1：准备环境

```bash
# 检查 Node.js 版本
node --version  # 应显示 v16.13 或更高

# 安装 pnpm（如果未安装）
npm install -g pnpm

# 验证 pnpm 安装
pnpm --version
```

### 步骤 2：获取代码

```bash
# 克隆仓库
git clone https://github.com/zqq-nuli/Cloudflare-Navihive.git

# 进入项目目录
cd Cloudflare-Navihive

# 安装依赖
pnpm install
```

### 步骤 3：配置项目

```bash
# 1. 登录 Cloudflare
wrangler login

# 2. 创建 D1 数据库
wrangler d1 create navigation-db

# 3. 复制输出的 database_id
# 示例输出：
# database_id = "abc123-def456-ghi789"
```

编辑 `wrangler.jsonc`：

```jsonc
{
  "name": "navihive",
  "compatibility_date": "2024-01-01",
  "main": "worker/index.ts",

  // 配置环境变量
  "vars": {
    "AUTH_ENABLED": "true",
    "AUTH_REQUIRED_FOR_READ": "false",
    "AUTH_USERNAME": "admin",
    "AUTH_PASSWORD": "", // 下一步生成
    "AUTH_SECRET": "" // 下一步生成
  },

  // 配置数据库
  "d1_databases": [{
    "binding": "DB",
    "database_name": "navigation-db",
    "database_id": "YOUR_DATABASE_ID_HERE"  // 替换为实际 ID
  }]
}
```

### 步骤 4：生成密钥

```bash
# 生成密码哈希
pnpm hash-password YourStrongPassword123

# 输出示例：
# $2a$10$abcdefghijklmnopqrstuvwxyz1234567890
```

生成 `AUTH_SECRET`（32位随机字符串）：
- 访问 https://randomkeygen.com/
- 复制 "CodeIgniter Encryption Keys" 中的任意一个

更新 `wrangler.jsonc` 中的密码哈希和密钥。

### 步骤 5：初始化数据库

```bash
# 执行初始化 SQL
wrangler d1 execute navigation-db --file=schema.sql
```

### 步骤 6：部署

```bash
# 构建并部署
pnpm deploy
```

部署成功后，命令行会显示您的应用 URL：
```
Published navihive (1.23 sec)
  https://navihive.your-subdomain.workers.dev
```

### 步骤 7：访问应用

1. 打开部署成功后显示的 URL
2. 点击右上角 "登录" 按钮
3. 使用配置的用户名和密码登录
4. 开始添加您的导航站点！

::: tip 首次登录
首次登录后，建议立即在设置中修改站点标题和名称，个性化您的导航站。
:::

## 部署配置说明

### 必需配置

以下配置项必须正确设置：

| 配置项 | 说明 | 示例 |
|--------|------|------|
| `AUTH_USERNAME` | 管理员用户名 | admin |
| `AUTH_PASSWORD` | 管理员密码（bcrypt 哈希） | $2a$10$... |
| `AUTH_SECRET` | JWT 签名密钥（32位） | your-32-char-secret-key-here |
| `database_id` | D1 数据库 ID | abc123-def456 |

### 可选配置

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `AUTH_ENABLED` | true | 启用/禁用认证 |
| `AUTH_REQUIRED_FOR_READ` | false | 访客模式开关 |
| `name` | navihive | Workers 脚本名称 |
| `compatibility_date` | 2024-01-01 | Cloudflare 兼容性日期 |

详细配置说明请参考 [配置文档](/zh/deployment/configuration)。

## 验证部署

部署完成后，验证以下功能：

### 基础功能

- [ ] 页面可以正常打开
- [ ] 深色/浅色主题切换正常
- [ ] 可以成功登录
- [ ] 可以创建分组
- [ ] 可以添加站点

### 认证功能

- [ ] 正确的凭证可以登录
- [ ] 错误的凭证被拒绝
- [ ] 登录后可以访问管理功能
- [ ] 登出后无法访问管理功能

### 访客模式（如果启用）

- [ ] 未登录可以查看公开内容
- [ ] 未登录无法查看私有内容
- [ ] 未登录无法编辑内容

### 数据库功能

- [ ] 数据可以正常保存
- [ ] 刷新页面后数据仍然存在
- [ ] 导出功能正常
- [ ] 导入功能正常

如果以上功能都正常，恭喜您部署成功！

## 更新部署

当有新版本发布时，更新部署：

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 安装新依赖（如果有）
pnpm install

# 3. 检查是否有数据库迁移
# 查看 migrations/ 目录是否有新文件

# 4. 执行迁移（如果需要）
wrangler d1 execute navigation-db --file=migrations/xxx.sql

# 5. 重新部署
pnpm deploy
```

::: warning 数据库迁移
更新前务必查看更新日志，了解是否需要执行数据库迁移脚本。跳过迁移可能导致应用异常。
:::

## 回滚部署

如果新版本有问题，回滚到上一个版本：

```bash
# 1. 查看部署历史
wrangler deployments list

# 2. 回滚到指定版本
wrangler rollback --message "Rollback to stable version"
```

## 部署清单

使用此清单确保部署正确：

**部署前**：
- [ ] Node.js 和 pnpm 已安装
- [ ] Cloudflare 账号已注册
- [ ] 已登录 Wrangler CLI
- [ ] 已创建 D1 数据库
- [ ] 已生成密码哈希和密钥
- [ ] 已更新 wrangler.jsonc 配置

**部署中**：
- [ ] 数据库已初始化
- [ ] 构建成功无错误
- [ ] 部署成功无错误

**部署后**：
- [ ] 应用可以访问
- [ ] 功能测试通过
- [ ] 已备份配置文件
- [ ] 已记录应用 URL

## 常见部署问题

### 部署失败

如果部署失败，检查：
1. Wrangler 是否已登录
2. wrangler.jsonc 配置是否正确
3. 数据库 ID 是否正确
4. 网络连接是否正常

### 应用无法访问

如果部署成功但无法访问：
1. 检查数据库是否初始化
2. 检查环境变量是否配置
3. 清除浏览器缓存重试
4. 查看 Cloudflare 控制台的错误日志

### 数据无法保存

如果数据无法保存：
1. 检查数据库绑定是否正确
2. 检查数据库是否初始化
3. 查看 Worker 日志错误信息

更多问题解决方案请参考 [常见问题](/zh/guide/faq)。

## 下一步

部署完成后，您可以：

- [配置环境变量](/zh/deployment/configuration) - 详细的配置选项说明
- [使用自定义域名](/zh/deployment/custom-domain) - 绑定您的域名
- [了解安全最佳实践](/zh/security/) - 增强系统安全性
- [自定义样式](/zh/features/customization) - 个性化外观
- [导入数据](/zh/features/data-management) - 批量添加站点

## 获取帮助

如果遇到问题：

- 查看 [常见问题](/zh/guide/faq)
- 查看 [故障排查](/zh/deployment/troubleshooting)
- 在 [GitHub Issues](https://github.com/zqq-nuli/Cloudflare-Navihive/issues) 提问
- 加入 [GitHub Discussions](https://github.com/zqq-nuli/Cloudflare-Navihive/discussions) 讨论

我们随时准备帮助您！
