# 实施计划: 用户偏好持久化

## 概述

本实施计划将用户偏好从 localStorage 迁移到 D1 数据库，实现跨设备同步、持久化存储，并支持游客用户的偏好管理。实施分为六个主要阶段：数据库架构、Worker API、前端服务、迁移功能、集成测试和文档更新。

## 任务

- [x] 1. 数据库架构和迁移
  - [x] 1.1 创建数据库迁移脚本
    - 创建 `migrations/003_add_user_preferences.sql` 文件
    - 定义 user_favorites 表（id, user_id, site_id, created_at）
    - 定义 user_preferences 表（user_id, view_mode, theme_mode, custom_colors, updated_at）
    - 定义 user_recent_visits 表（id, user_id, site_id, visited_at）
    - 添加所有必要的索引和唯一约束
    - 配置外键级联删除（ON DELETE CASCADE）
    - _需求: 1.1, 3.1, 7.1_
  
  - [ ]* 1.2 编写属性测试验证数据库约束
    - **属性 2: 收藏唯一性约束**
    - **验证需求: 1.5**
    - **属性 14: 级联删除完整性**
    - **验证需求: 8.1**

- [x] 2. Worker API 实现 - 核心基础设施
  - [x] 2.1 实现设备标识符管理工具
    - 创建 `worker/utils/deviceIdentifier.ts`
    - 实现 `getDeviceIdentifier()` 函数（从请求头或 Cookie 获取）
    - 实现 `generateDeviceIdentifier()` 函数（使用 crypto.randomUUID）
    - 实现 `isValidDeviceIdentifier()` 验证函数
    - _需求: 2.1_
  
  - [x] 2.2 实现用户标识符解析工具
    - 创建 `worker/utils/userIdentifier.ts`
    - 实现 `getUserIdentifier()` 函数
    - 优先验证认证令牌，降级到设备标识符
    - 返回 userId 和 isGuest 标志
    - _需求: 4.7, 4.8_
  
  - [ ]* 2.3 编写属性测试验证用户身份识别
    - **属性 7: 用户身份识别正确性**
    - **验证需求: 4.7, 4.8**

- [x] 3. Worker API 实现 - PreferencesAPI 类
  - [x] 3.1 创建 PreferencesAPI 类骨架
    - 创建 `worker/api/preferences.ts`
    - 定义 PreferencesAPI 类，接受 D1Database 参数
    - 定义 TypeScript 接口（Favorite, UserPreferences, Visit, MigrationResult）
    - _需求: 4.1_
  
  - [x] 3.2 实现收藏管理方法
    - 实现 `getFavorites(userId: string)` 方法
    - 实现 `addFavorite(userId: string, siteId: number)` 方法（处理重复）
    - 实现 `removeFavorite(userId: string, siteId: number)` 方法
    - 使用参数化查询防止 SQL 注入
    - _需求: 1.2, 1.3, 1.4, 4.1, 4.2, 4.3_
  
  - [ ]* 3.3 编写属性测试验证收藏操作
    - **属性 1: 收藏操作的完整性**
    - **验证需求: 1.2, 1.3, 1.4**
  
  - [x] 3.4 实现用户偏好设置方法
    - 实现 `getPreferences(userId: string)` 方法
    - 实现 `updatePreferences(userId: string, prefs: Partial<UserPreferences>)` 方法
    - 使用 INSERT ... ON CONFLICT DO UPDATE 处理 upsert
    - 解析和序列化 custom_colors JSON 字段
    - _需求: 3.2, 3.3, 3.4, 4.4, 4.5_
  
  - [ ]* 3.5 编写属性测试验证偏好设置往返一致性
    - **属性 6: 用户偏好设置往返一致性**
    - **验证需求: 3.2, 3.3, 3.4**
  
  - [x] 3.6 实现访问记录方法
    - 实现 `recordVisit(userId: string, siteId: number)` 方法
    - 使用 INSERT ... ON CONFLICT DO UPDATE 更新访问时间
    - 实现自动清理逻辑（保留最近 20 条）
    - 实现 `getRecentVisits(userId: string, limit: number)` 方法
    - _需求: 7.2, 7.3, 7.4, 7.5_
  
  - [ ]* 3.7 编写属性测试验证访问记录管理
    - **属性 11: 访问记录追踪**
    - **验证需求: 7.2**
    - **属性 12: 最近访问记录数量限制**
    - **验证需求: 7.3, 7.4**
    - **属性 13: 最近访问记录排序**
    - **验证需求: 7.5**
  
  - [x] 3.8 实现游客数据迁移方法
    - 实现 `migrateGuestData(guestUserId: string, authenticatedUserId: string)` 方法
    - 使用 D1 batch API 执行事务性操作
    - 处理重复收藏（ON CONFLICT DO NOTHING）
    - 合并访问记录（保留最新时间戳）
    - 清理游客数据
    - 返回迁移统计信息
    - _需求: 2.3, 2.4, 2.5, 4.6_
  
  - [ ]* 3.9 编写属性测试验证游客数据迁移
    - **属性 4: 游客数据迁移完整性**
    - **验证需求: 2.3, 2.5**
    - **属性 5: 迁移冲突解决**
    - **验证需求: 2.4**

