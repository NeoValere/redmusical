import { NextRequest, NextResponse } from 'next/server';

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
    // Use the Search: list endpoint to find the channel by its custom URL or username
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(vanityName)}&type=channel&key=${API_KEY}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API Error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch channel from YouTube' }, { status: response.status });
    }

    const data = await response.json();

    // The search can return multiple results. We need to find the one that is most likely the correct channel.
    // A good heuristic is to find a channel where the title or custom URL closely matches the query.
    // For vanity URLs starting with '@', the result is usually very accurate.
    if (data.items && data.items.length > 0) {
      // Often, the first result is the correct one for specific queries.
      const channelId = data.items[0].snippet.channelId;
      return NextResponse.json({ channelId });
    } else {
      return NextResponse.json({ error: 'Channel not found for the given URL' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching YouTube channel ID:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
