import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('API /api/m/[id]: GET request received.');
  const { id } = await params;

  if (!id) {
    console.error('API /api/m/[id]: ID not found in params.');
    return NextResponse.json({ message: 'ID not found in URL' }, { status: 400 });
  }
  console.log(`API /api/m/[id]: Extracted ID: ${id}`);

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
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('API /api/m/[id]: Unauthorized - No active session or session error:', userError);
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userIdFromSession = user.id;

  try {
    console.log(`API /api/m/[id]: Attempting to fetch musician with userId: ${id} from Prisma.`);
    const musician = await prisma.musician.findFirst({
      where: { userId: id },
    });

    if (!musician) {
      console.error(`API /api/m/[id]: Musician with ID ${id} not found in database.`);
      return NextResponse.json({ message: 'Musician not found' }, { status: 404 });
    }

    console.log(`API /api/m/[id]: Found musician. Checking authorization for user ${userIdFromSession} against musician ${musician.userId}`);

    // Add authorization check: only the musician themselves can view or edit their profile
    if (musician.userId !== userIdFromSession) {
      console.error(`API /api/m/[id]: Forbidden - User ${userIdFromSession} attempted to access profile of ${musician.userId}`);
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    console.log('API /api/m/[id]: Musician profile fetched successfully.');
    return NextResponse.json(musician, { status: 200 });
  } catch (error) {
    console.error('Error fetching musician profile:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
