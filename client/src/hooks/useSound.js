import { useContext } from 'react';
import { SoundContext } from '../contexts/SoundContext';

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound must be used within SoundProvider');
  }
  return context;
};