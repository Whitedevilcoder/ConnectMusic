import React from 'react';
import { motion } from 'framer-motion';
import { FaTools } from 'react-icons/fa';

const Maintenance = () => {
    const bgVariants = {
        animate: {
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            transition: { duration: 15, repeat: Infinity, ease: "linear" }
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-6 overflow-hidden relative">
            {/* AURORA BACKGROUND */}
            <motion.div
                variants={bgVariants}
                animate="animate"
                className="absolute inset-0 opacity-20"
                style={{
                    background: 'linear-gradient(-45deg, #FF0000, #4000ff, #00C9FF)',
                    backgroundSize: '400% 400%',
                    filter: 'blur(100px)',
                    zIndex: 0
                }}
            />

            <div className="relative z-10 flex flex-col items-center text-center max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl">
                <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="mb-6 text-[#FF0000]"
                >
                    <FaTools size={50} />
                </motion.div>
                
                <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Upgrading the Engine</h1>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                    ConnectMusic is currently undergoing scheduled maintenance to bring you a better, faster experience. We will be right back!
                </p>

                <div className="w-16 h-1 bg-gradient-to-r from-[#FF0000] to-[#4000ff] rounded-full animate-pulse" />
            </div>
        </div>
    );
};

export default Maintenance;