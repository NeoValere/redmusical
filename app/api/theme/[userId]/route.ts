import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  // Await the params
  const { userId } = await params;

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    // Use a raw query to safely access the auth.users table
    const users: any[] = await prisma.$queryRaw`
      SELECT raw_user_meta_data FROM auth.users WHERE id = ${userId}::uuid
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = users[0].raw_user_meta_data;

    return NextResponse.json({
      presets: userData?.theme_presets || null,
      defaultPreset: userData?.default_theme_preset || null,
    });
  } catch (error: any) {
    console.error('Unexpected error fetching theme settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
