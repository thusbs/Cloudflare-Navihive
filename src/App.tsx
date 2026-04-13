import { useState, useEffect, useMemo } from 'react';
import { NavigationClient } from './API/client';
import { MockNavigationClient } from './API/mock';
import { Site, Group } from './API/http';
import { GroupWithSites } from './types';
import { useTheme } from './contexts/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import ViewModeToggle, { type ViewMode as BookmarkViewMode } from './components/ViewModeToggle';
import GroupCard from './components/GroupCard';
import SiteCard from './components/SiteCard';
import LoginForm from './components/LoginForm';
import SearchBox from './components/SearchBox';
import { prepareImportDataFromText } from './utils/bookmarkImport';
import { sanitizeCSS, isSecureUrl, extractDomain } from './utils/url';
import { SearchResultItem } from './utils/search';
import './App.css';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableGroupItem from './components/SortableGroupItem';
// Material UI 导入
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Paper,
  CssBaseline,
  Chip,
} from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import GitHubIcon from '@mui/icons-material/GitHub';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

const isDevEnvironment = import.meta.env.DEV;
const useRealApi = import.meta.env.VITE_USE_REAL_API === 'true';

const api =
  isDevEnvironment && !useRealApi
    ? new MockNavigationClient()
    : new NavigationClient(isDevEnvironment ? 'http://localhost:8788/api' : '/api');

enum SortMode {
  None,
  GroupSort,
  SiteSort,
}

type ContentFilter = 'all' | 'favorites' | 'recent';

const FAVORITE_SITE_IDS_KEY = 'navihive.favoriteSiteIds';
const RECENT_SITE_IDS_KEY = 'navihive.recentSiteIds';
const MAX_RECENT_SITES = 20;

function readStoredSiteIds(key: string): number[] {
  if (typeof window === 'undefined') return [];
  try {
    const rawValue = localStorage.getItem(key);
    if (!rawValue) return [];
    const parsedValue = JSON.parse(rawValue);
    if (!Array.isArray(parsedValue)) return [];
    return parsedValue.filter((value): value is number => typeof value === 'number');
  } catch {
    return [];
  }
}

function areIdListsEqual(current: number[], next: number[]): boolean {
  if (current.length !== next.length) return false;
  return current.every((value, index) => value === next[index]);
}

const DEFAULT_CONFIGS = {
  'site.title': '导航站',
  'site.name': '导航站',
  'site.customCss': '',
  'site.backgroundImage': '',
  'site.backgroundOpacity': '0.15',
  'site.iconApi': 'https://www.faviconextractor.com/favicon/{domain}?larger=true',
  'site.searchBoxEnabled': 'true',
  'site.searchBoxGuestEnabled': 'true',
};

