'use client';

import { useTheme, Box, Typography, Grid, Card, CardContent, Button, alpha } from '@mui/material';
import { useDashboard } from '../../context/DashboardContext';
import { useEffect } from 'react';
import ContractorProfile from './ContractorProfile';

export default function Search() {
  const theme = useTheme();
  const { setPageTitle } = useDashboard();

  useEffect(() => {
    setPageTitle('Inicio');
  }, [setPageTitle]);

  return (
    <Box
      component="section"
      id="inicio-section"
      sx={{
        mb: 4,
      }}
    >
      <ContractorProfile />
    </Box>
  );
}
