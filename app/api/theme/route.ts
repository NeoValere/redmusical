import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // The 'users' table in Supabase's 'auth' schema is not directly queryable by default RLS policies.
    // Instead, we can access user-specific, non-sensitive data from a public 'profiles' table
    // or by calling a custom database function (RPC).
    // For this case, let's assume the theme data is stored in a public table `profiles` linked by user_id.
    // If not, an RPC function would be the standard secure way to expose this data.

    // Let's try to fetch from a 'profiles' table as an example.
    // This will likely fail if the table is named differently or RLS is restrictive.
    const { data: profileData, error: profileError } = await supabase
      .from('users') // Corrected to 'users' as per schema, assuming RLS is now permissive
      .select('theme_presets, default_theme_preset')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching theme settings from users table:', profileError);
       // Provide a more specific error message if permission is denied
      if (profileError.code === '42501') {
        console.error('RLS policy on "users" table is preventing access.');
        return NextResponse.json({ error: 'Permission denied to access theme settings. Please check your database RLS policies.' }, { status: 403 });
      }
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    return NextResponse.json({
      presets: profileData?.theme_presets,
      defaultPreset: profileData?.default_theme_preset,
    });

  } catch (error: unknown) {
    console.error('Unexpected error in theme API:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
