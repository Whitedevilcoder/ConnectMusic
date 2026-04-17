import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FaSearch, FaYoutube, FaPlay, FaArrowLeft, FaLock, FaExpand } from 'react-icons/fa'; // <-- Added FaExpand
import toast from 'react-hot-toast';
import SkeletonLoader from '../components/SkeletonLoader';
import { useMusic } from '../context/MusicContext';

const Dashboard = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // 1. GET THE PLAY FUNCTION
    const { playTrack } = useMusic();

    const [user, setUser] = useState(null);
    const [ytPlaylists, setYtPlaylists] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const urlId = searchParams.get('googleId');
        if (urlId) {
            localStorage.setItem('googleId', urlId);
            window.history.replaceState({}, document.title, "/dashboard");
        }

        const activeGoogleId = localStorage.getItem('googleId');
        if (!activeGoogleId) {
            navigate('/');
            return;
        }

        const fetchData = async () => {
            try {
                const userRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me?googleId=${activeGoogleId}`);
                setUser(userRes.data);

                const ytRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/youtube/playlists?googleId=${activeGoogleId}`);
                setYtPlaylists(ytRes.data);

                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate, searchParams]);

    const filteredPlaylists = ytPlaylists.filter(p => p.snippet.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

    // --- STRUCTURAL LOADING STATE ---
    if (loading) return (
        <div style={{ color: 'white', width: '100%' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: '#888', fontSize: '14px', width: 'fit-content' }}>
                <FaArrowLeft size={12} /> Back to Home
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '800', marginBottom: '5px', letterSpacing: '-1px' }}>
                        Dashboard
                    </h1>
                    <p style={{ color: '#888' }}>Synchronizing library...</p>
                </div>
                <div style={{ position: 'relative', width: '100%', maxWidth: '300px', opacity: 0.5 }}>
                    <FaSearch style={{ position: 'absolute', left: '15px', top: '12px', color: '#666' }} />
                    <div style={{ padding: '10px', height: '42px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)' }} />
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px' }}>
                <SkeletonLoader count={8} />
            </div>
        </div>
    );

    // --- MAIN RENDER ---
    return (
        <div style={{ color: 'white', width: '100%' }}>

            {/* Back to Home Link */}
            <div
                onClick={() => navigate('/')}
                style={{
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                    marginBottom: '20px', color: '#888', cursor: 'pointer', fontSize: '14px',
                    transition: '0.2s', width: 'fit-content'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'white'}
                onMouseOut={(e) => e.currentTarget.style.color = '#888'}
            >
                <FaArrowLeft size={12} /> Back to Home
            </div>

            {/* Header */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '20px', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '800', marginBottom: '5px', letterSpacing: '-1px' }}>
                        Dashboard
                    </h1>
                    <p style={{ color: '#888', wordBreak: 'break-word' }}>Welcome back, <span style={{ color: 'white', fontWeight: 'bold' }}>{user?.displayName}</span></p>
                </div>

                {/* Search Bar */}
                <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                    <FaSearch style={{ position: 'absolute', left: '15px', top: '12px', color: '#666' }} />
                    <input
                        type="text"
                        placeholder="Filter playlists..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            padding: '10px 15px 10px 40px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(0,0,0,0.3)', color: 'white', width: '100%', boxSizing: 'border-box', outline: 'none',
                            backdropFilter: 'blur(10px)', transition: '0.3s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#FF0000'}
                        onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                </div>
            </div>

            {/* Grid */}
            <motion.div variants={container} initial="hidden" animate="show" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '25px' }}>
                {filteredPlaylists.map(p => {
                    const thumbUrl = p.snippet.thumbnails?.medium?.url;
                    const isPrivate = p.status?.privacyStatus === 'private';

                    return (
                        <motion.div
                            key={p.id} variants={item} whileHover={{ y: -10, boxShadow: '0 10px 30px rgba(255,0,0,0.15)' }}
                            onClick={() => navigate('/transfer', { state: { preSelectedPlaylist: p } })}
                            style={{
                                background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)',
                                overflow: 'hidden', cursor: 'pointer', backdropFilter: 'blur(10px)', transition: '0.3s'
                            }}
                        >
                            <div style={{ position: 'relative' }}>
                                <img src={thumbUrl} alt="cover" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover' }} />

                                {isPrivate ? (
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toast.error("Private playlists cannot be streamed directly due to YouTube restrictions.");
                                        }}
                                        style={{
                                            position: 'absolute', bottom: '10px', right: '10px',
                                            background: 'rgba(50, 50, 50, 0.9)', borderRadius: '50%', padding: '12px',
                                            display: 'flex', cursor: 'not-allowed'
                                        }}
                                    >
                                        <FaLock size={12} color="#aaa" />
                                    </div>
                                ) : (
                                    // --- NEW DUAL BUTTON SETUP ---
                                    <div style={{ position: 'absolute', bottom: '10px', right: '10px', display: 'flex', gap: '8px' }}>
                                        
                                        {/* THEATER MODE EXPAND BUTTON */}
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/player/${p.id}`); 
                                            }}
                                            title="Open in Theater Mode"
                                            style={{
                                                background: 'rgba(0, 0, 0, 0.7)', borderRadius: '50%', padding: '12px',
                                                display: 'flex', border: '1px solid rgba(255,255,255,0.2)',
                                                transition: '0.2s', cursor: 'pointer'
                                            }}
                                            onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = 'rgba(0, 201, 255, 0.8)'; e.currentTarget.style.borderColor = 'rgba(0, 201, 255, 1)'; }}
                                            onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                                        >
                                            <FaExpand size={12} color="white" />
                                        </div>

                                        {/* BOTTOM DOCK PLAY BUTTON */}
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                playTrack(`https://www.youtube.com/playlist?list=${p.id}`);
                                            }}
                                            title="Play in Dock"
                                            style={{
                                                background: 'rgba(255, 0, 0, 0.9)', borderRadius: '50%', padding: '12px',
                                                display: 'flex', boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                                                transition: '0.2s', cursor: 'pointer'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            <FaPlay size={12} color="white" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ padding: '20px' }}>
                                <h3 style={{ margin: '0 0 5px 0', fontSize: '15px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.snippet.title}</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', fontSize: '12px' }}>
                                    <FaYoutube color={isPrivate ? "#666" : "#FF0000"} />
                                    <span>{p.contentDetails.itemCount} Tracks</span>
                                    {isPrivate && <span style={{ marginLeft: 'auto', border: '1px solid #444', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>PRIVATE</span>}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>
        </div>
    );
};

export default Dashboard;