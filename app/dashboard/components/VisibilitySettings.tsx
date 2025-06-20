'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Switch, FormControlLabel, Stack, Divider, useTheme, CircularProgress } from '@mui/material';
import { alpha } from '@mui/material/styles'; // Import alpha
import { Eye, ChatCircleDots, ShieldWarning } from 'phosphor-react'; // Example icons

interface VisibilitySettingsProps {
  userId: string | null;
  initialIsPublic: boolean;
  onVisibilityChange: (newIsPublic: boolean) => void;
}

export default function VisibilitySettings({ userId, initialIsPublic, onVisibilityChange }: VisibilitySettingsProps) {
  console.log('VisibilitySettings mounted with:', { userId, initialIsPublic });
  const [showProfilePublicly, setShowProfilePublicly] = useState(initialIsPublic);
  const [allowDirectMessages, setAllowDirectMessages] = useState(true); // This can be fetched/updated similarly if needed
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    console.log('VisibilitySettings initialIsPublic changed:', initialIsPublic);
    setShowProfilePublicly(initialIsPublic);
  }, [initialIsPublic]);

  const handlePublicProfileToggle = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handlePublicProfileToggle triggered. Current userId:', userId);
    if (!userId) {
      console.error('No userId available for update.');
      return;
    }

    const newIsPublic = event.target.checked;
    console.log('Attempting to change isPublic to:', newIsPublic);
    setIsLoading(true);
    setShowProfilePublicly(newIsPublic); // Optimistic update

    try {
      const response = await fetch(`/api/musicians/${userId}/update-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: newIsPublic }),
      });

      if (response.ok) {
        console.log('API call successful. New isPublic:', newIsPublic);
        onVisibilityChange(newIsPublic);
      } else {
        const errorData = await response.json();
        console.error('Failed to update profile visibility. Status:', response.status, 'Error:', errorData);
        // Revert optimistic update on failure
        setShowProfilePublicly(!newIsPublic);
      }
    } catch (error) {
      console.error('Network or unexpected error updating profile visibility:', error);
      // Revert optimistic update on failure
      setShowProfilePublicly(!newIsPublic);
    } finally {
      setIsLoading(false);
      console.log('Loading state reset.');
    }
  };

  const handleDirectMessagesToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAllowDirectMessages(event.target.checked);
    // TODO: Implement API call for direct messages if needed
    // console.log(`Allow direct messages changed to: ${event.target.checked}`);
  };

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: '12px', bgcolor: 'background.paper' }}>
      <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 2.5, color: 'text.primary' }}>
        Configuración de Visibilidad
      </Typography>

      <Stack spacing={2} divider={<Divider flexItem sx={{ borderColor: theme.palette.divider }} />}>
        <FormControlLabel
          control={
            isLoading ? <CircularProgress size={24} sx={{mr: 1.7, ml: 0.8}} /> :
            <Switch
              checked={showProfilePublicly}
              onChange={handlePublicProfileToggle}
              color="primary"
              disabled={!userId || isLoading}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Eye size={24} style={{ marginRight: theme.spacing(1.5), color: theme.palette.text.secondary }} />
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'text.primary' }}>
                  Mostrar mi perfil públicamente
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Permite que todos vean tu perfil y aparezcas en búsquedas.
                </Typography>
              </Box>
            </Box>
          }
          sx={{ justifyContent: 'space-between', ml: 0, width: '100%' }}
          labelPlacement="start"
        />

        <FormControlLabel
          control={
            <Switch
              checked={allowDirectMessages}
              onChange={handleDirectMessagesToggle}
              color="primary"
              disabled={!showProfilePublicly || !userId} // Example: disable if profile is not public or no user
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ChatCircleDots size={24} style={{ marginRight: theme.spacing(1.5), color: theme.palette.text.secondary }} />
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'text.primary' }}>
                  Permitir mensajes directos
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Habilita que quienes buscan músicos puedan enviarte mensajes.
                </Typography>
              </Box>
            </Box>
          }
          sx={{ justifyContent: 'space-between', ml: 0, width: '100%' }}
          labelPlacement="start"
        />
      </Stack>

      {!showProfilePublicly && (
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2.5, p: 1.5, bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: '8px' }}>
          <ShieldWarning size={28} color={theme.palette.warning.main} />
          <Typography variant="body2" color="warning.contrastText" sx={{color: theme.palette.warning.main, fontWeight:'medium'}}>
            Tu perfil no está visible públicamente. Nadie podrá encontrarte ni contactarte hasta que actives la visibilidad.
          </Typography>
        </Stack>
      )}
       <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 3 }}>
        Los cambios en la visibilidad pueden tardar unos minutos en aplicarse.
      </Typography>
    </Paper>
  );
}
