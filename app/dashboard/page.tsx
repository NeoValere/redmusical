'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProfileStatus from './components/ProfileStatus';
import Statistics from './components/Statistics';
import VisibilitySettings from './components/VisibilitySettings';
import CurrentPlan from './components/CurrentPlan';
import BottomNavigationBar from './components/BottomNavigationBar'; // Added import
import { Box, CircularProgress, Typography, useMediaQuery, useTheme, Grid, Avatar, Paper } from '@mui/material'; // Import Grid, Avatar, Paper
import Image from 'next/image'; // For profile image

// Manually define types based on prisma/schema.prisma
interface MusicianProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  location: string | null;
  instruments: string[];
  genres: string[];
  bio: string | null;
  hourlyRate: number | null;
  availability: string[];
  youtubeUrl: string | null;
  soundcloudUrl: string | null;
  instagramUrl: string | null;
  profileImageUrl: string | null;
  isPremium: boolean;
  isFeatured: boolean;
  isPublic: boolean; // Added isPublic
  createdAt: string;
}

interface ContractorProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  location: string | null;
  isPremium: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [hasMusicianProfile, setHasMusicianProfile] = useState(false);
  const [hasContractorProfile, setHasContractorProfile] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [musicianProfile, setMusicianProfile] = useState<MusicianProfile | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // md is 900px wide
  const [isSidebarOpen, setSidebarOpen] = useState(!isMobile); // Open by default on desktop, closed on mobile
  const [activeView, setActiveView] = useState<string>('mi-perfil'); // New state for active view

  const handleVisibilityChange = (newIsPublic: boolean) => {
    setMusicianProfile(prevProfile => {
      if (prevProfile) {
        return { ...prevProfile, isPublic: newIsPublic };
      }
      return null;
    });
  };

  useEffect(() => {
    setSidebarOpen(!isMobile);
    // If mobile and sidebar closes, ensure a default view is active or behavior is as expected.
    // For now, activeView is independent of sidebar state.
  }, [isMobile]);

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

      // Determine the actual role based on Prisma profiles
      let determinedRole: string | null = null;
      if (musicianExists && contractorExists) {
        determinedRole = 'both';
      } else if (musicianExists) {
        determinedRole = 'musician';
      } else if (contractorExists) {
        determinedRole = 'contractor';
      }

      setUserRole(determinedRole); // Set the userRole state based on Prisma profiles

      // Handle redirection based on determined role and current path
      const currentPath = window.location.pathname;

      if (!determinedRole) {
        // If no profile exists, redirect to select-role
        router.push('/select-role');
      } else if (determinedRole === 'contractor' && currentPath === '/dashboard') {
        // If user is only contractor and on musician dashboard, redirect to search dashboard
        router.push('/dashboard/search');
      } else if (determinedRole === 'musician' && currentPath === '/dashboard/search') {
        // If user is only musician and on search dashboard, redirect to musician dashboard
        router.push('/dashboard');
      } else if (determinedRole === 'both' && currentPath === '/dashboard/search') {
        // If user has both roles and is on search dashboard, stay there.
        // If they are on /dashboard, they stay there.
      } else if (determinedRole === 'both' && currentPath === '/dashboard') {
        // If user has both roles and is on musician dashboard, stay there.
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

  // Only show loading if userId is null (initial load)
  if (!userId) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando dashboard...</Typography>
      </Box>
    );
  }

  // Render content based on the determined role and current path
  // If userRole is 'contractor' and currentPath is '/dashboard', it will redirect in useEffect.
  // If userRole is 'musician' or 'both', and currentPath is '/dashboard', it will render.
  // If userRole is 'contractor' or 'both', and currentPath is '/dashboard/search', it will render.
  // If no role is determined, it will redirect to /select-role in useEffect.

  // This component is specifically for the musician dashboard content.
  // If the determined role is 'contractor' and the current path is '/dashboard',
  // the useEffect will handle the redirection.
  // If the determined role is 'musician' or 'both', then this content is appropriate.
  if (userRole === 'musician' || userRole === 'both') {
    const drawerWidth = 256;
    const miniDrawerWidth = 72; // Example width for collapsed sidebar

    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(160deg, #082537 0%, #0E2E40 30%, #14364A 60%, #183B4F 100%)' }}>
        {!isMobile && (
          <Sidebar
            userRole={userRole}
            userId={userId}
            hasContractorProfile={hasContractorProfile}
            handleLogout={handleLogout}
            supabase={supabase}
            open={isSidebarOpen}
            onClose={handleDrawerToggle}
            isMobile={false} // Explicitly false as it's only rendered on non-mobile
            drawerWidth={drawerWidth}
            miniDrawerWidth={miniDrawerWidth}
            activeView={activeView}
            setActiveView={setActiveView}
            handleSwitchRole={handleSwitchRole} // Pass prop
            handleCreateContractorProfile={handleCreateContractorProfile} // Pass prop
          />
        )}
        <Box
          component="main"
          sx={{
            p: { xs: 2, sm: 3, md: 4, lg: 3 }, // Adjusted padding for lg and up
            flexGrow: 1, // Should take up remaining space
            // marginLeft removed, flexbox will position it after Sidebar
            // width is not explicitly set for desktop, flexGrow should handle it.
            // Ensure transition still applies if needed for other properties, though margin/width specific might not be needed here.
            transition: theme.transitions.create('width', { // Transition width of sidebar might affect this, or not.
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen, // Use a consistent duration
            }),
            minWidth: 0, // Important for flex items to shrink properly
            overflow: 'auto', // Add overflow auto in case content is too large
            paddingBottom: isMobile ? '56px' : 0, // Add padding for BottomNavigationBar on mobile
          }}
        >
          <Header
            userName={userName || 'Músico'}
            handleDrawerToggle={handleDrawerToggle} // For desktop sidebar toggle & mobile menu
            isMobile={isMobile}
            isSidebarOpen={isSidebarOpen}
            handleLogout={handleLogout}
            userRole={userRole}
            userId={userId}
            hasContractorProfile={hasContractorProfile}
            handleSwitchRole={handleSwitchRole}
            handleCreateContractorProfile={handleCreateContractorProfile}
          />
          {/* Conditionally render content based on activeView */}
          {activeView === 'mi-perfil' && (
            <Box
              component="section"
              id="mi-perfil-section"
              sx={{
                mb: 4,
                p: { xs: 2, sm: 3 }, // Responsive padding
                backgroundColor: 'rgba(25, 39, 52, 0.5)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)', // Safari
                borderRadius: 2,
                boxShadow: theme.shadows[2],
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <Grid container spacing={3}>
              {/*   <Grid size={{ xs: 12, md: 4 }}>
                  <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                    {musicianProfile?.profileImageUrl ? (
                      <Avatar
                        src={musicianProfile.profileImageUrl}
                        alt={musicianProfile.fullName || 'Imagen de perfil'}
                        sx={{ width: 120, height: 120, mb: 2, border: `2px solid ${theme.palette.primary.main}` }}
                      />
                    ) : (
                      <Avatar sx={{ width: 120, height: 120, mb: 2, bgcolor: 'secondary.main' }}>
                        <Typography variant="h4">{musicianProfile?.fullName ? musicianProfile.fullName.charAt(0) : 'M'}</Typography>
                      </Avatar>
                    )}
                    <Typography variant="h6" component="h2" gutterBottom align="center">
                      {musicianProfile?.fullName || 'Nombre no disponible'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ maxHeight: 100, overflowY: 'auto' }}>
                      {musicianProfile?.bio || 'Biografía no disponible.'}
                    </Typography>
                  </Paper>
                </Grid> */}
                <Grid size={{ xs: 12, md: 12 }}>
                {/*   <Paper elevation={3} sx={{ p: 2, height: '100%' }}> */}
                    <ProfileStatus
                      userId={userId}
                      profileStatus={musicianProfile ? 'Activo' : 'Incompleto'}
                      isPublic={musicianProfile?.isPublic ?? false} // Pass isPublic, default to false if not available
                    />
                    {/* Aquí podrían ir otros elementos relacionados al estado del perfil si es necesario */}
                {/*   </Paper> */}
                </Grid>
              </Grid>
            </Box>
          )}

          {/* La sección 'quick-edit' se elimina ya que el sidebar ahora redirige directamente */}

          {activeView === 'estadisticas' && (
            <Box
              component="section"
              id="estadisticas-section"
              sx={{
                mb: 4,
                p: { xs: 2, sm: 3 },
                backgroundColor: 'rgba(25, 39, 52, 0.5)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)', // Safari
                borderRadius: 2,
                boxShadow: theme.shadows[2],
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <Statistics />
            </Box>
          )}

          {activeView === 'visibilidad' && (
            <Box
              component="section"
              id="visibilidad-section"
              sx={{
                mb: 4,
                p: { xs: 2, sm: 3 },
                backgroundColor: 'rgba(25, 39, 52, 0.5)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)', // Safari
                borderRadius: 2,
                boxShadow: theme.shadows[2],
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <VisibilitySettings
                userId={userId}
                initialIsPublic={musicianProfile?.isPublic ?? false}
                onVisibilityChange={handleVisibilityChange}
              />
            </Box>
          )}

          {activeView === 'mi-plan' && (
            <Box
              component="section"
              id="mi-plan-section"
              sx={{
                mb: 4,
                p: { xs: 2, sm: 3 },
                backgroundColor: 'rgba(25, 39, 52, 0.5)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)', // Safari
                borderRadius: 2,
                boxShadow: theme.shadows[2],
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <CurrentPlan />
            </Box>
          )}
        </Box>
        {isMobile && <BottomNavigationBar activeView={activeView} setActiveView={setActiveView} musicianId={musicianProfile?.userId} />}
      </Box>
    );
  }

  // If we reach here, it means the user is a contractor (and not a musician or both)
  // and they are on the /dashboard route, or the role is still being determined.
  // The useEffect should handle the redirection to /dashboard/search.
  // If for some reason the redirection doesn't happen immediately,
  // we can show a loading state or a message.
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <CircularProgress />
      <Typography variant="h6" sx={{ ml: 2 }}>Redirigiendo<br/> al dashboard...</Typography>
    </Box>
  );
}