- [x] 4. Worker API 实现 - 路由和中间件
  - [x] 4.1 实现输入验证工具
    - 创建 `worker/validation/preferences.ts`
    - 实现 `validateFavoriteRequest(siteId: unknown)` 函数
    - 实现 `validatePreferencesUpdate(data: unknown)` 函数
    - 验证 view_mode、theme_mode、custom_colors 格式
    - _需求: 8.2_
  
  - [x] 4.2 添加偏好 API 路由到 Worker
    - 修改 `worker/index.ts`
    - 添加 GET /api/preferences/favorites 路由
    - 添加 POST /api/preferences/favorites/:siteId 路由
    - 添加 DELETE /api/preferences/favorites/:siteId 路由
    - 添加 GET /api/preferences/settings 路由
    - 添加 PUT /api/preferences/settings 路由
    - 添加 POST /api/preferences/visits/:siteId 路由
    - 添加 GET /api/preferences/visits 路由
    - 添加 POST /api/preferences/migrate 路由
    - 使用 getUserIdentifier 解析用户身份
    - 实现错误处理和统一响应格式
    - _需求: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 8.2_
  
  - [ ]* 4.3 编写单元测试验证 API 端点
    - 测试所有 8 个 API 端点的成功和失败场景
    - 测试认证用户和游客用户的不同行为
    - 测试错误响应格式一致性
    - _需求: 4.1-4.8, 8.2_

- [ ] 5. 检查点 - 确保 Worker API 测试通过
  - 运行所有 Worker 单元测试
  - 使用 Wrangler 本地测试 API 端点
  - 确认所有测试通过，如有问题请询问用户

- [x] 6. 前端实现 - TypeScript 类型和工具
  - [x] 6.1 定义前端 TypeScript 类型
    - 创建 `src/types/preferences.ts`
    - 定义 Favorite、UserPreferences、CustomThemeColors 接口
    - 定义 Visit、MigrationResult、PreferencesCache 接口
    - 定义 MigrationStatus 接口
    - _需求: 3.1, 7.1_
  
  - [x] 6.2 实现设备标识符管理工具
    - 创建 `src/utils/deviceIdentifier.ts`
    - 实现 `generateDeviceIdentifier()` 函数
    - 实现 `getDeviceIdentifier()` 函数（从 localStorage 读取）
    - 实现 `setDeviceIdentifier()` 函数（保存到 localStorage）
    - 实现 `isValidDeviceIdentifier()` 验证函数
    - _需求: 2.1_

- [ ] 7. 前端实现 - API 客户端扩展
  - [x] 7.1 扩展 NavigationClient 类
    - 修改 `src/API/client.ts`
    - 添加 `getFavorites()` 方法
    - 添加 `addFavorite(siteId: number)` 方法
    - 添加 `removeFavorite(siteId: number)` 方法
    - 添加 `getPreferences()` 方法
    - 添加 `updatePreferences(prefs: Partial<UserPreferences>)` 方法
    - 添加 `recordVisit(siteId: number)` 方法
    - 添加 `getRecentVisits(limit: number)` 方法
    - 添加 `migrateGuestPreferences(deviceId: string)` 方法
    - 在请求头中包含 X-Device-ID（游客用户）
    - _需求: 4.1-4.8_
  
  - [ ]* 7.2 编写单元测试验证 API 客户端
    - 测试所有新增方法的请求格式
    - 测试错误处理和重试逻辑
    - _需求: 4.1-4.8_

