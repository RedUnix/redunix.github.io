import React from 'react';
import { RadioPlayer } from './RadioPlayer';
import { useMinimized } from '../utils/useMinimized';

export const MinimizedComponents: React.FC = () => {
  const radio = useMinimized('radio');

  // Only show Radio in header when minimized (Stock and News just disappear)
  if (!radio.isMinimized) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 px-2 border-l border-dim h-full overflow-hidden">
      <RadioPlayer />
    </div>
  );
};

