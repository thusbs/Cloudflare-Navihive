---
layout: home

hero:
  name: NaviHive
  text: Modern Personal Navigation
  tagline: Lightweight navigation management system powered by Cloudflare Workers
  image:
    src: /logo.svg
    alt: NaviHive
  actions:
    - theme: brand
      text: Get Started
      link: /en/guide/getting-started
    - theme: alt
      text: Live Demo
      link: https://navihive.chatbot.cab/
    - theme: alt
      text: GitHub
      link: https://github.com/zqq-nuli/Cloudflare-Navihive

features:
  - icon: 📚
    title: Smart Group Management
    details: Organize websites by category with unlimited groups and nested management
  - icon: 🔄
    title: Drag & Drop Sorting
    details: Visual adjustment of group and site order with WYSIWYG interaction
  - icon: 🌍
    title: Guest Mode
    details: Support for public/private content control, unauthenticated users can browse public content
  - icon: 🔐
    title: Enterprise-grade Security
    details: JWT + bcrypt encryption, HttpOnly Cookie, multi-layer security protection
  - icon: ⚡
    title: Ultimate Performance
    details: Cloudflare global CDN acceleration, millisecond response
  - icon: 💰
    title: Zero-cost Deployment
    details: Based on Cloudflare Workers free tier, forever free to use
  - icon: 🎨
    title: Highly Customizable
    details: Custom CSS, background images, themes - create your own navigation site
  - icon: 📱
    title: Perfectly Responsive
    details: Perfect adaptation from desktop to mobile, all screen sizes
  - icon: 🌓
    title: Dark Mode
    details: Free switching between dark/light themes, eye-friendly
---

## Quick Deployment

::: code-group

```bash [Beginner]
# 1. Fork the project to your GitHub
# 2. Click the Deploy to Cloudflare Workers button
# 3. Follow the wizard to complete deployment

# See Getting Started Guide for detailed steps
```

```bash [Developer]
# Clone the project
git clone https://github.com/zqq-nuli/Cloudflare-Navihive.git
cd Cloudflare-Navihive

# Install dependencies
pnpm install

# Login to Cloudflare
wrangler login

# Create database
wrangler d1 create navigation-db

# Deploy
pnpm deploy
```

:::

## Version Info

Current Version: **v1.1.0** | [Changelog](/en/guide/migration) | [GitHub Release](https://github.com/zqq-nuli/Cloudflare-Navihive/releases)

### v1.1.0 New Features

- ✨ Guest Mode: Public/private content control support
- 🛡️ Login Rate Limiting: Brute-force attack prevention
- 🔐 Enhanced Security: Comprehensive security hardening

---

<div style="text-align: center; margin-top: 48px;">

Made with ❤️ by [zqq-nuli](https://github.com/zqq-nuli)

[⭐ Star the Project](https://github.com/zqq-nuli/Cloudflare-Navihive) · [📝 Submit Issues](https://github.com/zqq-nuli/Cloudflare-Navihive/issues) · [🤝 Contribute](https://github.com/zqq-nuli/Cloudflare-Navihive/pulls)

</div>
