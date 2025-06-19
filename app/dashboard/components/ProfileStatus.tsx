'use client';

import Link from 'next/link';
import { CheckCircle, Warning } from 'phosphor-react';
import { Box, Typography, Button, Paper, Link as MuiLink, useTheme } from '@mui/material';

interface ProfileStatusProps {
  userId: string;
  profileStatus: 'Activo' | 'Incompleto';
}

export default function ProfileStatus({ userId, profileStatus }: ProfileStatusProps) {
  const isActive = profileStatus === 'Activo';
  const theme = useTheme();

  return (
    <Paper sx={{ p: 3, mb: 4, borderRadius: '8px', bgcolor: 'background.paper' }}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 'semibold', mb: 2, color: 'text.primary' }}>
        Estado del Perfil
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {isActive ? (
          <CheckCircle size={24} style={{ marginRight: 8 }} color={theme.palette.success.main} weight="fill" />
        ) : (
          <Warning size={24} style={{ marginRight: 8 }} color={theme.palette.warning.main} weight="fill" />
        )}
        <Typography variant="body1" sx={{ color: isActive ? 'success.main' : 'warning.main' }}>
          Estado actual: {isActive ? 'Activo' : 'Tu perfil está incompleto'}
        </Typography>
      </Box>
      <Button
        component={Link}
        href={`/musicians/${userId}`}
        variant="contained"
        color="primary"
        sx={{
          mt: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 'fit-content',
          textTransform: 'none',
        }}
      >
        Ver Perfil Público
      </Button>
    </Paper>
  );
}
