'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import ProfileImageUploader from './components/ProfileImageUploader'; // Import ProfileImageUploader
// No need for next/image if we replicate the homepage logo structure
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
  Grid,
  Divider,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Tooltip,
  Popover, // Added Popover
  TextField, // For color input labels if needed, or just Typography
  FormControl,
  InputLabel,
  Input,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'; // Import the new icon
import {
  ArrowLeft, // Restored for fallback UIs
  PencilSimple,
  MapPin,
  EnvelopeSimple,
  Globe,
  Phone,
  Briefcase,
  Users,
  Handshake,
  CurrencyDollar,
  ListChecks,
  MusicNotes,
  Atom, // Changed from Helix to Atom for ADN Musical
  SpeakerSimpleHigh, // Added for Instruments
  MusicNotesSimple, // Added for logo
  Sparkle, // Example for skill
  CalendarCheck, // Example for availability
  Eye,
  EyeSlash,
  Person,
  Info,
  ShareNetwork,
  Play, // Added for Audio Player
  Palette, // Added for color customization
} from 'phosphor-react'; // Keep Phosphor icons that are not in MUI

import {
  Instagram as InstagramIconMui, // Renamed to avoid conflict with react-icons
  Facebook as FacebookIconMui, // Renamed
  YouTube as YouTubeIconMui, // Renamed
  Twitter as TwitterIconMui, // Renamed
  Public as PublicIconMui, // Renamed
  Link as LinkIconMui, // Generic link icon from MUI
  MusicNote as MusicNoteIconMui, // For Spotify/Soundcloud if no specific icon
} from '@mui/icons-material';

// Import react-icons
import { FaXTwitter, FaTwitch, FaTiktok, FaSquareFacebook, FaYoutube, FaInstagram, FaSpotify, FaSoundcloud } from 'react-icons/fa6';
import { FaLink } from 'react-icons/fa'; // Generic link icon

// Using the more comprehensive type from the edit page as a base
import { Database } from '@/lib/database.types';

// Define interfaces for related data to avoid deep lookups that might be causing TS issues
interface Genre { id: string; name: string; }
interface Instrument { id: string; name: string; }
interface Skill { id: string; name: string; }
interface Availability { id: string; name: string; }
interface Preference { id: string; name: string; }
interface AudioTrack { title: string; url: string; } // Added for audio tracks

// Explicitly define base musician properties to avoid issues with deep lookups in Database type
interface BaseMusicianRow {
  id: string;
  userId: string; // Typically from Supabase auth, API might use `userId` from params for query
  fullName: string | null;
  artisticName: string | null; // Added for artistic name
  email: string | null; // Contact email
  bio: string | null;
  profileImageUrl: string | null;
  city: string | null;
  province: string | null;
  phoneNumber: string | null;
  websiteUrl: string | null;
  experienceLevel: string | null;
  hourlyRate: number | null;
  isPublic: boolean | null; // Changed from is_public
  acceptsCollaborations: boolean | null;
  acceptsGigs: boolean | null; // Changed from accepts_gigs
  socialMediaLinks: Record<string, string> | null; // Changed from social_media_links
  createdAt: string; // Changed from created_at
  updatedAt: string | null; // Changed from updated_at
  // Ensure all fields from the 'musicians' table as returned by API are here with correct casing
  audioTracks?: AudioTrack[] | null; // Added for audio tracks
  profileColorCover?: string | null;
  profileColorCardBackground?: string | null;
  profileColorText?: string | null;
  profileColorSectionBackground?: string | null;
  musicianOrBand?: string | null; // Added to differentiate between solo musician or band
}

type MusicianProfileData = BaseMusicianRow & {
  genres: Genre[];
  instruments: Instrument[];
  skills: Skill[];
  availability: Availability[];
  preferences: Preference[];
  // audioTracks is already in BaseMusicianRow
  // Redundant optional fields removed as BaseMusicianRow now uses camelCase
  // and should reflect the actual API response structure.
};

interface SectionCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  cardBackgroundColor?: string;
  titleColor?: string; // Added for explicit title color
}

