import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

const SOSButton = ({ onClick }) => {
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className="fixed bottom-6 right-6 z-40 bg-red-600 text-white w-14 h-14 rounded-full shadow-2xl shadow-red-600/40 flex items-center justify-center border-4 border-red-500 animate-[pulse_3s_ease-in-out_infinite]"
        >
            <ShieldAlert size={28} />
        </motion.button>
    );
};

export default SOSButton;
