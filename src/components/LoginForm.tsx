import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Paper,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

interface LoginFormProps {
  onLogin: (username: string, password: string, rememberMe: boolean) => void;
  loading?: boolean;
  error?: string | null;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, loading = false, error = null }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password, rememberMe);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '100%',
        p: { xs: 2, sm: 4 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 5,
          width: '100%',
          maxWidth: { xs: '90%', sm: 400 },
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(180deg, rgba(8, 26, 38, 0.94), rgba(7, 19, 29, 0.9))'
              : 'linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(244, 250, 249, 0.88))',
          backdropFilter: 'blur(16px)',
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 30px 60px rgba(0, 0, 0, 0.32)'
              : '0 30px 60px rgba(15, 118, 110, 0.14)',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 'auto -20% -35% auto',
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'radial-gradient(circle, rgba(94, 234, 212, 0.18), transparent 70%)'
                : 'radial-gradient(circle, rgba(15, 118, 110, 0.16), transparent 70%)',
            pointerEvents: 'none',
          },
          ...(loading && {
            opacity: 0.92,
          }),
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 3,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              mb: 2,
              width: 64,
              height: 64,
              borderRadius: '50%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background:
                'linear-gradient(135deg, rgba(15, 118, 110, 0.95), rgba(249, 115, 22, 0.88))',
              color: 'white',
              boxShadow: '0 18px 32px rgba(15, 118, 110, 0.22)',
            }}
          >
            <LockOutlinedIcon fontSize='large' />
          </Box>
          <Typography
            variant='overline'
            sx={{ letterSpacing: '0.16em', color: 'primary.main', fontWeight: 800 }}
          >
            NaviHive Admin
          </Typography>
          <Typography component='h1' variant='h5' fontWeight='bold' textAlign='center'>
            导航站登录
          </Typography>
          <Typography variant='body2' color='text.secondary' textAlign='center' sx={{ mt: 1 }}>
            登录后可以管理分组、拖拽排序、调整样式，并维护只对自己可见的私密内容。
          </Typography>
        </Box>

        {error && (
          <Alert severity='error' sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component='form' onSubmit={handleSubmit} sx={{ position: 'relative', zIndex: 1 }}>
          <TextField
            margin='normal'
            required
            fullWidth
            id='username'
            label='用户名'
            name='username'
            autoComplete='username'
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
          />
          <TextField
            margin='normal'
            required
            fullWidth
            name='password'
            label='密码'
            type='password'
            id='password'
            autoComplete='current-password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                value='remember'
                color='primary'
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
            }
            label='记住我（一个月内免登录）'
            sx={{ mb: 2 }}
          />
          <Button
            type='submit'
            fullWidth
            variant='contained'
            color='primary'
            disabled={loading || !username || !password}
            size='large'
            sx={{
              py: 1.5,
              mt: 2,
              mb: 2,
              borderRadius: 999,
            }}
          >
            {loading ? <CircularProgress size={24} color='inherit' /> : '登录'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginForm;
