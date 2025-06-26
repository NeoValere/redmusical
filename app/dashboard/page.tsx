'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useDashboard } from './context/DashboardContext';
import ProfileStatus from './components/ProfileStatus';
import Statistics from './components/Statistics';
import VisibilitySettings from './components/VisibilitySettings';
import CurrentPlan from './components/CurrentPlan';
import { Box, useTheme, alpha } from '@mui/material';
import Grid from '@mui/material/Grid';

interface MusicianProfile {
  id: string;
  userId: string;
  isPublic: boolean;
}

export default function DashboardPage() {
  const { activeView, setPageTitle } = useDashboard();
  const [userId, setUserId] = useState<string | null>(null);
  const [musicianProfile, setMusicianProfile] = useState<MusicianProfile | null>(null);
  const supabase = createClient();
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const musicianProfileRes = await fetch(`/api/register-profile?userId=${user.id}&role=musician`);
        const musicianData = await musicianProfileRes.json();
        if (musicianData.exists) {
          setMusicianProfile(musicianData.profile as MusicianProfile);
        }
      } else {
        router.push('/login');
      }
    };
    fetchUserProfile();
  }, [supabase, router]);

  useEffect(() => {
    switch (activeView) {
      case 'mi-perfil':
        setPageTitle('Mi Perfil');
        break;
      case 'estadisticas':
        setPageTitle('Estadísticas');
        break;
      case 'visibilidad':
        setPageTitle('Visibilidad');
        break;
      case 'mi-plan':
        setPageTitle('Mi Plan');
        break;
      default:
        setPageTitle('Dashboard');
    }
  }, [activeView, setPageTitle]);

  const handleVisibilityChange = (newIsPublic: boolean) => {
    setMusicianProfile(prevProfile => {
      if (prevProfile) {
        return { ...prevProfile, isPublic: newIsPublic };
      }
      return null;
    });
  };

  return (
    <>
      {activeView === 'mi-perfil' && (
        <Box
          component="section"
          id="mi-perfil-section"
          sx={{
            mb: 4,
            p: { xs: 2, sm: 3 },
            backgroundColor: alpha(theme.palette.background.paper, 0.7),
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: 2,
            boxShadow: theme.shadows[2],
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Grid container spacing={3}>
            <Grid size={12}>
              {userId && <ProfileStatus
                userId={userId}
                profileStatus={musicianProfile ? 'Activo' : 'Incompleto'}
                isPublic={musicianProfile?.isPublic ?? false}
              />}
            </Grid>
          </Grid>
        </Box>
      )}

      {activeView === 'estadisticas' && (
        <Box
          component="section"
          id="estadisticas-section"
          sx={{
            mb: 4,
            p: { xs: 2, sm: 3 },
            backgroundColor: alpha(theme.palette.background.paper, 0.7),
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: 2,
            boxShadow: theme.shadows[2],
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Statistics />
        </Box>
      )}

      {activeView === 'visibilidad' && (
        <Box
          component="section"
          id="visibilidad-section"
          sx={{
            mb: 4,
            p: { xs: 2, sm: 3 },
            backgroundColor: alpha(theme.palette.background.paper, 0.7),
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: 2,
            boxShadow: theme.shadows[2],
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          {userId && <VisibilitySettings
            userId={userId}
            initialIsPublic={musicianProfile?.isPublic ?? false}
            onVisibilityChange={handleVisibilityChange}
          />}
        </Box>
      )}

      {activeView === 'mi-plan' && (
        <Box
          component="section"
          id="mi-plan-section"
          sx={{
            mb: 4,
            p: { xs: 2, sm: 3 },
            backgroundColor: alpha(theme.palette.background.paper, 0.7),
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderRadius: 2,
            boxShadow: theme.shadows[2],
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <CurrentPlan />
        </Box>
      )}
    </>
  );
}
