'use client';

import Link from 'next/link';
// import Image from 'next/image'; // Avatar is used
import { PencilSimple, YoutubeLogo, InstagramLogo, SpeakerSimpleHigh } from 'phosphor-react'; // Replaced SoundcloudLogo
import {
  Box,
  Typography,
  Button,
  Paper,
  Avatar,
  Chip,
  Stack,
  // SvgIcon, // Not directly used, phosphor icons are components
  Link as MuiLink,
  useTheme, // Import useTheme
  IconButton, // For social links
  Tooltip, // For social links
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
  const theme = useTheme();
  const hasProfileData = !!musicianProfile; // Check if profile data exists

  const placeholderInstruments = ["Guitarra", "Voz"];
  const placeholderGenres = ["Pop", "Rock"];

  const instruments = hasProfileData && musicianProfile?.instruments?.length > 0 ? musicianProfile.instruments : placeholderInstruments;
  const genres = hasProfileData && musicianProfile?.genres?.length > 0 ? musicianProfile.genres : placeholderGenres;

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: '12px', bgcolor: 'background.paper' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{xs: 'flex-start', sm: 'center'}} mb={2}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          Tu Perfil Público
        </Typography>
        <Button
          component={Link}
          href={`/m/${userId}/edit`}
          variant="contained"
          color="primary"
          size="small"
          sx={{ textTransform: 'none', mt: { xs: 1, sm: 0 } }}
          startIcon={<PencilSimple size={18} weight="fill" />}
        >
          Editar Mi Perfil
        </Button>
      </Stack>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'center', md: 'flex-start' },
          gap: { xs: 2, md: 3 },
        }}
      >
        <Avatar
          src={musicianProfile?.profileImageUrl || "/images/musicians-bw.png"} // Default placeholder
          alt={musicianProfile?.fullName || "Foto de perfil"}
          sx={{ width: {xs: 80, sm: 100, md: 120}, height: {xs: 80, sm: 100, md: 120}, mr: { md: 2 }, mb: { xs: 2, md: 0 } }}
        />
        <Box sx={{ flexGrow: 1, width: '100%' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            {musicianProfile?.fullName || "Nombre del Músico"}
          </Typography>
          {!hasProfileData && (
             <Typography variant="caption" color="text.secondary" component="p" sx={{mb:1}}>
                Completa tu perfil para mostrar tu información aquí.
            </Typography>
          )}

          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ my: 1.5 }}>
            {instruments.map((instrument, index) => (
              <Chip
                key={`instrument-${index}`}
                label={instrument}
                size="small"
                variant="outlined"
                sx={{ borderColor: theme.palette.primary.main, color: theme.palette.primary.main, fontWeight: 'medium' }}
              />
            ))}
            {genres.map((genre, index) => (
              <Chip
                key={`genre-${index}`}
                label={genre}
                size="small"
                variant="outlined"
                sx={{ borderColor: theme.palette.secondary.main, color: theme.palette.secondary.main, fontWeight: 'medium' }}
              />
            ))}
          </Stack>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1, fontWeight: 'medium' }}>
            Honorario base: <Typography component="span" sx={{color: 'text.primary', fontWeight: 'bold'}}>${musicianProfile?.hourlyRate || "N/A"}</Typography>/hora
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }} alignItems="center">
            <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>Redes:</Typography> {/* Added small margin to Redes: text */}
            {musicianProfile?.youtubeUrl ? (
              <Tooltip title="YouTube">
                <IconButton component={MuiLink} href={musicianProfile.youtubeUrl} target="_blank" rel="noopener noreferrer" size="small" sx={{color: theme.palette.text.secondary, '&:hover': {color: '#FF0000'}}}>
                  <YoutubeLogo size={24} />
                </IconButton>
              </Tooltip>
            ) : <Chip label="YouTube no disponible" size="small" variant="outlined" sx={{ml:1}} />}
            {musicianProfile?.soundcloudUrl ? (
              <Tooltip title="SoundCloud">
                <IconButton component={MuiLink} href={musicianProfile.soundcloudUrl} target="_blank" rel="noopener noreferrer" size="small" sx={{color: theme.palette.text.secondary, '&:hover': {color: '#FF5500'}}}>
                  <SpeakerSimpleHigh size={24} /> {/* Changed Icon */}
                </IconButton>
              </Tooltip>
            ) : <Chip label="SoundCloud no disponible" size="small" variant="outlined" sx={{ml:1}} />}
            {musicianProfile?.instagramUrl ? (
              <Tooltip title="Instagram">
                <IconButton component={MuiLink} href={musicianProfile.instagramUrl} target="_blank" rel="noopener noreferrer" size="small" sx={{color: theme.palette.text.secondary, '&:hover': {color: '#E4405F'}}}>
                  <InstagramLogo size={24} />
                </IconButton>
              </Tooltip>
            ) : <Chip label="Instagram no disponible" size="small" variant="outlined" sx={{ml:1}} />}
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
}
