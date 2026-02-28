import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Transfer = () => {
    const navigate = useNavigate();
    const location = useLocation(); // Catches the data from the Dashboard

    // Wizard State
    const [step, setStep] = useState(1);

    // Data State
    const [playlists, setPlaylists] = useState([]);
    const [selectedSource, setSelectedSource] = useState(null);
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [newPlaylistName, setNewPlaylistName] = useState("");

    // NEW: Check if the user came from the Dashboard with a pre-selected playlist
    useEffect(() => {
        if (location.state && location.state.preSelectedPlaylist) {
            const incomingPlaylist = location.state.preSelectedPlaylist;
            setSelectedSource(incomingPlaylist);
            setNewPlaylistName(`${incomingPlaylist.snippet.title} (Clone)`);
            setStep(2); // Skip Step 1!
        }
    }, [location]);

    // Execution State
    const [isTransferring, setIsTransferring] = useState(false);
    const [transferResult, setTransferResult] = useState(null);

    // Fetch user's playlists on load so they can pick a source
    useEffect(() => {
        const activeGoogleId = localStorage.getItem('googleId');
        if (!activeGoogleId) {
            navigate('/platforms');
            return;
        }

        const fetchPlaylists = async () => {
            try {
                const ytRes = await axios.get(`http://localhost:5000/api/auth/youtube/playlists?googleId=${activeGoogleId}`);
                setPlaylists(ytRes.data);
            } catch (err) {
                console.error("Failed to fetch playlists for transfer", err);
            }
        };
        fetchPlaylists();
    }, [navigate]);

    // THE ENGINE: Fire the transfer request to the backend
    const executeTransfer = async () => {
        setIsTransferring(true);
        const activeGoogleId = localStorage.getItem('googleId');

        try {
            const response = await axios.post('http://localhost:5000/api/auth/youtube/clone-playlist', {
                googleId: activeGoogleId,
                sourcePlaylistId: selectedSource.id,
                sourcePlaylistName: selectedSource.snippet.title, // <-- ADD THIS LINE
                newPlaylistName: newPlaylistName || `${selectedSource.snippet.title} (Copy)`
            });
            // ... rest of the function

            setTransferResult(response.data.message);
            setStep(4); // Move to success screen
        } catch (error) {
            console.error(error);
            setTransferResult("Transfer failed. Please try again.");
            setStep(4);
        } finally {
            setIsTransferring(false);
        }
    };

    // --- WIZARD STEPS RENDERING ---

    const renderStep1 = () => (
        <div>
            <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>Step 1: Select Source Playlist</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px', maxHeight: '500px', overflowY: 'auto' }}>
                {playlists.map(p => {
                    const thumbUrl = p.snippet.thumbnails?.medium?.url;
                    return (
                        <div
                            key={p.id}
                            onClick={() => { setSelectedSource(p); setStep(2); setNewPlaylistName(`${p.snippet.title} (Clone)`); }}
                            style={{ background: '#181818', padding: '10px', borderRadius: '8px', cursor: 'pointer', border: '1px solid transparent', transition: '0.2s', ':hover': { borderColor: '#FF0000' } }}
                        >
                            {thumbUrl && <img src={thumbUrl} alt="cover" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px' }} />}
                            <h3 style={{ margin: 0, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.snippet.title}</h3>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div>
            <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>Step 2: Select Destination</h2>
            <div style={{ display: 'flex', gap: '20px' }}>
                {/* YOUTUBE DESTINATION (Active) */}
                <div
                    onClick={() => { setSelectedDestination('youtube'); setStep(3); }}
                    style={{ background: '#181818', padding: '30px', borderRadius: '10px', cursor: 'pointer', border: '1px solid #333', width: '200px', textAlign: 'center', transition: '0.2s' }}
                >
                    <h1 style={{ color: '#FF0000', margin: '0 0 10px 0' }}>▶</h1>
                    <h3 style={{ margin: 0 }}>YouTube Music</h3>
                </div>

                {/* SPOTIFY DESTINATION (Disabled for now) */}
                <div style={{ background: '#121212', padding: '30px', borderRadius: '10px', border: '1px dashed #333', width: '200px', textAlign: 'center', opacity: 0.5 }}>
                    <h1 style={{ color: '#1DB954', margin: '0 0 10px 0' }}>●</h1>
                    <h3 style={{ margin: 0 }}>Spotify</h3>
                    <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>Temporarily Unavailable</p>
                </div>
            </div>
            <button onClick={() => setStep(1)} style={{ marginTop: '30px', background: 'transparent', color: '#a0a0a0', border: 'none', cursor: 'pointer' }}>← Back</button>
        </div>
    );

    const renderStep3 = () => (
        <div>
            <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>Step 3: Review & Transfer</h2>
            <div style={{ background: '#181818', padding: '30px', borderRadius: '10px', border: '1px solid #333' }}>
                <p style={{ color: '#a0a0a0', margin: '0 0 5px 0' }}>Source Playlist:</p>
                <h3 style={{ margin: '0 0 20px 0' }}>{selectedSource?.snippet.title}</h3>

                <p style={{ color: '#a0a0a0', margin: '0 0 5px 0' }}>Destination:</p>
                <h3 style={{ margin: '0 0 30px 0', color: '#FF0000' }}>▶ YouTube Music</h3>

                <p style={{ color: '#a0a0a0', margin: '0 0 5px 0' }}>New Playlist Name:</p>
                <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    style={{ width: '100%', maxWidth: '400px', padding: '12px', borderRadius: '8px', border: '1px solid #555', background: '#222', color: 'white', fontSize: '16px', marginBottom: '30px' }}
                />

                <div style={{ display: 'flex', gap: '15px' }}>
                    <button
                        onClick={executeTransfer}
                        disabled={isTransferring}
                        style={{ background: '#FF0000', color: 'white', padding: '12px 30px', borderRadius: '30px', border: 'none', fontWeight: 'bold', cursor: isTransferring ? 'not-allowed' : 'pointer', fontSize: '16px' }}
                    >
                        {isTransferring ? 'Transferring...' : 'Start Transfer →'}
                    </button>
                    <button onClick={() => setStep(2)} disabled={isTransferring} style={{ background: 'transparent', color: '#a0a0a0', border: 'none', cursor: 'pointer' }}>Cancel</button>
                </div>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <h1 style={{ fontSize: '4rem', margin: '0 0 20px 0' }}>🎉</h1>
            <h2 style={{ marginBottom: '10px' }}>Transfer Complete!</h2>
            <p style={{ color: '#a0a0a0', marginBottom: '40px' }}>{transferResult}</p>
            <button onClick={() => navigate('/dashboard')} style={{ background: 'white', color: 'black', padding: '12px 30px', borderRadius: '30px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                Return to Dashboard
            </button>
        </div>
    );

    return (
        <div style={{ color: 'white', fontFamily: "'Inter', sans-serif" }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '5px' }}>Transfer Engine</h1>
            <p style={{ color: '#a0a0a0', marginBottom: '40px' }}>Move your music between platforms seamlessly.</p>

            {/* Render the active step */}
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
        </div>
    );
};

export default Transfer;