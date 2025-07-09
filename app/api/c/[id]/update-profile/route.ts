import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();
  const { fullName, location, companyName, websiteUrl, bio } = body;

  try {
    const updatedContractor = await prisma.contractor.update({
      where: {
        userId: id,
      },
      data: {
        fullName,
        location,
        companyName,
        websiteUrl,
        bio,
      },
    });

    return NextResponse.json(updatedContractor);
  } catch (error) {
    console.error('Error updating contractor profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
