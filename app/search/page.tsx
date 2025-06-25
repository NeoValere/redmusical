'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Slider,
} from '@mui/material';
import { Favorite, Message } from '@mui/icons-material';
import Link from 'next/link';
import { SelectChangeEvent } from '@mui/material';

interface Musician {
  id: string;
  name: string;
  instruments: string[];
  city: string;
  price: number;
  experience: string;
  image: string;
}

// Mock data for musicians - replace with API call
const mockMusicians: Musician[] = [
  {
    id: '1',
    name: 'Carlos Rock',
    instruments: ['Guitarra', 'Bajo'],
    city: 'Buenos Aires',
    price: 50,
    experience: 'Profesional',
    image: 'https://source.unsplash.com/random/300x300?musician,1',
  },
  {
    id: '2',
    name: 'Jazz Fusion Trio',
    instruments: ['Piano', 'Batería', 'Contrabajo'],
    city: 'Rosario',
    price: 120,
    experience: 'Intermedio',
    image: 'https://source.unsplash.com/random/300x300?band,1',
  },
  {
    id: '3',
    name: 'Ana Folk',
    instruments: ['Voz', 'Guitarra Acústica'],
    city: 'Córdoba',
    price: 70,
    experience: 'Profesional',
    image: 'https://source.unsplash.com/random/300x300?musician,2',
  },
];

// Mock data for filters
const mockInstruments = ['Guitarra', 'Bajo', 'Piano', 'Batería', 'Voz'];
const mockGenres = ['Rock', 'Jazz', 'Folk', 'Pop', 'Clásica'];
const mockProvinces = ['Buenos Aires', 'Córdoba', 'Santa Fe', 'Mendoza'];
const experienceLevels = ['Principiante', 'Intermedio', 'Profesional'];

export default function SearchPage() {
  const [musicians, setMusicians] = useState<Musician[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    query: '',
    instrument: '',
    genre: '',
    province: '',
    priceRange: [0, 500],
    experience: '',
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setMusicians(mockMusicians);
      setLoading(false);
    }, 1000);
  }, []);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name as string]: value }));
  };

  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    setFilters((prev) => ({ ...prev, priceRange: newValue as number[] }));
  };

  const handleSearch = () => {
    // Here you would typically make an API call with the filters
    console.log('Searching with filters:', filters);
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
        Buscador de Músicos
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Buscar por nombre, instrumento, ciudad, etc."
            name="query"
            value={filters.query}
            onChange={handleFilterChange}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Instrumento</InputLabel>
            <Select name="instrument" value={filters.instrument} label="Instrumento" onChange={handleFilterChange}>
              <MenuItem value="">Cualquiera</MenuItem>
              {mockInstruments.map((inst) => (
                <MenuItem key={inst} value={inst}>{inst}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Género</InputLabel>
            <Select name="genre" value={filters.genre} label="Género" onChange={handleFilterChange}>
              <MenuItem value="">Cualquiera</MenuItem>
              {mockGenres.map((genre) => (
                <MenuItem key={genre} value={genre}>{genre}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Provincia</InputLabel>
            <Select name="province" value={filters.province} label="Provincia" onChange={handleFilterChange}>
              <MenuItem value="">Cualquiera</MenuItem>
              {mockProvinces.map((prov) => (
                <MenuItem key={prov} value={prov}>{prov}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Nivel de Experiencia</InputLabel>
            <Select name="experience" value={filters.experience} label="Nivel de Experiencia" onChange={handleFilterChange}>
              <MenuItem value="">Cualquiera</MenuItem>
              {experienceLevels.map((level) => (
                <MenuItem key={level} value={level}>{level}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography gutterBottom>Rango de Precio por Hora (${filters.priceRange[0]} - ${filters.priceRange[1]})</Typography>
          <Slider
            value={filters.priceRange}
            onChange={handlePriceChange}
            valueLabelDisplay="auto"
            min={0}
            max={500}
            step={10}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Button variant="contained" color="primary" onClick={handleSearch}>
            Buscar
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {musicians.map((musician) => (
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
                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                  ${musician.price}/hr
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button variant="outlined" size="small" startIcon={<Favorite />}>
                    Favorito
                  </Button>
                  <Button variant="contained" size="small" startIcon={<Message />}>
                    Mensaje
                  </Button>
                  <Link href={`/m/${musician.id}`} passHref>
                    <Button size="small">Ver más</Button>
                  </Link>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
