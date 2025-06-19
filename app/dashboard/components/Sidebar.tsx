'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MusicNotesSimple, User, ChartBar, Eye, CreditCard, SignOut, Headphones, PlusCircle } from 'phosphor-react';
import Image from 'next/image';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Button,
  SvgIcon,
  Link as MuiLink,
} from '@mui/material';

interface SidebarProps {
  userRole: string | null;
  userId: string | null;
  hasContractorProfile: boolean;
  handleLogout: () => void;
  supabase: SupabaseClient<Database>;
}

export default function Sidebar({ userRole, userId, hasContractorProfile, handleLogout, supabase }: SidebarProps) {
  const router = useRouter();

  const handleSwitchRole = async () => {
    if (!userId) return;
    try {
      const response = await fetch('/api/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newRole: 'contractor' }),
      });

      if (response.ok) {
        await supabase.auth.updateUser({ data: { role: 'contractor' } });
        router.push('/dashboard');
        router.refresh();
      } else {
        const errorData = await response.json();
        console.error('Error switching role:', errorData);
        alert(`Error al cambiar de rol: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Network or unexpected error during role switch:', error);
      alert('Ocurrió un error al intentar cambiar de rol.');
    }
  };

  const handleCreateContractorProfile = async () => {
    if (!userId) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) return;

      const response = await fetch('/api/register-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          fullName: user.user_metadata.full_name || user.email.split('@')[0],
          email: user.email,
          role: 'contractor',
        }),
      });

      if (response.ok) {
        await supabase.auth.updateUser({ data: { role: 'both' } });
        router.push('/dashboard');
        router.refresh();
      } else {
        const errorData = await response.json();
        console.error('Error creating contractor profile:', errorData);
        alert(`Error al crear perfil de contratante: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Network or unexpected error:', error);
      alert('Ocurrió un error al intentar crear el perfil de contratante.');
    }
  };

  return (
    <Box
      component="aside"
      sx={{
        width: 256, // w-64 is 256px
        flexShrink: 0,
        bgcolor: 'background.paper', // Using paper background for sidebar
        color: 'text.primary',
        py: 2,
        px: 1,
        minHeight: '100vh',
        position: 'fixed',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 2, // Subtle shadow
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
        <MuiLink component={Link} href="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <MusicNotesSimple size={24} color="var(--mui-palette-primary-main)" style={{ marginRight: 8 }} />
          <Typography variant="h6" component="span" sx={{ fontWeight: 'bold' }}>
            redmusical.ar
          </Typography>
        </MuiLink>
      </Box>

      <List component="nav" sx={{ flexGrow: 1 }}>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="#mi-perfil" sx={{ borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}>
            <ListItemIcon>
              <User size={24} color="var(--mui-palette-text-secondary)" />
            </ListItemIcon>
            <ListItemText primary="Mi perfil" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="#estadisticas" sx={{ borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}>
            <ListItemIcon>
              <ChartBar size={24} color="var(--mui-palette-text-secondary)" />
            </ListItemIcon>
            <ListItemText primary="Estadísticas" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="#visibilidad" sx={{ borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}>
            <ListItemIcon>
              <Eye size={24} color="var(--mui-palette-text-secondary)" />
            </ListItemIcon>
            <ListItemText primary="Visibilidad" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="#mi-plan" sx={{ borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}>
            <ListItemIcon>
              <CreditCard size={24} color="var(--mui-palette-text-secondary)" />
            </ListItemIcon>
            <ListItemText primary="Mi Plan" />
          </ListItemButton>
        </ListItem>
      </List>

      <Box sx={{ mt: 'auto', pt: 2, borderTop: 1, borderColor: 'divider' }}>
        {userRole === 'musician' || userRole === 'both' ? (
          hasContractorProfile ? (
            <Button
              onClick={handleSwitchRole}
              fullWidth
              sx={{
                justifyContent: 'flex-start',
                mb: 1,
                py: 1,
                px: 1.5,
                color: 'text.primary',
                '&:hover': { bgcolor: 'action.hover' },
              }}
          startIcon={<Headphones size={24} color="var(--mui-palette-text-primary)" />}
            >
              Cambiar a Contratante
            </Button>
          ) : (
            <Button
              onClick={handleCreateContractorProfile}
              fullWidth
              sx={{
                justifyContent: 'flex-start',
                mb: 1,
                py: 1,
                px: 1.5,
                color: 'text.primary',
                '&:hover': { bgcolor: 'action.hover' },
              }}
          startIcon={<PlusCircle size={24} color="var(--mui-palette-text-primary)" />}
            >
              Crear perfil Contratante
            </Button>
          )
        ) : null}
        <Button
          onClick={handleLogout}
          fullWidth
          sx={{
            justifyContent: 'flex-start',
            bgcolor: 'error.main',
            color: 'white',
            '&:hover': { bgcolor: 'error.dark' },
            py: 1,
            px: 1.5,
          }}
          startIcon={<SignOut size={24} color="white" />}
        >
          Cerrar sesión
        </Button>
      </Box>
    </Box>
  );
}
