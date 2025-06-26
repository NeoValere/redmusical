'use client';

import React, { ReactNode } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, PaletteOptions } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

export interface Preset {
  name: string;
  palette: PaletteOptions;
}

export const initialTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#d6a841',
      contrastText: '#1A1A1A',
      light: 'rgb(222, 185, 103)',
      dark: 'rgb(149, 117, 45)'
    },
    secondary: {
      main: '#281349',
      contrastText: '#ffffff',
      light: 'rgb(152, 165, 183)',
      dark: 'rgb(88, 100, 116)'
    },
    background: {
      default: '#190d30',
      paper: '#12051f'
    },
    text: {
      primary: '#F0F0F0',
      secondary: '#B0B0B0',
      disabled: 'rgba(255, 255, 255, 0.5)'
    },
    success: {
      main: '#3bb273',
      light: 'rgb(98, 193, 143)',
      dark: 'rgb(41, 124, 80)',
      contrastText: 'rgba(0, 0, 0, 0.87)'
    },
    divider: 'rgba(255, 255, 255, 0.12)',
    common: {
      black: '#000',
      white: '#fff'
    },
    error: {
      main: '#f44336',
      light: '#e57373',
      dark: '#d32f2f',
      contrastText: '#fff'
    },
    warning: {
      main: '#ffa726',
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: 'rgba(0, 0, 0, 0.87)'
    },
    info: {
      main: '#29b6f6',
      light: '#4fc3f7',
      dark: '#0288d1',
      contrastText: 'rgba(0, 0, 0, 0.87)'
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
      400: '#bdbdbd',
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
      A100: '#f5f5f5',
      A200: '#eeeeee',
      A400: '#bdbdbd',
      A700: '#616161'
    },
    contrastThreshold: 3,
    tonalOffset: 0.2,
    action: {
      active: '#fff',
      hover: 'rgba(255, 255, 255, 0.08)',
      hoverOpacity: 0.08,
      selected: 'rgba(255, 255, 255, 0.16)',
      selectedOpacity: 0.16,
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
      disabledOpacity: 0.38,
      focus: 'rgba(255, 255, 255, 0.12)',
      focusOpacity: 0.12,
      activatedOpacity: 0.24
    }
  },
  typography: {
    fontFamily: ['Inter', 'Manrope', 'sans-serif'].join(','),
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.variant === 'contained' &&
            ownerState.color === 'primary' && {
              '&:hover': {
                backgroundColor: '#b78a34'
              }
            })
        })
      }
    }
  }
});
