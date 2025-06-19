import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import * as jose from 'jose';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Get the Authorization header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('API /api/musicians/[id]/update: Unauthorized - No Bearer token provided');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

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
  } catch (error) {
    console.error('API /api/musicians/[id]/update: Token verification failed:', error);
    return NextResponse.json({ message: 'Unauthorized - Invalid token' }, { status: 401 });
  }

  if (!userIdFromToken) {
    console.error('API /api/musicians/[id]/update: Unauthorized - User ID not found in token');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Ensure the user is authorized to update this specific musician profile
    const existingMusician = await prisma.musician.findFirst({
      where: { userId: id },
    });

    if (!existingMusician) {
      console.error(`API /api/musicians/[id]/update: Musician with userId ${id} not found.`);
      return NextResponse.json({ message: 'Musician not found' }, { status: 404 });
    }

    if (!existingMusician || existingMusician.userId !== userIdFromToken) {
      console.error(`API /api/musicians/[id]/update: Forbidden - User ${userIdFromToken} attempted to edit profile of ${existingMusician?.userId}`);
      return NextResponse.json({ message: 'Forbidden: You can only edit your own profile.' }, { status: 403 });
    }

    const body = await request.json();

    const {
      fullName,
      location,
      instruments,
      genres,
      bio,
      hourlyRate,
      availability,
      youtubeUrl,
      soundcloudUrl,
      instagramUrl,
    } = body;

    // Basic validation (more robust validation can be added with Zod/Yup)
    if (!fullName || fullName.length < 2) {
      return NextResponse.json({ message: 'Nombre completo es requerido y debe tener al menos 2 caracteres.' }, { status: 400 });
    }
    if (!location) {
      return NextResponse.json({ message: 'Ubicación es requerida.' }, { status: 400 });
    }
    if (!instruments || instruments.length === 0) {
      return NextResponse.json({ message: 'Al menos un instrumento es requerido.' }, { status: 400 });
    }
    if (!genres || genres.length === 0) {
      return NextResponse.json({ message: 'Al menos un género musical es requerido.' }, { status: 400 });
    }
    if (hourlyRate !== undefined && (isNaN(hourlyRate) || hourlyRate <= 0)) {
      return NextResponse.json({ message: 'Honorarios base debe ser un número positivo.' }, { status: 400 });
    }
    if (!availability || availability.length === 0) {
      return NextResponse.json({ message: 'Al menos un día de disponibilidad es requerido.' }, { status: 400 });
    }

    const updatedMusician = await prisma.musician.update({
      where: { id: existingMusician.id }, // Use the actual primary key for update
      data: {
        fullName,
        location,
        instruments,
        genres,
        bio,
        hourlyRate,
        availability,
        youtubeUrl,
        soundcloudUrl,
        instagramUrl,
      },
    });

    return NextResponse.json(updatedMusician, { status: 200 });
  } catch (error) {
    console.error('Error updating musician profile:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
