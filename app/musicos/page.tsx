"use client";

import { Suspense, useEffect, useState } from 'react';
import useSWR from 'swr';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Box, 
  Container, 
  Typography, 
  Stack, 
  CircularProgress,
  Paper,
  useTheme,
  InputAdornment,
  TextField,
  Pagination,
} from '@mui/material';
import { MagnifyingGlass } from 'phosphor-react';
import MusicianCard, { Musician } from '@/app/components/MusicianCard';
import RoleBasedPrompts from './components/RoleBasedPrompts';
import SharedAppBar from '@/app/components/SharedAppBar';
import GlobalBackground from '@/app/components/GlobalBackground';

interface ApiResponse {
  musicians: Musician[];
  totalPages: number;
}

const fetcher = (url: string): Promise<ApiResponse> => fetch(url).then(res => {
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
});

function MusicosPageContent() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  // Initialize state from URL search parameters
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('q') || '');
  const [page, setPage] = useState(() => parseInt(searchParams.get('pageNumber') || '1', 10));
  const [tipoFilter, setTipoFilter] = useState<string | null>(searchParams.get('tipo') || null);

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

  const query = new URLSearchParams();
  if (searchTerm) query.append('q', searchTerm);
  if (tipoFilter) query.append('tipo', tipoFilter);
  query.append('page', page.toString());
  query.append('limit', itemsPerPage.toString());
  const { data, error, isLoading } = useSWR<ApiResponse>(
    `/api/public/m?${query.toString()}`, 
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      keepPreviousData: true,
    }
  );

  const musicians = data?.musicians || [];
  const totalPages = data?.totalPages || 1;

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
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      <GlobalBackground />
      <SharedAppBar />
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, position: 'relative', zIndex: 1 }}>
        <Typography
          variant="h1"
          component="h1"
          gutterBottom
          fontWeight="bold"
          color="text.primary"
          sx={{
            textAlign: 'center',
            mb: 1,
            fontSize: { xs: '2.2rem', sm: '3rem', md: '3.5rem' },
          }}
        >
          Explorá Músicos en Argentina
        </Typography>
        <Typography
          variant="h5"
          component="p"
          color="text.secondary"
          sx={{
            textAlign: 'center',
            mb: 4,
            maxWidth: '700px',
            mx: 'auto',
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
          }}
        >
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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
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
            Error al cargar los músicos. Intente nuevamente.
          </Typography>
        )}
        {!isLoading && !error && musicians.length === 0 && (
          <Box textAlign="center" sx={{ my: 5 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No se encontraron músicos con los criterios actuales.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Probá con otra búsqueda o utilizá la{' '}
              <Link href="/dashboard/musicos" passHref>
                <Typography component="a" color="primary" sx={{ textDecoration: 'underline' }}>
                  búsqueda avanzada
                </Typography>
              </Link>
              .
            </Typography>
          </Box>
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
