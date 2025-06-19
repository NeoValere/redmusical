'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ErrorPage() {
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
      <p>Please try again or contact support if the issue persists.</p>
      <a href="/">Go to Home</a>
    </div>
  );
}
