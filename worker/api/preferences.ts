/**
 * PreferencesAPI - Manages user preferences in D1 database
 * Handles favorites, user settings, and recent visits
 */

// TypeScript interfaces
export interface Favorite {
  id: number;
  user_id: string;
  site_id: number;
  created_at: string;
}

export interface UserPreferences {
  user_id: string;
  view_mode: 'card' | 'list';
  theme_mode: 'light' | 'dark';
  custom_colors: string | null;
  updated_at: string;
}

export interface Visit {
  id: number;
  user_id: string;
  site_id: number;
  visited_at: string;
}

export interface MigrationResult {
  favorites: number;
  visits: number;
}

/**
 * PreferencesAPI class for managing user preferences
 */
export class PreferencesAPI {
  constructor(private db: D1Database) {}

  /**
   * Get all favorites for a user
   * @param userId - User identifier (username or device_identifier)
   * @returns Array of favorite records
   */
  async getFavorites(userId: string): Promise<Favorite[]> {
    const result = await this.db
      .prepare('SELECT * FROM user_favorites WHERE user_id = ? ORDER BY created_at DESC')
      .bind(userId)
      .all();

    return result.results as Favorite[];
  }

  /**
   * Add a site to user's favorites
   * @param userId - User identifier
   * @param siteId - Site ID to add
   * @returns The created favorite record
   * @throws Error if site doesn't exist or is already favorited
   */
  async addFavorite(userId: string, siteId: number): Promise<Favorite> {
    // Check if site exists
    const site = await this.db.prepare('SELECT id FROM sites WHERE id = ?').bind(siteId).first();

    if (!site) {
      throw new Error('站点不存在');
    }

    // Insert favorite (ignore if already exists)
    const result = await this.db
      .prepare(
        `
        INSERT INTO user_favorites (user_id, site_id)
        VALUES (?, ?)
        ON CONFLICT(user_id, site_id) DO NOTHING
        RETURNING *
      `
      )
      .bind(userId, siteId)
      .first();

    if (!result) {
      throw new Error('该站点已在收藏列表中');
    }

    return result as Favorite;
  }

  /**
   * Remove a site from user's favorites
   * @param userId - User identifier
   * @param siteId - Site ID to remove
   * @returns true if removed successfully
   */
  async removeFavorite(userId: string, siteId: number): Promise<boolean> {
    const result = await this.db
      .prepare('DELETE FROM user_favorites WHERE user_id = ? AND site_id = ?')
      .bind(userId, siteId)
      .run();

    return result.success;
  }

  /**
   * Get user preferences
   * @param userId - User identifier
   * @returns User preferences or null if not found
   */
  async getPreferences(userId: string): Promise<UserPreferences | null> {
    const result = await this.db
      .prepare('SELECT * FROM user_preferences WHERE user_id = ?')
      .bind(userId)
      .first();

    if (!result) {
      return null;
    }

    const prefs = result as Record<string, unknown>;

    // Parse JSON field
    if (typeof prefs.custom_colors === 'string') {
      try {
        prefs.custom_colors = JSON.parse(prefs.custom_colors);
      } catch {
        prefs.custom_colors = null;
      }
    }

    return prefs as UserPreferences;
  }

  /**
   * Update user preferences (upsert)
   * @param userId - User identifier
   * @param prefs - Partial preferences to update
   */
  async updatePreferences(userId: string, prefs: Partial<UserPreferences>): Promise<void> {
    const fields: string[] = [];
    const values: (string | null)[] = [userId];

    // Build field list and values for INSERT
    if (prefs.view_mode !== undefined) {
      fields.push('view_mode');
      values.push(prefs.view_mode);
    }

    if (prefs.theme_mode !== undefined) {
      fields.push('theme_mode');
      values.push(prefs.theme_mode);
    }

    if (prefs.custom_colors !== undefined) {
      fields.push('custom_colors');
      values.push(prefs.custom_colors ? JSON.stringify(prefs.custom_colors) : null);
    }

    // Build UPDATE SET clause
    const updateClauses = fields.map((field) => `${field} = excluded.${field}`);
    updateClauses.push('updated_at = CURRENT_TIMESTAMP');

    // Build placeholders for VALUES
    const placeholders = ['?', ...fields.map(() => '?')];

    await this.db
      .prepare(
        `
        INSERT INTO user_preferences (user_id, ${fields.join(', ')})
        VALUES (${placeholders.join(', ')})
        ON CONFLICT(user_id) DO UPDATE SET ${updateClauses.join(', ')}
      `
      )
      .bind(...values)
      .run();
  }

