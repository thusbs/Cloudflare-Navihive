# 常见问题

本页面收集了 NaviHive 使用过程中的常见问题和解决方案。如果您遇到的问题未在此列出，请在 GitHub 上提交 Issue。

## 部署相关

### 如何创建 Cloudflare 账号？

1. 访问 [Cloudflare 官网](https://www.cloudflare.com/)
2. 点击右上角 "Sign Up" 注册账号
3. 验证邮箱后登录
4. 在左侧菜单中找到 "Workers & Pages"
5. 首次使用需要设置 workers.dev 子域名

::: tip
Cloudflare 提供免费的 Workers 计划，每天 10 万次请求，对个人使用完全足够。
:::

### 部署时提示 "database_id not found" 怎么办？

这表示 `wrangler.jsonc` 中的数据库 ID 配置不正确。请按以下步骤操作：

1. 确保已创建 D1 数据库：
```bash
wrangler d1 create navigation-db
```

2. 复制命令输出中的 `database_id`

3. 更新 `wrangler.jsonc` 中的配置：
```jsonc
{
  "d1_databases": [{
    "binding": "DB",
    "database_name": "navigation-db",
    "database_id": "YOUR_DATABASE_ID_HERE"  // 替换为实际 ID
  }]
}
```

4. 重新部署：
```bash
pnpm deploy
```

### 部署成功但无法访问，显示空白页面？

可能的原因和解决方案：

**1. 数据库未初始化**

部署后需要手动初始化数据库：

```bash
# 执行初始化 SQL
wrangler d1 execute navigation-db --file=schema.sql
```

**2. 路由配置问题**

检查 `wrangler.jsonc` 中的 `routes` 配置是否正确。

**3. 认证配置缺失**

确保 `wrangler.jsonc` 中设置了必要的环境变量：
- `AUTH_ENABLED`
- `AUTH_USERNAME`
- `AUTH_PASSWORD`（bcrypt 哈希）
- `AUTH_SECRET`

**4. 浏览器缓存问题**

尝试清除浏览器缓存或使用无痕模式访问。

### 如何更新已部署的应用？

```bash
# 1. 拉取最新代码
git pull

# 2. 安装依赖（如果有更新）
pnpm install

# 3. 构建并部署
pnpm deploy
```

::: warning 数据库迁移
如果更新包含数据库结构变更，需要手动执行迁移脚本。查看项目 `migrations/` 目录。
:::

### 可以部署到自己的域名吗？

可以。按以下步骤操作：

1. 在 Cloudflare 中添加您的域名
2. 更新域名 DNS 设置（使用 Cloudflare DNS）
3. 在 `wrangler.jsonc` 中配置 `routes`：
```jsonc
{
  "routes": [
    {
      "pattern": "nav.yourdomain.com/*",
      "custom_domain": true
    }
  ]
}
```
4. 重新部署

### 部署失败，提示权限错误？

确保您已登录 Cloudflare：

```bash
# 登录
wrangler login

# 验证登录状态
wrangler whoami
```

如果问题持续，检查您的 Cloudflare 账号权限是否包含 Workers 和 D1 的操作权限。

## 功能相关

### 如何修改管理员密码？

1. 使用命令生成新密码的哈希值：
```bash
pnpm hash-password your-new-password
```

2. 复制输出的哈希值（以 `$2a$` 开头）

3. 更新 `wrangler.jsonc` 中的 `AUTH_PASSWORD`

4. 重新部署：
```bash
pnpm deploy
```

::: danger 安全提示
永远不要在配置文件中存储明文密码！始终使用 bcrypt 哈希。
:::

### 如何启用访客模式（公开访问）？

访客模式允许未登录用户查看公开内容。

**配置方法**：

在 `wrangler.jsonc` 中设置：
```jsonc
{
  "vars": {
    "AUTH_REQUIRED_FOR_READ": "false"  // 启用访客模式
  }
}
```

**控制内容可见性**：

1. 登录管理后台
2. 编辑分组或站点
3. 勾选/取消勾选 "公开" 选项
   - 勾选：访客可见
   - 不勾选：仅管理员可见

### 如何自定义页面样式？

1. 登录后，点击右上角设置图标
2. 在 "自定义 CSS" 区域输入您的样式代码
3. 点击保存

**示例**：
```css
/* 修改背景色 */
body {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* 修改卡片样式 */
.MuiCard-root {
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

::: tip
自定义 CSS 限制为 50KB，并会自动过滤危险代码以确保安全。
:::

### 拖拽排序不生效怎么办？

可能的原因：

1. **未进入编辑模式**：点击 "编辑排序" 按钮进入排序模式
2. **浏览器兼容性**：确保使用现代浏览器（Chrome、Firefox、Edge、Safari）
3. **权限问题**：确保已登录管理员账号
4. **保存操作**：排序后需要点击 "保存排序" 才会持久化

### 如何批量导入站点？

1. 准备 JSON 格式的数据（参考导出格式）
2. 登录后台，点击 "导入数据"
3. 选择 JSON 文件或粘贴 JSON 内容
4. 点击确认导入

**导入规则**：
- 分组按名称匹配，存在则复用，不存在则创建
- 站点按 URL 匹配（同分组内），存在则更新，不存在则创建
- 配置项会完全替换现有配置

::: warning 数据备份
导入前建议先导出当前数据作为备份，以防意外。
:::

### 如何备份我的数据？

**方法 1：通过 UI 导出**
1. 登录后台
2. 点击 "导出数据" 按钮
3. 保存下载的 JSON 文件

**方法 2：通过命令行导出数据库**
```bash
wrangler d1 export navigation-db --output=backup.sql
```

建议定期备份，尤其是在重要操作前。

## 安全相关

### 如何增强系统安全性？

**1. 使用强密码和强密钥**
```bash
# 生成强密码哈希
pnpm hash-password "your-very-strong-password-123!@#"

# AUTH_SECRET 使用至少 32 位随机字符串
# 可使用在线工具生成：https://randomkeygen.com/
```

**2. 启用 HTTPS（生产环境默认）**
- Cloudflare Workers 自动使用 HTTPS
- 自定义域名需配置 SSL 证书（Cloudflare 免费提供）

**3. 定期更新密码**
- 建议每 3-6 个月更换一次管理员密码

**4. 监控访问日志**
```bash
# 查看 Worker 日志
wrangler tail
```

**5. 限制访问来源**
- 如果只需特定 IP 访问，可在 Cloudflare 防火墙中配置规则

### 系统有速率限制吗？

是的，系统内置了登录速率限制：

- **限制规则**：每个 IP 地址 15 分钟内最多尝试登录 5 次
- **触发响应**：第 6 次尝试将返回 429 错误（Too Many Requests）
- **重置时间**：15 分钟后自动重置计数

这有效防止了暴力破解攻击。

### JWT 令牌会过期吗？

会的：

- **标准模式**：令牌有效期 7 天
- **"记住我" 模式**：令牌有效期 30 天

令牌过期后需要重新登录。令牌存储在：
1. HttpOnly Cookie（主要，更安全）
2. localStorage（备用，兼容性）

### 如何查看安全日志？

```bash
# 实时查看 Worker 日志
wrangler tail

# 筛选错误日志
wrangler tail --status error
```

日志会显示：
- 请求路径和方法
- 错误类型和唯一 ID
- 速率限制触发记录（包含 IP）

## 技术相关

### 本地开发时无法连接数据库？

默认情况下，本地开发使用 **Mock 模式**，无需连接真实数据库。

如果需要使用真实数据库：

1. 创建 `.env` 文件：
```bash
VITE_USE_REAL_API=true
```

2. 启动开发服务器（会同时启动 Workers）：
```bash
pnpm dev
```

3. 确保本地 D1 数据库已初始化：
```bash
wrangler d1 execute navigation-db --local --file=schema.sql
```

### 如何升级 Node.js 版本？

NaviHive 需要 Node.js 16 或更高版本。

```bash
# 检查当前版本
node --version

# 推荐使用 nvm 管理 Node 版本
# 安装最新 LTS 版本
nvm install --lts
nvm use --lts
```

升级后重新安装依赖：
```bash
pnpm install
```

### 构建失败，提示 TypeScript 错误？

1. **清理缓存**：
```bash
# 删除 node_modules 和锁文件
rm -rf node_modules pnpm-lock.yaml

# 重新安装
pnpm install
```

2. **检查 TypeScript 版本**：
```bash
# 项目中的 TypeScript 版本
pnpm list typescript
```

3. **手动类型检查**：
```bash
tsc -b
```

如果问题持续，请在 GitHub 提交 Issue 并附上完整错误日志。

### 如何从 v1.0.x 升级到 v1.1.0？

v1.1.0 引入了访客模式功能，需要数据库迁移。

**升级步骤**：

1. **备份数据**：
```bash
wrangler d1 export navigation-db --output=backup-before-v1.1.0.sql
```

2. **更新代码**：
```bash
git pull origin main
pnpm install
```

3. **执行数据库迁移**：
```bash
wrangler d1 execute navigation-db --file=migrations/002_add_is_public.sql
```

4. **部署新版本**：
```bash
pnpm deploy
```

5. **配置访客模式**（可选）：

在 `wrangler.jsonc` 中添加：
```jsonc
{
  "vars": {
    "AUTH_REQUIRED_FOR_READ": "false"
  }
}
```

再次部署：
```bash
pnpm deploy
```

### pnpm 命令不识别怎么办？

NaviHive 使用 pnpm 作为包管理器。如果系统未安装：

```bash
# 使用 npm 全局安装 pnpm
npm install -g pnpm

# 或使用 Corepack（Node.js 16.13+ 自带）
corepack enable
corepack prepare pnpm@latest --activate
```

验证安装：
```bash
pnpm --version
```

## 更多帮助

如果您的问题未在此列出：

- **查看文档**：浏览左侧菜单中的其他文档页面
- **搜索 Issues**：在 [GitHub Issues](https://github.com/zqq-nuli/Cloudflare-Navihive/issues) 中搜索类似问题
- **提交 Issue**：描述问题、环境信息、错误日志，我们会尽快回复
- **加入社区**：在 GitHub Discussions 中与其他用户交流

::: tip 提问建议
提问时请提供：
- NaviHive 版本
- Node.js 和 pnpm 版本
- 操作系统
- 完整错误日志
- 复现步骤

这将帮助我们更快定位问题。
:::
