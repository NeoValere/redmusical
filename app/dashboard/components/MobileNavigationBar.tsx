'use client';

import BottomNavigationBar from './BottomNavigationBar';
import BottomSearchNavigationBar from '../search/components/BottomSearchNavigationBar';

import { Musician } from '@prisma/client'; // Import Musician type

interface MobileNavigationBarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  activeRole: string | null;
  musicianProfile: Musician | null; // Replaced any with Musician | null
}

export default function MobileNavigationBar({ activeView, setActiveView, activeRole, musicianProfile }: MobileNavigationBarProps) {
  return (
    <>
      {activeRole === 'contractor' ? (
        <BottomSearchNavigationBar activeView={activeView} setActiveView={setActiveView} />
      ) : (
        <BottomNavigationBar activeView={activeView} setActiveView={setActiveView} musicianId={musicianProfile?.userId} />
      )}
    </>
  );
}
