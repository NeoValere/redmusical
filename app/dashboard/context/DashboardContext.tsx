'use client';

import { createContext, useContext, Dispatch, SetStateAction } from 'react';
import { Musician } from '@prisma/client';

interface DashboardContextType {
  activeView: string;
  setActiveView: Dispatch<SetStateAction<string>>;
  pageTitle: string;
  setPageTitle: Dispatch<SetStateAction<string>>;
  userId: string | null;
  musicianProfile: Musician | null;
}

export const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
