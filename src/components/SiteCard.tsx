// src/components/SiteCard.tsx
import { useState, memo } from 'react';
import { Site } from '../API/http';
import SiteSettingsModal from './SiteSettingsModal';
import { extractDomain } from '../utils/url';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// 引入Material UI组件
import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Skeleton,
  IconButton,
  Box,
  Fade,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

interface SiteCardProps {
  site: Site;
  onUpdate: (updatedSite: Site) => void;
  onDelete: (siteId: number) => void;
  isEditMode?: boolean;
  viewMode?: 'readonly' | 'edit'; // 访问模式
  index?: number;
  iconApi?: string; // 添加iconApi属性
  isFavorite?: boolean;
  onToggleFavorite?: (site: Site) => void;
  onVisit?: (site: Site) => void;
  contextLabel?: string;
}

// 使用memo包装组件以减少不必要的重渲染
const SiteCard = memo(function SiteCard({
  site,
  onUpdate,
  onDelete,
  isEditMode = false,
  viewMode = 'edit', // 默认为编辑模式
  index = 0,
  iconApi, // 添加iconApi参数
  isFavorite = false,
  onToggleFavorite,
  onVisit,
  contextLabel,
}: SiteCardProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [iconError, setIconError] = useState(!site.icon);
  const [imageLoaded, setImageLoaded] = useState(false);

  // 使用dnd-kit的useSortable hook
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `site-${site.id || index}`,
    disabled: !isEditMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 9999 : 'auto',
    opacity: isDragging ? 0.8 : 1,
    position: 'relative' as const,
  };

  // 如果没有图标，使用首字母作为图标
  const fallbackIcon = site.name.charAt(0).toUpperCase();
  const domain = extractDomain(site.url) || site.url;

  // 处理设置按钮点击
  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止卡片点击事件
    e.preventDefault(); // 防止默认行为
    setShowSettings(true);
  };

  // 处理关闭设置
  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  // 处理卡片点击
  const handleCardClick = () => {
    if (!isEditMode && site.url) {
      onVisit?.(site);
      window.open(site.url, '_blank');
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onToggleFavorite?.(site);
  };

  // 处理图标加载错误
  const handleIconError = () => {
    setIconError(true);
  };

  // 处理图片加载完成
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // 卡片内容
  const cardContent = (
    <Box
      sx={{
        height: '100%',
        position: 'relative',
        transition: 'transform 0.35s ease, filter 0.35s ease',
        ...(!isEditMode && {
          '&:hover': {
            transform: 'translateY(-6px)',
            filter: 'saturate(1.05)',
          },
        }),
      }}
    >
      <Card
        sx={{
          height: '100%',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 4,
          transition: 'box-shadow 0.35s ease, border-color 0.35s ease',
          border: '1px solid',
          borderColor: isFavorite ? 'secondary.main' : 'divider',
          boxShadow: isDragging ? 10 : isFavorite ? 6 : 2,
          '&:hover': !isEditMode
            ? {
                boxShadow: isFavorite ? 9 : 6,
                borderColor: 'primary.main',
              }
            : {},
          overflow: 'hidden',
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(33, 33, 33, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {!isEditMode && (onToggleFavorite || viewMode === 'edit') && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 3,
              display: 'flex',
              gap: 1,
              opacity: { xs: 1, md: isFavorite ? 1 : 0 },
              transform: 'translateY(-4px)',
              transition: 'opacity 0.2s ease, transform 0.2s ease',
              '.MuiCardActionArea-root:hover &': {
                opacity: 1,
                transform: 'translateY(0)',
              },
            }}
          >
            {onToggleFavorite && (
              <IconButton
                size='small'
                onClick={handleFavoriteClick}
                aria-label={isFavorite ? '取消收藏' : '加入收藏'}
                sx={{
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(7, 19, 29, 0.84)'
                      : 'rgba(255,255,255,0.72)',
                  backdropFilter: 'blur(10px)',
                  color: isFavorite ? 'secondary.main' : 'text.secondary',
                  boxShadow: 2,
                  '&:hover': {
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(7, 19, 29, 0.96)'
                        : 'rgba(255,255,255,0.92)',
                    color: 'secondary.main',
                  },
                }}
              >
                {isFavorite ? (
                  <StarRoundedIcon fontSize='small' />
                ) : (
                  <StarBorderRoundedIcon fontSize='small' />
                )}
              </IconButton>
            )}

            {viewMode === 'edit' && (
              <IconButton
                size='small'
                onClick={handleSettingsClick}
                aria-label='网站设置'
                sx={{
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(7, 19, 29, 0.84)'
                      : 'rgba(255,255,255,0.72)',
                  backdropFilter: 'blur(10px)',
                  color: 'text.primary',
                  boxShadow: 2,
                  '&:hover': {
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(7, 19, 29, 0.96)'
                        : 'rgba(255,255,255,0.92)',
                  },
                }}
              >
                <SettingsIcon fontSize='small' />
              </IconButton>
            )}
          </Box>
        )}

        {isEditMode ? (
          <Box
            sx={{
              height: '100%',
              p: { xs: 1.5, sm: 2 },
              cursor: 'grab',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box position='absolute' top={8} right={8}>
              <DragIndicatorIcon fontSize='small' color='primary' />
            </Box>
            {/* 图标和名称 */}
            <Box display='flex' alignItems='center' mb={1}>
              {!iconError && site.icon ? (
                <Box position='relative' mr={1.5} width={32} height={32} flexShrink={0}>
                  <Skeleton
                    variant='rounded'
                    width={32}
                    height={32}
                    sx={{
                      display: !imageLoaded ? 'block' : 'none',
                      position: 'absolute',
                    }}
                  />
                  <Fade in={imageLoaded} timeout={500}>
                    <Box
                      component='img'
                      src={site.icon}
                      alt={site.name}
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1,
                        objectFit: 'cover',
                      }}
                      onError={handleIconError}
                      onLoad={handleImageLoad}
                    />
                  </Fade>
                </Box>
              ) : (
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    mr: 1.5,
                    borderRadius: 1,
                    bgcolor: 'primary.light',
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 1,
                    borderColor: 'primary.main',
                    opacity: 0.8,
                  }}
                >
                  {fallbackIcon}
                </Box>
              )}
              <Typography
                variant='subtitle1'
                fontWeight='medium'
                noWrap
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                {site.name}
              </Typography>
            </Box>

            {/* 描述 */}
            <Typography
              variant='body2'
              color='text.secondary'
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                flexGrow: 1,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              }}
            >
              {site.description || '暂无描述'}
            </Typography>
          </Box>
        ) : (
          <CardActionArea onClick={handleCardClick} sx={{ height: '100%' }}>
            <CardContent
              sx={{
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                p: { xs: 1.5, sm: 2 },
                '&:last-child': { pb: { xs: 1.5, sm: 2 } },
              }}
            >
              {/* 图标和名称 */}
              <Box display='flex' alignItems='center' mb={1}>
                {!iconError && site.icon ? (
                  <Box position='relative' mr={1.5} width={32} height={32} flexShrink={0}>
                    <Skeleton
                      variant='rounded'
                      width={32}
                      height={32}
                      sx={{
                        display: !imageLoaded ? 'block' : 'none',
                        position: 'absolute',
                      }}
                    />
                    <Fade in={imageLoaded} timeout={500}>
                      <Box
                        component='img'
                        src={site.icon}
                        alt={site.name}
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 1,
                          objectFit: 'cover',
                        }}
                        onError={handleIconError}
                        onLoad={handleImageLoad}
                      />
                    </Fade>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      mr: 1.5,
                      borderRadius: 1,
                      bgcolor: 'primary.light',
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 1,
                      borderColor: 'primary.main',
                      opacity: 0.8,
                    }}
                  >
                    {fallbackIcon}
                  </Box>
                )}
                <Typography
                  variant='subtitle1'
                  fontWeight='medium'
                  noWrap
                  sx={{
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  }}
                >
                  {site.name}
                </Typography>
              </Box>

              {/* 描述 */}
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  flexGrow: 1,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  minHeight: 40,
                }}
              >
                {site.description || '暂无描述'}
              </Typography>

              <Box
                sx={{
                  mt: 1.5,
                  pt: 1.25,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  {contextLabel && (
                    <Typography
                      variant='caption'
                      sx={{
                        display: 'block',
                        color: 'primary.main',
                        fontWeight: 700,
                        letterSpacing: 0.2,
                      }}
                      noWrap
                    >
                      {contextLabel}
                    </Typography>
                  )}
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {domain}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    flexShrink: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1,
                    py: 0.5,
                    borderRadius: 999,
                    bgcolor: 'action.hover',
                    color: 'text.secondary',
                  }}
                >
                  <Typography variant='caption'>访问</Typography>
                  <OpenInNewIcon sx={{ fontSize: 14 }} />
                </Box>
              </Box>
            </CardContent>
          </CardActionArea>
        )}
      </Card>
    </Box>
  );

  if (isEditMode) {
    return (
      <>
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
          {cardContent}
        </div>

        {showSettings && (
          <SiteSettingsModal
            site={site}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onClose={handleCloseSettings}
            iconApi={iconApi} // 传递iconApi给SiteSettingsModal
          />
        )}
      </>
    );
  }

  return (
    <>
      {cardContent}

      {showSettings && (
        <SiteSettingsModal
          site={site}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onClose={handleCloseSettings}
          iconApi={iconApi} // 传递iconApi给SiteSettingsModal
        />
      )}
    </>
  );
});

export default SiteCard;
