import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const role = searchParams.get('role');
  const email = searchParams.get('email');

 // console.log(`[register-profile GET] userId: ${userId}, role: ${role}, email: ${email}`);

  try {
    // Prioritize checking by userId if it's valid
    if (userId && userId !== 'null') {
      let profile = null;
      if (role === 'musician') {
        profile = await prisma.musician.findFirst({ where: { userId } });
      } else if (role === 'contractor') {
        profile = await prisma.contractor.findFirst({ where: { userId } });
      }

      if (profile) {
      //  console.log(`[register-profile GET] Profile found for userId: ${userId}, role: ${role}`);
        return NextResponse.json({ profile, exists: true, roleFound: role }, { status: 200 });
      } else {
        // If no profile found by userId and specific role, check for any profile by userId
      //  console.log(`[register-profile GET] No profile found for userId: ${userId}, role: ${role}. Checking for any profile by userId.`);
        const existingMusician = await prisma.musician.findFirst({ where: { userId } });
        const existingContractor = await prisma.contractor.findFirst({ where: { userId } });

        if (existingMusician || existingContractor) {
          console.log(`[register-profile GET] Found existing profiles for userId: ${userId}. Musician: ${!!existingMusician}, Contractor: ${!!existingContractor}`);
          return NextResponse.json({
            exists: true,
            musicianProfile: existingMusician,
            contractorProfile: existingContractor,
            message: 'Profiles found for userId, but not necessarily for the requested role.'
          }, { status: 200 });
        }

        // If no profile found by userId, but email is provided, check by email as a fallback
        if (email) {
          console.log(`[register-profile GET] No profile by userId, checking by email: ${email}`);
          const existingMusicianByEmail = await prisma.musician.findUnique({ where: { email } });
          const existingContractorByEmail = await prisma.contractor.findUnique({ where: { email } });

          if (existingMusicianByEmail || existingContractorByEmail) {
            console.log(`[register-profile GET] Profile found by email: ${email}. Musician: ${!!existingMusicianByEmail}, Contractor: ${!!existingContractorByEmail}`);
            return NextResponse.json({
              exists: true,
              musicianProfile: existingMusicianByEmail,
              contractorProfile: existingContractorByEmail,
              message: 'Profile found by email, but not linked to userId'
            }, { status: 200 });
          }
        }
        console.log(`[register-profile GET] No profile found for userId: ${userId}, role: ${role}, email: ${email}`);
        return NextResponse.json({ exists: false }, { status: 200 });
      }
    } else if (email) { // Fallback if userId is not valid or not provided, but email is
      console.log(`[register-profile GET] Checking email existence for: ${email}`);
      const existingMusician = await prisma.musician.findUnique({ where: { email } });
      const existingContractor = await prisma.contractor.findUnique({ where: { email } });

      if (existingMusician || existingContractor) {
        console.log(`[register-profile GET] Email exists: ${email}. Musician: ${!!existingMusician}, Contractor: ${!!existingContractor}`);
        return NextResponse.json({
          exists: true,
          musicianProfile: existingMusician,
          contractorProfile: existingContractor
        }, { status: 200 });
      } else {
        console.log(`[register-profile GET] Email does not exist: ${email}`);
        return NextResponse.json({ exists: false }, { status: 200 });
      }
    } else {
      console.warn('[register-profile GET] Missing required parameters: userId/role or email.');
      return NextResponse.json({ error: 'Either a valid userId and role, or an email parameter is required' }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error(`[register-profile GET] Error checking profile existence:`, error);
    if (error instanceof Error) {
      return NextResponse.json({ error: `Failed to check profile existence`, details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: `Failed to check profile existence` }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
    }

    if (role === 'musician') {
      const musicianToDelete = await prisma.musician.findFirst({ where: { userId } });
      if (!musicianToDelete) {
        return NextResponse.json({ error: 'Musician profile not found' }, { status: 404 });
      }
      const deletedMusician = await prisma.musician.delete({
        where: { id: musicianToDelete.id },
      });
      return NextResponse.json({ message: 'Musician profile deleted', profile: deletedMusician }, { status: 200 });
    } else if (role === 'contractor') {
      const contractorToDelete = await prisma.contractor.findFirst({ where: { userId } });
      if (!contractorToDelete) {
        return NextResponse.json({ error: 'Contractor profile not found' }, { status: 404 });
      }
      const deletedContractor = await prisma.contractor.delete({
        where: { id: contractorToDelete.id },
      });
      return NextResponse.json({ message: 'Contractor profile deleted', profile: deletedContractor }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Invalid role specified for deletion' }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('Error deleting profile:', error);
    // Handle case where profile might not exist (e.g., P2025)
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Profile not found', details: error.message }, { status: 404 });
      }
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Failed to delete profile', details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, fullName, email, role } = await request.json();

    console.log(`[register-profile POST] userId: ${userId}, fullName: ${fullName}, email: ${email}, role: ${role}`);

    if (!userId || !fullName || !role || !email) {
      console.warn('[register-profile POST] Missing required fields.');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let musicianProfile = null;
    let contractorProfile = null;

    // Try to find existing profiles by userId for the given roles using findFirst
    if (role === 'musician' || role === 'both') {
      musicianProfile = await prisma.musician.findFirst({ where: { userId } });
      console.log(`[register-profile POST] Musician profile by userId (${userId}):`, musicianProfile ? 'found' : 'not found');
    }
    if (role === 'contractor' || role === 'both') {
      contractorProfile = await prisma.contractor.findFirst({ where: { userId } });
      console.log(`[register-profile POST] Contractor profile by userId (${userId}):`, contractorProfile ? 'found' : 'not found');
    }

    // If a profile for the specific role already exists, return it.
    if (role === 'musician' && musicianProfile) {
      console.log('[register-profile POST] Musician profile already exists.');
      return NextResponse.json({ message: 'Musician profile already exists', profile: musicianProfile }, { status: 200 });
    }
    if (role === 'contractor' && contractorProfile) {
      console.log('[register-profile POST] Contractor profile already exists.');
      return NextResponse.json({ message: 'Contractor profile already exists', profile: contractorProfile }, { status: 200 });
    }

    // Handle email linking for existing profiles (if email matches but userId differs)
    if (role === 'musician') {
      const existingMusicianByEmail = await prisma.musician.findUnique({ where: { email } });
      if (existingMusicianByEmail && existingMusicianByEmail.userId !== userId) {
        console.log('[register-profile POST] Musician profile found by email, updating userId.');
        musicianProfile = await prisma.musician.update({
          where: { email },
          data: { userId },
        });
        return NextResponse.json({ message: 'Musician profile updated with new userId', profile: musicianProfile }, { status: 200 });
      }
    } else if (role === 'contractor') {
      const existingContractorByEmail = await prisma.contractor.findUnique({ where: { email } });
      if (existingContractorByEmail && existingContractorByEmail.userId !== userId) {
        console.log('[register-profile POST] Contractor profile found by email, updating userId.');
        contractorProfile = await prisma.contractor.update({
          where: { email },
          data: { userId },
        });
        return NextResponse.json({ message: 'Contractor profile updated with new userId', profile: contractorProfile }, { status: 200 });
      }
    }

    // If no profile for the specific role exists for this userId, create it.
    if (role === 'musician' && !musicianProfile) {
      console.log('[register-profile POST] Creating new musician profile.');
      const musician = await prisma.musician.create({
        data: {
          userId,
          fullName,
          email,
          artisticName: fullName,
          city: null,
          province: null,
          instruments: { create: [] },
          genres: { create: [] },
          bio: '',
          hourlyRate: 0,
          availability: { create: [] },
          isPublic: false, // Set isPublic to false by default
        },
      });
      return NextResponse.json({ message: 'Musician profile created', profile: musician, redirectUrl: `/m/${musician.userId}/edit` }, { status: 201 });
    } else if (role === 'contractor' && !contractorProfile) {
      console.log('[register-profile POST] Creating new contractor profile.');
      const contractor = await prisma.contractor.create({
        data: {
          userId,
          fullName,
          email,
        },
      });
      return NextResponse.json({ message: 'Contractor profile created', profile: contractor, redirectUrl: '/dashboard/search' }, { status: 201 });
    } else if (role === 'both') {
      console.warn('[register-profile POST] Attempted to create both roles simultaneously.');
      return NextResponse.json({ error: 'Creating both roles simultaneously not directly supported via this endpoint yet, please select one role at a time or ensure separate calls.' }, { status: 400 });
    } else {
      console.warn('[register-profile POST] Invalid role specified or profile already exists for this userId and role.');
      return NextResponse.json({ error: 'Invalid role specified or profile already exists for this userId and role' }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('[register-profile POST] Error creating or fetching profile:', error);
    // Ensure all error paths return JSON
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Failed to create or fetch profile', details: error.message || 'Unknown error' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to create or fetch profile' }, { status: 500 });
  }
}
