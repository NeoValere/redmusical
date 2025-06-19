'use client';

import React, { ReactNode, useMemo, useState, createContext, useContext } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, PaletteMode } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

// No MuiThemeContext or useMuiTheme needed if mode is fixed
// interface MuiThemeContextType {
//   toggleColorMode: () => void;
//   mode: PaletteMode;
// }

// const MuiThemeContext = createContext<MuiThemeContextType | undefined>(undefined);

// export const useMuiTheme = () => {
//   const context = useContext(MuiThemeContext);
//   if (context === undefined) {
//     throw new Error('useMuiTheme must be used within a MuiAppThemeProvider');
//   }
//   return context;
// };

export const MuiAppThemeProvider = ({ children }: { children: ReactNode }) => {
  // Mode is fixed to 'dark' (oscuro moderado)
  const mode: PaletteMode = 'dark';

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#d6a841', // Dorado principal
            contrastText: '#1A1A1A', // Texto oscuro para contraste con dorado
          },
          secondary: {
            main: '#7f8fa6', // Gris azulado secundario
            contrastText: '#ffffff',
          },
          background: {
            default: '#082537', // Azul muy oscuro (mencionado por el usuario)
            paper: '#183b4f',   // Azul verdoso oscuro (mencionado por el usuario)
          },
          text: {
            primary: '#F0F0F0',   // Casi blanco para texto principal
            secondary: '#B0B0B0', // Gris claro para texto secundario
          },
          success: {
            main: '#3bb273', 
          },
          divider: 'rgba(255, 255, 255, 0.12)', // Divisor más visible
        },
        typography: {
          fontFamily: ['Inter', 'Manrope', 'sans-serif'].join(','),
          h1: { fontWeight: 700 },
          h2: { fontWeight: 700 },
          h3: { fontWeight: 600 },
          h4: { fontWeight: 600 },
          h5: { fontWeight: 600 },
          h6: { fontWeight: 600 },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: ({ ownerState, theme }) => ({
                ...(ownerState.variant === 'contained' &&
                  ownerState.color === 'primary' && {
                    '&:hover': {
                      backgroundColor: '#b78a34', // Dorado más oscuro para hover
                    },
                  }),
              }),
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                 // Asegurar que el AppBar use el color de fondo de 'paper' del tema
                backgroundColor: '#183b4f', // Coincide con el nuevo background.paper
              }
            }
          }
        },
      }),
    [mode], // Aunque mode es fijo, useMemo lo necesita si estuviera en el scope.
            // Podríamos quitar useMemo si mode es realmente una constante global al provider.
            // Por ahora lo dejamos para mantener la estructura.
  );

  return (
    // <MuiThemeContext.Provider value={{ toggleColorMode, mode }}> // No longer needed
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
    // </MuiThemeContext.Provider> // No longer needed
  );
};
