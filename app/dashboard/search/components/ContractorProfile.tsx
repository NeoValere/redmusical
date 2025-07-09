'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import {
  Box,
  Typography,
  Avatar,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  alpha,
  useTheme,
} from '@mui/material';
import EditContractorProfileModal from './EditContractorProfileModal';
import ContractorImageUploader from './ContractorImageUploader';

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

export default function ContractorProfile() {
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const theme = useTheme();
  const supabase = createClient();

  const handleSave = async (updatedContractor: Contractor) => {
    if (!user?.id) return;

    const response = await fetch(`/api/c/${user.id}/update-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedContractor),
    });

    if (response.ok) {
      const data = await response.json();
      setContractor(data);
      setIsModalOpen(false);
    } else {
      // Handle error
      console.error('Failed to update profile');
    }
  };

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        fetch(`/api/c/${user.id}/get-profile`)
          .then((res) => res.json())
          .then((data) => {
            if (!data.error) {
              setContractor(data);
            }
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    };
    getUser();
  }, [supabase.auth]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!contractor) {
    return <Typography>No se encontró el perfil.</Typography>;
  }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        backgroundColor: alpha(theme.palette.background.paper, 0.7),
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: 2,
        boxShadow: theme.shadows[2],
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', justifyContent: 'center' }}>
          <ContractorImageUploader
            contractorId={user.id}
            currentImageUrl={contractor.profileImageUrl}
            onImageUploadSuccess={(newImageUrl) => {
              setContractor((prev) => ({ ...prev, profileImageUrl: newImageUrl } as Contractor));
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h4">{contractor.fullName}</Typography>
            <Button variant="outlined" onClick={() => setIsModalOpen(true)}>
              Editar
            </Button>
          </Box>
          <Typography variant="h6">{contractor.companyName}</Typography>
          <Typography color="textSecondary">{contractor.location}</Typography>
          <Typography sx={{ mt: 2 }}>{contractor.bio}</Typography>
          {contractor.websiteUrl && (
            <Button
              variant="contained"
              color="primary"
              href={contractor.websiteUrl}
              target="_blank"
              sx={{ mt: 2 }}
            >
              Sitio Web
            </Button>
          )}
        </Grid>
      </Grid>
      {isModalOpen && contractor && (
        <EditContractorProfileModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          contractor={contractor}
          onSave={handleSave}
        />
      )}
    </Box>
  );
}
