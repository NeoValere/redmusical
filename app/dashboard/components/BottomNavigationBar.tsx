'use client';

import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { User, MusicNotesSimple, ChartBar, Eye, CreditCard } from 'phosphor-react';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';

interface BottomNavigationBarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  musicianId?: string | null;
}

const navItems = [
  { id: 'mi-perfil', label: 'Perfil', icon: <User size={26} /> },
  { id: 'quick-edit', label: 'Editar', icon: <MusicNotesSimple size={26} /> },
  { id: 'estadisticas', label: 'Datos', icon: <ChartBar size={26} /> },
  { id: 'visibilidad', label: 'Visibilidad', icon: <Eye size={26} /> },
  { id: 'mi-plan', label: 'Plan', icon: <CreditCard size={26} /> },
];

export default function BottomNavigationBar({ activeView, setActiveView, musicianId }: BottomNavigationBarProps) {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: theme.zIndex.appBar, // Ensure it's above content
        borderTop: `1px solid ${theme.palette.divider}`,
        // backgroundColor: theme.palette.background.paper, // Or specific color
      }} 
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={activeView}
        onChange={(event, newValue) => {
          if (newValue === 'quick-edit' && musicianId) {
            router.push(`/musicians/${musicianId}/edit`);
          } else {
            setActiveView(newValue);
          }
        }}
        sx={{
          backgroundColor: theme.palette.background.paper, // Match theme
          '& .MuiBottomNavigationAction-root': {
            color: theme.palette.text.secondary, // Default icon/label color
            '&.Mui-selected': {
              color: theme.palette.primary.main, // Selected icon/label color
            },
          },
        }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction 
            key={item.id} 
            label={item.label} 
            value={item.id} 
            icon={item.icon} 
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
