import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import axios from 'axios';
import { FaYoutube, FaFileCsv, FaArrowRight, FaCheckCircle, FaSpinner } from 'react-icons/fa';

const Transfer = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // State
    const [step, setStep] = useState(1);
    const [playlists, setPlaylists] = useState([]);
    const [selectedSource, setSelectedSource] = useState(null);
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [isTransferring, setIsTransferring] = useState(false);

    // Initial Load & Prefill
    useEffect(() => {
        if (location.state?.preSelectedPlaylist) {
            setSelectedSource(location.state.preSelectedPlaylist);
            setNewPlaylistName(`${location.state.preSelectedPlaylist.snippet.title} (Clone)`);
            setStep(2);
        }
        const activeGoogleId = localStorage.getItem('googleId');
        if (!activeGoogleId) navigate('/');
        
        axios.get(`http://localhost:5000/api/auth/youtube/playlists?googleId=${activeGoogleId}`)
            .then(res => setPlaylists(res.data))
            .catch(err => console.error(err));
    }, [location, navigate]);

    // Engine
    const executeTransfer = async () => {
        setIsTransferring(true);
        const activeGoogleId = localStorage.getItem('googleId');
        const toastId = toast.loading("Initializing engine...");

        try {
            if (selectedDestination === 'file') {
                const response = await axios.get(`http://localhost:5000/api/auth/youtube/export`, {
                    params: { googleId: activeGoogleId, playlistId: selectedSource.id, format: 'csv' },
                    responseType: 'blob'
                });
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `${selectedSource.snippet.title.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
                toast.success("Download Complete!", { id: toastId });
            } else {
                await axios.post('http://localhost:5000/api/auth/youtube/clone-playlist', {
                    googleId: activeGoogleId,
                    sourcePlaylistId: selectedSource.id,
                    sourcePlaylistName: selectedSource.snippet.title,
                    newPlaylistName
                });
                toast.success("Clone Complete!", { id: toastId });
            }
            setStep(4);
        } catch (error) {
            toast.error("Process Failed", { id: toastId });
        } finally {
            setIsTransferring(false);
        }
    };

    // Components
    const StepIndicator = () => (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
            {[1, 2, 3].map(num => (
                <div key={num} style={{ 
                    width: '40px', height: '4px', borderRadius: '4px', 
                    background: step >= num ? '#FF0000' : 'rgba(255,255,255,0.1)',
                    boxShadow: step >= num ? '0 0 10px #FF0000' : 'none',
                    transition: '0.3s' 
                }} />
            ))}
        </div>
    );

    const SelectionCard = ({ icon, title, subtitle, selected, onClick, color }) => (
        <motion.div 
            onClick={onClick}
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
            whileTap={{ scale: 0.98 }}
            style={{ 
                background: selected ? `rgba(${color}, 0.1)` : 'rgba(255,255,255,0.03)',
                border: selected ? `2px solid rgb(${color})` : '1px solid rgba(255,255,255,0.1)',
                padding: '30px', borderRadius: '16px', cursor: 'pointer',
                textAlign: 'center', minWidth: '200px', flex: 1, backdropFilter: 'blur(10px)',
                boxShadow: selected ? `0 0 30px rgba(${color}, 0.2)` : 'none'
            }}
        >
            <div style={{ fontSize: '40px', color: `rgb(${color})`, marginBottom: '15px' }}>{icon}</div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>{title}</h3>
            <p style={{ fontSize: '12px', color: '#888' }}>{subtitle}</p>
        </motion.div>
    );

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '10px' }}>Transfer Engine</h1>
            <p style={{ color: '#888', marginBottom: '40px' }}>Select your source and destination to begin.</p>
            <StepIndicator />

            <AnimatePresence mode='wait'>
                {step === 1 && (
                    <motion.div key="1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Select Source</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
                            {playlists.map(p => (
                                <motion.div 
                                    key={p.id} onClick={() => { setSelectedSource(p); setStep(2); setNewPlaylistName(`${p.snippet.title} (Clone)`); }}
                                    whileHover={{ scale: 1.05, borderColor: '#FF0000' }}
                                    style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}
                                >
                                    <img src={p.snippet.thumbnails?.medium?.url} alt="" style={{ width: '100%', borderRadius: '8px', marginBottom: '10px' }} />
                                    <h3 style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.snippet.title}</h3>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div key="2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Select Destination</h2>
                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                            <SelectionCard 
                                icon={<FaYoutube />} title="YouTube Clone" subtitle="Copy to same account" 
                                color="255, 0, 0" selected={selectedDestination === 'youtube'} 
                                onClick={() => { setSelectedDestination('youtube'); setStep(3); }} 
                            />
                            <SelectionCard 
                                icon={<FaFileCsv />} title="Backup to File" subtitle="Export as CSV / Excel" 
                                color="0, 200, 255" selected={selectedDestination === 'file'} 
                                onClick={() => { setSelectedDestination('file'); setStep(3); }} 
                            />
                        </div>
                        <button onClick={() => setStep(1)} style={{ marginTop: '30px', background: 'transparent', color: '#888', border: 'none', cursor: 'pointer' }}>← Back</button>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div key="3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Review & Launch</h2>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '30px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
                                <div><p style={{ color: '#888', fontSize: '12px' }}>SOURCE</p><h3>{selectedSource?.snippet.title}</h3></div>
                                <div style={{ textAlign: 'right' }}><p style={{ color: '#888', fontSize: '12px' }}>DESTINATION</p><h3 style={{ color: selectedDestination === 'file' ? '#00C9FF' : '#FF0000' }}>{selectedDestination === 'file' ? 'CSV File' : 'YouTube'}</h3></div>
                            </div>
                            
                            {selectedDestination === 'youtube' && (
                                <input type="text" value={newPlaylistName} onChange={e => setNewPlaylistName(e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid #444', padding: '15px', color: 'white', borderRadius: '10px', marginBottom: '20px' }} />
                            )}

                            <motion.button 
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={executeTransfer} disabled={isTransferring}
                                style={{ width: '100%', background: 'linear-gradient(90deg, #FF0000, #ff4d4d)', color: 'white', padding: '15px', borderRadius: '30px', border: 'none', fontWeight: 'bold', fontSize: '18px', cursor: isTransferring ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 0 20px rgba(255,0,0,0.4)' }}
                            >
                                {isTransferring ? <FaSpinner className="animate-spin" /> : <FaArrowRight />}
                                {isTransferring ? 'Processing...' : 'Launch Transfer'}
                            </motion.button>
                        </div>
                        <button onClick={() => setStep(2)} style={{ marginTop: '20px', background: 'transparent', color: '#888', border: 'none', cursor: 'pointer' }}>Cancel</button>
                    </motion.div>
                )}

                {step === 4 && (
                    <motion.div key="4" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', padding: '50px 0' }}>
                        <div style={{ fontSize: '80px', color: '#00ff88', marginBottom: '20px', dropShadow: '0 0 30px rgba(0,255,136,0.5)' }}><FaCheckCircle /></div>
                        <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Success!</h2>
                        <button onClick={() => navigate('/dashboard')} style={{ background: 'white', color: 'black', padding: '12px 30px', borderRadius: '30px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Back to Dashboard</button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Transfer;