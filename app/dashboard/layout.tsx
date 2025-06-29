'use client';

import { Suspense, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Sidebar from './components/Sidebar';
import SidebarToggle from './components/SidebarToggle';
import Header from './components/Header';
import { Box, CircularProgress, Typography, useMediaQuery, useTheme } from '@mui/material';
import { darkenColor } from '../../utils';
import MobileNavigationBar from './components/MobileNavigationBar';
import { DashboardContext } from './context/DashboardContext';
import { Musician } from '@prisma/client'; // Import Musician type

function DashboardClientLayout({ children }: { children: ReactNode }) {
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

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    // Contractor routes
    if (pathname === '/dashboard/search') {
      setActiveView('inicio');
    } else if (pathname === '/dashboard/musicos') {
      setActiveView('explorar');
    } else if (pathname === '/dashboard/favorites') {
      setActiveView('favoritos');
    } else if (pathname === '/dashboard/messages') {
      setActiveView('mensajes');
    }
    // Musician routes (and default)
    else {
      const view = searchParams.get('view');
      if (view) {
        setActiveView(view);
      } else {
        setActiveView('mi-perfil');
      }
    }
  }, [pathname, searchParams]);

  const handleDrawerToggle = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // Effect to fetch user and profile data once on mount
  useEffect(() => {
    const fetchUserAndProfiles = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUserId(user.id);
      const derivedUserFullName = user.user_metadata.full_name || user.email?.split('@')[0] || 'Usuario';
      const derivedUserEmail = user.email || '';

      setUserFullName(derivedUserFullName);
      setUserEmail(derivedUserEmail);

      try {
        const profileRes = await fetch(`/api/register-profile?userId=${user.id}`);
        const profileData = await profileRes.json();

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
        setUserRole(determinedRole); // Set the overall user role based on existing profiles

        // Determine active role immediately after userRole is set, considering the current path
        const currentPath = window.location.pathname;
        let newActiveRole: string | null = null;

        if (determinedRole === 'both') {
          if (currentPath.startsWith('/dashboard/search') || currentPath.startsWith('/dashboard/musicos') || currentPath.startsWith('/dashboard/favorites') || currentPath.startsWith('/dashboard/messages')) {
            newActiveRole = 'contractor';
          } else {
            newActiveRole = 'musician';
          }
        } else if (determinedRole === 'musician') {
          newActiveRole = 'musician';
        } else if (determinedRole === 'contractor') {
          // If user only has contractor profile, but is on the musician dashboard path,
          // we still want to show the musician menu to allow profile creation.
          if (currentPath === '/dashboard' && !musicianExists) {
            newActiveRole = 'musician';
          } else {
            newActiveRole = 'contractor';
          }
        } else if (!musicianExists && !contractorExists) {
          // If no profiles exist, default to musician view to prompt creation
          newActiveRole = 'musician';
        }
        setActiveRole(newActiveRole); // Set the active role state immediately
        localStorage.setItem('activeRole', newActiveRole || ''); // Store in local storage

      } catch (error) {
        console.error('Error checking user profiles and roles:', error);
      }
    };
    fetchUserAndProfiles();
  }, [pathname, router, supabase]); // Dependencies: pathname, router, supabase

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
      setActiveView('inicio');
      router.push('/dashboard/search');
    } else {
      setActiveView('mi-perfil');
      router.push('/dashboard');
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

  // Wait until userId, userRole, and musicianProfile (if applicable) are determined
  if (!userId || userRole === null || userFullName === null || userEmail === null || (userRole !== 'contractor' && musicianProfile === null)) {
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
        <DashboardContext.Provider value={{ activeView, setActiveView, pageTitle, setPageTitle, userId, musicianProfile, userFullName, userEmail }}>
          <Header
            handleDrawerToggle={handleDrawerToggle}
            isMobile={isMobile}
            isSidebarOpen={isSidebarOpen}
            handleLogout={handleLogout}
            userRole={userRole}
            hasContractorProfile={hasContractorProfile}
            handleSwitchRole={handleSwitchRole}
            handleCreateContractorProfile={handleCreateContractorProfile}
          />
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
