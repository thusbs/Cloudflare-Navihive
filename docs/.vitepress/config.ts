import { defineConfig } from 'vitepress';
import { zhConfig } from './zh';
import { enConfig } from './en';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  // 站点基本信息
  title: 'NaviHive',
  description: '现代化个人导航站 - Cloudflare Workers 驱动',

  // GitHub Pages 部署路径（仓库名称）
  base: '/Cloudflare-Navihive/',

  // 语言配置
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: zhConfig,
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      themeConfig: enConfig,
    },
  },

  // 主题配置
  themeConfig: {
    // Logo
    logo: '/logo.svg',

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/zqq-nuli/Cloudflare-Navihive' },
    ],

    // 搜索
    search: {
      provider: 'local',
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档',
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                },
              },
            },
          },
        },
      },
    },

    // 页脚
    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2025 NaviHive',
    },
  },

  // 头部配置
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/Cloudflare-Navihive/favicon.svg' }],
    ['link', { rel: 'alternate icon', href: '/Cloudflare-Navihive/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#2D6CDF' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'NaviHive 文档' }],
    ['meta', { property: 'og:description', content: '现代化个人导航站 - Cloudflare Workers 驱动' }],
  ],

  // Markdown 配置
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    lineNumbers: true,
  },

  // 构建配置
  vite: {
    server: {
      port: 5174, // 避免与主应用的 5173 冲突
    },
  },

  // 忽略死链检查（避免构建失败）
  // 设置为 true 以允许构建，或使用 'localhostLinks' 仅忽略 localhost 链接
  ignoreDeadLinks: true,

  // 最后更新时间
  lastUpdated: true,

  // 清理 URLs
  cleanUrls: true,
});
