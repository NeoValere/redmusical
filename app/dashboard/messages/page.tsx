'use client';

import { Suspense } from 'react';
import Messages from './components/Messages';

export default function MessagesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Messages />
    </Suspense>
  );
}
