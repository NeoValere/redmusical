import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const channelUrl = searchParams.get('url');

  if (!channelUrl) {
    return NextResponse.json({ error: 'Channel URL is required' }, { status: 400 });
  }

  const API_KEY = process.env.YOUTUBE_API_KEY;
  if (!API_KEY) {
    return NextResponse.json({ error: 'YouTube API key is not configured' }, { status: 500 });
  }

  // Extract username/custom URL from the provided URL
  const match = channelUrl.match(/youtube\.com\/(?:c\/|user\/|@)?([^/]+)/);
  const vanityName = match?.[1];

  if (!vanityName) {
    return NextResponse.json({ error: 'Could not parse username or custom URL from the provided link.' }, { status: 400 });
  }

  try {
    // Check cache first
    const cachedChannel = await prisma.youtubeChannelCache.findUnique({
      where: { vanityName },
    });

    if (cachedChannel) {
      return NextResponse.json({ channelId: cachedChannel.channelId });
    }

    // If not in cache, fetch from YouTube API
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(vanityName)}&type=channel&key=${API_KEY}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API Error:', errorData);
      // Do not cache failed requests to avoid storing incorrect data
      return NextResponse.json({ error: 'Failed to fetch channel from YouTube' }, { status: response.status });
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const channelId = data.items[0].snippet.channelId;

      // Save to cache
      await prisma.youtubeChannelCache.create({
        data: {
          vanityName,
          channelId,
        },
      });

      return NextResponse.json({ channelId });
    } else {
      return NextResponse.json({ error: 'Channel not found for the given URL' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching YouTube channel ID:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