const SectionCard: React.FC<SectionCardProps> = ({ title, icon, children, cardBackgroundColor, titleColor }) => (
  <Card elevation={2} sx={{ mb: 3, backgroundColor: cardBackgroundColor /* Apply custom background if provided */ }}>
    <CardContent>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        {icon}
        <Typography variant="h6" component="h3" sx={{ fontWeight: 'semibold', color: titleColor }}>
          {title}
        </Typography>
      </Stack>
      {children}
    </CardContent>
  </Card>
);

// Define social media platforms and their regex patterns/icons (React Icons)
const SOCIAL_MEDIA_PLATFORMS = [
  {
    key: 'instagram',
    name: 'Instagram',
    regex: /(?:instagram\.com)\/(?:[a-zA-Z0-9_.]+)/,
    icon: FaInstagram,
  },
  {
    key: 'x',
    name: 'X (Twitter)',
    regex: /(?:twitter\.com|x\.com)\/(?:[a-zA-Z0-9_]+)/,
    icon: FaXTwitter,
  },
  {
    key: 'facebook',
    name: 'Facebook',
    regex: /(?:facebook\.com)\/(?:[a-zA-Z0-9_.]+)/,
    icon: FaSquareFacebook,
  },
  {
    key: 'youtube',
    name: 'YouTube',
    regex: /(?:youtube\.com|youtu\.be)\/(?:channel\/|user\/|c\/|@)?(?:[a-zA-Z0-9_-]+)/,
    icon: FaYoutube,
  },
  {
    key: 'twitch',
    name: 'Twitch',
    regex: /(?:twitch\.tv)\/(?:[a-zA-Z0-9_]+)/,
    icon: FaTwitch,
  },
  {
    key: 'tiktok',
    name: 'TikTok',
    regex: /(?:tiktok\.com)\/(?:@)?(?:[a-zA-Z0-9_.]+)/,
    icon: FaTiktok,
  },
  {
    key: 'spotify',
    name: 'Spotify',
    regex: /(?:spotify\.com)\/(?:artist|user|track|album)\/(?:[a-zA-Z0-9]+)/,
    icon: FaSpotify,
  },
  {
    key: 'soundcloud',
    name: 'SoundCloud',
    regex: /(?:soundcloud\.com)\/(?:[a-zA-Z0-9_-]+)\/(?:[a-zA-Z0-9_-]+)/,
    icon: FaSoundcloud,
  },
];

// Function to detect social media platform from URL and return its icon
const getSocialMediaIcon = (url: string): React.ElementType => {
  for (const platform of SOCIAL_MEDIA_PLATFORMS) {
    if (platform.regex.test(url)) {
      return platform.icon;
    }
  }
  return FaLink; // Default for unknown links
};

// Helper function to extract YouTube Video ID from various URL formats
const getYoutubeVideoId = (url: string): string | null => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return match[2];
  }
  return null;
};

