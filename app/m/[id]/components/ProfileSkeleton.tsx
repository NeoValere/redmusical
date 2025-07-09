"use client";

import React from 'react';
import { Box, Container, Paper, Skeleton, Stack, Card, CardContent } from '@mui/material';
import { initialTheme } from '@/lib/theme/MuiTheme';

export default function ProfileSkeleton() {
    const theme = initialTheme;
  
    return (
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', p: 2 }}>
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
          <Paper 
            elevation={0} 
            square 
            sx={{ 
              pt: { xs: 2, md: 4 }, pb: { xs: 2, md: 4 },
              px: { xs: 2, md: 3 },
              background: theme.palette.primary.dark,
              transition: 'background-color 0.3s',
            }}
          >
            <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, md: 3 } }}>
                <Skeleton variant="text" width={150} height={40} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
                <Skeleton variant="circular" width={28} height={28} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
              </Box>
              <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'center', md: 'flex-start' }} spacing={{ xs: 1, md: 2 }}>
                <Skeleton variant="circular" sx={{ width: { xs: 120, md: 180 }, height: { xs: 120, md: 180 }, bgcolor: 'rgba(255,255,255,0.3)' }} />
                <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                  <Skeleton variant="text" sx={{ width: { xs: 200, md: 300 }, height: { xs: 40, md: 50 }, bgcolor: 'rgba(255,255,255,0.3)' }} />
                  <Skeleton variant="text" sx={{ width: { xs: 150, md: 200 }, height: 30, bgcolor: 'rgba(255,255,255,0.2)' }} />
                  <Skeleton variant="rectangular" sx={{ width: 80, height: 24, mt: 0.5, borderRadius: '16px', bgcolor: 'rgba(255,255,255,0.2)' }} />
                </Box>
              </Stack>
            </Container>
          </Paper>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
              gap: { xs: 3, md: 4 },
              mt: { xs: 3, md: 4 },
            }}
          >
            <Box>
              {/* Bio Section Skeleton */}
              <Card elevation={2} sx={{ mb: 3, backgroundColor: theme.palette.background.paper }}>
                <CardContent>
                  <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" width="80%" height={20} />
                </CardContent>
              </Card>

              {/* Music Section Skeleton */}
              <Card elevation={2} sx={{ mb: 3, backgroundColor: theme.palette.background.paper }}>
                <CardContent>
                  <Skeleton variant="text" width="30%" height={30} sx={{ mb: 2 }} />
                  <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 1 }} />
                </CardContent>
              </Card>

              {/* ADN Musical Section Skeleton */}
              <Card elevation={2} sx={{ mb: 3, backgroundColor: theme.palette.background.paper }}>
                <CardContent>
                  <Skeleton variant="text" width="50%" height={30} sx={{ mb: 2 }} />
                  <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                    <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: '16px' }} />
                    <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: '16px' }} />
                  </Stack>
                  <Skeleton variant="text" width="30%" height={20} sx={{ mb: 1 }} />
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Skeleton variant="rectangular" width={90} height={24} sx={{ borderRadius: '16px' }} />
                    <Skeleton variant="rectangular" width={70} height={24} sx={{ borderRadius: '16px' }} />
                  </Stack>
                </CardContent>
              </Card>
            </Box>

            <Box>
              {/* Logistics Section Skeleton */}
              <Card elevation={2} sx={{ mb: 3, backgroundColor: theme.palette.background.paper }}>
                <CardContent>
                  <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
                  <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: '16px' }} />
                    <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: '16px' }} />
                  </Stack>
                  <Skeleton variant="text" width="50%" height={20} sx={{ mt: 2, mb: 1 }} />
                  <Skeleton variant="rectangular" width={120} height={24} sx={{ borderRadius: '16px' }} />
                </CardContent>
              </Card>

              {/* Contact Section Skeleton */}
              <Card elevation={2} sx={{ mb: 3, backgroundColor: theme.palette.background.paper }}>
                <CardContent>
                  <Skeleton variant="text" width="30%" height={30} sx={{ mb: 2 }} />
                  <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1.5 }} />
                  <Skeleton variant="text" width="70%" height={20} sx={{ mb: 1.5 }} />
                  <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                    <Skeleton variant="circular" width={28} height={28} />
                    <Skeleton variant="circular" width={28} height={28} />
                    <Skeleton variant="circular" width={28} height={28} />
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Container>
      </Box>
    );
}
