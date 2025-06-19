'use client';

import React, { ReactNode, useMemo, useState, createContext, useContext } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, PaletteMode } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

interface MuiThemeContextType {
  toggleColorMode: () => void;
  mode: PaletteMode;
}

const MuiThemeContext = createContext<MuiThemeContextType | undefined>(undefined);

export const useMuiTheme = () => {
  const context = useContext(MuiThemeContext);
  if (context === undefined) {
    throw new Error('useMuiTheme must be used within a MuiAppThemeProvider');
  }
  return context;
};

export const MuiAppThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<PaletteMode>('dark');

  const toggleColorMode = React.useCallback(() => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#d6a841', // Título destacado, Botones principales
          },
          secondary: {
            main: '#7f8fa6', // Íconos secundarios
          },
          background: {
            default: '#0e1d2d', // Fondo principal
            paper: '#1d2c3b', // Paneles secundarios
          },
          text: {
            primary: '#e3e4e7', // Texto principal
            secondary: '#7f8fa6', // Íconos secundarios (reusing secondary color for consistency)
          },
          success: {
            main: '#3bb273', // Links activos (verde claro)
          },
          divider: 'rgba(255,255,255,0.06)', // Bordes/sombras suaves
        },
        typography: {
          fontFamily: ['Inter', 'Manrope', 'sans-serif'].join(','),
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                '&:hover': {
                  backgroundColor: '#b78a34', // Botones principales hover
                },
              },
            },
          },
        },
      }),
    [mode],
  );

  return (
    <MuiThemeContext.Provider value={{ toggleColorMode, mode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </MuiThemeContext.Provider>
  );
};
