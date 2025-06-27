"use client";

import { Suspense, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Stack, 
  CircularProgress,
  Paper,
  Link as MuiLink,
  AppBar,
  Toolbar,
  useTheme,
  InputAdornment, // Keep InputAdornment as it's used in TextField
  TextField, // Keep TextField as it's used
  Pagination, // Keep Pagination as it's used
} from '@mui/material';
import { MusicNotesSimple, SignIn, UserPlus, MagnifyingGlass } from 'phosphor-react'; // Removed unused phosphor-react icons
import MusicianCard, { Musician } from '@/app/components/MusicianCard';
import RoleBasedPrompts from './components/RoleBasedPrompts';

const PublicPageHeader = () => {
  const theme = useTheme();
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<User | null>(null); // Changed from any
  
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

function MusicosPageContent() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [musicians, setMusicians] = useState<Musician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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

      } catch (e: unknown) { // Changed to unknown
        setError('Error al cargar los músicos. Intente nuevamente.');
        console.error(e instanceof Error ? e.message : 'An unknown error occurred'); // Added instanceof Error check
      } finally {
        setIsLoading(false);
      }
    };

    fetchMusicians();
  }, [searchTerm, page, tipoFilter, supabase, itemsPerPage]);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user ?? null);
      setSessionChecked(true);
    };
    checkSession();
  }, [supabase]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

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
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
            <Box sx={{ flexGrow: 1 }}>
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
            </Box>
            <Box sx={{ minWidth: { md: 120 } }}>
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
            </Box>
          </Box>
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
            <Box
              display="grid"
              gridTemplateColumns={{
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              }}
              gap={3}
            >
              {musicians.map((musician) => (
                <MusicianCard key={musician.id} musician={musician} />
              ))}
            </Box>
            {totalPages > 1 && (
              <Stack alignItems="center" sx={{ mt: 5 }}>
                <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" size="large"/>
              </Stack>
            )}
          </>
        )}

        <RoleBasedPrompts />
      </Container>

      {/* Modal for contact removed */}
    </Box>
  );
}

export default function MusicosPage() {
  return (
    <Suspense fallback={
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    }>
      <MusicosPageContent />
    </Suspense>
  );
}
