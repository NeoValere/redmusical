'use client';

import { useState } from 'react';
import { Box, Typography, Paper, Switch, FormControlLabel } from '@mui/material';

export default function VisibilitySettings() {
  const [showProfilePublicly, setShowProfilePublicly] = useState(true);
  const [allowDirectMessages, setAllowDirectMessages] = useState(true);

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 'semibold', mb: 2, color: 'text.primary' }}>
        Configuración de visibilidad
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'text.primary' }}>Mostrar mi perfil públicamente</Typography>
        <Switch
          checked={showProfilePublicly}
          onChange={(e) => setShowProfilePublicly(e.target.checked)}
          color="primary"
        />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="body1" sx={{ fontWeight: 'medium', color: 'text.primary' }}>Permitir mensajes directos</Typography>
        <Switch
          checked={allowDirectMessages}
          onChange={(e) => setAllowDirectMessages(e.target.checked)}
          color="primary"
        />
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Al desactivar tu visibilidad, nadie podrá ver tu perfil público.
      </Typography>
    </Paper>
  );
}