function App() {
  const { theme } = useTheme();

  const [groups, setGroups] = useState<GroupWithSites[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>(SortMode.None);
  const [currentSortingGroupId, setCurrentSortingGroupId] = useState<number | null>(null);

  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthRequired, setIsAuthRequired] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  type ViewMode = 'readonly' | 'edit';
  const [viewMode, setViewMode] = useState<ViewMode>('readonly');
  const [bookmarkViewMode, setBookmarkViewMode] = useState<BookmarkViewMode>('card');
  const [contentFilter, setContentFilter] = useState<ContentFilter>('all');

  const [favoriteSiteIds, setFavoriteSiteIds] = useState<number[]>(() =>
    readStoredSiteIds(FAVORITE_SITE_IDS_KEY)
  );
  const [recentSiteIds, setRecentSiteIds] = useState<number[]>(() =>
    readStoredSiteIds(RECENT_SITE_IDS_KEY)
  );

  const [configs, setConfigs] = useState<Record<string, string>>(DEFAULT_CONFIGS);
  const [openConfig, setOpenConfig] = useState(false);
  const [tempConfigs, setTempConfigs] = useState<Record<string, string>>(DEFAULT_CONFIGS);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 1 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 3 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // ... 你的其他所有状态和函数保持不变（我只保留了必要的部分以节省篇幅，但实际替换时请保留你原来的所有函数）...

  // 新增：分组快捷栏点击滚动
  const scrollToGroup = (groupId: number) => {
    setContentFilter('all');
    setTimeout(() => {
      const element = document.getElementById(`group-${groupId}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // ... 你的原有所有函数（handleLogin, fetchData, handleSiteUpdate 等）保持不变 ...

  return (
    <>
      <CssBaseline />

      {/* Snackbar 等原有提示保持不变 */}

      <Box className='navihive-shell' sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* 你的原有 Hero 区域、SearchBox 等保持不变 */}

        {/* ==================== 新增：分组快捷栏（导航栏下方居中） ==================== */}
        {groups.length > 0 && (
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 100,
              backgroundColor: theme.palette.background.paper,
              borderBottom: `1px solid ${theme.palette.divider}`,
              py: 1.5,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            <Container maxWidth="lg">
              <Stack
                direction="row"
                spacing={1.5}
                justifyContent="center"
                sx={{ flexWrap: 'nowrap' }}
              >
                {groups.map((group) => (
                  <Chip
                    key={group.id}
                    label={`${group.name} (${group.sites.length})`}
                    onClick={() => scrollToGroup(group.id)}
                    clickable
                    sx={{
                      fontWeight: 600,
                      px: 2.5,
                      py: 1,
                      backgroundColor: theme.palette.primary.main,
                      color: '#fff',
                      '&:hover': { backgroundColor: theme.palette.primary.dark },
                    }}
                  />
                ))}
              </Stack>
            </Container>
          </Box>
        )}

        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* 你的原有内容保持不变（hero、spotlight、loading 等） */}

          {/* 分组渲染部分 - 加入响应式布局 */}
          {!loading && !error && (
            <Box sx={{ '& > *': { mb: 5 } }}>
              {displayGroups.map((group) => (
                <Box key={`group-${group.id}`} id={`group-${group.id}`}>
                  <GroupCard
                    group={group}
                    sortMode={sortMode === SortMode.None ? 'None' : 'SiteSort'}
                    currentSortingGroupId={currentSortingGroupId}
                    viewMode={viewMode}
                    bookmarkViewMode={bookmarkViewMode}
                    onUpdate={handleSiteUpdate}
                    onDelete={handleSiteDelete}
                    onSaveSiteOrder={handleSaveSiteOrder}
                    onStartSiteSort={startSiteSort}
                    onAddSite={handleOpenAddSite}
                    onUpdateGroup={handleGroupUpdate}
                    onDeleteGroup={handleGroupDelete}
                    configs={configs}
                    favoriteSiteIds={favoriteSiteIds}
                    onToggleFavorite={handleToggleFavorite}
                    onVisitSite={handleSiteVisit}
                    showManagementActions={contentFilter === 'all'}
                  >
                    <Box
                      sx={{
                        display: 'grid',
                        gap: '20px',
                        gridTemplateColumns: 'repeat(2, 1fr)',           // 移动端 2 列
                        '@media (min-width: 640px)': {
                          gridTemplateColumns: 'repeat(4, 1fr)',       // 平板 4 列
                        },
                        '@media (min-width: 1024px)': {
                          gridTemplateColumns: 'repeat(8, 1fr)',       // 桌面端 8 列
                        },
                      }}
                    >
                      {group.sites.map((site) => (
                        <SiteCard
                          key={site.id}
                          site={site}
                          onEdit={handleSiteUpdate}
                          onDelete={handleSiteDelete}
                          onToggleFavorite={handleToggleFavorite}
                          className="site-card"
                        />
                      ))}
                    </Box>
                  </GroupCard>
                </Box>
              ))}
            </Box>
          )}
        </Container>
      </Box>
    </>
  );
}

export default App;
