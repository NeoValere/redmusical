'use client';

import Link from 'next/link';
import { Sparkle, CrownSimple } from 'phosphor-react'; // Added CrownSimple for Premium
import { Box, Typography, Paper, Chip, Button, Stack, useTheme, alpha } from '@mui/material'; // Added Stack, useTheme, alpha

interface CurrentPlanProps {
  planType?: 'Gratuito' | 'Premium'; // Consider making this more robust, e.g., from an enum or DB
  premiumEndDate?: string; // Should ideally be a Date object or ISO string
}

export default function CurrentPlan({ planType = 'Gratuito', premiumEndDate }: CurrentPlanProps) {
  const isPremium = planType === 'Premium';
  const theme = useTheme();

  // Format the date if available
  let formattedEndDate = 'XX/XX/XXXX';
  if (premiumEndDate) {
    try {
      formattedEndDate = new Date(premiumEndDate).toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      // Keep default if date is invalid
    }
  }


  return (
    <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, borderRadius: '12px', bgcolor: 'background.paper' }}>
      <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold', mb: 2.5, color: 'text.primary' }}>
        Mi Plan Actual
      </Typography>

      <Box
        sx={{
          border: `1px solid ${isPremium ? theme.palette.primary.main : theme.palette.divider}`,
          borderRadius: '8px',
          p: { xs: 2, sm: 2.5 },
          bgcolor: isPremium ? alpha(theme.palette.primary.main, 0.05) : 'transparent', // Subtle bg for premium
        }}
      >
        <Stack direction={{xs: 'column', sm: 'row'}} justifyContent="space-between" alignItems={{xs: 'flex-start', sm: 'center'}} spacing={{xs:1, sm:2}} mb={2}>
          <Chip
            icon={isPremium ? <CrownSimple weight="fill" size={18} /> : undefined}
            label={planType}
            size="medium"
            sx={{
              fontWeight: 'bold',
              bgcolor: isPremium ? theme.palette.primary.main : theme.palette.secondary.main,
              color: isPremium ? theme.palette.primary.contrastText : theme.palette.secondary.contrastText,
              px: 1.5,
              py: 0.5,
              borderRadius: '6px',
            }}
          />
          {isPremium && premiumEndDate && (
            <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 'medium' }}>
              Vence el: {formattedEndDate}
            </Typography>
          )}
        </Stack>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 2.5, minHeight: '40px' /* to prevent layout shift */ }}>
          {isPremium
            ? '¡Disfrutá de todos los beneficios Premium! Tu perfil está destacado, aparece primero en búsquedas y tenés acceso a funciones exclusivas.'
            : 'Estás en el plan Gratuito. Tu perfil es visible y podés recibir propuestas. ¡Considerá Premium para más alcance!'}
        </Typography>

        {isPremium ? (
          <Button
            component={Link}
            href="/plans" // Assuming /plans is the page to manage/renew
            variant="outlined"
            color="primary" // Use primary color for consistency
            sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
          >
            Gestionar mi suscripción
          </Button>
        ) : (
          <Button
            component={Link}
            href="/plans"
            variant="contained"
            color="primary" // Gold color from theme
            sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
            startIcon={<Sparkle size={20} weight="fill" />}
          >
            Pasar a Premium
          </Button>
        )}
      </Box>
    </Paper>
  );
}
