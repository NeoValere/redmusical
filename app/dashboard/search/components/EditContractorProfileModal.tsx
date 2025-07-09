'use client';

import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useState, ChangeEvent } from 'react';

interface Contractor {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  location: string | null;
  isPremium: boolean;
  createdAt: Date;
  profileImageUrl: string | null;
  companyName: string | null;
  websiteUrl: string | null;
  bio: string | null;
}

interface EditContractorProfileModalProps {
  open: boolean;
  onClose: () => void;
  contractor: Contractor;
  onSave: (data: Contractor) => void;
}

export default function EditContractorProfileModal({
  open,
  onClose,
  contractor,
  onSave,
}: EditContractorProfileModalProps) {
  const [formData, setFormData] = useState<Contractor>(contractor);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value } as Contractor));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" component="h2">
          Editar Perfil
        </Typography>
        <TextField
          margin="normal"
          fullWidth
          label="Nombre Completo"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          fullWidth
          label="Ubicación"
          name="location"
          value={formData.location}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          fullWidth
          label="Nombre de la Empresa"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          fullWidth
          label="URL del Sitio Web"
          name="websiteUrl"
          value={formData.websiteUrl}
          onChange={handleChange}
        />
        <TextField
          margin="normal"
          fullWidth
          label="Biografía"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          multiline
          rows={4}
        />
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleSave}
          sx={{ mt: 2 }}
        >
          Guardar
        </Button>
      </Box>
    </Modal>
  );
}
