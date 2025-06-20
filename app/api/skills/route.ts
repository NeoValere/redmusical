import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Assuming you have a Prisma client instance exported from here

export async function GET() {
  try {
    const skills = await prisma.skill.findMany();
    return NextResponse.json(skills);
  } catch (error: any) {
    console.error('Unexpected error in skills API (Prisma):', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
