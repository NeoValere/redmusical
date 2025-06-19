'use client';

import React, { ReactNode, useMemo } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, PaletteMode } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

export const MuiAppThemeProvider = ({ children }: { children: ReactNode }) => {
  const mode: PaletteMode = 'dark';

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
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};
