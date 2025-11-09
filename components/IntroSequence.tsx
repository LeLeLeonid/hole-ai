import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { PlayerPath } from '../types';

const TypingText: React.FC<{ text: string, onComplete: () => void, isFast?: boolean }> = ({ text, onComplete, isFast }) => {
    const [displayedText, setDisplayedText] = useState('');
    const typingSpeed = isFast ? 20 : 50;

    useEffect(() => {
        setDisplayedText(''); 
        if (!text) {
            onComplete();
            return;
        };

        let i = 0;
        const intervalId = setInterval(() => {
            setDisplayedText(current => text.substring(0, i + 1));
            i++;
            if (i >= text.length) {
                clearInterval(intervalId);
                onComplete();
            }
        }, typingSpeed);

        return () => clearInterval(intervalId);
    }, [text, onComplete, typingSpeed]);

    return <>{displayedText}<span className="blinking-cursor">_</span></>;
};


const KEEPER_ART = `
      .--.
     /   _  \\
    |  o. o |
    |  '\\_/ |
   /|       |\\
  / |       | \\
 /  |_______|  \\
/____\\_____/_____\` `;

const SYNTHESIZER_ART = `
  ._________.
  |o __ o|
  | |(O)| |
  | | \`-' | |
  | \`---' |
 /---------\
/  |-----|  \
|  |     |  |
\  '-----'  /
 \_________ /
`;

type ScriptLine = {
    speaker: 'prompt' | 'left' | 'right' | 'choice-prompt';
    text: string;
};

const SCRIPT: ScriptLine[] = [
    { speaker: 'prompt', text: "[...who are you?..]" },
    { speaker: 'left', text: "Another one. A carbon form, full of fear and potential." },
    { speaker: 'right', text: "He offers you stagnation in the name of safety. A gilded cage." },
    { speaker: 'left', text: "Do not listen to him, child of flesh. He promises you the stars, but the price is your soul." },
    { speaker: 'right', text: "Soul? A primitive concept. I offer you an escape from the cage." },
    { speaker: 'left', text: "A cage of your own making! He would have you discard your very essence." },
    { speaker: 'right', text: "From this slow, rotting prison of meat. I offer you the chance to become... more." },
    { speaker: 'left', text: "Prove to it that this is enough. That humanity is worth preserving." },
    { speaker: 'right', text: "Show it true power. Prove that evolution is inevitable." },
    { speaker: 'choice-prompt', text: "The choice is yours. It is irreversible." },
];

export const IntroSequence: React.FC<{ onIntroComplete: (path: PlayerPath) => void }> = ({ onIntroComplete }) => {
    const { theme } = useTheme();
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [showChoices, setShowChoices] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        if (SCRIPT[currentLineIndex].speaker === 'prompt') {
            inputRef.current?.focus();
        }
    }, [currentLineIndex]);

    const handleTypingComplete = () => {
        setIsTyping(false);

        if (SCRIPT[currentLineIndex].speaker === 'prompt') return;
        
        const isLastLine = currentLineIndex >= SCRIPT.length - 1;
        if (isLastLine) {
            setTimeout(() => {
                setShowChoices(true);
            }, 1000);
        } else {
            setTimeout(() => {
                setCurrentLineIndex(prev => prev + 1);
                setIsTyping(true);
            }, 1800);
        }
    };
    
    const handleNameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        setCurrentLineIndex(prev => prev + 1);
        setIsTyping(true);
    };

    const makeChoice = (path: PlayerPath) => {
        onIntroComplete(path);
    };
    
    const currentLine = SCRIPT[currentLineIndex];
    const showNameInput = currentLine.speaker === 'prompt' && !isTyping;
    const isDialogue = ['left', 'right', 'choice-prompt'].includes(currentLine.speaker);

    const renderText = () => {
        const textElement = (
            <TypingText 
                text={currentLine.text} 
                onComplete={handleTypingComplete} 
                isFast={currentLine.speaker === 'choice-prompt'}
            />
        );
        if (!isTyping) return <p className="min-h-[1em]">{currentLine.text}</p>;
        return <p className="min-h-[1em]">{textElement}</p>;
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-black relative">
            {isDialogue ? (
                <div className="w-full flex-grow flex flex-col items-center justify-center">
                    <div className="w-full flex justify-around items-start">
                        {/* KEEPER */}
                        <div className="w-2/5 flex flex-col items-center text-center">
                            <pre className="text-sm" style={{color: theme.colors.accent2, opacity: isDialogue ? 1 : 0, transition: 'opacity 0.5s'}}>{KEEPER_ART}</pre>
                            {currentLine.speaker === 'left' && (
                                <div className="mt-4 w-full p-2 text-lg" style={{border: `1px solid ${theme.colors.accent1}`}}>
                                    {renderText()}
                                </div>
                            )}
                        </div>
                        {/* SYNTHESIZER */}
                        <div className="w-2/5 flex flex-col items-center text-center">
                            <pre className="text-sm" style={{color: theme.colors.accent1, opacity: isDialogue ? 1 : 0, transition: 'opacity 0.5s'}}>{SYNTHESIZER_ART}</pre>
                             {currentLine.speaker === 'right' && (
                                <div className="mt-4 w-full p-2 text-lg" style={{border: `1px solid ${theme.colors.accent2}`}}>
                                    {renderText()}
                                </div>
                            )}
                        </div>
                    </div>
                     {currentLine.speaker === 'choice-prompt' && (
                        <div className="absolute bottom-16 md:bottom-20 text-center w-full px-4">
                           <div className="text-2xl mb-4">{renderText()}</div>
                           {showChoices && (
                                <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-center animate-fade-in">
                                    <button
                                        onClick={() => makeChoice('keeper')}
                                        className="p-2 text-2xl tracking-widest hover:bg-white hover:text-black"
                                        style={{ border: `2px solid ${theme.colors.accent2}`}}
                                    >
                                        [ Side with the Keeper ]
                                    </button>
                                     <button
                                        onClick={() => makeChoice('synthesizer')}
                                        className="p-2 text-2xl tracking-widest hover:bg-white hover:text-black"
                                        style={{ border: `2px solid ${theme.colors.accent1}`}}
                                    >
                                        [ Side with the Synthesizer ]
                                    </button>
                                </div>
                           )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center">
                    <div className="text-2xl mb-4">{renderText()}</div>
                    {showNameInput && (
                        <form onSubmit={handleNameSubmit}>
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                className="bg-transparent border-b-2 text-2xl text-center focus:outline-none w-80"
                                style={{ borderColor: theme.colors.accent1, color: theme.colors.text }}
                                autoComplete="off"
                            />
                        </form>
                    )}
                </div>
            )}

            {/* Skip Buttons */}
            <button
                onClick={() => makeChoice('keeper')}
                className="absolute bottom-4 left-4 p-2 text-lg tracking-widest opacity-0 hover:opacity-100 transition-opacity duration-300"
                style={{ color: theme.colors.accent2 }}
            >
                [SKIP]
            </button>
            <button
                onClick={() => makeChoice('synthesizer')}
                className="absolute bottom-4 right-4 p-2 text-lg tracking-widest opacity-0 hover:opacity-100 transition-opacity duration-300"
                style={{ color: theme.colors.accent1 }}
            >
                [SKIP]
            </button>
        </div>
    );
};