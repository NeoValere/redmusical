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
} from '@mui/material';

interface DataItem {
  id: string;
  name: string;
}

interface EditMusicalDnaModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { genres: DataItem[], instruments: DataItem[], skills: DataItem[] }) => Promise<void>;
  currentGenres: DataItem[];
  currentInstruments: DataItem[];
  currentSkills: DataItem[];
  allGenres: DataItem[];
  allInstruments: DataItem[];
  allSkills: DataItem[];
}

const EditMusicalDnaModal: React.FC<EditMusicalDnaModalProps> = ({
  open,
  onClose,
  onSave,
  currentGenres,
  currentInstruments,
  currentSkills,
  allGenres,
  allInstruments,
  allSkills,
}) => {
  const [selectedGenres, setSelectedGenres] = useState<DataItem[]>(currentGenres);
  const [selectedInstruments, setSelectedInstruments] = useState<DataItem[]>(currentInstruments);
  const [selectedSkills, setSelectedSkills] = useState<DataItem[]>(currentSkills);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelectedGenres(currentGenres);
    setSelectedInstruments(currentInstruments);
    setSelectedSkills(currentSkills);
  }, [open, currentGenres, currentInstruments, currentSkills]);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave({
      genres: selectedGenres,
      instruments: selectedInstruments,
      skills: selectedSkills,
    });
    setIsSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar ADN Musical</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <Autocomplete
            multiple
            options={allGenres}
            getOptionLabel={(option) => option.name}
            value={selectedGenres}
            onChange={(_, newValue) => setSelectedGenres(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Géneros Musicales" placeholder="Selecciona géneros" />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...rest } = getTagProps({ index });
                return <Chip key={key} label={option.name} {...rest} />;
              })
            }
          />
          <Autocomplete
            multiple
            options={allInstruments}
            getOptionLabel={(option) => option.name}
            value={selectedInstruments}
            onChange={(_, newValue) => setSelectedInstruments(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Instrumentos" placeholder="Selecciona instrumentos" />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...rest } = getTagProps({ index });
                return <Chip key={key} label={option.name} {...rest} />;
              })
            }
          />
          <Autocomplete
            multiple
            options={allSkills}
            getOptionLabel={(option) => option.name}
            value={selectedSkills}
            onChange={(_, newValue) => setSelectedSkills(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Habilidades Adicionales" placeholder="Selecciona habilidades" />
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

export default EditMusicalDnaModal;
