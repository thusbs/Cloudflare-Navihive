// src/components/SiteCard.tsx
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  IconButton, 
  Box 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { Site } from '../API/http';

interface SiteCardProps {
  site: Site;
  onEdit: (site: Site) => void;
  onDelete: (id: number) => void;
  onToggleFavorite: (id: number) => void;
  className?: string;
}

const SiteCard: React.FC<SiteCardProps> = ({
  site,
  onEdit,
  onDelete,
  onToggleFavorite,
  className = ''
}) => {
  const isFavorite = Boolean(site.is_favorite ?? site.isFavorite ?? false);

  return (
    <Card 
      className={`site-card ${className}`}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
        <CardMedia
          component="img"
          image={site.icon || '/default-icon.png'}
          alt={site.name}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            padding: '16px',
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, pt: 2, pb: 1, textAlign: 'center' }}>
        <Typography 
          variant="h6" 
          component="div" 
          noWrap 
          sx={{ 
            fontSize: { xs: '0.95rem', sm: '1.1rem' },
            fontWeight: 600 
          }}
        >
          {site.name}
        </Typography>
        {site.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ mt: 0.5, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
          >
            {site.description}
          </Typography>
        )}
      </CardContent>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, pb: 1 }}>
        <IconButton 
          size="small" 
          onClick={() => onToggleFavorite(site.id!)}
          color={isFavorite ? "warning" : "default"}
        >
          {isFavorite ? <StarIcon /> : <StarBorderIcon />}
        </IconButton>
        <IconButton size="small" onClick={() => onEdit(site)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" color="error" onClick={() => onDelete(site.id!)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </Card>
  );
};

export default SiteCard;
