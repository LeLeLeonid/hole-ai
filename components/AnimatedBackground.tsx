import React, { useRef, useEffect } from 'react';
import { BackgroundStyle } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface AnimatedBackgroundProps {
    style: BackgroundStyle;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ style }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { theme } = useTheme();

    useEffect(() => {
        if (style === 'none') return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let resizeListener: () => void;

        const setup = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            let particles: any[];
            let columns: number[];

            const FONT_SIZE = 16;
            const MATRIX_CHARS = 'アァカサタナハマヤャラワガザダバパイィキヒミリウゥクスツヌフムユュルグズブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
            const ASCII_CHARS = '!"#€%&/()=?*+-_,;:.><@£$|[]{}1234567890';

            const initNightSky = () => {
                particles = [];
                const particleCount = Math.floor((canvas.width * canvas.height) / 10000);
                for (let i = 0; i < particleCount; i++) {
                    particles.push({
                        x: Math.random() * canvas.width,
                        y: Math.random() * canvas.height,
                        radius: Math.random() * 1.5 + 0.5,
                        alpha: Math.random() * 0.5 + 0.2,
                        delta: Math.random() * 0.02 - 0.01,
                    });
                }
            };
            
            const initMatrix = () => {
                const columnCount = Math.floor(canvas.width / FONT_SIZE);
                columns = Array(columnCount).fill(1);
            };

            const initAscii = () => {
                // No specific init needed
            };


            const drawNightSky = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = theme.colors.text;

                particles.forEach(p => {
                    p.alpha += p.delta;
                    if (p.alpha <= 0.2 || p.alpha >= 0.7) {
                        p.delta *= -1;
                    }

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${hexToRgb(theme.colors.text)}, ${p.alpha})`;
                    ctx.fill();
                });
            };

            const drawMatrix = () => {
                ctx.fillStyle = `rgba(${hexToRgb(theme.colors.bg)}, 0.05)`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.fillStyle = theme.colors.accent1;
                ctx.font = `${FONT_SIZE}px monospace`;

                columns.forEach((y, i) => {
                    const text = MATRIX_CHARS.charAt(Math.floor(Math.random() * MATRIX_CHARS.length));
                    const x = i * FONT_SIZE;
                    ctx.fillText(text, x, y * FONT_SIZE);

                    if (y * FONT_SIZE > canvas.height && Math.random() > 0.975) {
                        columns[i] = 0;
                    }
                    columns[i]++;
                });
            };
            
            const drawAscii = () => {
                ctx.fillStyle = `rgba(${hexToRgb(theme.colors.bg)}, 0.1)`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                ctx.font = `${FONT_SIZE}px monospace`;
                const charCount = 5;
                for(let i = 0; i < charCount; i++) {
                    const char = ASCII_CHARS[Math.floor(Math.random()*ASCII_CHARS.length)];
                    const x = Math.random() * canvas.width;
                    const y = Math.random() * canvas.height;
                    const alpha = Math.random();
                    ctx.fillStyle = `rgba(${hexToRgb(theme.colors.accent2)}, ${alpha})`;
                    ctx.fillText(char, x, y);
                }
            };


            const render = () => {
                switch(style) {
                    case 'night-sky': drawNightSky(); break;
                    case 'matrix': drawMatrix(); break;
                    case 'ascii': drawAscii(); break;
                }
                animationFrameId = requestAnimationFrame(render);
            };

            switch(style) {
                case 'night-sky': initNightSky(); break;
                case 'matrix': initMatrix(); break;
                case 'ascii': initAscii(); break;
            }

            render();
        };

        const hexToRgb = (hex: string) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : '255,255,255';
        }

        const handleResize = () => {
            cancelAnimationFrame(animationFrameId);
            setup();
        };
        
        setup();
        
        resizeListener = handleResize;
        window.addEventListener('resize', resizeListener);

        return () => {
            window.removeEventListener('resize', resizeListener);
            cancelAnimationFrame(animationFrameId);
        };
    }, [style, theme]);

    if (style === 'none') {
        return null;
    }

    return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0" />;
};