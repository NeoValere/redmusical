'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MusicNotesSimple, User, ChartBar, Eye, CreditCard, SignOut, Headphones, PlusCircle, MagnifyingGlass } from 'phosphor-react';
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
  // Divider, // No longer explicitly used here, Drawer has its own top border
  Button,
  Link as MuiLink,
  useTheme,
  Drawer, // Import Drawer
  Toolbar, // For spacing at the top if needed, or adjust padding
  IconButton, // For a potential collapse button within the sidebar
} from '@mui/material';
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material'; // For toggle button

interface SidebarProps {
  userRole: string | null;
  userId: string | null;
  hasContractorProfile: boolean;
  handleLogout: () => void;
  supabase: SupabaseClient<Database>;
  open: boolean;
  onClose: () => void; // For mobile temporary drawer
  isMobile: boolean;
  drawerWidth: number;
  miniDrawerWidth: number;
  activeView: string; // New prop
  setActiveView: (view: string) => void; // New prop
  handleSwitchRole: () => Promise<void>; // New prop
  handleCreateContractorProfile: () => Promise<void>; // New prop
}

export default function Sidebar({
  userRole,
  userId,
  hasContractorProfile,
  handleLogout,
  supabase,
  open,
  onClose,
  isMobile,
  drawerWidth,
  miniDrawerWidth,
  activeView, // Destructure new prop
  setActiveView, // Destructure new prop
  handleSwitchRole, // Destructure new prop
  handleCreateContractorProfile, // Destructure new prop
}: SidebarProps) {
  const router = useRouter();
  const theme = useTheme();

  // handleSwitchRole and handleCreateContractorProfile moved to DashboardPage

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: open ? 'space-between' : 'center', px: open ? 2 : 1, mb: 2 }}>
        <MuiLink
          component={Link}
          href="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit',
            opacity: open ? 1 : 0, // Hide text when closed, icon remains
            transition: theme.transitions.create('opacity', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          <MusicNotesSimple size={28} color={theme.palette.primary.main} weight="fill" style={{ marginRight: open ? 3 : 0 }} />
          {open && (
            <Typography variant="h6" component="span" sx={{ fontWeight: 'bold' }}>
              redmusical.ar
            </Typography>
          )}
        </MuiLink>
        {/* Toggle button removed from here, will be in Header */}
      </Toolbar>
      {/* Centered logo when sidebar is collapsed */}
      {!open && !isMobile && (
         <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 2 }}>
             <MusicNotesSimple size={32} color={theme.palette.primary.main} weight="fill" />
         </Box>
      )}


      <List component="nav" sx={{ flexGrow: 1, px: open ? 1 : 0.5 }}>
        {[
          { id: 'mi-perfil', text: 'Mi perfil', icon: <User size={24} /> },
          { id: 'edicion-perfil', text: 'Edición de perfil', icon: <MusicNotesSimple size={24} /> },
          { id: 'estadisticas', text: 'Estadísticas', icon: <ChartBar size={24} /> },
          { id: 'visibilidad', text: 'Visibilidad', icon: <Eye size={24} /> },
          { id: 'mi-plan', text: 'Mi Plan', icon: <CreditCard size={24} /> },
        ].map((item) => (
          <ListItem key={item.id} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              // component={Link} // No longer a Link
              // href={item.href} // No longer using href for scrolling
              // scroll={true} // Not needed
              onClick={() => {
                if (item.id === 'edicion-perfil') {
                  if (userId) {
                    router.push(`/musicians/${userId}/edit`);
                  } else {
                    console.warn('Sidebar: userId no disponible para navegar a edición de perfil.');
                    // Opcionalmente, manejar este caso, ej. redirigir a login o mostrar error
                  }
                } else {
                  setActiveView(item.id);
                }
                if (isMobile) { // Close mobile drawer on selection
                  onClose();
                }
              }}
              selected={activeView === item.id} // Nota: para 'edicion-perfil', esto no lo marcará como activo basado en la URL. Se podría mejorar con usePathname si es necesario.
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                borderRadius: 1,
                mb: 0.5,
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: 'inherit',
                }}
              >
                {item.icon}
              </ListItemIcon>
          <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0, color: 'text.primary' }} />
            </ListItemButton>
          </ListItem>
        ))}

        {/* Divider or spacing before switch/create role button */}
        { (userRole === 'musician' || userRole === 'both') && (
          <ListItem disablePadding sx={{ display: 'block', mt: 1 }}>
            <ListItemButton
              onClick={() => {
                if (hasContractorProfile) {
                  handleSwitchRole();
                } else {
                  handleCreateContractorProfile();
                }
                if (isMobile) {
                  onClose();
                }
              }}
              sx={{
                minHeight: 48,
                justifyContent: open ? 'initial' : 'center',
                px: 2.5,
                borderRadius: 1,
                mb: 0.5,
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : 'auto',
                  justifyContent: 'center',
                  color: 'inherit',
                }}
              >
                <MagnifyingGlass size={24} />
              </ListItemIcon>
              <ListItemText 
                primary={hasContractorProfile ? "Ir a la búsqueda" : "Activar modo búsqueda"} 
                sx={{ opacity: open ? 1 : 0, color: 'text.primary' }} 
              />
            </ListItemButton>
          </ListItem>
        )}
      </List>

      <Box sx={{ mt: 'auto', p: open ? 2 : 1  }}>
        {/* Buttons for switch role and create profile are now handled in Header for mobile menu */}
        <Button
          onClick={handleLogout}
          fullWidth
          variant={open ? "contained" : "outlined"}
          //color="error"
          sx={{
            justifyContent: open ? 'center' : 'center',
            py: 1,
            px: open ? 1.5 : 0.5,
            minWidth: 'auto',
             color: 'white', bgcolor: '#a04040',/*  */// Handled by variant="contained" color="error"
             '&:hover': { bgcolor: '#6d2b2b' }, // Handled by theme
          }}
          startIcon={open ? <SignOut size={24} weight="fill" /> : null}
        >
          {open ? 'Cerrar sesión' : <SignOut size={24} weight="fill" />}
        </Button>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={open}
      onClose={onClose} // For temporary drawer
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        width: open ? drawerWidth : miniDrawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? drawerWidth : miniDrawerWidth,
          boxSizing: 'border-box',
          bgcolor: 'background.default', // Use theme background
          color: 'text.primary',
          borderRight: isMobile ? 'none' : `1px solid ${theme.palette.divider}`, // Keep border for desktop
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: open ? theme.transitions.duration.enteringScreen : theme.transitions.duration.leavingScreen,
          }),
          overflowX: 'hidden', // Prevent horizontal scrollbar during transition
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
