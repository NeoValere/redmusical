'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
  useMediaQuery,
  Grid,
  Stack,
  Chip,
  Avatar,
  TextField,
  Autocomplete,
  FormControlLabel,
  Switch,
  FormGroup,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Tooltip,
  LinearProgress,
  InputAdornment, // Added for social media icons
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  ErrorOutline as ErrorOutlineIcon,
  InfoOutlined as InfoOutlinedIcon,
  MusicNote as MusicNoteIcon,
  Person as PersonIcon,
  LocationOn as LocationOnIcon,
  Settings as SettingsIcon,
  Event as EventIcon,
  MonetizationOn as MonetizationOnIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon, // Added for audio tracks
  Add as AddIcon, // Added for audio tracks
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ProfileImageUploader from '../components/ProfileImageUploader';
import { Database } from '@/lib/database.types';
import { useSnackbar } from 'notistack';
import { v4 as uuidv4 } from 'uuid'; // For unique IDs for social media inputs

// Import react-icons
import { FaXTwitter, FaTwitch, FaTiktok, FaSquareFacebook, FaYoutube, FaInstagram, FaSpotify, FaSoundcloud } from 'react-icons/fa6';
import { FaLink } from 'react-icons/fa'; // Generic link icon

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

// Function to detect social media platform from URL
const detectSocialMediaPlatform = (url: string) => {
  for (const platform of SOCIAL_MEDIA_PLATFORMS) {
    if (platform.regex.test(url)) {
      return { platformKey: platform.key, IconComponent: platform.icon };
    }
  }
  return { platformKey: 'unknown', IconComponent: FaLink }; // Default for unknown links
};

type SocialMediaInput = {
  id: string;
  url: string;
  platform: string; // e.g., 'instagram', 'facebook', 'unknown'
  Icon: React.ElementType;
};

type MusicianProfile = Database['public']['Tables']['Musician']['Row'] & {
  genres: Database['public']['Tables']['Genre']['Row'][];
  instruments: Database['public']['Tables']['Instrument']['Row'][];
  skills: Database['public']['Tables']['Skill']['Row'][];
  availability?: Database['public']['Tables']['Availability']['Row'][]; // Made optional
  preferences: Database['public']['Tables']['Preference']['Row'][];
  socialMediaLinks: Record<string, string> | null; // Changed from social_media_links
  city?: string | null; 
  province?: string | null;
  phoneNumber?: string | null; // Added phoneNumber
  websiteUrl?: string | null; // Changed website to websiteUrl
  profileImageUrl?: string | null; // Added profileImageUrl
  isPublic?: boolean | null; // Added isPublic
  acceptsCollaborations?: boolean | null; // Added acceptsCollaborations
  acceptsGigs?: boolean | null; // Added acceptsGigs
  fullName?: string | null; // Added fullName
  bio?: string | null; // Made optional
  experienceLevel?: string | null; // Made optional
  hourlyRate?: number | null; // Made optional
  audioTracks: { title: string; url: string; }[]; // Changed to non-nullable array
  musicianOrBand?: string | null; // Added musicianOrBand
  socialMediaInputs?: SocialMediaInput[]; // New field for UI management
};

const steps = [
  'Información Básica',
  'Detalles Musicales',
  'Ubicación y Contacto',
  'Logística y Preferencias',
  'Visibilidad y Oportunidades',
];

const CustomStepIconRoot = styled('div')<{ ownerState: { active?: boolean; completed?: boolean; error?: boolean } }>(
  ({ theme, ownerState }) => ({
    color: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[400],
    display: 'flex',
    height: 22,
    alignItems: 'center',
    ...(ownerState.active && {
      color: theme.palette.primary.main,
    }),
    '& .CustomStepIcon-completedIcon': {
      color: theme.palette.success.main,
      zIndex: 1,
      fontSize: 18,
    },
    '& .CustomStepIcon-errorIcon': {
      color: theme.palette.error.main,
      zIndex: 1,
      fontSize: 18,
    },
    '& .CustomStepIcon-circle': {
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: 'currentColor',
    },
  }),
);

import type { StepIconProps } from '@mui/material/StepIcon';

function CustomStepIcon(props: StepIconProps) {
  const { active, completed, error, icon } = props;
  const theme = useTheme();

  const icons: { [key: string]: React.ReactElement } = {
    '1': <PersonIcon />,
    '2': <MusicNoteIcon />,
    '3': <LocationOnIcon />,
    '4': <SettingsIcon />,
    '5': <VisibilityIcon />,
  };

  if (error) {
    return (
      <CustomStepIconRoot ownerState={{ error: true }}>
        <ErrorOutlineIcon className="CustomStepIcon-errorIcon" />
      </CustomStepIconRoot>
    );
  }

  return (
    <CustomStepIconRoot ownerState={{ completed: completed || false, active: active || false }}>
      {completed ? (
        <CheckIcon className="CustomStepIcon-completedIcon" />
      ) : (
        icons[String(icon)]
      )}
    </CustomStepIconRoot>
  );
}

