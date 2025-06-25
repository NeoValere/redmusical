import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js'; // Import createClient for service role
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../../../../lib/prisma'; // Corrected Prisma client import path

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = cookies(); // Call cookies() once at the top

  // Create a Supabase client configured to use cookies (for user session)
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore }); // Pass a function returning the pre-fetched cookieStore

  // Create a Supabase client with service role key (for privileged operations like deleting files)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`; // Remove the 'profile_images/' prefix

    const { data, error: uploadError } = await supabase.storage
      .from('profile-images')
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

    // Get the user session from Supabase to get the userId
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('API /api/m/[id]/upload-image: Unauthorized - No active session or session error:', sessionError);
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userIdFromSession = session.user.id;

    // Ensure the user is authorized to update this specific musician profile
    if (id !== userIdFromSession) {
      console.error(`API /api/m/[id]/upload-image: Forbidden - User ${userIdFromSession} attempted to upload image for profile of ${id}`);
      return NextResponse.json({ message: 'Forbidden: You can only upload images for your own profile.' }, { status: 403 });
    }

    // Fetch the current musician data to get the old image URL and musician ID using Prisma
    const musicianRecord = await prisma.musician.findFirst({ // Changed to findFirst
      where: { userId: userIdFromSession },
      select: { id: true, profileImageUrl: true }, // Corrected to profileImageUrl
    });

    if (!musicianRecord) {
      console.error(`API /api/m/[id]/upload-image: Musician with userId ${userIdFromSession} not found in database.`);
      return NextResponse.json({ message: 'Musician profile not found' }, { status: 404 });
    }

    // If an old image exists, delete it from the storage bucket
    if (musicianRecord.profileImageUrl) { // Corrected to profileImageUrl
      const oldUrl = musicianRecord.profileImageUrl; // Corrected to profileImageUrl
      const bucketName = 'profile-images';
      const pathSegment = `/public/${bucketName}/`;
      const startIndex = oldUrl.indexOf(pathSegment);
      let oldFilePathInBucket = null;

      if (startIndex !== -1) {
        oldFilePathInBucket = oldUrl.substring(startIndex + pathSegment.length);
      }

      if (oldFilePathInBucket) {
        const { error: deleteError } = await supabaseAdmin.storage // Use supabaseAdmin for deletion
          .from(bucketName)
          .remove([oldFilePathInBucket]); // Remove the file directly by its path in the bucket

        if (deleteError) {
          console.error('Supabase delete old image error:', deleteError);
          // Continue with upload even if old image deletion fails, but log the error
        }
      }
    }

    // Update the musician's profile with the new image URL using Prisma
    const updatedMusician = await prisma.musician.update({
      where: { id: musicianRecord.id }, // Use the musician's database ID
      data: { profileImageUrl: publicUrlData.publicUrl }, // Corrected to profileImageUrl
    });

    if (!updatedMusician) { // Prisma update returns the updated record or throws an error
      console.error('Prisma update error: Failed to update musician profile.');
      return NextResponse.json({ message: 'Error updating musician profile' }, { status: 500 });
    }

    return NextResponse.json({ publicUrl: publicUrlData.publicUrl, musician: updatedMusician }, { status: 200 });
  } catch (error) {
    console.error('Error handling image upload:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
