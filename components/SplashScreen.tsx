import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface SplashScreenProps {
  onFinished: () => void;
}

const messages = [
  'Initializing Hyper-Organic Ludic Experience...',
  'Connecting to Gemini Master...',
  'Weaving threads of fate...',
  'Calibrating ASCII renderers...',
  'Done.'
];

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinished }) => {
  const { theme } = useTheme();
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prevIndex => {
        if (prevIndex < messages.length - 1) {
          return prevIndex + 1;
        }
        clearInterval(interval);
        setTimeout(onFinished, 500); // Wait a bit after 'Done.'
        return prevIndex;
      });
    }, 1000); // Change message every second

    return () => clearInterval(interval);
  }, [onFinished]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <h1 className="text-6xl tracking-widest mb-4" style={{ color: theme.colors.accent1 }}>HOLE A!</h1>
      <p className="text-xl" style={{ color: theme.colors.text }}>
        {messages[messageIndex]}
        {messageIndex < messages.length - 1 && <span className="blinking-cursor">_</span>}
      </p>
    </div>
  );
};
