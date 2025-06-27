"use client";

import { Box } from '@mui/material';

const GlobalBackground = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url('/images/cool_bg.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.05,
        filter: 'blur(10px)',
        transform: 'scale(1.1)',
        zIndex: -1,
      }}
    />
  );
};

export default GlobalBackground;
