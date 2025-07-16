'use client';

import { useState } from 'react';
import { UniversalButton } from '@/components/ui/UniversalButton';
import { UniversalCard } from '@/components/ui/UniversalCard';

interface ObservationInputCardProps {
  title: string;
  placeholder: string;
  onSubmit: (note: string) => void;
  playerName?: string;
}

export function ObservationInputCard({
  title,
  placeholder,
  onSubmit,
  playerName,
}: ObservationInputCardProps) {
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (note.trim()) {
      onSubmit(note.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md md:max-w-lg lg:max-w-xl">
        <UniversalCard.Default
          color="gold"
          size="lg"
          className="border-2 border-yellow-500"
        >
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center text-white">
              {title}
            </h2>

            {playerName && (
              <div className="text-center text-white">
                <span className="text-sm text-gray-300">Player: </span>
                <span className="font-medium">{playerName}</span>
              </div>
            )}

            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={placeholder}
              className="w-full p-3 border border-gray-300 rounded-md bg-white text-black min-h-32 resize-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
              rows={6}
            />

            <div className="flex justify-end space-x-2">
              <UniversalButton.Secondary onClick={() => window.history.back()}>
                Back
              </UniversalButton.Secondary>
              <UniversalButton.Primary
                onClick={handleSubmit}
                disabled={!note.trim()}
              >
                Submit Observation
              </UniversalButton.Primary>
            </div>
          </div>
        </UniversalCard.Default>
      </div>
    </div>
  );
}
