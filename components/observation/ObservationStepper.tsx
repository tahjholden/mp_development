'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OrganizationSelector } from './OrganizationSelector';
import { PlayerSelector } from './PlayerSelector';
import { TeamSelector } from './TeamSelector';
import { ObservationInputCard } from './ObservationInputCard';
import { TargetSelector } from './TargetSelector';

type Step =
  | 'targetSelect'
  | 'orgSelect'
  | 'teamSelect'
  | 'playerSelect'
  | 'observationInput';

export function ObservationStepper() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [step, setStep] = useState<Step>('targetSelect');
  const [context, setContext] = useState<'individual' | 'team'>('individual');
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

  const handleTargetSelect = (selectedContext: 'individual' | 'team') => {
    setContext(selectedContext);

    // Set next step based on user role and context
    if (user?.personType === 'superadmin') {
      setStep('orgSelect');
    } else if (user?.personType === 'admin') {
      setStep('teamSelect');
    } else if (user?.personType === 'coach') {
      if (selectedContext === 'team') {
        setStep('teamSelect');
      } else {
        setStep('playerSelect');
      }
    } else {
      setStep('playerSelect');
    }
  };

  const handleBack = () => {
    switch (step) {
      case 'orgSelect':
        setStep('targetSelect');
        break;
      case 'teamSelect':
        if (user?.personType === 'superadmin') {
          setStep('orgSelect');
        } else {
          setStep('targetSelect');
        }
        break;
      case 'playerSelect':
        if (user?.personType === 'superadmin') {
          setStep('teamSelect');
        } else if (user?.personType === 'admin') {
          setStep('teamSelect');
        } else {
          setStep('targetSelect');
        }
        break;
      case 'observationInput':
        if (context === 'team') {
          setStep('teamSelect');
        } else {
          setStep('playerSelect');
        }
        break;
      default:
        setStep('targetSelect');
    }
  };

  const handleSubmit = async (note: string) => {
    if (!user) return;

    try {
      const response = await fetch('/api/observations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: context,
          observation_text: note,
          player_id: context === 'individual' ? playerId : null,
          team_id: context === 'team' ? teamId : null,
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

  // Step 1: Target Selection (Individual vs Team)
  if (step === 'targetSelect') {
    return <TargetSelector onSelect={handleTargetSelect} />;
  }

  // Superadmin flow: Org → Team → Player → Observation
  if (user.personType === 'superadmin') {
    if (step === 'orgSelect') {
      return (
        <OrganizationSelector
          onSelect={() => {
            setStep('teamSelect');
          }}
          onBack={handleBack}
        />
      );
    }

    if (step === 'teamSelect') {
      return (
        <TeamSelector
          onSelect={selectedTeamId => {
            setTeamId(selectedTeamId);
            if (context === 'team') {
              setStep('observationInput');
            } else {
              setStep('playerSelect');
            }
          }}
          onBack={handleBack}
        />
      );
    }

    if (step === 'playerSelect') {
      return (
        <PlayerSelector
          teamId={teamId || ''}
          onSelect={(selectedPlayerId, selectedPlayerName) => {
            setPlayerId(selectedPlayerId);
            setPlayerName(selectedPlayerName);
            setStep('observationInput');
          }}
          onBack={handleBack}
        />
      );
    }

    if (step === 'observationInput') {
      return (
        <ObservationInputCard
          title={
            context === 'individual' ? 'Player Observation' : 'Team Observation'
          }
          onSubmit={handleSubmit}
          playerName={context === 'individual' ? playerName || '' : ''}
          onBack={handleBack}
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
            if (context === 'team') {
              setStep('observationInput');
            } else {
              setStep('playerSelect');
            }
          }}
          onBack={handleBack}
        />
      );
    }

    if (step === 'playerSelect') {
      return (
        <PlayerSelector
          teamId={teamId || ''}
          onSelect={(selectedPlayerId, selectedPlayerName) => {
            setPlayerId(selectedPlayerId);
            setPlayerName(selectedPlayerName);
            setStep('observationInput');
          }}
          onBack={handleBack}
        />
      );
    }

    if (step === 'observationInput') {
      return (
        <ObservationInputCard
          title={
            context === 'individual' ? 'Player Observation' : 'Team Observation'
          }
          onSubmit={handleSubmit}
          playerName={context === 'individual' ? playerName || '' : ''}
          onBack={handleBack}
        />
      );
    }
  }

  // Coach flow: Player → Observation (or Team → Observation for team context)
  if (user.personType === 'coach') {
    if (step === 'teamSelect') {
      return (
        <TeamSelector
          onSelect={selectedTeamId => {
            setTeamId(selectedTeamId);
            setStep('observationInput');
          }}
          onBack={handleBack}
        />
      );
    }

    if (step === 'playerSelect') {
      return (
        <PlayerSelector
          onSelect={(selectedPlayerId, selectedPlayerName) => {
            setPlayerId(selectedPlayerId);
            setPlayerName(selectedPlayerName);
            setStep('observationInput');
          }}
          onBack={handleBack}
        />
      );
    }

    if (step === 'observationInput') {
      return (
        <ObservationInputCard
          title={
            context === 'individual' ? 'Player Observation' : 'Team Observation'
          }
          onSubmit={handleSubmit}
          playerName={context === 'individual' ? playerName || '' : ''}
          onBack={handleBack}
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
            onClick={() => setStep('targetSelect')}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reset to Start
          </button>
        </div>
      </div>
    </div>
  );
}
