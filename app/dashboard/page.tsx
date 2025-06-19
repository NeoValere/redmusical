'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProfileStatus from './components/ProfileStatus';
import QuickEdit from './components/QuickEdit';
import Statistics from './components/Statistics';
import VisibilitySettings from './components/VisibilitySettings';
import CurrentPlan from './components/CurrentPlan';
import { Box, CircularProgress, Typography } from '@mui/material'; // Import Material-UI components

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
        // If user is only contractor and on musician dashboard, redirect to contractor dashboard
        router.push('/dashboard/contractor');
      } else if (determinedRole === 'musician' && currentPath === '/dashboard/contractor') {
        // If user is only musician and on contractor dashboard, redirect to musician dashboard
        router.push('/dashboard');
      } else if (determinedRole === 'both' && currentPath === '/dashboard/contractor') {
        // If user has both roles and is on contractor dashboard, stay there.
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
  // If userRole is 'contractor' or 'both', and currentPath is '/dashboard/contractor', it will render.
  // If no role is determined, it will redirect to /select-role in useEffect.

  // This component is specifically for the musician dashboard content.
  // If the determined role is 'contractor' and the current path is '/dashboard',
  // the useEffect will handle the redirection.
  // If the determined role is 'musician' or 'both', then this content is appropriate.
  if (userRole === 'musician' || userRole === 'both') {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Sidebar
          userRole={userRole}
          userId={userId}
          hasContractorProfile={hasContractorProfile}
          handleLogout={handleLogout}
          supabase={supabase}
        />
        <Box component="main" sx={{ flexGrow: 1, ml: '256px', p: 4 }}> {/* ml-64 is 256px */}
          <Header userName={userName || 'Músico'} />

          <Box component="section" id="mi-perfil" sx={{ mb: 4 }}>
            <ProfileStatus userId={userId} profileStatus={musicianProfile ? 'Activo' : 'Incompleto'} />
          </Box>

          <Box component="section" id="quick-edit" sx={{ mb: 4 }}>
            <QuickEdit userId={userId} musicianProfile={musicianProfile} />
          </Box>

          <Box component="section" id="estadisticas" sx={{ mb: 4 }}>
            <Statistics />
          </Box>

          <Box component="section" id="visibilidad" sx={{ mb: 4 }}>
            <VisibilitySettings />
          </Box>

          <Box component="section" id="mi-plan" sx={{ mb: 4 }}>
            <CurrentPlan />
          </Box>
        </Box>
      </Box>
    );
  }

  // If we reach here, it means the user is a contractor (and not a musician or both)
  // and they are on the /dashboard route, or the role is still being determined.
  // The useEffect should handle the redirection to /dashboard/contractor.
  // If for some reason the redirection doesn't happen immediately,
  // we can show a loading state or a message.
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <CircularProgress />
      <Typography variant="h6" sx={{ ml: 2 }}>Redirigiendo al dashboard correcto...</Typography>
    </Box>
  );
}
