'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { MusicNotes, Headphones, Users } from 'phosphor-react';
import Image from 'next/image';

export default function SelectRolePage() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasMusicianProfile, setHasMusicianProfile] = useState(false); // New state
  const [hasContractorProfile, setHasContractorProfile] = useState(false); // New state
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkUserAndProfiles = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Check if both profiles already exist for this user
      const [musicianProfileRes, contractorProfileRes] = await Promise.all([
        fetch(`/api/register-profile?userId=${user.id}&role=musician`),
        fetch(`/api/register-profile?userId=${user.id}&role=contractor`)
      ]);

      const musicianData = await musicianProfileRes.json();
      const contractorData = await contractorProfileRes.json();

      setHasMusicianProfile(musicianData.exists);
      setHasContractorProfile(contractorData.exists);

      if (musicianData.exists && contractorData.exists) {
        // If both profiles exist, redirect to dashboard
        router.push('/dashboard');
      }
    };
    checkUserAndProfiles();
  }, [router, supabase]);

  const getWelcomeMessage = () => {
    if (hasMusicianProfile && !hasContractorProfile) {
      return 'Ya tenés un perfil de músico. ¿Querés crear también un perfil de contratante?';
    }
    if (!hasMusicianProfile && hasContractorProfile) {
      return 'Ya tenés un perfil de contratante. ¿Querés crear también un perfil de músico?';
    }
    return 'Para empezar, contanos, ¿qué rol vas a cumplir en redmusical.ar?';
  };

  const handleRoleSelection = async (role: string) => {
    setSelectedRole(role);
    setIsLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('No se encontró el usuario. Por favor, intentá iniciar sesión de nuevo.');
        setIsLoading(false);
        return;
      }

      const userFullName = user.user_metadata.full_name || user.email || 'Unknown User';
      const userEmail = user.email;

      const createProfile = async (profileRole: string) => {
        const response = await fetch('/api/register-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            fullName: userFullName,
            email: userEmail,
            role: profileRole,
          }),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || `Error al crear el perfil de ${profileRole}.`);
        }
        return response.json();
      };

      if (role === 'both') {
        // Create both profiles
        await Promise.all([
          createProfile('musician'),
          createProfile('contractor')
        ]);

        router.push('/dashboard'); // Redirect to a general dashboard for 'both'
      } else {
        // Create single profile
        const result = await createProfile(role);
        const { redirectUrl } = result; // Get redirectUrl from the API response

        // Redirect based on selected role
        router.push(redirectUrl || '/dashboard'); // Use redirectUrl from API, fallback to /dashboard
      }

    } catch (err: any) {
      console.error('Unexpected error during role selection:', err);
      setError(err.message || 'Ocurrió un error inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <Image src="/next.svg" alt="redmusical.ar Logo" width={150} height={40} />
        </div>
        <h1 className="text-3xl font-bold mb-4 text-gray-800">¡Hola!</h1>
        <p className="text-gray-600 mb-8">{getWelcomeMessage()}</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {!hasMusicianProfile && (
            <button
              className={`flex items-center justify-center px-6 py-3 rounded-md font-semibold transition-all duration-300 ${
                selectedRole === 'musician'
                  ? 'bg-red-700 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleRoleSelection('musician')}
              disabled={isLoading}
            >
              <MusicNotes size={20} className="mr-2" /> Soy músico
            </button>
          )}
          {!hasContractorProfile && (
            <button
              className={`flex items-center justify-center px-6 py-3 rounded-md font-semibold transition-all duration-300 ${
                selectedRole === 'contractor'
                  ? 'bg-red-700 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleRoleSelection('contractor')}
              disabled={isLoading}
            >
              <Headphones size={20} className="mr-2" /> Soy contratante
            </button>
          )}
          {(!hasMusicianProfile && !hasContractorProfile) && ( // Only show 'both' if neither profile exists
            <button
              className={`flex items-center justify-center px-6 py-3 rounded-md font-semibold transition-all duration-300 ${
                selectedRole === 'both'
                  ? 'bg-red-700 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => handleRoleSelection('both')}
              disabled={isLoading}
            >
              <Users size={20} className="mr-2" /> Soy ambos
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
