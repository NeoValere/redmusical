import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
      },
    }
  );

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
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
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

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const userIdFromSession = session.user.id;

    if (id !== userIdFromSession) {
      return NextResponse.json({ message: 'Forbidden: You can only upload images for your own profile.' }, { status: 403 });
    }

    const contractorRecord = await prisma.contractor.findFirst({
      where: { userId: userIdFromSession },
      select: { id: true, profileImageUrl: true },
    });

    if (!contractorRecord) {
      return NextResponse.json({ message: 'Contractor profile not found' }, { status: 404 });
    }

    if (contractorRecord.profileImageUrl) {
      const oldUrl = contractorRecord.profileImageUrl;
      const bucketName = 'profile-images';
      const pathSegment = `/public/${bucketName}/`;
      const startIndex = oldUrl.indexOf(pathSegment);
      let oldFilePathInBucket = null;

      if (startIndex !== -1) {
        oldFilePathInBucket = oldUrl.substring(startIndex + pathSegment.length);
      }

      if (oldFilePathInBucket) {
        const { error: deleteError } = await supabaseAdmin.storage
          .from(bucketName)
          .remove([oldFilePathInBucket]);

        if (deleteError) {
          console.error('Supabase delete old image error:', deleteError);
        }
      }
    }

    const updatedContractor = await prisma.contractor.update({
      where: { id: contractorRecord.id },
      data: { profileImageUrl: publicUrlData.publicUrl },
    });

    if (!updatedContractor) {
      return NextResponse.json({ message: 'Error updating contractor profile' }, { status: 500 });
    }

    return NextResponse.json({ publicUrl: publicUrlData.publicUrl, contractor: updatedContractor }, { status: 200 });
  } catch (error) {
    console.error('Error handling image upload:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
