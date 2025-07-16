'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OrganizationSelector } from './OrganizationSelector';
import { PlayerSelector } from './PlayerSelector';
import { TeamSelector } from './TeamSelector';
import { ObservationInputCard } from './ObservationInputCard';

type Step = 'orgSelect' | 'teamSelect' | 'playerSelect' | 'observationInput';

export function ObservationStepper() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState<Step>('orgSelect');
  const [teamId, setTeamId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);

  useEffect(() => {
    // Get the current user from the API
    const fetchUser = async () => {
      try {
        console.log('Fetching user data...');
        const response = await fetch('/api/user');
        console.log('Response status:', response.status);
        if (response.ok) {
          const userData = await response.json();
          console.log('User data received:', userData);
          setUser(userData);
        } else {
          console.log('Response not ok, redirecting to sign-in');
          // Redirect to login if not authenticated
          router.push('/sign-in');
          return;
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        router.push('/sign-in');
        return;
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    console.log('useEffect triggered with user:', user);
    if (!user) {
      console.log('No user, returning early');
      return;
    }

    console.log('Setting up user role logic:', user.personType);

    // Set initial state based on user role
    if (user.personType === 'superadmin') {
      console.log('User is superadmin, starting with org selection');
      setStep('orgSelect');
    } else if (user.personType === 'admin') {
      console.log('User is org admin, starting with team selection');
      setStep('teamSelect');
    } else if (user.personType === 'coach') {
      console.log('User is coach, starting with player selection');
      setStep('playerSelect');
    } else {
      console.log('User is other role, starting with player selection');
      setStep('playerSelect');
    }
  }, [user]);

  const handleSubmit = async (note: string) => {
    if (!user) return;

    try {
      const response = await fetch('/api/observations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: 'individual',
          observation_text: note,
          player_id: playerId,
          team_id: teamId,
          created_by: user.id,
        }),
      });

      if (response.ok) {
        // Redirect back to observations page
        router.push('/observations');
      } else {
        console.error('Failed to submit observation');
      }
    } catch (error) {
      console.error('Error submitting observation:', error);
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-white">Loading...</div>;
  }

  if (!user) {
    return <div className="p-4 text-center text-white">Not authenticated</div>;
  }

  // Superadmin flow: Org → Team → Player → Observation
  if (user.personType === 'superadmin') {
    if (step === 'orgSelect') {
      return (
        <OrganizationSelector
          onSelect={() => {
            setStep('teamSelect');
          }}
        />
      );
    }

    if (step === 'teamSelect') {
      return (
        <TeamSelector
          onSelect={selectedTeamId => {
            setTeamId(selectedTeamId);
            setStep('playerSelect');
          }}
        />
      );
    }

    if (step === 'playerSelect') {
      return (
        <PlayerSelector
          teamId={teamId || undefined}
          onSelect={(selectedPlayerId, selectedPlayerName) => {
            setPlayerId(selectedPlayerId);
            setPlayerName(selectedPlayerName);
            setStep('observationInput');
          }}
        />
      );
    }

    if (step === 'observationInput') {
      return (
        <ObservationInputCard
          title="Player Observation"
          placeholder="Write your observation here..."
          onSubmit={handleSubmit}
          playerName={playerName}
        />
      );
    }
  }

  // Org Admin flow: Team → Player → Observation
  if (user.personType === 'admin') {
    if (step === 'teamSelect') {
      return (
        <TeamSelector
          onSelect={selectedTeamId => {
            setTeamId(selectedTeamId);
            setStep('playerSelect');
          }}
        />
      );
    }

    if (step === 'playerSelect') {
      return (
        <PlayerSelector
          teamId={teamId || undefined}
          onSelect={(selectedPlayerId, selectedPlayerName) => {
            setPlayerId(selectedPlayerId);
            setPlayerName(selectedPlayerName);
            setStep('observationInput');
          }}
        />
      );
    }

    if (step === 'observationInput') {
      return (
        <ObservationInputCard
          title="Player Observation"
          placeholder="Write your observation here..."
          onSubmit={handleSubmit}
          playerName={playerName}
        />
      );
    }
  }

  // Coach flow: Player → Observation
  if (user.personType === 'coach') {
    if (step === 'playerSelect') {
      return (
        <PlayerSelector
          teamId={null} // Coaches can see all players
          onSelect={(selectedPlayerId, selectedPlayerName) => {
            setPlayerId(selectedPlayerId);
            setPlayerName(selectedPlayerName);
            setStep('observationInput');
          }}
        />
      );
    }

    if (step === 'observationInput') {
      return (
        <ObservationInputCard
          title="Player Observation"
          placeholder="Write your observation here..."
          onSubmit={handleSubmit}
          playerName={playerName}
        />
      );
    }
  }

  // Fallback for unexpected states
  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl">
        <div className="text-center p-4 text-white">
          <p className="text-gray-300">Unexpected step: {step}</p>
          <button
            onClick={() => setStep('orgSelect')}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reset to Start
          </button>
        </div>
      </div>
    </div>
  );
}
