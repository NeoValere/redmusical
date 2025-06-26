'use client';

import { useEffect } from 'react';
import { useDashboard } from './context/DashboardContext';
import ProfileStatus from './components/ProfileStatus';
import Statistics from './components/Statistics';
import VisibilitySettings from './components/VisibilitySettings';
import CurrentPlan from './components/CurrentPlan';
import { Box, useTheme, alpha, Typography, Button, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useRouter } from 'next/navigation'; // Import useRouter
import { createClient } from '@/utils/supabase/client'; // Import createClient

import { useState } from 'react'; // Import useState
export default function DashboardPage() {
  const { activeView, setPageTitle, userId, musicianProfile, userFullName, userEmail } = useDashboard(); // Consume userFullName, userEmail
  const theme = useTheme();
  const router = useRouter(); // Initialize useRouter
  const [isCreatingProfile, setIsCreatingProfile] = useState(false); // State for loading button

  const handleCreateMusicianProfile = async () => {
    if (!userId || !userFullName || !userEmail) {
      console.error('Missing user data for profile creation.');
      return;
    }

    setIsCreatingProfile(true);
    try {
      const response = await fetch('/api/register-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          fullName: userFullName,
          email: userEmail,
          role: 'musician',
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        router.push(responseData.redirectUrl); // Redirect to the specified URL from the API
      } else {
        const errorData = await response.json();
        console.error('Error creating musician profile:', errorData);
        alert(`Error al crear perfil de músico: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Network or unexpected error during profile creation:', error);
      alert('Ocurrió un error al intentar crear el perfil de músico.');
    } finally {
      setIsCreatingProfile(false);
    }
  };

  // This function should ideally trigger an API call to update visibility
  // and then the DashboardClientLayout's useEffect for fetching profiles
  // would re-run and update the context.
  const handleVisibilityChange = (newIsPublic: boolean) => {
    // Placeholder for API call to update musician profile visibility
    console.log(`Attempting to change visibility for userId: ${userId} to ${newIsPublic}`);
    // In a real application, you would call an API here:
    // fetch('/api/update-musician-visibility', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ userId, isPublic: newIsPublic }),
    // }).then(response => {
    //   if (response.ok) {
    //     // Optionally, trigger a re-fetch in the parent layout if needed
    //     // to ensure the context is updated.
    //   }
    // }).catch(error => console.error('Error updating visibility:', error));
  };

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
              {userId && musicianProfile ? (
                <ProfileStatus
                  userId={userId}
                  profileStatus={'Activo'}
                  isPublic={musicianProfile?.isPublic ?? false}
                />
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="h6" color="text.primary" mb={2}>
                    Aún no tienes un perfil de músico.
                  </Typography>
                  <Typography variant="body1" color="text.secondary" mb={3}>
                    Crea tu perfil para empezar a mostrar tu talento y/o ofrecer tus servicios.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleCreateMusicianProfile}
                    disabled={isCreatingProfile || !userFullName || !userEmail}
                  >
                    {isCreatingProfile ? <CircularProgress size={24} color="inherit" /> : 'Crear Perfil de Músico'}
                  </Button>
                </Box>
              )}
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
