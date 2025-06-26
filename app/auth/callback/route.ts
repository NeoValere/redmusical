import { createClient } from '@/utils/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const supabase = await createClient()

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  const { data: { user } } = await supabase.auth.getUser();
  const { data: { session } } = await supabase.auth.getSession();

  if (user && session) {
    if (!user.id) {
      console.error('User ID is missing after authentication.');
      return NextResponse.redirect(`${requestUrl.origin}/error?message=User ID missing after authentication`);
    }

    // Always check for existing profiles in our database as the source of truth

    const [musicianProfileRes, contractorProfileRes] = await Promise.all([
      fetch(`${requestUrl.origin}/api/register-profile?userId=${user.id}&role=musician&email=${user.email || ''}`),
      fetch(`${requestUrl.origin}/api/register-profile?userId=${user.id}&role=contractor&email=${user.email || ''}`)
    ]);

    if (!musicianProfileRes.ok || !musicianProfileRes.headers.get('content-type')?.includes('application/json')) {
      const errorText = await musicianProfileRes.text();
      console.error('Musician profile API call failed or returned non-JSON:', musicianProfileRes.status, errorText);
      return NextResponse.redirect(`${requestUrl.origin}/error?message=Failed to load musician profile or invalid response`);
    }
    if (!contractorProfileRes.ok || !contractorProfileRes.headers.get('content-type')?.includes('application/json')) {
      const errorText = await contractorProfileRes.text();
      console.error('Contractor profile API call failed or returned non-JSON:', contractorProfileRes.status, errorText);
      return NextResponse.redirect(`${requestUrl.origin}/error?message=Failed to load contractor profile or invalid response`);
    }

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
