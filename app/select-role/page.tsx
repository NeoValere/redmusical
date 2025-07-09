'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { MusicNotes, Users, MagnifyingGlass, MusicNotesSimple } from 'phosphor-react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Link as MuiLink,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import Link from 'next/link';

export default function SelectRolePage() {
  const theme = useTheme();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasMusicianProfile, setHasMusicianProfile] = useState(false);
  const [hasContractorProfile, setHasContractorProfile] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const roleFromUrl = searchParams.get('role');

  const handleRoleSelection = useCallback(async (role: string) => {
    setSelectedRole(role);
    setIsLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('No se encontró el usuario. Por favor, intentá iniciar sesión de nuevo.');
        setIsLoading(false);
        return;
      }

      const userFullName = user.user_metadata.full_name || user.email || 'Unknown User';
      const userEmail = user.email;

      const createProfile = async (profileRole: string) => {
        const response = await fetch('/api/register-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            fullName: userFullName,
            email: userEmail,
            role: profileRole,
          }),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || `Error al crear el perfil de ${profileRole}.`);
        }
        return response.json();
      };

      if (role === 'both') {
        await Promise.all([
          createProfile('musician'),
          createProfile('contractor')
        ]);

        router.push('/dashboard');
      } else {
        const result = await createProfile(role);
        const { redirectUrl } = result;

        router.push(redirectUrl || '/dashboard');
      }

    } catch (err: unknown) {
      console.error('Unexpected error during role selection:', err);
      setError( 'Ocurrió un error inesperado.');
    } finally {
      setIsLoading(false);
    }
  }, [supabase, router]);

  useEffect(() => {
    let isMounted = true;

    const checkAndProcessRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (isMounted) router.push('/login');
        return;
      }

      const [musicianProfileRes, contractorProfileRes] = await Promise.all([
        fetch(`/api/register-profile?userId=${user.id}&role=musician`),
        fetch(`/api/register-profile?userId=${user.id}&role=contractor`)
      ]);

      if (!isMounted) return;

      const musicianData = await musicianProfileRes.json();
      const contractorData = await contractorProfileRes.json();

      setHasMusicianProfile(musicianData.exists);
      setHasContractorProfile(contractorData.exists);

      if (musicianData.exists && contractorData.exists) {
        if (isMounted) router.push('/dashboard');
        return;
      }

      if (roleFromUrl) {
        if (roleFromUrl === 'musician' && !musicianData.exists) {
          handleRoleSelection(roleFromUrl);
        } else if (roleFromUrl === 'contractor' && !contractorData.exists) {
          handleRoleSelection(roleFromUrl);
        } else if (isMounted) {
          if (roleFromUrl === 'musician') router.push('/dashboard');
          else if (roleFromUrl === 'contractor') router.push('/dashboard/search');
        }
      }
    };

    checkAndProcessRole();

    return () => {
      isMounted = false;
    };
  }, [roleFromUrl, router, supabase, handleRoleSelection]);

  const getWelcomeMessage = () => {
    if (hasMusicianProfile && !hasContractorProfile) {
      return 'Ya tenés un perfil de músico. ¿Querés activar también el modo búsqueda?';
    }
    if (!hasMusicianProfile && hasContractorProfile) {
      return 'Ya tenés el modo búsqueda activado. ¿Querés crear también un perfil de músico?';
    }
    return 'Para empezar, contanos, ¿qué rol vas a cumplir en redmusical.ar?';
  };


  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        p: { xs: 2, sm: 4 },
      }}
    >
      <Paper
        elevation={6}
        sx={{
          maxWidth: 480,
          mx: 'auto',
          p: { xs: 3, sm: 4 },
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
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
          ¡Hola!
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          {getWelcomeMessage()}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2.5, bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.light }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2.5}>
          {!hasMusicianProfile && (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              disabled={isLoading}
              size="large"
              startIcon={<MusicNotes size={20} />}
              onClick={() => handleRoleSelection('musician')}
              sx={{ py: 1.5, fontWeight: 'bold', fontSize: '1.1rem' }}
            >
              {isLoading && selectedRole === 'musician' ? <CircularProgress size={24} color="inherit" /> : 'Soy músico'}
            </Button>
          )}
          {!hasContractorProfile && (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              disabled={isLoading}
              size="large"
              startIcon={<MagnifyingGlass size={20} />}
              onClick={() => handleRoleSelection('contractor')}
              sx={{ py: 1.5, fontWeight: 'bold', fontSize: '1.1rem' }}
            >
              {isLoading && selectedRole === 'contractor' ? <CircularProgress size={24} color="inherit" /> : 'Activar modo búsqueda'}
            </Button>
          )}
          {(!hasMusicianProfile && !hasContractorProfile) && (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              disabled={isLoading}
              size="large"
              startIcon={<Users size={20} />}
              onClick={() => handleRoleSelection('both')}
              sx={{ py: 1.5, fontWeight: 'bold', fontSize: '1.1rem' }}
            >
              {isLoading && selectedRole === 'both' ? <CircularProgress size={24} color="inherit" /> : 'Soy ambos'}
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