const MotionBox = motion(Box);

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' as const } },
  exit: { y: -20, opacity: 0, transition: { duration: 0.3, ease: 'easeIn' as const } },
};

export default function EditMusicianProfile() {
  const router = useRouter();
  const params = useParams();
  const musicianId = params.id as string;
  const supabase = createClientComponentClient<Database>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { enqueueSnackbar } = useSnackbar();

  const [activeStep, setActiveStep] = useState(0);
  const [profile, setProfile] = useState<Partial<MusicianProfile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [stepErrors, setStepErrors] = useState<boolean[]>(Array(steps.length).fill(false));
  const [socialMediaInputs, setSocialMediaInputs] = useState<SocialMediaInput[]>([]); // New state for social media links

  const [allGenres, setAllGenres] = useState<{ id: string; name: string }[]>([]);
  const [allInstruments, setAllInstruments] = useState<{ id: string; name: string }[]>([]);
  const [allSkills, setAllSkills] = useState<{ id: string; name: string }[]>([]);
  const [allAvailability, setAllAvailability] = useState<{ id: string; name: string }[]>([]);
  const [allPreferences, setAllPreferences] = useState<{ id: string; name: string }[]>([]);

  const [profileCompleteness, setProfileCompleteness] = useState(0);

  // Handlers for audio tracks
  const handleAudioTrackChange = useCallback((index: number, field: 'title' | 'url', value: string) => {
    setProfile(prev => {
      if (!prev || !prev.audioTracks) return prev;
      const newAudioTracks = [...prev.audioTracks];
      newAudioTracks[index] = { ...newAudioTracks[index], [field]: value };
      return { ...prev, audioTracks: newAudioTracks };
    });
  }, []);

  const handleAddAudioTrack = useCallback(() => {
    setProfile(prev => ({
      ...prev,
      audioTracks: [...(prev?.audioTracks || []), { title: '', url: '' }],
    }));
  }, []);

  const handleRemoveAudioTrack = useCallback((index: number) => {
    setProfile(prev => {
      if (!prev || !prev.audioTracks) return prev;
      const newAudioTracks = prev.audioTracks.filter((_, i) => i !== index);
      return { ...prev, audioTracks: newAudioTracks };
    });
  }, []);

  const handleRemoveSocialMediaLink = useCallback((id: string) => {
    setSocialMediaInputs(prev => prev.filter((link: SocialMediaInput) => link.id !== id));
  }, []);

  // Handlers for social media links
  const handleSocialMediaLinkChange = useCallback((index: number, value: string) => {
    setSocialMediaInputs(prev => {
      const newSocialMediaInputs = [...prev];
      const { platformKey, IconComponent } = detectSocialMediaPlatform(value);
      newSocialMediaInputs[index] = {
        ...newSocialMediaInputs[index],
        url: value,
        platform: platformKey,
        Icon: IconComponent,
      };
      return newSocialMediaInputs;
    });
  }, []);

  const handleAddSocialMediaLink = useCallback(() => {
    setSocialMediaInputs(prev => {
      const newLink: SocialMediaInput = {
        id: uuidv4(),
        url: '',
        platform: 'unknown',
        Icon: FaLink,
      };
      return [...prev, newLink];
    });
  }, []);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/musicians/${musicianId}/get-profile`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch profile');
      }
      const data = await response.json();
      // Map snake_case from API to camelCase for frontend state
      const mappedData: MusicianProfile = {
        ...data,
        audioTracks: data.audioTracks || [], // Ensure audioTracks is always an array
        // No explicit mapping needed here, as API now returns camelCase
      };

      // Initialize socialMediaInputs from profile.socialMediaLinks
      const initialSocialMediaInputs: SocialMediaInput[] = [];
      if (mappedData.socialMediaLinks) {
        for (const platformKey in mappedData.socialMediaLinks) {
          const url = mappedData.socialMediaLinks[platformKey];
          const { platformKey: detectedPlatform, IconComponent } = detectSocialMediaPlatform(url);
          initialSocialMediaInputs.push({
            id: uuidv4(),
            url,
            platform: detectedPlatform,
            Icon: IconComponent,
          });
        }
      }
      setSocialMediaInputs(initialSocialMediaInputs);

      setProfile(mappedData);
      calculateProfileCompleteness(mappedData);
    } catch (err: any) {
      console.error('Error fetching profile from API:', err);
      setError('No se pudo cargar el perfil: ' + err.message);
      setShowErrorDialog(true);
    } finally {
      setLoading(false);
    }
  }, [musicianId]);

  const fetchMetadata = useCallback(async () => {
    try {
      const [genresRes, instrumentsRes, skillsRes, availabilityRes, preferencesRes] = await Promise.all([
        fetch('/api/genres'), // Assuming you have these API routes
        fetch('/api/instruments'),
        fetch('/api/skills'),
        fetch('/api/availability'),
        fetch('/api/preferences'),
      ]);

      const genresData = genresRes.ok ? await genresRes.json() : [];
      const instrumentsData = instrumentsRes.ok ? await instrumentsRes.json() : [];
      const skillsData = skillsRes.ok ? await skillsRes.json() : [];
      const availabilityData = availabilityRes.ok ? await availabilityRes.json() : [];
      const preferencesData = preferencesRes.ok ? await preferencesRes.json() : [];

      setAllGenres(genresData);
      setAllInstruments(instrumentsData);
      setAllSkills(skillsData);
      setAllAvailability(availabilityData);
      setAllPreferences(preferencesData);
    } catch (err) {
      console.error('Error fetching metadata:', err);
      enqueueSnackbar('Error al cargar opciones de selección. Asegúrate de que la base de datos esté sembrada.', { variant: 'error' });
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchMetadata();
  }, [fetchProfile, fetchMetadata]);

  const handleChange = useCallback((field: keyof MusicianProfile, value: any) => {
    setProfile((prev: Partial<MusicianProfile> | null) => {
      const updatedProfile = { ...prev, [field]: value } as Partial<MusicianProfile>;
      calculateProfileCompleteness(updatedProfile);
      return updatedProfile;
    });
    setFormErrors((prev) => ({ ...prev, [field]: '' }));
  }, []);

  const handleArrayChange = useCallback(
    (field: 'genres' | 'instruments' | 'skills' | 'availability' | 'preferences', value: any[]) => {
      setProfile((prev: Partial<MusicianProfile> | null) => {
        const updatedProfile = { ...prev, [field]: value } as Partial<MusicianProfile>;
        calculateProfileCompleteness(updatedProfile);
        return updatedProfile;
      });
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    },
    [],
  );

  const calculateProfileCompleteness = useCallback((currentProfile: Partial<MusicianProfile>) => {
    let completedFields = 0;
    const totalFields = 12; // Adjusted for musicianOrBand

    if (currentProfile.fullName) completedFields++;
    if (currentProfile.profileImageUrl) completedFields++; // Changed from profile_image_url
    if (currentProfile.genres && currentProfile.genres.length > 0) completedFields++;
    if (currentProfile.instruments && currentProfile.instruments.length > 0) completedFields++;
    if (currentProfile.skills && currentProfile.skills.length > 0) completedFields++;
    if (currentProfile.city && currentProfile.city) completedFields++;
    if (currentProfile.phoneNumber) completedFields++;
    if (currentProfile.email) completedFields++;
    if (currentProfile.websiteUrl) completedFields++;
    if (socialMediaInputs && socialMediaInputs.length > 0 && socialMediaInputs.some(link => link.url.trim() !== '')) // Check if there's at least one non-empty social media link
      completedFields++;
    if (currentProfile.isPublic !== null && currentProfile.isPublic !== undefined) completedFields++; // Changed from is_public
    if (currentProfile.musicianOrBand) completedFields++; // Added musicianOrBand

    setProfileCompleteness(Math.min(100, Math.round((completedFields / totalFields) * 100)));
  }, [socialMediaInputs]);

  const validateStep = useCallback(
    (step: number) => {
      let errors: Record<string, string> = {};
      let hasError = false;

      if (!profile) return true; // Should not happen if profile is loaded

      switch (step) {
        case 0: // Información Básica
          if (!profile.fullName || profile.fullName.length < 3) { // Changed from full_name
            errors.fullName = 'El nombre completo es requerido y debe tener al menos 3 caracteres.'; // Changed from full_name
            hasError = true;
          }
          // Removed bio validation
          break;
        case 1: // Detalles Musicales
          if (!profile.genres || profile.genres.length === 0) {
            errors.genres = 'Debes seleccionar al menos un género.';
            hasError = true;
          }
          if (!profile.instruments || profile.instruments.length === 0) {
            errors.instruments = 'Debes seleccionar al menos un instrumento.';
            hasError = true;
          }
          // Removed experienceLevel validation
          break;
        case 2: // Ubicación y Contacto
          if (!profile.city) {
            errors.city = 'La ciudad es requerida.';
            hasError = true;
          }
          if (!profile.province) { // Changed country to province
            errors.province = 'La provincia es requerida.'; // Changed error message
            hasError = true;
          }
          if (!profile.phoneNumber) { // Changed phone_number to phoneNumber
            errors.phoneNumber = 'El número de teléfono es requerido.'; // Changed error message
            hasError = true;
          }
          if (!profile.email || !/\S+@\S+\.\S/.test(profile.email)) {
            errors.email = 'El email es requerido y debe ser válido.';
            hasError = true;
          }
          break;
        case 3: // Logística
          // Removed availability and hourlyRate validation as per user request
          break;
        case 4: // Visibilidad y Finalizar
          // No specific validation for this step, as it's mostly toggles
          break;
      }

      setFormErrors((prev) => ({ ...prev, ...errors }));
      setStepErrors((prev) => {
        const newStepErrors = [...prev];
        newStepErrors[step] = hasError;
        return newStepErrors;
      });
      return !hasError;
    },
    [profile],
  );

  const handlePartialSave = async () => {
    if (!profile) return false;
    setSubmitting(true); // Use submitting state to disable next/back during save
    let success = false;
    try {
      // Exclude createdAt, updatedAt, and other auto-managed fields by the database
      // Also exclude availability from the payload as it's no longer a required field
      const { genres, instruments, skills, availability, preferences, socialMediaLinks, ...restOfProfile } = profile; // Removed createdAt, updatedAt, and socialMediaLinks

      // Transform socialMediaInputs array to socialMediaLinks object
      const transformedSocialMediaLinks: Record<string, string> = {};
      socialMediaInputs.forEach(link => {
        if (link.url.trim() !== '' && link.platform !== 'unknown') {
          transformedSocialMediaLinks[link.platform] = link.url;
        }
      });

      // Send payload directly in camelCase as Prisma now expects camelCase
      const payload = {
        ...restOfProfile,
        genres: genres?.map((g: { id: string; name: string }) => ({ id: g.id, name: g.name })) || [],
        instruments: instruments?.map((i: { id: string; name: string }) => ({ id: i.id, name: i.name })) || [],
        skills: skills?.map((s: { id: string; name: string }) => ({ id: s.id, name: s.name })) || [],
        // availability is no longer sent as a required field
        preferences: preferences?.map((p: { id: string; name: string }) => ({ id: p.id, name: p.name })) || [],
        socialMediaLinks: Object.keys(transformedSocialMediaLinks).length > 0 ? transformedSocialMediaLinks : null,
      };

      console.log('Payload being sent for partial save:', payload); // Debug log

      const response = await fetch(`/api/musicians/${musicianId}/update-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409 && errorData.field === 'email') {
          setFormErrors((prev) => ({ ...prev, email: errorData.error }));
          enqueueSnackbar(errorData.error, { variant: 'error' });
          return false; // Indicate that save failed due to email conflict
        }
        throw new Error(errorData.error || 'Failed to partially save profile');
      }

      // Update the profile state with the new socialMediaLinks after successful save
      setProfile(prev => {
        if (!prev) return prev;
        return { ...prev, socialMediaLinks: transformedSocialMediaLinks };
      });

      enqueueSnackbar('Progreso guardado', { variant: 'success', autoHideDuration: 2000 });
      success = true;
    } catch (err: any) {
      console.error('Error partially saving profile:', err);
      enqueueSnackbar('Error al guardar progreso: ' + err.message, { variant: 'error' });
      success = false;
    } finally {
      setSubmitting(false);
    }
    return success;
  };

  const handleNext = async () => {
    if (validateStep(activeStep)) {
      if (activeStep < steps.length - 1) {
        const saved = await handlePartialSave();
        if (saved) {
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
      } else { // Last step, full submit
        await handleSubmit();
      }
    } else {
      enqueueSnackbar('Por favor, corrige los errores antes de continuar.', { variant: 'error' });
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepClick = async (stepIndex: number) => {
    if (submitting || stepIndex === activeStep) {
      return; // Do nothing if submitting or clicking the current step
    }

    if (stepIndex === activeStep) {
      return; // Do nothing if clicking the current step
    }

    // Always validate and save the current step's data before navigating
    if (validateStep(activeStep)) {
      const saved = await handlePartialSave(); // Save current step's progress
      if (saved) {
        setActiveStep(stepIndex); // Move to the clicked step
      } else {
        // If save failed, prevent navigation
        enqueueSnackbar('Error al guardar el progreso del paso actual. Por favor, revisa los errores.', { variant: 'error' });
      }
    } else {
      enqueueSnackbar('Por favor, corrige los errores del paso actual antes de avanzar.', { variant: 'error' });
    }
  };

  const handleSubmit = async () => {
    if (!profile) return;

    setSubmitting(true);
    setError(null);

    // Exclude createdAt, updatedAt, and other auto-managed fields by the database
    const { genres, instruments, skills, availability, preferences, bio, experienceLevel, socialMediaLinks, ...restOfProfile } = profile; // Removed createdAt, updatedAt, and socialMediaLinks

    // Transform socialMediaInputs array to socialMediaLinks object
    const transformedSocialMediaLinks: Record<string, string> = {};
    socialMediaInputs.forEach(link => {
      if (link.url.trim() !== '' && link.platform !== 'unknown') {
        transformedSocialMediaLinks[link.platform] = link.url;
      }
    });

    const payload = {
      ...restOfProfile,
      bio: bio || null, // Ensure bio is sent as null if empty
      experienceLevel: experienceLevel || null, // Ensure experienceLevel is sent as null if empty
      genres: genres?.map((g: { id: string; name: string }) => ({ id: g.id, name: g.name })) || [],
      instruments: instruments?.map((i: { id: string; name: string }) => ({ id: i.id, name: i.name })) || [],
      skills: skills?.map((s: { id: string; name: string }) => ({ id: s.id, name: s.name })) || [],
      availability: availability?.map((a: { id: string; name: string }) => ({ id: a.id, name: a.name })) || [],
      preferences: preferences?.map((p: { id: string; name: string }) => ({ id: p.id, name: p.name })) || [],
      socialMediaLinks: Object.keys(transformedSocialMediaLinks).length > 0 ? transformedSocialMediaLinks : null,
    };

    console.log('Payload being sent for full submit:', payload); // Debug log

    try {
      const response = await fetch(`/api/musicians/${musicianId}/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409 && errorData.field === 'email') {
          setFormErrors((prev) => ({ ...prev, email: errorData.error }));
          enqueueSnackbar(errorData.error, { variant: 'error' });
          return; // Stop submission if email conflict
        }
        throw new Error(errorData.error || 'Failed to update profile');
      }

      // Update the profile state with the new socialMediaLinks after successful submit
      setProfile(prev => {
        if (!prev) return prev;
        return { ...prev, socialMediaLinks: transformedSocialMediaLinks };
      });

      enqueueSnackbar('Perfil actualizado exitosamente!', { variant: 'success' });
      router.push(`/musicians/${musicianId}`); // Redirect to the profile page
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError('Error al actualizar el perfil: ' + err.message);
      setShowErrorDialog(true);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepContent = useCallback(
    (step: number) => {
      if (!profile) return null;

      switch (step) {
        case 0: // Información Básica
          return (
            <Stack spacing={3}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'semibold', color: 'text.primary' }}>
                Paso 1: Información Básica
              </Typography>
              <ProfileImageUploader
                musicianId={musicianId}
                currentImageUrl={profile.profileImageUrl || null} // Changed from profile_image_url
                onImageUploadSuccess={(url) => handleChange('profileImageUrl', url)} // Changed from profile_image_url
              />
              <TextField
                label="Nombre Completo"
                value={profile.fullName || ''} // Changed from full_name
                onChange={(e) => handleChange('fullName', e.target.value)} // Changed from full_name
                fullWidth
                error={!!formErrors.fullName} // Changed from full_name
                helperText={formErrors.fullName} // Changed from full_name
              />
              <FormControl fullWidth error={!!formErrors.musicianOrBand}>
                <InputLabel id="musicianOrBand-label">Tipo (Músico Solista / Banda)</InputLabel>
                <Select
                  labelId="musicianOrBand-label"
                  id="musicianOrBand"
                  value={profile.musicianOrBand || ''}
                  label="Tipo (Músico Solista / Banda)"
                  onChange={(e) => handleChange('musicianOrBand', e.target.value)}
                >
                  <MenuItem value="">
                    <em>Seleccionar...</em>
                  </MenuItem>
                  <MenuItem value="musician">Músico Solista</MenuItem>
                  <MenuItem value="band">Banda</MenuItem>
                </Select>
                {formErrors.musicianOrBand && <Typography color="error" variant="caption">{formErrors.musicianOrBand}</Typography>}
              </FormControl>
              <TextField
                label="Biografía (Opcional)"
                value={profile.bio || ''}
                onChange={(e) => handleChange('bio', e.target.value)}
                fullWidth
                multiline
                rows={4}
                // Removed error and helperText for bio as it's now optional
              />
            </Stack>
          );
        case 1: // Detalles Musicales
          // Ensure currentAudioTracks is an array, defaulting to empty if profile.audioTracks is undefined.
          const currentAudioTracks = profile.audioTracks || [];
          return (
            <Stack spacing={3}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'semibold', color: 'text.primary' }}>
                Paso 2: Detalles Musicales
              </Typography>
              <Autocomplete
                multiple
                options={allGenres}
                getOptionLabel={(option) => option.name}
                value={profile.genres || []}
                onChange={(_, newValue) => handleArrayChange('genres', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Géneros Musicales"
                    placeholder="Selecciona géneros"
                    error={!!formErrors.genres}
                    helperText={formErrors.genres}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option.name} {...getTagProps({ index })} />
                  ))
                }
              />
              <Autocomplete
                multiple
                options={allInstruments}
                getOptionLabel={(option) => option.name}
                value={profile.instruments || []}
                onChange={(_, newValue) => handleArrayChange('instruments', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Instrumentos"
                    placeholder="Selecciona instrumentos"
                    error={!!formErrors.instruments}
                    helperText={formErrors.instruments}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option.name} {...getTagProps({ index })} />
                  ))
                }
              />
              <Autocomplete
                multiple
                options={allSkills}
                getOptionLabel={(option) => option.name}
                value={profile.skills || []}
                onChange={(_, newValue) => handleArrayChange('skills', newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Habilidades Adicionales" placeholder="Selecciona habilidades" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option.name} {...getTagProps({ index })} />
                  ))
                }
              />
              {/* Removed FormControl for Nivel de Experiencia */}

              {/* The Typography with "TESTING AUDIO SECTION VISIBILITY" was here, it's removed as we restore the full section */}

              <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mt: 2, color: 'text.secondary' }}>
                Pistas de Audio (Opcional)
              </Typography>
              {currentAudioTracks.map((track, index) => (
                <Stack key={index} direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                  <TextField
                    label={`Título Pista ${index + 1}`}
                    value={track.title}
                    onChange={(e) => handleAudioTrackChange(index, 'title', e.target.value)}
                    fullWidth
                    size="small"
                  />
                  <TextField
                    label={`URL Pista ${index + 1}`}
                    value={track.url}
                    onChange={(e) => handleAudioTrackChange(index, 'url', e.target.value)}
                    fullWidth
                    size="small"
                    type="url"
                    placeholder="https://ejemplo.com/audio.mp3"
                    helperText="Enlace directo al archivo de audio (ej. MP3, WAV)"
                  />
                  <IconButton onClick={() => handleRemoveAudioTrack(index)} color="error" size="small">
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              ))}
              <Button
                onClick={handleAddAudioTrack}
                startIcon={<AddIcon />}
                variant="outlined"
                size="small"
                sx={{ alignSelf: 'flex-start' }}
              >
                Añadir Pista
              </Button>
            </Stack>
          );
        case 2: // Ubicación y Contacto
          return (
            <Stack spacing={3}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'semibold', color: 'text.primary' }}>
                Paso 3: Ubicación y Contacto
              </Typography>
              <TextField
                label="Ciudad"
                value={profile.city || ''}
                onChange={(e) => handleChange('city', e.target.value)}
                fullWidth
                error={!!formErrors.city}
                helperText={formErrors.city}
              />
              <TextField
                label="Provincia" // Changed label
                value={profile.province || ''} // Changed value field
                onChange={(e) => handleChange('province', e.target.value)} // Changed handleChange field
                fullWidth
                error={!!formErrors.province} // Changed error field
                helperText={formErrors.province} // Changed helperText field
              />
              <TextField
                label="Número de Teléfono"
                value={profile.phoneNumber || ''} // Changed phone_number to phoneNumber
                onChange={(e) => handleChange('phoneNumber', e.target.value)} // Changed phone_number to phoneNumber
                fullWidth
                error={!!formErrors.phoneNumber} // Changed phone_number to phoneNumber
                helperText={formErrors.phoneNumber} // Changed phone_number to phoneNumber
              />
              <TextField
                label="Email de Contacto"
                type="email"
                value={profile.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                fullWidth
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
              <TextField
                label="Sitio Web (Opcional)"
                value={profile.websiteUrl || ''} // Changed website to websiteUrl
                onChange={(e) => handleChange('websiteUrl', e.target.value)} // Changed website to websiteUrl
                fullWidth
              />
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mt: 2, color: 'text.secondary' }}>
                Enlaces de Redes Sociales (Opcional)
              </Typography>
              {socialMediaInputs.map((link, index) => (
                <Stack key={link.id} direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                  <TextField
                    label={`URL de Red Social ${index + 1}`}
                    value={link.url}
                    onChange={(e) => handleSocialMediaLinkChange(index, e.target.value)}
                    fullWidth
                    size="small"
                    type="url"
                    placeholder="https://www.instagram.com/tuperfil"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <link.Icon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <IconButton onClick={() => handleRemoveSocialMediaLink(link.id)} color="error" size="small">
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              ))}
              <Button
                onClick={handleAddSocialMediaLink}
                startIcon={<AddIcon />}
                variant="outlined"
                size="small"
                sx={{ alignSelf: 'flex-start' }}
              >
                Añadir Enlace
              </Button>
            </Stack>
          );
        case 3: // Logística
          return (
            <Stack spacing={3}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'semibold', color: 'text.primary' }}>
                Paso 4: Logística y Preferencias
              </Typography>
              <Autocomplete
                multiple
                options={allAvailability}
                getOptionLabel={(option) => option.name}
                value={profile.availability || []}
                onChange={(_, newValue) => handleArrayChange('availability', newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Disponibilidad"
                    placeholder="Selecciona tu disponibilidad"
                    error={!!formErrors.availability}
                    helperText={formErrors.availability}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option.name} {...getTagProps({ index })} />
                  ))
                }
              />
              <TextField
                label="Tarifa por Hora (USD) (Opcional)"
                type="number"
                value={profile.hourlyRate || ''}
                onChange={(e) => handleChange('hourlyRate', parseFloat(e.target.value))}
                fullWidth
                // Removed error and helperText for hourlyRate as it's now optional
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
              />
              <Autocomplete
                multiple
                options={allPreferences}
                getOptionLabel={(option) => option.name}
                value={profile.preferences || []}
                onChange={(_, newValue) => handleArrayChange('preferences', newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Preferencias Adicionales" placeholder="Selecciona habilidades" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip variant="outlined" label={option.name} {...getTagProps({ index })} />
                  ))
                }
              />
            </Stack>
          );
        case 4: // Visibilidad y Finalizar
          return (
            <Stack spacing={3}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 'semibold', color: 'text.primary' }}>
                Paso 5: Visibilidad y Finalidades
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={profile.isPublic || false} // Changed from is_public
                      onChange={(e) => handleChange('isPublic', e.target.checked)} // Changed from is_public
                    />
                  }
                  label="Hacer perfil público"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  Si tu perfil es público, otros usuarios podrán encontrarte en las búsquedas.
                </Typography>
              </FormGroup>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={profile.acceptsCollaborations || false}
                      onChange={(e) => handleChange('acceptsCollaborations', e.target.checked)}
                    />
                  }
                  label="Aceptar colaboraciones"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  Indica si estás abierto a proyectos de colaboración con otros músicos.
                </Typography>
              </FormGroup>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={profile.acceptsGigs || false} // Changed from accepts_gigs
                      onChange={(e) => handleChange('acceptsGigs', e.target.checked)} // Changed from accepts_gigs
                    />
                  }
                  label="Aceptar conciertos/eventos"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                  Indica si estás disponible para ser contratado para conciertos o eventos.
                </Typography>
              </FormGroup>
            </Stack>
          );
        default:
          return null;
      }
    },
    [
      profile,
      formErrors,
      handleChange,
      handleArrayChange,
      musicianId,
      allGenres,
      allInstruments,
      allSkills,
      allAvailability,
      allPreferences,
      handleAudioTrackChange,
      handleAddAudioTrack,
      handleRemoveAudioTrack,
      socialMediaInputs, // Added
      handleSocialMediaLinkChange, // Added
      handleAddSocialMediaLink, // Added
      handleRemoveSocialMediaLink, // Added
    ],
  );

  const profileCompletenessColor = useMemo(() => {
    if (profileCompleteness < 40) return theme.palette.error.main;
    if (profileCompleteness < 70) return theme.palette.warning.main;
    return theme.palette.success.main;
  }, [profileCompleteness, theme.palette.error.main, theme.palette.warning.main, theme.palette.success.main]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Cargando perfil...</Typography>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <ErrorOutlineIcon color="error" sx={{ fontSize: 60 }} />
        <Typography variant="h5" color="error" mt={2}>
          Error al cargar el perfil
        </Typography>
        <Typography variant="body1" color="text.secondary" mt={1}>
          No se pudo encontrar el perfil del músico o hubo un error inesperado.
        </Typography>
        <Button variant="contained" onClick={() => router.push('/dashboard')} sx={{ mt: 3 }}>
          Ir al Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: isMobile ? 1 : 4, maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, mt: 2, position: 'relative' }}>
        <Link href="/dashboard" passHref>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} sx={{ zIndex : 200, visibility: isMobile ? 'hidden' : 'visible' }}> {/* Hide on mobile if too crowded, or adjust layout */}
            Dashboard
          </Button>
        </Link>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', textAlign: 'center', flexGrow: 1, position: 'absolute', left: 0, right: 0, mx: 'auto' }}>
          Tu Perfil de <Box component="span" sx={{ color: theme.palette.warning.main }}>Artista</Box>
        </Typography>
        {/* Spacer for the right side, matching button width for centering. Adjust width as needed or hide on mobile. */}
        <Box sx={{ width: isMobile ? 0 : '190px', visibility: isMobile ? 'hidden' : 'visible' }} />
      </Box>
      {isMobile && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1, width: '100%'}}>
          <Link href="/dashboard" passHref>
            <Button variant="text" startIcon={<ArrowBackIcon />} size="small">
              Dashboard
            </Button>
          </Link>
        </Box>
      )}

      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Stepper
          activeStep={activeStep}
          orientation="horizontal"
          sx={{
            mb: 0,
            width: '100%',
            maxWidth: isMobile ? '100%' : 'md', 
            '& .MuiStep-root': { // Target individual steps for padding on mobile
              px: isMobile ? 0.5 : 1, 
            },
            '& .MuiStepLabel-label': {
              whiteSpace: 'normal',
              textAlign: 'center',
              fontSize: isMobile ? '0.70rem' : '0.875rem', // Even smaller font on mobile for labels
              mt: isMobile ? 0.5 : 0, // Add a small top margin for alternative labels on mobile
            },
            '& .MuiStepLabel-iconContainer': { // Reduce padding around icons on mobile
              py: isMobile ? 0.5 : 1,
            },
            '& .MuiStepIcon-root': { 
              fontSize: isMobile ? '1.2rem' : '1.5rem', // Slightly smaller icons on mobile
            },
            '& .MuiStepConnector-root': {
              flex: '1 1 auto',
              minWidth: isMobile ? '5px' : '30px', 
              mx: isMobile ? 0.25 : 0.5, 
            },
            pb: 1,
            px: isMobile ? 0 : 1, 
          }}
          alternativeLabel={isMobile}
        >
          {steps.map((label, index) => {
            const labelProps: { error?: boolean } = {};
            if (stepErrors[index]) {
              labelProps.error = true;
            }
            return (
              <Step key={label}>
                <StepLabel
                  onClick={() => handleStepClick(index)}
                  sx={{ cursor: submitting ? 'default' : 'pointer', '&:hover': { cursor: 'pointer' } }}
                  StepIconComponent={CustomStepIcon}
                  {...labelProps}
                >
                  {label}
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>

        <Box sx={{ my: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="overline" color="text.secondary" sx={{ mb: 0.5 }}>
            Completitud del Perfil: {profileCompleteness}%
          </Typography>
          <Box sx={{ width: '80%', maxWidth: 400 }}>
            <LinearProgress
              variant="determinate"
              value={profileCompleteness}
              sx={{
                height: 10,
                borderRadius: 5,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: profileCompletenessColor,
                },
                backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 300 : 700],
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{ 
            p: isMobile ? 2 : 3, 
            // border: '1px solid', 
            // borderColor: theme.palette.divider, 
            borderRadius: 2,
            boxShadow: theme.shadows[2],
            bgcolor: 'background.paper',
            width: '100%',
            maxWidth: isMobile ? '100%' : 'md', // Full width on mobile
          }}
        >
          <AnimatePresence mode="wait">
            <MotionBox
              key={activeStep}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              sx={{ width: '100%' }}
            >
              {renderStepContent(activeStep)}
            </MotionBox>
          </AnimatePresence>
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0 || submitting}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Atrás
            </Button>
            <Box sx={{ flex: '1 1 auto' }} />
            <Button onClick={handleNext} disabled={submitting}>
              {activeStep === steps.length - 1 ? (submitting ? <CircularProgress size={24} /> : 'Ver perfil') : 'Siguiente'}
            </Button>
          </Box>
        </Box>
      </Box>

      <Dialog open={showErrorDialog} onClose={() => setShowErrorDialog(false)}>
        <DialogTitle sx={{ m: 0, p: 2 }}>
          Error
          <IconButton
            aria-label="close"
            onClick={() => setShowErrorDialog(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom color="error">
            <ErrorOutlineIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            {error || 'Ha ocurrido un error inesperado.'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Por favor, revisa la información e inténtalo de nuevo. Si el problema persiste, contacta a soporte.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowErrorDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