- [ ] 8. 前端实现 - PreferencesContext
  - [x] 8.1 创建 PreferencesContext
    - 创建 `src/contexts/PreferencesContext.tsx`
    - 定义 PreferencesContextValue 接口
    - 实现 PreferencesProvider 组件
    - 管理收藏列表状态（favorites: number[]）
    - 管理最近访问状态（recentVisits: number[]）
    - 管理加载和错误状态
    - 管理迁移状态
    - _需求: 1.2, 1.3, 1.4, 7.2, 7.5_
  
  - [ ] 8.2 实现收藏管理功能
    - 实现 `isFavorite(siteId: number)` 方法
    - 实现 `toggleFavorite(siteId: number)` 方法
    - 立即更新本地状态，异步同步到服务器
    - 实现乐观更新和错误回滚
    - _需求: 1.2, 1.3, 1.4_
  
  - [ ] 8.3 实现访问记录功能
    - 实现 `recordVisit(siteId: number)` 方法
    - 更新 recentVisits 状态
    - 异步同步到服务器
    - _需求: 7.2_
  
  - [ ] 8.4 实现初始化和数据加载
    - 在 Provider 挂载时加载用户偏好数据
    - 从 API 获取收藏列表和最近访问
    - 处理加载失败，降级到 localStorage
    - _需求: 9.5, 10.1, 10.3_
  
  - [ ]* 8.5 编写单元测试验证 PreferencesContext
    - 测试收藏添加和删除
    - 测试乐观更新和错误回滚
    - 测试访问记录功能
    - _需求: 1.2, 1.3, 1.4, 7.2_

- [ ] 9. 前端实现 - ThemeContext 集成
  - [ ] 9.1 修改 ThemeContext 支持服务器同步
    - 修改 `src/contexts/ThemeContext.tsx`
    - 添加 `syncToServer()` 函数
    - 在主题或自定义颜色更改时调用 API
    - 实现错误处理，失败时继续使用 localStorage
    - _需求: 3.2, 3.3, 9.3_
  
  - [ ] 9.2 实现主题偏好初始化
    - 在 ThemeProvider 挂载时从 API 加载主题偏好
    - 如果 API 失败，降级到 localStorage
    - 合并服务器和本地偏好（服务器优先）
    - _需求: 3.4, 10.1, 10.3_
  
  - [ ]* 9.3 编写属性测试验证主题同步
    - **属性 17: 前端缓存一致性**
    - **验证需求: 9.2, 9.3**

- [ ] 10. 前端实现 - 离线支持和缓存
  - [ ] 10.1 创建 PreferencesCache 类
    - 创建 `src/services/PreferencesCache.ts`
    - 实现 `get<T>(key: string)` 方法（带 TTL 检查）
    - 实现 `set<T>(key: string, data: T)` 方法
    - 实现 `invalidate(key: string)` 和 `clear()` 方法
    - 设置 5 分钟 TTL
    - _需求: 9.2_
  
  - [ ] 10.2 创建 PreferencesService 类
    - 创建 `src/services/PreferencesService.ts`
    - 集成 PreferencesCache
    - 实现网络状态监听（online/offline 事件）
    - 实现重试队列机制
    - 实现 `toggleFavorite()` 方法（立即更新缓存，异步同步）
    - 实现 `handleOnline()` 方法（执行重试队列）
    - _需求: 9.2, 9.3, 9.5_
  
  - [ ]* 10.3 编写属性测试验证离线模式
    - **属性 18: 离线模式降级**
    - **验证需求: 9.5**

- [ ] 11. 检查点 - 确保前端基础功能测试通过
  - 运行所有前端单元测试
  - 手动测试收藏添加/删除功能
  - 测试离线模式和缓存功能
  - 确认所有测试通过，如有问题请询问用户

