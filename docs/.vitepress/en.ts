import { DefaultTheme } from 'vitepress';

export const enConfig: DefaultTheme.Config = {
  nav: [
    { text: 'Home', link: '/en/' },
    { text: 'Guide', link: '/en/guide/' },
    { text: 'Features', link: '/en/features/' },
    { text: 'API', link: '/en/api/' },
    { text: 'Deployment', link: '/en/deployment/' },
    {
      text: 'More',
      items: [
        { text: 'Security', link: '/en/security/' },
        { text: 'Advanced', link: '/en/advanced/' },
        { text: 'Contributing', link: '/en/contributing/' },
      ],
    },
    { text: 'Demo', link: 'https://navihive.chatbot.cab/' },
  ],

  sidebar: {
    '/en/guide/': [
      {
        text: 'User Guide',
        items: [
          { text: 'Overview', link: '/en/guide/' },
          { text: 'Getting Started', link: '/en/guide/getting-started' },
          { text: 'Installation', link: '/en/guide/installation' },
          { text: 'Deployment', link: '/en/guide/deployment' },
          { text: 'Usage', link: '/en/guide/usage' },
          { text: 'Migration', link: '/en/guide/migration' },
        ],
      },
    ],
    '/en/features/': [
      {
        text: 'Features',
        items: [
          { text: 'Overview', link: '/en/features/' },
          { text: 'Authentication', link: '/en/features/authentication' },
          { text: 'Guest Mode', link: '/en/features/guest-mode' },
          { text: 'Drag & Drop', link: '/en/features/drag-drop' },
          { text: 'Customization', link: '/en/features/customization' },
          { text: 'Import/Export', link: '/en/features/import-export' },
          { text: 'Themes', link: '/en/features/themes' },
        ],
      },
    ],
    '/en/api/': [
      {
        text: 'API Reference',
        items: [
          { text: 'Overview', link: '/en/api/' },
          { text: 'Authentication', link: '/en/api/authentication' },
          { text: 'Groups', link: '/en/api/groups' },
          { text: 'Sites', link: '/en/api/sites' },
          { text: 'Configs', link: '/en/api/configs' },
          { text: 'Types', link: '/en/api/types' },
        ],
      },
    ],
    '/en/deployment/': [
      {
        text: 'Deployment',
        items: [
          { text: 'Overview', link: '/en/deployment/' },
          { text: 'Cloudflare Workers', link: '/en/deployment/cloudflare' },
          { text: 'D1 Database Setup', link: '/en/deployment/database' },
          { text: 'Environment Variables', link: '/en/deployment/environment' },
          { text: 'Custom Domain', link: '/en/deployment/custom-domain' },
        ],
      },
    ],
    '/en/security/': [
      {
        text: 'Security',
        items: [
          { text: 'Overview', link: '/en/security/' },
          { text: 'Authentication', link: '/en/security/authentication' },
          { text: 'Best Practices', link: '/en/security/best-practices' },
          { text: 'Known Issues', link: '/en/security/vulnerabilities' },
        ],
      },
    ],
    '/en/advanced/': [
      {
        text: 'Advanced',
        items: [
          { text: 'Architecture', link: '/en/advanced/architecture' },
          { text: 'Database Schema', link: '/en/advanced/database-schema' },
          { text: 'Development', link: '/en/advanced/development' },
          { text: 'Troubleshooting', link: '/en/advanced/troubleshooting' },
        ],
      },
    ],
    '/en/contributing/': [
      {
        text: 'Contributing',
        items: [
          { text: 'Overview', link: '/en/contributing/' },
          { text: 'Code Style', link: '/en/contributing/code-style' },
          { text: 'Pull Request', link: '/en/contributing/pull-request' },
          { text: 'Testing', link: '/en/contributing/testing' },
        ],
      },
    ],
  },

  docFooter: {
    prev: 'Previous',
    next: 'Next',
  },

  outline: {
    label: 'On this page',
  },

  lastUpdated: {
    text: 'Last updated',
  },

  editLink: {
    pattern: 'https://github.com/zqq-nuli/Cloudflare-Navihive/edit/main/docs/:path',
    text: 'Edit this page on GitHub',
  },
};
