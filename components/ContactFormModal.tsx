import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  CircularProgress,
  Typography,
  IconButton,
} from '@mui/material';
import { Send, Message, Close, Lock } from '@mui/icons-material';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface ContactFormModalProps {
  open: boolean;
  onClose: () => void;
  musicianName: string;
  currentUser: User | null;
}

const ContactFormModal: React.FC<ContactFormModalProps> = ({ open, onClose, musicianName, currentUser }) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log('Form submitted:', { message, musicianName, userId: currentUser?.id });
    setIsSubmitting(false);
    onClose();
  };

  const handleGoToRegister = () => {
    router.push('/register');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography color="primary" variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
            <Send sx={{ mr: 1  }} /> Contactar a {musicianName}
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {currentUser ? (
          <Box sx={{ mt: 1 }}>
            <TextField
              required
              id="message"
              label="Mensaje"
                type="text"
                fullWidth
                variant="outlined"
                multiline
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                InputProps={{
                  startAdornment: <Message sx={{ color: 'action.active', mr: 1, mt: 1 }} />,
                }}
              />
            </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Lock sx={{ fontSize: 48, color: 'action.disabled' }} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Inicia sesión para contactar
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              Para enviar un mensaje, necesitas tener una cuenta.
            </Typography>
            <Button variant="contained" onClick={handleGoToRegister}>
              Crear cuenta o Iniciar sesión
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={onClose} color="primary">
          Cancelar
        </Button>
        {currentUser && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={isSubmitting || !message}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ContactFormModal;
