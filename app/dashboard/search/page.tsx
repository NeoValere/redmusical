import React from 'react';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import SwitchRoleButton from './components/SwitchRoleButton';

export const dynamic = 'force-dynamic'; // Ensure dynamic rendering for cookies()

export default async function SearchDashboardPage() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  const userId = session?.user?.id || null;
  const userEmail = session?.user?.email || null;
  const userFullName = session?.user?.user_metadata?.full_name || userEmail?.split('@')[0] || 'New User';

  let hasMusicianProfile = false;
  if (userId) {
    const musicianProfile = await prisma.musician.findFirst({
      where: { userId: userId },
    });
    hasMusicianProfile = !!musicianProfile;
  }

  return (
    <div>
      <h1>Búsqueda de músicos</h1>
      <p>Bienvenido a tu área de búsqueda.</p>
      {/* Add search-specific content here */}
      <SwitchRoleButton
        userId={userId}
        userEmail={userEmail}
        userFullName={userFullName}
        hasMusicianProfile={hasMusicianProfile}
      />
    </div>
  );
}
