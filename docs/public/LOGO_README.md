# Logo 和 Favicon 文件说明

## 已创建的文件

### 1. logo.svg
- **位置**: `docs/public/logo.svg`
- **尺寸**: 200x200
- **用途**: VitePress 文档站点的 Logo（导航栏和首页）
- **设计**: 六边形蜂巢风格，NaviHive 品牌色渐变
- **特点**:
  - 外层渐变六边形（#61DAFB → #2D6CDF）
  - 内层白色六边形
  - 中心蓝色圆圈 + N 字母
  - 周围装饰点

### 2. favicon.svg
- **位置**: `docs/public/favicon.svg`
- **尺寸**: 32x32
- **用途**: 浏览器标签页图标（现代浏览器支持 SVG favicon）
- **设计**: logo.svg 的简化版本
- **优势**: 矢量图，任何尺寸都清晰

## 如果需要 favicon.ico（可选）

### 方式一：在线转换（推荐）

访问以下网站之一，上传 `favicon.svg`：

1. **favicon.io** - https://favicon.io/favicon-converter/
   - 上传 SVG
   - 生成多种尺寸的 .ico
   - 下载并放到 `docs/public/favicon.ico`

2. **RealFaviconGenerator** - https://realfavicongenerator.net/
   - 生成完整的 favicon 包
   - 包含各种设备的图标

3. **CloudConvert** - https://cloudconvert.com/svg-to-ico
   - 简单快速的转换工具

### 方式二：使用 ImageMagick（命令行）

如果已安装 ImageMagick：

```bash
# 转换 SVG 到 ICO（多尺寸）
magick convert favicon.svg -define icon:auto-resize=16,32,48,64,256 favicon.ico

# 或者从 PNG 转换
magick convert -background transparent favicon.png -define icon:auto-resize=16,32,48 favicon.ico
```

### 方式三：使用 Node.js 包

```bash
# 安装 sharp
npm install sharp

# 使用 Node.js 脚本转换
node -e "
const sharp = require('sharp');
sharp('favicon.svg')
  .resize(32, 32)
  .toFile('favicon.png')
  .then(() => console.log('转换完成'));
"
```

然后使用在线工具将 PNG 转为 ICO。

## 当前配置

VitePress 已配置为：

```typescript
head: [
  ['link', { rel: 'icon', type: 'image/svg+xml', href: '/Cloudflare-Navihive/favicon.svg' }],
  ['link', { rel: 'alternate icon', href: '/Cloudflare-Navihive/favicon.ico' }], // 备用
  // ...
]
```

**工作原理**：
- 现代浏览器：使用 `favicon.svg`（清晰、体积小）
- 旧版浏览器：回退到 `favicon.ico`（如果存在）

## 自定义 Logo

如果你想使用自己的 Logo：

### 替换 logo.svg

1. 准备你的 Logo（建议 SVG 格式）
2. 确保尺寸为 200x200 或等比例
3. 替换 `docs/public/logo.svg`
4. 重新构建：`pnpm docs:build`

### 替换 favicon

1. 准备 32x32 的图标
2. 替换 `docs/public/favicon.svg`（或创建 favicon.ico）
3. 清除浏览器缓存查看效果

## Logo 设计说明

当前 Logo 的设计理念：

- **六边形**: 代表蜂巢（NaviHive），象征信息的有序组织
- **渐变色**: 从青色到蓝色（#61DAFB → #2D6CDF），现代感
- **N 字母**: NaviHive 的首字母，简洁明了
- **装饰点**: 周围 6 个点，代表导航的 6 个方向

## 测试 Logo 显示

### 本地测试

```bash
# 启动开发服务器
pnpm docs:dev

# 访问 http://localhost:5174/Cloudflare-Navihive/
# 检查：
# 1. 左上角导航栏是否显示 Logo
# 2. 首页 Hero 区域是否显示 Logo
# 3. 浏览器标签页是否显示 favicon
```

### 生产环境测试

部署后访问：
```
https://zqq-nuli.github.io/Cloudflare-Navihive/
```

**注意**：浏览器会缓存 favicon，如果没有立即更新：
- 硬刷新：`Ctrl + Shift + R`（Windows/Linux）或 `Cmd + Shift + R`（macOS）
- 或清除浏览器缓存

## 文件清单

```
docs/public/
├── logo.svg              ✅ 已创建（站点 Logo）
├── favicon.svg           ✅ 已创建（标签页图标）
├── favicon.ico           ❌ 未创建（可选，旧浏览器支持）
├── LOGO_README.md        ✅ 本文件
└── images/
    └── screenshots/      📁 空目录（用于文档截图）
```

## 常见问题

### Q: 为什么不直接使用 favicon.ico？

A: SVG favicon 的优势：
- 矢量图，任何尺寸都清晰
- 文件体积更小（通常几 KB）
- 支持 CSS 动画和深色模式适配
- 现代浏览器（Chrome、Firefox、Safari、Edge）都支持

### Q: 需要为 iOS/Android 创建图标吗？

A: 如果需要支持"添加到主屏幕"功能，可以创建：
- `apple-touch-icon.png` (180x180)
- `android-chrome-192x192.png`
- `android-chrome-512x512.png`

可以使用 https://realfavicongenerator.net/ 一键生成所有平台的图标。

### Q: Logo 颜色可以自定义吗？

A: 可以！编辑 `logo.svg` 文件：
- 修改 `linearGradient` 中的颜色
- 或使用纯色替代渐变
- 保存后重新构建即可

---

**提示**: 当前 Logo 是自动生成的简单版本。如果需要更专业的设计，建议：
1. 使用 Figma/Illustrator 设计专业 Logo
2. 导出为 SVG 格式
3. 优化 SVG 代码（使用 SVGO 工具）
4. 替换现有文件
