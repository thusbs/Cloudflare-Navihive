# NaviHive 文档站点

这是 NaviHive 项目的完整文档站点，使用 VitePress 构建。

## 本地开发

```bash
# 安装依赖（如果还没有安装）
pnpm install

# 启动开发服务器
pnpm docs:dev

# 访问 http://localhost:5174/Cloudflare-Navihive/
```

## 构建和预览

```bash
# 构建文档站点
pnpm docs:build

# 预览构建结果
pnpm docs:preview

# 访问 http://localhost:4173/Cloudflare-Navihive/
```

## 部署

文档站点会在每次推送到 `main` 分支时自动部署到 GitHub Pages。

### 手动触发部署

1. 进入 GitHub 仓库的 Actions 页面
2. 选择 "Deploy Documentation" 工作流
3. 点击 "Run workflow"

## 文档结构

```
docs/
├── .vitepress/          # VitePress 配置
│   ├── config.ts        # 主配置文件
│   ├── zh.ts            # 中文配置
│   ├── en.ts            # 英文配置
│   └── theme/           # 自定义主题
├── zh/                  # 中文文档
│   ├── guide/           # 用户指南
│   ├── features/        # 功能特性
│   ├── api/             # API 文档
│   ├── deployment/      # 部署文档
│   ├── security/        # 安全文档
│   ├── advanced/        # 高级主题
│   └── contributing/    # 贡献指南
└── en/                  # 英文文档（结构同上）
```

## 编写文档

1. 在对应的目录下创建或编辑 `.md` 文件
2. 使用 Markdown 语法编写内容
3. 保存后开发服务器会自动热更新

### 文档模板

```markdown
# 标题

正文内容...

## 二级标题

::: tip 提示
这是一个提示框
:::

::: warning 警告
这是一个警告框
:::

::: danger 危险
这是一个危险提示框
:::

\`\`\`javascript
// 代码示例
const example = 'Hello World';
\`\`\`
```

## 需要帮助？

- [VitePress 官方文档](https://vitepress.dev/)
- [Markdown 语法指南](https://www.markdownguide.org/)
