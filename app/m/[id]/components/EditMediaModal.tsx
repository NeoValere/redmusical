'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { v4 as uuidv4 } from 'uuid';

interface AudioTrack {
  id: string;
  title: string;
  url: string;
}

interface EditMediaModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { audioTracks: Omit<AudioTrack, 'id'>[] }) => Promise<void>;
  currentAudioTracks: AudioTrack[];
}

const EditMediaModal: React.FC<EditMediaModalProps> = ({
  open,
  onClose,
  onSave,
  currentAudioTracks,
}) => {
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Give each track a unique ID for local state management if it doesn't have one
    const tracksWithIds = currentAudioTracks.map(track => ({
      ...track,
      id: (track as any).id || uuidv4(),
    }));
    setAudioTracks(tracksWithIds);
  }, [open, currentAudioTracks]);

  const handleTrackChange = useCallback((id: string, field: 'title' | 'url', value: string) => {
    setAudioTracks(prev =>
      prev.map(track => (track.id === id ? { ...track, [field]: value } : track))
    );
  }, []);

  const handleAddTrack = useCallback(() => {
    setAudioTracks(prev => [...prev, { id: uuidv4(), title: '', url: '' }]);
  }, []);

  const handleRemoveTrack = useCallback((id: string) => {
    setAudioTracks(prev => prev.filter(track => track.id !== id));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    // Strip the local 'id' before saving
    const tracksToSave = audioTracks.map(({ title, url }) => ({ title, url }));
    await onSave({
      audioTracks: tracksToSave,
    });
    setIsSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Editar Videos</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {audioTracks.map((track, index) => (
            <Stack key={track.id} direction="row" spacing={1} alignItems="center">
              <TextField
                label="Título del Video"
                value={track.title}
                onChange={(e) => handleTrackChange(track.id, 'title', e.target.value)}
                fullWidth
                size="small"
              />
              <TextField
                label="URL (YouTube)"
                value={track.url}
                onChange={(e) => handleTrackChange(track.id, 'url', e.target.value)}
                fullWidth
                size="small"
              />
              <IconButton onClick={() => handleRemoveTrack(track.id)} color="error" size="small">
                <DeleteIcon />
              </IconButton>
            </Stack>
          ))}
          <Button
            onClick={handleAddTrack}
            startIcon={<AddIcon />}
            variant="outlined"
            size="small"
            sx={{ alignSelf: 'flex-start' }}
          >
            Añadir Video
          </Button>
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

export default EditMediaModal;
