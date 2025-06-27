"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { Box, AppBar, Toolbar, Typography, Button, Link as MuiLink, Stack, useTheme, alpha } from '@mui/material';
import { MusicNotesSimple, SignIn, UserPlus, SignOut } from 'phosphor-react';

const SharedAppBar = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const theme = useTheme();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user ?? null);
    };

    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    router.refresh();
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
          <Button
            onClick={handleLogout}
            variant="outlined"
            sx={{
              color: 'inherit',
              borderColor: 'inherit',
              minWidth: 'auto',
              px: 1.5,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            <SignOut size={20} />
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default SharedAppBar;
