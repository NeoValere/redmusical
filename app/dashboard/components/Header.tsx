'use client';

import { Box, Typography } from '@mui/material';

interface HeaderProps {
  userName: string;
}

export default function Header({ userName }: HeaderProps) {
  return (
    <Box component="header" sx={{ mb: 4 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary' }}>
        ¡Hola {userName}! Este es tu panel de Músico 🎸
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Desde acá podés gestionar tu perfil, revisar tu visibilidad y optimizar tu llegada a los contratantes.
      </Typography>
    </Box>
  );
}
