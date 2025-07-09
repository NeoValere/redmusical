import React, { Suspense } from 'react';
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import ProfileClientPage from './components/ProfileClientPage';
import ProfileSkeleton from './components/ProfileSkeleton';
import InvalidIdError from './components/InvalidIdError';
import { Box, Container, Paper, Skeleton, Stack, Card, CardContent } from '@mui/material';
import { initialTheme } from '@/lib/theme/MuiTheme';

async function getMusicianProfileData(userId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user ? user.id === userId : false;

  const { data: profile, error } = await supabase
    .from('Musician')
    .select(`
      *,
      genres:MusicianGenre(Genre(*)),
      instruments:MusicianInstrument(Instrument(*)),
      skills:MusicianSkill(Skill(*)),
      availability:MusicianAvailability(Availability(*)),
      preferences:MusicianPreference(Preference(*))
    `)
    .eq('userId', userId)
    .single();

  if (error) {
    console.error('Error fetching musician profile:', error);
    return null;
  }

  if (!profile) {
    return null;
  }

  const singleProfile = profile;
  
  if (!singleProfile.isPublic && !isOwner) {
      return null;
  }

  const typedProfile = {
    ...singleProfile,
    genres: singleProfile.genres.map((g: any) => g.Genre),
    instruments: singleProfile.instruments.map((i: any) => i.Instrument),
    skills: singleProfile.skills.map((s: any) => s.Skill),
    availability: singleProfile.availability.map((a: any) => a.Availability),
    preferences: singleProfile.preferences.map((p: any) => p.Preference),
  };

  let themeSettings = null;
  if (!isOwner) {
    try {
      const { data: themeData } = await supabase
        .from('theme_settings')
        .select('*')
        .eq('user_id', singleProfile.userId)
        .single();
      themeSettings = themeData;
    } catch (themeError) {
      console.error('Could not fetch profile theme settings:', themeError);
    }
  }

  const [
    { data: allGenres },
    { data: allInstruments },
    { data: allSkills },
    { data: allAvailability },
    { data: allPreferences },
  ] = await Promise.all([
    supabase.from('Genre').select('id, name'),
    supabase.from('Instrument').select('id, name'),
    supabase.from('Skill').select('id, name'),
    supabase.from('Availability').select('id, name'),
    supabase.from('Preference').select('id, name'),
  ]);

  return {
    initialMusicianProfile: typedProfile,
    initialIsOwner: isOwner,
    initialCurrentUser: user,
    initialProfileThemeSettings: themeSettings,
    allGenres: allGenres || [],
    allInstruments: allInstruments || [],
    allSkills: allSkills || [],
    allAvailability: allAvailability || [],
    allPreferences: allPreferences || [],
    userIdFromParams: userId,
  };
}

export default async function MusicianProfilePage({ params }: { params: { id: string } }) {
  const data = await getMusicianProfileData(params.id);

  if (!data || !data.initialMusicianProfile) {
    notFound();
  }

  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileClientPage
        {...data}
        initialMusicianProfile={data.initialMusicianProfile}
        initialIsOwner={data.initialIsOwner}
        initialCurrentUser={data.initialCurrentUser}
        initialProfileThemeSettings={data.initialProfileThemeSettings}
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
