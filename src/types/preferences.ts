/**
 * User Preferences Types
 * 用户偏好设置类型定义
 */

// 收藏记录
export interface Favorite {
  id: number;
  user_id: string;
  site_id: number;
  created_at: string;
}

// 用户偏好设置
export interface UserPreferences {
  user_id: string;
  view_mode: 'card' | 'list';
  theme_mode: 'light' | 'dark';
  custom_colors: CustomThemeColors | null;
  updated_at: string;
}

// 自定义主题颜色
export interface CustomThemeColors {
  primary?: string;
  secondary?: string;
  background?: string;
  surface?: string;
  text?: string;
}

// 访问记录
export interface Visit {
  id: number;
  user_id: string;
  site_id: number;
  visited_at: string;
}

// 迁移结果
export interface MigrationResult {
  favorites: number;
  visits: number;
}

// 迁移状态
export type MigrationStatus = 'idle' | 'checking' | 'migrating' | 'completed' | 'failed';

// 偏好设置缓存
export interface PreferencesCache<T> {
  data: T;
  timestamp: number;
  ttl: number;
}
