import { NextResponse } from 'next/server';

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  // Check cache first
  const cachedEntry = cache.get(username);
  if (cachedEntry && (Date.now() - cachedEntry.timestamp < CACHE_DURATION_MS)) {
    return NextResponse.json(cachedEntry.data);
  }

  const bearerToken = process.env.TWITTER_BEARER_TOKEN;

  if (!bearerToken) {
    return NextResponse.json({ error: 'Twitter bearer token not configured' }, { status: 500 });
  }

  try {
    // First, get the user ID from the username
    const userResponse = await fetch(`https://api.twitter.com/2/users/by/username/${username}`, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      console.error('Twitter API error (user lookup):', errorData);
      return NextResponse.json({ error: `Failed to fetch user from Twitter API: ${errorData.title || 'Unknown Error'}`, details: errorData.detail }, { status: userResponse.status });
    }

    const userData = await userResponse.json();
    const userId = userData.data.id;

    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Then, get the tweets for that user ID
    const tweetsResponse = await fetch(`https://api.twitter.com/2/users/${userId}/tweets?max_results=3&tweet.fields=created_at,public_metrics`, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    });

    if (!tweetsResponse.ok) {
      const errorData = await tweetsResponse.json();
      console.error('Twitter API error (tweets lookup):', errorData);
      return NextResponse.json({ error: `Failed to fetch tweets from Twitter API: ${errorData.title || 'Unknown Error'}`, details: errorData.detail }, { status: tweetsResponse.status });
    }

    const tweetsData = await tweetsResponse.json();
    const tweetIds = tweetsData.data ? tweetsData.data.map((tweet: any) => tweet.id) : [];

    // Store in cache
    cache.set(username, { data: tweetIds, timestamp: Date.now() });

    return NextResponse.json(tweetIds);
  } catch (error) {
    console.error('Error fetching from Twitter API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
