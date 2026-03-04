import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaExchangeAlt, FaHistory, FaSignOutAlt, FaLayerGroup, FaYoutube, FaTimes } from 'react-icons/fa';
import { useMusic } from '../context/MusicContext';
import toast from 'react-hot-toast'; // <--- 1. IMPORT TOAST

// --- HELPER: GET YOUTUBE ID ---
const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    let videoId = null;
    let listId = null;

    const vMatch = url.match(/[?&]v=([^&]+)/);
    if (vMatch) videoId = vMatch[1];

    const listMatch = url.match(/[?&]list=([^&]+)/);
    if (listMatch) listId = listMatch[1];

    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1${listId ? `&list=${listId}` : ''}`;
    } else if (listId) {
        return `https://www.youtube.com/embed?listType=playlist&list=${listId}&autoplay=1&enablejsapi=1`;
    }
    return null;
};

// --- SUB-COMPONENT: 2D ANIMATED AUDIO WAVE ---
const AudioWave = ({ isPlaying }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '24px', opacity: isPlaying ? 1 : 0.3, transition: '0.3s' }}>
            {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                    key={i}
                    animate={{ height: isPlaying ? ['8px', '24px', '8px'] : '4px' }}
                    transition={{ duration: 0.6, repeat: isPlaying ? Infinity : 0, repeatType: "reverse", ease: "easeInOut", delay: i * 0.1 }}
                    style={{ width: '4px', background: isPlaying ? '#00ff88' : '#FF0000', borderRadius: '2px' }}
                />
            ))}
        </div>
    );
};

const CyberLayout = ({ children }) => {
    const location = useLocation();
    const { currentTrack, isPlaying, togglePlay } = useMusic();
    const embedUrl = getYouTubeEmbedUrl(currentTrack);

    const bgVariants = {
        animate: { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'], transition: { duration: 20, repeat: Infinity, ease: "linear" } }
    };

    const navItems = [
        { path: '/dashboard', icon: <FaHome />, label: 'Dashboard' },
        { path: '/platforms', icon: <FaLayerGroup />, label: 'Hub' },
        { path: '/transfer', icon: <FaExchangeAlt />, label: 'Transfer' },
        { path: '/history', icon: <FaHistory />, label: 'History' },
    ];

    // --- 2. CUSTOM SIGN OUT CONFIRMATION ---
    const handleSignOut = () => {
        toast((t) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '5px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px', lineHeight: '1.4', color: 'white' }}>
                    Are you sure you want to log out of ConnectMusic?
                </span>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button 
                        onClick={() => toast.dismiss(t.id)}
                        style={{ padding: '8px 15px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: '0.2s' }}
                        onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
                        onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => {
                            toast.dismiss(t.id);
                            localStorage.removeItem('googleId');
                            window.location.href = '/';
                        }}
                        style={{ padding: '8px 15px', background: '#FF0000', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(255,0,0,0.3)' }}
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        ), { 
            duration: Infinity, 
            style: { border: '1px solid rgba(255,0,0,0.3)', background: 'rgba(20,0,0,0.9)' } 
        });
    };

    return (
        <div style={{ background: '#050505', minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: 'white', display: 'flex' }}>
            
            {/* GLOBAL AURORA BACKGROUND */}
            <motion.div 
                variants={bgVariants} animate="animate"
                style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.2, background: 'linear-gradient(-45deg, #FF0000, #4000ff, #00C9FF)', backgroundSize: '400% 400%', filter: 'blur(100px)' }}
            />

            {/* STICKY SIDEBAR */}
            <div style={{ width: '260px', height: '100vh', position: 'sticky', top: 0, background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255, 255, 255, 0.1)', padding: '30px', display: 'flex', flexDirection: 'column', zIndex: 10 }}>
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
                                    style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 15px', borderRadius: '12px', color: isActive ? 'white' : '#888', background: isActive ? 'rgba(255, 0, 0, 0.1)' : 'transparent', border: isActive ? '1px solid rgba(255, 0, 0, 0.2)' : '1px solid transparent', transition: '0.2s' }}
                                >
                                    <span style={{ color: isActive ? '#FF0000' : 'inherit' }}>{item.icon}</span>
                                    <span style={{ fontWeight: isActive ? 'bold' : 'normal' }}>{item.label}</span>
                                </motion.div>
                            </Link>
                        );
                    })}
                </nav>

                {/* --- BOTTOM SIDEBAR SECTION --- */}
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* SYSTEM STATUS & 2D AUDIO WAVE */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 5px' }}>
                        <div>
                            <p style={{ fontSize: '10px', color: isPlaying ? '#00ff88' : '#666', fontWeight: 'bold', margin: 0, transition: '0.3s' }}>
                                {isPlaying ? "SYSTEM: ACTIVE" : "SYSTEM: IDLE"}
                            </p>
                        </div>
                        <AudioWave isPlaying={isPlaying} />
                    </div>

                    {/* NATIVE SIDEBAR PLAYER */}
                    <AnimatePresence>
                        {isPlaying && embedUrl && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{ background: '#000', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333' }}
                            >
                                <div style={{ padding: '8px 12px', background: '#111', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FaYoutube color="#FF0000" size={12} />
                                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#888' }}>NOW PLAYING</span>
                                    </div>
                                    <button onClick={togglePlay} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 0 }}>
                                        <FaTimes size={12} />
                                    </button>
                                </div>

                                <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                                    <iframe 
                                        src={embedUrl} title="Music Player" frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* 3. SIGN OUT BUTTON UPDATED */}
                    <button 
                        onClick={handleSignOut}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'transparent', border: '1px solid rgba(255, 60, 60, 0.3)', borderRadius: '12px', color: '#ff4d4d', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s', width: '100%' }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 60, 60, 0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <FaSignOutAlt /> Sign Out
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div style={{ flexGrow: 1, padding: '40px', zIndex: 10, position: 'relative', overflowY: 'auto' }}>
                {children}
            </div>
        </div>
    );
};

export default CyberLayout;