// Helper function to convert RGB to Hex
const rgbToHex = (rgb: string): string => {
  if (!rgb || !rgb.startsWith('rgb')) {
    return rgb; // Return as is if not an rgb string (e.g., already hex or invalid)
  }
  const parts = rgb.match(/\d+/g);
  if (!parts || parts.length < 3) {
    return rgb; // Invalid rgb string
  }
  const r = parseInt(parts[0], 10);
  const g = parseInt(parts[1], 10);
  const b = parseInt(parts[2], 10);

  const toHex = (c: number) => {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

function MusicianProfilePage() {
  const [musicianProfile, setMusicianProfile] = useState<MusicianProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPrivateProfileError, setIsPrivateProfileError] = useState<boolean>(false); // Added for specific private profile error
  const [isOwner, setIsOwner] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const theme = useTheme(); // Moved up to be available for default color states

  // State for custom colors
  const [currentColorCover, setCurrentColorCover] = useState<string>(theme.palette.primary.main); // Default to theme
  const [currentColorCardBg, setCurrentColorCardBg] = useState<string>(theme.palette.background.paper);
  const [currentColorText, setCurrentColorText] = useState<string>(theme.palette.text.primary);
  const [currentColorSectionBg, setCurrentColorSectionBg] = useState<string>(theme.palette.background.default);

  // State for color picker popover
  const [anchorElColorPicker, setAnchorElColorPicker] = useState<HTMLButtonElement | null>(null);
  const [isSavingColors, setIsSavingColors] = useState(false);

  const router = useRouter();
  const params = useParams();
  const supabase = createClientComponentClient<Database>();
  const userIdFromParams = params.id as string; // This is the userId
  // theme is already defined above
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    // Initialize or update colors when musicianProfile or theme changes
    if (musicianProfile) {
      setCurrentColorCover(rgbToHex(musicianProfile.profileColorCover || theme.palette.primary.dark)); 
      setCurrentColorCardBg(rgbToHex(musicianProfile.profileColorCardBackground || theme.palette.background.paper));
      setCurrentColorText(rgbToHex(musicianProfile.profileColorText || theme.palette.text.primary));
      setCurrentColorSectionBg(rgbToHex(musicianProfile.profileColorSectionBackground || theme.palette.background.default));
    } else {
      // Reset to theme defaults if profile is null
      setCurrentColorCover(rgbToHex(theme.palette.primary.dark));
      setCurrentColorCardBg(rgbToHex(theme.palette.background.paper));
      setCurrentColorText(rgbToHex(theme.palette.text.primary));
      setCurrentColorSectionBg(rgbToHex(theme.palette.background.default));
    }
  }, [musicianProfile, theme]);

  const fetchProfileAndCheckOwner = useCallback(async () => {
    console.log('Fetching profile data...'); // Added console log
    if (!userIdFromParams) {
      setError('User ID not found in URL.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Fetch profile data using the correct endpoint
      const profileResponse = await fetch(`/api/musicians/${userIdFromParams}/get-profile`);
      
      if (!profileResponse.ok) {
        const errorData = await profileResponse.json();
        if (profileResponse.status === 403) {
          setError(errorData.error || 'Este perfil es privado y no se puede acceder.');
          setIsPrivateProfileError(true);
          setLoading(false);
          return; // Stop further processing for private profile
        }
        throw new Error(errorData.error || `Failed to fetch profile (status: ${profileResponse.status})`);
      }
      const profileData = await profileResponse.json();
      
      // Assuming API returns data with camelCase field names matching BaseMusicianRow
      const fetchedProfile = profileData as MusicianProfileData;
      setMusicianProfile(fetchedProfile);
      // Color initialization is now handled by the separate useEffect watching musicianProfile

      // Check if logged-in user is the owner of this profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        setIsOwner(user.id === userIdFromParams);
      } else {
        setIsLoggedIn(false);
        setIsOwner(false);
      }
    } catch (err: any) {
      console.error('Error accediendo al músico:', err);
      setError(err.message || 'Ha ocurrido un error inesperado.');
      // Optional: redirect to an error page or show a more prominent error message
      // router.push('/error'); 
    } finally {
      setLoading(false);
    }
  }, [userIdFromParams, supabase]); // Removed router from dependencies as it's not directly used in the fetch logic

  useEffect(() => {
    console.log('MusicianProfilePage useEffect triggered.'); // Added for more specific logging
    fetchProfileAndCheckOwner();
  }, [fetchProfileAndCheckOwner]);

  const socialLinks = useMemo(() => {
    if (!musicianProfile?.socialMediaLinks) return []; // Changed to socialMediaLinks
    return Object.entries(musicianProfile.socialMediaLinks) // Changed to socialMediaLinks
      .filter(([, url]) => url && typeof url === 'string' && url.trim() !== '')
      .map(([platform, url]) => ({ platform, url: url as string })); // Assert url is string after filter
  }, [musicianProfile?.socialMediaLinks]); // Changed to socialMediaLinks

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
        <CircularProgress size={isMobile ? 40 : 60} />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>Cargando perfil del músico...</Typography>
      </Box>
    );
  }

  if (isPrivateProfileError) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 3, textAlign: 'center' }}>
        <MuiLink component={Link} href="/" color="inherit" underline="none" sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <MusicNotesSimple size={32} color={theme.palette.primary.main} weight="fill" style={{ marginRight: 3 }} />
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
            redmusical.ar
          </Typography>
        </MuiLink>
        <EyeSlash size={64} color={theme.palette.warning.main} weight="bold" />
        <Typography variant="h5" color="text.primary" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
          Perfil Privado
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {error} {/* This will display the message from the API */}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3, maxWidth: '600px', lineHeight: 1.6 }}>
          <strong>redmusical.ar</strong> es la plataforma que conecta a la vibrante comunidad musical de Argentina. 
          Un espacio diseñado para que el talento encuentre oportunidades y las oportunidades encuentren talento.
        </Typography>
        <Button variant="contained" onClick={() => router.back()} startIcon={<ArrowLeft />}>
          Volver
        </Button>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 3, textAlign: 'center' }}>
        <Sparkle size={64} color={theme.palette.error.main} weight="bold" />
        <Typography variant="h5" color="error" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }}>
          ¡Ups! Algo salió mal
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {error}
        </Typography>
        <Button variant="contained" onClick={() => router.push('/dashboard')} startIcon={<ArrowLeft />}>
          Volver al Dashboard
        </Button>
      </Box>
    );
  }

  if (!musicianProfile) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 3, textAlign: 'center' }}>
        <Person size={64} color={theme.palette.text.disabled} weight="bold" />
        <Typography variant="h5" sx={{ mt: 2, mb: 1, fontWeight: 'bold', color: 'text.secondary' }}>
          Perfil no encontrado
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          No pudimos encontrar el perfil de este músico.
        </Typography>
        <Button variant="outlined" onClick={() => router.push('/search')} startIcon={<ArrowLeft />}>
          Buscar Músicos
        </Button>
      </Box>
    );
  }

  const {
    fullName, // Changed from full_name
    bio,
    profileImageUrl, // Changed from profile_image_url
    city,
    province,
    instruments,
    genres,
    skills,
    experienceLevel,
    availability,
    hourlyRate,
    preferences,
    email,
    phoneNumber,
    websiteUrl,
    acceptsCollaborations,
    acceptsGigs, // Changed from accepts_gigs
    isPublic, // Changed from is_public
    audioTracks, // Added for audio tracks
    musicianOrBand, // Added to differentiate between solo musician or band
  } = musicianProfile;

  const location = [city, province].filter(Boolean).join(', ');
  const translatedMusicianOrBand = musicianOrBand === 'musician' ? 'Solista' : musicianOrBand === 'band' ? 'Banda' : null;

  const handleOpenColorPicker = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElColorPicker(event.currentTarget);
  };

  const handleCloseColorPicker = () => {
    setAnchorElColorPicker(null);
  };

  const handleSaveColors = async (colorsToSave?: {
    profileColorCover: string | null;
    profileColorCardBackground: string | null;
    profileColorText: string | null;
    profileColorSectionBackground: string | null;
  }) => {
    if (!musicianProfile) return;
    setIsSavingColors(true);
    setError(null);

    const payload = colorsToSave || {
      profileColorCover: currentColorCover,
      profileColorCardBackground: currentColorCardBg,
      profileColorText: currentColorText,
      profileColorSectionBackground: currentColorSectionBg,
    };

    try {
      const response = await fetch(`/api/musicians/${userIdFromParams}/update-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save colors');
      }
      const updatedProfileResponse = await response.json();
      let profileDataToSetStateWith = updatedProfileResponse;

      // If this save operation was initiated by a reset (i.e., colorsToSave was passed with all nulls)
      // ensure the profile data used to update the local state also has nulls for these color fields.
      // This overrides any potentially stale non-null values from the API response for these specific fields
      // immediately after a reset operation.
      if (colorsToSave &&
          colorsToSave.profileColorCover === null &&
          colorsToSave.profileColorCardBackground === null &&
          colorsToSave.profileColorText === null &&
          colorsToSave.profileColorSectionBackground === null) {
        profileDataToSetStateWith = {
          ...updatedProfileResponse,
          profileColorCover: null,
          profileColorCardBackground: null,
          profileColorText: null,
          profileColorSectionBackground: null,
        };
      }

      setMusicianProfile(prevProfile => ({ ...prevProfile, ...profileDataToSetStateWith })); // Merge updated data with existing profile
      handleCloseColorPicker();
    } catch (err: any) {
      console.error('Error saving colors:', err);
      setError(err.message || 'Could not save color preferences.');
    } finally {
      setIsSavingColors(false);
    }
  };

  const handleResetColors = () => {
    // Set states to theme defaults visually first for immediate feedback
    setCurrentColorCover(theme.palette.primary.dark);
    setCurrentColorCardBg(theme.palette.background.paper);
    setCurrentColorText(theme.palette.text.primary);
    setCurrentColorSectionBg(theme.palette.background.default);
    // Then call save with nulls to clear them in DB
    handleSaveColors({
      profileColorCover: null,
      profileColorCardBackground: null,
      profileColorText: null,
      profileColorSectionBackground: null,
    });
  };
  
  const openColorPicker = Boolean(anchorElColorPicker);
  const idColorPicker = openColorPicker ? 'color-picker-popover' : undefined;

  return (
    <Box sx={{ bgcolor: currentColorSectionBg, minHeight: '100vh', color: currentColorText, transition: 'background-color 0.3s, color 0.3s' }}>
      <Paper 
        elevation={0} 
        square 
        sx={{ 
          pt: isMobile ? 2 : 4, pb: isMobile ? 2 : 4, /* Increased vertical padding */
          px: isMobile ? 2 : 3,
          background: currentColorCover, // Use dynamic cover color
          transition: 'background-color 0.3s',
        }}
      >
        <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}> {/* Added flex properties for vertical centering */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: isMobile ? 2 : 3 }}>
            {typeof window !== 'undefined' && document.referrer !== '' && new URL(document.referrer).origin === window.location.origin ? (
              <IconButton edge="start" aria-label="back" onClick={() => router.back()} sx={{color: currentColorText /* Color 2 para icono de volver, igual que texto */}}>
                <ArrowBackIosNewIcon sx={{ fontSize: 28 }} />
              </IconButton>
            ) : (
              <MuiLink component={Link} href="/" color="inherit" underline="none" sx={{ display: 'flex', alignItems: 'center' }}>
                <MusicNotesSimple size={32} color={theme.palette.primary.main} weight="fill" style={{ marginRight: 3 }} />
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                  redmusical.ar
                </Typography>
              </MuiLink>
            )}
            {isOwner && (
              <Tooltip title="Personalizar Colores del Perfil">
                <IconButton onClick={handleOpenColorPicker} sx={{color: theme.palette.common.white /* Color fijo para el ícono de paleta */}}>
                  <Palette size={28} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <Popover
            id={idColorPicker}
            open={openColorPicker}
            anchorEl={anchorElColorPicker}
            onClose={handleCloseColorPicker}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: { p: 2, width: 300, backgroundColor: theme.palette.background.default }
            }}
          >
            <Typography variant="h6" gutterBottom>Personalizar Colores</Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption">Fondo Portada y Iconos</Typography>
                <Input type="color" value={currentColorCover} onChange={(e) => setCurrentColorCover(e.target.value)} fullWidth sx={{ '& input': { height: '30px', p: '5px' } }}/>
              </Box>
              <Box>
                <Typography variant="caption">Fondo Tarjetas</Typography>
                <Input type="color" value={currentColorCardBg} onChange={(e) => setCurrentColorCardBg(e.target.value)} fullWidth sx={{ '& input': { height: '30px', p: '5px' } }}/>
              </Box>
              <Box>
                <Typography variant="caption">Texto Principal</Typography>
                <Input type="color" value={currentColorText} onChange={(e) => setCurrentColorText(e.target.value)} fullWidth sx={{ '& input': { height: '30px', p: '5px' } }}/>
              </Box>
              <Box>
                <Typography variant="caption">Fondo Secciones</Typography>
                <Input type="color" value={currentColorSectionBg} onChange={(e) => setCurrentColorSectionBg(e.target.value)} fullWidth sx={{ '& input': { height: '30px', p: '5px' } }}/>
              </Box>
              <Button onClick={() => handleSaveColors()} variant="contained" disabled={isSavingColors} fullWidth>
                {isSavingColors ? <CircularProgress size={24} /> : "Guardar Cambios"}
              </Button>
              <Button onClick={handleResetColors} variant="outlined" disabled={isSavingColors} fullWidth>
                Restablecer Predeterminados
              </Button>
            </Stack>
          </Popover>

          <Stack direction={isMobile ? "column" : "row"} alignItems={isMobile ? "center" : "flex-start"} spacing={isMobile ? 1 : 2}>
            {isOwner ? (
              <ProfileImageUploader
                musicianId={userIdFromParams}
                currentImageUrl={profileImageUrl || null}
                onImageUploadSuccess={(url: string) => setMusicianProfile(prev => prev ? { ...prev, profileImageUrl: url } : null)}
              />
            ) : (
              <Avatar
                src={profileImageUrl || "/images/musicians-bw.png"} // Default placeholder
                alt={fullName || "Musician"}
                sx={{ 
                  width: isMobile ? 120 : 180, // Adjusted mobile size
                  height: isMobile ? 120 : 180, // Adjusted mobile size
                  mb: 0, // Ensure no extra margin-bottom
                  border: `6px solid ${currentColorSectionBg}`, // Color 3 para borde de avatar
                  boxShadow: theme.shadows[5] 
                }}
              />
            )}
            <Box sx={{ textAlign: isMobile ? 'center' : 'left' }}> {/* Box for name and location */}
              <Typography variant={isMobile ? "h4" : "h3"} component="h1" sx={{ fontWeight: 'bold', color: currentColorText /* Color 2 para tipografía */, textShadow: '1px 1px 3px rgba(0,0,0,0.3)', mb: 0 }}> {/* Ensure no bottom margin */}
                {musicianProfile.artisticName || fullName}
              </Typography>
              {location && (
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: currentColorText /* Color 2 para tipografía */, opacity: 0.95 }}>
                  <MapPin size={isMobile ? 18 : 20} color={currentColorText /* Color 2 para icono de ubicación, igual que texto */} />
                  <Typography variant={isMobile ? "body1" : "h6"} component="p">
                    {location}
                  </Typography>
                </Stack>
              )}
              {translatedMusicianOrBand && (
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ opacity: 0.95, mt: 0.5 }}> {/* Added mt: 0.5 for top margin */}
                  <Chip
                    label={translatedMusicianOrBand}
                    size="small"
                    sx={{
                      backgroundColor: currentColorCardBg,
                      color: currentColorCover, // Changed text color to currentColorCover
                      fontWeight: 'normal',
                      fontStyle: 'normal',
                      px: 1, // Horizontal padding
                      py: 0.5, // Vertical padding
                      borderRadius: '16px', // Capsule shape
                    }}
                  />
                </Stack>
              )}
            </Box>
          </Stack>
        </Container>
      </Paper>

      <Container maxWidth="lg" sx={{ py: isMobile ? 3 : 4 }}>
        <Grid container spacing={isMobile ? 3 : 4}>
          {/* Left Column / Main Content */}
          <Grid size={{ xs: 12, md: 8 }}>
            {bio && (
              <SectionCard title="Bio" icon={<Info size={24} color={currentColorCover /* Color 1 para iconos */} />} cardBackgroundColor={currentColorCardBg /* Color 4 para fondo de tarjeta */} titleColor={currentColorText}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, color: currentColorText /* Color 2 para tipografía */ }}>{bio}</Typography>
              </SectionCard>
            )}

            {audioTracks && audioTracks.length > 0 && (
              <SectionCard title="Música" icon={<Play size={24} color={currentColorCover /* Color 1 para iconos */} />} cardBackgroundColor={currentColorCardBg /* Color 4 para fondo de tarjeta */} titleColor={currentColorText}>
                <Stack spacing={2}>
                  {audioTracks.map((track, index) => {
                    const videoId = getYoutubeVideoId(track.url);
                    return (
                      <Paper key={index} variant="outlined" sx={{ p: 2, backgroundColor: currentColorCardBg /* Color 4 para fondo de paper */ }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', color: currentColorText /* Color 2 para tipografía */ }}>
                          {track.title || `Track ${index + 1}`}
                        </Typography>
                        {videoId ? (
                          <Box
                            sx={{
                              position: 'relative',
                              paddingBottom: '56.25%', // 16:9 aspect ratio
                              height: 0,
                              overflow: 'hidden',
                              maxWidth: '100%',
                              background: '#000', // Optional: background for when video is loading
                            }}
                          >
                            <iframe
                              src={`https://www.youtube.com/embed/${videoId}`}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              title={track.title || `YouTube video ${index + 1}`}
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                              }}
                            />
                          </Box>
                        ) : (
                          <audio controls src={track.url} style={{ width: '100%' }}>
                            Tu navegador no soporta el elemento de audio.
                          </audio>
                        )}
                      </Paper>
                    );
                  })}
                </Stack>
              </SectionCard>
            )}

            {(genres && genres.length > 0) || (instruments && instruments.length > 0) || (skills && skills.length > 0) ? (
              <SectionCard title="ADN Musical" icon={<Atom size={24} color={currentColorCover /* Color 1 para iconos */} />} cardBackgroundColor={currentColorCardBg /* Color 4 para fondo de tarjeta */} titleColor={currentColorText}>
                {genres && genres.length > 0 && (
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', color: currentColorText /* Color 2 para tipografía */ }}>Géneros</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {genres.map((genre: Genre) => (
                        <Chip key={genre.id} label={genre.name} variant="outlined" size="small" sx={{borderColor: currentColorCover, color: currentColorText /* Color 2 para texto, Color 1 para borde de chip si se quiere */}} />
                      ))}
                    </Stack>
                  </Box>
                )}
                {instruments && instruments.length > 0 && (
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', color: currentColorText /* Color 2 para tipografía */ }}>Instrumentos</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {instruments.map((instrument: Instrument) => (
                        <Chip key={instrument.id} icon={<SpeakerSimpleHigh size={16} color={currentColorCover /* Color 1 para iconos */} />} label={instrument.name} variant="outlined" size="small" sx={{borderColor: currentColorCover, color: currentColorText}} /> 
                      ))}
                    </Stack>
                  </Box>
                )}
                {skills && skills.length > 0 && (
                  <Box>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', color: currentColorText /* Color 2 para tipografía */ }}>Habilidades Adicionales</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {skills.map((skill: Skill) => (
                        <Chip key={skill.id} icon={<Sparkle size={16} color={currentColorCover /* Color 1 para iconos */} />} label={skill.name} variant="outlined" size="small" sx={{borderColor: currentColorCover, color: currentColorText}} />
                      ))}
                    </Stack>
                  </Box>
                )}
              </SectionCard>
            ) : null}
            
            {(acceptsGigs || acceptsCollaborations) && (
              <SectionCard title="Oportunidades" icon={<Handshake size={24} color={currentColorCover /* Color 1 para iconos */} />} cardBackgroundColor={currentColorCardBg /* Color 4 para fondo de tarjeta */} titleColor={currentColorText}>
                <Stack spacing={1}>
                  {acceptsGigs && <Typography variant="body2" sx={{color: currentColorText /* Color 2 para tipografía */}}><CheckCircleIcon sx={{color: currentColorCover /* Color 1 para iconos */, mr:1, verticalAlign: 'bottom'}}/>Disponible para conciertos/eventos</Typography>}
                  {acceptsCollaborations && <Typography variant="body2" sx={{color: currentColorText /* Color 2 para tipografía */}}><CheckCircleIcon sx={{color: currentColorCover /* Color 1 para iconos */, mr:1, verticalAlign: 'bottom'}}/>Abierto/a a colaboraciones</Typography>}
                </Stack>
              </SectionCard>
            )}

          </Grid>

          {/* Right Column / Sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            {(availability && availability.length > 0) || (hourlyRate !== null && hourlyRate !== undefined) || (preferences && preferences.length > 0) ? (
              <SectionCard title="Logística" icon={<Briefcase size={24} color={currentColorCover /* Color 1 para iconos */} />} cardBackgroundColor={currentColorCardBg /* Color 4 para fondo de tarjeta */} titleColor={currentColorText}>
                {availability && availability.length > 0 && (
                  <Box sx={{ mb: 2.5 }}> {/* Increased margin-bottom for better separation */}
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'medium', color: currentColorText /* Color 2 para tipografía */ }}>Disponibilidad</Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap"> {/* Added useFlexGap for consistent spacing */}
                      {availability.map((avail: Availability) => (
                        <Chip key={avail.id} icon={<CalendarCheck size={16} color={currentColorCover /* Color 1 para iconos */} />} label={avail.name} size="small" variant="outlined" sx={{borderColor: currentColorCover, color: currentColorText}} />
                      ))}
                    </Stack>
                  </Box>
                )}
                {hourlyRate !== null && hourlyRate !== undefined && (
                  <Box sx={{ mb: 2.5 }}> {/* Increased margin-bottom for better separation */}
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'medium', color: currentColorText /* Color 2 para tipografía */ }}>Tarifa por Hora</Typography>
                    <Chip label={`$${hourlyRate} USD`} size="small" variant="outlined" sx={{borderColor: currentColorCover, color: currentColorText}} />
                  </Box>
                )}
                {preferences && preferences.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'medium', color: currentColorText /* Color 2 para tipografía */ }}>Preferencias</Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap"> {/* Added useFlexGap for consistent spacing */}
                      {preferences.map((pref: Preference) => (
                        <Chip key={pref.id} icon={<ListChecks size={16} color={currentColorCover /* Color 1 para iconos */} />} label={pref.name} size="small" variant="outlined" sx={{borderColor: currentColorCover, color: currentColorText}} />
                      ))}
                    </Stack>
                  </Box>
                )}
              </SectionCard>
            ) : null}

            <SectionCard title="Contacto" icon={<ShareNetwork size={24} color={currentColorCover /* Color 1 para iconos */} />} cardBackgroundColor={currentColorCardBg /* Color 4 para fondo de tarjeta */} titleColor={currentColorText}>
              {email && (
                <MuiLink href={`mailto:${email}`} sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: currentColorText /* Color 2 para tipografía */, mb: 1.5, '&:hover': {color: currentColorCover} }}>
                  <EnvelopeSimple size={20} style={{ marginRight: theme.spacing(1) }} color={currentColorCover /* Color 1 para iconos */} />
                  <Typography variant="body2">{email}</Typography>
                </MuiLink>
              )}
              {phoneNumber && (isPublic || isOwner) && ( // Show phone only if public or owner
                <MuiLink href={`tel:${phoneNumber}`} sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: currentColorText /* Color 2 para tipografía */, mb: 1.5, '&:hover': {color: currentColorCover} }}>
                  <Phone size={20} style={{ marginRight: theme.spacing(1) }} color={currentColorCover /* Color 1 para iconos */} />
                  <Typography variant="body2">{phoneNumber}</Typography>
                </MuiLink>
              )}
              {websiteUrl && (
                <MuiLink href={websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`} target="_blank" rel="noopener noreferrer" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: currentColorText /* Color 2 para tipografía */, mb: 1.5, '&:hover': {color: currentColorCover} }}>
                  <Globe size={20} style={{ marginRight: theme.spacing(1) }} color={currentColorCover /* Color 1 para iconos */} />
                  <Typography variant="body2">{websiteUrl}</Typography>
                </MuiLink>
              )}
              {socialLinks.length > 0 && (
                <Stack direction="row" spacing={1.5} sx={{mt: 2}} flexWrap="wrap">
                  {socialLinks.map(({ platform, url }) => { 
                    const IconComponent = getSocialMediaIcon(url); // Use the helper function
                    const finalUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
                    return (
                      <Tooltip title={platform.charAt(0).toUpperCase() + platform.slice(1)} key={platform}>
                        <IconButton component="a" href={finalUrl} target="_blank" rel="noopener noreferrer" sx={{color: currentColorCover /* Color 1 para iconos */, '&:hover': {color: currentColorCover}}}>
                          <IconComponent size={28} />
                        </IconButton>
                      </Tooltip>
                    );
                  })}
                </Stack>
              )}
            </SectionCard>
            
            {!isPublic && (
              <Paper elevation={1} sx={{p:2, mt:2, backgroundColor: currentColorCardBg /* Color 4 para fondo de paper */ }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                      {isPublic ? <Eye size={20} color={currentColorCover /* Color 1 para iconos */} /> : <EyeSlash size={20} color={currentColorCover /* Color 1 para iconos */} />}
                      <Typography variant="body2" sx={{fontWeight:'medium', color: currentColorText /* Color 2 para tipografía */}}>
                          Perfil {isPublic ? 'Público' : 'Privado'}
                      </Typography>
                  </Stack>
                  <Typography variant="caption" sx={{color: currentColorText /* Color 2 para tipografía */}}>
                      {isPublic ? 'Este perfil es visible para otros usuarios.' : 'Este perfil solo es visible para ti.'}
                  </Typography>
              </Paper>
            )}

          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

// Helper Icon for Checkmarks (MUI doesn't have one in Phosphor set directly)
const CheckCircleIcon = (props: {sx?: any}) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16">
    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75 0 0 0-1.06 1.06L6.97 11.03a.75 0 0 0 1.079-.02l3.992-4.99a.75 0 0 0-.01-1.05z"/>
  </svg>
);

export default MusicianProfilePage;
