# 安全概览

NaviHive 采用企业级安全标准，经过 14 个专项安全修复，全面防护常见的 Web 安全威胁。本页面概述系统的安全架构和防护措施。

## 安全加固历程

### 安全修复统计

NaviHive v1.1.0 完成了全面的安全加固，共计 14 个安全修复：

- **Phase 1 - 关键安全修复**：4 项（CR-001 至 CR-004）
- **Phase 2 - 高优先级修复**：5 项（HS-001 至 HS-005）
- **Phase 3 - 中等优先级修复**：3 项（MS-001、MS-005、MS-007）
- **功能安全增强**：2 项（访客模式相关）

所有修复已提交 Git 并部署到生产环境。

### 覆盖的安全威胁

基于 [OWASP Top 10](https://owasp.org/www-project-top-ten/)，NaviHive 防护以下威胁：

| OWASP 威胁 | NaviHive 防护措施 | 状态 |
|-----------|------------------|------|
| A01: 访问控制失效 | JWT 认证 + 权限验证 | ✅ 已防护 |
| A02: 加密失败 | bcrypt + HTTPS + HttpOnly Cookie | ✅ 已防护 |
| A03: 注入攻击 | 参数化查询 + 输入验证 | ✅ 已防护 |
| A04: 不安全设计 | 速率限制 + 最小权限原则 | ✅ 已防护 |
| A05: 安全配置错误 | TypeScript 严格模式 + CORS | ✅ 已防护 |
| A06: 危险组件 | 定期更新依赖 | ✅ 已防护 |
| A07: 认证失败 | 强密码 + JWT + 速率限制 | ✅ 已防护 |
| A08: 数据完整性失败 | 请求签名 + 输入验证 | ✅ 已防护 |
| A09: 日志失败 | 结构化日志 + 唯一错误 ID | ✅ 已防护 |
| A10: SSRF | URL 白名单 + IP 过滤 | ✅ 已防护 |

## 核心安全特性

### 1. 认证与授权

#### JWT 令牌系统（CR-001 + HS-001）

**签名算法**：
- 使用 Web Crypto API（浏览器原生加密）
- HMAC-SHA256 算法
- 加密密钥存储在环境变量（`AUTH_SECRET`）

**令牌存储**：
- **主存储**：HttpOnly Cookie（防止 XSS 攻击窃取）
- **备用存储**：localStorage（向后兼容）
- Cookie 属性：
  - `HttpOnly`：JavaScript 无法访问
  - `Secure`：仅 HTTPS 传输（生产环境）
  - `SameSite=Lax`：防止 CSRF 攻击

**令牌有效期**：
- 标准模式：7 天
- "记住我" 模式：30 天
- 过期后自动失效，需重新登录

**安全优势**：
```
传统 localStorage 存储：
  ❌ XSS 可窃取令牌
  ❌ JavaScript 可访问
  ❌ 跨站点脚本风险

HttpOnly Cookie 存储：
  ✅ JavaScript 无法访问
  ✅ 浏览器自动管理
  ✅ 防止 XSS 窃取
  ✅ 自动随请求发送
```

[了解更多 →](/zh/security/authentication)

#### 密码安全（HS-003）

**哈希算法**：
- bcrypt-edge（Cloudflare Workers 优化版本）
- 10 轮盐值（2^10 = 1024 次迭代）
- 每个密码使用唯一盐值

**密码策略**：
- 永不存储明文密码
- 使用 `pnpm hash-password` 生成哈希
- 推荐使用强密码（12+ 字符，包含大小写、数字、符号）

**示例**：
```bash
# 生成密码哈希
$ pnpm hash-password MySecurePass123!

# 输出（存储到 AUTH_PASSWORD）：
$2a$10$eVcX7Y8ZfQ.kJ9L3mN0pOe.rT1sU2vW3xX4yY5zZ6aA7bB8cC9dD0
```

**安全性对比**：
```
明文存储（不安全）：
  密码：MySecurePass123!
  ❌ 数据库泄露直接暴露密码

MD5/SHA1（不安全）：
  哈希：5f4dcc3b5aa765d61d8327deb882cf99
  ❌ 彩虹表可破解
  ❌ 无盐值，相同密码哈希相同

bcrypt（安全）：
  哈希：$2a$10$eVcX7Y8ZfQ.kJ9...
  ✅ 计算成本高，暴力破解困难
  ✅ 自动加盐，每次哈希不同
  ✅ 业界标准，久经考验
```

#### 速率限制（HS-002）

**限制规则**：
- 每 IP 地址 15 分钟内最多 5 次登录尝试
- 超限返回 429 状态码（Too Many Requests）
- 15 分钟后自动重置

**实现细节**：
- `SimpleRateLimiter` 类（内存存储）
- 基于客户端 IP 地址
- 记录尝试时间戳
- 自动清理过期记录

**防护效果**：
```
暴力破解攻击场景：
  攻击者每秒尝试 10 个密码
  无限制：1 小时可尝试 36,000 次
  有限制：15 分钟只能尝试 5 次

防护效率：99.99% 的攻击被阻止
```

[了解更多 →](/zh/security/rate-limiting)

### 2. 注入攻击防护

#### SQL 注入防护（CR-002）

**防护措施**：
- **参数化查询**：所有查询使用 D1 的 `.bind()` 方法
- **永不拼接**：永不使用字符串拼接构建 SQL
- **字段白名单**：仅允许预定义的字段操作

**安全实现示例**：
```typescript
// ❌ 不安全（永不使用）：
const sql = `SELECT * FROM sites WHERE name = '${userName}'`;
// 风险：userName = "'; DROP TABLE sites; --"

// ✅ 安全（使用参数化）：
const sql = `SELECT * FROM sites WHERE name = ?`;
const result = await db.prepare(sql).bind(userName).all();
// 参数自动转义，无法注入
```

**防护场景**：
- 用户输入：分组名、站点名、描述等
- 查询操作：WHERE、ORDER BY、LIMIT 子句
- 更新操作：SET 子句的字段值
- 删除操作：WHERE 条件

**测试案例**：
```javascript
// 尝试注入攻击
分组名输入：'; DROP TABLE groups; --
系统行为：作为普通字符串存储，不执行 SQL
结果：攻击失败 ✅
```

[了解更多 →](/zh/security/sql-injection)

#### XSS 防护（CR-003）

**多层防护**：

**1. React 自动转义**
- 所有用户输入在输出时自动 HTML 转义
- `<script>` 标签被转义为 `&lt;script&gt;`
- 事件处理器字符串被转义

**2. 自定义 CSS 过滤**
- 最大 50KB 限制
- 移除危险模式：
  - 协议：`javascript:`、`data:text/html`、`vbscript:`
  - 导入：`@import`（防止加载外部恶意样式）
  - 表达式：`expression()`（IE 特性，可执行 JS）
  - 绑定：`-moz-binding`（Firefox 特性，可执行 XBL）
  - 事件处理器：`onload`、`onerror` 等
  - 行为：`behavior:`（IE 特性）

**3. URL 验证**
- 仅允许 `https:` 和 `data:image/` 协议
- 阻止 `javascript:`、`data:text/html` 等危险协议

**示例攻击场景**：
```css
/* 攻击者尝试注入的 CSS */
body {
  background: url('javascript:alert("XSS")');
}

.hack {
  behavior: url(xss.htc);
}

@import 'javascript:alert("XSS")';

/* 系统过滤后 */
body {
  background: url(''); /* javascript: 被移除 */
}

.hack {
  /* behavior 整行被移除 */
}

/* @import 整行被移除 */
```

[了解更多 →](/zh/security/xss-protection)

### 3. SSRF 防护（CR-004）

**服务器端请求伪造（SSRF）防护**：

阻止攻击者通过提交恶意 URL，让服务器访问内部网络资源。

**URL 验证规则**：

**协议白名单**：
- ✅ 允许：`https:`
- ✅ 允许：`data:image/`（Base64 图片）
- ❌ 拒绝：`http:`（不安全）
- ❌ 拒绝：`file:`（本地文件）
- ❌ 拒绝：`ftp:`、`gopher:` 等

**IP 地址黑名单**：
- ❌ 本地回环：`127.0.0.1`、`localhost`、`::1`
- ❌ 私有 IPv4：
  - `10.0.0.0/8`（10.0.0.0 - 10.255.255.255）
  - `172.16.0.0/12`（172.16.0.0 - 172.31.255.255）
  - `192.168.0.0/16`（192.168.0.0 - 192.168.255.255）
- ❌ 链路本地：
  - `169.254.0.0/16`（169.254.0.0 - 169.254.255.255）
  - `fe80::/10`（IPv6 链路本地）
- ❌ 保留地址：`0.0.0.0/8`

**攻击场景示例**：
```javascript
// 攻击者尝试添加的站点 URL：
https://127.0.0.1/admin
http://192.168.1.1/router-admin
http://169.254.169.254/latest/meta-data/  // AWS 元数据

// 系统验证：
❌ 拒绝：包含私有 IP 地址
❌ 拒绝：协议不在白名单
❌ 拒绝：尝试访问内部服务

// 攻击失败 ✅
```

**防护效果**：
- 保护内部服务（数据库、管理面板）
- 保护云元数据服务（AWS、GCP、Azure）
- 保护路由器和 IoT 设备

[了解更多 →](/zh/security/ssrf-protection)

### 4. 其他安全措施

#### CORS 配置（HS-004）

- 白名单来源验证
- 自动允许同源请求
- 开发环境支持 workers.dev 子域名
- 凭证支持（cookie 传输）

#### 结构化错误处理（HS-005）

- 唯一错误 ID（追踪和调试）
- 用户友好消息（不泄露敏感信息）
- 详细服务端日志
- 请求上下文（路径、方法、IP）

#### TypeScript 严格模式（MS-001）

- 禁止隐式 any
- 严格空值检查
- 严格函数类型
- 禁止未检查的索引访问
- 修复 65+ 类型错误

#### 请求体大小限制（MS-005）

- 最大 1MB 请求体
- 防止内存耗尽攻击
- 超限返回 413 状态码

#### 深度数据验证（MS-007）

- 导入数据的完整验证
- 结构、类型、格式检查
- URL 格式验证
- 字段白名单

[了解所有安全措施 →](/zh/security/security-measures)

## 安全最佳实践

### 部署安全

**1. 使用强密码**
```bash
# 生成强密码（推荐 16+ 字符）
pnpm hash-password "Abc123!@#XYZ789$%^"

# ❌ 弱密码示例（不要使用）：
admin, 123456, password

# ✅ 强密码示例：
MyNav2025!SecurePass#
```

**2. 保护 AUTH_SECRET**
```jsonc
{
  "vars": {
    // ❌ 不安全（太短）：
    "AUTH_SECRET": "secret"

    // ✅ 安全（32+ 字符随机）：
    "AUTH_SECRET": "Kj9$mN2pQ8rT5vW1xZ4aC7bF0dG3hJ6"
  }
}
```

使用工具生成：https://randomkeygen.com/

**3. 定期更换密码**
- 建议每 3-6 个月更换管理员密码
- 怀疑密码泄露时立即更换

**4. 启用 HTTPS**
- Cloudflare Workers 默认启用 HTTPS
- 自定义域名确保 SSL 证书有效
- 永不使用 HTTP（不安全）

### 配置安全

**1. 最小权限原则**
```jsonc
{
  "vars": {
    // 如果仅自己使用，禁用访客模式
    "AUTH_REQUIRED_FOR_READ": "true",

    // 如果需要公开分享，启用访客模式并控制内容可见性
    "AUTH_REQUIRED_FOR_READ": "false"
  }
}
```

**2. 监控访问日志**
```bash
# 实时查看日志
wrangler tail

# 查看错误日志
wrangler tail --status error

# 查看特定时间范围
wrangler tail --since 1h
```

**3. 定期备份数据**
```bash
# 导出数据库（每周备份）
wrangler d1 export navigation-db --output=backup-$(date +%Y%m%d).sql

# 通过 UI 导出（每次重要操作前）
登录 → 导出数据 → 保存 JSON 文件
```

### 内容安全

**1. 验证添加的 URL**
- 仅添加信任的网站链接
- 避免短链接（无法预知目标）
- 检查 HTTPS 是否有效

**2. 谨慎使用自定义 CSS**
- 仅使用信任的 CSS 代码
- 避免复制未知来源的样式
- 测试后再应用到生产环境

**3. 控制公开内容**
- 敏感信息设为私有
- 内部工具链接设为私有
- 定期审查公开内容

### 网络安全

**1. Cloudflare 防火墙（可选）**
- 限制访问国家/地区
- 限制访问 IP 范围
- 启用 Bot 保护

**2. 访问控制（可选）**
- 使用 Cloudflare Access 添加额外认证层
- 要求邮箱验证或 SSO 登录

**3. DDoS 防护**
- Cloudflare 自动提供 DDoS 防护
- 速率限制已内置（登录 5次/15分钟）

[查看完整最佳实践 →](/zh/security/best-practices)

## 安全审计

### 自我审计清单

定期检查以下项目：

**认证安全**：
- [ ] 管理员密码使用强密码
- [ ] AUTH_SECRET 使用随机字符串（32+ 位）
- [ ] AUTH_PASSWORD 使用 bcrypt 哈希（非明文）
- [ ] 最近 6 个月内更换过密码

**配置安全**：
- [ ] wrangler.jsonc 不包含敏感信息
- [ ] wrangler.jsonc 未提交到公开仓库
- [ ] 环境变量正确配置
- [ ] 数据库 ID 保密

**内容安全**：
- [ ] 私有内容已设置为不公开
- [ ] 自定义 CSS 来源可信
- [ ] 添加的 URL 已验证

**访问安全**：
- [ ] 定期查看访问日志
- [ ] 无异常登录尝试
- [ ] 无异常 IP 访问

**数据安全**：
- [ ] 定期备份数据
- [ ] 备份文件安全存储
- [ ] 测试过数据恢复流程

### 漏洞报告

如果您发现安全漏洞，请**负责任地披露**：

**不要**：
- ❌ 在公开 Issue 中披露漏洞细节
- ❌ 在社交媒体上公开漏洞
- ❌ 利用漏洞攻击他人部署

**应该**：
- ✅ 发送邮件到：[安全邮箱]（项目维护者联系方式）
- ✅ 提供详细的复现步骤
- ✅ 给予合理的修复时间（30-90天）
- ✅ 等待修复后再公开披露

我们承诺：
- 24 小时内响应安全报告
- 认真对待每一个安全问题
- 修复后在更新日志中致谢（如您愿意）

## 安全更新

### 订阅安全通知

- **Watch GitHub 仓库**：接收所有安全更新
- **订阅 Releases**：仅接收版本发布通知
- **查看更新日志**：了解每次更新的安全修复

### 应用安全更新

当有安全更新时：

```bash
# 1. 查看更新日志
cat CHANGELOG.md

# 2. 备份数据
pnpm export  # 或通过 UI 导出

# 3. 更新代码
git pull origin main

# 4. 安装依赖
pnpm install

# 5. 执行迁移（如需要）
wrangler d1 execute navigation-db --file=migrations/xxx.sql

# 6. 重新部署
pnpm deploy

# 7. 验证功能
# 测试登录、CRUD 等核心功能
```

## 第三方安全评估

NaviHive 欢迎独立的安全评估和审计。如果您是安全研究人员或希望进行安全审计，请联系项目维护者。

## 合规性

NaviHive 设计时考虑以下合规要求：

- **GDPR**（欧盟数据保护）：支持数据导出和删除
- **CCPA**（加州消费者隐私）：支持数据访问和删除
- **SOC 2**（安全控制）：认证、日志、访问控制

注：具体合规性取决于您的部署和使用方式。

## 安全资源

### 学习资源

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Security Academy](https://portswigger.net/web-security)
- [Cloudflare Security Docs](https://developers.cloudflare.com/security/)

### 安全工具

- [Mozilla Observatory](https://observatory.mozilla.org/) - 网站安全扫描
- [Security Headers](https://securityheaders.com/) - HTTP 头检查
- [SSL Labs](https://www.ssllabs.com/ssltest/) - SSL 配置测试

## 总结

NaviHive 的安全架构提供：

- ✅ **14 项安全修复**：覆盖常见 Web 威胁
- ✅ **OWASP Top 10 防护**：业界标准安全实践
- ✅ **多层防护**：认证、授权、验证、过滤
- ✅ **定期更新**：持续改进安全性
- ✅ **透明披露**：详细的安全文档

通过遵循最佳实践和定期更新，您可以确保 NaviHive 部署的安全性。

如有安全问题，请查看 [安全常见问题](/zh/guide/faq#安全相关) 或联系维护者。
