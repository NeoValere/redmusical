export const dynamic = 'force-dynamic'; // Explicitly set route as dynamic

import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client'; // Import Prisma types

export async function GET(
  request: Request, // Add request parameter
  { params }: { params: { id: string } } // Destructure params from the second argument
) {
  // As per Next.js 15 guidelines, dynamic APIs like params and cookies are asynchronous.
  // See: https://nextjs.org/docs/messages/sync-dynamic-apis

  const resolvedParams = await params; // Await params directly
  const { id: userId } = resolvedParams; // Access id from resolved params
  console.log({ userId })
  try {
    // const cookieStore = await cookies(); // No longer needed to call await here
    const supabase = createRouteHandlerClient({ cookies }); // Pass the cookies function directly
    const { data: { user } } = await supabase.auth.getUser();
    const isOwner = user && user.id === userId;

    // Define the type for the included relations, explicitly listing fields as they come from Prisma (now camelCase)
    type MusicianWithRelations = {
      id: string;
      userId: string;
      fullName: string | null;
      email: string | null;
      bio: string | null;
      profileImageUrl: string | null;
      city: string | null;
      province: string | null;
      phoneNumber: string | null;
      websiteUrl: string | null;
      experienceLevel: string | null;
      hourlyRate: number | null;
      isPublic: boolean | null;
      acceptsCollaborations: boolean | null;
      acceptsGigs: boolean | null;
      socialMediaLinks: Prisma.JsonValue | null;
      audioTracks: Prisma.JsonValue | null; // Added audioTracks
      profileColorCover: string | null;
      profileColorCardBackground: string | null;
      profileColorText: string | null;
      profileColorSectionBackground: string | null;
      createdAt: Date; // Expecting Date object from Prisma
      updatedAt: Date | null; // Expecting Date object from Prisma, can be null
      genres: { genre: { id: string; name: string; }; }[];
      instruments: { instrument: { id: string; name: string; }; }[];
      skills: { skill: { id: string; name: string; }; }[];
      availability: { availability: { id: string; name: string; }; }[];
      preferences: { preference: { id: string; name: string; }; }[];
    };

    // Fetch Musician data using Prisma, querying by userId
    const musicianData = await prisma.musician.findUnique({
      where: { userId: userId }, // Corrected to query by userId, which is now unique
      include: {
        genres: {
          select: {
            genre: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        instruments: {
          select: {
            instrument: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        skills: {
          select: {
            skill: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        availability: {
          select: {
            availability: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        preferences: {
          select: {
            preference: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    }) as MusicianWithRelations | null; // Explicitly cast the result

    if (!musicianData) {
      return NextResponse.json({ error: 'Este perfil ya no existe' }, { status: 404 });
    }

    // Check if the profile is private AND the requesting user is NOT the owner
    if (musicianData.isPublic === false && !isOwner) {
      return NextResponse.json({ error: 'Este perfil es privado y no puede ser accedido.' }, { status: 403 });
    }

    // Reconstruct the profile object to match the frontend's expected camelCase type
    // Prisma now returns camelCase fields directly after schema update
    const profile = {
      ...musicianData, // Spread all fields directly from Prisma
      profileColorCover: musicianData.profileColorCover,
      profileColorCardBackground: musicianData.profileColorCardBackground,
      profileColorText: musicianData.profileColorText,
      profileColorSectionBackground: musicianData.profileColorSectionBackground,
      socialMediaLinks: musicianData.socialMediaLinks as Record<string, string> | null, // Cast JsonValue
      audioTracks: musicianData.audioTracks as { title: string; url: string; }[] | null, // Cast JsonValue for audioTracks
      createdAt: musicianData.createdAt ? musicianData.createdAt.toISOString() : null, // Convert Date to string, add null check
      updatedAt: musicianData.updatedAt ? musicianData.updatedAt.toISOString() : null, // Convert Date to string
      genres: musicianData.genres.map((mg) => mg.genre),
      instruments: musicianData.instruments.map((mi) => mi.instrument),
      skills: musicianData.skills.map((ms) => ms.skill),
      availability: musicianData.availability.map((ma) => ma.availability),
      preferences: musicianData.preferences.map((mp) => mp.preference),
    };

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error('Unexpected error in get-profile API (Prisma):', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
