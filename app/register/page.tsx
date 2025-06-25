'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Register from './components/Register';
import { Box, useTheme, alpha, CircularProgress, Typography } from '@mui/material';

function RegisterPageContent() {
  const theme = useTheme();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') || 'musician';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 3, md: 6 },
        px: { xs: 2, sm: 3, lg: 4 },
        bgcolor: theme.palette.background.default,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'url(/images/musicians-bw.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: alpha(theme.palette.primary.main, 0.7),
          zIndex: 1,
        }
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Register initialRole={initialRole} />
      </Box>
    </Box>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando...</Typography>
      </Box>
    }>
      <RegisterPageContent />
    </Suspense>
  );
}
