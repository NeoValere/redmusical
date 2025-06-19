'use client';

import Link from 'next/link';
import { Sparkle } from 'phosphor-react';
import { Box, Typography, Paper, Chip, Button, SvgIcon, Link as MuiLink } from '@mui/material';

interface CurrentPlanProps {
  planType?: 'Gratuito' | 'Premium';
  premiumEndDate?: string;
}

export default function CurrentPlan({ planType = 'Gratuito', premiumEndDate }: CurrentPlanProps) {
  const isPremium = planType === 'Premium';

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 'semibold', mb: 2, color: 'text.primary' }}>
        Mi plan actual
      </Typography>

      <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Chip
            label={planType}
            size="small"
            sx={{
              px: 1,
              py: 0.5,
              borderRadius: '9999px',
              fontWeight: 'semibold',
              bgcolor: isPremium ? 'warning.light' : 'primary.light', // Yellow for Premium, Blue for Gratuito
              color: isPremium ? 'warning.dark' : 'primary.dark',
            }}
          />
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          {isPremium
            ? 'Tu perfil está destacado y aparece primero en búsquedas.'
            : 'Tu perfil es visible para todos.'}
        </Typography>

        {isPremium ? (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Tu plan Premium vence el {premiumEndDate || 'XX/XX/XXXX'}.</Typography>
            <Button
              component={Link}
              href="/plans"
              variant="outlined"
              sx={{
                color: 'text.primary',
                borderColor: 'divider',
                '&:hover': { bgcolor: 'action.hover', borderColor: 'text.primary' },
                textTransform: 'none',
              }}
            >
              Gestionar plan
            </Button>
          </>
        ) : (
          <Button
            component={Link}
            href="/plans"
            variant="contained"
            color="primary"
            sx={{ textTransform: 'none' }}
            startIcon={<Sparkle size={24} color="white" />}
          >
            Mejorar mi plan →
          </Button>
        )}
      </Box>
    </Paper>
  );
}
