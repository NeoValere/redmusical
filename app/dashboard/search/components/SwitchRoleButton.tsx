'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@mui/material';
import { MusicNotesSimple, PlusCircle } from 'phosphor-react';

interface SwitchRoleButtonProps {
  userId: string | null;
  userEmail: string | null;
  userFullName: string | null;
  hasMusicianProfile: boolean;
}

export default function SwitchRoleButton({ userId, userEmail, userFullName, hasMusicianProfile }: SwitchRoleButtonProps) {
  const router = useRouter();

  const handleSwitchToMusician = async () => {
    if (!userId) return;

    try {
      const response = await fetch('/api/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newRole: 'musician' }),
      });

      if (response.ok) {
        const { redirectUrl } = await response.json();
        router.push(redirectUrl);
        router.refresh();
      } else {
        const errorData = await response.json();
        console.error('Error switching role:', errorData);
        alert(`Error al cambiar de rol: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Network or unexpected error during role switch:', error);
      alert('Ocurrió un error al intentar cambiar de rol.');
    }
  };

  const handleCreateMusicianProfile = async () => {
    if (!userId || !userEmail || !userFullName) return;

    try {
      const response = await fetch('/api/register-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          fullName: userFullName,
          email: userEmail,
          role: 'musician',
        }),
      });

      if (response.ok) {
        const { redirectUrl } = await response.json(); // Assuming register-profile also returns redirectUrl
        router.push(redirectUrl || '/dashboard'); // Redirect to musician dashboard after creation
        router.refresh();
      } else {
        const errorData = await response.json();
        console.error('Error creating musician profile:', errorData);
        alert(`Error al crear perfil de músico: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Network or unexpected error:', error);
      alert('Ocurrió un error al intentar crear el perfil de músico.');
    }
  };

  return (
    <Button
      onClick={hasMusicianProfile ? handleSwitchToMusician : handleCreateMusicianProfile}
      fullWidth
      sx={{
        justifyContent: 'flex-start',
        mb: 1,
        py: 1,
        px: 1.5,
        color: 'text.primary',
        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.08)' },
      }}
      startIcon={hasMusicianProfile ? <MusicNotesSimple size={24} /> : <PlusCircle size={24} />}
    >
      {hasMusicianProfile ? 'Ir a mi perfil de músico' : 'Crear perfil de músico'}
    </Button>
  );
}
