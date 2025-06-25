'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation'; // Added usePathname
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
  Button,
  Link as MuiLink,
  useTheme,
  Drawer,
  Toolbar,
} from '@mui/material';
import { ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon } from '@mui/icons-material';

interface SidebarProps {
  userRole: string | null;
  activeRole: string | null;
  userId: string | null;
  hasContractorProfile: boolean;
  handleLogout: () => void;
  supabase: SupabaseClient<Database>;
  open: boolean;
  onClose: () => void;
  isMobile: boolean;
  drawerWidth: number;
  miniDrawerWidth: number;
  activeView: string;
  setActiveView: (view: string) => void;
  handleSwitchRole: () => Promise<void>;
  handleCreateContractorProfile: () => Promise<void>;
}

export default function Sidebar({
  userRole,
  activeRole,
  userId,
  hasContractorProfile,
  handleLogout,
  supabase,
  open,
  onClose,
  isMobile,
  drawerWidth,
  miniDrawerWidth,
  activeView,
  setActiveView,
  handleSwitchRole,
  handleCreateContractorProfile,
}: SidebarProps) {
  const router = useRouter();
  const theme = useTheme();
  const pathname = usePathname();

  const musicianNavItems = [
    { id: 'mi-perfil', text: 'Mi perfil', icon: <User size={24} />, href: '/dashboard' },
    { id: 'edicion-perfil', text: 'Edición de perfil', icon: <MusicNotesSimple size={24} />, href: `/m/${userId}/edit` },
    { id: 'estadisticas', text: 'Estadísticas', icon: <ChartBar size={24} />, href: '/dashboard?view=estadisticas' },
    { id: 'visibilidad', text: 'Visibilidad', icon: <Eye size={24} />, href: '/dashboard?view=visibilidad' },
    { id: 'mi-plan', text: 'Mi Plan', icon: <CreditCard size={24} />, href: '/dashboard?view=mi-plan' },
  ];

  const contractorNavItems = [
    { id: 'inicio', text: 'Inicio', icon: <User size={24} />, href: '/dashboard/search' },
    { id: 'explorar-musicos', text: 'Explorar Músicos', icon: <MagnifyingGlass size={24} />, href: '/dashboard/search' },
    { id: 'favoritos', text: 'Mis Favoritos', icon: <CreditCard size={24} />, href: '/dashboard/favorites' },
    { id: 'mensajes', text: 'Mensajes', icon: <Eye size={24} />, href: '/dashboard/messages' },
  ];

  const navItems = activeRole === 'contractor' ? contractorNavItems : musicianNavItems;

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
            opacity: open ? 1 : 0,
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
      </Toolbar>
      {!open && !isMobile && (
         <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 2 }}>
             <MusicNotesSimple size={32} color={theme.palette.primary.main} weight="fill" />
         </Box>
      )}

      <List component="nav" sx={{ flexGrow: 1, px: open ? 1 : 0.5 }}>
        {navItems.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ display: 'block' }}>
            <ListItemButton
              component={Link}
              href={item.href}
              onClick={() => {
                setActiveView(item.id);
                if (isMobile) {
                  onClose();
                }
              }}
              selected={activeView === item.id}
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

        {userRole === 'both' && (
          <ListItem disablePadding sx={{ display: 'block', mt: 1 }}>
            <ListItemButton
              onClick={() => {
                handleSwitchRole();
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
                <Headphones size={24} />
              </ListItemIcon>
              <ListItemText 
                primary={activeRole === 'contractor' ? "Panel de músico" : "Panel de búsqueda"} 
                sx={{ opacity: open ? 1 : 0, color: 'text.primary' }} 
              />
            </ListItemButton>
          </ListItem>
        )}
        
        {!hasContractorProfile && userRole === 'musician' && (
          <ListItem disablePadding sx={{ display: 'block', mt: 1 }}>
            <ListItemButton
              onClick={() => {
                handleCreateContractorProfile();
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
                <PlusCircle size={24} />
              </ListItemIcon>
              <ListItemText 
                primary="Activar modo búsqueda" 
                sx={{ opacity: open ? 1 : 0, color: 'text.primary' }} 
              />
            </ListItemButton>
          </ListItem>
        )}
      </List>

      <Box sx={{ mt: 'auto', p: open ? 2 : 1 }}>
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
          bgcolor: 'background.paper', // Use theme background
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
