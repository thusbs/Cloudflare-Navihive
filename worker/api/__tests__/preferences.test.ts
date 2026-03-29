import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PreferencesAPI } from '../preferences';

describe('PreferencesAPI - User Preferences Methods', () => {
  let mockDb: D1Database;
  let api: PreferencesAPI;

  beforeEach(() => {
    mockDb = {
      prepare: vi.fn(),
      batch: vi.fn(),
    };
    api = new PreferencesAPI(mockDb);
  });

  describe('getPreferences', () => {
    it('should return null when no preferences exist', async () => {
      const mockPrepare = {
        bind: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValue(null),
      };
      mockDb.prepare.mockReturnValue(mockPrepare);

      const result = await api.getPreferences('user123');

      expect(result).toBeNull();
      expect(mockDb.prepare).toHaveBeenCalledWith('SELECT * FROM user_preferences WHERE user_id = ?');
      expect(mockPrepare.bind).toHaveBeenCalledWith('user123');
    });

    it('should return preferences with parsed custom_colors', async () => {
      const mockPrefs = {
        user_id: 'user123',
        view_mode: 'card',
        theme_mode: 'dark',
        custom_colors: '{"primary":"#5eead4","secondary":"#fb923c"}',
        updated_at: '2024-01-15T10:30:00Z',
      };

      const mockPrepare = {
        bind: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValue(mockPrefs),
      };
      mockDb.prepare.mockReturnValue(mockPrepare);

      const result = await api.getPreferences('user123');

      expect(result).toEqual({
        user_id: 'user123',
        view_mode: 'card',
        theme_mode: 'dark',
        custom_colors: { primary: '#5eead4', secondary: '#fb923c' },
        updated_at: '2024-01-15T10:30:00Z',
      });
    });

    it('should handle invalid JSON in custom_colors', async () => {
      const mockPrefs = {
        user_id: 'user123',
        view_mode: 'card',
        theme_mode: 'light',
        custom_colors: 'invalid-json',
        updated_at: '2024-01-15T10:30:00Z',
      };

      const mockPrepare = {
        bind: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValue(mockPrefs),
      };
      mockDb.prepare.mockReturnValue(mockPrepare);

      const result = await api.getPreferences('user123');

      expect(result?.custom_colors).toBeNull();
    });

    it('should handle null custom_colors', async () => {
      const mockPrefs = {
        user_id: 'user123',
        view_mode: 'list',
        theme_mode: 'light',
        custom_colors: null,
        updated_at: '2024-01-15T10:30:00Z',
      };

      const mockPrepare = {
        bind: vi.fn().mockReturnThis(),
        first: vi.fn().mockResolvedValue(mockPrefs),
      };
      mockDb.prepare.mockReturnValue(mockPrepare);

      const result = await api.getPreferences('user123');

      expect(result?.custom_colors).toBeNull();
    });
  });

  describe('updatePreferences', () => {
    it('should update view_mode only', async () => {
      const mockPrepare = {
        bind: vi.fn().mockReturnThis(),
        run: vi.fn().mockResolvedValue({ success: true }),
      };
      mockDb.prepare.mockReturnValue(mockPrepare);

      await api.updatePreferences('user123', { view_mode: 'list' });

      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO user_preferences (user_id, view_mode)')
      );
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('ON CONFLICT(user_id) DO UPDATE SET')
      );
      expect(mockPrepare.bind).toHaveBeenCalledWith('user123', 'list');
    });

    it('should update theme_mode only', async () => {
      const mockPrepare = {
        bind: vi.fn().mockReturnThis(),
        run: vi.fn().mockResolvedValue({ success: true }),
      };
      mockDb.prepare.mockReturnValue(mockPrepare);

      await api.updatePreferences('user123', { theme_mode: 'dark' });

      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO user_preferences (user_id, theme_mode)')
      );
      expect(mockPrepare.bind).toHaveBeenCalledWith('user123', 'dark');
    });

    it('should update multiple fields', async () => {
      const mockPrepare = {
        bind: vi.fn().mockReturnThis(),
        run: vi.fn().mockResolvedValue({ success: true }),
      };
      mockDb.prepare.mockReturnValue(mockPrepare);

      await api.updatePreferences('user123', {
        view_mode: 'card',
        theme_mode: 'light',
      });

      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO user_preferences (user_id, view_mode, theme_mode)')
      );
      expect(mockPrepare.bind).toHaveBeenCalledWith('user123', 'card', 'light');
    });

    it('should serialize custom_colors to JSON', async () => {
      const mockPrepare = {
        bind: vi.fn().mockReturnThis(),
        run: vi.fn().mockResolvedValue({ success: true }),
      };
      mockDb.prepare.mockReturnValue(mockPrepare);

      const customColors = { primary: '#5eead4', secondary: '#fb923c' };
      await api.updatePreferences('user123', {
        custom_colors: customColors as unknown as string,
      });

      expect(mockPrepare.bind).toHaveBeenCalledWith('user123', JSON.stringify(customColors));
    });

    it('should handle null custom_colors', async () => {
      const mockPrepare = {
        bind: vi.fn().mockReturnThis(),
        run: vi.fn().mockResolvedValue({ success: true }),
      };
      mockDb.prepare.mockReturnValue(mockPrepare);

      await api.updatePreferences('user123', { custom_colors: null });

      expect(mockPrepare.bind).toHaveBeenCalledWith('user123', null);
    });

    it('should use upsert with ON CONFLICT', async () => {
      const mockPrepare = {
        bind: vi.fn().mockReturnThis(),
        run: vi.fn().mockResolvedValue({ success: true }),
      };
      mockDb.prepare.mockReturnValue(mockPrepare);

      await api.updatePreferences('user123', { view_mode: 'list' });

      const sqlQuery = mockDb.prepare.mock.calls[0][0];
      expect(sqlQuery).toContain('ON CONFLICT(user_id) DO UPDATE SET');
      expect(sqlQuery).toContain('view_mode = excluded.view_mode');
      expect(sqlQuery).toContain('updated_at = CURRENT_TIMESTAMP');
    });
  });

  describe('recordVisit', () => {
    it('should insert or update visit record with current timestamp', async () => {
      const mockPrepare = {
        bind: vi.fn().mockReturnThis(),
        run: vi.fn().mockResolvedValue({ success: true }),
      };
      mockDb.prepare.mockReturnValue(mockPrepare);

      await api.recordVisit('user123', 42);

      // First call: INSERT OR UPDATE
      expect(mockDb.prepare).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('INSERT INTO user_recent_visits')
      );
      expect(mockDb.prepare).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining('ON CONFLICT(user_id, site_id) DO UPDATE SET visited_at = CURRENT_TIMESTAMP')
      );
      expect(mockPrepare.bind).toHaveBeenNthCalledWith(1, 'user123', 42);

      // Second call: cleanup old records
      expect(mockDb.prepare).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('DELETE FROM user_recent_visits')
      );
      expect(mockDb.prepare).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('LIMIT 20')
      );
      expect(mockPrepare.bind).toHaveBeenNthCalledWith(2, 'user123', 'user123');
    });

    it('should clean up old records keeping only 20 most recent', async () => {
      const mockPrepare = {
        bind: vi.fn().mockReturnThis(),
        run: vi.fn().mockResolvedValue({ success: true }),
      };
      mockDb.prepare.mockReturnValue(mockPrepare);

      await api.recordVisit('user123', 42);

      const cleanupQuery = mockDb.prepare.mock.calls[1][0];
      expect(cleanupQuery).toContain('DELETE FROM user_recent_visits');
      expect(cleanupQuery).toContain('WHERE user_id = ?');
      expect(cleanupQuery).toContain('AND id NOT IN');
      expect(cleanupQuery).toContain('ORDER BY visited_at DESC');
      expect(cleanupQuery).toContain('LIMIT 20');
    });
  });

  describe('getRecentVisits', () => {
    it('should return recent visits ordered by visited_at DESC', async () => {
      const mockVisits = [
        { id: 3, user_id: 'user123', site_id: 42, visited_at: '2024-01-15T12:00:00Z' },
        { id: 2, user_id: 'user123', site_id: 41, visited_at: '2024-01-15T11:00:00Z' },
        { id: 1, user_id: 'user123', site_id: 40, visited_at: '2024-01-15T10:00:00Z' },
      ];

      const mockPrepare = {
        bind: vi.fn().mockReturnThis(),
        all: vi.fn().mockResolvedValue({ results: mockVisits }),
      };
      mockDb.prepare.mockReturnValue(mockPrepare);

      const result = await api.getRecentVisits('user123');

      expect(result).toEqual(mockVisits);
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM user_recent_visits')
      );
      expect(mockDb.prepare).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY visited_at DESC')
      );
      expect(mockPrepare.bind).toHaveBeenCalledWith('user123', 20);
    });

    it('should use default limit of 20', async () => {
      const mockPrepare = {
        bind: vi.fn().mockReturnThis(),
        all: vi.fn().mockResolvedValue({ results: [] }),
      };
      mockDb.prepare.mockReturnValue(mockPrepare);

      await api.getRecentVisits('user123');

      expect(mockPrepare.bind).toHaveBeenCalledWith('user123', 20);
    });

    it('should respect custom limit', async () => {
      const mockPrepare = {
        bind: vi.fn().mockReturnThis(),
        all: vi.fn().mockResolvedValue({ results: [] }),
      };
      mockDb.prepare.mockReturnValue(mockPrepare);

      await api.getRecentVisits('user123', 10);

      expect(mockPrepare.bind).toHaveBeenCalledWith('user123', 10);
    });

    it('should cap limit at 50', async () => {
      const mockPrepare = {
        bind: vi.fn().mockReturnThis(),
        all: vi.fn().mockResolvedValue({ results: [] }),
      };
      mockDb.prepare.mockReturnValue(mockPrepare);

      await api.getRecentVisits('user123', 100);

      expect(mockPrepare.bind).toHaveBeenCalledWith('user123', 50);
    });

    it('should enforce minimum limit of 1', async () => {
      const mockPrepare = {
        bind: vi.fn().mockReturnThis(),
        all: vi.fn().mockResolvedValue({ results: [] }),
      };
      mockDb.prepare.mockReturnValue(mockPrepare);

      await api.getRecentVisits('user123', 0);

      expect(mockPrepare.bind).toHaveBeenCalledWith('user123', 1);
    });

    it('should return empty array when no visits exist', async () => {
      const mockPrepare = {
        bind: vi.fn().mockReturnThis(),
        all: vi.fn().mockResolvedValue({ results: [] }),
      };
      mockDb.prepare.mockReturnValue(mockPrepare);

      const result = await api.getRecentVisits('user123');

      expect(result).toEqual([]);
    });
  });

  describe('migrateGuestData', () => {
  it('should migrate favorites and visits from guest to authenticated user', async () => {
    const mockBatchResults = [
      { success: true, meta: { changes: 3 } }, // favorites migrated
      { success: true, meta: { changes: 5 } }, // visits migrated
      { success: true, meta: { changes: 3 } }, // guest favorites deleted
      { success: true, meta: { changes: 5 } }, // guest visits deleted
    ];

    const mockPrepare = {
      bind: vi.fn().mockReturnThis(),
    };
    mockDb.prepare.mockReturnValue(mockPrepare);
    mockDb.batch.mockResolvedValue(mockBatchResults);

    const result = await api.migrateGuestData('guest_abc123', 'user1');

    expect(result).toEqual({
      favorites: 3,
      visits: 5,
    });

    // Verify batch was called with 4 statements
    expect(mockDb.batch).toHaveBeenCalledTimes(1);
    const batchStatements = mockDb.batch.mock.calls[0][0];
    expect(batchStatements).toHaveLength(4);

    // Verify prepare was called 4 times (one for each statement)
    expect(mockDb.prepare).toHaveBeenCalledTimes(4);

    // Verify favorites migration query
    expect(mockDb.prepare).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('INSERT INTO user_favorites (user_id, site_id, created_at)')
    );
    expect(mockDb.prepare).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('SELECT ?, site_id, created_at')
    );
    expect(mockDb.prepare).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('FROM user_favorites')
    );
    expect(mockDb.prepare).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('WHERE user_id = ?')
    );
    expect(mockDb.prepare).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('ON CONFLICT(user_id, site_id) DO NOTHING')
    );

    // Verify visits migration query
    expect(mockDb.prepare).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('INSERT INTO user_recent_visits (user_id, site_id, visited_at)')
    );
    expect(mockDb.prepare).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('SELECT ?, site_id, visited_at')
    );
    expect(mockDb.prepare).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('FROM user_recent_visits')
    );
    expect(mockDb.prepare).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('WHERE user_id = ?')
    );
    expect(mockDb.prepare).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('ON CONFLICT(user_id, site_id) DO UPDATE SET')
    );
    expect(mockDb.prepare).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('visited_at = MAX(visited_at, excluded.visited_at)')
    );

    // Verify guest favorites cleanup
    expect(mockDb.prepare).toHaveBeenNthCalledWith(
      3,
      'DELETE FROM user_favorites WHERE user_id = ?'
    );

    // Verify guest visits cleanup
    expect(mockDb.prepare).toHaveBeenNthCalledWith(
      4,
      'DELETE FROM user_recent_visits WHERE user_id = ?'
    );

    // Verify bind calls with correct parameters
    expect(mockPrepare.bind).toHaveBeenNthCalledWith(1, 'user1', 'guest_abc123');
    expect(mockPrepare.bind).toHaveBeenNthCalledWith(2, 'user1', 'guest_abc123');
    expect(mockPrepare.bind).toHaveBeenNthCalledWith(3, 'guest_abc123');
    expect(mockPrepare.bind).toHaveBeenNthCalledWith(4, 'guest_abc123');
  });

  it('should handle migration with no guest data', async () => {
    const mockBatchResults = [
      { success: true, meta: { changes: 0 } }, // no favorites
      { success: true, meta: { changes: 0 } }, // no visits
      { success: true, meta: { changes: 0 } }, // no favorites to delete
      { success: true, meta: { changes: 0 } }, // no visits to delete
    ];

    const mockPrepare = {
      bind: vi.fn().mockReturnThis(),
    };
    mockDb.prepare.mockReturnValue(mockPrepare);
    mockDb.batch.mockResolvedValue(mockBatchResults);

    const result = await api.migrateGuestData('guest_empty', 'user2');

    expect(result).toEqual({
      favorites: 0,
      visits: 0,
    });
  });

  it('should handle duplicate favorites with ON CONFLICT DO NOTHING', async () => {
    // Simulate scenario where authenticated user already has some favorites
    const mockBatchResults = [
      { success: true, meta: { changes: 2 } }, // only 2 new favorites (3 duplicates ignored)
      { success: true, meta: { changes: 5 } }, // all visits migrated
      { success: true, meta: { changes: 5 } }, // guest favorites deleted
      { success: true, meta: { changes: 5 } }, // guest visits deleted
    ];

    const mockPrepare = {
      bind: vi.fn().mockReturnThis(),
    };
    mockDb.prepare.mockReturnValue(mockPrepare);
    mockDb.batch.mockResolvedValue(mockBatchResults);

    const result = await api.migrateGuestData('guest_xyz789', 'user3');

    expect(result).toEqual({
      favorites: 2,
      visits: 5,
    });
  });

  it('should merge visit timestamps with MAX function', async () => {
    const mockBatchResults = [
      { success: true, meta: { changes: 3 } },
      { success: true, meta: { changes: 4 } }, // 4 visits updated with latest timestamp
      { success: true, meta: { changes: 3 } },
      { success: true, meta: { changes: 10 } },
    ];

    const mockPrepare = {
      bind: vi.fn().mockReturnThis(),
    };
    mockDb.prepare.mockReturnValue(mockPrepare);
    mockDb.batch.mockResolvedValue(mockBatchResults);

    const result = await api.migrateGuestData('guest_def456', 'user4');

    expect(result.visits).toBe(4);

    // Verify the MAX function is used in the query
    const visitsQuery = mockDb.prepare.mock.calls[1][0];
    expect(visitsQuery).toContain('visited_at = MAX(visited_at, excluded.visited_at)');
  });

  it('should throw error when batch operation fails', async () => {
    const mockPrepare = {
      bind: vi.fn().mockReturnThis(),
    };
    mockDb.prepare.mockReturnValue(mockPrepare);
    mockDb.batch.mockRejectedValue(new Error('Database error'));

    await expect(api.migrateGuestData('guest_fail', 'user5')).rejects.toThrow(
      '偏好数据迁移失败'
    );
  });

  it('should handle missing meta.changes in batch results', async () => {
    const mockBatchResults = [
      { success: true }, // no meta.changes
      { success: true, meta: {} }, // empty meta
      { success: true, meta: { changes: 1 } },
      { success: true, meta: { changes: 1 } },
    ];

    const mockPrepare = {
      bind: vi.fn().mockReturnThis(),
    };
    mockDb.prepare.mockReturnValue(mockPrepare);
    mockDb.batch.mockResolvedValue(mockBatchResults);

    const result = await api.migrateGuestData('guest_nometa', 'user6');

    // Should default to 0 when meta.changes is missing
    expect(result).toEqual({
      favorites: 0,
      visits: 0,
    });
  });

  it('should use D1 batch API for transactional operations', async () => {
    const mockBatchResults = [
      { success: true, meta: { changes: 1 } },
      { success: true, meta: { changes: 1 } },
      { success: true, meta: { changes: 1 } },
      { success: true, meta: { changes: 1 } },
    ];

    const mockPrepare = {
      bind: vi.fn().mockReturnThis(),
    };
    mockDb.prepare.mockReturnValue(mockPrepare);
    mockDb.batch.mockResolvedValue(mockBatchResults);

    await api.migrateGuestData('guest_batch', 'user7');

    // Verify batch was used (ensures atomicity)
    expect(mockDb.batch).toHaveBeenCalledTimes(1);

    // Verify all 4 operations are in the batch
    const batchStatements = mockDb.batch.mock.calls[0][0];
    expect(batchStatements).toHaveLength(4);
  });

  it('should clean up guest data after successful migration', async () => {
    const mockBatchResults = [
      { success: true, meta: { changes: 2 } },
      { success: true, meta: { changes: 3 } },
      { success: true, meta: { changes: 2 } },
      { success: true, meta: { changes: 3 } },
    ];

    const mockPrepare = {
      bind: vi.fn().mockReturnThis(),
    };
    mockDb.prepare.mockReturnValue(mockPrepare);
    mockDb.batch.mockResolvedValue(mockBatchResults);

    await api.migrateGuestData('guest_cleanup', 'user8');

    // Verify cleanup queries were prepared
    expect(mockDb.prepare).toHaveBeenCalledWith('DELETE FROM user_favorites WHERE user_id = ?');
    expect(mockDb.prepare).toHaveBeenCalledWith(
      'DELETE FROM user_recent_visits WHERE user_id = ?'
    );

    // Verify cleanup was bound with guest user ID
    expect(mockPrepare.bind).toHaveBeenCalledWith('guest_cleanup');
  });
});
});
