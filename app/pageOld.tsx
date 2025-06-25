"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { MusicNotesSimple, CheckCircle, User, Buildings } from 'phosphor-react';
import { Box, AppBar, Toolbar, Typography, Button, Container, Link as MuiLink, Stack, useTheme, Card, CardContent } from '@mui/material';

export default function Home() {
  const [userSession, setUserSession] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const theme = useTheme();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserSession(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Check for existing profiles in our database as the source of truth
          const [musicianProfileRes, contractorProfileRes] = await Promise.all([
            fetch(`/api/register-profile?userId=${user.id}&role=musician`),
            fetch(`/api/register-profile?userId=${user.id}&role=contractor`)
          ]);

          const musicianData = await musicianProfileRes.json();
          const contractorData = await contractorProfileRes.json();

          const hasMusicianProfile = musicianData.exists;
          const hasContractorProfile = contractorData.exists;

          if (hasMusicianProfile) {
            router.push(`/m/${user.id}`);
          } else if (hasContractorProfile) {
            router.push('/dashboard/search');
          } else {
            // If session exists but no profiles, redirect to select-role page
            router.push('/select-role');
          }
        } else {
          setUserSession(false);
        }
      } else {
        setUserSession(false);
      }
    };
    checkSession();
  }, [router, supabase]);

  // If userSession is true, we are already redirecting in useEffect, so render nothing or a loading state
  if (userSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-800">
        Cargando...
      </div>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      {/* Navigation */}
      <AppBar position="static" color="transparent" elevation={0} sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <Toolbar sx={{ maxWidth: '1280px', width: '100%', mx: 'auto', px: { xs: 2, sm: 3 } }}>
          <MuiLink component={Link} href="/" color="inherit" underline="none" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <MusicNotesSimple size={24} color={theme.palette.primary.main} weight="fill" style={{ marginRight: 8 }} />
            <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
              redmusical.ar
            </Typography>
          </MuiLink>
          <Button component={Link} href="/login" sx={{ color: 'text.primary', '&:hover': { bgcolor: 'action.hover' } }}>
            Iniciar sesión
          </Button>
        </Toolbar>
      </AppBar>

      {/* 1. Hero Section */}
      <Box
        sx={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundImage: "url('/images/musicians-bw.png')",
          color: 'white',
        }}
      >
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'black', opacity: 0.4 }} />
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 10, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', lineHeight: 'tight', mb: 2 }}>
            La red profesional de músicos de Argentina
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, maxWidth: 'md' }}>
            Encontrá músicos reales. Ofrecé tu talento. Filtrá, escuchá y conectá. Todo en un solo lugar.
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, width: '100%', maxWidth: 384 }}>
            <Button
              component={Link}
              href="/register?role=musician"
              variant="contained"
              sx={{
                bgcolor: '#53887a',
                color: 'white',
                fontWeight: 'semibold',
                '&:hover': { bgcolor: 'black', color: 'white' },
                flexGrow: 1,
                py: 1.5,
                fontSize: '1.125rem',
              }}
            >
              Soy músico
            </Button>
            <Button
              component={Link}
              href="/register?role=contractor"
              variant="contained"
              sx={{
                bgcolor: 'grey.200', // Using grey for light background
                color: 'black',
                fontWeight: 'semibold',
                '&:hover': { bgcolor: 'black', color: 'white' },
                flexGrow: 1,
                py: 1.5,
                fontSize: '1.125rem',
              }}
            >
              Busco músicos
            </Button>
          </Box>
        </Container>
      </Box>

      {/* 2. Qué es redmusical.ar */}
      <Box component="section" sx={{ py: 8, px: 2, maxWidth: 'md', mx: 'auto', textAlign: 'center' }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'semibold', mb: 2 }}>
          ¿Qué es redmusical.ar?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          redmusical.ar es la primera red abierta y profesional de músicos disponibles para contrataciones en Argentina.
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Creamos un espacio donde los músicos pueden ofrecer su talento y las personas o productoras pueden encontrar músicos por estilo, instrumento y zona.
        </Typography>
        <Box sx={{ mt: 4, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3, textAlign: 'left' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <CheckCircle size={24} color={theme.palette.primary.main} weight="fill" />
            <Typography variant="body1" color="text.secondary">Gratuito para empezar</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <CheckCircle size={24} color={theme.palette.primary.main} weight="fill" />
            <Typography variant="body1" color="text.secondary">Hecho en Argentina</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <CheckCircle size={24} color={theme.palette.primary.main} weight="fill" />
            <Typography variant="body1" color="text.secondary">Sin intermediarios</Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <CheckCircle size={24} color={theme.palette.primary.main} weight="fill" />
            <Typography variant="body1" color="text.secondary">Acceso directo al talento</Typography>
          </Stack>
        </Box>
      </Box>

      {/* 3. Cómo funciona */}
      <Box component="section" sx={{ py: 8, px: 2, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'semibold', textAlign: 'center', mb: 5 }}>
            Cómo funciona
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 6 }}>
            {/* Para músicos */}
            <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <User size={32} color={theme.palette.primary.main} weight="fill" />
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>Para músicos:</Typography>
                </Stack>
                <Stack spacing={1.5} sx={{ color: 'text.secondary' }}>
                  <Typography>1. Registrate gratis</Typography>
                  <Typography>2. Subí tu perfil con links y disponibilidad</Typography>
                  <Typography>3. Empezá a recibir contactos</Typography>
                </Stack>
              </CardContent>
            </Card>
            {/* Para contratantes */}
            <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <Buildings size={32} color={theme.palette.primary.main} weight="fill" />
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>¿Buscás músicos o banda?</Typography>
                </Stack>
                <Stack spacing={1.5} sx={{ color: 'text.secondary' }}>
                  <Typography>1. Usá filtros para buscar músicos por zona e instrumento</Typography>
                  <Typography>2. Escuchá su material</Typography>
                  <Typography>3. Contactalos directamente</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* 4. A quién está dirigido */}
      <Box component="section" sx={{ py: 8, px: 2, maxWidth: 'lg', mx: 'auto' }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'semibold', textAlign: 'center', mb: 5 }}>
          A quién está dirigido
        </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 6 }}>
            {/* ¿Sos músico? */}
            <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <User size={32} color={theme.palette.primary.main} weight="fill" />
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>¿Sos músico?</Typography>
                </Stack>
                <Stack spacing={1} sx={{ color: 'text.secondary' }}>
                  <Typography>Solista, sesionista o parte de una banda</Typography>
                  <Typography>Tocás en vivo o hacés grabaciones</Typography>
                  <Typography>Querés que te encuentren</Typography>
                </Stack>
              </CardContent>
            </Card>
            {/* ¿Buscás músicos? */}
            <Card sx={{ p: 3, boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <Buildings size={32} color={theme.palette.primary.main} weight="fill" />
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>¿Buscás músicos?</Typography>
                </Stack>
                <Stack spacing={1} sx={{ color: 'text.secondary' }}>
                  <Typography>Sos productor, organizador, director o particular</Typography>
                  <Typography>Necesitás talento profesional para un evento o proyecto</Typography>
                  <Typography>Querés dejar de buscar en grupos de WhatsApp</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Box>
      </Box>

      {/* 5. Testimonio */}
      <Box component="section" sx={{ py: 8, px: 2, bgcolor: 'background.paper', textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h2" sx={{ fontWeight: 'bold', color: 'grey.300', mb: 2 }}>&ldquo;</Typography>
          <Typography variant="h6" component="p" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
            “Poder buscar músicos por estilo y zona como si fuera un catálogo cambió mi forma de producir. Es una herramienta que necesitábamos hace años.”
          </Typography>
          <Typography variant="body1" sx={{ mt: 3, fontWeight: 'semibold' }}>— Joaquín M., productor audiovisual</Typography>
        </Container>
      </Box>

      {/* 6. Planes (teaser) */}
      <Box component="section" sx={{ py: 8, px: 2, maxWidth: 'md', mx: 'auto', textAlign: 'center' }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'semibold', mb: 2 }}>
          ¿Querés destacar tu perfil o contactar músicos más rápido?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Con un plan Premium, tenés más visibilidad y funciones avanzadas.
        </Typography>
        <Button
          component={Link}
          href="/plans"
          variant="contained"
          sx={{
            mt: 4,
            bgcolor: '#53887a',
            color: 'white',
            fontWeight: 'semibold',
            '&:hover': { bgcolor: 'black', color: 'white' },
            px: 4,
            py: 1.5,
            fontSize: '1.125rem',
          }}
        >
          Ver planes
        </Button>
      </Box>

      {/* 7. CTA final */}
      <Box component="section" sx={{ py: 8, px: 2, bgcolor: 'primary.dark', color: 'white', textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>Unite a la red.</Typography>
          <Typography variant="body1" sx={{ mt: 1, color: 'grey.300' }}>Mostrá tu trabajo. Encontrá talento. Hacé parte de la comunidad musical que se conecta.</Typography>
          <Button
            component={Link}
            href="/register"
            variant="contained"
            sx={{
            mt: 4,
            bgcolor: '#53887a',
            color: 'white',
            fontWeight: 'semibold',
            '&:hover': { bgcolor: 'white', color: 'black' },
            px: 4,
            py: 1.5,
            fontSize: '1.125rem',
          }}
          >
            Crear mi cuenta
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ py: 4, textAlign: 'center', color: 'text.secondary', fontSize: '0.875rem' }}>
        <Typography variant="body2">
          &copy; {new Date().getFullYear()} redmusical.ar. Todos los derechos reservados.
        </Typography>
      </Box>
    </Box>
  );
}