- [ ] 12. 迁移功能实现
  - [ ] 12.1 创建 MigrationService 类
    - 创建 `src/services/MigrationService.ts`
    - 定义迁移版本常量（VERSION = '1.0.0'）
    - 实现 `needsMigration()` 方法（检查 localStorage 标记）
    - 实现 `migrate()` 方法
    - 读取 localStorage 中的 favoriteSiteIds、recentSiteIds、themePreferences、viewMode
    - 批量上传到服务器（调用 API 客户端方法）
    - 处理部分失败（记录警告，继续迁移其他数据）
    - 成功后设置迁移完成标记
    - 失败时保留 localStorage 数据
    - _需求: 5.1, 5.2, 5.3, 5.4_
  
  - [ ] 12.2 实现迁移 UI 提示
    - 在 MigrationService 中实现 `showMigrationPrompt()` 方法
    - 使用浏览器原生 confirm 对话框（或 Material-UI Dialog）
    - 询问用户是否迁移本地数据到云端
    - _需求: 5.5_
  
  - [ ]* 12.3 编写属性测试验证迁移完整性
    - **属性 8: localStorage 迁移完整性**
    - **验证需求: 5.2, 5.3**
    - **属性 9: 迁移失败时数据保护**
    - **验证需求: 5.4**

- [ ] 13. 应用集成 - 自动迁移流程
  - [ ] 13.1 集成迁移到 App 组件
    - 修改 `src/App.tsx`
    - 添加 migrationStatus 状态
    - 在 useEffect 中检查是否需要迁移
    - 仅在已登录时执行迁移
    - 显示迁移进度 UI（checking/migrating/completed/failed）
    - _需求: 5.1, 5.5_
  
  - [ ] 13.2 集成游客登录后迁移
    - 修改 `src/components/LoginForm.tsx`
    - 在登录成功后获取游客 device_identifier
    - 调用 `migrateGuestPreferences()` API
    - 清除 localStorage 中的 device_identifier
    - 执行 localStorage 迁移（如果需要）
    - 处理迁移失败（不阻止登录流程）
    - _需求: 2.3, 5.1_
  
  - [ ]* 13.3 编写属性测试验证游客用户流程
    - **属性 3: 游客用户收藏持久化**
    - **验证需求: 2.2**

- [ ] 14. 应用集成 - 组件更新
  - [ ] 14.1 更新 SiteCard 组件使用 PreferencesContext
    - 修改 `src/components/SiteCard.tsx`
    - 使用 usePreferences hook 获取收藏状态
    - 调用 toggleFavorite 方法处理收藏按钮点击
    - 调用 recordVisit 方法处理站点链接点击
    - 移除直接的 localStorage 操作
    - _需求: 1.2, 1.3, 7.2_
  
  - [ ] 14.2 更新 ListView 组件使用 PreferencesContext
    - 修改 `src/components/ListView.tsx`
    - 使用 usePreferences hook 获取收藏状态
    - 调用 toggleFavorite 方法处理收藏按钮点击
    - 调用 recordVisit 方法处理站点链接点击
    - 移除直接的 localStorage 操作
    - _需求: 1.2, 1.3, 7.2_
  
  - [ ] 14.3 更新 ViewModeToggle 组件同步到服务器
    - 修改 `src/components/ViewModeToggle.tsx`
    - 在视图模式更改时调用 API 更新偏好设置
    - 保持 localStorage 作为降级方案
    - _需求: 3.2, 10.1_

- [ ] 15. 检查点 - 确保集成测试通过
  - 运行所有集成测试
  - 手动测试完整的用户流程（游客 → 登录 → 迁移）
  - 测试跨设备同步（使用不同浏览器/设备）
  - 确认所有测试通过，如有问题请询问用户

- [ ] 16. 性能优化
  - [ ] 16.1 实现批量偏好更新
    - 在 PreferencesService 中添加批量更新逻辑
    - 实现 500ms 延迟批处理
    - 使用 pendingUpdates Map 收集更改
    - 实现 `flushUpdates()` 方法批量提交
    - _需求: 9.4_
  
  - [ ] 16.2 实现批量数据获取 API
    - 在 PreferencesAPI 中添加 `getAllUserData()` 方法
    - 使用 D1 batch API 并行查询收藏、偏好、访问记录
    - 减少 API 往返次数
    - 在前端初始化时使用批量 API
    - _需求: 9.1, 9.4_
  
  - [ ]* 16.3 编写性能测试
    - 测试批量操作性能
    - 验证初始加载时间 < 500ms
    - 测试缓存命中率
    - _需求: 9.1_

