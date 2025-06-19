'use client';

import React from 'react';
import { Button } from '@mui/material';
import { useMuiTheme } from '../lib/theme/MuiTheme';

const MuiThemeToggle = () => {
  const { toggleColorMode, mode } = useMuiTheme();

  return (
    <Button
      onClick={toggleColorMode}
      variant="contained"
      color="primary"
      sx={{
        textTransform: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        '&:hover': {
          opacity: 0.9,
        },
      }}
    >
      {mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    </Button>
  );
};

export default MuiThemeToggle;
