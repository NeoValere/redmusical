'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PencilSimpleLine, FloppyDisk } from 'phosphor-react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Container,
  Stack,
  Checkbox,
  FormControlLabel,
  Avatar,
  InputLabel,
} from '@mui/material';

interface MusicianProfile {
  id: string;
  fullName: string;
  location?: string;
  instruments: string[];
  genres: string[];
  bio?: string;
  hourlyRate?: number;
  availability: string[];
  youtubeUrl?: string;
  soundcloudUrl?: string;
  instagramUrl?: string;
  profileImageUrl?: string;
}

const EditMusicianPage = () => {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [musicianId, setMusicianId] = useState<string | null>(null);
  const [profile, setProfile] = useState<MusicianProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  useEffect(() => {
    const pathSegments = window.location.pathname.split('/');
    const id = pathSegments[2];
    if (id) {
      setMusicianId(id);
      fetchMusicianProfile(id);
    } else {
      setError('Musician ID not found in URL.');
      setLoading(false);
    }
  }, []);

  const fetchMusicianProfile = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        router.push('/login');
        return;
      }
      const user = session.user;

      const response = await fetch(`/api/musicians/${id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch musician profile: ${response.statusText}`);
      }
      const data = await response.json();
      setProfile(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => prev ? { ...prev, [name]: value } : null);
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'instruments' | 'genres' | 'availability') => {
    const { value } = e.target;
    const newItems = value.split(',').map(item => item.trim()).filter(item => item !== '');
    setProfile(prev => prev ? { ...prev, [field]: newItems } : null);
    setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleCheckboxChange = (day: string) => {
    setProfile(prev => {
      if (!prev) return null;
      const currentAvailability = prev.availability || [];
      if (currentAvailability.includes(day)) {
        return { ...prev, availability: currentAvailability.filter(d => d !== day) };
      } else {
        return { ...prev, availability: [...currentAvailability, day] };
      }
    });
    setFormErrors(prev => ({ ...prev, availability: '' }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!profile?.fullName || profile.fullName.length < 2) {
      errors.fullName = 'Nombre completo es requerido y debe tener al menos 2 caracteres.';
    }
    if (!profile?.location) {
      errors.location = 'Ubicación es requerida.';
    }
    if (!profile?.instruments || profile.instruments.length === 0) {
      errors.instruments = 'Al menos un instrumento es requerido.';
    }
    if (!profile?.genres || profile.genres.length === 0) {
      errors.genres = 'Al menos un género musical es requerido.';
    }
    if (profile?.hourlyRate !== undefined && (isNaN(profile.hourlyRate) || profile.hourlyRate <= 0)) {
      errors.hourlyRate = 'Honorarios base debe ser un número positivo.';
    }
    if (!profile?.availability || profile.availability.length === 0) {
      errors.availability = 'Al menos un día de disponibilidad es requerido.';
    }

    const urlRegex = /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/[a-zA-Z0-9]+\.[^\s]{2,}|[a-zA-Z0-9]+\.[^\s]{2,})$/i;
    if (profile?.youtubeUrl && !urlRegex.test(profile.youtubeUrl)) {
      errors.youtubeUrl = 'URL de YouTube inválida.';
    }
    if (profile?.soundcloudUrl && !urlRegex.test(profile.soundcloudUrl)) {
      errors.soundcloudUrl = 'URL de SoundCloud inválida.';
    }
    if (profile?.instagramUrl && !urlRegex.test(profile.instagramUrl)) {
      errors.instagramUrl = 'URL de Instagram inválida.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user || session.user.id !== musicianId) {
        setError('Unauthorized access.');
        setLoading(false);
        return;
      }
      const user = session.user;

      const response = await fetch(`/api/musicians/${musicianId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar el perfil.');
      }

      alert('Perfil actualizado correctamente');
      router.push(`/musicians/${musicianId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando perfil...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Alert severity="error">Error: {error}</Alert>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Typography variant="h6" color="text.secondary">No se encontró el perfil del músico.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary', display: 'flex', alignItems: 'center' }}>
            Editar Mi Perfil <PencilSimpleLine size={32} style={{ marginLeft: 8 }} />
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Completá todos los datos que quieras mostrar públicamente.
          </Typography>

          <form onSubmit={handleSubmit}>
            {/* 1. Información personal básica */}
            <Box component="section" sx={{ mb: 4 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'semibold', mb: 2, color: 'text.primary' }}>
                1. Información personal básica
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Nombre completo"
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={profile.fullName || ''}
                  onChange={handleChange}
                  placeholder="Tu nombre artístico o real"
                  fullWidth
                  variant="outlined"
                  error={!!formErrors.fullName}
                  helperText={formErrors.fullName}
                />
                <TextField
                  label="Ubicación (Ciudad / Provincia)"
                  type="text"
                  id="location"
                  name="location"
                  value={profile.location || ''}
                  onChange={handleChange}
                  placeholder="Ej: CABA, Buenos Aires"
                  fullWidth
                  variant="outlined"
                  error={!!formErrors.location}
                  helperText={formErrors.location}
                />
              </Stack>
            </Box>

            {/* 2. Detalles artísticos */}
            <Box component="section" sx={{ mb: 4 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'semibold', mb: 2, color: 'text.primary' }}>
                2. Detalles artísticos
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Instrumentos principales"
                  type="text"
                  id="instruments"
                  name="instruments"
                  value={profile.instruments?.join(', ') || ''}
                  onChange={(e) => handleArrayChange(e as React.ChangeEvent<HTMLInputElement>, 'instruments')}
                  placeholder="Ej: guitarra, batería, violín (separados por coma)"
                  fullWidth
                  variant="outlined"
                  error={!!formErrors.instruments}
                  helperText={formErrors.instruments}
                />
                <TextField
                  label="Géneros musicales"
                  type="text"
                  id="genres"
                  name="genres"
                  value={profile.genres?.join(', ') || ''}
                  onChange={(e) => handleArrayChange(e as React.ChangeEvent<HTMLInputElement>, 'genres')}
                  placeholder="Ej: Jazz, Rock, Clásico (separados por coma)"
                  fullWidth
                  variant="outlined"
                  error={!!formErrors.genres}
                  helperText={formErrors.genres}
                />
                <TextField
                  label="Biografía / Descripción"
                  id="bio"
                  name="bio"
                  value={profile.bio || ''}
                  onChange={handleChange}
                  placeholder="Contá brevemente tu experiencia musical, estilo, etc."
                  multiline
                  rows={4}
                  inputProps={{ maxLength: 500 }}
                  fullWidth
                  variant="outlined"
                  helperText={`${profile.bio?.length || 0}/500 caracteres.`}
                />
              </Stack>
            </Box>

            {/* 3. Disponibilidad y honorarios */}
            <Box component="section" sx={{ mb: 4 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'semibold', mb: 2, color: 'text.primary' }}>
                3. Disponibilidad y honorarios
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Honorarios base (ARS por hora)"
                  type="number"
                  id="hourlyRate"
                  name="hourlyRate"
                  value={profile.hourlyRate || ''}
                  onChange={handleChange}
                  placeholder="Ejemplo: 5000"
                  fullWidth
                  variant="outlined"
                  error={!!formErrors.hourlyRate}
                  helperText={formErrors.hourlyRate}
                />
                <Box>
                  <InputLabel sx={{ mb: 1, fontWeight: 'bold', color: 'text.primary' }}>Disponibilidad semanal</InputLabel>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr' }, gap: 1 }}>
                    {daysOfWeek.map(day => (
                      <FormControlLabel
                        key={day}
                        control={
                          <Checkbox
                            checked={profile.availability?.includes(day) || false}
                            onChange={() => handleCheckboxChange(day)}
                            name="availability"
                          />
                        }
                        label={day}
                      />
                    ))}
                  </Box>
                  {formErrors.availability && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                      {formErrors.availability}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Box>

            {/* 4. Multimedia y enlaces externos */}
            <Box component="section" sx={{ mb: 4 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'semibold', mb: 2, color: 'text.primary' }}>
                4. Multimedia y enlaces externos
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Link YouTube (opcional)"
                  type="url"
                  id="youtubeUrl"
                  name="youtubeUrl"
                  value={profile.youtubeUrl || ''}
                  onChange={handleChange}
                  placeholder="https://youtube.com/tu-video"
                  fullWidth
                  variant="outlined"
                  error={!!formErrors.youtubeUrl}
                  helperText={formErrors.youtubeUrl}
                />
                <TextField
                  label="Link SoundCloud (opcional)"
                  type="url"
                  id="soundcloudUrl"
                  name="soundcloudUrl"
                  value={profile.soundcloudUrl || ''}
                  onChange={handleChange}
                  placeholder="https://soundcloud.com/tu-perfil"
                  fullWidth
                  variant="outlined"
                  error={!!formErrors.soundcloudUrl}
                  helperText={formErrors.soundcloudUrl}
                />
                <TextField
                  label="Link Instagram (opcional)"
                  type="url"
                  id="instagramUrl"
                  name="instagramUrl"
                  value={profile.instagramUrl || ''}
                  onChange={handleChange}
                  placeholder="https://instagram.com/tu-perfil"
                  fullWidth
                  variant="outlined"
                  error={!!formErrors.instagramUrl}
                  helperText={formErrors.instagramUrl}
                />
              </Stack>
            </Box>

            {/* 5. Imagen de perfil */}
            <Box component="section" sx={{ mb: 4 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'semibold', mb: 2, color: 'text.primary' }}>
                5. Imagen de perfil
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  La imagen de perfil se edita directamente desde tu perfil público.
                </Typography>
                {profile.profileImageUrl && (
                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>Imagen actual:</Typography>
                    <Avatar src={profile.profileImageUrl} alt="Profile" sx={{ width: 120, height: 120, objectFit: 'cover' }} />
                  </Box>
                )}
              </Box>
            </Box>

            {/* Guardar cambios button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{ py: 1, px: 3, fontWeight: 'semibold' }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : <><FloppyDisk size={20} style={{ marginRight: 8 }} /> Guardar cambios</>}
              </Button>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default EditMusicianPage;
