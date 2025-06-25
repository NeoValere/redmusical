'use client';

import { Suspense } from 'react';
import Musicians from './components/Musicians';

export default function MusiciansPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Musicians />
    </Suspense>
  );
}
