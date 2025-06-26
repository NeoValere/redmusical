"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, // Standard Grid import for v6/v7
  Button, 
  Stack, 
  TextField, 
  CircularProgress,
  Pagination,
  useTheme,
  InputAdornment,
  Paper, // Re-added Paper
  useMediaQuery, // Added useMediaQuery
} from '@mui/material';
import { MagnifyingGlass, UserPlus } from 'phosphor-react'; // Removed unused phosphor-react icons
import MusicianCard, { Musician } from '@/app/components/MusicianCard';

interface MusicianListProps {
  sessionChecked: boolean;
  currentUser: User | null; // Changed from any
}

const MusiciansList = ({ sessionChecked, currentUser }: MusicianListProps) => {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Defined isMobile

  const [musicians, setMusicians] = useState<Musician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    if (sessionChecked) {
      fetchMusicians();
    }
  }, [searchTerm, page, tipoFilter, sessionChecked, supabase, itemsPerPage]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 200px)' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" color="text.primary" sx={{ textAlign: 'center', mb:1}}>
          Explorá Músicos en Argentina
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mb: 4, maxWidth: '700px', mx:'auto' }}>
          Encontrá el talento perfecto para tu proyecto, banda o evento. Filtrá por instrumento, zona y más.
        </Typography>

        <Paper elevation={0} sx={{ p: {xs: 2, sm:3}, mb: 4, borderRadius: 2, bgcolor: theme.palette.background.paper }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={isMobile ? 12 : 10}>
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
            <Grid size={isMobile ? 12 : 2}>
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

export default MusiciansList;
