import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

interface UserMetaData {
  theme_presets: Prisma.JsonValue | null;
  default_theme_preset: Prisma.JsonValue | null;
}

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
    const users: unknown[] = await prisma.$queryRaw`
      SELECT raw_user_meta_data FROM auth.users WHERE id = ${userId}::uuid
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = users[0] as { raw_user_meta_data: UserMetaData };

    return NextResponse.json({
      presets: userData?.raw_user_meta_data?.theme_presets || null,
      defaultPreset: userData?.raw_user_meta_data?.default_theme_preset || null,
    });
  } catch (error: unknown) {
    console.error('Unexpected error fetching theme settings:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
