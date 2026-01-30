import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const RotatingText = ({ words, typingSpeed = 80, deletingSpeed = 40, pauseTime = 1500, interval }) => {
    const activePauseTime = interval || pauseTime;

    const [index, setIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [reverse, setReverse] = useState(false);

    // Typing logic
    useEffect(() => {
        if (subIndex === words[index].length && !reverse) {
            const timeout = setTimeout(() => setReverse(true), activePauseTime);
            return () => clearTimeout(timeout);
        }

        if (subIndex === 0 && reverse) {
            setReverse(false);
            setIndex((prev) => (prev + 1) % words.length);
            return;
        }

        const timeout = setTimeout(() => {
            setSubIndex((prev) => prev + (reverse ? -1 : 1));
        }, reverse ? deletingSpeed : typingSpeed);

        return () => clearTimeout(timeout);
    }, [subIndex, index, reverse, words, typingSpeed, deletingSpeed, activePauseTime]);

    return (
        <span className="relative inline-block align-baseline whitespace-nowrap">
            <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent font-black tracking-tight leading-none">
                {words[index].substring(0, subIndex)}
            </span>
            <style>
                {`
                    @keyframes blink {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0; }
                    }
                    .cursor-blink {
                        animation: blink 0.5s step-end infinite;
                    }
                `}
            </style>
            <span className="inline-block w-[3.5px] h-[0.8em] bg-amber-400 ml-1.5 translate-y-[0.1em] cursor-blink shadow-[0_0_5px_rgba(251,191,36,0.4)]" />
        </span>
    );
};

export default RotatingText;
