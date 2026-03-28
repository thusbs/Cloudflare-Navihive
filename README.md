<div align="center">

<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M60 10L105 35V85L60 110L15 85V35L60 10Z" fill="url(#paint0_linear)" stroke="#2D6CDF" stroke-width="2"/>
  <path d="M60 30L80 40V75L60 85L40 75V40L60 30Z" fill="white" stroke="#2D6CDF" stroke-width="2"/>
  <circle cx="60" cy="57" r="10" fill="#2D6CDF"/>
  <path d="M60 43V57L68 65" stroke="white" stroke-width="3" stroke-linecap="round"/>
  <defs>
    <linearGradient id="paint0_linear" x1="15" y1="60" x2="105" y2="60" gradientUnits="userSpaceOnUse">
      <stop stop-color="#61DAFB"/>
      <stop offset="1" stop-color="#2D6CDF"/>
    </linearGradient>
  </defs>
</svg>

# NaviHive - 现代化个人导航站

![NaviHive 导航站](https://img.shields.io/badge/NaviHive-导航站-blue)
![React](https://img.shields.io/badge/React-19.0.0-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6)
![Material UI](https://img.shields.io/badge/Material_UI-7.0-0081cb)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-f38020)
![License](https://img.shields.io/badge/License-MIT-green)

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/thusbs/Cloudflare-Navihive)

**一个优雅、现代化的网站导航管理系统**
基于 Cloudflare Workers 构建 • 零成本部署 • 全球 CDN 加速 • 企业级安全

[📖 完整文档](https://zqq-nuli.github.io/Cloudflare-Navihive/) • [🎮 在线演示](https://navihive.chatbot.cab/) • [🚀 快速开始](https://zqq-nuli.github.io/Cloudflare-Navihive/deployment/) • [💬 问题反馈](https://github.com/zqq-nuli/Cloudflare-Navihive/issues)

</div>

> 部署过程中遇到问题，暂时可参阅 V1.1.0版本[部署教程](https://github.com/zqq-nuli/Cloudflare-Navihive/tree/v1.1.0)暂时我可能没有那么多时间来修正文档的问题，实在抱歉。

## 🎯 快速开始

### 在线演示

访问演示站点体验所有功能：[navihive.chatbot.cab](https://navihive.chatbot.cab/)

```
👤 演示账号：admin
🔑 演示密码：NaviHive2025!
```

### 立即部署

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/thusbs/Cloudflare-Navihive)

按钮适合快速创建初始项目，但 D1 数据库、认证变量和首次数仓初始化仍然需要手动补齐。

> 先说明一件最容易走错的事：NaviHive 是一个 **Cloudflare Workers 项目**，不是纯静态的 Pages 项目。  
> 虽然 Cloudflare 控制台入口叫 `Workers & Pages`，但这个仓库请按 **Workers / Workers Builds** 的方式部署；不要把它当成普通 Pages 静态站点来创建。

#### 一键部署的文字版完整流程

1. 先决定你走哪条入口  
   如果你点击上面的 `Deploy to Cloudflare Workers` 按钮，Cloudflare 会走 **Deploy Button** 流程，通常会在你的 GitHub 账号下创建并连接一个新仓库，然后给这个 Worker 开启自动部署。  
   如果你 **不想让 Cloudflare 新建 GitHub 仓库**，请不要只依赖按钮，改走 Cloudflare Dashboard 手动导入现有仓库：  
   `Workers & Pages > Overview > Create application > Workers > Import a repository`。  
   手动导入时，直接选择现有仓库 `thusbs/Cloudflare-Navihive` 和生产分支 `main`。

2. 在 Dashboard 里选对项目类型  
   Cloudflare 控制台虽然叫 `Workers & Pages`，但这个仓库应该创建成 **Worker**。  
   如果你看到的是典型的 Pages 静态站点向导，请退回上一步，重新选择 **Workers**，不要创建 Pages 项目。

3. Git / 项目基础字段怎么填  

   | Cloudflare 表单项 | 建议填写 | 说明 |
   | --- | --- | --- |
   | `Git account` | 你的 GitHub 账号，例如 `thusbs` | 这里选你有仓库权限的账号 |
   | `Git repository` | `thusbs/Cloudflare-Navihive` | 推荐直接导入现有仓库 |
   | `Production branch` | `main` | 后续推送到 `main` 会自动部署 |
   | `Project name` | `navihive` | 推荐和 `wrangler.jsonc` 中的 `name` 保持一致 |

4. D1 数据库相关字段怎么填  

   | Cloudflare 表单项 | 建议填写 | 说明 |
   | --- | --- | --- |
   | `Select D1 database` | `+ Create new` | 首次部署通常新建一个 D1 |
   | `Name your D1 Database` | `navigation-db` | 也可以用 `navigation-db-local`，名字自定 |
   | `Database location hint` | 离主要用户最近的区域，或留默认 | 不确定时可以先留默认 |
   | `Binding name` | `DB` | 必须和代码里的 D1 绑定名一致 |

   如果你更习惯命令行，也可以先创建数据库，再把 `database_id` 填回 `wrangler.jsonc`：

   ```bash
   npx wrangler d1 create navigation-db
   ```

5. 认证相关参数怎么填  
   建议把普通开关类字段放在 Variables，把敏感字段放在 Secrets。  
   最少建议配置下面这些：

   | 变量名 | 示例值 | 说明 |
   | --- | --- | --- |
   | `AUTH_ENABLED` | `true` | 是否开启登录认证 |
   | `AUTH_REQUIRED_FOR_READ` | `false` | 设为 `false` 时，公开读接口可匿名访问 |
   | `AUTH_USERNAME` | `linuxdo` 或 `admin` | 登录用户名 |
   | `AUTH_PASSWORD` | `$2b$10$...` | **必须是 bcrypt 哈希，不能填明文密码** |
   | `AUTH_SECRET` | `32 位以上随机字符串` | JWT 签名密钥，不要和密码相同 |

   如果你原本打算把下面这些值直接填到 Cloudflare：

   ```text
   AUTH_ENABLED=true
   AUTH_USERNAME=linuxdo
   AUTH_PASSWORD=linuxdo
   AUTH_SECRET=linuxdo
   ```

   那么其中只有 `AUTH_ENABLED=true` 和 `AUTH_USERNAME=linuxdo` 可以直接用。  
   `AUTH_PASSWORD=linuxdo` 是错误填法，必须先生成 bcrypt 哈希；`AUTH_SECRET=linuxdo` 也不安全，至少应替换成 32 位以上随机字符串。

6. 先生成 `AUTH_PASSWORD` 和 `AUTH_SECRET`  
   生成 bcrypt 哈希：

   ```bash
   pnpm hash-password linuxdo
   ```

   生成随机密钥：

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   然后把结果填到 Cloudflare，或者写入本地 `wrangler.jsonc` 的 `vars` / secrets 配置中。  
   一个推荐示例：

   ```jsonc
   "vars": {
     "AUTH_ENABLED": "true",
     "AUTH_REQUIRED_FOR_READ": "false",
     "AUTH_USERNAME": "linuxdo",
     "AUTH_PASSWORD": "$2b$10$请替换成你生成的哈希",
     "AUTH_SECRET": "请替换成32位以上随机字符串"
   }
   ```

7. 本地 `wrangler.jsonc` 需要同步修改  
   当前仓库根目录的 `wrangler.jsonc` 至少要确认这三部分：

   ```jsonc
   {
     "name": "navihive",
     "main": "worker/index.ts",
     "d1_databases": [
       {
         "binding": "DB",
         "database_name": "navigation-db",
         "database_id": "你的-d1-database-id"
       }
     ],
     "vars": {
       "AUTH_ENABLED": "true",
       "AUTH_REQUIRED_FOR_READ": "false",
       "AUTH_USERNAME": "linuxdo",
       "AUTH_PASSWORD": "$2b$10$...",
       "AUTH_SECRET": "32位以上随机字符串"
     }
   }
   ```

   不要把真实生产密码、真实哈希和真实密钥提交到公开仓库。  
   生产环境更推荐在 Cloudflare Dashboard 里单独维护 Variables / Secrets。

8. Build / Deploy 命令怎么填  
   这个项目在 Cloudflare 上推荐这样填：

   | Cloudflare 表单项 | 建议填写 | 说明 |
   | --- | --- | --- |
   | `Build command` | `npm run build` | 先执行 TypeScript 检查和 Vite 构建 |
   | `Deploy command` | `npx wrangler deploy` | 推荐直接部署 Worker |

   不建议在 Cloudflare 表单里把 `Deploy command` 填成 `npm run deploy`，因为当前仓库脚本里会再次触发构建，容易重复执行。

9. 初始化数据库表  
   NaviHive 默认会创建 `3` 张表：
   - `groups`
   - `sites`
   - `configs`

   你有两种初始化方式。

   第一种：直接执行仓库里的 SQL 文件，最省事：

   ```bash
   npx wrangler d1 execute DB --remote --file=./init_table.sql --yes
   ```

   第二种：在 Cloudflare Dashboard 里手动执行 SQL。  
   路径通常是：`Workers & Pages > D1 > 你的数据库 > Console`，然后执行下面这段建表语句：

   ```sql
   CREATE TABLE IF NOT EXISTS groups (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       name TEXT NOT NULL,
       order_num INTEGER NOT NULL,
       is_public INTEGER DEFAULT 1,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE IF NOT EXISTS sites (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       group_id INTEGER NOT NULL,
       name TEXT NOT NULL,
       url TEXT NOT NULL,
       icon TEXT,
       description TEXT,
       notes TEXT,
       order_num INTEGER NOT NULL,
       is_public INTEGER DEFAULT 1,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
   );

   CREATE TABLE IF NOT EXISTS configs (
       key TEXT PRIMARY KEY,
       value TEXT NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   INSERT INTO configs (key, value) VALUES ('DB_INITIALIZED', 'true');
   ```

   初始化完成后，可以用下面这条命令检查表是否已经创建成功：

   ```bash
   npx wrangler d1 execute DB --remote --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
   ```

   如果你是旧库升级，而不是新建空库，再额外执行迁移：

   ```bash
   npx wrangler d1 execute DB --remote --file=./migrations/002_add_is_public.sql --yes
   ```

   这一步会补充 `groups.is_public`、`sites.is_public`，并创建对应索引。  
   如果你习惯在 D1 Console 里手动执行，升级 SQL 如下：

   ```sql
   ALTER TABLE groups ADD COLUMN is_public INTEGER DEFAULT 1;
   ALTER TABLE sites ADD COLUMN is_public INTEGER DEFAULT 1;

   CREATE INDEX IF NOT EXISTS idx_groups_is_public ON groups(is_public);
   CREATE INDEX IF NOT EXISTS idx_sites_is_public ON sites(is_public);
   ```

10. 重新触发部署  
    如果项目已经连接到 GitHub，直接把配置提交到 `main`，Cloudflare 会自动重新部署。  
    如果你想本地手动部署，也可以执行：

    ```bash
    npm run build
    npx wrangler deploy
    ```

11. 验证是否成功  
    打开 Cloudflare 分配的 `*.workers.dev` 地址，确认首页可以访问、登录可用、站点和分组可以正常读写。  
    首次登录时使用你在 `AUTH_USERNAME` 中设置的用户名，以及生成哈希前的原始密码。

> 详细说明见[完整部署指南](https://zqq-nuli.github.io/Cloudflare-Navihive/deployment/)

---

## 📖 完整文档

### 📚 用户指南
- [**项目介绍**](https://zqq-nuli.github.io/Cloudflare-Navihive/introduction) - 了解 NaviHive 的特点和优势
- [**为什么选择 NaviHive**](https://zqq-nuli.github.io/Cloudflare-Navihive/guide/why-navihive) - 与其他方案的对比
- [**功能截图**](https://zqq-nuli.github.io/Cloudflare-Navihive/guide/screenshots) - 11 张精美功能截图展示
- [**常见问题**](https://zqq-nuli.github.io/Cloudflare-Navihive/guide/faq) - FAQ 和故障排除
- [**更新日志**](https://zqq-nuli.github.io/Cloudflare-Navihive/guide/changelog) - 版本历史和变更记录

### 🔧 开发者文档
- [**部署指南**](https://zqq-nuli.github.io/Cloudflare-Navihive/deployment/) - 详细的部署步骤
- [**架构设计**](https://zqq-nuli.github.io/Cloudflare-Navihive/architecture/) - 技术栈和系统架构
- [**API 文档**](https://zqq-nuli.github.io/Cloudflare-Navihive/api/) - RESTful API 参考
- [**安全指南**](https://zqq-nuli.github.io/Cloudflare-Navihive/security/) - 14+ 安全加固说明
- [**贡献指南**](https://zqq-nuli.github.io/Cloudflare-Navihive/contributing/) - 如何参与项目

### 🎯 功能特性
- [**功能概览**](https://zqq-nuli.github.io/Cloudflare-Navihive/features/) - 完整功能列表和说明

> 📝 访问 [NaviHive 文档站点](https://zqq-nuli.github.io/Cloudflare-Navihive/) 查看完整文档

---

## 🛠️ 技术栈

**前端**: React 19 • TypeScript 5.7 • Material UI 7.0 • Tailwind CSS 4.1 • DND Kit • Vite 6

**后端**: Cloudflare Workers • Cloudflare D1 (SQLite) • JWT + bcrypt • TypeScript Strict Mode

**开发**: pnpm • Wrangler CLI • ESLint + Prettier

## 🤝 贡献

欢迎所有形式的贡献！查看 [贡献指南](https://zqq-nuli.github.io/Cloudflare-Navihive/contributing/) 了解如何参与项目。

---

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源协议发布。

---

## 🙏 致谢

感谢以下开源项目和服务：

- [React](https://reactjs.org/) • [TypeScript](https://www.typescriptlang.org/) • [Vite](https://vitejs.dev/)
- [Material UI](https://mui.com/) • [DND Kit](https://dndkit.com/) • [Tailwind CSS](https://tailwindcss.com/)
- [Cloudflare Workers](https://workers.cloudflare.com/) • [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Claude Code](https://claude.ai/code) • [Cursor](https://www.cursor.com)

感谢所有提交 Issue、PR 和 Star 的开发者们！🌟

---


### 🤝 其他支持方式
- 💬 提交有价值的 Issue 和 Feature Request
- 📝 改进文档和教程
- 🐛 报告 Bug 并提供复现步骤
- 💻 贡献代码（欢迎提交 PR）

---

## 📈 Star History

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=zqq-nuli/Cloudflare-Navihive&type=Date&theme=dark" />
  <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=zqq-nuli/Cloudflare-Navihive&type=Date" />
  <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=zqq-nuli/Cloudflare-Navihive&type=Date" />
</picture>

<div align="center">

## 🎉 让导航管理更简单

**NaviHive** - 你的专属网络导航中心

[立即部署](https://deploy.workers.cloudflare.com/?url=https://github.com/zqq-nuli/Cloudflare-Navihive) • [在线演示](https://navihive.chatbot.cab/) • [完整文档](https://zqq-nuli.github.io/Cloudflare-Navihive/) • [提交问题](https://github.com/zqq-nuli/Cloudflare-Navihive/issues)

Made with ❤️ by [zqq-nuli](https://github.com/zqq-nuli)

⭐ 如果觉得有用，别忘了点个 Star 哦 ⭐

</div>
