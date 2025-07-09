import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get('channelId');

  if (!channelId) {
    return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 });
  }

  const API_KEY = process.env.YOUTUBE_API_KEY;
  if (!API_KEY) {
    return NextResponse.json({ error: 'YouTube API key is not configured' }, { status: 500 });
  }

  try {
    // The playlist ID for a channel's uploads is the channel ID with "UU" replacing the first two letters ("UC").
    const uploadPlaylistId = 'UU' + channelId.substring(2);

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadPlaylistId}&maxResults=4&key=${API_KEY}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('YouTube API Error:', errorData);
      return NextResponse.json({ error: 'Failed to fetch videos from YouTube' }, { status: response.status });
    }

    const data = await response.json();
    const videos = data.items.map((item: any) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
    }));

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Error fetching latest videos:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
