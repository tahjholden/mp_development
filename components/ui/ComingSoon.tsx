'use client';

import React from 'react';
import UniversalCard from '@/components/ui/UniversalCard';
import { Clock, Construction } from 'lucide-react';

interface ComingSoonProps {
  title?: string;
  description?: string;
}

export default function ComingSoon({ 
  title = "Coming Soon", 
  description = "This feature is currently under development and will be available soon." 
}: ComingSoonProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <UniversalCard.Default>
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-4 rounded-full bg-yellow-500/20">
              <Construction className="h-12 w-12 text-yellow-500" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#d8cc97] mb-2">{title}</h2>
            <p className="text-zinc-400 max-w-md mx-auto">{description}</p>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm text-zinc-500">
            <Clock className="h-4 w-4" />
            <span>Under Development</span>
          </div>
        </div>
      </UniversalCard.Default>
    </div>
  );
} 