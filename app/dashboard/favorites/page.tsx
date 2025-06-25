'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { Delete, Message, Person } from '@mui/icons-material';
import Link from 'next/link';

interface FavoriteMusician {
  id: string;
  name: string;
  instruments: string[];
  city: string;
  image: string;
}

// Mock data for favorite musicians
const mockFavorites: FavoriteMusician[] = [
  {
    id: '1',
    name: 'Carlos Rock',
    instruments: ['Guitarra', 'Bajo'],
    city: 'Buenos Aires',
    image: 'https://source.unsplash.com/random/300x300?musician,1',
  },
  {
    id: '3',
    name: 'Ana Folk',
    instruments: ['Voz', 'Guitarra Acústica'],
    city: 'Córdoba',
    image: 'https://source.unsplash.com/random/300x300?musician,2',
  },
];

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteMusician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch favorites
    setTimeout(() => {
      setFavorites(mockFavorites);
      setLoading(false);
    }, 1000);
  }, []);

  const handleRemoveFavorite = (id: string) => {
    // Here you would typically make an API call to remove the favorite
    console.log('Removing favorite:', id);
    setFavorites((prev) => prev.filter((fav) => fav.id !== id));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Mis Músicos Favoritos
      </Typography>
      {favorites.length === 0 ? (
        <Typography>No tenés músicos guardados en favoritos.</Typography>
      ) : (
        <Grid container spacing={4}>
          {favorites.map((musician) => (
            <Grid key={musician.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={musician.image}
                  alt={musician.name}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {musician.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {musician.instruments.join(', ')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {musician.city}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Link href={`/m/${musician.id}`} passHref>
                        <Button size="small" startIcon={<Person />}>
                          Ver Perfil
                        </Button>
                      </Link>
                      <Link href={`/messages/${musician.id}`} passHref>
                        <Button size="small" startIcon={<Message />}>
                          Mensaje
                        </Button>
                      </Link>
                    </div>
                    <IconButton onClick={() => handleRemoveFavorite(musician.id)} color="error">
                      <Delete />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
