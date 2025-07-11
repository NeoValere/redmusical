'use client';

import { Suspense, useEffect, useState, ReactNode } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Sidebar from './components/Sidebar';
import SidebarToggle from './components/SidebarToggle';
import { Box, CircularProgress, Typography, useMediaQuery, useTheme } from '@mui/material';
import { darkenColor } from '../../utils';
import MobileNavigationBar from './components/MobileNavigationBar';
import { DashboardContext } from './context/DashboardContext';
import { Musician } from '@prisma/client'; // Import Musician type

const fetcher = (url: string) => fetch(url).then(res => res.json());

function DashboardClientLayout({ children }: { children: ReactNode }) {
  const { mutate } = useSWRConfig();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [hasContractorProfile, setHasContractorProfile] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [musicianProfile, setMusicianProfile] = useState<Musician | null>(null); // Use Musician type
  const [userFullName, setUserFullName] = useState<string | null>(null); // Added userFullName state
  const [userEmail, setUserEmail] = useState<string | null>(null);    // Added userEmail state
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const supabase = createClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isSidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [activeView, setActiveView] = useState<string>('mi-perfil');
  const [pageTitle, setPageTitle] = useState<string>('Inicio');

  const { data: sessionData } = useSWR('/api/auth/session', fetcher);
  const user = sessionData?.user;

  const { data: profileData, error: profileError } = useSWR(user ? `/api/register-profile?userId=${user.id}` : null, fetcher);


  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleDrawerToggle = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    if (user) {
      setUserId(user.id);
      const derivedUserFullName = user.user_metadata.full_name || user.email?.split('@')[0] || 'Usuario';
      const derivedUserEmail = user.email || '';
      setUserFullName(derivedUserFullName);
      setUserEmail(derivedUserEmail);
    }

    if (profileData) {
      const musicianExists = !!profileData.musicianProfile;
      const contractorExists = !!profileData.contractorProfile;

      setMusicianProfile(profileData.musicianProfile || null);
      setHasContractorProfile(contractorExists);

      let determinedRole: string | null = null;
      if (musicianExists && contractorExists) {
        determinedRole = 'both';
      } else if (musicianExists) {
        determinedRole = 'musician';
      } else if (contractorExists) {
        determinedRole = 'contractor';
      }
      setUserRole(determinedRole);

      const roleFromUrl = searchParams.get('role');
      const roleFromStorage = localStorage.getItem('activeRole');
      let newActiveRole: string | null = null;

      if (roleFromUrl) {
        newActiveRole = roleFromUrl;
      } else if (roleFromStorage) {
        newActiveRole = roleFromStorage;
      } else if (determinedRole === 'both') {
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/dashboard/search') || currentPath.startsWith('/dashboard/musicos') || currentPath.startsWith('/dashboard/favorites')) {
          newActiveRole = 'contractor';
        } else {
          newActiveRole = 'musician';
        }
      } else {
        newActiveRole = determinedRole;
      }
      
      setActiveRole(newActiveRole);
      if (newActiveRole) {
        localStorage.setItem('activeRole', newActiveRole);
      }
    }

    if (profileError) {
      console.error('Error checking user profiles and roles:', profileError);
    }
  }, [user, profileData, profileError]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleSwitchRole = async () => {
    const newRole = activeRole === 'musician' ? 'contractor' : 'musician';
    localStorage.setItem('activeRole', newRole);
    setActiveRole(newRole);
    mutate(`/api/register-profile?userId=${userId}`);
    
    const currentPath = pathname.split('?')[0];
    const newPath = `${currentPath}?role=${newRole}`;
    router.push(newPath);
    router.refresh();
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
        mutate(`/api/register-profile?userId=${userId}`);
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

  if (!profileData && !profileError) {
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
      <SidebarToggle
        handleDrawerToggle={handleDrawerToggle}
        isSidebarOpen={isSidebarOpen}
        isMobile={isMobile}
      />
      {!isMobile && (
        <Sidebar
          userRole={userRole}
          activeRole={activeRole}
          hasContractorProfile={hasContractorProfile}
          handleLogout={handleLogout}
          open={isSidebarOpen}
          onClose={handleDrawerToggle}
          isMobile={false}
          drawerWidth={drawerWidth}
          miniDrawerWidth={miniDrawerWidth}
          activeView={activeView}
          setActiveView={setActiveView}
          handleSwitchRole={handleSwitchRole}
          handleCreateContractorProfile={handleCreateContractorProfile}
          musicianProfile={musicianProfile}
        />
      )}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          minWidth: 0,
          paddingBottom: isMobile ? '0px' : 0,
        }}
      >
        <DashboardContext.Provider value={{ activeView, setActiveView, pageTitle, setPageTitle, userId, musicianProfile, userFullName, userEmail }}>
          {children}
        </DashboardContext.Provider>
      </Box>
      {isMobile && (
        <MobileNavigationBar activeView={activeView} setActiveView={setActiveView} activeRole={activeRole} musicianProfile={musicianProfile} />
      )}
    </Box>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando...</Typography>
      </Box>
    }>
      <DashboardClientLayout>{children}</DashboardClientLayout>
    </Suspense>
  );
}
