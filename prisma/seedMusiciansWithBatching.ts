import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import pLimit from 'p-limit';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MB_HEADERS = {
  'User-Agent': process.env.MUSICBRAINZ_APP_NAME || 'RedMusicalApp/1.0 ( suemail@example.com )' // Added a default User-Agent
};

// Define the SpotifySearch interface based on usage
interface SpotifySearch {
  artists: {
    items: Array<{
      id: string;
      name: string;
      popularity: number;
      genres: string[];
      images?: Array<{ url: string; height?: number; width?: number }>;
      type: string; // 'artist' or 'band', etc.
    }>;
    // Add other properties if needed, like 'total', 'limit', 'offset'
  };
}

/* ------------ 1. Spotify helpers ------------ */
async function getSpotifyToken() {
  const resp = await axios.post<{ access_token: string }>( // Add type for axios response
    'https://accounts.spotify.com/api/token',
    new URLSearchParams({ grant_type: 'client_credentials' }).toString(),
    {
      headers: {
        Authorization:
          'Basic ' +
          Buffer.from(
            (process.env.SPOTIFY_CLIENT_ID || '') + // Added fallback for env vars
              ':' +
              (process.env.SPOTIFY_CLIENT_SECRET || '')
          ).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );
  return resp.data.access_token as string;
}

/** Devuelve ~500 artistas ordenados por popularidad en el market AR. */
async function fetchTopArtistsAR(token: string) {
  const letters = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');
  const artists: SpotifySearch['artists']['items'] = []; // Use defined type
  const limit = pLimit(5); // Limit concurrent requests to Spotify search

  await Promise.all(letters.map(letter => limit(async () => {
    try {
      const { data } = await axios.get<SpotifySearch>(
        'https://api.spotify.com/v1/search',
        {
          params: {
            q: letter,
            type: 'artist',
            market: 'AR',
            limit: 50 // Max limit per query
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (data.artists && data.artists.items) {
        artists.push(...data.artists.items);
      }
    } catch (error) {
      console.warn(`Failed to fetch artists for letter "${letter}":`, error instanceof Error ? error.message : error);
    }
  })));
  
  /** quitar duplicados y ordenar por popularidad ↓ */
  const map = new Map<string, SpotifySearch['artists']['items'][0]>();
  artists.forEach(a => map.set(a.id, a));
  return Array.from(map.values())
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 500); // Ensure we cap at 500 after deduplication
}

/* ------------ 2. MusicBrainz helper ------------ */
async function mbSearchByName(name: string) {
  try {
    const url =
      'https://musicbrainz.org/ws/2/artist?fmt=json&query=' +
      encodeURIComponent(`artist:"${name}" AND country:AR`);
    // Add a basic type for the expected MusicBrainz artist structure
    const { data } = await axios.get<{ artists: Array<{ id: string; name: string; 'begin-area'?: { name: string }; area?: { name: string } }> }>(url, { headers: MB_HEADERS });
    return data.artists?.[0];
  } catch (error) {
    console.warn(`MusicBrainz search failed for "${name}":`, error instanceof Error ? error.message : error);
    return null;
  }
}

/* ------------ 3. Generar bio con GPT ------------ */
async function buildBio(artisticName: string, genres: string[]) {
  const prompt = `Eres un músico argentino llamado ${artisticName}. En 2-3 líneas, contá quién sos, qué estilo hacés (${genres
    .slice(0, 2)
    .join(
      ', '
    )}) y un dato de color. Soná auténtico, no corporativo, sin signos de apertura de pregunta/exclamación.`;
  try {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });
    return res.choices[0].message.content?.trim() || `Músico ${artisticName}, explorando ${genres.join(', ')}.`; // Fallback bio
  } catch (error) {
    console.warn(`GPT bio generation failed for "${artisticName}":`, error instanceof Error ? error.message : error);
    return `Músico ${artisticName}, explorando ${genres.join(', ')}.`; // Fallback bio on error
  }
}

/* ------------ 4. Supabase: optional hotlink-killer ------------ */
async function mirrorImage(url: string) {
  if (!url) return null; // Handle cases where URL might be undefined
  try {
    const ext = url.split('.').pop()?.split('?')[0] || 'jpg';
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const { data: img } = await axios.get<ArrayBuffer>(url, {
      responseType: 'arraybuffer'
    });
    const { error } = await supabase.storage
      .from('profile-images') // Ensure this bucket exists and has correct policies
      .upload(fileName, img, { contentType: `image/${ext}` });
    if (error) throw error;
    return supabase.storage.from('profile-images').getPublicUrl(fileName).data
      .publicUrl;
  } catch(e) {
    console.warn(`Failed to mirror image ${url}:`, e instanceof Error ? e.message : e);
    return url; // fallback to original URL
  }
}

/* ------------ 5. Seed runner ------------ */
async function main(offset: number = 0, batchLimit: number = 10) {
  console.log(`Starting seeder. Processing batch from offset: ${offset}, limit: ${batchLimit}`);
  
  if (!process.env.OPENAI_API_KEY) {
    console.error("Error: OPENAI_API_KEY is not set.");
    return;
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Error: Supabase URL or Service Role Key is not set.");
    return;
  }
  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    console.error("Error: Spotify Client ID or Secret is not set.");
    return;
  }
   if (!process.env.MUSICBRAINZ_APP_NAME) {
    console.warn("Warning: MUSICBRAINZ_APP_NAME is not set. Using default. Please set it in .env for MusicBrainz API compliance.");
  }


  const token = await getSpotifyToken();
  if (!token) {
    console.error("Failed to get Spotify token. Exiting.");
    return;
  }
  const topArtists = await fetchTopArtistsAR(token);
  if (!topArtists || topArtists.length === 0) {
    console.log("No top artists fetched from Spotify. Exiting.");
    return;
  }

  const batchedArtists = topArtists.slice(offset, offset + batchLimit);
  console.log(`Fetched ${topArtists.length} total artists. Processing ${batchedArtists.length} artists in this batch (offset: ${offset}, limit: ${batchLimit}).`);

  if (batchedArtists.length === 0) {
    console.log("No artists to process in the current batch. This might mean the offset is beyond the total number of artists.");
    return;
  }

  const limiter = pLimit(1); // Process 1 artist at a time to respect MusicBrainz 1 req/sec limit

  await Promise.all(
    batchedArtists.map((artist, idx) =>
      limiter(async () => {
        const overallIndex = offset + idx;
        try {
          console.log(`[${overallIndex}/${topArtists.length -1}] Processing: ${artist.name}`);
          
          /* MusicBrainz lookup */
          const mb = await mbSearchByName(artist.name);
          
          /* Bio GPT */
          const bio = await buildBio(artist.name, artist.genres);

          /* Mirror primera imagen de Spotify */
          const imgUrlToMirror = artist.images?.[0]?.url;
          const mirroredImg = imgUrlToMirror ? await mirrorImage(imgUrlToMirror) : null;

          /* Crear en Prisma (idempotente por nombre) */
          const email = `${artist.name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/gi, '')}@redmusical.example.com`;
          await prisma.musician.upsert({
            where: { email: email },
            create: {
              userId: crypto.randomUUID(), // Consider if this needs to be deterministic or linked to an actual user system
              email: email, // Generate placeholder email
              artisticName: artist.name,
              fullName: mb?.name ?? artist.name, // MB name if available
              city: mb?.['begin-area']?.name ?? mb?.area?.name ?? null, // MB begin_area or area
              province: mb?.area?.name ?? null, // MB area for province
              bio,
              profileImageUrl: mirroredImg,
              musicianOrBand: artist.type.toLowerCase() === 'artist' ? 'Musician' : 'Band', // Normalize type
              genres: { // For explicit M2M, use create for MusicianGenre records
                create: artist.genres.slice(0, 3).map(gName => ({ // Creates MusicianGenre records
                  genre: { // This is the 'genre' field in MusicianGenre model
                    connectOrCreate: {
                      where: { name: gName.toLowerCase() }, // Refers to Genre.name
                      create: { name: gName.toLowerCase() }  // Creates a Genre if not exists
                    }
                  }
                }))
              }
              // spotifyPopularity: artist.popularity, // Removed as not in current schema
              // musicbrainzId: mb?.id ?? null, // Removed as not in current schema
            },
            update: { // What to update if artist already exists
              // Ensure email is also updated if it could change or if the existing one is a placeholder from a previous run with different logic
              email: `${artist.name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/gi, '')}@redmusical.example.com`,
              fullName: mb?.name ?? artist.name,
              city: mb?.['begin-area']?.name ?? mb?.area?.name ?? null,
              province: mb?.area?.name ?? null,
              bio,
              profileImageUrl: mirroredImg,
              musicianOrBand: artist.type.toLowerCase() === 'artist' ? 'Musician' : 'Band',
              genres: { // For explicit M2M, clear and re-create connections
                deleteMany: {}, // Delete existing MusicianGenre records for this musician
                create: artist.genres.slice(0, 3).map(gName => ({ // Re-create MusicianGenre records
                  genre: { // This is the 'genre' field in MusicianGenre model
                    connectOrCreate: {
                      where: { name: gName.toLowerCase() }, // Refers to Genre.name
                      create: { name: gName.toLowerCase() }  // Creates a Genre if not exists
                    }
                  }
                }))
              }
              // spotifyPopularity: artist.popularity, // Removed as not in current schema
              // musicbrainzId: mb?.id ?? null, // Removed as not in current schema
              // lastUpdated: new Date() // Optional: track last update
            }
          });

          console.log(`[${overallIndex}] OK ${artist.name}`);
        } catch (e: any) {
          console.warn(`[${overallIndex}] FAIL ${artist.name}:`, e?.response?.status || e?.message || e);
        }
      })
    )
  );

  console.log(`Batch from offset ${offset} with limit ${batchLimit} processed.`);
}

// This allows running the script directly with command-line arguments for offset and limit
if (require.main === module) {
  const args = process.argv.slice(2); // Get arguments after 'node' and 'script.js'
  const offsetArg = parseInt(args[0], 10);
  const limitArg = parseInt(args[1], 10);

  // Default to offset 0, limit 10 if not provided or invalid
  const offset = !isNaN(offsetArg) && offsetArg >= 0 ? offsetArg : 0;
  const limit = !isNaN(limitArg) && limitArg > 0 ? limitArg : 10; 

  main(offset, limit)
    .catch(e => {
      console.error('Error in main execution:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
      console.log('Prisma client disconnected.');
    });
}
