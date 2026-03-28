# API 文档

NaviHive 提供了一套 RESTful API 接口，用于管理导航站的数据。

## API 端点

所有 API 端点都以 `/api/` 为前缀。

### 认证相关

- `POST /api/login` - 用户登录
- `GET /api/auth/status` - 检查认证状态

### 分组管理

- `GET /api/groups` - 获取所有分组
- `POST /api/groups` - 创建新分组
- `PUT /api/groups/:id` - 更新分组
- `DELETE /api/groups/:id` - 删除分组
- `PUT /api/group-orders` - 批量更新分组顺序

### 站点管理

- `GET /api/sites` - 获取所有站点
- `GET /api/groups-with-sites` - 获取分组及其站点
- `POST /api/sites` - 创建新站点
- `PUT /api/sites/:id` - 更新站点
- `DELETE /api/sites/:id` - 删除站点
- `PUT /api/site-orders` - 批量更新站点顺序

### 配置管理

- `GET /api/configs` - 获取所有配置
- `PUT /api/configs` - 更新配置

### 数据导入导出

- `GET /api/export` - 导出所有数据
- `POST /api/import` - 导入数据

## 认证方式

API 使用 JWT (JSON Web Token) 进行身份认证。认证token存储在HttpOnly Cookie中，或通过 `Authorization` header 传递：

```
Authorization: Bearer <your-token>
```

## 响应格式

所有API响应均为JSON格式：

成功响应：
```json
{
  "success": true,
  "data": { ... }
}
```

错误响应：
```json
{
  "error": "错误信息",
  "errorId": "unique-error-id"
}
```

## 访客模式

当 `AUTH_REQUIRED_FOR_READ` 设置为 `false` 时，未认证用户可以访问：
- `GET /api/groups`
- `GET /api/sites`
- `GET /api/groups-with-sites`
- `GET /api/configs`

但只能看到 `is_public=1` 的数据。

所有写操作（POST/PUT/DELETE）始终需要认证。

## 更多信息

- [认证 API 详情](/api/authentication)
