'use client';

import BottomNavigationBar from './BottomNavigationBar';
import BottomSearchNavigationBar from '../search/components/BottomSearchNavigationBar';

interface MobileNavigationBarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  activeRole: string | null;
  musicianProfile: any; // Replace with actual type
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
