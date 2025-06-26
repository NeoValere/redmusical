"use client";

import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  Chip, 
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import { MapPin, MusicNote } from 'phosphor-react';

export interface Musician {
  id: string;
  userId: string;
  fullName: string;
  artisticName?: string | null; // Changed to allow null
  city: string;
  instruments: { instrument: { name:string } }[];
  profileImageUrl?: string;
  experienceLevel?: string;
  genres?: { genre: { name: string } }[];
}

const MusicianCard: React.FC<{ musician: Musician }> = ({ musician }) => {
  const theme = useTheme();
  return (
    <Link style={{ backgroundColor: theme.palette.background.paper , textDecoration: 'none', height: '100%' }} href={`/m/${musician.userId}`} passHref >
      <Card 
        elevation={0}
        sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        border: `1px solid ${theme.palette.divider}`,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4],
          cursor: 'pointer'
        },
        backgroundColor: theme.palette.background.paper,
      
      }}>
        <CardMedia
          component="img"
          height="200"
          image={musician.profileImageUrl || '/images/default-profile.png'}
          alt={musician.artisticName || musician.fullName} // Use artisticName or fullName for alt text
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h5" component="div" fontWeight="bold" color="primary.main">
            {musician.artisticName || musician.fullName} {/* Display artisticName or fallback to fullName */}
          </Typography>
          { musician.city && 
          <Stack direction="row" alignItems="center" spacing={0.5} mb={1}>
            <MapPin size={18} color={theme.palette.text.secondary} />
            <Typography variant="body2" color="text.secondary">
              {musician.city}
            </Typography>
          </Stack> }
          {musician.instruments && musician.instruments.length > 0 && (
            <Stack direction="row" alignItems="center" spacing={0.5} mb={1}>
              <MusicNote size={18} color={theme.palette.text.secondary} />
              <Typography variant="body2" color="text.secondary">
                {musician.instruments.map(i => i.instrument.name).join(', ')}
              </Typography>
            </Stack>
          )}
        {/*   {musician.experienceLevel && (
             <Stack direction="row" alignItems="center" spacing={0.5} mb={2}>
              <Star size={18} color={theme.palette.text.secondary} />
              <Typography variant="body2" color="text.secondary">
                {musician.experienceLevel}
              </Typography>
            </Stack>
          )} */}
          {musician.genres && musician.genres.length > 0 && (
            <Box mb={2}>
              {musician.genres.slice(0, 3).map(g => (
                <Chip  key={g.genre.name} label={g.genre.name} size="small" sx={{ mr: 0.5, mb: 0.5, backgroundColor: alpha(theme.palette.secondary.main, 0.7) }} />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default MusicianCard;
