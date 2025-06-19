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
  Link as MuiLink,
  useTheme, // Import useTheme
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
  const theme = useTheme(); // Use the theme hook

  const handleSwitchRole = async () => {
    if (!userId) return;
    try {
      const response = await fetch('/api/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newRole: 'contractor' }),
      });

      if (response.ok) {
        const { redirectUrl } = await response.json();
        router.push(redirectUrl);
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
        const { redirectUrl } = await response.json(); // Get redirectUrl from response
        router.push(redirectUrl);
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
        bgcolor: 'background.default', // Use default background for sidebar
        color: 'text.primary',
        py: 2,
        px: 1,
        minHeight: '100vh',
        position: 'fixed',
        display: 'flex',
        flexDirection: 'column',
        // Removed boxShadow as per image
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
        <MuiLink component={Link} href="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <MusicNotesSimple size={24} color={theme.palette.primary.main} weight="fill" style={{ marginRight: 8 }} />
          <Typography variant="h6" component="span" sx={{ fontWeight: 'bold' }}>
            redmusical.ar
          </Typography>
        </MuiLink>
      </Box>

      <List component="nav" sx={{ flexGrow: 1 }}>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="#mi-perfil" scroll={true} sx={{ borderRadius: 1, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' } }}>
            <ListItemIcon sx={{ color: 'inherit' }}>
              <User size={24} />
            </ListItemIcon>
            <ListItemText primary="Mi perfil" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="#quick-edit" scroll={true} sx={{ borderRadius: 1, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' } }}>
            <ListItemIcon sx={{ color: 'inherit' }}>
              <MusicNotesSimple size={24} /> {/* Using MusicNotesSimple for Quick Edit, can be changed if a better icon is available */}
            </ListItemIcon>
            <ListItemText primary="Edición Rápida" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="#estadisticas" scroll={true} sx={{ borderRadius: 1, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' } }}>
            <ListItemIcon sx={{ color: 'inherit' }}>
              <ChartBar size={24} />
            </ListItemIcon>
            <ListItemText primary="Estadísticas" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="#visibilidad" scroll={true} sx={{ borderRadius: 1, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' } }}>
            <ListItemIcon sx={{ color: 'inherit' }}>
              <Eye size={24} />
            </ListItemIcon>
            <ListItemText primary="Visibilidad" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} href="#mi-plan" scroll={true} sx={{ borderRadius: 1, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' } }}>
            <ListItemIcon sx={{ color: 'inherit' }}>
              <CreditCard size={24} />
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
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' },
              }}
          startIcon={<Headphones size={24} color={theme.palette.text.primary} weight="fill" />}
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
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' },
              }}
          startIcon={<PlusCircle size={24} color={theme.palette.text.primary} weight="fill" />}
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
          startIcon={<SignOut size={24} color="white" weight="fill" />}
        >
          Cerrar sesión
        </Button>
      </Box>
    </Box>
  );
}
