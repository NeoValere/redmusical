'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  Autocomplete,
  Chip,
  InputAdornment,
  Typography,
} from '@mui/material';

interface DataItem {
  id: string;
  name: string;
}

interface EditLogisticsModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { availability: DataItem[], preferences: DataItem[], hourlyRate: number | null }) => Promise<void>;
  currentAvailability: DataItem[];
  currentPreferences: DataItem[];
  currentHourlyRate: number | null;
  allAvailability: DataItem[];
  allPreferences: DataItem[];
}

const EditLogisticsModal: React.FC<EditLogisticsModalProps> = ({
  open,
  onClose,
  onSave,
  currentAvailability,
  currentPreferences,
  currentHourlyRate,
  allAvailability,
  allPreferences,
}) => {
  const [selectedAvailability, setSelectedAvailability] = useState<DataItem[]>(currentAvailability);
  const [selectedPreferences, setSelectedPreferences] = useState<DataItem[]>(currentPreferences);
  const [hourlyRate, setHourlyRate] = useState<number | null>(currentHourlyRate);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelectedAvailability(currentAvailability);
    setSelectedPreferences(currentPreferences);
    setHourlyRate(currentHourlyRate);
  }, [open, currentAvailability, currentPreferences, currentHourlyRate]);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave({
      availability: selectedAvailability,
      preferences: selectedPreferences,
      hourlyRate: hourlyRate,
    });
    setIsSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar Logística</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Autocomplete
            multiple
            options={allAvailability}
            getOptionLabel={(option) => option.name}
            value={selectedAvailability}
            onChange={(_, newValue) => setSelectedAvailability(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Disponibilidad" placeholder="Selecciona disponibilidad" />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...rest } = getTagProps({ index });
                return <Chip key={key} label={option.name} {...rest} />;
              })
            }
          />
          <TextField
            label="Tarifa por Hora (USD) (Opcional)"
            type="number"
            value={hourlyRate || ''}
            onChange={(e) => setHourlyRate(e.target.value ? parseFloat(e.target.value) : null)}
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
          <Autocomplete
            multiple
            options={allPreferences}
            getOptionLabel={(option) => option.name}
            value={selectedPreferences}
            onChange={(_, newValue) => setSelectedPreferences(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Preferencias Adicionales" placeholder="Selecciona preferencias" />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...rest } = getTagProps({ index });
                return <Chip key={key} label={option.name} {...rest} />;
              })
            }
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained" disabled={isSaving}>
          {isSaving ? 'Guardando...' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditLogisticsModal;
