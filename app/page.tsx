"use client";

export const runtime = 'nodejs';

import Link from 'next/link';
import { useEffect, useState } from 'react'; // Removed useRef
import { createClient } from '@/utils/supabase/client';
import Slider from 'react-slick'; // Added Slider
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { useRouter } from 'next/navigation';
import { MusicNotesSimple, SignIn, UserPlus, CheckCircle, Info, Lightbulb, UsersThree, Buildings, Quotes, Sparkle, MagnifyingGlass, User as UserIcon, SignOut } from 'phosphor-react'; // Aliased User to UserIcon
import { Box, Typography, Button, Container, Link as MuiLink, Stack, useTheme, Paper, Card, CardContent, alpha, TextField, InputAdornment } from '@mui/material';
import { motion } from 'framer-motion';
import DynamicHeroButton from '@/app/components/DynamicHeroButton';
import SharedAppBar from '@/app/components/SharedAppBar';
import GlobalBackground from '@/app/components/GlobalBackground';

// Animaciones
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

import { User } from '@supabase/supabase-js'; // Import User type from supabase-js

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<{ isMusician: boolean; isContractor: boolean; userId: string | null }>({ isMusician: false, isContractor: false, userId: null });
  const router = useRouter();
  const supabase = createClient();
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const searchPlaceholders = [
    "guitarristas en Córdoba",
    "bandas de jazz para eventos",
    "percusionistas en Rosario",
    "cantantes pop",
    "violinistas para casamientos",
    "bandas tributo a Soda",
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setPlaceholderIndex((prevIndex) => (prevIndex + 1) % searchPlaceholders.length);
    }, 3000); // Change placeholder every 3 seconds
    return () => clearInterval(intervalId);
  }, [searchPlaceholders.length]);

  useEffect(() => {
    const checkUserAndRoles = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session && session.user) {
        setCurrentUser(session.user);
        try {
          const response = await fetch('/api/user/profile-details');
          if (response.ok) {
            const rolesData = await response.json();
            setUserRoles({
              isMusician: rolesData.isMusician,
              isContractor: rolesData.isContractor,
              userId: rolesData.userId,
            });
          } else {
            console.error('Failed to fetch user roles:', response.status);
            setUserRoles({ isMusician: false, isContractor: false, userId: session.user.id }); // Fallback
          }
        } catch (error: unknown) { // Changed to unknown
          console.error('Error fetching user roles:', error instanceof Error ? error.message : 'An unknown error occurred'); // Added instanceof Error check
          setUserRoles({ isMusician: false, isContractor: false, userId: session.user.id }); // Fallback
        }
      } else {
        setCurrentUser(null);
        setUserRoles({ isMusician: false, isContractor: false, userId: null });
      }
    };

    checkUserAndRoles();
  }, [supabase]); // Removed router from dependencies as it's not directly used for redirection here anymore

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setUserRoles({ isMusician: false, isContractor: false, userId: null });
    router.refresh();
  };

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', color: 'text.primary', overflowX: 'hidden' }}>
      <GlobalBackground />
      <SharedAppBar />
      {/* 1. Hero Section - Redesigned */}
      <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
        <Box
          component={motion.section}
          variants={fadeIn}
          sx={{
            minHeight: 'calc(100vh - 65px)', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            px: 2,
            bgcolor: 'transparent', // Make Hero background transparent
          }}
        >
          {/* Elementos decorativos sutiles */}
          <Box
            sx={{
              position: 'absolute',
              top: '10%',
              left: '10%',
              width: '200px',
              height: '200px',
              bgcolor: theme.palette.primary.dark, // Dorado oscuro
              opacity: 0.15, // Un poco más visible
              borderRadius: '50%',
              filter: 'blur(60px)', // Más blur
              zIndex: 0,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '10%',
              right: '10%',
              width: '250px',
              height: '250px',
              bgcolor: theme.palette.secondary.dark, // Gris azulado oscuro
              opacity: 0.1,
              borderRadius: '50%',
              filter: 'blur(70px)', // Más blur
              zIndex: 0,
            }}
          />

          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: { xs: 6, md: 12 } }}> {/* Changed to lg for more space */}
            <motion.div variants={fadeIn}>
              <Typography
                variant="h1" // Adjusted for new copy
                component="h1"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '2.2rem', sm: '3.5rem', md: '4.5rem' }, // Adjusted for mobile
                  lineHeight: 1.2,
                  mb: 1, // Reduced margin
                  color: theme.palette.text.primary, // Main text color
                }}
              >
                Encontrá músicos para cualquier ocasión.
              </Typography>
            </motion.div>
            <motion.div variants={fadeIn}>
              <Typography variant="h5" component="p" sx={{ mb: 4, color: theme.palette.text.secondary, maxWidth: '800px', mx: 'auto' }}>
                Desde bandas completas a instrumentistas o vocalistas solistas.
              </Typography>
            </motion.div>
            
            <motion.div variants={fadeIn} style={{ width: '100%', maxWidth: '700px', margin: '0 auto' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder={searchPlaceholders[placeholderIndex]}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{
                    // Add margin bottom on mobile to compensate for the hidden button
                    mb: { xs: 2, sm: 0 },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px', // Softer corners
                      backgroundColor: alpha(theme.palette.background.paper, 0.7), // More transparent
                      backdropFilter: 'blur(10px)', // Frosted glass effect
                      '& fieldset': {
                        borderColor: alpha(theme.palette.divider, 0.5),
                      },
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main,
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputBase-input': {
                      padding: '14px 16px', // Adjust padding for comfort
                      fontSize: '1.1rem',
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment 
                        position="end"
                        onClick={() => router.push(`/musicos?q=${encodeURIComponent(searchTerm)}`)}
                        sx={{ cursor: 'pointer', pr: 1 }} // Add padding right for spacing
                      >
                        <MagnifyingGlass size={24} color={theme.palette.primary.main} />
                      </InputAdornment>
                    ),
                  }}
                  onKeyPress={(ev) => {
                    if (ev.key === 'Enter') {
                      router.push(`/musicos?q=${encodeURIComponent(searchTerm)}`);
                      ev.preventDefault();
                    }
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  onClick={() => router.push(`/musicos?q=${encodeURIComponent(searchTerm)}`)}
                  sx={{ 
                    py: '14px', // Match TextField height
                    px: 4, 
                    fontSize: '1.1rem',
                    whiteSpace: 'nowrap', // Prevent text wrapping
                    boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.25)}`,
                    // Hide button on mobile, show on sm and up
                    display: { xs: 'none', sm: 'block' },
                    width: { xs: '100%', sm: 'auto' }
                  }}
                >
                  Buscar
                </Button>
              </Stack>
            </motion.div>

            <Box component={motion.div} variants={fadeIn} sx={{ mb: 4 }}>
              <DynamicHeroButton currentUser={currentUser} userRoles={userRoles} />
            </Box>

            <motion.div variants={fadeIn}>
              <Stack 
                direction={{ xs: 'column', md: 'row' }} 
                spacing={2} 
                justifyContent="center" 
                alignItems="center"
                sx={{ mt: 4, mb: 2 }}
              >
                <Typography variant="h6" sx={{ color: theme.palette.text.secondary, display: { xs: 'none', md: 'block'} }}>
                  ¿Sos músico o banda? <MuiLink component={Link} href={currentUser ? (userRoles.isMusician ? `/m/${userRoles.userId}` : "/select-role?role=musician") : "/register?role=musician"} fontWeight="bold" color="primary">Creá tu perfil gratis y mostrate.</MuiLink>
                </Typography>
                <Typography variant="h6" sx={{ color: theme.palette.text.secondary, display: { xs: 'none', md: 'block'} }}>
                  ¿Buscás músicos? <MuiLink component={Link} href="/musicos" fontWeight="bold" color="primary">Explorá nuestra red.</MuiLink>
                </Typography>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2} 
                  justifyContent="center" 
                  alignItems="stretch"
                  sx={{ mt: 4, mb: 2, px: { xs: 2, sm: 0 }, display: {xs: 'flex', md: 'none'}, width: '100%' }}
                >
                  <Paper sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: `1px solid ${theme.palette.divider}`, flex: 1 }}>
                    <Typography variant="body1" sx={{ color: theme.palette.text.secondary, textAlign: 'center' }}>
                      ¿Sos músico o banda? <MuiLink component={Link} href={currentUser ? (userRoles.isMusician ? `/m/${userRoles.userId}` : "/select-role?role=musician") : "/register?role=musician"} fontWeight="bold" color="primary">Creá tu perfil gratis y mostrate.</MuiLink>
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: `1px solid ${theme.palette.divider}`, flex: 1 }}>
                    <Typography variant="body1" sx={{ color: theme.palette.text.secondary, textAlign: 'center' }}>
                      ¿Buscás músicos? <MuiLink component={Link} href="/musicos" fontWeight="bold" color="primary">Explorá nuestra red.</MuiLink>
                    </Typography>
                  </Paper>
                </Stack>
              </Stack>
            </motion.div>

          </Container>
        </Box>
      </motion.div>

      {/* 2. Qué es redmusical.ar - This section can be kept or modified as per overall design strategy */}
      <Box component={motion.section} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={staggerContainer} sx={{ py: { xs: 6, md: 10 }, bgcolor: theme.palette.background.paper }}> {/* Fondo papel */}
        <Container maxWidth="lg">
          <motion.div variants={fadeIn}>
            <Typography variant="h2" component="h2" sx={{ fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' }, fontWeight: 'bold', textAlign: 'center', mb: 1, color: theme.palette.text.primary }}>
              ¿Qué es <span style={{ color: theme.palette.primary.main }}>redmusical.ar</span>? {/* Dorado */}
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mb: 6, maxWidth: '750px', mx: 'auto' }}>
              Nuestra misión es conectar a la vibrante comunidad musical de Argentina. Diseñamos un espacio para que el talento encuentre oportunidades y las oportunidades encuentren talento.
            </Typography>
          </motion.div>
          <Box
            display="grid"
            gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
            gap={3} 
          >
            {[
              {
                icon: <Info size={32} color={theme.palette.primary.main} weight="fill" />, /* Dorado */
                title: 'Plataforma Abierta',
                description: 'Un catálogo profesional y accesible para músicos de todos los géneros y niveles.',
              },
              {
                icon: <Lightbulb size={32} color={theme.palette.primary.main} weight="fill" />, /* Dorado */
                title: 'Conexiones Directas',
                description: 'Facilitamos el contacto sin intermediarios entre músicos y aquellos que buscan sus servicios.',
              },
              {
                icon: <UsersThree size={32} color={theme.palette.primary.main} weight="fill" />, /* Dorado */
                title: 'Comunidad Nacional',
                description: 'Hecho en Argentina, para potenciar y visibilizar el talento local en todo el país.',
              },
              {
                icon: <CheckCircle size={32} color={theme.palette.primary.main} weight="fill" />, /* Dorado */
                title: 'Gratuito para Empezar',
                description: 'Creá tu perfil y comenzá a explorar oportunidades sin costo inicial.',
              },
            ].map((cardItem, index) => (
              <motion.div variants={fadeIn} key={index} style={{ height: '100%' }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    height: '100%',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    bgcolor: theme.palette.background.default, // Fondo default para contraste con sección paper
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'flex-start', 
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: theme.shadows[4],
                    }
                  }}
                >
                  <Box sx={{ mb: 2, display: 'inline-block' }}>{cardItem.icon}</Box>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 1, color: theme.palette.text.primary }}>
                    {cardItem.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {cardItem.description}
                  </Typography>
                </Paper>
              </motion.div>
            ))}
          </Box>
        </Container>
      </Box>

      {/* 3. Cómo funciona */}
      <Box component={motion.section} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer} sx={{ py: { xs: 6, md: 10 }, bgcolor: alpha(theme.palette.background.default, 0.7), backdropFilter: 'blur(10px)' }}> {/* Fondo default */}
        <Container maxWidth="lg">
          <motion.div variants={fadeIn}>
            <Typography variant="h2" component="h2" sx={{ fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' }, fontWeight: 'bold', textAlign: 'center', mb: 1, color: theme.palette.text.primary }}>
              Simple, Rápido y Directo
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mb: 6, maxWidth: '750px', mx: 'auto' }}>
              Así de fácil es conectar en redmusical.ar, tanto si ofrecés tu talento como si lo estás buscando.
            </Typography>
          </motion.div>

          <Box
            display="grid"
            gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} 
            gap={4} 
          >
            {/* Para músicos */}
            <motion.div variants={fadeIn}> 
              <Card sx={{
                p: { xs: 2, sm: 3 },
                boxShadow: theme.shadows[2],
                borderRadius: 2,
                height: '100%', 
                display: 'flex',
                flexDirection: 'column',
                bgcolor: theme.palette.background.paper, // Fondo paper para contraste con sección default
                border: `1px solid ${theme.palette.divider}`
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
                    <UserIcon size={36} color={theme.palette.primary.main} weight="duotone" /> {/* Dorado */}
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                      Para Músicos
                    </Typography>
                  </Stack>
                  <Stack spacing={2}>
                    {[
                      { step: 1, text: 'Registrate gratis y creá tu perfil profesional.' },
                      { step: 2, text: 'Mostrá tu talento: links, videos, repertorio y disponibilidad.' },
                      { step: 3, text: 'Comenzá a recibir propuestas y expandí tu red de contactos.' },
                    ].map((item) => (
                      <Stack direction="row" spacing={1.5} alignItems="center" key={item.step}>
                        <Box sx={{
                          bgcolor: theme.palette.primary.main, // Dorado
                          color: theme.palette.primary.contrastText, // Negro suave
                          width: '28px', height: '28px', 
                          minWidth: '28px', minHeight: '28px',
                          borderRadius: '50%', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.875rem',
                          flexShrink: 0
                        }}>
                          {item.step}
                        </Box>
                        <Typography variant="body1" color="text.secondary">{item.text}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>

            {/* Para contratantes */}
            <motion.div variants={fadeIn}> 
              <Card 
                elevation={0}
              sx={{
                p: { xs: 2, sm: 3 },
                boxShadow: theme.shadows[2],
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: theme.palette.background.paper, // Fondo paper
                border: `1px solid ${theme.palette.divider}`
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
                    <Buildings size={36} color={theme.palette.secondary.main} weight="duotone" /> {/* Gris azulado */}
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                    ¿Buscás músicos o banda?
                  </Typography>
                  </Stack>
                  <Stack spacing={2}>
                    {[
                      { step: 1, text: 'Buscá y filtrá músicos por instrumento, estilo, zona y más.' },
                      { step: 2, text: 'Explorá perfiles detallados: escuchá su música y conocé su experiencia.' },
                      { step: 3, text: 'Contactá directamente y sin intermediarios al talento que necesitás.' },
                    ].map((item) => (
                      <Stack direction="row" spacing={1.5} alignItems="center" key={item.step}>
                        <Box sx={{
                          bgcolor: theme.palette.secondary.main, // Gris azulado
                          color: theme.palette.secondary.contrastText, // Blanco
                          width: '28px', height: '28px',
                          minWidth: '28px', minHeight: '28px',
                          borderRadius: '50%', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.875rem',
                          flexShrink: 0
                        }}>
                          {item.step}
                        </Box>
                        <Typography variant="body1" color="text.secondary">{item.text}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Box>
        </Container>
      </Box>

      {/* 4. A quién está dirigido */}
      <Box component={motion.section} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer} sx={{ py: { xs: 6, md: 10 }, bgcolor: theme.palette.background.paper }}> {/* Fondo paper */}
        <Container maxWidth="lg">
          <motion.div variants={fadeIn}>
            <Typography variant="h2" component="h2" sx={{ fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' }, fontWeight: 'bold', textAlign: 'center', mb: 1, color: theme.palette.text.primary }}>
              ¿Es para vos? ¡Claro que sí!
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mb: 6, maxWidth: '750px', mx: 'auto' }}>
              Nuestra red está pensada para todos los que viven y respiran música en Argentina.
            </Typography>
          </motion.div>

          <Box
            display="grid"
            gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} 
            gap={4}
          >
            {/* ¿Sos músico? */}
            <motion.div variants={fadeIn}>
              <Card 
              
              sx={{
                p: { xs: 2, sm: 3 },
                boxShadow: theme.shadows[2],
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: theme.palette.background.default, // Fondo default para contraste
                border: `1px solid ${theme.palette.divider}`
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
                    <UserIcon size={36} color={theme.palette.primary.main} weight="duotone" /> {/* Dorado */}
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                      ¿Sos Músico?
                    </Typography>
                  </Stack>
                  <Stack spacing={1.5}>
                    {[
                      'Solista, sesionista o parte de una banda.',
                      'Tocás en vivo, das clases o grabás en estudio.',
                      'Querés más visibilidad y nuevas oportunidades.',
                      'Buscás profesionalizar tu carrera musical.',
                    ].map((text, i) => (
                      <Stack direction="row" spacing={1.5} alignItems="center" key={i}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '20px', minHeight: '20px', flexShrink: 0 }}>
                          <CheckCircle size={20} color={theme.palette.primary.main} weight="fill" /> {/* Dorado */}
                        </Box>
                        <Typography variant="body1" color="text.secondary">{text}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>

            {/* ¿Buscás músicos? */}
            <motion.div variants={fadeIn}>
              <Card 
               elevation={0}
                sx={{
                p: { xs: 2, sm: 3 },
                boxShadow: theme.shadows[2],
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: theme.palette.background.default, // Fondo default
                border: `1px solid ${theme.palette.divider}`
              }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
                    <Buildings size={36} color={theme.palette.secondary.main} weight="duotone" /> {/* Gris azulado */}
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                      ¿Buscás Músicos?
                    </Typography>
                  </Stack>
                  <Stack spacing={1.5}>
                    {[
                      'Productor, manager, dueño de bar o productora de eventos.',
                      'Necesitás talento para un show, grabación o proyecto especial.',
                      'Querés encontrar profesionales de forma rápida y confiable.',
                      'Buscás simplificar tu proceso de contratación.',
                    ].map((text, i) => (
                      <Stack direction="row" spacing={1.5} alignItems="center" key={i}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '20px', minHeight: '20px', flexShrink: 0 }}>
                          <CheckCircle size={20} color={theme.palette.secondary.main} weight="fill" /> {/* Gris azulado */}
                        </Box>
                        <Typography variant="body1" color="text.secondary">{text}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Box>
        </Container>
      </Box>

      {/* 5. Testimonios Carousel */}
      <Box component={motion.section} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={staggerContainer} sx={{ py: { xs: 6, md: 10 }, bgcolor: alpha(theme.palette.background.default, 0.7), backdropFilter: 'blur(10px)', overflow: 'hidden' }}>
        <Container maxWidth="lg">
          <Box component={motion.div} variants={fadeIn} sx={{ mb: 5, textAlign: 'center' }}>
            <Typography variant="h2" component="h2" sx={{ fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' }, fontWeight: 'bold', mb: 1, color: theme.palette.text.primary }}>
              Lo que dicen de <span style={{ color: theme.palette.primary.main }}>nosotros</span>
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '750px', mx: 'auto' }}>
              Músicos y quienes buscan talento comparten su experiencia en redmusical.ar.
            </Typography>
          </Box>

          <motion.div variants={fadeIn}>
            <Slider
              {...{
                dots: false, // Remove dots
                arrows: false, // Remove arrows
                infinite: true,
                speed: 700, 
                slidesToShow: 1,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 6000,
                fade: true, 
                cssEase: 'linear', 
                
              }}
            >
              {[
                {
                  quote: "Poder buscar músicos por estilo y zona como si fuera un catálogo cambió mi forma de producir. Es una herramienta que necesitábamos hace años.",
                  author: "Joaquín M.",
                  role: "Productor Audiovisual"
                },
                {
                  quote: "¡Encontré al guitarrista perfecto para mi banda en menos de una semana! La plataforma es súper intuitiva y llena de talento.",
                  author: "Laura S.",
                  role: "Cantante y Compositora"
                },
                {
                  quote: "Como sonidista, redmusical.ar me abrió puertas a eventos que antes no llegaba. ¡Totalmente recomendable!",
                  author: "Carlos V.",
                  role: "Técnico de Sonido"
                },
                {
                  quote: "La facilidad para mostrar mi trabajo y que me contacten directamente es increíble. Ya conseguí varias fechas.",
                  author: "Martina R.",
                  role: "DJ y Productora Musical"
                },
                {
                  quote: "Organizar el festival fue mucho más simple gracias a redmusical.ar. Pude contactar y contratar a todas las bandas desde un solo lugar.",
                  author: "Andrés G.",
                  role: "Organizador de Eventos"
                },
                {
                  quote: "Excelente iniciativa para conectar a la comunidad musical argentina. ¡Ya creé mi perfil y estoy explorando!",
                  author: "Sofía L.",
                  role: "Estudiante de Música"
                }
              ].map((testimonial, index) => (
                <Box key={index} sx={{ textAlign: 'center', px: {xs: 2, sm: 4, md: 6} /* Add some padding */ }}>
                  <Box sx={{ mb: 3 }}> {/* Reduced margin from 4 to 3 */}
                    <Quotes size={48} color={theme.palette.primary.main} weight="fill" style={{ transform: 'rotate(180deg)' }} />
                  </Box>
                  <Typography
                    variant="h5" // Reverted to h5
                    component="p"
                    sx={{
                      fontStyle: 'italic',
                      textAlign: 'center',
                      color: theme.palette.text.secondary, // Original color
                      mb: 3,
                      lineHeight: 1.7,
                    }}
                  >
                    {testimonial.quote}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ textAlign: 'center', fontWeight: 'medium', color: theme.palette.text.primary, mb: 2 }}>
                    — {testimonial.author}, <Typography component="span" variant="body2" color="text.secondary">{testimonial.role}</Typography>
                  </Typography>
                </Box>
              ))}
            </Slider>
          </motion.div>
        </Container>
      </Box>

      {/* 6. Planes (Teaser) */}
      <Box component={motion.section} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={staggerContainer} sx={{ py: { xs: 6, md: 10 }, bgcolor: theme.palette.background.paper }}> {/* Fondo paper */}
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <motion.div variants={fadeIn}>
            <Sparkle size={48} color={theme.palette.primary.main} weight="fill" style={{ marginBottom: theme.spacing(2) }} /> {/* Dorado */}
            <Typography variant="h2" component="h2" sx={{ fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' }, fontWeight: 'bold', mb: 1, color: theme.palette.text.primary }}>
              Potenciá Tu Perfil
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}>
              ¿Querés destacar entre la multitud y acceder a funciones exclusivas? Nuestros planes premium están diseñados para vos.
            </Typography>
            <Button
              component={Link}
              href="/plans"
              variant="contained"
              color="primary" // Usar color="primary"
              size="large"
              endIcon={<Sparkle size={20} />}
              sx={{
                // bgcolor y color ya vienen de color="primary" y contrastText
                fontWeight: 'bold',
                py: 1.5,
                px: 5,
                fontSize: '1.1rem',
                // Hover ya manejado por el MuiButton override
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}` // Sombra dorada más sutil
              }}
            >
              Descubrir Planes
            </Button>
          </motion.div>
        </Container>
      </Box>

      {/* 7. CTA Final */}
      <Box
        component={motion.section}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
        sx={{
          py: { xs: 8, md: 12 },
          bgcolor: alpha(theme.palette.primary.main, 0.7),
          backdropFilter: 'blur(10px)',
          color: theme.palette.primary.contrastText,
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <motion.div variants={fadeIn}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 'bold',
                mb: 2,
                color: 'inherit',
                textShadow: '0px 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              Unite a la Red Musical de Argentina
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                color: 'inherit',
                opacity: 0.85,
                maxWidth: '600px',
                mx: 'auto',
                textShadow: '0px 1px 3px rgba(0,0,0,0.4)',
              }}
            >
              Creá tu perfil, mostrá tu talento, encontrá músicos o simplemente conectá con la comunidad. ¡El próximo gran paso en tu carrera musical empieza acá!
            </Typography>
            <Button
              component={Link}
              href="/register"
              variant="contained"
              size="large"
              sx={{
                bgcolor: theme.palette.background.paper,
                color: theme.palette.primary.main, // Texto dorado
                fontWeight: 'bold',
                py: 1.5,
                px: 6,
                fontSize: '1.2rem',
                '&:hover': {
                  bgcolor: theme.palette.background.default, // Fondo más oscuro al hacer hover
                  transform: 'scale(1.05)',
                },
                transition: 'transform 0.2s ease-in-out',
                boxShadow: `0 6px 25px rgba(0,0,0,0.2)` // Sombra más genérica
              }}
            >
              Crear Mi Cuenta Gratis
            </Button>
          </motion.div>
        </Container>
      </Box>

      {/* 8. Footer */}
      <Box component="footer" sx={{ py: 5, bgcolor: theme.palette.background.paper, borderTop: `1px solid ${theme.palette.divider}` }}> {/* Fondo paper */}
        <Container maxWidth="lg">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={fadeIn}>
            <Typography variant="body2" color="text.secondary" align="center">
              &copy; {new Date().getFullYear()} redmusical.ar. Todos los derechos reservados.
            </Typography>
            <Stack direction="row" justifyContent="center" spacing={2} mt={1}>
              <MuiLink component={Link} href="/terminos" variant="body2" color="text.secondary" sx={{ '&:hover': { color: theme.palette.primary.main }}}>
                Términos y Condiciones
              </MuiLink>
              <MuiLink component={Link} href="/privacidad" variant="body2" color="text.secondary" sx={{ '&:hover': { color: theme.palette.primary.main }}}>
                Política de Privacidad
              </MuiLink>
            </Stack>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
}
