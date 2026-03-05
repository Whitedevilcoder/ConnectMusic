import React from 'react';
import { motion } from 'framer-motion';

const Logo = ({ size = 40, showText = true }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* The SVG Icon */}
            <motion.div
                initial={{ opacity: 0.8 }}
                animate={{ opacity: [0.8, 1, 0.8], filter: ['drop-shadow(0px 0px 5px rgba(255,0,0,0.3))', 'drop-shadow(0px 0px 15px rgba(0,201,255,0.6))', 'drop-shadow(0px 0px 5px rgba(255,0,0,0.3))'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <svg 
                    width={size} 
                    height={size} 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <linearGradient id="aurora-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FF0000" />
                            <stop offset="50%" stopColor="#FF00E6" />
                            <stop offset="100%" stopColor="#00C9FF" />
                        </linearGradient>
                    </defs>
                    {/* Sleek, razor-thin connecting audio wave */}
                    <path 
                        d="M2 12h3.5l2.5-7 4.5 14 3.5-12 2.5 5h3.5" 
                        stroke="url(#aurora-gradient)" 
                        strokeWidth="1.2" /* <--- This makes it look incredibly thin and premium */
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                    />
                    <circle cx="12" cy="12" r="11" stroke="url(#aurora-gradient)" strokeWidth="0.5" strokeOpacity="0.3" />
                </svg>
            </motion.div>

            {/* The Text (Sleeker and thinner) */}
            {showText && (
                <span style={{ 
                    fontFamily: "'Inter', sans-serif",
                    fontSize: `${size * 0.6}px`, 
                    fontWeight: '300', // <--- Thin font weight
                    letterSpacing: '1px',
                    color: '#fff',
                    display: 'flex'
                }}>
                    Connect<span style={{ fontWeight: '700', color: 'transparent', backgroundClip: 'text', WebkitBackgroundClip: 'text', backgroundImage: 'linear-gradient(90deg, #FF00E6, #00C9FF)' }}>Music</span>
                </span>
            )}
        </div>
    );
};

export default Logo;