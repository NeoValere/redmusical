'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PencilSimple } from 'phosphor-react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Avatar,
  Chip,
  Stack,
  SvgIcon,
  Link as MuiLink,
} from '@mui/material';

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

interface QuickEditProps {
  userId: string;
  musicianProfile: MusicianProfile | null;
}

export default function QuickEdit({ userId, musicianProfile }: QuickEditProps) {
  return (
    <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 'semibold', mb: 2, color: 'text.primary' }}>
        Mi Perfil Público
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar
          src={musicianProfile?.profileImageUrl || "/images/musicians-bw.jpg"}
          alt="Profile Picture"
          sx={{ width: 80, height: 80, mr: 2 }}
        />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{musicianProfile?.fullName || "Nombre Completo del Músico"}</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
            {musicianProfile?.instruments.map((instrument, index) => (
              <Chip key={index} label={instrument} size="small" sx={{ bgcolor: 'grey.200', color: 'text.primary' }} />
            ))}
            {musicianProfile?.genres.map((genre, index) => (
              <Chip key={index} label={genre} size="small" sx={{ bgcolor: 'grey.200', color: 'text.primary' }} />
            ))}
            {(!musicianProfile?.instruments?.length && !musicianProfile?.genres?.length) && (
              <>
                <Chip label="Guitarra" size="small" sx={{ bgcolor: 'grey.200', color: 'text.primary' }} />
                <Chip label="Voz" size="small" sx={{ bgcolor: 'grey.200', color: 'text.primary' }} />
                <Chip label="Pop" size="small" sx={{ bgcolor: 'grey.200', color: 'text.primary' }} />
                <Chip label="Rock" size="small" sx={{ bgcolor: 'grey.200', color: 'text.primary' }} />
              </>
            )}
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Honorario base: ${musicianProfile?.hourlyRate || 0}/hora</Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            {musicianProfile?.youtubeUrl && <MuiLink href={musicianProfile.youtubeUrl} target="_blank" rel="noopener noreferrer" color="primary" underline="hover">YouTube</MuiLink>}
            {musicianProfile?.soundcloudUrl && <MuiLink href={musicianProfile.soundcloudUrl} target="_blank" rel="noopener noreferrer" color="primary" underline="hover">SoundCloud</MuiLink>}
            {musicianProfile?.instagramUrl && <MuiLink href={musicianProfile.instagramUrl} target="_blank" rel="noopener noreferrer" color="primary" underline="hover">Instagram</MuiLink>}
            {(!musicianProfile?.youtubeUrl && !musicianProfile?.soundcloudUrl && !musicianProfile?.instagramUrl) && (
              <>
                <MuiLink href="#" color="primary" underline="hover">YouTube</MuiLink>
                <MuiLink href="#" color="primary" underline="hover">SoundCloud</MuiLink>
                <MuiLink href="#" color="primary" underline="hover">Instagram</MuiLink>
              </>
            )}
          </Stack>
        </Box>
      </Box>
      <Button
        component={Link}
        href={`/musicians/${userId}/edit`}
        variant="contained"
        color="primary"
        sx={{
          mt: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 'fit-content',
          textTransform: 'none',
        }}
        startIcon={<PencilSimple size={24} color="white" />}
      >
        Editar perfil completo →
      </Button>
    </Paper>
  );
}
