import React, { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import ProfileClientPage from './components/ProfileClientPage';
import ProfileSkeleton from './components/ProfileSkeleton';
import InvalidIdError from './components/InvalidIdError';
import PrivateProfileError from './components/PrivateProfileError';
/* import { Box, Container, Paper, Skeleton, Stack, Card, CardContent } from '@mui/material';
import { initialTheme } from '@/lib/theme/MuiTheme'; */

async function getStaticData() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  const fetchOptions = { next: { revalidate: 86400 } }; // Cache for 24 hours

  try {
    const [
      genresRes,
      instrumentsRes,
      skillsRes,
      availabilityRes,
      preferencesRes
    ] = await Promise.all([
      fetch(`${baseUrl}/api/genres`, fetchOptions),
      fetch(`${baseUrl}/api/instruments`, fetchOptions),
      fetch(`${baseUrl}/api/skills`, fetchOptions),
      fetch(`${baseUrl}/api/availability`, fetchOptions),
      fetch(`${baseUrl}/api/preferences`, fetchOptions)
    ]);

    const [genres, instruments, skills, availability, preferences] = await Promise.all([
      genresRes.ok ? genresRes.json() : [],
      instrumentsRes.ok ? instrumentsRes.json() : [],
      skillsRes.ok ? skillsRes.json() : [],
      availabilityRes.ok ? availabilityRes.json() : [],
      preferencesRes.ok ? preferencesRes.json() : [],
    ]);

    return { allGenres: genres, allInstruments: instruments, allSkills: skills, allAvailability: availability, allPreferences: preferences };
  } catch (error) {
    console.error('Failed to fetch static data:', error);
    return { allGenres: [], allInstruments: [], allSkills: [], allAvailability: [], allPreferences: [] };
  }
}

async function getMusicianProfileData(userId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    
    // Fetch profile and static data in parallel
    const [profileRes, staticData] = await Promise.all([
      fetch(`${baseUrl}/api/m/${userId}/get-profile`, { cache: 'no-store' }),
      getStaticData()
    ]);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const isOwner = user ? user.id === userId : false;

    if (profileRes.status === 403 && !isOwner)  {
      return { error: 'private_profile' };
    }

    if (!profileRes.ok) {
      if (profileRes.status !== 403) {
        console.error('Error fetching musician profile from API:', profileRes.status, profileRes.statusText);
        return null;
      }
    }

    const profile = await profileRes.json();

    return {
      initialMusicianProfile: profile,
      initialIsOwner: isOwner,
      initialCurrentUser: user,
      ...staticData,
      userIdFromParams: userId,
    };
  } catch (error) {
    console.error('Error fetching musician profile:', error);
    return null;
  }
}

export default async function MusicianProfilePage({ params }: { params: { id: string } }) {
  const data = await getMusicianProfileData(params.id);

  if (!data) {
    return <InvalidIdError />;
  }

  // Type guard for error states
  if ('error' in data) {
    if (data.error === 'private_profile') {
      return <PrivateProfileError />;
    }
    return <InvalidIdError />; // Handle other potential errors
  }

  if (!data.initialMusicianProfile) {
    return <InvalidIdError />;
  }

  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileClientPage {...data} />
    </Suspense>
  );
}
