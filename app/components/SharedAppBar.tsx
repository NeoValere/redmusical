"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { Box, AppBar, Toolbar, Typography, Button, Link as MuiLink, Stack, useTheme, alpha, Menu, MenuItem, IconButton, Divider } from '@mui/material';
import { MusicNotesSimple, SignIn, UserPlus, SignOut, UserCircle, Buildings, List as ListIcon } from 'phosphor-react';

const SharedAppBar = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<{ isMusician: boolean; isContractor: boolean; userId: string | null }>({ isMusician: false, isContractor: false, userId: null });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();
  const supabase = createClient();
  const theme = useTheme();

  useEffect(() => {
    const checkUserAndRoles = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user ?? null);

      if (session && session.user) {
        try {
          const response = await fetch('/api/user/profile-details');
          if (response.ok) {
            const rolesData = await response.json();
            setUserRoles({
              isMusician: rolesData.isMusician,
              isContractor: rolesData.isContractor,
              userId: rolesData.userId,
            });
          } else {
            console.error('Failed to fetch user roles:', response.status);
            setUserRoles({ isMusician: false, isContractor: false, userId: session.user.id });
          }
        } catch (error: unknown) {
          console.error('Error fetching user roles:', error instanceof Error ? error.message : 'An unknown error occurred');
          setUserRoles({ isMusician: false, isContractor: false, userId: session.user.id });
        }
      } else {
        setUserRoles({ isMusician: false, isContractor: false, userId: null });
      }
    };

    checkUserAndRoles();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
      if (!session) {
        setUserRoles({ isMusician: false, isContractor: false, userId: null });
      } else {
        checkUserAndRoles();
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setUserRoles({ isMusician: false, isContractor: false, userId: null });
    router.push('/');
    router.refresh();
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: alpha(theme.palette.background.paper, 0.7),
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`
      }}
    >
      <Toolbar
        sx={{
          maxWidth: '1300px',
          width: '100%',
          mx: 'auto',
          px: { xs: 2, sm: 3 },
          justifyContent: 'space-between',
          backgroundColor: 'transparent',
          color: theme.palette.secondary.contrastText
        }}
      >
        <MuiLink component={Link} href="/" color="inherit" underline="none" sx={{ display: 'flex', alignItems: 'center' }}>
          <MusicNotesSimple size={32} color={theme.palette.primary.main} weight="fill" style={{ marginRight: 3 }} />
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: 'inherit' }}>
            redmusical.ar
          </Typography>
        </MuiLink>
        {!currentUser ? (
          <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', sm: 'flex' } }}>
            <Button
              component={Link}
              href="/login"
              variant="outlined"
              startIcon={<SignIn size={20} />}
              sx={{
                color: 'inherit',
                borderColor: 'inherit',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              Ingresar
            </Button>
            <Button
              component={Link}
              href="/register"
              variant="contained"
              color="primary"
              startIcon={<UserPlus size={20} />}
              disableElevation
            >
              Registrarme
            </Button>
          </Stack>
        ) : (
          <>
            <IconButton
              onClick={handleMenuClick}
              size="large"
              sx={{
                color: 'inherit',
              }}
            >
              <ListIcon size={24} />
            </IconButton>
            <Menu
              id="profile-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              MenuListProps={{
                'aria-labelledby': 'profile-button',
              }}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              {userRoles.isMusician && (
                <MenuItem component={Link} href={`/dashboard`} onClick={handleMenuClose} sx={{ paddingY: 1.5, paddingX: 2.5 }}>
                  <UserCircle size={20} style={{ marginRight: theme.spacing(1.5), color: theme.palette.primary.main }} />
                  Panel de Músico
                </MenuItem>
              )}
              {userRoles.isContractor && (
                <MenuItem component={Link} href="/dashboard/search" onClick={handleMenuClose} sx={{ paddingY: 1.5, paddingX: 2.5 }}>
                  <Buildings size={20} style={{ marginRight: theme.spacing(1.5), color: theme.palette.primary.main }} />
                  Panel de Búsqueda
                </MenuItem>
              )}
              {(userRoles.isMusician || userRoles.isContractor) && <Divider />}
              <MenuItem onClick={handleLogout} sx={{ paddingY: 1.5, paddingX: 2.5 }}>
                <SignOut size={20} style={{ marginRight: theme.spacing(1.5), color: theme.palette.error.main }} />
                Cerrar Sesión
              </MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default SharedAppBar;
