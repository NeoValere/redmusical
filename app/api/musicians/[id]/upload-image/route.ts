import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js'; // Keep this for storage operations
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/prisma';
import * as jose from 'jose';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anon Key');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Get the Authorization header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('API /api/musicians/[id]/upload-image: Unauthorized - No Bearer token provided');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  let userIdFromToken: string | null = null;

  try {
    const jwtSecret = process.env.SUPABASE_JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('SUPABASE_JWT_SECRET is not set');
    }
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jose.jwtVerify(token, secret);
    userIdFromToken = payload.sub as string; // 'sub' contains the user ID
  } catch (error) {
    console.error('API /api/musicians/[id]/upload-image: Token verification failed:', error);
    return NextResponse.json({ message: 'Unauthorized - Invalid token' }, { status: 401 });
  }

  if (!userIdFromToken) {
    console.error('API /api/musicians/[id]/upload-image: Unauthorized - User ID not found in token');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl!, supabaseAnonKey!); // Use direct client for storage

  try {
    const existingMusician = await prisma.musician.findFirst({
      where: { userId: id },
    });

    if (!existingMusician || existingMusician.userId !== userIdFromToken) {
      console.error(`API /api/musicians/[id]/upload-image: Forbidden - User ${userIdFromToken} attempted to upload image for profile of ${existingMusician?.userId}`);
      return NextResponse.json({ message: 'Forbidden: You can only upload images for your own profile.' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `profile_images/${fileName}`;

    const { data, error: uploadError } = await supabase.storage
      .from('profile-images') // Ensure you have a bucket named 'profile-images' in Supabase Storage
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ message: 'Error uploading image', error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    if (!publicUrlData || !publicUrlData.publicUrl) {
      return NextResponse.json({ message: 'Error getting public URL for image' }, { status: 500 });
    }

    // Update the musician's profile with the new image URL
    const updatedMusician = await prisma.musician.update({
      where: { id: existingMusician.id }, // Use the actual primary key for update
      data: {
        profileImageUrl: publicUrlData.publicUrl,
      },
    });

    return NextResponse.json({ publicUrl: publicUrlData.publicUrl, musician: updatedMusician }, { status: 200 });
  } catch (error) {
    console.error('Error handling image upload:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
