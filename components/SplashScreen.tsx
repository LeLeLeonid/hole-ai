import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface SplashScreenProps {
  onFinished: () => void;
}

const spinnerChars = ['-', '\\', '|', '/'];

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinished }) => {
  const { theme } = useTheme();
  const [spinnerIndex, setSpinnerIndex] = useState(0);

  useEffect(() => {
    const spinTimer = setInterval(() => {
        setSpinnerIndex(prev => (prev + 1) % spinnerChars.length);
    }, 150);

    const finishTimer = setTimeout(() => {
        clearInterval(spinTimer);
        onFinished();
    }, 3000); // 3 seconds splash screen

    return () => {
        clearInterval(spinTimer);
        clearTimeout(finishTimer);
    };
  }, [onFinished]);

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#000' }}>
      <p className="text-6xl" style={{ color: theme.colors.text }}>
        {spinnerChars[spinnerIndex]}
      </p>
    </div>
  );
};