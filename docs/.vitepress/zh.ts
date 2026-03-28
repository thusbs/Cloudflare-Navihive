import { DefaultTheme } from 'vitepress';

export const zhConfig: DefaultTheme.Config = {
  nav: [
    { text: '首页', link: '/' },
    { text: '指南', link: '/introduction' },
    { text: '功能', link: '/features/' },
    { text: '架构', link: '/architecture/' },
    { text: 'API', link: '/api/' },
    {
      text: '更多',
      items: [
        { text: '安全指南', link: '/security/' },
        { text: '部署指南', link: '/deployment/' },
        { text: '贡献指南', link: '/contributing/' },
        { text: '更新日志', link: '/guide/changelog' },
      ],
    },
    { text: '在线演示', link: 'https://navihive.chatbot.cab/' },
  ],

  sidebar: {
    '/': [
      {
        text: '开始使用',
        collapsed: false,
        items: [
          { text: '项目介绍', link: '/introduction' },
          { text: '为什么选择 NaviHive', link: '/guide/why-navihive' },
          { text: '功能截图', link: '/guide/screenshots' },
          { text: '常见问题', link: '/guide/faq' },
          { text: '更新日志', link: '/guide/changelog' },
        ],
      },
      {
        text: '核心功能',
        collapsed: false,
        items: [
          { text: '功能概览', link: '/features/' },
        ],
      },
      {
        text: '架构设计',
        collapsed: false,
        items: [
          { text: '架构概览', link: '/architecture/' },
        ],
      },
      {
        text: 'API 参考',
        collapsed: false,
        items: [
          { text: 'API 概览', link: '/api/' },
          { text: '认证 API', link: '/api/authentication' },
        ],
      },
      {
        text: '部署与安全',
        collapsed: false,
        items: [
          { text: '部署指南', link: '/deployment/' },
          { text: '安全指南', link: '/security/' },
        ],
      },
      {
        text: '参与贡献',
        collapsed: false,
        items: [
          { text: '贡献指南', link: '/contributing/' },
        ],
      },
    ],
  },

  docFooter: {
    prev: '上一页',
    next: '下一页',
  },

  outline: {
    label: '页面导航',
    level: [2, 3],
  },

  lastUpdated: {
    text: '最后更新于',
    formatOptions: {
      dateStyle: 'short',
      timeStyle: 'medium',
    },
  },

  darkModeSwitchLabel: '主题',
  sidebarMenuLabel: '菜单',
  returnToTopLabel: '回到顶部',

  editLink: {
    pattern: 'https://github.com/zqq-nuli/Cloudflare-Navihive/edit/main/docs/:path',
    text: '在 GitHub 上编辑此页面',
  },
};
