'use client';

import { Suspense } from 'react';
import Search from './components/Search';

export default function SearchDashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Search />
    </Suspense>
  );
}
