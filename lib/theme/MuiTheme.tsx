'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, PaletteMode } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

type ThemeContextType = {
  toggleColorMode: () => void;
  mode: PaletteMode;
};

const ColorModeContext = createContext<ThemeContextType | undefined>(undefined);

export const MuiAppThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<PaletteMode>('light');

  useEffect(() => {
    const storedMode = localStorage.getItem('mui-theme-mode') as PaletteMode;
    if (storedMode) {
      setMode(storedMode);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setMode('dark');
    }
  }, []);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
      mode,
    }),
    [mode],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                // palette for light mode
                primary: {
                  main: '#007bff', // Example light primary
                },
                secondary: {
                  main: '#6c757d', // Example light secondary
                },
                background: {
                  default: '#ffffff',
                  paper: '#f5f5f5',
                },
                text: {
                  primary: '#171717',
                  secondary: '#424242',
                },
              }
            : {
                // palette for dark mode
                primary: {
                  main: '#66b3ff', // Example dark primary
                },
                secondary: {
                  main: '#a0a0a0', // Example dark secondary
                },
                background: {
                  default: '#0a0a0a',
                  paper: '#1a1a1a',
                },
                text: {
                  primary: '#ededed',
                  secondary: '#bdbdbd',
                },
              }),
        },
        typography: {
          fontFamily: 'Arial, Helvetica, sans-serif',
        },
      }),
    [mode],
  );

  useEffect(() => {
    localStorage.setItem('mui-theme-mode', mode);
  }, [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ColorModeContext.Provider>
  );
};

export const useMuiTheme = () => {
  const context = useContext(ColorModeContext);
  if (context === undefined) {
    throw new Error('useMuiTheme must be used within a MuiAppThemeProvider');
  }
  return context;
};
