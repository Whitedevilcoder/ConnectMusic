import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaYoutube, FaSpotify, FaMusic, FaArrowRight } from 'react-icons/fa';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

// --- SUB-COMPONENT: FLOATING BACKGROUND NOTES ---
const FloatingNotes = () => {
    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ y: '110vh', x: `${Math.random() * 100}vw`, opacity: 0, rotate: 0 }}
                    animate={{ y: '-10vh', opacity: [0, 0.15, 0], rotate: 360 }}
                    transition={{ duration: Math.random() * 15 + 15, repeat: Infinity, ease: "linear", delay: Math.random() * 5 }}
                    style={{ position: 'absolute', fontSize: `${Math.random() * 40 + 20}px`, color: 'rgba(255, 255, 255, 1)', filter: 'blur(2px)' }}
                >
                    <FaMusic />
                </motion.div>
            ))}
        </div>
    );
};

const Login = () => {
    const [searchParams] = useSearchParams();

    // Catch Errors from the URL (e.g. ?error=auth_failed)
    useEffect(() => {
        const error = searchParams.get('error');
        if (error === 'auth_failed') {
            toast.error("Authentication failed or was canceled. Please try again.");
            
            // Clean the URL so the toast doesn't trigger again if they refresh
            window.history.replaceState({}, document.title, "/");
        }
    }, [searchParams]);

    const handleGoogleLogin = () => {
        // PRODUCTION URL UPDATE
        window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
    };

    const handleSpotifyLogin = () => {
        toast("Spotify routing is under construction.", {
            icon: '🚧',
            style: { border: '1px solid #eab308', color: '#eab308', background: 'rgba(20,20,0,0.9)' }
        });
    };

    const bgVariants = {
        animate: { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'], transition: { duration: 25, repeat: Infinity, ease: "linear" } }
    };

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', color: 'white', fontFamily: "'Inter', sans-serif" }}>
            
            {/* 1. LIQUID AURORA BACKGROUND */}
            <motion.div 
                variants={bgVariants} animate="animate"
                style={{ 
                    position: 'absolute', inset: 0, zIndex: 0, opacity: 0.25, 
                    background: 'linear-gradient(-45deg, #FF0000, #2b00ff, #00C9FF, #FF00E6)', 
                    backgroundSize: '400% 400%', filter: 'blur(100px)' 
                }}
            />

            {/* 2. FLOATING PARTICLES */}
            <FloatingNotes />

            {/* 3. GLASSMORPHIC LOGIN CARD */}
            <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{ 
                    position: 'relative', zIndex: 10, width: '100%', maxWidth: '420px', 
                    background: 'rgba(10, 10, 10, 0.6)', backdropFilter: 'blur(30px)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px', 
                    padding: '50px 40px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' 
                }}
            >
                {/* Glowing Logo Node */}
                <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.3 }}
                    style={{ 
                        width: '60px', height: '60px', margin: '0 auto 25px', background: 'rgba(255,0,0,0.05)', 
                        border: '1px solid rgba(255,0,0,0.3)', borderRadius: '16px', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(255,0,0,0.2)' 
                    }}
                >
                    <div style={{ width: '15px', height: '15px', background: '#FF0000', borderRadius: '50%', boxShadow: '0 0 15px #FF0000, 0 0 30px #FF0000' }}></div>
                </motion.div>

                <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '10px', letterSpacing: '-1px' }}>ConnectMusic</h1>
                <p style={{ color: '#888', marginBottom: '40px', fontSize: '14px', lineHeight: '1.6' }}>
                    The universal bridge for your playlists. Synchronize your neural audio streams.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    
                    {/* PRIMARY ACTION: YOUTUBE */}
                    <motion.button 
                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,0,0,0.15)' }} whileTap={{ scale: 0.98 }}
                        onClick={handleGoogleLogin}
                        style={{ 
                            width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid rgba(255,0,0,0.4)', 
                            background: 'rgba(255,0,0,0.05)', color: 'white', fontSize: '16px', fontWeight: 'bold', 
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                            transition: 'background-color 0.2s, box-shadow 0.2s', boxShadow: '0 0 20px rgba(255,0,0,0.1)'
                        }}
                    >
                        <FaYoutube size={20} color="#FF0000" />
                        Continue with YouTube
                        <FaArrowRight size={14} style={{ marginLeft: 'auto', color: '#FF0000' }} />
                    </motion.button>

                    {/* SECONDARY ACTION: SPOTIFY */}
                    <motion.button 
                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(29, 185, 84, 0.15)' }} whileTap={{ scale: 0.98 }}
                        onClick={handleSpotifyLogin}
                        style={{ 
                            width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid rgba(29, 185, 84, 0.3)', 
                            background: 'rgba(29, 185, 84, 0.05)', color: 'white', fontSize: '16px', fontWeight: 'bold', 
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        <FaSpotify size={20} color="#1DB954" />
                        Continue with Spotify
                    </motion.button>
                </div>

                {/* Microcopy / Features */}
                <div style={{ 
                    marginTop: '35px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', 
                    display: 'flex', justifyContent: 'space-around', fontSize: '11px', color: '#666', 
                    fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' 
                }}>
                    <span>Secure OAuth</span>
                    <span>•</span>
                    <span>Lossless Sync</span>
                </div>
            </motion.div>

        </div>
    );
};

export default Login;