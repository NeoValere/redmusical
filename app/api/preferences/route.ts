import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Assuming you have a Prisma client instance exported from here

export async function GET() {
  try {
    const preferences = await prisma.preference.findMany();
    return NextResponse.json(preferences);
  } catch (error: unknown) {
    console.error('Unexpected error in preferences API (Prisma):', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
