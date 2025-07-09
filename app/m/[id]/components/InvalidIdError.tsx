'use client';

import React from 'react';
import Link from 'next/link';
import { Box, Typography, Button, Link as MuiLink, useTheme } from '@mui/material';
import { MusicNotesSimple } from 'phosphor-react';

export default function InvalidIdError() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        p: 3,
      }}
    >
      <MuiLink component={Link} href="/" color="inherit" underline="none" sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <MusicNotesSimple size={32} color={theme.palette.primary.main} weight="fill" style={{ marginRight: 3 }} />
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
          redmusical.ar
        </Typography>
      </MuiLink>
      <Typography variant="h4" component="h1" gutterBottom>
        Perfil no encontrado
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        El ID de perfil al que intentás acceder no es válido o no existe.
      </Typography>
      <Button component={Link} href="/" variant="contained" color="primary">
        Volver al inicio
      </Button>
    </Box>
  );
}
