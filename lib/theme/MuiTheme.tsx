'use client';

import React, { ReactNode, createContext, useContext, useState, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider, Theme, PaletteOptions } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';

export interface Preset {
  name: string;
  palette: PaletteOptions;
}

export const initialTheme = createTheme({
  palette: {
    primary: {
      main: '#d6a841',
      contrastText: '#1A1A1A',
    },
    secondary: {
      main: '#7f8fa6',
      contrastText: '#ffffff',
    },
    background: {
      default: '#082537',
      paper: '#183b4f',
    },
    text: {
      primary: '#F0F0F0',
      secondary: '#B0B0B0',
    },
    success: {
      main: '#3bb273',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
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
                backgroundColor: '#b78a34',
              },
            }),
        }),
      },
    },
   /*  MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#183b4f',
        }
      }
    } */
  },
});

const ThemeContext = createContext({
  theme: initialTheme,
  presets: [] as Preset[],
  defaultPreset: '',
  setTheme: (palette: PaletteOptions) => {},
  savePreset: (preset: Preset) => {},
  deletePreset: (presetName: string) => {},
  revertToOriginal: () => {},
  setDefaultPreset: (presetName: string) => {},
});

export const useThemeContext = () => useContext(ThemeContext);

export const MuiAppThemeProvider = ({ children }: { children: ReactNode }) => {
  const [originalTheme] = useState<Theme>(initialTheme);
  const [currentTheme, setCurrentTheme] = useState<Theme>(initialTheme);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [defaultPreset, setDefaultPresetState] = useState<string>('');

  useEffect(() => {
    const savedPresets = localStorage.getItem('themePresets');
    const defaultPresetName = localStorage.getItem('defaultPreset');
    const loadedPresets = savedPresets ? JSON.parse(savedPresets) : [];
    
    if (loadedPresets.length > 0) {
      setPresets(loadedPresets);
    }

    if (defaultPresetName) {
      setDefaultPresetState(defaultPresetName);
      const defaultPreset = loadedPresets.find((p: Preset) => p.name === defaultPresetName);
      if (defaultPreset) {
        const newTheme = createTheme({ ...originalTheme, palette: defaultPreset.palette });
        setCurrentTheme(newTheme);
      }
    }
  }, []);

  const setTheme = (palette: PaletteOptions) => {
    const newTheme = createTheme({ ...originalTheme, palette });
    setCurrentTheme(newTheme);
  };

  const savePreset = (preset: Preset) => {
    const newPresets = [...presets.filter(p => p.name !== preset.name), preset];
    setPresets(newPresets);
    localStorage.setItem('themePresets', JSON.stringify(newPresets));
  };

  const deletePreset = (presetName: string) => {
    const newPresets = presets.filter(p => p.name !== presetName);
    setPresets(newPresets);
    localStorage.setItem('themePresets', JSON.stringify(newPresets));
  };

  const revertToOriginal = () => {
    setCurrentTheme(originalTheme);
  };

  const setDefaultPreset = (presetName: string) => {
    localStorage.setItem('defaultPreset', presetName);
    setDefaultPresetState(presetName);
    const preset = presets.find(p => p.name === presetName);
    if (preset) {
      setTheme(preset.palette);
    }
  };

  const memoizedTheme = useMemo(() => currentTheme, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ theme: memoizedTheme, presets, setTheme, savePreset, deletePreset, revertToOriginal, setDefaultPreset, defaultPreset }}>
      <MuiThemeProvider theme={memoizedTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
