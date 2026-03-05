import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FaYoutube, FaSpotify, FaCheckCircle, FaTimesCircle, FaLink, FaUnlink } from 'react-icons/fa';
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/SkeletonLoader';

const Platforms = () => {
    const [user, setUser] = useState(null);
    const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
    const [isYouTubeConnected, setIsYouTubeConnected] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkConnections = async () => {
            const activeGoogleId = localStorage.getItem('googleId');
            
            if (activeGoogleId) {
                setIsYouTubeConnected(true);
                try {
                    const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me?googleId=${activeGoogleId}`);
                    setUser(res.data);
                    
                    if (res.data.spotifyId) {
                        setIsSpotifyConnected(true);
                    }
                } catch (err) {
                    console.error("Failed to fetch connection status", err);
                }
            }
            setLoading(false);
        };
        
        checkConnections();
    }, []);

    // --- CUSTOM CONFIRMATION TOAST ---
    const customConfirm = (message, onConfirm) => {
        toast((t) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '5px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px', lineHeight: '1.4' }}>{message}</span>
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
                            onConfirm();
                        }}
                        style={{ padding: '8px 15px', background: '#FF0000', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(255,0,0,0.3)' }}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        ), { 
            duration: Infinity, 
            style: { border: '1px solid rgba(255,0,0,0.3)', background: 'rgba(20,0,0,0.9)' } 
        });
    };

    // --- CONNECTION HANDLERS ---
    const handleSpotifyConnect = () => {
        toast("Spotify linking is temporarily disabled while we build the YouTube engine.", {
            icon: '🚧',
            style: { border: '1px solid #eab308', color: '#eab308', background: 'rgba(20,20,0,0.9)' }
        });
    };

    const handleYouTubeConnect = () => {
        // PRODUCTION URL UPDATE
        window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
    };

    // --- DISCONNECT HANDLERS ---
    const handleDisconnectYouTube = () => {
        customConfirm(
            "Warning: YouTube is your primary connection. Disconnecting will sign you out. Continue?",
            () => {
                localStorage.removeItem('googleId');
                toast.success("Signed out successfully.");
                window.location.href = '/';
            }
        );
    };

    const handleDisconnectSpotify = () => {
        customConfirm(
            "Are you sure you want to disconnect your Spotify account?",
            async () => {
                const activeGoogleId = localStorage.getItem('googleId');
                const toastId = toast.loading("Disconnecting Spotify...");
                
                try {
                    // FIXED BACKTICKS FOR STRING INTERPOLATION
                    await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/spotify/unlink`, { googleId: activeGoogleId });
                    setIsSpotifyConnected(false);
                    toast.success("Spotify disconnected.", { id: toastId });
                } catch (error) {
                    toast.error("Failed to disconnect.", { id: toastId });
                    console.error(error);
                }
            }
        );
    };

    if (loading) return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '40px', color: 'white' }}>Integration Hub</h1>
            <SkeletonLoader count={2} />
        </div>
    );

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', color: 'white' }}>
            
            {/* Header */}
            <div style={{ marginBottom: '50px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <FaLink size={24} color="#FF00E6" />
                </div>
                <div>
                    <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '5px', letterSpacing: '-1px' }}>Integration Hub</h1>
                    <p style={{ color: '#888' }}>Manage your connected music streaming accounts.</p>
                </div>
            </div>

            {/* Platform Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                
                {/* --- YOUTUBE CARD (PRIMARY) --- */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    style={{ 
                        background: 'rgba(0,0,0,0.4)', borderRadius: '20px', padding: '30px',
                        border: `1px solid ${isYouTubeConnected ? 'rgba(255,0,0,0.3)' : 'rgba(255,255,255,0.1)'}`,
                        boxShadow: isYouTubeConnected ? '0 10px 30px rgba(255,0,0,0.1)' : 'none',
                        position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column'
                    }}
                >
                    {isYouTubeConnected && <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(255,0,0,0.2) 0%, transparent 70%)', filter: 'blur(20px)', pointerEvents: 'none' }} />}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', position: 'relative', zIndex: 1 }}>
                        <FaYoutube size={40} color={isYouTubeConnected ? "#FF0000" : "#666"} />
                        <div style={{ 
                            display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 'bold',
                            color: isYouTubeConnected ? '#00ff88' : '#ff4d4d',
                            background: isYouTubeConnected ? 'rgba(0,255,136,0.1)' : 'rgba(255,77,77,0.1)',
                            padding: '5px 10px', borderRadius: '20px'
                        }}>
                            {isYouTubeConnected ? <><FaCheckCircle /> CONNECTED</> : <><FaTimesCircle /> DISCONNECTED</>}
                        </div>
                    </div>

                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', position: 'relative', zIndex: 1 }}>YouTube Music</h2>
                    <p style={{ color: '#888', flexGrow: 1, marginBottom: '25px', fontSize: '14px', lineHeight: '1.5', position: 'relative', zIndex: 1 }}>
                        Primary Session. Connect your Google account to create and modify playlists on YouTube Music.
                    </p>

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        {isYouTubeConnected ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 15px', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                    <span style={{ fontSize: '12px', color: '#666' }}>Active Account:</span>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{user?.email || "Authenticated"}</div>
                                </div>
                                <button 
                                    onClick={handleDisconnectYouTube}
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,0,0,0.3)', background: 'transparent', color: '#FF0000', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: '0.2s' }}
                                    onMouseOver={(e) => { e.target.style.background = 'rgba(255,0,0,0.1)' }}
                                    onMouseOut={(e) => { e.target.style.background = 'transparent' }}
                                >
                                    <FaUnlink /> Disconnect (Sign Out)
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={handleYouTubeConnect}
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: '#FF0000', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '10px', transition: '0.2s', boxShadow: '0 4px 15px rgba(255,0,0,0.3)' }}
                                onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                            >
                                <FaYoutube size={16} /> Connect YouTube
                            </button>
                        )}
                    </div>
                </motion.div>

                {/* --- SPOTIFY CARD --- */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    style={{ 
                        background: 'rgba(0,0,0,0.4)', borderRadius: '20px', padding: '30px',
                        border: `1px solid ${isSpotifyConnected ? 'rgba(29, 185, 84, 0.3)' : 'rgba(255,255,255,0.1)'}`,
                        boxShadow: isSpotifyConnected ? '0 10px 30px rgba(29, 185, 84, 0.1)' : 'none',
                        position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column'
                    }}
                >
                    {isSpotifyConnected && <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(29, 185, 84, 0.2) 0%, transparent 70%)', filter: 'blur(20px)', pointerEvents: 'none' }} />}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', position: 'relative', zIndex: 1 }}>
                        <FaSpotify size={40} color={isSpotifyConnected ? "#1DB954" : "#666"} />
                        <div style={{ 
                            display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 'bold',
                            color: isSpotifyConnected ? '#00ff88' : '#ff4d4d',
                            background: isSpotifyConnected ? 'rgba(0,255,136,0.1)' : 'rgba(255,77,77,0.1)',
                            padding: '5px 10px', borderRadius: '20px'
                        }}>
                            {isSpotifyConnected ? <><FaCheckCircle /> LINKED</> : <><FaTimesCircle /> DISCONNECTED</>}
                        </div>
                    </div>

                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', position: 'relative', zIndex: 1 }}>Spotify</h2>
                    <p style={{ color: '#888', flexGrow: 1, marginBottom: '25px', fontSize: '14px', lineHeight: '1.5', position: 'relative', zIndex: 1 }}>
                        Connect to read your public/private playlists and transfer them to other services.
                    </p>

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        {isSpotifyConnected ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 15px', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                    <span style={{ fontSize: '12px', color: '#666' }}>Linked Account ID:</span>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.spotifyId}</div>
                                </div>
                                <button 
                                    onClick={handleDisconnectSpotify}
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,0,0,0.3)', background: 'transparent', color: '#FF0000', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: '0.2s' }}
                                    onMouseOver={(e) => { e.target.style.background = 'rgba(255,0,0,0.1)' }}
                                    onMouseOut={(e) => { e.target.style.background = 'transparent' }}
                                >
                                    <FaUnlink /> Disconnect Spotify
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={handleSpotifyConnect}
                                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #1DB954', background: 'rgba(29, 185, 84, 0.1)', color: '#1DB954', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '10px', transition: '0.2s' }}
                                onMouseOver={(e) => { e.target.style.background = '#1DB954'; e.target.style.color = 'black'; }}
                                onMouseOut={(e) => { e.target.style.background = 'rgba(29, 185, 84, 0.1)'; e.target.style.color = '#1DB954'; }}
                            >
                                <FaSpotify size={16} /> Link Spotify Account
                            </button>
                        )}
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default Platforms;