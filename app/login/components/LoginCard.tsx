'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/database.types';
import { FcGoogle } from 'react-icons/fc';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Link as MuiLink,
  Stack
} from '@mui/material';

export default function LoginCard() {
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

  const supabase = createClientComponentClient<Database>({
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  });

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
        router.push(`/musicians/${user.id}`);
      } else if (user && user.user_metadata.role === 'contractor') {
        router.push('/dashboard');
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
    <Paper elevation={3} sx={{ maxWidth: 400, mx: 'auto', p: 4, borderRadius: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Iniciar sesión
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
        Accedé a tu cuenta para editar tu perfil, buscar músicos o gestionar tus favoritos.
      </Typography>

      <form onSubmit={handleLogin}>
        <Stack spacing={2} sx={{ mb: 3 }}>
          <TextField
            label="Email"
            type="email"
            id="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            variant="outlined"
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
          />
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
          sx={{ mb: 2, color: '#e3e4e7' }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar sesión →'}
        </Button>
      </form>

      <Button
        onClick={handleGoogleLogin}
        variant="contained"
        fullWidth
        disabled={loading}
        startIcon={<FcGoogle />}
        sx={{ mb: 3, bgcolor: '#53887a', '&:hover': { bgcolor: '#4a7a6e' }, color: '#e3e4e7' }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar sesión con Google'}
      </Button>

      <Typography variant="body2" align="center" color="text.secondary">
        ¿No tenés cuenta?{' '}
        <MuiLink href="/register" underline="hover">
          Registrate acá
        </MuiLink>
      </Typography>
    </Paper>
  );
}
