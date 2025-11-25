import React from 'react';
import { NewsTicker } from './NewsTicker';
import { RadioPlayer } from './RadioPlayer';
import { useMinimized } from '../utils/useMinimized';

export const FullComponents: React.FC = () => {
  const newsTicker = useMinimized('news-ticker');
  const radio = useMinimized('radio');

  return (
    <>
      {!radio.isMinimized && <RadioPlayer />}
      {!newsTicker.isMinimized && <NewsTicker />}
    </>
  );
};

