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
      setUserRole(user.user_metadata.role);
      setUserName(user.user_metadata.full_name || user.email?.split('@')[0] || 'Usuario');

      try {
        const musicianProfileRes = await fetch(`/api/register-profile?userId=${user.id}&role=musician`);
        const musicianData = await musicianProfileRes.json();

        if (musicianData.exists) {
          setHasMusicianProfile(true);
          setMusicianProfile(musicianData.profile as MusicianProfile);
        } else {
          setHasMusicianProfile(false);
          setMusicianProfile(null);
        }
      } catch (error) {
        console.error('Error checking musician profile:', error);
        setHasMusicianProfile(false);
        setMusicianProfile(null);
      }

      try {
        const contractorProfileRes = await fetch(`/api/register-profile?userId=${user.id}&role=contractor`);
        const contractorData = await contractorProfileRes.json();

        if (contractorData.exists) {
          setHasContractorProfile(true);
        } else {
          setHasContractorProfile(false);
        }
      } catch (error) {
        console.error('Error checking contractor profile:', error);
        setHasContractorProfile(false);
      }
    };
    checkUserAndProfiles();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (!userRole || !userId) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando dashboard...</Typography>
      </Box>
    );
  }

  if (userRole !== 'musician' && userRole !== 'both') {
    router.push('/select-role');
    return null;
  }

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

        <Box component="section" sx={{ mb: 4 }}>
          <ProfileStatus userId={userId} profileStatus={musicianProfile ? 'Activo' : 'Incompleto'} />
        </Box>

        <Box component="section" sx={{ mb: 4 }}>
          <QuickEdit userId={userId} musicianProfile={musicianProfile} />
        </Box>

        <Box component="section" sx={{ mb: 4 }}>
          <Statistics />
        </Box>

        <Box component="section" sx={{ mb: 4 }}>
          <VisibilitySettings />
        </Box>

        <Box component="section" sx={{ mb: 4 }}>
          <CurrentPlan />
        </Box>
      </Box>
    </Box>
  );
}
