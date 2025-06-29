'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  Box,
  CircularProgress,
  Alert,
  Avatar,
  InputLabel,
} from '@mui/material'; // Removed Button, Typography
import { Camera } from 'phosphor-react';

interface ProfileImageUploaderProps {
  musicianId: string;
  currentImageUrl: string | null;
  onImageUploadSuccess: (newImageUrl: string) => void;
}

const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({
  musicianId,
  currentImageUrl,
  onImageUploadSuccess,
}) => {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(currentImageUrl);

  useEffect(() => {
    setPreviewImageUrl(currentImageUrl);
  }, [currentImageUrl]);

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
      setPreviewImageUrl(data.publicUrl); // Update preview immediately
      onImageUploadSuccess(data.publicUrl); // Notify parent component
    } catch (err: unknown) { // Changed to unknown
      setError(err instanceof Error ? err.message : 'An unknown error occurred'); // Added instanceof Error check
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
      <Box sx={{ position: 'relative', width: 150, height: 150, mb: 2 }}>
        <Avatar
          src={previewImageUrl || undefined}
          alt="Profile"
          sx={{ width: '100%', height: '100%', objectFit: 'cover', border: '2px solid', borderColor: 'primary.main' }}
        >
          {!previewImageUrl && <Camera size={64} />}
        </Avatar>
        <InputLabel htmlFor="profile-image-upload" sx={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          bgcolor: 'primary.main',
          borderRadius: '50%',
          p: 1,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 3,
          '&:hover': {
            bgcolor: 'primary.dark',
          },
        }}>
          {loading ? (
            <CircularProgress size={24} sx={{ color: 'white' }} /> // Explicitly set color to white
          ) : (
            <Camera size={24} color="white" />
          )}
          <input
            type="file"
            id="profile-image-upload"
            name="profileImage"
            accept="image/jpeg, image/png"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
            disabled={loading}
          />
        </InputLabel>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2, width: '100%' }}>Error: {error}</Alert>
      )}
      
    </Box>
  );
};

export default ProfileImageUploader;
