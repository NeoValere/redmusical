import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Assuming you have a Prisma client instance exported from here

export async function GET() {
  try {
    const instruments = await prisma.instrument.findMany();
    return NextResponse.json(instruments);
  } catch (error: any) {
    console.error('Unexpected error in instruments API (Prisma):', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
