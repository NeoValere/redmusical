import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const role = searchParams.get('role');
  const email = searchParams.get('email');

  console.log(`[register-profile GET] userId: ${userId}, role: ${role}, email: ${email}`);

  // Prioritize checking by userId and role if both are valid
  if (userId && userId !== 'null' && role) {
    try {
      let profile = null;
      if (role === 'musician') {
        profile = await prisma.musician.findFirst({ where: { userId } });
      } else if (role === 'contractor') {
        profile = await prisma.contractor.findFirst({ where: { userId } });
      }

      if (profile) {
        console.log(`[register-profile GET] Profile found for userId: ${userId}, role: ${role}`);
        return NextResponse.json({ profile, exists: true }, { status: 200 });
      } else {
        // If no profile found by userId, but email is provided, check by email as a fallback
        if (email) {
          console.log(`[register-profile GET] No profile by userId, checking by email: ${email}`);
          const existingMusician = await prisma.musician.findUnique({ where: { email } });
          const existingContractor = await prisma.contractor.findUnique({ where: { email } });

          if (existingMusician || existingContractor) {
            console.log(`[register-profile GET] Profile found by email: ${email}`);
            return NextResponse.json({ exists: true, message: 'Profile found by email, but not linked to userId' }, { status: 200 });
          }
        }
        console.log(`[register-profile GET] No profile found for userId: ${userId}, role: ${role}, email: ${email}`);
        return NextResponse.json({ exists: false }, { status: 200 });
      }
    } catch (error: any) {
      console.error(`[register-profile GET] Error checking ${role} profile existence by userId:`, error);
      return NextResponse.json({ error: `Failed to check ${role} profile existence`, details: error.message }, { status: 500 });
    }
  } else if (email) { // Fallback if userId is not valid or not provided, but email is
    try {
      console.log(`[register-profile GET] Checking email existence for: ${email}`);
      const existingMusician = await prisma.musician.findUnique({ where: { email } });
      const existingContractor = await prisma.contractor.findUnique({ where: { email } });

      if (existingMusician || existingContractor) {
        console.log(`[register-profile GET] Email exists: ${email}`);
        return NextResponse.json({ exists: true }, { status: 200 });
      } else {
        console.log(`[register-profile GET] Email does not exist: ${email}`);
        return NextResponse.json({ exists: false }, { status: 200 });
      }
    } catch (error: any) {
      console.error('[register-profile GET] Error checking email existence:', error);
      return NextResponse.json({ error: 'Failed to check email existence', details: error.message }, { status: 500 });
    }
  } else {
    console.warn('[register-profile GET] Missing required parameters: userId/role or email.');
    return NextResponse.json({ error: 'Either a valid userId and role, or an email parameter is required' }, { status: 400 });
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
  } catch (error: any) {
    console.error('Error deleting profile:', error);
    // Handle case where profile might not exist (e.g., P2025)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Profile not found', details: error.message }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete profile', details: error.message }, { status: 500 });
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
          location: '',
          instruments: [],
          genres: [],
          bio: '',
          hourlyRate: 0,
          availability: [],
        },
      });
      return NextResponse.json({ message: 'Musician profile created', profile: musician, redirectUrl: '/dashboard' }, { status: 201 });
    } else if (role === 'contractor' && !contractorProfile) {
      console.log('[register-profile POST] Creating new contractor profile.');
      const contractor = await prisma.contractor.create({
        data: {
          userId,
          fullName,
          email,
        },
      });
      return NextResponse.json({ message: 'Contractor profile created', profile: contractor, redirectUrl: '/dashboard/contractor' }, { status: 201 });
    } else if (role === 'both') {
      console.warn('[register-profile POST] Attempted to create both roles simultaneously.');
      return NextResponse.json({ error: 'Creating both roles simultaneously not directly supported via this endpoint yet, please select one role at a time or ensure separate calls.' }, { status: 400 });
    } else {
      console.warn('[register-profile POST] Invalid role specified or profile already exists for this userId and role.');
      return NextResponse.json({ error: 'Invalid role specified or profile already exists for this userId and role' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[register-profile POST] Error creating or fetching profile:', error);
    // Ensure all error paths return JSON
    return NextResponse.json({ error: 'Failed to create or fetch profile', details: error.message || 'Unknown error' }, { status: 500 });
  }
}
