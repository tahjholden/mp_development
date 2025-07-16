'use client';

import { UniversalButton } from '@/components/ui/UniversalButton';
import { UniversalCard } from '@/components/ui/UniversalCard';

interface TargetSelectorProps {
  onSelect: (target: 'individual' | 'team') => void;
}

export function TargetSelector({ onSelect }: TargetSelectorProps) {
  return (
    <UniversalCard.Default>
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-center">Who is this for?</h2>

        <div className="space-y-3">
          <UniversalButton.Secondary
            className="w-full justify-start p-4 h-auto"
            onClick={() => onSelect('individual')}
          >
            <div className="text-left">
              <div className="font-medium">Individual</div>
              <div className="text-sm text-muted-foreground">
                Create an observation for a specific player
              </div>
            </div>
          </UniversalButton.Secondary>

          <UniversalButton.Secondary
            className="w-full justify-start p-4 h-auto"
            onClick={() => onSelect('team')}
          >
            <div className="text-left">
              <div className="font-medium">Team</div>
              <div className="text-sm text-muted-foreground">
                Create an observation for an entire team
              </div>
            </div>
          </UniversalButton.Secondary>
        </div>
      </div>
    </UniversalCard.Default>
  );
}
