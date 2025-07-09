'use client';

import Link from 'next/link';
import { CheckCircle, Warning, UserCirclePlus, Eye, PencilSimple } from 'phosphor-react';
import { Box, Typography, Button, Paper, useTheme, Stack } from '@mui/material'; // Removed Grid

interface ProfileStatusProps {
  userId: string;
  profileStatus: 'Activo' | 'Incompleto';
  isPublic: boolean; // Added isPublic prop
}

export default function ProfileStatus({ userId, profileStatus, isPublic }: ProfileStatusProps) {
  const isActive = profileStatus === 'Activo';
  const isVisible = isActive && isPublic; // Determine visibility based on isActive and isPublic
  const theme = useTheme();

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: '12px', bgcolor: 'background.paper' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: { xs: 2, md: 3 },
        }}
      >
        {/* Left Section */}
        <Box sx={{ flexGrow: 1, width: '100%' }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary' }}>
            Estado de tu Perfil
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1} mb={!isVisible && !isActive ? 1 : 0}>
            {isVisible ? (
              <CheckCircle size={28} color={theme.palette.success.main} weight="fill" />
            ) : isActive ? ( // Active but not public
              <Warning size={28} color={theme.palette.info.main} weight="fill" />
            ) : ( // Incomplete
              <Warning size={28} color={theme.palette.warning.main} weight="fill" />
            )}
            <Typography variant="subtitle1" sx={{ color: isVisible ? 'success.main' : isActive ? 'info.main' : 'warning.main', fontWeight: 'medium' }}>
              {isVisible ? '¡Tu perfil está activo y visible!' : isActive ? 'Tu perfil está activo pero no visible' : 'Perfil Incompleto'}
            </Typography>
          </Stack>
          {(!isVisible && isActive) && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Tu perfil está completo pero actualmente no es visible para otros usuarios. Puedes cambiar esto en la configuración de visibilidad.
            </Typography>
          )}
          {!isActive && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Completa la información necesaria para que quienes buscan músicos puedan encontrarte y conocer tu trabajo.
            </Typography>
          )}
        </Box>

        {/* Right Section (Buttons) */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{
            width: { xs: '100%', md: 'auto' },
            alignItems: { xs: 'stretch', md: 'center' },
            justifyContent: { md: 'flex-end' }
          }}
        >
          {!isActive && (
            <Button
              component={Link}
              href={`/m/${userId}/edit`} // Link to edit page
              variant="contained"
              color="primary"
              startIcon={<UserCirclePlus size={20} />}
              sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto'} }}
            >
              Completar Perfil
            </Button>
          )}
          <Button
            component={Link}
            href={`/m/${userId}`}
            target="_blank"
            variant="outlined"
            color="primary"
            startIcon={<Eye size={20} />}
            sx={{
              textTransform: 'none',
              width: { xs: '100%', sm: 'auto'},
              justifyContent: 'center',
              color: theme.palette.primary.main,
              borderColor: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: theme.palette.primary.main,
                color: '#ffffff', // Change text color to white on hover
                borderColor: theme.palette.primary.main,
              },
              '& .MuiButton-startIcon': {
                marginRight: '4px', // Adjust spacing between icon and text
              },
              textAlign: 'center', // Explicitly center the text
            }}
          >
            Ver Perfil Público
          </Button>
          {isActive && (
            <Button
              component={Link}
              href={`/m/${userId}/edit`}
              variant="contained"
              color="secondary"
              startIcon={<PencilSimple size={20} />}
              sx={{
                textTransform: 'none',
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              Editar Perfil
            </Button>
          )}
        </Stack>
      </Box>
    </Paper>
  );
}
