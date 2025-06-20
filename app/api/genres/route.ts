import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Assuming you have a Prisma client instance exported from here

export async function GET() {
  try {
    const genres = await prisma.genre.findMany();
    return NextResponse.json(genres);
  } catch (error: any) {
    console.error('Unexpected error in genres API (Prisma):', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
