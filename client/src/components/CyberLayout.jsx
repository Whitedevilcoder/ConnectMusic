import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaExchangeAlt, FaHistory, FaSignOutAlt, FaLayerGroup, FaMusic } from 'react-icons/fa';

// --- SUB-COMPONENT: ANIMATED AUDIO WAVE ---
const AudioWave = () => {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '40px', position: 'absolute', bottom: '30px', left: '30px', zIndex: 0, opacity: 0.5 }}>
            {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                    key={i}
                    animate={{ height: ['10px', '30px', '10px'] }}
                    transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                        delay: i * 0.1
                    }}
                    style={{
                        width: '6px',
                        background: '#FF0000',
                        borderRadius: '4px'
                    }}
                />
            ))}
        </div>
    );
};

// --- SUB-COMPONENT: FLOATING NOTE PARTICLES ---
const FloatingNotes = () => {
    // Create 5 floating notes with random positions
    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ y: '120vh', x: Math.random() * 100 + 'vw', opacity: 0 }}
                    animate={{ y: '-20vh', opacity: [0, 0.4, 0] }}
                    transition={{
                        duration: Math.random() * 10 + 15, // Slow float (15-25s)
                        repeat: Infinity,
                        ease: "linear",
                        delay: Math.random() * 10
                    }}
                    style={{
                        position: 'absolute',
                        fontSize: Math.random() * 30 + 20 + 'px',
                        color: 'rgba(255, 255, 255, 0.05)',
                        transform: `rotate(${Math.random() * 360}deg)`
                    }}
                >
                    <FaMusic />
                </motion.div>
            ))}
        </div>
    );
};

const CyberLayout = ({ children }) => {
    const location = useLocation();

    const bgVariants = {
        animate: {
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            transition: { duration: 20, repeat: Infinity, ease: "linear" }
        }
    };

    const navItems = [
        { path: '/dashboard', icon: <FaHome />, label: 'Dashboard' },
        { path: '/platforms', icon: <FaLayerGroup />, label: 'Hub' },
        { path: '/transfer', icon: <FaExchangeAlt />, label: 'Transfer' },
        { path: '/history', icon: <FaHistory />, label: 'History' },
    ];

    return (
        <div style={{ background: '#050505', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: 'white', display: 'flex' }}>
            
            {/* 1. GLOBAL AURORA BACKGROUND */}
            <motion.div 
                variants={bgVariants}
                animate="animate"
                style={{
                    position: 'fixed', inset: 0, zIndex: 0, opacity: 0.2,
                    background: 'linear-gradient(-45deg, #FF0000, #4000ff, #00C9FF)',
                    backgroundSize: '400% 400%', filter: 'blur(100px)'
                }}
            />

            {/* NEW: FLOATING MUSIC NOTES (Background Layer) */}
            <FloatingNotes />

            {/* 2. STICKY SIDEBAR */}
            <div style={{ 
                width: '260px', 
                height: '100vh',
                position: 'sticky',
                top: 0,
                background: 'rgba(255, 255, 255, 0.03)', 
                backdropFilter: 'blur(20px)', 
                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '30px',
                display: 'flex', flexDirection: 'column',
                zIndex: 10
            }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '50px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '10px', height: '10px', background: '#FF0000', borderRadius: '50%', boxShadow: '0 0 10px #FF0000' }}></div>
                    ConnectMusic
                </h1>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link to={item.path} key={item.path} style={{ textDecoration: 'none' }}>
                                <motion.div 
                                    whileHover={{ x: 5, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                                    style={{ 
                                        display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 15px', borderRadius: '12px',
                                        color: isActive ? 'white' : '#888',
                                        background: isActive ? 'rgba(255, 0, 0, 0.1)' : 'transparent',
                                        border: isActive ? '1px solid rgba(255, 0, 0, 0.2)' : '1px solid transparent',
                                        transition: '0.2s'
                                    }}
                                >
                                    <span style={{ color: isActive ? '#FF0000' : 'inherit' }}>{item.icon}</span>
                                    <span style={{ fontWeight: isActive ? 'bold' : 'normal' }}>{item.label}</span>
                                </motion.div>
                            </Link>
                        );
                    })}
                </nav>

                {/* NEW: AUDIO WAVE ANIMATION (Bottom of Sidebar) */}
                <div style={{ marginTop: 'auto', paddingBottom: '20px', position: 'relative', height: '50px' }}>
                    <p style={{ fontSize: '10px', color: '#666', marginBottom: '5px' }}>SYSTEM STATUS: ONLINE</p>
                    <AudioWave />
                </div>

                {/* SIGN OUT */}
                <button 
                    onClick={() => { localStorage.removeItem('googleId'); window.location.href = '/'; }}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', 
                        background: 'transparent', border: '1px solid rgba(255, 60, 60, 0.3)', borderRadius: '12px', 
                        color: '#ff4d4d', cursor: 'pointer', fontWeight: 'bold',
                        transition: '0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 60, 60, 0.1)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    <FaSignOutAlt /> Sign Out
                </button>
            </div>

            {/* 3. MAIN CONTENT AREA */}
            <div style={{ flexGrow: 1, padding: '40px', zIndex: 10, position: 'relative' }}>
                {children}
            </div>
        </div>
    );
};

export default CyberLayout;