'use client';

import RegisterCard from './components/RegisterCard';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col py-12 px-4 sm:px-6 lg:px-8" style={{
      backgroundImage: 'url(/images/musicians-bw.png)', // Assuming this is the background image
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backdropFilter: 'blur(10px)', // Apply blur to the background
    }}>
      <RegisterCard />
    </div>
  );
}
