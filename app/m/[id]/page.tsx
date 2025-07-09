import React, { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import ProfileClientPage from './components/ProfileClientPage';
import ProfileSkeleton from './components/ProfileSkeleton';
import InvalidIdError from './components/InvalidIdError';
import PrivateProfileError from './components/PrivateProfileError';
/* import { Box, Container, Paper, Skeleton, Stack, Card, CardContent } from '@mui/material';
import { initialTheme } from '@/lib/theme/MuiTheme'; */

async function getMusicianProfileData(userId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    const res = await fetch(`${baseUrl}/api/m/${userId}/get-profile`);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const isOwner = user ? user.id === userId : false;

    console.log( { user , isOwner })

    if (res.status === 403 && !isOwner)  {
      return { error: 'private_profile' };
    }

    if (!res.ok) {
      if ( res.status != 403){
         // Handle error responses from the API
      console.error('Error fetching musician profile from API:', res.status, res.statusText);
      return null;
      }
    }

    const profile = await res.json();

    return {
      initialMusicianProfile: profile,
      initialIsOwner: isOwner, // Ownership is handled by the API
      initialCurrentUser: user, // Current user is handled by the API
      allGenres: [],
      allInstruments: [],
      allSkills: [],
      allAvailability: [],
      allPreferences: [],
      userIdFromParams: userId,
    };
  } catch (error) {
    console.error('Error fetching musician profile:', error);
    return null;
  }
}

export default async function MusicianProfilePage({ params }: { params: { id: string } }) {
  const data = await getMusicianProfileData(params.id);

  if (data?.error === 'private_profile') {
    return <PrivateProfileError />;
  }

  if (!data || !data.initialMusicianProfile) {
    return <InvalidIdError/>
  }

  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileClientPage
        {...data}
        initialMusicianProfile={data.initialMusicianProfile}
        initialIsOwner={data.initialIsOwner}
        initialCurrentUser={data.initialCurrentUser}
        allGenres={data.allGenres}
        allInstruments={data.allInstruments}
        allSkills={data.allSkills}
        allAvailability={data.allAvailability}
        allPreferences={data.allPreferences}
        userIdFromParams={data.userIdFromParams}
      />
    </Suspense>
  );
}
