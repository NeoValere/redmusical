'use client';

import { useTheme, Box, Typography, Grid, Card, CardContent, Button, alpha } from '@mui/material';
import { Favorite, Message, Search as SearchIcon } from '@mui/icons-material';
import Link from 'next/link';
import { useDashboard } from '../../context/DashboardContext';
import { useEffect } from 'react';

export default function Search() {
  const theme = useTheme();
  const { setPageTitle } = useDashboard();

  useEffect(() => {
    setPageTitle('Inicio');
  }, [setPageTitle]);

  return (
    <Box
      component="section"
      id="inicio-section"
      sx={{
        mb: 4,
        p: { xs: 2, sm: 3 },
        backgroundColor: alpha(theme.palette.background.paper, 0.7),
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: 2,
        boxShadow: theme.shadows[2],
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Grid container spacing={3} sx={{ my: 4 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card>
            <CardContent>
              <Favorite sx={{ fontSize: 40, color: 'primary.main' }} />
              <Typography variant="h5">0</Typography>
              <Typography color="textSecondary">Músicos Favoritos</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Card>
            <CardContent>
              <Message sx={{ fontSize: 40, color: 'secondary.main' }} />
              <Typography variant="h5">0</Typography>
              <Typography color="textSecondary">Mensajes Enviados</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

    
    </Box>
  );
}
