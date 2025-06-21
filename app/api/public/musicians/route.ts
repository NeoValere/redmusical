import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma, Musician } from '@prisma/client'; // Correctly import Prisma for types and Prisma.sql

// Define a type for the selected musician data
interface MusicianSearchResult {
  id: string;
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
    const isBandParam = searchParams.get('isBand');
    const experienceFilter = searchParams.get('experience') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    const removeAccents = (str: string | null | undefined) => {
      if (!str) return '';
      return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };

    const queryConditions: Prisma.Sql[] = [Prisma.sql`"Musician"."isPublic" = TRUE`];

    if (isBandParam === 'true') {
      queryConditions.push(Prisma.sql`"Musician"."musicianOrBand" = 'band'`);
    } else if (isBandParam === 'false') {
      queryConditions.push(Prisma.sql`"Musician"."musicianOrBand" = 'musician'`);
    }

    if (experienceFilter) {
      queryConditions.push(Prisma.sql`"Musician"."experienceLevel" = ${experienceFilter}`);
    }

    if (searchTerm) {
      const unaccentedSearchTerm = removeAccents(searchTerm.toLowerCase());
      const searchWords = unaccentedSearchTerm.split(' ').filter(word => word.length > 0);
      
      const perWordSqlSearchConditions: Prisma.Sql[] = [];

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
        
        // Previous more generic suffix logic can be added here as a fallback if desired,
        // but specific maps are safer for now.
        // Example of a more generic -ista rule if the map doesn't cover it:
        // if (unaccentedWord.endsWith('ista')) {
        //   const base = unaccentedWord.slice(0, -'ista'.length);
        //   if (base.endsWith('d') || base.endsWith('j') || base.endsWith('n') || base.endsWith('l')) return base + 'o'; // Simplistic
        //   if (base.endsWith('r')) return base.slice(0,-1) + 'a'; // e.g. guitarr -> guitarra
        //   return base;
        // }

        return null;
      };

      searchWords.forEach(word => {
        const pattern = `%${word}%`; // word is already unaccented and lowercased
        const baseTerm = getBaseTermUnaccented(word);
        const basePattern = baseTerm ? `%${baseTerm}%` : null;

        const fieldSpecificOr: Prisma.Sql[] = [];

        // Direct text fields
        const directTextFields = ["artisticName", "fullName", "bio", "city", "province"];
        directTextFields.forEach(field => {
          const columnIdentifier = Prisma.sql`"Musician"."${Prisma.raw(field)}"`;
          let condition = Prisma.sql`unaccent(${columnIdentifier}) ILIKE ${pattern}`;
          if (basePattern) {
            condition = Prisma.sql`(${condition} OR unaccent(${columnIdentifier}) ILIKE ${basePattern})`;
          }
          fieldSpecificOr.push(condition);
        });
        
        // Array fields
        const arrayFields = ["servicesOffered", "influences", "gearHighlights"];
        arrayFields.forEach(field => {
          const columnIdentifier = Prisma.sql`"Musician"."${Prisma.raw(field)}"`;
          let unnestCondition = Prisma.sql`unaccent(elem) ILIKE ${pattern}`;
          if (basePattern) {
            unnestCondition = Prisma.sql`(${unnestCondition} OR unaccent(elem) ILIKE ${basePattern})`;
          }
          // Using a unique alias for the unnested element column for safety, though 'elem' is common.
          fieldSpecificOr.push(Prisma.sql`EXISTS (SELECT 1 FROM unnest(${columnIdentifier}) elem_table(elem) WHERE ${unnestCondition})`);
        });
        
        // Related entities (instruments, genres, skills)
        const relatedQuery = (joinTable: string, relatedTable: string, relatedTableFk: string, musicianFkInJoinTable: string, relatedNameColumn: string) => {
          const relatedColumnIdentifier = Prisma.sql`rt."${Prisma.raw(relatedNameColumn)}"`;
          let termMatchCondition = Prisma.sql`unaccent(${relatedColumnIdentifier}) ILIKE ${pattern}`;
          if (basePattern) {
            termMatchCondition = Prisma.sql`(${termMatchCondition} OR unaccent(${relatedColumnIdentifier}) ILIKE ${basePattern})`;
          }
          
          let sql = Prisma.sql`EXISTS (
            SELECT 1 FROM "${Prisma.raw(joinTable)}" jt
            JOIN "${Prisma.raw(relatedTable)}" rt ON jt."${Prisma.raw(relatedTableFk)}" = rt.id
            WHERE jt."${Prisma.raw(musicianFkInJoinTable)}" = "Musician".id AND (${termMatchCondition}))`;
          return sql;
        };
        
        fieldSpecificOr.push(relatedQuery("MusicianInstrument", "Instrument", "instrumentId", "musicianId", "name"));
        fieldSpecificOr.push(relatedQuery("MusicianGenre", "Genre", "genreId", "musicianId", "name"));
        fieldSpecificOr.push(relatedQuery("MusicianSkill", "Skill", "skillId", "musicianId", "name"));
        
        perWordSqlSearchConditions.push(Prisma.sql`(${Prisma.join(fieldSpecificOr, " OR ")})`);
      });

      if (perWordSqlSearchConditions.length > 0) {
        queryConditions.push(Prisma.sql`(${Prisma.join(perWordSqlSearchConditions, " AND ")})`);
      }
    }
    
    const whereClauseSql = Prisma.join(queryConditions, " AND ");

    // Step 1: Get total count with filters
    const countQuery = Prisma.sql`SELECT COUNT(*) FROM "Musician" WHERE ${whereClauseSql}`;
    const countResult: { count: bigint }[] = await prisma.$queryRaw(countQuery);
    const totalCount = Number(countResult[0].count);

    // Step 2: Get musician IDs with filters, pagination, and ordering
    const idQuery = Prisma.sql`SELECT "Musician".id FROM "Musician" WHERE ${whereClauseSql} ORDER BY "Musician"."createdAt" DESC LIMIT ${limit} OFFSET ${skip}`;
    const musicianIdObjects: { id: string }[] = await prisma.$queryRaw(idQuery);
    const musicianIds = musicianIdObjects.map(obj => obj.id);

    let musicians: MusicianSearchResult[] = [];
    if (musicianIds.length > 0) {
      // Step 3: Fetch full musician data for the retrieved IDs
      // The result of this findMany will conform to MusicianSearchResult due to the select clause
      musicians = await prisma.musician.findMany({
        where: { id: { in: musicianIds } },
        select: {
          id: true,
          fullName: true,
          artisticName: true,
          city: true,
          province: true, // Added province to select
          profileImageUrl: true,
          experienceLevel: true,
          musicianOrBand: true,
          // Select related instruments, genres, and skills
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
          skills: { // Added skills to select
            select: {
              skill: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        // Re-apply order to ensure consistency, as `IN` clause doesn't guarantee order
        // from the initial ID query.
        orderBy: { 
          createdAt: 'desc',
        },
      });
    } else {
      // If no IDs matched, musicians array is empty, totalCount is already set
    }
    
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
