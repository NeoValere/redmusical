'use client';

import { useEffect } from 'react';
import { useDashboard } from './context/DashboardContext';
import ProfileStatus from './components/ProfileStatus';
import Statistics from './components/Statistics';
import VisibilitySettings from './components/VisibilitySettings';
import CurrentPlan from './components/CurrentPlan';
import { Box, useTheme, alpha } from '@mui/material';
import Grid from '@mui/material/Grid';

export default function DashboardPage() {
  const { activeView, setPageTitle, userId, musicianProfile } = useDashboard();
  const theme = useTheme();

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
