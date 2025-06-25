'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FloppyDisk } from 'phosphor-react';
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Container,
  Avatar,
  InputLabel,
} from '@mui/material';

const UploadImagePage = () => {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [musicianId, setMusicianId] = useState<string | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pathSegments = window.location.pathname.split('/');
    const id = pathSegments[2]; // Assuming URL is /m/[id]/upload-image
    if (id) {
      setMusicianId(id);
      fetchMusicianProfileImage(id);
    } else {
      setError('Musician ID not found in URL.');
      setLoading(false);
    }
  }, []);

  const fetchMusicianProfileImage = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        router.push('/login');
        return;
      }
      const user = session.user;

      const response = await fetch(`/api/m/${id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch musician profile: ${response.statusText}`);
      }
      const data = await response.json();
      setProfileImageUrl(data.profileImageUrl || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Authentication required to upload image.');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/m/${musicianId}/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al subir la imagen.');
      }

      const data = await response.json();
      setProfileImageUrl(data.publicUrl);
      alert('Imagen de perfil actualizada correctamente');
      router.push(`/m/${musicianId}`); // Redirect back to profile after upload
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
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando imagen de perfil...</Typography>
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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary' }}>
            Subir Imagen de Perfil
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Actualizá tu foto de perfil.
          </Typography>

          <Box component="section" sx={{ mb: 4 }}>
            <InputLabel htmlFor="profileImage" sx={{ mb: 1, fontWeight: 'bold', color: 'text.primary' }}>Subida simple de imagen</InputLabel>
            <input
              type="file"
              id="profileImage"
              name="profileImage"
              accept="image/jpeg, image/png"
              onChange={handleImageUpload}
              style={{ display: 'block', width: '100%', padding: '8px 0' }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Subí una foto profesional que represente tu estilo musical. Formato JPG o PNG, tamaño máximo recomendado 2MB.
            </Typography>
            {profileImageUrl && (
              <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>Imagen actual:</Typography>
                <Avatar src={profileImageUrl} alt="Profile" sx={{ width: 120, height: 120, objectFit: 'cover' }} />
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push(`/m/${musicianId}`)}
              sx={{ py: 1, px: 3, fontWeight: 'semibold' }}
            >
              Volver al Perfil
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default UploadImagePage;
