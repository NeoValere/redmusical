import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { userId, newRole } = await request.json();
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // Update user metadata in Supabase Auth
    const { data, error } = await supabase.auth.updateUser({
      data: { role: newRole },
    });

    if (error) {
      console.error('Error updating user metadata:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Role updated successfully', user: data.user });
  } catch (error: any) {
    console.error('Unexpected error during role switch:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
