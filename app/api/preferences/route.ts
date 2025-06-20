import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Assuming you have a Prisma client instance exported from here

export async function GET() {
  try {
    const preferences = await prisma.preference.findMany();
    return NextResponse.json(preferences);
  } catch (error: any) {
    console.error('Unexpected error in preferences API (Prisma):', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
