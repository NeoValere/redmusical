import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const roleFromUrl = requestUrl.searchParams.get('role'); // Get role from search params

  const supabase = createRouteHandlerClient({ cookies: () => cookies() }); 

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();

  if (user && session) {
    // Always check for existing profiles in our database as the source of truth
    const headers = {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    };

    const [musicianProfileRes, contractorProfileRes] = await Promise.all([
      fetch(`${requestUrl.origin}/api/register-profile?userId=${user.id}&role=musician`),
      fetch(`${requestUrl.origin}/api/register-profile?userId=${user.id}&role=contractor`)
    ]);

    const musicianData = await musicianProfileRes.json();
    const contractorData = await contractorProfileRes.json();

    const hasMusicianProfile = musicianData.exists;
    const hasContractorProfile = contractorData.exists;

    if (hasMusicianProfile) {
      // If musician profile exists, redirect to musician profile
      return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
    } else if (hasContractorProfile) {
      // If only contractor profile exists, redirect to dashboard
      return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
    } else {
      // If no profiles exist in our database, redirect to select-role page
      return NextResponse.redirect(`${requestUrl.origin}/select-role`);
    }
  }

  return NextResponse.redirect(requestUrl.origin);
}
