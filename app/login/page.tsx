'use client'; // Added 'use client' as useTheme is a client hook

import LoginCard from './components/LoginCard';
import { Box, useTheme, alpha } from '@mui/material'; // Added MUI imports

export default function LoginPage() {
  const theme = useTheme(); // Added theme hook

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 3, md: 6 },
        px: { xs: 2, sm: 3, lg: 4 },
        bgcolor: theme.palette.background.default, // Very dark blue
        position: 'relative', 
        overflow: 'hidden', 
        '&::before': { // Background image
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
          bgcolor: alpha(theme.palette.primary.main, 0.7), // Gold overlay
          zIndex: 1,
        }
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 2 }}> {/* Ensure LoginCard is above overlays */}
        <LoginCard />
      </Box>
    </Box>
  );
}
