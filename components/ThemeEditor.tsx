import React, { useState, useEffect } from 'react';
import { Button, Box, TextField, Select, MenuItem, InputLabel, FormControl, SelectChangeEvent } from '@mui/material';
import { useThemeContext, Preset } from '../lib/theme/MuiTheme';
import { PaletteOptions } from '@mui/material';

const ThemeEditor: React.FC = () => {
  const { theme, presets, setTheme, savePreset, deletePreset, revertToOriginal, setDefaultPreset, defaultPreset } = useThemeContext();
  const [presetName, setPresetName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [currentPalette, setCurrentPalette] = useState<PaletteOptions>(theme.palette);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setCurrentPalette(theme.palette);
    if (defaultPreset) {
      setSelectedPreset(defaultPreset);
    }
  }, [theme.palette, defaultPreset]);

  useEffect(() => {
    const currentPreset = presets.find(p => JSON.stringify(p.palette) === JSON.stringify(theme.palette));
    if (currentPreset) {
      setSelectedPreset(currentPreset.name);
    } else {
      setSelectedPreset('');
    }
  }, [theme.palette, presets]);

  const handleColorChange = (colorPath: string, value: string) => {
    const newPalette = { ...currentPalette };
    let palettePointer: any = newPalette;
    const pathParts = colorPath.split('.');
    pathParts.forEach((part, index) => {
      if (index === pathParts.length - 1) {
        palettePointer[part] = value;
      } else {
        if (!palettePointer[part]) {
          palettePointer[part] = {};
        }
        palettePointer = palettePointer[part];
      }
    });
    setCurrentPalette(newPalette);
    setTheme(newPalette);
    setIsDirty(true);
  };

  const handleSavePreset = () => {
    if (presetName) {
      savePreset({ name: presetName, palette: currentPalette });
      setPresetName('');
      setSelectedPreset(presetName);
      setIsDirty(false);
    }
  };

  const handleUpdatePreset = () => {
    if (selectedPreset) {
      savePreset({ name: selectedPreset, palette: currentPalette });
      setIsDirty(false);
    }
  };

  const handleSelectPreset = (event: SelectChangeEvent<string>) => {
    const name = event.target.value as string;
    setSelectedPreset(name);
    const preset = presets.find(p => p.name === name);
    if (preset) {
      setCurrentPalette(preset.palette);
      setTheme(preset.palette);
      setIsDirty(false);
    }
  };

  const handleDeletePreset = () => {
    if (selectedPreset) {
      deletePreset(selectedPreset);
      setSelectedPreset('');
      revertToOriginal();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
      <FormControl fullWidth>
        <InputLabel>{selectedPreset || 'Select Preset'}</InputLabel>
        <Select value={selectedPreset} onChange={handleSelectPreset} label={selectedPreset || 'Select Preset'}>
          {presets.map(p => (
            <MenuItem key={p.name} value={p.name}>{p.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Button variant="outlined" onClick={handleDeletePreset} disabled={!selectedPreset}>Delete Selected Preset</Button>
      <Button variant="contained" color="primary" onClick={() => setDefaultPreset(selectedPreset)} disabled={!selectedPreset}>Set as Default</Button>
      
      <TextField label="Primary Color" type="color" value={(currentPalette.primary as any)?.main || ''} onChange={e => handleColorChange('primary.main', e.target.value)} />
      <TextField label="Secondary Color" type="color" value={(currentPalette.secondary as any)?.main || ''} onChange={e => handleColorChange('secondary.main', e.target.value)} />
      <TextField label="Background Default" type="color" value={currentPalette.background?.default || ''} onChange={e => handleColorChange('background.default', e.target.value)} />
      <TextField label="Background Paper" type="color" value={currentPalette.background?.paper || ''} onChange={e => handleColorChange('background.paper', e.target.value)} />
      <TextField label="Text Primary" type="color" value={currentPalette.text?.primary || ''} onChange={e => handleColorChange('text.primary', e.target.value)} />
      <TextField label="Text Secondary" type="color" value={currentPalette.text?.secondary || ''} onChange={e => handleColorChange('text.secondary', e.target.value)} />

      <TextField label="New Preset Name" value={presetName} onChange={e => setPresetName(e.target.value)} />
      <Button variant="contained" onClick={handleSavePreset} disabled={!presetName}>Save as New Preset</Button>
      <Button variant="contained" onClick={handleUpdatePreset} disabled={!selectedPreset || !isDirty}>Save</Button>
      <Button variant="outlined" color="secondary" onClick={revertToOriginal}>Revert to Original</Button>
    </Box>
  );
};

export default ThemeEditor;