- [ ] 17. 错误处理和日志
  - [ ] 17.1 实现结构化日志工具
    - 创建 `worker/utils/logger.ts`
    - 定义 LogEntry 接口
    - 实现 `logPreferenceOperation()` 函数
    - 记录操作类型、用户 ID、持续时间、错误信息
    - _需求: 8.5_
  
  - [ ] 17.2 添加性能监控中间件
    - 创建 `worker/middleware/performance.ts`
    - 实现 `withPerformanceTracking()` 函数
    - 包装所有 PreferencesAPI 方法
    - 记录操作持续时间和成功/失败状态
    - _需求: 8.5_
  
  - [ ] 17.3 实现统一错误响应格式
    - 确保所有 API 错误返回 ErrorResponse 格式
    - 包含 success: false、message、errorId、details 字段
    - 使用适当的 HTTP 状态码（400/401/404/500）
    - _需求: 8.2_
  
  - [ ]* 17.4 编写属性测试验证错误处理
    - **属性 15: 错误响应格式一致性**
    - **验证需求: 8.2**

- [ ] 18. 集成测试和端到端测试
  - [ ]* 18.1 编写集成测试
    - 创建 `tests/integration/preferences.test.ts`
    - 测试跨设备收藏同步
    - 测试离线模式和网络恢复
    - 测试游客用户登录后迁移
    - _需求: 2.3, 9.5_
  
  - [ ]* 18.2 编写端到端测试
    - 创建 `tests/e2e/preferences.spec.ts`
    - 使用 Playwright 测试用户添加/删除收藏
    - 测试游客用户数据迁移流程
    - 测试跨设备同步（刷新页面后收藏保持）
    - _需求: 1.2, 1.3, 2.3_

- [ ] 19. 部署和配置
  - [ ] 19.1 应用数据库迁移
    - 在本地开发环境执行迁移脚本
    - 使用 `pnpm wrangler d1 execute navihive-db --local --file=migrations/003_add_user_preferences.sql`
    - 验证表创建成功
    - 在生产环境执行迁移（移除 --local 参数）
    - _需求: 1.1, 3.1, 7.1_
  
  - [ ] 19.2 更新 Wrangler 配置
    - 确认 `wrangler.jsonc` 包含 D1 数据库绑定
    - 验证环境变量配置正确
    - 运行 `pnpm cf-typegen` 更新类型定义
    - _需求: 部署_
  
  - [ ] 19.3 构建和部署
    - 运行 `pnpm lint` 检查代码质量
    - 运行 `pnpm build` 构建生产版本
    - 运行 `pnpm deploy` 部署到 Cloudflare
    - 验证部署成功
    - _需求: 部署_

- [ ] 20. 文档更新
  - [ ] 20.1 更新 API 文档
    - 更新 `docs/api/index.md`
    - 记录所有新增的偏好 API 端点
    - 包含请求/响应示例
    - 说明认证要求和游客用户支持
    - _需求: 4.1-4.8_
  
  - [ ] 20.2 更新架构文档
    - 更新 `docs/architecture/index.md`
    - 添加偏好持久化架构图
    - 说明数据流和迁移策略
    - 记录降级机制和错误处理
    - _需求: 所有_
  
  - [ ] 20.3 更新 README 和 CHANGELOG
    - 更新 `README.md` 添加新功能说明
    - 更新 `docs/guide/changelog.md` 记录版本变更
    - 说明迁移过程和用户影响
    - _需求: 所有_

- [ ] 21. 最终检查点 - 确保所有测试通过
  - 运行所有单元测试、集成测试、端到端测试
  - 手动测试所有关键用户流程
  - 验证性能指标（加载时间 < 500ms）
  - 测试降级机制（离线模式、数据库不可用）
  - 确认所有测试通过，如有问题请询问用户

## 注意事项

- 标记 `*` 的任务为可选测试任务，可以跳过以加快 MVP 开发
- 每个任务都引用了具体的需求编号，确保可追溯性
- 检查点任务确保增量验证，及早发现问题
- 属性测试验证通用正确性属性
- 单元测试验证具体示例和边界情况
- 所有数据库操作使用参数化查询防止 SQL 注入
- 实现完整的降级机制，确保离线和数据库故障时系统可用
- 保持向后兼容性，迁移未完成时继续支持 localStorage