  /**
   * Record a site visit
   * @param userId - User identifier
   * @param siteId - Site ID to record
   * @description Uses INSERT ... ON CONFLICT DO UPDATE to update visit time if record exists
   * Automatically cleans up old records, keeping only the most recent 20 visits
   */
  async recordVisit(userId: string, siteId: number): Promise<void> {
    // Insert or update visit record with current timestamp
    await this.db
      .prepare(
        `
        INSERT INTO user_recent_visits (user_id, site_id, visited_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id, site_id) DO UPDATE SET visited_at = CURRENT_TIMESTAMP
      `
      )
      .bind(userId, siteId)
      .run();

    // Clean up old records, keeping only the most recent 20
    await this.db
      .prepare(
        `
        DELETE FROM user_recent_visits
        WHERE user_id = ?
        AND id NOT IN (
          SELECT id FROM user_recent_visits
          WHERE user_id = ?
          ORDER BY visited_at DESC
          LIMIT 20
        )
      `
      )
      .bind(userId, userId)
      .run();
  }

  /**
   * Get recent visits for a user
   * @param userId - User identifier
   * @param limit - Maximum number of records to return (default 20, max 50)
   * @returns Array of visit records ordered by visited_at DESC
   */
  async getRecentVisits(userId: string, limit: number = 20): Promise<Visit[]> {
    // Ensure limit is within bounds
    const safeLimit = Math.min(Math.max(1, limit), 50);

    const result = await this.db
      .prepare(
        `
        SELECT * FROM user_recent_visits
        WHERE user_id = ?
        ORDER BY visited_at DESC
        LIMIT ?
      `
      )
      .bind(userId, safeLimit)
      .all();

    return result.results as Visit[];
  }


    /**
     * Migrate guest user data to authenticated user account
     * @param guestUserId - Guest user's device identifier
     * @param authenticatedUserId - Authenticated user's username
     * @returns Migration statistics (number of favorites and visits migrated)
     * @description Uses D1 batch API for transactional operations:
     * - Migrates favorites with ON CONFLICT DO NOTHING (keeps existing)
     * - Migrates visits with ON CONFLICT DO UPDATE (keeps latest timestamp)
     * - Cleans up guest data after successful migration
     * **Validates: Requirements 2.3, 2.4, 2.5, 4.6**
     */
    async migrateGuestData(
      guestUserId: string,
      authenticatedUserId: string
    ): Promise<MigrationResult> {
      const migrated = {
        favorites: 0,
        visits: 0,
      };

      try {
        // D1 doesn't support transactions directly, use batch API for atomic operations
        const statements: D1PreparedStatement[] = [];

        // 1. Migrate favorites (handle duplicates with ON CONFLICT DO NOTHING)
        statements.push(
          this.db
            .prepare(
              `
            INSERT INTO user_favorites (user_id, site_id, created_at)
            SELECT ?, site_id, created_at
            FROM user_favorites
            WHERE user_id = ?
            ON CONFLICT(user_id, site_id) DO NOTHING
          `
            )
            .bind(authenticatedUserId, guestUserId)
        );

        // 2. Migrate visit records (merge with latest timestamp)
        statements.push(
          this.db
            .prepare(
              `
            INSERT INTO user_recent_visits (user_id, site_id, visited_at)
            SELECT ?, site_id, visited_at
            FROM user_recent_visits
            WHERE user_id = ?
            ON CONFLICT(user_id, site_id) DO UPDATE SET
              visited_at = MAX(visited_at, excluded.visited_at)
          `
            )
            .bind(authenticatedUserId, guestUserId)
        );

        // 3. Clean up guest favorites data
        statements.push(this.db.prepare('DELETE FROM user_favorites WHERE user_id = ?').bind(guestUserId));

        // 4. Clean up guest visits data
        statements.push(this.db.prepare('DELETE FROM user_recent_visits WHERE user_id = ?').bind(guestUserId));

        // Execute batch operations atomically
        const results = await this.db.batch(statements);

        // Collect migration statistics
        migrated.favorites = results[0].meta?.changes || 0;
        migrated.visits = results[1].meta?.changes || 0;

        return migrated;
      } catch (error) {
        console.error('Migration failed:', error);
        throw new Error('偏好数据迁移失败');
      }
    }

}
