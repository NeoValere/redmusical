export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('q') || '';
    const tipo = searchParams.get('tipo');
    const province = searchParams.get('province');
    const city = searchParams.get('city');
    const genres = searchParams.get('genres')?.split(',');
    const instruments = searchParams.get('instruments')?.split(',');
    const skills = searchParams.get('skills')?.split(',');
    const acceptsGigs = searchParams.get('acceptsGigs');
    const acceptsCollaborations = searchParams.get('acceptsCollaborations');
    const availability = searchParams.get('availability')?.split(',');
    const minRate = searchParams.get('minRate');
    const maxRate = searchParams.get('maxRate');

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    const andConditions: Prisma.MusicianWhereInput[] = [{ isPublic: true }];

    if (searchTerm) {
      andConditions.push({
        OR: [
          { artisticName: { contains: searchTerm, mode: 'insensitive' } },
          { fullName: { contains: searchTerm, mode: 'insensitive' } },
          { bio: { contains: searchTerm, mode: 'insensitive' } },
        ],
      });
    }

    if (tipo) {
      if (tipo === 'Musician') {
        andConditions.push({
          OR: [
            { musicianOrBand: { equals: 'Musician' } },
            { musicianOrBand: { equals: null } },
          ],
        });
      } else {
        andConditions.push({ musicianOrBand: { equals: tipo } });
      }
    }
    if (province) {
      andConditions.push({ province: { contains: province, mode: 'insensitive' } });
    }
    if (city) {
      andConditions.push({ city: { contains: city, mode: 'insensitive' } });
    }
    if (genres && genres.length > 0) {
      const genreIds = await prisma.genre.findMany({
        where: { name: { in: genres, mode: 'insensitive' } },
        select: { id: true },
      });
      if (genreIds.length > 0) {
        andConditions.push({
          genres: { some: { genreId: { in: genreIds.map((g) => g.id) } } },
        });
      }
    }
    if (instruments && instruments.length > 0) {
      const instrumentIds = await prisma.instrument.findMany({
        where: { name: { in: instruments, mode: 'insensitive' } },
        select: { id: true },
      });
      if (instrumentIds.length > 0) {
        andConditions.push({
          instruments: {
            some: { instrumentId: { in: instrumentIds.map((i) => i.id) } },
          },
        });
      }
    }
    if (skills && skills.length > 0) {
      const skillIds = await prisma.skill.findMany({
        where: { name: { in: skills, mode: 'insensitive' } },
        select: { id: true },
      });
      if (skillIds.length > 0) {
        andConditions.push({
          skills: { some: { skillId: { in: skillIds.map((s) => s.id) } } },
        });
      }
    }
    if (availability && availability.length > 0) {
      const availabilityIds = await prisma.availability.findMany({
        where: { name: { in: availability, mode: 'insensitive' } },
        select: { id: true },
      });
      if (availabilityIds.length > 0) {
        andConditions.push({
          availability: {
            some: { availabilityId: { in: availabilityIds.map((a) => a.id) } },
          },
        });
      }
    }
    if (acceptsGigs === 'true') {
      andConditions.push({ acceptsGigs: true });
    }
    if (acceptsCollaborations === 'true') {
      andConditions.push({ acceptsCollaborations: true });
    }
    if (minRate) {
      const minRateNum = parseInt(minRate, 10);
      andConditions.push({
        OR: [
          { hourlyRate: { gte: minRateNum } },
          { hourlyRate: { equals: null } },
        ],
      });
    }
    if (maxRate && parseInt(maxRate, 10) < 500) { // Only apply max rate if it's not the default max
        andConditions.push({ hourlyRate: { lte: parseInt(maxRate, 10) } });
    }

    const totalCount = await prisma.musician.count({
      where: { AND: andConditions },
    });

    const musicians = await prisma.musician.findMany({
      where: { AND: andConditions },
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
  } catch (error: unknown) {
    console.error('Error fetching public musicians:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}
