'use client';

import { ChartBar } from 'phosphor-react';
import { Box, Typography, Paper, SvgIcon } from '@mui/material';

export default function Statistics() {
  return (
    <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 'semibold', mb: 2, color: 'text.primary' }}>
        Estadísticas de tu perfil
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4 }}>
        <ChartBar size={64} style={{ marginBottom: 16 }} />
        <Typography variant="body1" color="text.secondary" align="center">
          Las estadísticas estarán disponibles pronto. Podrás ver cuántas veces visitan tu perfil, clics en enlaces y solicitudes de contacto.
        </Typography>
      </Box>
    </Paper>
  );
}
