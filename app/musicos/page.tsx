"use client";

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, // Standard Grid import for v6/v7
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Chip, 
  Stack, 
  TextField, 
  CircularProgress,
  Pagination,
  Modal,
  Paper,
  Link as MuiLink,
  AppBar,
  Toolbar,
  useTheme,
  alpha,
  InputAdornment
} from '@mui/material';
import { MusicNotesSimple, SignIn, UserPlus, MagnifyingGlass, MapPin, MusicNote, Star } from 'phosphor-react';

interface Musician {
  id: string;
  userId: string;
  fullName: string; // Keep fullName
  artisticName?: string; // Added artisticName
  city: string;
  instruments: { instrument: { name: string } }[];
  profileImageUrl?: string;
  experienceLevel?: string;
  genres?: { genre: { name: string } }[];
}

const PublicPageHeader = () => {
  const theme = useTheme();
  const supabase = createClientComponentClient();
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
  }, [supabase]);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{ 
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper, 
      }}
    >
      <Toolbar sx={{ 
        maxWidth: '1300px', 
        width: '100%', 
        mx: 'auto', 
        px: { xs: 2, sm: 3 }, 
        justifyContent: 'space-between',
        backgroundColor: theme.palette.background.paper,
      }}>
        <MuiLink component={Link} href="/" color="inherit" underline="none" sx={{ display: 'flex', alignItems: 'center' }}>
          <MusicNotesSimple size={32} color={theme.palette.primary.main} weight="fill" style={{ marginRight: 3 }} />
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
            redmusical.ar
          </Typography>
        </MuiLink>
        <Stack direction="row" spacing={1}>
          {!currentUser ? (
            <>
              <Button component={Link} href="/login" variant="outlined" startIcon={<SignIn />}>Ingresar</Button>
              <Button component={Link} href="/register" variant="contained" color="primary" startIcon={<UserPlus />}>Registrarse</Button>
            </>
          ) : (
            <Button component={Link} href="/dashboard" variant="outlined">Mi Panel</Button>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

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
        {/* Contact button removed */}
      </Card>
    </Link>
  );
};

export default function MusicosPage() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  const [musicians, setMusicians] = useState<Musician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Initialize state from URL search parameters
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('q') || '');
 // const [experienceFilter, setExperienceFilter] = useState(() => searchParams.get('experience') || '');
  const [page, setPage] = useState(() => parseInt(searchParams.get('pageNumber') || '1', 10));
  const [tipoFilter, setTipoFilter] = useState<string | null>(searchParams.get('tipo') || null);

  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  // Effect to update URL when search params change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
  //  if (experienceFilter) params.set('experience', experienceFilter);
    if (tipoFilter) params.set('tipo', tipoFilter);
    if (page > 1) params.set('pageNumber', page.toString());

    // Only push if params changed to avoid potential loops if router.replace itself triggers re-render
    if (params.toString() !== searchParams.toString().split('&').filter(p => p.startsWith('q=') || p.startsWith('experience=') || p.startsWith('musicianOrBand=') || p.startsWith('pageNumber=')).join('&')) {
      router.replace(`/musicos?${params.toString()}`, { scroll: false });
    }
  }, [searchTerm, tipoFilter, page, router, searchParams]);


  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);
      setSessionChecked(true);
    };
    checkSession();
  }, [supabase]);

  useEffect(() => {
    const fetchMusicians = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams();
        if (searchTerm) query.append('q', searchTerm);
      //  if (experienceFilter) query.append('experience', experienceFilter);
        if (tipoFilter) query.append('tipo', tipoFilter);
        query.append('page', page.toString());
        query.append('limit', itemsPerPage.toString());

        const response = await fetch(`/api/public/m?${query.toString()}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        setMusicians(data.musicians);
        setTotalPages(data.totalPages);

      } catch (e: any) {
        setError('Error al cargar los músicos. Intente nuevamente.');
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionChecked) {
      fetchMusicians();
    }
  }, [searchTerm, page, tipoFilter, sessionChecked, supabase, itemsPerPage]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  if (!sessionChecked) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
      <PublicPageHeader />
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" color="text.primary" sx={{ textAlign: 'center', mb:1}}>
          Explorá Músicos en Argentina
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mb: 4, maxWidth: '700px', mx:'auto' }}>
          Encontrá el talento perfecto para tu proyecto, banda o evento. Filtrá por instrumento, zona y más.
        </Typography>

        <Paper elevation={0} sx={{ p: {xs: 2, sm:3}, mb: 4, borderRadius: 2, bgcolor: theme.palette.background.paper }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 10 }}>
              <TextField
                fullWidth
                label="Buscar por nombre, instrumento, ciudad..."
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MagnifyingGlass size={22} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                select
                label="Tipo"
                variant="outlined"
                value={tipoFilter || ''}
                onChange={(e) => {
                  setTipoFilter(e.target.value === '' ? null : e.target.value);
                  setPage(1); // Reset page to 1 when filter changes
                }}
                SelectProps={{
                  native: true,
                }}
                InputLabelProps={{ shrink: true }}
              >
                <option value="">Todos</option>
                <option value="Musician">Solista</option>
                <option value="Band">Banda</option>
                <option value="Group">Grupo</option>
                <option value="Choir">Coro</option>
                <option value="Orchestra">Orquesta</option>
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Typography color="error" textAlign="center" sx={{ my: 5 }}>
            {error}
          </Typography>
        )}
        {!isLoading && !error && musicians.length === 0 && (
          <Typography textAlign="center" sx={{ my: 5 }} variant="h6" color="text.secondary">
            No se encontraron músicos con los criterios actuales. Probá con otra búsqueda.
          </Typography>
        )}

        {!isLoading && !error && musicians.length > 0 && (
          <>
            <Grid container spacing={3}>
              {musicians.map((musician) => (
                <Grid  key={musician.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <MusicianCard musician={musician} />
                </Grid>
              ))}
            </Grid>
            {totalPages > 1 && (
              <Stack alignItems="center" sx={{ mt: 5 }}>
                <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" size="large"/>
              </Stack>
            )}
          </>
        )}

        <Box sx={{ textAlign: 'center', py: {xs: 4, md: 6}, mt: 4, borderTop: `1px solid ${theme.palette.divider}`, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h5" component="p" fontWeight="bold" color="text.primary" gutterBottom>
                ¿Sos músico o banda?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{mb:2, maxWidth: '600px', mx:'auto'}}>
                Creá tu perfil profesional en minutos y conectá con oportunidades en toda Argentina. ¡Es gratis!
            </Typography>
            <Button 
                component={Link} 
                href={currentUser ? `/select-role?role=musician&userId=${currentUser.id}` : "/register?role=musician"} 
                variant="contained" 
                color="primary" 
                size="large"
                startIcon={<UserPlus />}
            >
                Crear Perfil de Músico
            </Button>
        </Box>
      </Container>

      {/* Modal for contact removed */}
    </Box>
  );
}
