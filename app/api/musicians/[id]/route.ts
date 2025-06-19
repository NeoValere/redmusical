import { type NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as jose from 'jose';

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

  // Get the Authorization header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('API /api/musicians/[id]: Unauthorized - No Bearer token provided');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
  console.log('API /api/musicians/[id]: Authorization header found.');

  const token = authHeader.split(' ')[1];
  let userIdFromToken: string | null = null;

  try {
    const jwtSecret = process.env.SUPABASE_JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('SUPABASE_JWT_SECRET is not set');
    }
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jose.jwtVerify(token, secret);
    userIdFromToken = payload.sub as string; // 'sub' contains the user ID
    console.log(`API /api/musicians/[id]: Token verified. User ID from token: ${userIdFromToken}`);
  } catch (error) {
    console.error('API /api/musicians/[id]: Token verification failed:', error);
    return NextResponse.json({ message: 'Unauthorized - Invalid token' }, { status: 401 });
  }

  if (!userIdFromToken) {
    console.error('API /api/musicians/[id]: Unauthorized - User ID not found in token after verification');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log(`API /api/musicians/[id]: Attempting to fetch musician with userId: ${id} from Prisma.`);
    const musician = await prisma.musician.findFirst({
      where: { userId: id },
    });

    if (!musician) {
      console.error(`API /api/musicians/[id]: Musician with ID ${id} not found in database.`);
      return NextResponse.json({ message: 'Musician not found' }, { status: 404 });
    }

    console.log(`API /api/musicians/[id]: Found musician. Checking authorization for user ${userIdFromToken} against musician ${musician.userId}`);

    // Add authorization check: only the musician themselves can view or edit their profile
    if (musician.userId !== userIdFromToken) {
      console.error(`API /api/musicians/[id]: Forbidden - User ${userIdFromToken} attempted to access profile of ${musician.userId}`);
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    console.log('API /api/musicians/[id]: Musician profile fetched successfully.');
    return NextResponse.json(musician, { status: 200 });
  } catch (error) {
    console.error('Error fetching musician profile:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
