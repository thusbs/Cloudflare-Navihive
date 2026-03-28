# 贡献指南

感谢您对 NaviHive 的关注！我们欢迎各种形式的贡献，无论是代码、文档、设计还是反馈。本指南将帮助您了解如何参与项目贡献。

## 贡献方式

### 报告 Bug

发现问题？帮助我们改进！

**提交 Bug 前**：
1. 搜索 [已有 Issues](https://github.com/zqq-nuli/Cloudflare-Navihive/issues)，确认问题未被报告
2. 确认问题可复现
3. 收集必要的信息（版本、环境、错误日志）

**提交 Bug 时**，请包含：
- **标题**：简短描述问题（如："登录后页面空白"）
- **环境信息**：
  - NaviHive 版本
  - Node.js 和 pnpm 版本
  - 浏览器和版本
  - 操作系统
- **复现步骤**：
  1. 第一步操作
  2. 第二步操作
  3. 观察到的问题
- **期望行为**：应该发生什么
- **实际行为**：实际发生了什么
- **截图/日志**：如果适用，提供截图或错误日志
- **额外信息**：其他可能有用的上下文

**Bug 模板示例**：
```markdown
## Bug 描述
登录成功后页面显示空白，无法加载任何内容。

## 环境
- NaviHive 版本：v1.1.0
- Node.js：v20.10.0
- pnpm：8.15.0
- 浏览器：Chrome 120.0.6099.129
- 操作系统：Windows 11

## 复现步骤
1. 访问 https://my-navihive.workers.dev
2. 点击右上角"登录"按钮
3. 输入正确的用户名和密码
4. 点击"登录"
5. 页面跳转后显示空白

## 期望行为
应该显示导航站主页，包含已添加的分组和站点。

## 实际行为
页面完全空白，没有任何内容显示。

## 截图
[附上空白页面截图]

## 浏览器控制台日志
```
Uncaught TypeError: Cannot read property 'groups' of undefined
    at App.tsx:42
```

## 额外信息
- 清除缓存后问题依旧
- 使用无痕模式也出现同样问题
- 数据库已正确初始化
```

[提交 Bug Report →](https://github.com/zqq-nuli/Cloudflare-Navihive/issues/new?template=bug_report.md)

### 功能建议

有好的想法？我们很乐意听！

**提交建议前**：
1. 搜索 [已有 Issues](https://github.com/zqq-nuli/Cloudflare-Navihive/issues)，确认功能未被提出
2. 思考功能的必要性和通用性
3. 考虑实现的可行性

**提交建议时**，请包含：
- **功能描述**：清晰描述建议的功能
- **使用场景**：为什么需要这个功能？解决什么问题？
- **建议实现**：如何实现（可选）
- **替代方案**：是否有其他解决方式？
- **优先级**：您认为的重要程度

**功能请求模板示例**：
```markdown
## 功能描述
添加站点搜索功能，允许用户快速查找已添加的网站。

## 使用场景
当用户添加了大量站点（100+）后，很难找到特定的网站。
搜索功能可以提高效率，特别是对于：
- 有大量站点的用户
- 记不清站点在哪个分组的用户
- 需要快速访问特定站点的用户

## 建议实现
1. 在页面顶部添加搜索框
2. 实时搜索站点名称、URL、描述
3. 高亮匹配结果
4. 支持键盘快捷键（如 Ctrl+K）

可选功能：
- 支持模糊搜索
- 搜索历史记录
- 按分组筛选

## 替代方案
1. 使用浏览器的页面搜索（Ctrl+F）
   - 缺点：无法搜索折叠的分组内容
2. 手动展开所有分组查找
   - 缺点：效率低，体验差

## 优先级
中等 - 对于高级用户很有用，但不影响基本功能。

## 愿意贡献
是的，我可以尝试实现此功能（如果需要帮助，请告知）。
```

[提交 Feature Request →](https://github.com/zqq-nuli/Cloudflare-Navihive/issues/new?template=feature_request.md)

### 改进文档

文档是项目的重要组成部分！

**可改进的方面**：
- 修正错别字和语法错误
- 改进不清晰的说明
- 添加缺失的文档
- 补充示例和截图
- 翻译文档到其他语言

**文档位置**：
- 主要文档：`docs/` 目录
- README：`README.md`
- 开发指南：`CLAUDE.md`
- 代码注释：源文件中的注释

**提交文档改进**：
1. Fork 仓库
2. 修改文档文件
3. 提交 Pull Request
4. 说明改进的内容

### 贡献代码

想要编写代码？太棒了！

**开始之前**：
1. 查看 [待办事项](https://github.com/zqq-nuli/Cloudflare-Navihive/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)（标记为 "good first issue" 的适合新手）
2. 在 Issue 中评论表明您想处理该问题（避免重复工作）
3. 等待维护者确认和指导

**代码贡献类型**：
- 修复 Bug
- 实现新功能
- 性能优化
- 代码重构
- 添加测试

[查看开发流程 →](#开发流程)

### 设计贡献

擅长设计？帮助改进 UI/UX！

**可贡献的设计**：
- UI 改进建议
- 图标和 Logo 设计
- 主题和配色方案
- 用户体验优化
- 原型和线框图

**提交方式**：
- 在 Issue 中附上设计稿
- 提供 Figma、Sketch 等设计文件链接
- 详细说明设计思路

### 推广项目

帮助更多人了解 NaviHive！

**推广方式**：
- ⭐ Star 项目（GitHub）
- 分享到社交媒体
- 撰写使用教程
- 录制视频教程
- 在论坛推荐

## 开发流程

### 1. Fork 和克隆

```bash
# 1. 在 GitHub 上 Fork 仓库
# 点击右上角 "Fork" 按钮

# 2. 克隆您的 Fork
git clone https://github.com/YOUR_USERNAME/Cloudflare-Navihive.git

# 3. 进入项目目录
cd Cloudflare-Navihive

# 4. 添加上游仓库
git remote add upstream https://github.com/zqq-nuli/Cloudflare-Navihive.git

# 5. 验证远程仓库
git remote -v
# 应该看到：
# origin    https://github.com/YOUR_USERNAME/Cloudflare-Navihive.git (fetch)
# origin    https://github.com/YOUR_USERNAME/Cloudflare-Navihive.git (push)
# upstream  https://github.com/zqq-nuli/Cloudflare-Navihive.git (fetch)
# upstream  https://github.com/zqq-nuli/Cloudflare-Navihive.git (push)
```

### 2. 创建分支

```bash
# 1. 确保在 main 分支
git checkout main

# 2. 同步最新代码
git pull upstream main

# 3. 创建功能分支（命名规范）
git checkout -b feature/your-feature-name  # 新功能
git checkout -b fix/bug-description        # Bug 修复
git checkout -b docs/improvement           # 文档改进
git checkout -b refactor/component-name    # 代码重构

# 示例：
git checkout -b feature/search-sites
git checkout -b fix/login-blank-page
git checkout -b docs/deployment-guide
```

### 3. 开发环境设置

```bash
# 1. 安装依赖
pnpm install

# 2. 创建 .env 文件（可选）
echo "VITE_USE_REAL_API=false" > .env

# 3. 启动开发服务器
pnpm dev

# 浏览器访问：http://localhost:5173
```

### 4. 编写代码

**代码规范**：

**TypeScript**：
- 使用严格模式
- 明确的类型定义（避免 any）
- 优先使用接口（interface）而非类型别名（type）

**React**：
- 函数组件 + Hooks
- 组件文件使用 PascalCase（如 `SiteCard.tsx`）
- Props 接口命名为 `ComponentNameProps`

**样式**：
- 优先使用 Tailwind CSS 类
- 复杂样式使用 Material UI 的 `sx` prop
- 避免内联样式（除非动态计算）

**命名规范**：
- 变量/函数：camelCase（`getUserData`）
- 组件：PascalCase（`SiteCard`）
- 常量：UPPER_SNAKE_CASE（`API_BASE_URL`）
- 文件：与导出内容一致

**示例代码**：
```typescript
// ✅ 好的代码示例
interface SiteCardProps {
  site: Site;
  onEdit: (site: Site) => void;
  onDelete: (id: number) => void;
}

const SiteCard: React.FC<SiteCardProps> = ({ site, onEdit, onDelete }) => {
  const handleClick = () => {
    console.log('Site clicked:', site.name);
  };

  return (
    <Card sx={{ minWidth: 200 }}>
      <CardContent>
        <Typography variant="h6">{site.name}</Typography>
        <Typography variant="body2">{site.description}</Typography>
      </CardContent>
      <CardActions>
        <Button onClick={() => onEdit(site)}>编辑</Button>
        <Button onClick={() => onDelete(site.id)}>删除</Button>
      </CardActions>
    </Card>
  );
};

export default SiteCard;
```

**注释规范**：
```typescript
/**
 * 获取用户的所有站点
 * @param userId - 用户 ID
 * @returns 站点列表
 */
async function getUserSites(userId: number): Promise<Site[]> {
  // TODO: 添加缓存
  const sites = await api.getSites(userId);
  return sites.filter(site => site.isActive);
}
```

### 5. 测试更改

**本地测试**：
```bash
# 1. 类型检查
pnpm type-check

# 2. 代码检查
pnpm lint

# 3. 格式检查
pnpm format:check

# 4. 构建测试
pnpm build

# 5. 预览构建
pnpm preview
```

**功能测试**：
- 测试新功能是否正常工作
- 测试是否影响现有功能
- 测试不同浏览器（Chrome、Firefox、Safari）
- 测试响应式布局（桌面、平板、手机）

**边界测试**：
- 空数据
- 大量数据
- 特殊字符
- 网络错误

### 6. 提交更改

**Commit 规范**（遵循 [Conventional Commits](https://www.conventionalcommits.org/)）：

```bash
# 格式：
<type>(<scope>): <subject>

# type 类型：
feat:     新功能
fix:      Bug 修复
docs:     文档更新
style:    代码格式（不影响功能）
refactor: 代码重构
perf:     性能优化
test:     测试相关
chore:    构建/工具/依赖更新

# 示例：
git add .
git commit -m "feat(search): 添加站点搜索功能"
git commit -m "fix(login): 修复登录后页面空白问题"
git commit -m "docs(deployment): 补充自定义域名部署说明"
git commit -m "refactor(api): 优化 API 客户端错误处理"
```

**好的 Commit 消息**：
```bash
# ✅ 好的示例（清晰、具体）
feat(search): 添加站点搜索功能，支持实时搜索和高亮
fix(auth): 修复登录失败后 token 未清除的问题
docs(security): 补充 SSRF 防护说明和示例

# ❌ 不好的示例（模糊、笼统）
update code
fix bug
改了一些东西
```

**Commit 原则**：
- 一个 Commit 做一件事
- 消息清晰描述改动
- 使用现在时（"添加"而非"添加了"）
- 首字母小写

### 7. 推送代码

```bash
# 1. 推送到您的 Fork
git push origin feature/your-feature-name

# 2. 如果推送失败（分支已存在且有冲突）
git pull --rebase origin feature/your-feature-name
git push origin feature/your-feature-name
```

### 8. 创建 Pull Request

**在 GitHub 上**：
1. 访问您的 Fork 仓库
2. 点击 "Compare & pull request" 按钮
3. 填写 PR 标题和描述

**PR 标题格式**：
```
<type>: <简短描述>

示例：
feat: 添加站点搜索功能
fix: 修复登录后页面空白
docs: 改进部署文档
```

**PR 描述模板**：
```markdown
## 变更内容
简要描述此 PR 的改动。

## 关联 Issue
Fixes #123
Closes #456

## 变更类型
- [ ] Bug 修复
- [x] 新功能
- [ ] 文档更新
- [ ] 代码重构
- [ ] 性能优化

## 测试
描述如何测试这些更改：
1. 启动开发服务器
2. 访问搜索功能
3. 输入关键词搜索
4. 验证搜索结果正确

## 截图（如适用）
[附上功能截图]

## 检查清单
- [x] 代码遵循项目规范
- [x] 已进行自测
- [x] 已更新相关文档
- [x] 通过 lint 检查
- [x] 通过构建测试
- [x] 提交消息符合规范

## 额外说明
此功能支持实时搜索，无需点击搜索按钮。
```

### 9. Code Review

维护者会审查您的 PR，可能会：
- 提出修改建议
- 要求补充测试
- 要求改进文档

**响应 Review**：
```bash
# 1. 根据反馈修改代码
# ... 编辑文件 ...

# 2. 提交修改
git add .
git commit -m "refactor: 根据 review 改进搜索性能"

# 3. 推送更新
git push origin feature/your-feature-name

# PR 会自动更新
```

**Review 礼仪**：
- 保持友好和专业
- 虚心接受建议
- 解释您的设计决策
- 感谢审查者的时间

### 10. 合并后

PR 合并后：

```bash
# 1. 切换到 main 分支
git checkout main

# 2. 同步上游更新
git pull upstream main

# 3. 更新您的 Fork
git push origin main

# 4. 删除功能分支（可选）
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

## 开发提示

### 使用 Mock 模式开发

默认情况下，`pnpm dev` 使用 Mock API，无需后端：

```typescript
// src/API/mock.ts
// 模拟数据存储在内存中，重启后重置
```

**优势**：
- 快速启动，无需配置 D1
- 独立开发，不依赖后端
- 数据可控，易于测试边界情况

### 使用真实 API 开发

如需连接真实后端：

```bash
# 1. 创建 .env 文件
echo "VITE_USE_REAL_API=true" > .env

# 2. 确保 D1 数据库已配置
wrangler d1 create navigation-db --local
wrangler d1 execute navigation-db --local --file=schema.sql

# 3. 启动开发服务器（会同时启动 Workers）
pnpm dev
```

### 调试技巧

**前端调试**：
- 使用浏览器开发者工具
- React DevTools 扩展
- `console.log` 和 `debugger`

**后端调试**：
```bash
# 查看 Worker 日志
wrangler tail

# 本地调试 Worker
wrangler dev
```

**常见问题**：
- **端口占用**：修改 `vite.config.ts` 中的端口
- **CORS 错误**：检查 Worker 的 CORS 配置
- **类型错误**：运行 `pnpm type-check` 查看详情

### 性能优化建议

- 使用 `React.memo` 避免不必要的重渲染
- 使用 `useMemo` 和 `useCallback` 缓存计算和函数
- 避免在循环中创建新对象/数组
- 使用虚拟滚动处理大量数据

### 代码组织

```
src/
├── components/       # React 组件
│   ├── GroupCard.tsx
│   └── SiteCard.tsx
├── API/             # API 客户端
│   ├── client.ts    # 真实 API
│   ├── mock.ts      # Mock API
│   └── http.ts      # 类型定义
├── hooks/           # 自定义 Hooks（未来）
├── utils/           # 工具函数（未来）
└── App.tsx          # 主应用
```

## 行为准则

### 我们的承诺

为了营造开放和友好的环境，我们承诺：

- **包容**：尊重不同的观点和经验
- **友好**：使用温和友好的语言
- **专业**：专注于项目和技术本身
- **协作**：建设性地提供和接受反馈
- **责任**：承担并学习错误

### 不可接受的行为

- 攻击性、侮辱性或贬损性言论
- 骚扰、跟踪或侵犯隐私
- 发布他人私人信息
- 其他不道德或不专业的行为

### 执行

违反行为准则的情况将由项目维护者处理，可能导致：
- 警告
- 临时禁止参与
- 永久禁止参与

## 许可协议

贡献代码即表示您同意将代码以项目相同的许可证（MIT License）发布。

## 获得帮助

遇到问题？

- **技术问题**：在 Issue 中提问
- **讨论想法**：在 [Discussions](https://github.com/zqq-nuli/Cloudflare-Navihive/discussions) 中讨论
- **即时沟通**：（未来可能添加 Discord/Slack）

## 致谢

感谢所有贡献者！您的贡献让 NaviHive 变得更好。

贡献者名单：[Contributors](https://github.com/zqq-nuli/Cloudflare-Navihive/graphs/contributors)

---

**准备好开始了吗？**

1. [查看待办事项](https://github.com/zqq-nuli/Cloudflare-Navihive/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
2. Fork 仓库
3. 开始编码！

我们期待您的贡献！
