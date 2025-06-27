"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import {
  Box,
  Typography,
  Button,
  Paper,
  useTheme,
} from '@mui/material';
import { UserPlus, MagnifyingGlass } from 'phosphor-react';

const RoleBasedPrompts = () => {
  const theme = useTheme();
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        try {
          const response = await fetch('/api/user/profile-details');
          if (response.ok) {
            const rolesData = await response.json();
            const fetchedRoles = [];
            if (rolesData.isMusician) fetchedRoles.push('musician');
            if (rolesData.isContractor) fetchedRoles.push('contractor');
            setRoles(fetchedRoles);
          } else {
            console.error('Failed to fetch user roles:', response.status);
          }
        } catch (error: unknown) {
          console.error('Error fetching user roles:', error instanceof Error ? error.message : 'An unknown error occurred');
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, [supabase]);

  const hasMusicianRole = roles.includes('musician');
  const hasContractorRole = roles.includes('contractor');

  if (loading) {
    return null; // Or a loading spinner
  }

  if (!currentUser || (hasMusicianRole && hasContractorRole)) {
    return null; // User is not logged in, or has both roles, so we show nothing.
  }

  return (
    <Paper elevation={0} sx={{ 
      p: { xs: 2, sm: 3 }, 
      mt: 4, 
      borderRadius: 2, 
      bgcolor: 'transparent', 
      borderTop: `1px solid ${theme.palette.divider}` 
    }}>
      <Box
        display="grid"
        gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}
        gap={4}
        justifyContent="center"
      >
        {!hasMusicianRole && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" component="p" fontWeight="bold" color="text.primary" gutterBottom>
              ¿Sos músico o banda?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2, maxWidth: '600px', mx: 'auto' }}>
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
        )}
        {!hasContractorRole && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" component="p" fontWeight="bold" color="text.primary" gutterBottom>
              ¿Buscás músicos para tu proyecto?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2, maxWidth: '600px', mx: 'auto' }}>
              Utilizá nuestros filtros avanzados, contactá músicos por mensajería directa y guardá tus perfiles favoritos. ¡Creá tu cuenta gratis!
            </Typography>
            <Button
              component={Link}
              href={currentUser ? `/select-role?role=contractor&userId=${currentUser.id}` : "/register?role=contractor"}
              variant="contained"
              color="secondary"
              size="large"
              startIcon={<MagnifyingGlass />}
            >
              Encontrá Músicos Ahora
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default RoleBasedPrompts;
