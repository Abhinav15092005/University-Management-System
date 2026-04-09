import React, { createContext, useRef, useCallback } from 'react';

export const SoundContext = createContext();

const sounds = {
  click: new Audio('/sounds/click.mp3'),
  'message-sent': new Audio('/sounds/message-sent.mp3'),
  'message-received': new Audio('/sounds/message-received.mp3'),
  'page-change': new Audio('/sounds/page-change.mp3'),
  success: new Audio('/sounds/success.mp3'),
  error: new Audio('/sounds/error.mp3')
};

// Preload sounds
Object.values(sounds).forEach(sound => {
  sound.load();
  sound.volume = 0.3;
});

export const SoundProvider = ({ children }) => {
  const isEnabled = useRef(true);

  const playSound = useCallback((soundName) => {
    if (!isEnabled.current) return;
    const sound = sounds[soundName];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch(e => console.log('Sound play failed:', e));
    }
  }, []);

  const toggleSound = useCallback(() => {
    isEnabled.current = !isEnabled.current;
  }, []);

  return (
    <SoundContext.Provider value={{ playSound, toggleSound, isEnabled: isEnabled.current }}>
      {children}
    </SoundContext.Provider>
  );
};