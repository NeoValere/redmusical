'use client';

import RegisterCard from './components/RegisterCard';
import { Box, useTheme, alpha } from '@mui/material';

export default function RegisterPage() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 3, md: 6 }, // Added some padding for smaller screens
        px: { xs: 2, sm: 3, lg: 4 },
        bgcolor: theme.palette.background.default, // Very dark blue
        position: 'relative', // For the ::before pseudo-element
        overflow: 'hidden', // Ensure pseudo-element doesn't cause overflow
        '&::before': { // Background image with overlay
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
        '&::after': { // Semi-transparent gold overlay
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: alpha(theme.palette.primary.main, 0.7), // Gold overlay, adjust opacity as needed
          zIndex: 1,
        }
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 2 }}> {/* Ensure RegisterCard is above overlays */}
        <RegisterCard />
      </Box>
    </Box>
  );
}
