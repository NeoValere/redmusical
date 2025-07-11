import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
      },
    }
  );

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      console.error('Error getting user:', userError.message);
      return NextResponse.json({ error: 'Error getting user', details: userError.message }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ userId: null, isMusician: false, isContractor: false, error: 'User not authenticated' }, { status: 401 });
    }

    const userId = user.id;

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

  } catch (error: unknown) {
    console.error('Error fetching user profile details:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}
