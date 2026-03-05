import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FaGoogle, FaFileCsv, FaShieldAlt, FaBolt, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

// --- COMPONENT: 3D TILT CARD (Unchanged) ---
const TiltCard = ({ icon, title, desc, color }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative w-full max-w-sm h-64 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 flex flex-col items-center justify-center text-center cursor-pointer group"
        >
            <div 
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                style={{ background: `radial-gradient(circle at center, ${color}, transparent 70%)` }}
            />
            
            <div style={{ color: color, transform: "translateZ(30px)" }} className="text-4xl mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                {icon}
            </div>
            <h3 style={{ transform: "translateZ(20px)" }} className="text-xl font-bold text-white mb-2">{title}</h3>
            <p style={{ transform: "translateZ(10px)" }} className="text-gray-400 text-sm leading-relaxed">{desc}</p>
        </motion.div>
    );
};

// --- MAIN LANDING PAGE ---
const Home = () => {
    const navigate = useNavigate(); 
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // 1. CHECK LOGIN STATUS (No Redirect, just check state)
    useEffect(() => {
        const activeGoogleId = localStorage.getItem('googleId');
        if (activeGoogleId) {
            setIsLoggedIn(true);
        }
    }, []);

    // 2. Animations & Handlers
    const bgVariants = {
        animate: {
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            transition: { duration: 15, repeat: Infinity, ease: "linear" }
        }
    };

    const handleLogin = () => {
        // PRODUCTION URL UPDATE: Uses Render backend instead of localhost
        window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
    };

    return (
        <div className="min-h-screen bg-[#050505] overflow-hidden font-sans text-white selection:bg-[#FF0000] selection:text-white">
            
            {/* ANIMATED AURORA BACKGROUND */}
            <motion.div 
                variants={bgVariants}
                animate="animate"
                className="absolute inset-0 opacity-30"
                style={{
                    background: 'linear-gradient(-45deg, #FF0000, #4000ff, #00C9FF, #FF00E6)',
                    backgroundSize: '400% 400%',
                    filter: 'blur(100px)',
                    zIndex: 0
                }}
            />

            {/* NAVBAR */}
            <nav className="relative z-10 flex justify-between items-center px-10 py-6 max-w-7xl mx-auto">
                <Logo size={35} />
                <div className="flex items-center gap-2">
                    {/* <div className="w-3 h-3 bg-[#FF0000] rounded-full animate-pulse" /> */}
                    {/* <span className="font-bold text-xl tracking-tight">ConnectMusic</span> */}
                </div>
                
                {/* DYNAMIC NAVBAR BUTTON */}
                {isLoggedIn ? (
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="bg-[#FF0000] hover:bg-[#cc0000] text-white px-6 py-2 rounded-full text-sm font-bold transition-all hover:scale-105 flex items-center gap-2"
                    >
                        Dashboard <FaArrowRight />
                    </button>
                ) : (
                    <button 
                        onClick={handleLogin}
                        className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md px-6 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
                    >
                        Sign In
                    </button>
                )}
            </nav>

            {/* HERO SECTION */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
                
                {/* Floating Badge */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1 mb-8"
                >
                    <span className="w-2 h-2 bg-[#00ff88] rounded-full" />
                    <span className="text-xs uppercase tracking-widest text-gray-300">V 1.0 Production Ready</span>
                </motion.div>

                {/* Massive Headline */}
                <motion.h1 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-6xl md:text-8xl font-extrabold tracking-tighter mb-8 leading-tight"
                >
                    Your Music. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF0000] to-[#ff4d4d]">
                        Liberated.
                    </span>
                </motion.h1>

                {/* Subheadline */}
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12"
                >
                    The professional standard for moving playlists. Transfer between platforms, 
                    backup your data to CSV, and take total control of your library.
                </motion.p>

                {/* DYNAMIC HERO BUTTON */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="relative inline-block group"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#FF0000] to-[#ff0055] rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
                    
                    {isLoggedIn ? (
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="relative flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform"
                        >
                            <FaBolt />
                            Go to Dashboard
                        </button>
                    ) : (
                        <button 
                            onClick={handleLogin}
                            className="relative flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform"
                        >
                            <FaGoogle />
                            Continue with Google
                        </button>
                    )}
                </motion.div>
            </main>

            {/* 3D FEATURE GRID */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 pb-40">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 perspective-1000">
                    <TiltCard 
                        icon={<FaBolt />} 
                        title="Instant Transfer" 
                        desc="Move entire playlists in seconds. Our engine clones your metadata perfectly."
                        color="#FFD700" 
                    />
                    <TiltCard 
                        icon={<FaFileCsv />} 
                        title="Universal Backup" 
                        desc="Download your library to Excel/CSV. Never lose a song again."
                        color="#00C9FF" 
                    />
                    <TiltCard 
                        icon={<FaShieldAlt />} 
                        title="Privacy First" 
                        desc="Your data stays yours. We use OAuth 2.0 so we never see your password."
                        color="#FF0000" 
                    />
                </div>
            </section>

            {/* FOOTER */}
            <footer className="relative z-10 text-center pb-10 text-gray-500 text-sm">
                <p>© 2026 ConnectMusic Inc. Built for Audiophiles.</p>
            </footer>

            <style>{`
                .perspective-1000 { perspective: 1000px; }
            `}</style>
        </div>
    );
};

export default Home;