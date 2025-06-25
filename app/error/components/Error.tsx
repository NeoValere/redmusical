'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link'; // Import Link

export default function Error() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('An unexpected error occurred.');

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setErrorMessage(message);
    }
  }, [searchParams]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Error</h1>
      <p>{errorMessage}</p>
      <p>Probá de nuevo o contactá a soporte si el error persiste.</p>
      <Link href="/">Ir al home</Link>
    </div>
  );
}
