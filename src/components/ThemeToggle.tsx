// src/components/ThemeToggle.tsx
import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

interface ThemeToggleProps {
  darkMode: boolean;
  onToggle: () => void;
}

export default function ThemeToggle({ darkMode, onToggle }: ThemeToggleProps) {
  return (
    <Tooltip title={darkMode ? '切换到浅色模式' : '切换到深色模式'}>
      <IconButton
        onClick={onToggle}
        color='inherit'
        aria-label='切换主题'
        sx={{
          p: 1.4,
          borderRadius: 999,
          bgcolor: darkMode ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255, 255, 255, 0.82)',
          border: '1px solid',
          borderColor: darkMode ? 'rgba(148, 163, 184, 0.18)' : 'rgba(15, 23, 42, 0.08)',
          boxShadow: darkMode
            ? '0 18px 32px rgba(2, 6, 23, 0.24)'
            : '0 18px 32px rgba(15, 118, 110, 0.14)',
          color: 'text.primary',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            bgcolor: darkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.96)',
            transform: 'translateY(-2px)',
            boxShadow: darkMode
              ? '0 22px 38px rgba(2, 6, 23, 0.28)'
              : '0 22px 38px rgba(15, 118, 110, 0.18)',
          },
        }}
      >
        {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
}
