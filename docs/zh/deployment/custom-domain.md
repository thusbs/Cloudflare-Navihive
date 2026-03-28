# 自定义域名部署

将 NaviHive 部署到您自己的域名（如 `nav.yourdomain.com`），可以提升品牌形象，方便用户记忆。

Cloudflare Workers 提供了极其简单的自定义域名绑定功能。

## 前置条件

在开始之前，请确保：

1. **拥有一个域名**：您可以从任何域名注册商购买。
2. **域名已接入 Cloudflare**：
   - 将您的域名 DNS 服务器修改为 Cloudflare 提供的 DNS 服务器。
   - 在 Cloudflare 控制台中可以看到该域名状态为 "Active"。
3. **已完成基础部署**：您的 NaviHive 已经成功部署到 `*.workers.dev` 子域名（参考 [快速部署](/zh/deployment/quick-start)）。

## 方法一：通过 Cloudflare 控制台（推荐）

这是最简单的方法，无需修改代码，Cloudflare 会自动为您处理 DNS 记录和 SSL 证书。

### 步骤 1：进入项目设置

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)。
2. 在左侧菜单点击 **Workers & Pages**。
3. 在列表中找到您部署的 NaviHive 项目（例如 `navihive`），点击进入。
4. 点击顶部的 **Settings**（设置）标签页。
5. 在左侧子菜单点击 **Domains & Routes**（域名与路由）。

### 步骤 2：添加自定义域名

1. 点击 **Add**（添加）按钮 > **Custom Domain**（自定义域名）。
2. 在弹出的窗口中，输入您想要使用的完整域名。
   - 例如：`nav.example.com` 或 `www.example.com`。
   - 如果您想使用根域名（如 `example.com`），直接输入即可。
3. 点击 **Add Custom Domain** 按钮。

### 步骤 3：等待生效

1. Cloudflare 会自动为您：
   - 添加一条指向 Worker 的 DNS CNAME 记录。
   - 申请并部署 SSL 证书。
2. 状态通常会在几秒钟到几分钟内变为 **Active**（活跃）。
3. 如果是首次添加，SSL 证书颁发可能需要 1-15 分钟。

### 步骤 4：验证访问

在浏览器中输入您的自定义域名（例如 `https://nav.example.com`），您应该能看到您的 NaviHive 导航站。

---

## 方法二：通过 Wrangler 配置文件

如果您更喜欢通过代码管理配置（Infrastructure as Code），可以直接在 `wrangler.jsonc` 中配置路由。

::: warning 注意
此方法要求您的域名已经托管在 Cloudflare 上。
:::

### 步骤 1：修改配置文件

打开项目根目录下的 `wrangler.jsonc` 文件，添加 `routes` 配置：

```jsonc
{
  "name": "navihive",
  // ... 其他配置 ...

  // 添加路由配置
  "routes": [
    {
      "pattern": "nav.yourdomain.com",
      "custom_domain": true
    }
  ]
}
```

- `pattern`: 您的自定义域名。
- `custom_domain`: 设置为 `true` 表示启用自定义域名功能（自动管理 DNS 和证书）。

### 步骤 2：重新部署

在终端中运行部署命令：

```bash
pnpm deploy
# 或者
npx wrangler deploy
```

Wrangler 会读取配置文件，并自动在 Cloudflare 上配置相应的域名绑定。

---

## 常见问题排查

### 1. 访问提示 "SSL Handshake Failed" 或 "525 Origin SSL Handshake Error"

**原因**：SSL 证书正在颁发中，或者 SSL/TLS 模式配置不兼容。

**解决方法**：
- 等待 10-15 分钟，让证书完成部署。
- 检查 Cloudflare 域名的 SSL/TLS 设置，建议设置为 **Full** 或 **Full (Strict)**。

### 2. 访问提示 "522 Connection Timed Out"

**原因**：DNS 解析问题或 Worker 运行异常。

**解决方法**：
- 确保 DNS 记录类型是 `Worker`（在 DNS 设置页面可以看到）。
- 检查 Worker 是否在 `workers.dev` 域名下能正常访问。

### 3. 提示 "Zone not found"

**原因**：您尝试绑定的域名没有接入当前的 Cloudflare 账号。

**解决方法**：
- 确保域名已经添加到 Cloudflare 账号中。
- 确保您有权限管理该域名的 DNS。

### 4. 也是最重要的一点：API 路径问题

使用自定义域名后，API 请求的路径会自动适配。但如果您在前端代码中硬编码了 API 地址（NaviHive 默认是相对路径，一般不会有问题），请确保更新。

- NaviHive 前端默认使用相对路径 `/api/...`，因此自定义域名通常能直接工作，无需额外配置。

## 高级配置：路由规则（Routes）

如果您想在同一个域名下运行多个应用，或者只接管特定路径，可以使用路由模式：

```jsonc
"routes": [
  {
    "pattern": "example.com/nav/*", // 只接管 /nav/ 开头的请求
    "zone_name": "example.com"
  }
]
```

*注意：对于单页应用（SPA）如 NaviHive，建议使用子域名（如 `nav.example.com`）而不是子路径，以避免静态资源路径问题。*
