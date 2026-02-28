import { useState, useEffect } from 'react';
import axios from 'axios';

const Platforms = () => {
    const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
    const [isYouTubeConnected, setIsYouTubeConnected] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkConnections = async () => {
            // We now look for the primary Google Session!
            const activeGoogleId = localStorage.getItem('googleId');
            
            if (activeGoogleId) {
                // If they have a Google ID, YouTube is officially connected
                setIsYouTubeConnected(true);
                
                try {
                    // Check our DB to see if this user ALSO has Spotify linked from earlier
                    const res = await axios.get(`http://localhost:5000/api/auth/me?googleId=${activeGoogleId}`);
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

    const handleSpotifyConnect = () => {
        alert("Spotify linking is temporarily disabled while we build the YouTube engine. We will re-enable this later!");
    };

    const handleYouTubeConnect = () => {
        window.location.href = 'https://overthin-controvertibly-buster.ngrok-free.dev/api/auth/google';
    };

    if (loading) return <div style={{ color: 'white', padding: '20px' }}>Loading connections...</div>;

    return (
        <div style={{ padding: '20px', color: 'white', fontFamily: "'Inter', sans-serif" }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Integration Hub</h1>
            <p style={{ color: '#a0a0a0', marginBottom: '40px', fontSize: '1.1rem' }}>
                Manage your connected music streaming accounts.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
                
                {/* YOUTUBE MUSIC CARD (Now our primary card!) */}
                <div style={{ background: '#181818', border: isYouTubeConnected ? '2px solid #FF0000' : '1px solid #333', borderRadius: '15px', padding: '25px', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: '#FF0000', fontSize: '24px' }}>▶</span> YouTube
                        </h2>
                        {isYouTubeConnected && <span style={{ background: 'rgba(255, 0, 0, 0.2)', color: '#FF0000', padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>Connected</span>}
                    </div>
                    <p style={{ color: '#a0a0a0', flexGrow: 1, marginBottom: '25px', fontSize: '14px', lineHeight: '1.5' }}>
                        Primary Session. Connect your Google account to create and modify playlists on YouTube Music.
                    </p>
                    {isYouTubeConnected ? (
                        <button style={{ background: '#333', color: '#a0a0a0', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'not-allowed', fontWeight: 'bold' }}>Primary Account Active</button>
                    ) : (
                        <button onClick={handleYouTubeConnect} style={{ background: 'white', color: 'black', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Connect YouTube</button>
                    )}
                </div>

                {/* SPOTIFY CARD (Put on hold) */}
                <div style={{ background: '#181818', border: isSpotifyConnected ? '2px solid #1DB954' : '1px solid #333', borderRadius: '15px', padding: '25px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: '#1DB954', fontSize: '24px' }}>●</span> Spotify
                        </h2>
                        {isSpotifyConnected && <span style={{ background: 'rgba(29, 185, 84, 0.2)', color: '#1DB954', padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>Linked</span>}
                    </div>
                    <p style={{ color: '#a0a0a0', flexGrow: 1, marginBottom: '25px', fontSize: '14px', lineHeight: '1.5' }}>
                        Connect to read your public/private playlists and transfer them to other services.
                    </p>
                    {isSpotifyConnected ? (
                        <button style={{ background: '#333', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Manage Link</button>
                    ) : (
                        <button onClick={handleSpotifyConnect} style={{ background: '#333', color: '#1DB954', border: '1px solid #1DB954', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Link Spotify Account</button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Platforms;