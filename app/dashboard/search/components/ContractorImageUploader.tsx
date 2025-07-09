'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  Box,
  CircularProgress,
  Alert,
  Avatar,
  InputLabel,
} from '@mui/material';
import { Camera } from 'phosphor-react';
import ImageCropModal from './ImageCropModal';

interface ContractorImageUploaderProps {
  contractorId: string;
  currentImageUrl: string | null;
  onImageUploadSuccess: (newImageUrl: string) => void;
}

const ContractorImageUploader: React.FC<ContractorImageUploaderProps> = ({
  contractorId,
  currentImageUrl,
  onImageUploadSuccess,
}) => {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(
    currentImageUrl
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  useEffect(() => {
    setPreviewImageUrl(currentImageUrl);
  }, [currentImageUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageToCrop(reader.result as string);
        setModalOpen(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    const formData = new FormData();
    formData.append('file', croppedImageBlob, 'profile.jpg');

    setLoading(true);
    setError(null);
    setModalOpen(false);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError('Se requiere autenticación para subir la imagen.');
        setLoading(false);
        return;
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch(`/api/c/${contractorId}/upload-image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al subir la imagen.');
      }

      const data = await response.json();
      setPreviewImageUrl(data.publicUrl);
      onImageUploadSuccess(data.publicUrl);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Ocurrió un error desconocido'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Box sx={{ position: 'relative', width: 150, height: 150, mb: 2 }}>
          <Avatar
            src={previewImageUrl || undefined}
            alt="Perfil"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              border: '2px solid',
              borderColor: 'primary.main',
            }}
          >
            {!previewImageUrl && <Camera size={64} />}
          </Avatar>
          <InputLabel
            htmlFor="profile-image-upload"
            sx={{
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
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              <Camera size={24} color="white" />
            )}
            <input
              type="file"
              id="profile-image-upload"
              name="profileImage"
              accept="image/jpeg, image/png"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              disabled={loading}
            />
          </InputLabel>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
      </Box>
      {imageToCrop && (
        <ImageCropModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setImageToCrop(null);
          }}
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
        />
      )}
    </>
  );
};

export default ContractorImageUploader;
