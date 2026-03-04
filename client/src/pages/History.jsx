import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { FaYoutube, FaFileCsv, FaArrowRight, FaClock, FaCheckCircle, FaHistory } from 'react-icons/fa';
import axios from 'axios';
import SkeletonLoader from '../components/SkeletonLoader';

// --- SUB-COMPONENT: 3D HISTORY CARD ---
const HistoryCard3D = ({ item, index }) => {
    // Physics Engine
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const xPct = (e.clientX - rect.left) / width - 0.5;
        const yPct = (e.clientY - rect.top) / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => { x.set(0); y.set(0); };

    // Determine destination type for icons/colors
    const isFile = item.destinationName && item.destinationName.toLowerCase().includes('csv');

    return (
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            style={{ perspective: 1000, marginBottom: '25px' }}
        >
            <motion.div
                style={{ 
                    rotateX, rotateY, transformStyle: "preserve-3d",
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '25px',
                    position: 'relative',
                    cursor: 'default'
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="group"
            >
                {/* Neon Glow on Hover */}
                <div 
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                    style={{ background: `radial-gradient(circle at center, ${isFile ? '#00C9FF' : '#FF0000'}, transparent 70%)`, pointerEvents: 'none', position: 'absolute', inset: 0, borderRadius: '16px' }}
                />

                {/* Card Content (Lifted in 3D) */}
                <div style={{ transform: "translateZ(20px)", display: 'flex', alignItems: 'center', gap: '20px' }}>
                    
                    {/* Icon Bubble */}
                    <div style={{ 
                        width: '50px', height: '50px', borderRadius: '50%', 
                        background: isFile ? 'rgba(0, 201, 255, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `1px solid ${isFile ? 'rgba(0, 201, 255, 0.3)' : 'rgba(255, 0, 0, 0.3)'}`
                    }}>
                        {isFile ? <FaFileCsv color="#00C9FF" size={20} /> : <FaYoutube color="#FF0000" size={20} />}
                    </div>

                    {/* Text Data */}
                    <div style={{ flexGrow: 1 }}>
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: 'bold' }}>{item.sourceName}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '12px', color: '#888' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaClock size={10} /> {new Date(item.createdAt).toLocaleDateString()}</span>
                            <span style={{ color: '#00ff88', display: 'flex', alignItems: 'center', gap: '5px' }}><FaCheckCircle size={10} /> Success</span>
                            <span>• {item.trackCount} Tracks</span>
                        </div>
                    </div>

                    {/* Arrow Visual */}
                    <div style={{ opacity: 0.3 }}>
                        <FaArrowRight size={20} />
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const History = () => {
    const [loading, setLoading] = useState(true);
    const [historyLogs, setHistoryLogs] = useState([]);

    // FETCH REAL DATA FROM DATABASE
    useEffect(() => {
        const fetchHistory = async () => {
            const googleId = localStorage.getItem('googleId');
            if (!googleId) return;

            try {
                const res = await axios.get(`http://localhost:5000/api/auth/history?googleId=${googleId}`);
                setHistoryLogs(res.data);
            } catch (error) {
                console.error("Failed to load history", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '40px' }}>Transfer History</h1>
            <SkeletonLoader count={4} />
        </div>
    );

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', minHeight: '80vh', color: 'white' }}>
            
            {/* Page Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '10px', borderRadius: '12px' }}>
                    <FaHistory size={24} color="#00C9FF" />
                </div>
                <h1 style={{ fontSize: '3rem', fontWeight: '800', letterSpacing: '-1px' }}>Time Capsule</h1>
            </div>
            <p style={{ color: '#888', marginBottom: '60px', marginLeft: '65px' }}>
                A holographic record of every playlist you've liberated.
            </p>

            {/* Glowing Timeline Line */}
            {historyLogs.length > 0 && (
                <div style={{ 
                    position: 'absolute', left: '25px', top: '140px', bottom: '50px', 
                    width: '2px', background: 'linear-gradient(to bottom, #00C9FF, #FF00E6, transparent)',
                    opacity: 0.3, zIndex: 0
                }} />
            )}

            {/* List */}
            <div style={{ position: 'relative', zIndex: 1, paddingLeft: '50px' }}>
                {historyLogs.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <p style={{ color: '#666', fontSize: '18px' }}>No transfers recorded yet. Run a transfer to see it here.</p>
                    </div>
                ) : (
                    historyLogs.map((item, index) => (
                        <HistoryCard3D key={item._id} item={item} index={index} />
                    ))
                )}
            </div>

            {/* Footer */}
            {historyLogs.length > 0 && (
                <div style={{ textAlign: 'center', marginTop: '50px', color: '#444', fontSize: '12px' }}>
                    End of Records
                </div>
            )}
        </div>
    );
};

export default History;