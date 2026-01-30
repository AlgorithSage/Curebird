import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const RotatingText = ({ words, typingSpeed = 100, deletingSpeed = 50, pauseTime = 2000 }) => {
    const [index, setIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [reverse, setReverse] = useState(false);
    const [blink, setBlink] = useState(true);

    // Blinking cursor effect
    useEffect(() => {
        const timeout2 = setInterval(() => {
            setBlink((prev) => !prev);
        }, 500);
        return () => clearInterval(timeout2);
    }, []);

    // Typing logic
    useEffect(() => {
        if (subIndex === words[index].length + 1 && !reverse) {
            // Word fully typed, wait before deleting
            const timeout = setTimeout(() => {
                setReverse(true);
            }, pauseTime);
            return () => clearTimeout(timeout);
        }

        if (subIndex === 0 && reverse) {
            // Word fully deleted, move to next word
            setReverse(false);
            setIndex((prev) => (prev + 1) % words.length);
            return;
        }

        const timeout = setTimeout(() => {
            setSubIndex((prev) => prev + (reverse ? -1 : 1));
        }, reverse ? deletingSpeed : typingSpeed);

        return () => clearTimeout(timeout);
    }, [subIndex, index, reverse, words, typingSpeed, deletingSpeed, pauseTime]);

    return (
        <span className="relative inline-block align-baseline whitespace-nowrap">
            <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent font-black tracking-tight leading-none">
                {words[index].substring(0, subIndex)}
            </span>
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`inline-block w-[4px] h-[0.85em] bg-amber-400 ml-1.5 translate-y-[0.15em] ${blink ? "opacity-100" : "opacity-0"}`}
            />
        </span>
    );
};

export default RotatingText;
