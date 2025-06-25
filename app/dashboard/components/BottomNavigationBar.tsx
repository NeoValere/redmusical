'use client';

import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { User, ChartBar, Eye, CreditCard } from 'phosphor-react'; // Removed MusicNotesSimple
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

interface BottomNavigationBarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  musicianId?: string | null;
}

const navItems = [
  { id: 'mi-perfil', label: 'Perfil', icon: <User size={26} /> },
  { id: 'estadisticas', label: 'Datos', icon: <ChartBar size={26} /> },
  { id: 'visibilidad', label: 'Visibilidad', icon: <Eye size={26} /> },
  { id: 'mi-plan', label: 'Plan', icon: <CreditCard size={26} /> }
];

export default function BottomNavigationBar({ activeView, setActiveView, musicianId }: BottomNavigationBarProps) {
  const theme = useTheme();
  const router = useRouter();

  const backgroundColor = useMemo(() => {
    return navItems.some(item => item.id === activeView) ? theme.palette.primary.main : theme.palette.background.paper;
  }, [activeView, theme.palette.primary.main, theme.palette.background.paper]); // Removed navItems from dependency array

  const paperSx = useMemo(() => ({
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: theme.zIndex.appBar, // Ensure it's above content
    borderTop: `1px solid ${theme.palette.divider}`,
    backgroundColor: backgroundColor, // Use primary color when active
  }), [backgroundColor, theme.palette.divider, theme.zIndex.appBar]);

  const bottomNavigationSx = useMemo(() => ({
    backgroundColor: theme.palette.background.paper, // Match theme
    '& .MuiBottomNavigationAction-root': {
      color: theme.palette.text.secondary, // Default icon/label color
      '&.Mui-selected': {
        color: theme.palette.primary.main, // Selected icon/label color
      },
    },
  }), [theme.palette.background.paper, theme.palette.text.secondary, theme.palette.primary.main]);

  return (
    <Paper
      sx={paperSx}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={activeView}
        onChange={(event, newValue) => {
          if (newValue === 'quick-edit' && musicianId) {
            router.push(`/m/${musicianId}/edit`);
          } else {
            setActiveView(newValue);
          }
        }}
        sx={bottomNavigationSx}
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
