'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface ThreeColumnLayoutProps {
  leftColumn: React.ReactNode;
  middleColumn: React.ReactNode;
  rightColumn: React.ReactNode;
  leftColumnWidth?: string;
  middleColumnWidth?: string;
  rightColumnWidth?: string;
  className?: string;
  gapSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullHeight?: boolean;
}

const ThreeColumnLayout: React.FC<ThreeColumnLayoutProps> = ({
  leftColumn,
  middleColumn,
  rightColumn,
  leftColumnWidth = '1fr',
  middleColumnWidth = '2fr',
  rightColumnWidth = '1fr',
  className,
  gapSize = 'lg',
  fullHeight = true,
}) => {
  const gapSizeClasses = {
    xs: 'gap-2',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12',
  };

  const columnTemplate = `${leftColumnWidth} ${middleColumnWidth} ${rightColumnWidth}`;

  return (
    <div className={cn('w-full', fullHeight && 'min-h-[calc(100vh-4rem)]', className)}>
      <div 
        className={cn('grid grid-cols-1 md:grid-cols-3', gapSizeClasses[gapSize])}
        style={{ gridTemplateColumns: columnTemplate }}
      >
        <div className="col-span-1">{leftColumn}</div>
        <div className="col-span-1 space-y-6">{middleColumn}</div>
        <div className="col-span-1">{rightColumn}</div>
      </div>
    </div>
  );
};

export default ThreeColumnLayout;
