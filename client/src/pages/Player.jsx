import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaYoutube, FaHeadphones, FaListUl } from 'react-icons/fa';
import axios from 'axios';
import SkeletonLoader from '../components/SkeletonLoader';

const Player = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch the playlist tracks for the queue
    useEffect(() => {
        const fetchTracks = async () => {
            const googleId = localStorage.getItem('googleId');
            if (!googleId) return;

            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/youtube/playlist-items?googleId=${googleId}&playlistId=${id}`);
                setTracks(res.data);
            } catch (error) {
                console.error("Failed to fetch tracks for queue:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTracks();
    }, [id]);

    // Generates the perfect full-screen playlist embed URL
    const embedUrl = `https://www.youtube.com/embed?listType=playlist&list=${id}&autoplay=1`;

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-white w-full h-[calc(100vh-100px)] flex flex-col"
        >
            {/* Back Button */}
            <div 
                onClick={() => navigate(-1)} 
                className="cursor-pointer flex items-center gap-2 text-[#888] hover:text-white mb-6 w-fit transition-colors font-semibold"
            >
                <FaArrowLeft size={14} /> Back to Dashboard
            </div>

            <div className="flex-1 flex flex-col xl:flex-row gap-6 h-full pb-6 overflow-hidden">
                
                {/* LEFT: Massive Cinematic Player */}
                <div className="flex-1 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(255,0,0,0.1)] border border-white/10 relative bg-black min-h-[300px] xl:min-h-0">
                    <iframe 
                        src={embedUrl} 
                        className="w-full h-full absolute inset-0" 
                        allow="autoplay; encrypted-media; picture-in-picture" 
                        allowFullScreen 
                    />
                </div>

                {/* RIGHT: The "Up Next" Queue Sidebar */}
                <div className="w-full xl:w-[400px] flex flex-col h-full bg-[#121212]/80 rounded-2xl border border-white/10 backdrop-blur-md overflow-hidden flex-shrink-0">
                    
                    {/* Sidebar Header */}
                    <div className="p-6 border-b border-white/5 bg-black/20">
                        <h2 className="text-xl font-bold flex items-center gap-3 mb-2">
                            <FaYoutube className="text-[#FF0000] drop-shadow-[0_0_10px_rgba(255,0,0,0.8)]" size={24} /> 
                            Theater Mode
                        </h2>
                        <div className="flex items-center gap-2 text-[#00C9FF] text-xs font-bold uppercase tracking-wider">
                            <FaHeadphones size={12} /> Audio Engine Active
                        </div>
                    </div>

                    {/* Queue Header */}
                    <div className="px-6 py-4 flex items-center gap-2 text-[#888] text-sm font-semibold uppercase tracking-wider border-b border-white/5">
                        <FaListUl /> Up Next ({tracks.length})
                    </div>

                    {/* Scrollable Track List */}
                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                        {loading ? (
                            <div className="p-4">
                                <SkeletonLoader count={5} />
                            </div>
                        ) : tracks.length === 0 ? (
                            <div className="p-6 text-center text-[#888] text-sm">
                                No tracks found in this playlist.
                            </div>
                        ) : (
                            tracks.map((track, index) => {
                                // Extracting data safely
                                const title = track.snippet.title;
                                const channel = track.snippet.videoOwnerChannelTitle || "Unknown Artist";
                                const thumb = track.snippet.thumbnails?.default?.url;

                                // Hide deleted or private videos
                                if (title === 'Private video' || title === 'Deleted video') return null;

                                return (
                                    <div 
                                        key={track.id} 
                                        className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors group"
                                    >
                                        <span className="text-[#555] text-xs font-mono w-4 text-right">
                                            {index + 1}
                                        </span>
                                        
                                        <div className="w-[50px] h-[50px] rounded-md overflow-hidden bg-black flex-shrink-0 relative">
                                            <img src={thumb} alt="thumb" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                            {/* Subtle play overlay on hover */}
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <FaYoutube color="#FF0000" size={16} />
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-hidden">
                                            <h4 className="text-sm font-semibold text-white truncate group-hover:text-[#FF0000] transition-colors">
                                                {title}
                                            </h4>
                                            <p className="text-xs text-[#888] truncate mt-0.5">
                                                {channel}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                </div>

            </div>
        </motion.div>
    );
};

export default Player;