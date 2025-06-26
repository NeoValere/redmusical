'use server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Assuming you have a Prisma client instance exported from here

export async function GET() {
  try {
    const availability = await prisma.availability.findMany();
    return NextResponse.json(availability);
  } catch (error: unknown) {
    console.error('Unexpected error in availability API (Prisma):', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
