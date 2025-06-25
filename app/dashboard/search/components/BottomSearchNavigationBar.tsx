'use client';

import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { Home, Search, Favorite, Message } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface BottomSearchNavigationBarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export default function BottomSearchNavigationBar({ activeView, setActiveView }: BottomSearchNavigationBarProps) {
  const router = useRouter();

  const navItems = [
    { id: 'inicio', label: 'Inicio', icon: <Home />, href: '/dashboard/search' },
    { id: 'explorar', label: 'Explorar', icon: <Search />, href: '/dashboard/musicos' },
    { id: 'favoritos', label: 'Favoritos', icon: <Favorite />, href: '/dashboard/favorites' },
    { id: 'mensajes', label: 'Mensajes', icon: <Message />, href: '/dashboard/messages' },
  ];

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
      <BottomNavigation
        showLabels
        value={activeView}
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
