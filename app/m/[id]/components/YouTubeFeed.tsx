'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, Grid, CardMedia, CardActionArea } from '@mui/material';

interface YouTubeFeedProps {
  channelUrl: string;
  cardBackgroundColor?: string;
  titleColor?: string;
}

interface Video {
  id: string;
  title: string;
  thumbnail: string;
}

const YouTubeFeed: React.FC<YouTubeFeedProps> = ({ channelUrl, cardBackgroundColor, titleColor }) => {
  const [channelId, setChannelId] = useState<string | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChannelData = async () => {
      setLoading(true);
      setError(null);

      try {
        // First, try to get channelId from URL
        let resolvedChannelId = channelUrl.match(/youtube\.com\/channel\/(UC[a-zA-Z0-9_-]{22})/)?.[1];

        if (!resolvedChannelId) {
          // If not a standard URL, call our API route to get the ID
          const idResponse = await fetch(`/api/youtube/get-channel-id?url=${encodeURIComponent(channelUrl)}`);
          const idData = await idResponse.json();
          if (!idResponse.ok || !idData.channelId) {
            throw new Error(idData.error || 'Failed to fetch channel ID');
          }
          resolvedChannelId = idData.channelId;
        }

        if (!resolvedChannelId) {
          throw new Error('Channel ID could not be resolved.');
        }

        setChannelId(resolvedChannelId);

        // Fetch latest videos using the channel ID
        const videosResponse = await fetch(`/api/youtube/latest-videos?channelId=${resolvedChannelId}`);
        const videosData = await videosResponse.json();

        if (!videosResponse.ok) {
          throw new Error(videosData.error || 'Failed to fetch videos');
        }
        setVideos(videosData.videos || []);

      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        console.error('Error fetching YouTube data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (channelUrl) {
      fetchChannelData();
    } else {
      setLoading(false);
    }
  }, [channelUrl]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || videos.length === 0) {
    return (
      <Card elevation={2} sx={{ mb: 3, backgroundColor: cardBackgroundColor }}>
        <CardContent>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 'semibold', color: titleColor, mb: 2 }}>
            YouTube
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error ? 'No se pudo generar el feed de YouTube.' : 'No se encontraron videos recientes.'}
          </Typography>
          {error && (
            <Typography variant="caption" color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" component="h3" sx={{ fontWeight: 'semibold', color: titleColor, mb: 2 }}>
        Últimos Videos en YouTube
      </Typography>
      <Grid container spacing={2}>
        {videos.map((video) => (
          <Grid size={6} key={video.id}>
            <Card elevation={2} sx={{ backgroundColor: cardBackgroundColor }}>
              <CardActionArea
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <CardMedia
                  component="img"
                  image={video.thumbnail}
                  alt={video.title}
                  sx={{ height: 140 }}
                />
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      minHeight: '2.5em' // Approx 2 lines
                    }}
                  >
                    {video.title}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default YouTubeFeed;
