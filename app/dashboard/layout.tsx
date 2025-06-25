'use client';

import { useEffect, useState, ReactNode } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BottomNavigationBar from './components/BottomNavigationBar';
import { Box, CircularProgress, Typography, useMediaQuery, useTheme } from '@mui/material';
import { darkenColor } from '../../utils';
import BottomSearchNavigationBar from './search/components/BottomSearchNavigationBar';
import { DashboardContext } from './context/DashboardContext';

interface MusicianProfile {
  id: string;
  userId: string;
  isPublic: boolean;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [hasMusicianProfile, setHasMusicianProfile] = useState(false);
  const [hasContractorProfile, setHasContractorProfile] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [musicianProfile, setMusicianProfile] = useState<MusicianProfile | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isSidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [activeView, setActiveView] = useState<string>('mi-perfil');

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    const view = searchParams.get('view');
    if (view) {
      setActiveView(view);
    } else {
      // Reset to default if no view is specified
      setActiveView('mi-perfil');
    }
  }, [searchParams]);

  const handleDrawerToggle = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const checkUserAndProfiles = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUserId(user.id);
      let currentUserName = user.user_metadata.full_name || user.email?.split('@')[0] || 'Usuario';

      let musicianExists = false;
      let contractorExists = false;

      try {
        const musicianProfileRes = await fetch(`/api/register-profile?userId=${user.id}&role=musician`);
        const musicianData = await musicianProfileRes.json();
        musicianExists = musicianData.exists;
        if (musicianData.exists) {
          setMusicianProfile(musicianData.profile as MusicianProfile);
          currentUserName = musicianData.profile.fullName || currentUserName;
        } else {
          setMusicianProfile(null);
        }
      } catch (error) {
        console.error('Error checking musician profile:', error);
      }

      try {
        const contractorProfileRes = await fetch(`/api/register-profile?userId=${user.id}&role=contractor`);
        const contractorData = await contractorProfileRes.json();
        contractorExists = contractorData.exists;
      } catch (error) {
        console.error('Error checking contractor profile:', error);
      }

      setHasMusicianProfile(musicianExists);
      setHasContractorProfile(contractorExists);
      setUserName(currentUserName);

      let determinedRole: string | null = null;
      if (musicianExists && contractorExists) {
        determinedRole = 'both';
      } else if (musicianExists) {
        determinedRole = 'musician';
      } else if (contractorExists) {
        determinedRole = 'contractor';
      }

      setUserRole(determinedRole);

      // Active role logic
      const storedActiveRole = localStorage.getItem('activeRole');
      let currentActiveRole = storedActiveRole;

      if (!storedActiveRole && determinedRole) {
        currentActiveRole = determinedRole === 'contractor' ? 'contractor' : 'musician';
        localStorage.setItem('activeRole', currentActiveRole);
      }
      
      if (determinedRole === 'musician' && currentActiveRole === 'contractor') {
        currentActiveRole = 'musician';
        localStorage.setItem('activeRole', 'musician');
      }
      
      if (determinedRole === 'contractor' && currentActiveRole === 'musician') {
        currentActiveRole = 'contractor';
        localStorage.setItem('activeRole', 'contractor');
      }

      setActiveRole(currentActiveRole);

      const currentPath = window.location.pathname;
      if (!determinedRole) {
        router.push('/select-role');
      } else if (currentActiveRole === 'contractor' && !currentPath.startsWith('/dashboard/search') && !currentPath.startsWith('/dashboard/favorites') && !currentPath.startsWith('/dashboard/messages')) {
        router.push('/dashboard/search');
      } else if (currentActiveRole === 'musician' && (currentPath.startsWith('/dashboard/search') || currentPath.startsWith('/dashboard/favorites') || currentPath.startsWith('/dashboard/messages'))) {
        router.push('/dashboard');
      }
    };
    checkUserAndProfiles();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleSwitchRole = async () => {
    const newRole = activeRole === 'musician' ? 'contractor' : 'musician';
    localStorage.setItem('activeRole', newRole);
    setActiveRole(newRole);

    if (newRole === 'contractor') {
      router.push('/dashboard/search');
    } else {
      router.push('/dashboard');
    }
    // We might not need a full refresh if state updates handle everything
    setTimeout(() => router.refresh(), 100);
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
        const { redirectUrl } = await response.json();
        router.push(redirectUrl);
        router.refresh();
      } else {
        const errorData = await response.json();
        console.error('Error creating search profile:', errorData);
        alert(`Error al activar modo búsqueda: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Network or unexpected error:', error);
      alert('Ocurrió un error al intentar activar el modo búsqueda.');
    }
  };

  if (!userId) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando...</Typography>
      </Box>
    );
  }

  const drawerWidth = 256;
  const miniDrawerWidth = 72;
  const backgroundColor = theme.palette.background.default;
  const gradient = `linear-gradient(160deg, ${darkenColor(backgroundColor, 15)} 0%, ${darkenColor(backgroundColor, 5)} 30%, ${backgroundColor} 60%, ${darkenColor(backgroundColor, -5)} 100%)`;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: gradient }}>
      {!isMobile && (
        <Sidebar
          userRole={userRole}
          activeRole={activeRole}
          userId={userId}
          hasContractorProfile={hasContractorProfile}
          handleLogout={handleLogout}
          supabase={supabase}
          open={isSidebarOpen}
          onClose={handleDrawerToggle}
          isMobile={false}
          drawerWidth={drawerWidth}
          miniDrawerWidth={miniDrawerWidth}
          activeView={activeView}
          setActiveView={setActiveView}
          handleSwitchRole={handleSwitchRole}
          handleCreateContractorProfile={handleCreateContractorProfile}
        />
      )}
      <Box
        component="main"
        sx={{
          p: { xs: 2, sm: 3, md: 4, lg: 3 },
          flexGrow: 1,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          minWidth: 0,
          overflow: 'auto',
          paddingBottom: isMobile ? '56px' : 0,
        }}
      >
        <Header
          userName={userName || 'Usuario'}
          handleDrawerToggle={handleDrawerToggle}
          isMobile={isMobile}
          isSidebarOpen={isSidebarOpen}
          handleLogout={handleLogout}
          userRole={userRole}
          activeRole={activeRole}
          userId={userId}
          hasContractorProfile={hasContractorProfile}
          handleSwitchRole={handleSwitchRole}
          handleCreateContractorProfile={handleCreateContractorProfile}
        />
        <DashboardContext.Provider value={{ activeView, setActiveView }}>
          {children}
        </DashboardContext.Provider>
      </Box>
      {isMobile && (
        activeRole === 'contractor'
          ? <BottomSearchNavigationBar activeView={activeView} setActiveView={setActiveView} /> 
          : <BottomNavigationBar activeView={activeView} setActiveView={setActiveView} musicianId={musicianProfile?.userId} />
      )}
    </Box>
  );
}
