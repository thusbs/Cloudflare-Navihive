import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NavigationClient } from '../API/client';

export type MigrationStatus = 'idle' | 'checking' | 'migrating' | 'completed' | 'failed';

export interface PreferencesContextValue {
  // Favorites management
  favorites: number[];
  isFavorite: (siteId: number) => boolean;
  toggleFavorite: (siteId: number) => Promise<void>;

  // Recent visits
  recentVisits: number[];
  recordVisit: (siteId: number) => Promise<void>;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Migration status
  migrationStatus: MigrationStatus;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

interface PreferencesProviderProps {
  children: ReactNode;
  apiClient: NavigationClient;
}

export function PreferencesProvider({ children, apiClient }: PreferencesProviderProps) {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [recentVisits, setRecentVisits] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>('idle');

  // Load preferences data on mount
  useEffect(() => {
    const loadPreferences = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Load favorites and recent visits in parallel
        const [favoritesData, visitsData] = await Promise.all([
          apiClient.getFavorites(),
          apiClient.getRecentVisits(20),
        ]);

        setFavorites(favoritesData);
        setRecentVisits(visitsData);
        setMigrationStatus('completed');
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load preferences';
        setError(errorMessage);
        console.error('Failed to load preferences:', err);
        setMigrationStatus('failed');
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [apiClient]);

  const isFavorite = (siteId: number): boolean => {
    return favorites.includes(siteId);
  };

  const toggleFavorite = async (siteId: number): Promise<void> => {
    const wasFavorite = isFavorite(siteId);

    // Optimistic update
    setFavorites((prev) =>
      wasFavorite ? prev.filter((id) => id !== siteId) : [...prev, siteId]
    );

    try {
      if (wasFavorite) {
        await apiClient.removeFavorite(siteId);
      } else {
        await apiClient.addFavorite(siteId);
      }
    } catch (err) {
      // Rollback on error
      setFavorites((prev) =>
        wasFavorite ? [...prev, siteId] : prev.filter((id) => id !== siteId)
      );

      const errorMessage = err instanceof Error ? err.message : 'Failed to update favorite';
      setError(errorMessage);
      console.error('Failed to toggle favorite:', err);
      throw err;
    }
  };

  const recordVisit = async (siteId: number): Promise<void> => {
    // Optimistic update - add to front of recent visits
    setRecentVisits((prev) => {
      const filtered = prev.filter((id) => id !== siteId);
      return [siteId, ...filtered].slice(0, 20);
    });

    try {
      await apiClient.recordVisit(siteId);
    } catch (err) {
      console.error('Failed to record visit:', err);
      // Don't rollback or throw - visit recording is non-critical
    }
  };

  const contextValue: PreferencesContextValue = {
    favorites,
    isFavorite,
    toggleFavorite,
    recentVisits,
    recordVisit,
    isLoading,
    error,
    migrationStatus,
  };

  return (
    <PreferencesContext.Provider value={contextValue}>{children}</PreferencesContext.Provider>
  );
}

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
