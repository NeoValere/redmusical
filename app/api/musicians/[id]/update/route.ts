import { NextResponse, type NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    console.error('API /api/musicians/[id]/update: Unauthorized - No active session or session error:', sessionError);
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const userIdFromSession = session.user.id;

  try {
    // Ensure the user is authorized to update this specific musician profile
    const existingMusician = await prisma.musician.findFirst({
      where: { userId: id },
    });

    if (!existingMusician) {
      console.error(`API /api/musicians/[id]/update: Musician with userId ${id} not found.`);
      return NextResponse.json({ message: 'Musician not found' }, { status: 404 });
    }

    if (existingMusician.userId !== userIdFromSession) {
      console.error(`API /api/musicians/[id]/update: Forbidden - User ${userIdFromSession} attempted to edit profile of ${existingMusician?.userId}`);
      return NextResponse.json({ message: 'Forbidden: You can only edit your own profile.' }, { status: 403 });
    }

    const body = await request.json();

    const {
      fullName,
      location,
      instruments,
      genres,
      bio,
      hourlyRate: rawHourlyRate, // Rename to avoid conflict and process
      availability,
      youtubeUrl,
      soundcloudUrl,
      instagramUrl,
    } = body;

    // Convert hourlyRate to a number, handle potential non-numeric input
    const hourlyRate = rawHourlyRate !== undefined && rawHourlyRate !== null && rawHourlyRate !== ''
      ? Number(rawHourlyRate)
      : null; // Set to null if undefined, null, or empty string

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
    if (hourlyRate !== null && (isNaN(hourlyRate) || hourlyRate < 0)) { // Allow 0 if it's a valid rate
      return NextResponse.json({ message: 'Honorarios base debe ser un número positivo o cero.' }, { status: 400 });
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
        hourlyRate, // Use the converted number
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
