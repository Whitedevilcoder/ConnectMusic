import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const History = () => {
    const navigate = useNavigate();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const activeGoogleId = localStorage.getItem('googleId');
        if (!activeGoogleId) {
            navigate('/', { replace: true });
            return;
        }

        const fetchHistory = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/auth/history?googleId=${activeGoogleId}`);
                setLogs(res.data);
            } catch (err) {
                console.error("Failed to fetch history", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [navigate]);

    if (loading) return <div style={{ color: 'white', padding: '40px' }}>Loading history...</div>;

    return (
        <div style={{ padding: '20px', color: 'white', fontFamily: "'Inter', sans-serif" }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Transfer Logs</h1>
            <p style={{ color: '#a0a0a0', marginBottom: '40px', fontSize: '1.1rem' }}>
                A complete record of your music transfers.
            </p>

            <div style={{ background: '#121212', borderRadius: '15px', border: '1px solid #333', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#181818', borderBottom: '1px solid #333' }}>
                            <th style={{ padding: '20px', color: '#a0a0a0', fontWeight: 'normal' }}>Date</th>
                            <th style={{ padding: '20px', color: '#a0a0a0', fontWeight: 'normal' }}>Source Playlist</th>
                            <th style={{ padding: '20px', color: '#a0a0a0', fontWeight: 'normal' }}>Destination</th>
                            <th style={{ padding: '20px', color: '#a0a0a0', fontWeight: 'normal' }}>Tracks Moved</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length > 0 ? (
                            logs.map(log => (
                                <tr key={log._id} style={{ borderBottom: '1px solid #222', transition: 'background 0.2s', ':hover': { background: '#181818' } }}>
                                    <td style={{ padding: '20px' }}>{new Date(log.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '20px', fontWeight: 'bold' }}>{log.sourceName}</td>
                                    <td style={{ padding: '20px', color: '#FF0000' }}>{log.destinationName}</td>
                                    <td style={{ padding: '20px' }}>
                                        <span style={{ background: '#1DB954', color: 'black', padding: '4px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold' }}>
                                            {log.trackCount}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" style={{ padding: '40px 20px', textAlign: 'center', color: '#555' }}>
                                    No transfers found. Time to move some music!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default History;