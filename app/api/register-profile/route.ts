import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const userId = searchParams.get('userId');
  const role = searchParams.get('role');

  if (email) {
    try {
      const existingMusician = await prisma.musician.findUnique({ where: { email } });
      const existingContractor = await prisma.contractor.findUnique({ where: { email } });

      if (existingMusician || existingContractor) {
        return NextResponse.json({ exists: true }, { status: 200 });
      } else {
        return NextResponse.json({ exists: false }, { status: 200 });
      }
    } catch (error: any) {
      console.error('Error checking email existence:', error);
      return NextResponse.json({ error: 'Failed to check email existence', details: error.message }, { status: 500 });
    }
  } else if (userId && role) {
    try {
      let profile = null;
      if (role === 'musician') {
        profile = await prisma.musician.findFirst({ where: { userId } });
      } else if (role === 'contractor') {
        profile = await prisma.contractor.findFirst({ where: { userId } });
      }

      if (profile) {
        return NextResponse.json({ profile, exists: true }, { status: 200 });
      } else {
        return NextResponse.json({ exists: false }, { status: 200 });
      }
    } catch (error: any) {
      console.error(`Error checking ${role} profile existence by userId:`, error);
      return NextResponse.json({ error: `Failed to check ${role} profile existence`, details: error.message }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: 'Either email or userId and role parameters are required' }, { status: 400 });
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

    if (!userId || !fullName || !role || !email) { // Ensure email is also required
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let musicianProfile = null;
    let contractorProfile = null;

    // Try to find existing profiles by userId for the given roles using findFirst
    if (role === 'musician' || role === 'both') {
      musicianProfile = await prisma.musician.findFirst({ where: { userId } });
    }
    if (role === 'contractor' || role === 'both') {
      contractorProfile = await prisma.contractor.findFirst({ where: { userId } });
    }

    // If a profile for the specific role already exists, return it.
    if (role === 'musician' && musicianProfile) {
      return NextResponse.json({ message: 'Musician profile already exists', profile: musicianProfile }, { status: 200 });
    }
    if (role === 'contractor' && contractorProfile) {
      return NextResponse.json({ message: 'Contractor profile already exists', profile: contractorProfile }, { status: 200 });
    }

    // Handle email linking for existing profiles (if email matches but userId differs)
    if (role === 'musician') {
      const existingMusicianByEmail = await prisma.musician.findUnique({ where: { email } });
      if (existingMusicianByEmail && existingMusicianByEmail.userId !== userId) {
        musicianProfile = await prisma.musician.update({
          where: { email },
          data: { userId },
        });
        return NextResponse.json({ message: 'Musician profile updated with new userId', profile: musicianProfile }, { status: 200 });
      }
    } else if (role === 'contractor') {
      const existingContractorByEmail = await prisma.contractor.findUnique({ where: { email } });
      if (existingContractorByEmail && existingContractorByEmail.userId !== userId) {
        contractorProfile = await prisma.contractor.update({
          where: { email },
          data: { userId },
        });
        return NextResponse.json({ message: 'Contractor profile updated with new userId', profile: contractorProfile }, { status: 200 });
      }
    }

    // If no profile for the specific role exists for this userId, create it.
    if (role === 'musician' && !musicianProfile) {
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
      return NextResponse.json({ message: 'Musician profile created', profile: musician }, { status: 201 });
    } else if (role === 'contractor' && !contractorProfile) {
      const contractor = await prisma.contractor.create({
        data: {
          userId,
          fullName,
          email,
        },
      });
      return NextResponse.json({ message: 'Contractor profile created', profile: contractor }, { status: 201 });
    } else if (role === 'both') {
      return NextResponse.json({ error: 'Creating both roles simultaneously not directly supported via this endpoint yet, please select one role at a time or ensure separate calls.' }, { status: 400 });
    } else {
      return NextResponse.json({ error: 'Invalid role specified or profile already exists for this userId and role' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error creating or fetching profile:', error);
    return NextResponse.json({ error: 'Failed to create or fetch profile', details: error.message }, { status: 500 });
  }
}
