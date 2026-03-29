# 批量导入

NaviHive 支持通过 JSON 格式批量导入网站和分组数据，方便快速迁移或初始化导航站点。

## 导入格式要求

批量导入使用 JSON 格式，包含 `groups` 和 `sites` 两个数组：

```json
{
  "groups": [
    {
      "name": "分组名称",
      "order_num": 1,
      "is_public": 1
    }
  ],
  "sites": [
    {
      "group_id": 1,
      "name": "网站名称",
      "url": "https://example.com",
      "icon": "https://example.com/favicon.ico",
      "description": "网站描述",
      "notes": "备注信息",
      "order_num": 1,
      "is_public": 1
    }
  ]
}
```

## 字段说明

### Groups（分组）字段

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `name` | string | ✅ | 分组名称 |
| `order_num` | number | ✅ | 排序序号，数字越小越靠前 |
| `is_public` | number | ❌ | 是否公开（1=公开，0=私有），默认为 1 |

### Sites（站点）字段

| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| `group_id` | number | ✅ | 所属分组 ID（对应 groups 数组的索引 + 1） |
| `name` | string | ✅ | 网站名称 |
| `url` | string | ✅ | 网站 URL，必须以 http:// 或 https:// 开头 |
| `icon` | string | ❌ | 网站图标 URL |
| `description` | string | ❌ | 网站描述 |
| `notes` | string | ❌ | 备注信息 |
| `order_num` | number | ✅ | 排序序号，数字越小越靠前 |
| `is_public` | number | ❌ | 是否公开（1=公开，0=私有），默认为 1 |

## 导入示例

### 示例 1：基础导入

```json
{
  "groups": [
    {
      "name": "常用工具",
      "order_num": 1,
      "is_public": 1
    },
    {
      "name": "开发资源",
      "order_num": 2,
      "is_public": 1
    }
  ],
  "sites": [
    {
      "group_id": 1,
      "name": "Google",
      "url": "https://www.google.com",
      "icon": "https://www.google.com/favicon.ico",
      "description": "全球最大的搜索引擎",
      "order_num": 1,
      "is_public": 1
    },
    {
      "group_id": 1,
      "name": "GitHub",
      "url": "https://github.com",
      "icon": "https://github.com/favicon.ico",
      "description": "全球最大的代码托管平台",
      "order_num": 2,
      "is_public": 1
    },
    {
      "group_id": 2,
      "name": "MDN Web Docs",
      "url": "https://developer.mozilla.org",
      "icon": "https://developer.mozilla.org/favicon.ico",
      "description": "Web 开发权威文档",
      "notes": "前端开发必备",
      "order_num": 1,
      "is_public": 1
    }
  ]
}
```

### 示例 2：Chrome 书签转换

如果你想从 Chrome 书签导入，可以使用项目提供的转换脚本：

```bash
# 1. 导出 Chrome 书签（Chrome 设置 > 书签 > 导出书签）
# 2. 使用转换脚本
python script/chromeToJSON.py bookmarks.html > import.json

# 3. 在 NaviHive 管理界面导入 import.json
```

### 示例 3：包含私有内容

```json
{
  "groups": [
    {
      "name": "公开资源",
      "order_num": 1,
      "is_public": 1
    },
    {
      "name": "私人收藏",
      "order_num": 2,
      "is_public": 0
    }
  ],
  "sites": [
    {
      "group_id": 1,
      "name": "Wikipedia",
      "url": "https://www.wikipedia.org",
      "description": "自由的百科全书",
      "order_num": 1,
      "is_public": 1
    },
    {
      "group_id": 2,
      "name": "内部文档",
      "url": "https://internal.company.com",
      "description": "公司内部文档系统",
      "notes": "仅限内部访问",
      "order_num": 1,
      "is_public": 0
    }
  ]
}
```

## 导入步骤

1. 准备符合格式要求的 JSON 文件
2. 登录 NaviHive 管理后台
3. 进入"站点设置"或"批量管理"页面
4. 点击"导入数据"按钮
5. 选择或粘贴 JSON 文件内容
6. 确认导入

## 注意事项

- `group_id` 必须对应 `groups` 数组中的分组（从 1 开始计数）
- URL 必须是有效的网址格式（http:// 或 https://）
- `order_num` 决定显示顺序，建议使用 1, 2, 3... 递增
- 导入会创建新数据，不会覆盖现有内容
- 建议先在测试环境验证 JSON 格式正确性

## 导入逻辑

### 智能合并策略

NaviHive 使用智能合并策略处理导入数据：

**分组处理**：
- 按名称匹配现有分组
- 如果分组名称已存在，复用现有分组 ID
- 如果分组名称不存在，创建新分组

**站点处理**：
- 按 URL 匹配现有站点
- 如果 URL 已存在，更新站点信息
- 如果 URL 不存在，创建新站点

**配置处理**：
- 完全替换现有配置
- 建议导入前备份当前配置

### 数据验证

导入前会进行严格的数据验证：

1. **结构验证**：检查 JSON 格式是否正确
2. **类型检查**：验证字段类型是否匹配
3. **URL 验证**：确保 URL 格式有效
4. **关联验证**：检查 group_id 是否有效
5. **大小限制**：单次导入不超过 1MB

### 错误处理

如果导入过程中遇到错误：

- 显示详细的错误信息
- 支持部分导入（跳过错误项）
- 提供错误日志下载
- 不会影响现有数据

## 导出数据

在导入前，建议先导出当前数据作为备份：

```json
{
  "version": "1.1.0",
  "exportDate": "2025-03-29",
  "groups": [...],
  "sites": [...],
  "configs": {...}
}
```

导出功能位于：设置 > 数据管理 > 导出数据

## 常见问题

### Q: 导入会覆盖现有数据吗？

A: 不会完全覆盖。导入使用智能合并策略：
- 分组按名称匹配，存在则复用
- 站点按 URL 匹配，存在则更新
- 不存在的数据会新建

### Q: 如何批量修改现有站点？

A: 
1. 先导出当前数据
2. 修改导出的 JSON 文件
3. 重新导入（会根据 URL 更新现有站点）

### Q: 导入失败怎么办？

A:
1. 检查 JSON 格式是否正确
2. 验证所有必填字段是否存在
3. 确认 URL 格式是否有效
4. 查看错误日志了解具体问题

### Q: 可以导入多少数据？

A: 
- 单次导入限制：1MB
- 建议分批导入大量数据
- 每批不超过 1000 个站点

### Q: 支持其他格式吗？

A: 目前仅支持 JSON 格式。如果你有其他格式的数据：
- CSV：可以使用在线工具转换为 JSON
- HTML 书签：使用 `script/chromeToJSON.py` 转换
- 其他格式：需要自行编写转换脚本

## 相关功能

- [数据导出](/zh/features/data-management#数据导出)
- [Chrome 书签转换](/zh/features/data-management#chrome-书签转换)
- [数据备份](/zh/features/data-management#数据备份)

## API 接口

如果你想通过 API 导入数据：

```bash
POST /api/import
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "groups": [...],
  "sites": [...]
}
```

详见 [API 文档](/zh/api/)。
