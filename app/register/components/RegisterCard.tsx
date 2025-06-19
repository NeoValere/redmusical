'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { MusicNotes, Headphones, Warning } from 'phosphor-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
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
  SvgIcon,
} from '@mui/material';

const RegisterCard = () => {
  const [role, setRole] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    checkUser();

    const roleParam = searchParams.get('role');
    if (roleParam && (roleParam === 'musician' || roleParam === 'contractor') && !role) {
      setRole(roleParam);
    }
    if (role && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [role, searchParams, router, supabase]);

  const handleRoleSelect = (
    event: React.MouseEvent<HTMLElement>,
    newRole: string | null,
  ) => {
    if (newRole !== null) {
      setRole(newRole);
      setErrors({});
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set('role', newRole);
      router.replace(`?${newSearchParams.toString()}`);
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
          router.push(`/musicians/${data.user.id}`);
        } else {
          router.push('/dashboard');
        }
      } else {
        alert('Por favor, revisa tu email para confirmar tu cuenta.');
        router.push('/login');
      }
    } catch (error: any) {
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
    if (role === 'musician') {
      return (
        <>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>Ofrecé tu talento en todo el país</Typography>
          <Typography variant="body1" color="text.secondary" align="center">Subí tu perfil, mostrá tu trabajo y empezá a recibir propuestas. Ya hay contratantes buscando músicos como vos.</Typography>
        </>
      );
    } else if (role === 'contractor') {
      return (
        <>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>Encontrá músicos reales, sin vueltas</Typography>
          <Typography variant="body1" color="text.secondary" align="center">Filtrá por zona, estilo e instrumento. Guardá tus favoritos. Todo en una red profesional hecha en Argentina.</Typography>
        </>
      );
    }
    return (
      <>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>Unite a la comunidad musical más grande del país</Typography>
        <Typography variant="body1" color="text.secondary" align="center">Creamos un espacio para conectar talento y oportunidades</Typography>
      </>
    );
  };

  const getButtonCopy = () => {
    if (role === 'musician') {
      return 'Crear cuenta como músico';
    } else if (role === 'contractor') {
      return 'Crear cuenta como contratante';
    }
    return 'Crear cuenta →';
  };

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 2, maxWidth: 450, width: '100%', mx: 'auto', position: 'relative', overflow: 'hidden' }}>
      {/* Subtle background illustration/texture */}
      <Box sx={{ position: 'absolute', inset: 0, opacity: 0.1, zIndex: 0, backgroundImage: 'url(/path/to/subtle-musical-texture.svg)', backgroundSize: 'cover' }} />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Image src="/next.svg" alt="redmusical.ar Logo" width={150} height={40} />
        </Box>

        <Box sx={{ textAlign: 'center', mb: 4, transition: 'opacity 500ms' }}>
          {getMotivationalCopy()}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
          <ToggleButtonGroup
            value={role}
            exclusive
            onChange={handleRoleSelect}
            aria-label="select role"
            sx={{
              '& .MuiToggleButton-root': {
                borderRadius: '9999px', // full rounded
                fontWeight: 'semibold',
                transition: 'all 300ms',
                px: 3,
                py: 1.5,
                '&.Mui-selected': {
                  bgcolor: 'error.main', // Red background for selected
                  color: 'white',
                  boxShadow: 3,
                  '&:hover': {
                    bgcolor: 'error.dark',
                  },
                },
                '&:not(.Mui-selected)': {
                  bgcolor: 'grey.200', // Gray background for unselected
                  color: 'text.secondary',
                  '&:hover': {
                    bgcolor: 'grey.300',
                  },
                },
              },
            }}
          >
            <ToggleButton value="musician" aria-label="musician">
              <MusicNotes size={24} style={{ marginRight: 8 }} /> Soy músico
            </ToggleButton>
            <ToggleButton value="contractor" aria-label="contractor">
              <Headphones size={24} style={{ marginRight: 8 }} /> Soy contratante
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {role && (
          <Box ref={formRef} sx={{ transition: 'opacity 500ms ease-in-out', opacity: 1 }}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={2} sx={{ mb: 3 }}>
                <TextField
                  label="Nombre completo"
                  type="text"
                  fullWidth
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  error={!!errors.fullName}
                  helperText={errors.fullName}
                  variant="outlined"
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
                />
              </Stack>

              {errors.general && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {errors.general}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={isLoading}
                sx={{ py: 1.5, fontWeight: 'semibold', mb: 2 }}
              >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : getButtonCopy()}
              </Button>
            </form>

            <Button
              onClick={handleGoogleLogin}
              variant="contained"
              color="error"
              fullWidth
              disabled={isLoading}
              startIcon={<FcGoogle />}
              sx={{ py: 1.5, fontWeight: 'semibold', mb: 3 }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Registrarse con Google'}
            </Button>
          </Box>
        )}

        <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 3 }}>
          ¿Ya tenés cuenta?{' '}
          <MuiLink href="/login" underline="hover" color="error">
            Iniciar sesión
          </MuiLink>
        </Typography>
      </Box>
    </Paper>
  );
};

export default RegisterCard;
