'use client';

import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Home, Search, Favorite, Message } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

interface BottomSearchNavigationBarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export default function BottomSearchNavigationBar({ activeView, setActiveView }: BottomSearchNavigationBarProps) {
  const theme = useTheme();
  const router = useRouter();

  const navItems = useMemo(() => [
    { id: 'inicio', label: 'Inicio', icon: <Home />, href: '/dashboard/search' },
    { id: 'explorar', label: 'Explorar', icon: <Search />, href: '/dashboard/musicos' },
    { id: 'favoritos', label: 'Favoritos', icon: <Favorite />, href: '/dashboard/favorites' },
    { id: 'mensajes', label: 'Mensajes', icon: <Message />, href: '/dashboard/messages' },
  ], []); // Empty dependency array means it's created once

  const backgroundColor = useMemo(() => {
    return navItems.some(item => item.id === activeView) ? theme.palette.primary.main : theme.palette.background.paper;
  }, [activeView, theme.palette.primary.main, theme.palette.background.paper, navItems]);

  const paperSx = useMemo(() => ({
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    borderTop: `1px solid ${theme.palette.divider}`,
    backgroundColor: backgroundColor,
  }), [backgroundColor, theme.palette.divider]);

  const bottomNavigationSx = useMemo(() => ({
    backgroundColor: theme.palette.background.paper,
    '& .MuiBottomNavigationAction-root': {
      color: theme.palette.text.secondary,
      '&.Mui-selected': {
        color: theme.palette.primary.main,
      },
    },
  }), [theme.palette.background.paper, theme.palette.text.secondary, theme.palette.primary.main]);

  return (
    <Paper sx={paperSx} elevation={3}>
      <BottomNavigation
        showLabels
        value={activeView}
        sx={bottomNavigationSx}
        onChange={(event, newValue) => {
          const selected = navItems.find(item => item.id === newValue);
          if (selected) {
            setActiveView(newValue);
            router.push(selected.href);
          }
        }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction key={item.id} label={item.label} value={item.id} icon={item.icon} />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
