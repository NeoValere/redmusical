import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Import Prisma client

export const dynamic = 'force-dynamic'; // Force dynamic rendering

export async function POST(request: Request) {
  const { userId, newRole } = await request.json();
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session || !session.user || !session.user.email) {
      console.error('Error getting session or user email:', sessionError);
      return NextResponse.json({ error: 'Authentication required or email not found' }, { status: 401 });
    }

    const userEmail = session.user.email;
    
    // Fetch existing profiles to preserve full name
    const existingMusician = await prisma.musician.findFirst({ where: { userId: userId } });
    const existingContractor = await prisma.contractor.findFirst({ where: { userId: userId } });

    let initialFullName = session.user.user_metadata.full_name || userEmail.split('@')[0] || 'New User';
    if (existingMusician?.fullName) {
      initialFullName = existingMusician.fullName;
    } else if (existingContractor?.fullName) {
      initialFullName = existingContractor.fullName;
    }

    let redirectUrl = '';

    if (newRole === 'musician') {
      // Create or update Musician profile
      await prisma.musician.upsert({
        where: { email: userEmail }, // Use email as unique identifier
        update: { userId: userId, fullName: initialFullName }, // Use initialFullName
        create: { userId: userId, email: userEmail, fullName: initialFullName }, // Use initialFullName
      });
      redirectUrl = '/dashboard'; // Musician dashboard
    } else if (newRole === 'contractor') {
      // Create or update Contractor profile
      await prisma.contractor.upsert({
        where: { email: userEmail }, // Use email as unique identifier
        update: { userId: userId, fullName: initialFullName }, // Use initialFullName
        create: { userId: userId, email: userEmail, fullName: initialFullName }, // Use initialFullName
      });
      redirectUrl = '/dashboard/contractor'; // Contractor dashboard
    } else {
      return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Role updated successfully', redirectUrl: redirectUrl });
  } catch (error: any) {
    console.error('Unexpected error during role switch:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
