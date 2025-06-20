import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Assuming you have a Prisma client instance exported from here
import { Prisma } from '@prisma/client';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id: userId } = params; // The ID from the URL is actually the userId

  try {
    const {
      genres,
      instruments,
      skills,
      availability,
      preferences,
      audioTracks, // Added audioTracks
      profileColorCover,
      profileColorCardBackground,
      profileColorText,
      profileColorSectionBackground,
      isPublic, // Explicitly destructure isPublic
      ...otherData // All other fields not explicitly destructured
    } = await request.json();

    // Remove createdAt and updatedAt from otherData as Prisma manages them automatically
    if (otherData.createdAt !== undefined) {
      delete otherData.createdAt;
    }
    if (otherData.updatedAt !== undefined) {
      delete otherData.updatedAt;
    }

    // Start a Prisma transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // First, update the Musician table's direct fields
      const musicianUpdateData: Prisma.MusicianUpdateInput = {
        ...otherData, // Spread the cleaned otherData
      };

      // Explicitly add fields that need specific handling or type casting
      if (isPublic !== undefined) {
        musicianUpdateData.isPublic = isPublic;
      }
      if (profileColorCover !== undefined) {
        musicianUpdateData.profileColorCover = profileColorCover;
      }
      if (profileColorCardBackground !== undefined) {
        musicianUpdateData.profileColorCardBackground = profileColorCardBackground;
      }
      if (profileColorText !== undefined) {
        musicianUpdateData.profileColorText = profileColorText;
      }
      if (profileColorSectionBackground !== undefined) {
        musicianUpdateData.profileColorSectionBackground = profileColorSectionBackground;
      }

      if (audioTracks !== undefined) {
        if (audioTracks === null) {
          musicianUpdateData.audioTracks = Prisma.JsonNull;
        } else {
          // If audioTracks is not null, it should be a valid JSON structure.
          musicianUpdateData.audioTracks = audioTracks as Prisma.InputJsonValue;
        }
      }

      const updatedMusician = await tx.musician.update({
        where: { userId: userId }, // Corrected to query by userId
        data: musicianUpdateData,
      });

      // Handle many-to-many relationships by updating join tables
      // Only update if the corresponding array is provided in the request
      if (genres !== undefined) {
        await tx.musicianGenre.deleteMany({ where: { musicianId: updatedMusician.id } });
        if (genres.length > 0) {
          await tx.musicianGenre.createMany({
            data: genres.map((g: { id: string }) => ({ musicianId: updatedMusician.id, genreId: g.id })),
          });
        }
      }
      if (instruments !== undefined) {
        await tx.musicianInstrument.deleteMany({ where: { musicianId: updatedMusician.id } });
        if (instruments.length > 0) {
          await tx.musicianInstrument.createMany({
            data: instruments.map((i: { id: string }) => ({ musicianId: updatedMusician.id, instrumentId: i.id })),
          });
        }
      }
      if (skills !== undefined) {
        await tx.musicianSkill.deleteMany({ where: { musicianId: updatedMusician.id } });
        if (skills.length > 0) {
          await tx.musicianSkill.createMany({
            data: skills.map((s: { id: string }) => ({ musicianId: updatedMusician.id, skillId: s.id })),
          });
        }
      }
      if (availability !== undefined) {
        await tx.musicianAvailability.deleteMany({ where: { musicianId: updatedMusician.id } });
        if (availability.length > 0) {
          await tx.musicianAvailability.createMany({
            data: availability.map((a: { id: string }) => ({ musicianId: updatedMusician.id, availabilityId: a.id })),
          });
        }
      }
      if (preferences !== undefined) {
        await tx.musicianPreference.deleteMany({ where: { musicianId: updatedMusician.id } });
        if (preferences.length > 0) {
          await tx.musicianPreference.createMany({
            data: preferences.map((p: { id: string }) => ({ musicianId: updatedMusician.id, preferenceId: p.id })),
          });
        }
      }

      // Define the type for the included relations for the final fetch, explicitly listing fields as they come from Prisma (now camelCase)
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
        createdAt: Date;
        updatedAt: Date | null;
        genres: { genre: { id: string; name: string; }; }[];
        instruments: { instrument: { id: string; name: string; }; }[];
        skills: { skill: { id: string; name: string; }; }[];
        availability: { availability: { id: string; name: string; }; }[];
        preferences: { preference: { id: string; name: string; }; }[];
      };

      // Fetch the updated profile with all relations to return
      const finalProfile = await tx.musician.findUnique({
        where: { userId: userId }, // Fetch by userId for consistency
        include: {
          genres: { select: { genre: true } },
          instruments: { select: { instrument: true } },
          skills: { select: { skill: true } },
          availability: { select: { availability: true } },
          preferences: { select: { preference: true } },
        },
      }) as MusicianWithRelations | null; // Explicitly cast the result

      return finalProfile;
    });

    if (!result) {
      return NextResponse.json({ error: 'Updated musician profile not found' }, { status: 404 });
    }

    // Reconstruct the profile object to match the frontend's expected camelCase type
    const profile = {
      ...result,
      profileColorCover: result.profileColorCover,
      profileColorCardBackground: result.profileColorCardBackground,
      profileColorText: result.profileColorText,
      profileColorSectionBackground: result.profileColorSectionBackground,
      socialMediaLinks: result.socialMediaLinks as Record<string, string> | null, // Cast JsonValue
      audioTracks: result.audioTracks as { title: string; url: string; }[] | null, // Cast JsonValue for audioTracks
      createdAt: result.createdAt ? result.createdAt.toISOString() : null, // Convert Date to string, add null check
      updatedAt: result.updatedAt ? result.updatedAt.toISOString() : null, // Convert Date to string
      genres: result.genres.map((mg) => mg.genre),
      instruments: result.instruments.map((mi) => mi.instrument),
      skills: result.skills.map((ms) => ms.skill),
      availability: result.availability.map((ma) => ma.availability),
      preferences: result.preferences.map((mp) => mp.preference),
    };

    return NextResponse.json(profile);
  } catch (error: any) {
    console.error('Unexpected error in update-profile API (Prisma):', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
