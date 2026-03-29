import { Group, Site, LoginResponse, ExportData, ImportResult, GroupWithSites } from './http';
import { UserPreferences, MigrationResult } from '../types/preferences';
import { getDeviceIdentifier } from '../utils/deviceIdentifier';

export class NavigationClient {
  private baseUrl: string;
  public isAuthenticated: boolean = false; // 新增：公开认证状态

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
    // 不再使用 localStorage 存储 token，改用 HttpOnly Cookie
  }

  // 检查是否已登录（通过尝试请求来判断）
  isLoggedIn(): boolean {
    // Cookie 由浏览器自动管理，无法直接检查
    // 需要通过 API 调用来验证
    return true; // 实际验证在 checkAuthStatus 中
  }

  // 登录API
  async login(
    username: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 重要：包含 Cookie
        body: JSON.stringify({ username, password, rememberMe }),
      });

      const data: LoginResponse = await response.json();

      // 根据登录结果更新认证状态
      this.isAuthenticated = data.success === true;

      // Cookie 会自动由浏览器设置，无需手动处理
      return data;
    } catch (error) {
      console.error('登录失败:', error);
      return {
        success: false,
        message: '登录请求失败，请检查网络连接',
      };
    }
  }

  // 登出
  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      // 登出成功，更新认证状态
      this.isAuthenticated = false;
    } catch (error) {
      console.error('登出失败:', error);
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add X-Device-ID header for guest users
    if (!this.isAuthenticated) {
      const deviceId = getDeviceIdentifier();
      headers['X-Device-ID'] = deviceId;
    }

    // Cookie 会自动包含在请求中，无需手动设置

    const response = await fetch(`${this.baseUrl}/${endpoint}`, {
      headers,
      credentials: 'include', // 重要：自动包含 Cookie
      ...options,
    });

    if (response.status === 401) {
      // 认证失败
      this.isAuthenticated = false;

      // 对于 GET 请求（只读操作），允许返回空数据而不抛出异常
      if (!options.method || options.method === 'GET') {
        // 尝试解析响应，如果是访客模式可能返回部分数据
        try {
          return response.json();
        } catch {
          // 如果无法解析，返回空数组/对象
          return endpoint.includes('config') ? {} : [];
        }
      }

      // 对于写操作（POST/PUT/DELETE），必须抛出异常
      throw new Error('认证已过期或无效，请重新登录');
    }

    if (!response.ok) {
      throw new Error(`API错误: ${response.status}`);
    }

    // 请求成功，标记为已认证（如果之前未认证）
    if (response.ok && !this.isAuthenticated) {
      this.isAuthenticated = true;
    }

    return response.json();
  }

  // 检查身份验证状态
  async checkAuthStatus(): Promise<boolean> {
    try {
      // 调用专门的认证状态检查端点
      const response = await fetch(`${this.baseUrl}/auth/status`, {
        method: 'GET',
        credentials: 'include', // 包含 Cookie
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.authenticated === true;
    } catch (error) {
      console.log('认证状态检查失败:', error);
      return false;
    }
  }

  // 分组相关API
  async getGroups(): Promise<Group[]> {
    return this.request('groups');
  }

  // 获取所有分组及其站点 (使用 JOIN 优化,避免 N+1 查询)
  async getGroupsWithSites(): Promise<GroupWithSites[]> {
    return this.request('groups-with-sites');
  }

  async getGroup(id: number): Promise<Group> {
    return this.request(`groups/${id}`);
  }

  async createGroup(group: Group): Promise<Group> {
    return this.request('groups', {
      method: 'POST',
      body: JSON.stringify(group),
    });
  }

  async updateGroup(id: number, group: Partial<Group>): Promise<Group> {
    return this.request(`groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(group),
    });
  }

  async deleteGroup(id: number): Promise<boolean> {
    const response = await this.request(`groups/${id}`, {
      method: 'DELETE',
    });
    return response.success;
  }

  // 网站相关API
  async getSites(groupId?: number): Promise<Site[]> {
    const endpoint = groupId ? `sites?groupId=${groupId}` : 'sites';
    return this.request(endpoint);
  }

  async getSite(id: number): Promise<Site> {
    return this.request(`sites/${id}`);
  }

  async createSite(site: Site): Promise<Site> {
    return this.request('sites', {
      method: 'POST',
      body: JSON.stringify(site),
    });
  }

  async updateSite(id: number, site: Partial<Site>): Promise<Site> {
    return this.request(`sites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(site),
    });
  }

  async deleteSite(id: number): Promise<boolean> {
    const response = await this.request(`sites/${id}`, {
      method: 'DELETE',
    });
    return response.success;
  }

  // 配置相关API
  async getConfigs(): Promise<Record<string, string>> {
    return this.request('configs');
  }

  async getConfig(key: string): Promise<string | null> {
    try {
      const response = await this.request(`configs/${key}`);
      return response.value;
    } catch {
      return null;
    }
  }

  async setConfig(key: string, value: string): Promise<boolean> {
    const response = await this.request(`configs/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
    return response.success;
  }

  async deleteConfig(key: string): Promise<boolean> {
    const response = await this.request(`configs/${key}`, {
      method: 'DELETE',
    });
    return response.success;
  }

  // 批量更新排序
  async updateGroupOrder(groupOrders: { id: number; order_num: number }[]): Promise<boolean> {
    const response = await this.request('group-orders', {
      method: 'PUT',
      body: JSON.stringify(groupOrders),
    });
    return response.success;
  }

  async updateSiteOrder(siteOrders: { id: number; order_num: number }[]): Promise<boolean> {
    const response = await this.request('site-orders', {
      method: 'PUT',
      body: JSON.stringify(siteOrders),
    });
    return response.success;
  }

  // 数据导出
  async exportData(): Promise<ExportData> {
    return this.request('export');
  }

  // 数据导入
  async importData(data: ExportData): Promise<ImportResult> {
    const response = await this.request('import', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response;
  }

  // 偏好管理 API

  /**
   * Get user's favorite sites
   * 获取用户收藏的站点列表
   */
  async getFavorites(): Promise<number[]> {
    const response = await this.request('preferences/favorites');
    return response.favorites.map((f: { site_id: number }) => f.site_id);
  }

  /**
   * Add a site to favorites
   * 添加站点到收藏
   */
  async addFavorite(siteId: number): Promise<void> {
    await this.request(`preferences/favorites/${siteId}`, {
      method: 'POST',
    });
  }

  /**
   * Remove a site from favorites
   * 从收藏中移除站点
   */
  async removeFavorite(siteId: number): Promise<void> {
    await this.request(`preferences/favorites/${siteId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get user preferences (view mode, theme, etc.)
   * 获取用户偏好设置
   */
  async getPreferences(): Promise<UserPreferences> {
    const response = await this.request('preferences/settings');
    return response.preferences;
  }

  /**
   * Update user preferences
   * 更新用户偏好设置
   */
  async updatePreferences(prefs: Partial<UserPreferences>): Promise<void> {
    await this.request('preferences/settings', {
      method: 'PUT',
      body: JSON.stringify(prefs),
    });
  }

  /**
   * Record a site visit
   * 记录站点访问
   */
  async recordVisit(siteId: number): Promise<void> {
    await this.request(`preferences/visits/${siteId}`, {
      method: 'POST',
    });
  }

  /**
   * Get recent visits
   * 获取最近访问记录
   */
  async getRecentVisits(limit: number = 20): Promise<number[]> {
    const response = await this.request(`preferences/visits?limit=${limit}`);
    return response.visits.map((v: { site_id: number }) => v.site_id);
  }

  /**
   * Migrate guest preferences to authenticated user
   * 将游客偏好数据迁移到已认证用户
   */
  async migrateGuestPreferences(deviceId: string): Promise<MigrationResult> {
    return this.request('preferences/migrate', {
      method: 'POST',
      body: JSON.stringify({ device_identifier: deviceId }),
    });
  }
}
