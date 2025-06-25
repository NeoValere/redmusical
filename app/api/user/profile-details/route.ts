import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Error getting session:', sessionError.message);
      return NextResponse.json({ error: 'Error getting session', details: sessionError.message }, { status: 500 });
    }

    if (!session) {
      return NextResponse.json({ userId: null, isMusician: false, isContractor: false, error: 'User not authenticated' }, { status: 401 });
    }

    const userId = session.user.id;

    const musicianProfile = await prisma.musician.findFirst({
      where: { userId: userId },
      select: { id: true }, // Select only necessary fields
    });

    const contractorProfile = await prisma.contractor.findFirst({
      where: { userId: userId },
      select: { id: true }, // Select only necessary fields
    });

    return NextResponse.json({
      userId,
      isMusician: !!musicianProfile,
      isContractor: !!contractorProfile,
    });

  } catch (error: any) {
    console.error('Error fetching user profile details:', error.message);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}
