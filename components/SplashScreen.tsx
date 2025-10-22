import React from 'react';

interface SplashScreenProps {
  onStart: () => void;
}

const GlowingText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ textShadow: '0 0 5px #39FF14, 0 0 10px #39FF14, 0 0 15px #39FF14' }}>
    {children}
  </span>
);

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  return (
    <div className="bg-black text-green-400 min-h-screen flex flex-col items-center justify-center p-4 font-mono">
      <div className="text-center border-4 border-green-600 p-8 max-w-2xl bg-gray-900 bg-opacity-75">
        <h1 className="text-6xl mb-4">
          <GlowingText>GEMINI</GlowingText>
        </h1>
        <h2 className="text-4xl mb-8">
            <GlowingText>TEXT RPG</GlowingText>
        </h2>
        <p className="text-lg mb-4">
          An adventure crafted by generative AI.
        </p>
        <p className="text-lg mb-8">
          Every choice you make, every path you take, is written in the digital stars. The world awaits your command.
        </p>
        <button
          onClick={onStart}
          className="text-2xl px-8 py-4 bg-green-800 border-2 border-green-400 text-green-300 hover:bg-green-600 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-green-300"
        >
          [ BEGIN YOUR JOURNEY ]
        </button>
      </div>
    </div>
  );
};