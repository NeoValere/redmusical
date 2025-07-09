'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Stack,
  IconButton,
  SelectChangeEvent,
} from '@mui/material';
import { X } from 'phosphor-react';

interface EditDetailsModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<MusicianDetails>) => void;
  currentData: Partial<MusicianDetails>;
}

export interface MusicianDetails {
  city: string | null;
  province: string | null;
  musicianOrBand: string | null;
  acceptsGigs: boolean | null;
  acceptsCollaborations: boolean | null;
}

const EditDetailsModal: React.FC<EditDetailsModalProps> = ({ open, onClose, onSave, currentData }) => {
  const [details, setDetails] = useState<Partial<MusicianDetails>>(currentData);

  useEffect(() => {
    setDetails(currentData);
  }, [currentData, open]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setDetails(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setDetails(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    onSave(details);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Editar Detalles del Perfil
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <X size={24} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ pt: 1 }}>
          <TextField
            name="city"
            label="Ciudad"
            value={details.city || ''}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            name="province"
            label="Provincia"
            value={details.province || ''}
            onChange={handleChange}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel id="musicianOrBand-label">Tipo de Músico</InputLabel>
            <Select
              labelId="musicianOrBand-label"
              name="musicianOrBand"
              value={details.musicianOrBand || ''}
              label="Tipo de Músico"
              onChange={handleSelectChange}
            >
              <MenuItem value=""><em>No especificado</em></MenuItem>
              <MenuItem value="Musician">Solista</MenuItem>
              <MenuItem value="Band">Banda</MenuItem>
              <MenuItem value="Group">Grupo</MenuItem>
              <MenuItem value="Choir">Coro</MenuItem>
              <MenuItem value="Orchestra">Orquesta</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={details.acceptsGigs || false}
                onChange={handleChange}
                name="acceptsGigs"
              />
            }
            label="Disponible para conciertos/eventos"
          />
          <FormControlLabel
            control={
              <Switch
                checked={details.acceptsCollaborations || false}
                onChange={handleChange}
                name="acceptsCollaborations"
              />
            }
            label="Abierto/a a colaboraciones"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">Guardar Cambios</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditDetailsModal;
