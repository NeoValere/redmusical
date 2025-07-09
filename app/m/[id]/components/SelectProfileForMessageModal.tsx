'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Box,
} from '@mui/material';
import { User, Briefcase } from 'phosphor-react';

interface SelectProfileForMessageModalProps {
  open: boolean;
  onClose: () => void;
  onSelectProfile: (role: 'musician' | 'contractor') => void;
  availableRoles: {
    isMusician: boolean;
    isContractor: boolean;
  };
}

const SelectProfileForMessageModal: React.FC<SelectProfileForMessageModalProps> = ({
  open,
  onClose,
  onSelectProfile,
  availableRoles,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Enviar mensaje como...</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 3 }}>
          Elige qué perfil quieres usar para iniciar esta conversación.
        </Typography>
        <Stack spacing={2}>
          {availableRoles.isMusician && (
            <Button
              variant="outlined"
              startIcon={<User />}
              onClick={() => onSelectProfile('musician')}
              fullWidth
              size="large"
            >
              Perfil de Músico
            </Button>
          )}
          {availableRoles.isContractor && (
            <Button
              variant="outlined"
              startIcon={<Briefcase />}
              onClick={() => onSelectProfile('contractor')}
              fullWidth
              size="large"
            >
              Perfil de Búsqueda
            </Button>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectProfileForMessageModal;
