'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Database } from '@/lib/database.types';
import { FcGoogle } from 'react-icons/fc';
import {
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Link as MuiLink,
  Stack,
  useTheme, // Added
  alpha // Added
} from '@mui/material';
import Link from 'next/link'; // Added
import { MusicNotesSimple } from 'phosphor-react'; // Added

export default function LoginCard() {
  const theme = useTheme(); // Added
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    setError('Error de configuración: Faltan las variables de entorno de Supabase.');
    return null;
  }

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Por favor, completá todos los campos.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else if (data.user) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.user_metadata.role === 'musician') {
        router.push(`/m/${user.id}`);
      } else if (user && user.user_metadata.role === 'contractor') {
        router.push('/dashboard/search');
      } else {
        router.push('/dashboard');
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <Paper
      elevation={6}
      sx={{
        maxWidth: 480, // Slightly wider for balance
        mx: 'auto',
        p: { xs: 3, sm: 4 },
        borderRadius: 2,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Logo Section */}
      <MuiLink component={Link} href="/" color="inherit" underline="none" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
        <MusicNotesSimple size={36} color={theme.palette.primary.main} weight="fill" style={{ marginRight: "3px" }} />
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
          redmusical.ar
        </Typography>
      </MuiLink>

      <Typography variant="h4" component="h1" align="center" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1 }}>
        Iniciar Sesión
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Accedé a tu cuenta para continuar conectando.
      </Typography>

      <form onSubmit={handleLogin}>
        <Stack spacing={2.5} sx={{ mb: 3 }}>
          <TextField
            label="Email"
            type="email"
            id="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            variant="outlined"
            sx={{
              '& :-webkit-autofill': {
                WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
                WebkitTextFillColor: theme.palette.text.primary,
                caretColor: theme.palette.text.primary,
                transition: 'background-color 5000s ease-in-out 0s',
              },
              '& :-webkit-autofill:hover, & :-webkit-autofill:focus, & :-webkit-autofill:active': {
                WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
                WebkitTextFillColor: theme.palette.text.primary,
                caretColor: theme.palette.text.primary,
              },
            }}
          />
          <TextField
            label="Contraseña"
            type="password"
            id="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            variant="outlined"
            sx={{
              '& :-webkit-autofill': {
                WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
                WebkitTextFillColor: theme.palette.text.primary,
                caretColor: theme.palette.text.primary,
                transition: 'background-color 5000s ease-in-out 0s',
              },
              '& :-webkit-autofill:hover, & :-webkit-autofill:focus, & :-webkit-autofill:active': {
                WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
                WebkitTextFillColor: theme.palette.text.primary,
                caretColor: theme.palette.text.primary,
              },
            }}
          />
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5, bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.light }}>
            {error}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary" // Uses theme's primary color (gold) and contrast text
          fullWidth
          disabled={loading}
          size="large"
          sx={{ py: 1.5, fontWeight: 'bold', mb: 2, fontSize: '1.1rem' }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Ingresar'}
        </Button>
      </form>

      <Button
        onClick={handleGoogleLogin}
        variant="outlined" // Changed to outlined
        color="primary" // Uses theme's primary color for border and text
        fullWidth
        disabled={loading}
        size="large"
        startIcon={<FcGoogle size={22} />}
        sx={{
          py: 1.5,
          fontWeight: 'bold',
          mb: 3,
          fontSize: '1.1rem',
          borderColor: theme.palette.primary.main,
          color: theme.palette.primary.main,
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            borderColor: theme.palette.primary.light,
          }
        }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Ingresar con Google'}
      </Button>

      <Typography variant="body2" align="center" color="text.secondary">
        ¿No tenés cuenta?{' '}
        <MuiLink
          component={Link}
          href="/register"
          underline="hover"
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 'medium',
            '&:hover': {
              color: theme.palette.primary.light,
            }
          }}
        >
          Registrate acá
        </MuiLink>
      </Typography>
    </Paper>
  );
}
