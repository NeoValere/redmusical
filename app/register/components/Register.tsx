'use client';

import React, { useState, useRef, useEffect } from 'react';
// import Image from 'next/image'; // No longer using Next Image for logo here
import { MusicNotes, MusicNotesSimple, MagnifyingGlass } from 'phosphor-react'; // Added MusicNotesSimple and MagnifyingGlass
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { FcGoogle } from 'react-icons/fc';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Link as MuiLink,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  // SvgIcon, // Not explicitly used
  useTheme, // Added
  alpha // Added
} from '@mui/material';
import Link from 'next/link'; // Added for logo link

interface RegisterProps {
  initialRole: string | null;
}

const Register = ({ initialRole }: RegisterProps) => {
  const theme = useTheme(); // Added
  const [role, setRole] = useState<string | null>(initialRole);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    checkUser();

    // Scroll into view only on initial mount if a role is already set (e.g., from URL)
    if (initialRole && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [router, supabase, initialRole]); // Removed 'role' from dependency array

  const handleRoleSelect = (
    event: React.MouseEvent<HTMLElement>,
    newRole: string | null,
  ) => {
    if (newRole !== null) {
      setRole(newRole);
      setErrors({});
      // Removed router.replace as shallow routing is not supported in next/navigation for query params
      // The role state is now managed locally, which updates the UI.
    }
  };

  const checkEmailExistence = async (emailToCheck: string) => {
    if (!emailToCheck) {
      setEmailExists(false);
      return;
    }
    try {
      const response = await fetch(`/api/register-profile?email=${encodeURIComponent(emailToCheck)}`);
      const data = await response.json();
      setEmailExists(data.exists);
      if (data.exists) {
        setErrors(prev => ({ ...prev, email: 'Este email ya está registrado. Por favor, iniciá sesión.' }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      }
    } catch (error) {
      console.error('Error checking email existence:', error);
      setEmailExists(false);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!fullName) newErrors.fullName = 'El nombre completo es requerido.';
    if (!email) {
      newErrors.email = 'El email es requerido.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El email no es válido.';
    } else if (emailExists) {
      newErrors.email = 'Este email ya está registrado. Por favor, iniciá sesión.';
    }
    if (!password) {
      newErrors.password = 'La contraseña es requerida.';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        console.error('Supabase Sign Up Error:', signUpError);
        if (signUpError.message.includes('User already registered')) {
          setErrors({ general: 'Ya existe una cuenta con este email. Por favor, iniciá sesión.' });
        } else {
          setErrors({ general: signUpError.message });
        }
        return;
      }

      if (data.user) {
        const response = await fetch('/api/register-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: data.user.id,
            fullName,
            email,
            role,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          console.error('Profile Creation Error:', result.error);
          setErrors({ general: result.error || 'Error al crear el perfil.' });
          return;
        }

        if (role === 'musician') {
          router.push(`/m/${data.user.id}`);
        } else {
          router.push('/dashboard');
        }
      } else {
        alert('Por favor, revisa tu email para confirmar tu cuenta.');
        router.push('/login');
      }
    } catch (error: unknown) {
      console.error('Registration Error:', error);
      let errorMessage = 'Ocurrió un error inesperado durante el registro.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && error.toString) {
        errorMessage = error.toString();
      }
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrors({});
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback?role=${role}`,
      },
    });

    if (error) {
      setErrors({ general: error.message });
    }
    setIsLoading(false);
  };

  const getMotivationalCopy = () => {
    let title = "Unite a la comunidad musical más grande del país";
    let subtitle = "Creamos un espacio para conectar talento y oportunidades";
    let titleHighlight = "";

    if (role === 'musician') {
      title = "Ofrecé tu talento en todo el país";
      subtitle = "Subí tu perfil, mostrá lo que hacés y empezá a recibir propuestas. Expandí tus oportunidades musicales.";
      titleHighlight = "talento";
    } else if (role === 'contractor') {
      title = "Activá el modo búsqueda y encontrá talento";
      subtitle = "Filtrá por zona, estilo e instrumento. Guardá tus favoritos. Encontrá el talento ideal para tu proyecto.";
      titleHighlight = "talento";
    }

    const renderTitle = () => {
      if (titleHighlight) {
        const parts = title.split(titleHighlight);
        return (
          <>
            {parts[0]}
            <Box component="span" sx={{ color: theme.palette.primary.main }}>{titleHighlight}</Box>
            {parts[1]}
          </>
        );
      }
      return title;
    };
    
    return (
      <>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 1, color: theme.palette.text.primary }}>
          {renderTitle()}
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          {subtitle}
        </Typography>
      </>
    );
  };

  const getButtonCopy = () => {
    if (role === 'musician') {
      return 'Crear cuenta como músico';
    } else if (role === 'contractor') {
      return 'Activar modo búsqueda';
    }
    return 'Crear cuenta →';
  };

  return (
    <Paper
      elevation={6} // Enhanced shadow for a more "PRO" feel
      sx={{
        p: { xs: 3, sm: 4 }, // Responsive padding
        borderRadius: 2, // Consistent with home page cards
        maxWidth: 500, // Slightly adjusted max width
        width: '100%',
        mx: 'auto',
        bgcolor: theme.palette.background.paper, // Dark greenish blue
        border: `1px solid ${theme.palette.divider}`, // Subtle border
        display: 'flex',
        flexDirection: 'column',
        // Removed height: '100vh' and my: 'auto' as parent handles centering
      }}
    >
      {/* Logo Section */}
      <MuiLink component={Link} href="/" color="inherit" underline="none" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
        <MusicNotesSimple size={32} color={theme.palette.primary.main} weight="fill" style={{ marginRight: "3px" }} />
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
          redmusical.ar
        </Typography>
      </MuiLink>

      {/* Motivational Copy Section */}
      <Box sx={{ textAlign: 'center', mb: 4, flexShrink: 0 }}>
        {getMotivationalCopy()}
      </Box>

      {/* Role Selection */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4, flexShrink: 0 }}>
        <ToggleButtonGroup
          value={role}
          exclusive
          onChange={handleRoleSelect}
          aria-label="select role"
          sx={{
            gap: 1, // Spacing between buttons
            '& .MuiToggleButton-root': {
              borderRadius: '8px !important', // Ensure consistent border radius
              border: `1px solid ${theme.palette.divider}`,
              fontWeight: '600', // Semibold
              transition: theme.transitions.create(['background-color', 'color', 'border-color'], {
                duration: theme.transitions.duration.short,
              }),
              px: { xs: 1.5, sm: 2 },
              py: 1,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              color: theme.palette.text.secondary,
              bgcolor: alpha(theme.palette.common.white, 0.05),
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                borderColor: alpha(theme.palette.primary.main, 0.5),
              },
              '&.Mui-selected': {
                color: theme.palette.primary.contrastText,
                bgcolor: theme.palette.primary.main,
                borderColor: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: theme.palette.primary.dark, // Darker gold on hover for selected
                  borderColor: theme.palette.primary.dark,
                },
                '& .MuiSvgIcon-root, & svg': { // Target Phosphor icons
                  color: theme.palette.primary.contrastText,
                }
              },
              '& .MuiSvgIcon-root, & svg': { // Target Phosphor icons
                color: theme.palette.text.secondary, // Default icon color
                transition: theme.transitions.create(['color'], {duration: theme.transitions.duration.short}),
              }
            },
          }}
        >
          <ToggleButton value="musician" aria-label="musician">
            <MusicNotes size={24} style={{ marginRight: theme.spacing(1) }} /> Soy músico
          </ToggleButton>
          <ToggleButton value="contractor" aria-label="contractor">
            <MagnifyingGlass size={24} style={{ marginRight: theme.spacing(1) }} /> Activar modo búsqueda
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Form Section */}
      {role && (
        <Box ref={formRef} sx={{ transition: 'opacity 300ms ease-in-out', opacity: 1 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5} sx={{ mb: 3 }}>
              <TextField
                label="Nombre completo"
                type="text"
                fullWidth
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={!!errors.fullName}
                helperText={errors.fullName}
                variant="outlined"
                sx={{
                  '& :-webkit-autofill': {
                    WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
                    WebkitTextFillColor: theme.palette.text.primary,
                    caretColor: theme.palette.text.primary,
                    transition: 'background-color 5000s ease-in-out 0s',
                  },
                  '& :-webkit-autofill:hover, & :-webkit-autofill:focus, & :-webkit-autofill:active': {
                    WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
                    WebkitTextFillColor: theme.palette.text.primary,
                    caretColor: theme.palette.text.primary,
                  },
                }}
              />
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    if (newErrors.email === 'Este email ya está registrado. Por favor, iniciá sesión.') {
                      delete newErrors.email;
                    }
                    return newErrors;
                  });
                }}
                onBlur={(e) => checkEmailExistence(e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                variant="outlined"
                sx={{
                  '& :-webkit-autofill': {
                    WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
                    WebkitTextFillColor: theme.palette.text.primary,
                    caretColor: theme.palette.text.primary,
                    transition: 'background-color 5000s ease-in-out 0s',
                  },
                  '& :-webkit-autofill:hover, & :-webkit-autofill:focus, & :-webkit-autofill:active': {
                    WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
                    WebkitTextFillColor: theme.palette.text.primary,
                    caretColor: theme.palette.text.primary,
                  },
                }}
              />
              <TextField
                label="Contraseña"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
                variant="outlined"
                sx={{
                  '& :-webkit-autofill': {
                    WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
                    WebkitTextFillColor: theme.palette.text.primary,
                    caretColor: theme.palette.text.primary,
                    transition: 'background-color 5000s ease-in-out 0s',
                  },
                  '& :-webkit-autofill:hover, & :-webkit-autofill:focus, & :-webkit-autofill:active': {
                    WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
                    WebkitTextFillColor: theme.palette.text.primary,
                    caretColor: theme.palette.text.primary,
                  },
                }}
              />
              <TextField
                label="Confirmar contraseña"
                type="password"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                variant="outlined"
                sx={{
                  '& :-webkit-autofill': {
                    WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
                    WebkitTextFillColor: theme.palette.text.primary,
                    caretColor: theme.palette.text.primary,
                    transition: 'background-color 5000s ease-in-out 0s',
                  },
                  '& :-webkit-autofill:hover, & :-webkit-autofill:focus, & :-webkit-autofill:active': {
                    WebkitBoxShadow: `0 0 0 1000px ${theme.palette.background.paper} inset`,
                    WebkitTextFillColor: theme.palette.text.primary,
                    caretColor: theme.palette.text.primary,
                  },
                }}
              />
            </Stack>

            {errors.general && (
              <Alert severity="error" sx={{ mb: 2.5, bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.light }}>
                {errors.general}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              color="primary" // Uses theme's primary color (gold) and contrast text
              fullWidth
              disabled={isLoading}
              size="large"
              sx={{ py: 1.5, fontWeight: 'bold', mb: 2, fontSize: '1.1rem' }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : getButtonCopy()}
            </Button>
          </form>

          <Button
            onClick={handleGoogleLogin}
            variant="outlined" // Changed to outlined
            color="primary" // Uses theme's primary color for border and text
            fullWidth
            disabled={isLoading}
            size="large"
            startIcon={<FcGoogle size={22} />} // FcGoogle is already an SVG component
            sx={{ 
              py: 1.5, 
              fontWeight: 'bold', 
              mb: 3, 
              fontSize: '1.1rem',
              borderColor: theme.palette.primary.main, // Ensure border is gold
              color: theme.palette.primary.main, // Ensure text is gold
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.08), // Subtle gold background on hover
                borderColor: theme.palette.primary.light,
              }
            }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Registrarse con Google'}
          </Button>

          <Typography variant="body2" align="center" color="text.secondary">
            ¿Ya tenés cuenta?{' '}
            <MuiLink 
              component={Link} // Use NextLink for navigation
              href="/login" 
              underline="hover" 
              sx={{ 
                color: theme.palette.primary.main, // Gold color for link
                fontWeight: 'medium',
                '&:hover': {
                  color: theme.palette.primary.light,
                }
              }}
            >
              Iniciar sesión
            </MuiLink>
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default Register;
