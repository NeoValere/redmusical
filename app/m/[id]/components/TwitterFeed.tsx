'use client';

import React, { useEffect, useState } from 'react';
import { Typography, CircularProgress, Box } from '@mui/material';
import { Tweet } from 'react-tweet';

interface TwitterFeedProps {
  twitterUrl: string;
}

const getTwitterUsername = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/);
  return match ? match[1] : null;
};

const TwitterFeed: React.FC<TwitterFeedProps> = ({ twitterUrl }) => {
  const username = getTwitterUsername(twitterUrl);
  const [tweetIds, setTweetIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username) {
      setError('No se pudo extraer el nombre de usuario de X (Twitter). Asegúrate de que el enlace sea a un perfil de X (ej: twitter.com/usuario).');
      setLoading(false);
      return;
    }

    const fetchTweets = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/twitter/latest-tweets?username=${username}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch tweets');
        }
        const data = await response.json();
        setTweetIds(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTweets();
  }, [username]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ p: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography variant="body2" color="error" sx={{ p: 2 }}>
        {error}
      </Typography>
    );
  }

  if (tweetIds.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
        No hay tweets para mostrar.
      </Typography>
    );
  }

  return (
    <Box>
      {tweetIds.map((id) => (
        <Tweet key={id} id={id} />
      ))}
    </Box>
  );
};

export default TwitterFeed;
