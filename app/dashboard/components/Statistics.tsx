'use client';

import { Eye, Users, Target } from 'phosphor-react'; // Removed TrendUp
import { Box, Typography, Paper, Stack, useTheme, alpha } from '@mui/material'; // Re-added useTheme

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description?: string;
  trend?: 'up' | 'down' | 'neutral'; // Optional trend indicator
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description }) => {
  const theme = useTheme();
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%', // Ensure cards in a row have same height
        bgcolor: alpha(theme.palette.background.paper, 0.7), // Slightly more transparent paper
        borderColor: theme.palette.divider,
        borderRadius: '8px', // Slightly less rounded than main paper for differentiation
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box sx={{ color: theme.palette.primary.main, mt: 0.5 }}>{icon}</Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            {value}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            {title}
          </Typography>
        </Box>
      </Stack>
      {description && (
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
      )}
    </Paper>
  );
};

export default function Statistics() {
  const statsData: StatCardProps[] = [
    {
      title: 'Visitas al Perfil (Últimos 30 días)',
      value: 'N/A',
      icon: <Eye size={32} />,
      description: 'Número total de veces que tu perfil ha sido visto.',
    },
    {
      title: 'Apariciones en Búsqueda',
      value: 'N/A',
      icon: <Users size={32} />,
      description: 'Cuántas veces apareciste en resultados de búsqueda.',
    },
    {
      title: 'Clics en Contacto',
      value: 'N/A',
      icon: <Target size={32} />,
      description: 'Veces que hicieron clic en tus datos de contacto o redes.',
    },
    // {
    //   title: 'Tasa de Interacción',
    //   value: 'N/A',
    //   icon: <TrendUp size={32} />,
    //   description: 'Interacciones vs. Visitas.',
    // },
  ];

  return (
    <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: '12px', bgcolor: 'background.paper' }}>
      <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 2.5, color: 'text.primary' }}>
        Estadísticas de tu Perfil
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr', // 1 column on extra-small screens
            sm: 'repeat(2, 1fr)', // 2 columns on small screens
            md: 'repeat(3, 1fr)', // 3 columns on medium screens
          },
          gap: 2.5, // Gap between cards
        }}
      >
        {statsData.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 3 }}>
        Las estadísticas detalladas estarán disponibles próximamente.
      </Typography>
    </Paper>
  );
}
