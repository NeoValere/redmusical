import { type NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('API /api/musicians/[id]: GET request received.');
  const { id } = params; // Use params directly for dynamic routes

  if (!id) {
    console.error('API /api/musicians/[id]: ID not found in params.');
    return NextResponse.json({ message: 'ID not found in URL' }, { status: 400 });
  }
  console.log(`API /api/musicians/[id]: Extracted ID: ${id}`);

  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    console.error('API /api/musicians/[id]: Unauthorized - No active session or session error:', sessionError);
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userIdFromSession = session.user.id;

  try {
    console.log(`API /api/musicians/[id]: Attempting to fetch musician with userId: ${id} from Prisma.`);
    const musician = await prisma.musician.findFirst({
      where: { userId: id },
    });

    if (!musician) {
      console.error(`API /api/musicians/[id]: Musician with ID ${id} not found in database.`);
      return NextResponse.json({ message: 'Musician not found' }, { status: 404 });
    }

    console.log(`API /api/musicians/[id]: Found musician. Checking authorization for user ${userIdFromSession} against musician ${musician.userId}`);

    // Add authorization check: only the musician themselves can view or edit their profile
    if (musician.userId !== userIdFromSession) {
      console.error(`API /api/musicians/[id]: Forbidden - User ${userIdFromSession} attempted to access profile of ${musician.userId}`);
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    console.log('API /api/musicians/[id]: Musician profile fetched successfully.');
    return NextResponse.json(musician, { status: 200 });
  } catch (error) {
    console.error('Error fetching musician profile:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
