import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
    FaHome, FaExchangeAlt, FaHistory, FaSignOutAlt, FaLayerGroup, 
    FaYoutube, FaTimes, FaBars
} from 'react-icons/fa';
import { useMusic } from '../context/MusicContext';
import toast from 'react-hot-toast';

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
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '24px', opacity: isPlaying ? 1 : 0.3, transition: '0.3s' }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <motion.div
                    key={i}
                    animate={{ height: isPlaying ? ['6px', '24px', '6px'] : '4px' }}
                    transition={{ duration: 0.6, repeat: isPlaying ? Infinity : 0, repeatType: "reverse", ease: "easeInOut", delay: i * 0.1 }}
                    style={{ width: '4px', background: isPlaying ? '#00C9FF' : '#b3b3b3', borderRadius: '2px' }}
                />
            ))}
        </div>
    );
};

const CyberLayout = ({ children }) => {
    const location = useLocation();
    const { currentTrack, isPlaying, togglePlay } = useMusic();
    const embedUrl = getYouTubeEmbedUrl(currentTrack);
    
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const closeMenu = () => setIsMobileMenuOpen(false);

    const bgVariants = {
        animate: { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'], transition: { duration: 20, repeat: Infinity, ease: "linear" } }
    };

    const navItems = [
        { path: '/dashboard', icon: <FaHome />, label: 'Dashboard' },
        { path: '/platforms', icon: <FaLayerGroup />, label: 'Hub' },
        { path: '/transfer', icon: <FaExchangeAlt />, label: 'Transfer' },
        { path: '/history', icon: <FaHistory />, label: 'History' },
    ];

    // --- CUSTOM SIGN OUT CONFIRMATION ---
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
        ), { duration: Infinity, style: { border: '1px solid rgba(255,0,0,0.3)', background: 'rgba(20,0,0,0.9)' } });
    };

    return (
        // RESTORED: Main Background Color
        <div className="flex h-screen w-full bg-[#050505] text-white overflow-hidden font-sans relative">
            
            {/* RESTORED: GLOBAL AURORA BACKGROUND */}
            <motion.div 
                variants={bgVariants} animate="animate"
                style={{ position: 'fixed', inset: 0, zIndex: 0, opacity: 0.2, background: 'linear-gradient(-45deg, #FF0000, #4000ff, #00C9FF)', backgroundSize: '400% 400%', filter: 'blur(100px)', pointerEvents: 'none' }}
            />

            {/* MOBILE BACKDROP */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={closeMenu}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* RESTORED: GLASSMORPHISM SIDEBAR */}
            <div className={`
                fixed md:static top-0 left-0 h-full z-50 
                w-[280px] md:w-[260px] flex-shrink-0
                flex flex-col p-[30px] transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}
            style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                
                <div className="md:hidden flex justify-end mb-4">
                    <button onClick={closeMenu} className="text-gray-400 hover:text-white transition-colors">
                        <FaTimes size={24} />
                    </button>
                </div>

                <h1 className="text-2xl font-bold mb-12 flex items-center gap-2.5 hidden md:flex">
                    <div className="w-2.5 h-2.5 bg-[#FF0000] rounded-full shadow-[0_0_10px_#FF0000]"></div>
                    ConnectMusic
                </h1>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link to={item.path} key={item.path} onClick={closeMenu} style={{ textDecoration: 'none' }}>
                                <motion.div 
                                    whileHover={{ x: 5, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                                    style={{ 
                                        display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 15px', 
                                        borderRadius: '12px', color: isActive ? 'white' : '#888', 
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

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* SIGN OUT BUTTON */}
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

            {/* THE MAIN COLUMN */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
                
                {/* MOBILE TOP BAR */}
                <div className="md:hidden flex-none w-full h-16 bg-[rgba(10,10,10,0.8)] backdrop-blur-md border-b border-white/10 z-40 flex items-center justify-between px-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-[#FF0000] rounded-full shadow-[0_0_10px_#FF0000]"></div>
                        <span className="font-bold text-lg">ConnectMusic</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(true)} className="text-white p-2">
                        <FaBars size={22} />
                    </button>
                </div>

                {/* SCROLLABLE AREA */}
                <div className={`flex-1 overflow-y-auto overflow-x-hidden relative ${isPlaying ? 'pb-[120px]' : ''}`}>
                    <div className="p-6 md:p-[40px] max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </div>

            </div>

            {/* ========================================== */}
            {/* THE FUNCTIONAL & HONEST BOTTOM DOCK        */}
            {/* ========================================== */}
            <AnimatePresence>
                {isPlaying && embedUrl && (
                    <motion.div
                        initial={{ y: 120, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 120, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 25 }}
                        className="fixed bottom-0 left-0 w-full h-[100px] z-[100] flex items-center justify-between px-4 md:px-8"
                        style={{
                            background: 'rgba(15, 15, 15, 0.85)',
                            backdropFilter: 'blur(30px)',
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 -10px 40px rgba(0,0,0,0.5)'
                        }}
                    >
                        
                        {/* LEFT: Live YouTube Iframe */}
                        <div className="flex items-center gap-4 w-[50%] md:w-[30%]">
                            <div className="w-[120px] h-[68px] bg-black rounded overflow-hidden shadow-lg border border-white/10 flex-shrink-0 relative">
                                <iframe 
                                    src={embedUrl} title="Live Player" frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="hidden sm:flex flex-col justify-center">
                                <span className="text-sm text-white font-bold tracking-wide">Live Stream</span>
                                <span className="text-[11px] text-[#FF0000] flex items-center gap-1 font-semibold uppercase tracking-wider mt-1">
                                    <FaYoutube size={12} /> YouTube Audio
                                </span>
                            </div>
                        </div>

                        {/* CENTER: Audio Visualizer */}
                        <div className="hidden md:flex flex-1 max-w-[40%] flex-col items-center justify-center gap-2">
                            <AudioWave isPlaying={isPlaying} />
                            <span className="text-[10px] text-[#888] tracking-widest uppercase mt-2">ConnectMusic Engine Active</span>
                        </div>

                        {/* RIGHT: The Massive Close Button */}
                        <div className="flex items-center justify-end w-[50%] md:w-[30%]">
                            <button 
                                onClick={togglePlay}
                                className="flex items-center justify-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-full bg-[#FF0000]/10 text-[#FF0000] hover:bg-[#FF0000] hover:text-white transition-all duration-300 font-bold border border-[#FF0000]/30 hover:border-[#FF0000]"
                            >
                                <FaTimes size={16} />
                                <span className="hidden sm:inline text-sm md:text-base">Close Player</span>
                            </button>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default CyberLayout;