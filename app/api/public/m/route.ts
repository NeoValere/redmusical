import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Musician } from '@prisma/client';

// Define a type for the selected musician data
interface MusicianSearchResult {
  id: string;
  userId: string;
  fullName: string | null;
  artisticName: string | null;
  city: string | null;
  province: string | null;
  profileImageUrl: string | null;
  experienceLevel: string | null;
  musicianOrBand: string | null;
  instruments: { instrument: { name: string } }[];
  genres: { genre: { name: string } }[];
  skills: { skill: { name: string } }[];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('q') || '';
    const musicianOrBandParam = searchParams.get('tipo');
    const experienceFilter = searchParams.get('experience') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    const removeAccents = (str: string | null | undefined) => {
      if (!str) return '';
      return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };

    let whereClause: any = {
      AND: [
        { isPublic: true },
      ],
    };

    if (musicianOrBandParam) {
      whereClause.AND.push({
        musicianOrBand: {
          equals: musicianOrBandParam,
          mode: 'insensitive',
        },
      });
    }

    if (experienceFilter) {
      whereClause.AND.push({ experienceLevel: experienceFilter });
    }

    if (searchTerm) {
      const unaccentedSearchTerm = removeAccents(searchTerm.toLowerCase());
      const searchWords = unaccentedSearchTerm.split(' ').filter(word => word.length > 0);

      const orConditions = [];

      for (const word of searchWords) {
        const baseTerm = getBaseTermUnaccented(word);

        const termConditions = [
          { artisticName: { contains: word, mode: 'insensitive' } },
          { fullName: { contains: word, mode: 'insensitive' } },
          { bio: { contains: word, mode: 'insensitive' } },
          { city: { contains: word, mode: 'insensitive' } },
          { province: { contains: word, mode: 'insensitive' } },
          { servicesOffered: { hasSome: [word] } },
          { influences: { hasSome: [word] } },
          { gearHighlights: { hasSome: [word] } },
          { instruments: { some: { instrument: { name: { contains: word, mode: 'insensitive' } } } } },
          { genres: { some: { genre: { name: { contains: word, mode: 'insensitive' } } } } },
          { skills: { some: { skill: { name: { contains: word, mode: 'insensitive' } } } } },
        ];

        if (baseTerm) {
          termConditions.push(
            { artisticName: { contains: baseTerm, mode: 'insensitive' } },
            { fullName: { contains: baseTerm, mode: 'insensitive' } },
            { bio: { contains: baseTerm, mode: 'insensitive' } },
            { city: { contains: baseTerm, mode: 'insensitive' } },
            { province: { contains: baseTerm, mode: 'insensitive' } },
            { instruments: { some: { instrument: { name: { contains: baseTerm, mode: 'insensitive' } } } } },
            { genres: { some: { genre: { name: { contains: baseTerm, mode: 'insensitive' } } } } },
            { skills: { some: { skill: { name: { contains: baseTerm, mode: 'insensitive' } } } } }
          );
        }

        orConditions.push(...termConditions);
      }

      if (orConditions.length > 0) {
        whereClause.AND.push({ OR: orConditions });
      }
    }

    const totalCount = await prisma.musician.count({
      where: whereClause,
    });

    const musicians = await prisma.musician.findMany({
      where: whereClause,
      select: {
        id: true,
        userId: true,
        fullName: true,
        artisticName: true,
        city: true,
        province: true,
        profileImageUrl: true,
        experienceLevel: true,
        musicianOrBand: true,
        instruments: {
          select: {
            instrument: {
              select: {
                name: true,
              },
            },
          },
        },
        genres: {
          select: {
            genre: {
              select: {
                name: true,
              },
            },
          },
        },
        skills: {
          select: {
            skill: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: [
        { profileCompleteness: 'desc' },
        { createdAt: 'desc' },
      ],
      skip: skip,
      take: limit,
    });

    return NextResponse.json({
      musicians,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error: any) {
    console.error('Error fetching public musicians:', error.message);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

const getBaseTermUnaccented = (unaccentedWord: string): string | null => {
  // Specific role/instrument transformations (unaccented)
  const roleMap: { [key: string]: string } = {
    "tecladista": "teclado",
    "guitarrista": "guitarra",
    "bajista": "bajo",
    "baterista": "bateria",
    "violinista": "violin",
    "saxofonista": "saxofon",
    "cantante": "canto",
    // Add more as needed
  };
  if (roleMap[unaccentedWord]) {
    return roleMap[unaccentedWord];
  }

  // General plural 's' removal (e.g., teclados -> teclado)
  if (unaccentedWord.endsWith('s') && !unaccentedWord.endsWith('ss') && unaccentedWord.length > 2) {
    return unaccentedWord.slice(0, -1);
  }

  return null;
};
