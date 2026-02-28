import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Core State
    const [user, setUser] = useState(null);
    const [ytPlaylists, setYtPlaylists] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    // Modal & Track State
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const [tracks, setTracks] = useState([]);
    const [loadingTracks, setLoadingTracks] = useState(false);

    useEffect(() => {
        const urlId = searchParams.get('googleId');
        if (urlId) {
            localStorage.setItem('googleId', urlId);
            window.history.replaceState({}, document.title, "/dashboard");
        }

        const activeGoogleId = localStorage.getItem('googleId');
        if (!activeGoogleId) {
            navigate('/', { replace: true });
            return;
        }

        const fetchData = async () => {
            try {
                const userRes = await axios.get(`http://localhost:5000/api/auth/me?googleId=${activeGoogleId}`);
                setUser(userRes.data);

                const ytRes = await axios.get(`http://localhost:5000/api/auth/youtube/playlists?googleId=${activeGoogleId}`);
                setYtPlaylists(ytRes.data);

                setLoading(false);
            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
                setLoading(false);
            }
        };

        fetchData();
    }, [searchParams, navigate]);

    // THE CLICK HANDLER: Fetch tracks when a playlist is clicked
    const handlePlaylistClick = async (playlist) => {
        setSelectedPlaylist(playlist);
        setLoadingTracks(true);
        setTracks([]); // Clear old tracks

        try {
            const activeGoogleId = localStorage.getItem('googleId');
            const response = await axios.get(`http://localhost:5000/api/auth/youtube/playlist-items?googleId=${activeGoogleId}&playlistId=${playlist.id}`);
            setTracks(response.data);
        } catch (err) {
            console.error("Failed to fetch tracks", err);
        } finally {
            setLoadingTracks(false);
        }
    };

    const filteredPlaylists = ytPlaylists.filter(playlist =>
        playlist.snippet.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}><h2>Loading your library...</h2></div>;

    return (
        <div style={{ color: 'white', fontFamily: "'Inter', sans-serif", position: 'relative' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2.5rem', margin: 0 }}>Dashboard</h1>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{user?.displayName}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#FF0000' }}>YouTube Primary</p>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.5rem' }}>
                    <span style={{ color: '#FF0000' }}>▶</span> Your Playlists
                </h2>
                <input
                    type="text"
                    placeholder="Search playlists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ padding: '10px 15px', borderRadius: '20px', border: '1px solid #333', background: '#181818', color: 'white', width: '250px', outline: 'none' }}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {filteredPlaylists.length > 0 ? (
                    filteredPlaylists.map(p => {
                        const thumbUrl = p.snippet.thumbnails?.medium?.url || p.snippet.thumbnails?.default?.url;
                        return (
                            <div
                                key={p.id}
                                onClick={() => handlePlaylistClick(p)} // <-- ADDED CLICK EVENT
                                style={{ background: '#181818', padding: '15px', borderRadius: '10px', transition: '0.2s', cursor: 'pointer', border: '1px solid #333' }}
                                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = '#FF0000'; }}
                                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#333'; }}
                            >
                                {thumbUrl ? (
                                    <img src={thumbUrl} alt={p.snippet.title} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} />
                                ) : (
                                    <div style={{ width: '100%', aspectRatio: '16/9', background: '#333', borderRadius: '8px', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>
                                )}
                                <h3 style={{ margin: 0, fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.snippet.title}</h3>
                                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#a0a0a0' }}>{p.contentDetails.itemCount} Tracks</p>
                            </div>
                        );
                    })
                ) : (
                    <p style={{ color: '#a0a0a0' }}>No playlists found.</p>
                )}
            </div>

            {/* --- THE MODAL OVERLAY --- */}
            {selectedPlaylist && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#121212', border: '1px solid #333', borderRadius: '15px', width: '90%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>

                        {/* Modal Header */}
                        <div style={{ padding: '20px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ margin: 0, fontSize: '1.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                Tracks in: {selectedPlaylist.snippet.title}
                            </h2>
                            <button onClick={() => setSelectedPlaylist(null)} style={{ background: 'transparent', color: '#a0a0a0', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>

                        {/* Modal Body (Track List) */}
                        <div style={{ padding: '20px', overflowY: 'auto', flexGrow: 1 }}>
                            {loadingTracks ? (
                                <div style={{ textAlign: 'center', color: '#a0a0a0', padding: '40px 0' }}>Fetching tracks from Google...</div>
                            ) : tracks.length > 0 ? (
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    {tracks.map((track, index) => (
                                        <li key={track.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#181818', padding: '10px', borderRadius: '8px' }}>
                                            <span style={{ color: '#555', fontWeight: 'bold', width: '20px' }}>{index + 1}</span>
                                            {track.snippet.thumbnails?.default?.url ? (
                                                <img src={track.snippet.thumbnails.default.url} alt="thumbnail" style={{ width: '50px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                            ) : (
                                                <div style={{ width: '50px', height: '40px', background: '#333', borderRadius: '4px' }}></div>
                                            )}
                                            <div style={{ overflow: 'hidden' }}>
                                                <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.snippet.title}</p>
                                                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#a0a0a0' }}>{track.snippet.videoOwnerChannelTitle || "Unknown Artist"}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div style={{ textAlign: 'center', color: '#a0a0a0', padding: '40px 0' }}>This playlist is empty.</div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div style={{ padding: '20px', borderTop: '1px solid #333', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                // We pass the selected playlist securely through the router's state!
                                onClick={() => navigate('/transfer', { state: { preSelectedPlaylist: selectedPlaylist } })}
                                style={{ background: '#FF0000', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                                disabled={tracks.length === 0}
                            >
                                Transfer Playlist →
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Dashboard;