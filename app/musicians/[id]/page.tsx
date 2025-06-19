'use client';

import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Typography,
  Button,
  Container,
  IconButton,
  Avatar,
  Chip,
  Stack,
  Link as MuiLink,
  CircularProgress,
  Paper,
  useTheme,
} from '@mui/material';
import { ArrowLeft, PencilSimple, YoutubeLogo, InstagramLogo, MusicNotesSimple } from 'phosphor-react';
import ProfileImageUploader from './components/ProfileImageUploader';

// Manually define types based on prisma/schema.prisma
interface MusicianProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  location: string | null;
  instruments: string[];
  genres: string[];
  bio: string | null;
  hourlyRate: number | null;
  availability: string[];
  youtubeUrl: string | null;
  soundcloudUrl: string | null;
  instagramUrl: string | null;
  profileImageUrl: string | null;
  isPremium: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export default function MusicianProfilePage() {
  const [musicianProfile, setMusicianProfile] = useState<MusicianProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false); // To check if the logged-in user is the profile owner
  const [isLoggedIn, setIsLoggedIn] = useState(false); // To check if any user is logged in
  const router = useRouter();
  const params = useParams();
  const supabase = createClientComponentClient();
  const id = params.id as string;
  const theme = useTheme();

  useEffect(() => {
    const fetchProfileAndCheckOwner = async () => {
      setLoading(true);
      try {
        // Fetch profile data
        const profileResponse = await fetch(`/api/register-profile?userId=${id}&role=musician`);
        const profileData = await profileResponse.json();

        if (profileData.exists && profileData.profile) {
          setMusicianProfile(profileData.profile as MusicianProfile);
        } else {
          // If profile not found, redirect or show error
          router.push('/404'); // Or a custom not found page
          return;
        }

        // Check if logged-in user is the owner of this profile
        const { data: { user } = {} } = await supabase.auth.getUser(); // Destructure with default empty object
        if (user) {
          setIsLoggedIn(true);
          if (user.id === id) {
            setIsOwner(true);
          } else {
            setIsOwner(false);
          }
        } else {
          setIsLoggedIn(false);
          setIsOwner(false);
        }
      } catch (error) {
        console.error('Error fetching musician profile or checking owner:', error);
        router.push('/error'); // Or a custom error page
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndCheckOwner();
  }, [id, router, supabase]);


  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando perfil...</Typography>
      </Box>
    );
  }

  if (!musicianProfile) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <Typography variant="h6" color="error">Perfil no encontrado.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          {isLoggedIn ? (
            <IconButton edge="start" color="inherit" aria-label="back to dashboard" component={Link} href="/dashboard">
              <ArrowLeft />
            </IconButton>
          ) : (
            <MuiLink component={Link} href="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
              <MusicNotesSimple size={24} color={theme.palette.primary.main} weight="fill" style={{ marginRight: 8 }} />
              <Typography variant="h6" component="span" sx={{ fontWeight: 'bold' }}>
                redmusical.ar
              </Typography>
            </MuiLink>
          )}
          {isOwner && (
            <Button component={Link} href={`/musicians/${id}/edit`} variant="outlined" startIcon={<PencilSimple />}>
              Editar Perfil
            </Button>
          )}
        </Box>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          {isOwner ? (
            <ProfileImageUploader
              musicianId={id}
              currentImageUrl={musicianProfile.profileImageUrl}
              onImageUploadSuccess={(newImageUrl) => {
                setMusicianProfile(prev => prev ? { ...prev, profileImageUrl: newImageUrl } : null);
              }}
            />
          ) : (
            <Box sx={{ position: 'relative', width: 120, height: 120, mx: 'auto', mb: 2 }}>
              <Avatar
                src={musicianProfile.profileImageUrl || "/images/musicians-bw.png"}
                alt={musicianProfile.fullName || "Musician Profile"}
                sx={{ width: '100%', height: '100%' }}
              />
            </Box>
          )}
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            {musicianProfile.fullName}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {musicianProfile.location || 'Ubicación no especificada'}
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" sx={{ mb: 2 }}>
            {musicianProfile.instruments.map((instrument, index) => (
              <Chip key={index} label={instrument} color="primary" size="small" />
            ))}
            {musicianProfile.genres.map((genre, index) => (
              <Chip key={index} label={genre} color="secondary" size="small" />
            ))}
            {(!musicianProfile.instruments.length && !musicianProfile.genres.length) && (
              <>
                <Chip label="Guitarra" color="primary" size="small" />
                <Chip label="Voz" color="secondary" size="small" />
              </>
            )}
          </Stack>

          <Typography variant="body1" sx={{ mb: 2 }}>
            {musicianProfile.bio || 'No hay biografía disponible.'}
          </Typography>

          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            Honorario: ${musicianProfile.hourlyRate || 0}/hora
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Disponibilidad: {musicianProfile.availability.length > 0 ? musicianProfile.availability.join(', ') : 'No especificada'}
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
            {musicianProfile.youtubeUrl && (
              <MuiLink href={musicianProfile.youtubeUrl} target="_blank" rel="noopener noreferrer" color="inherit">
                <IconButton color="primary">
                  <YoutubeLogo />
                </IconButton>
              </MuiLink>
            )}
            {musicianProfile.soundcloudUrl && (
              <MuiLink href={musicianProfile.soundcloudUrl} target="_blank" rel="noopener noreferrer" color="inherit">
                <IconButton color="primary">
                  <MusicNotesSimple />
                </IconButton>
              </MuiLink>
            )}
            {musicianProfile.instagramUrl && (
              <MuiLink href={musicianProfile.instagramUrl} target="_blank" rel="noopener noreferrer" color="inherit">
                <IconButton color="primary">
                  <InstagramLogo />
                </IconButton>
              </MuiLink>
            )}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
