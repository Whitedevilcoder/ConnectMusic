import React from 'react';
import Logo from '../components/Logo';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#050505] text-gray-300 font-sans p-10 selection:bg-[#00C9FF] selection:text-white">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center border-b border-white/10 pb-6 mb-10">
                    <Logo size={40} />
                    <button onClick={() => navigate('/')} className="text-sm font-bold text-white hover:text-[#00C9FF] transition-colors">Back to Home</button>
                </div>

                <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
                <p className="mb-4 text-sm text-gray-500">Last Updated: March 2026</p>

                <div className="space-y-8 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                        <p>By accessing and using ConnectMusic, you accept and agree to be bound by the terms and provisions of this agreement.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
                        <p>ConnectMusic is a tool designed to help users manage, transfer, and back up metadata related to their music playlists across different platforms, primarily utilizing the YouTube Data API.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. API Usage</h2>
                        <p>ConnectMusic's use and transfer to any other app of information received from Google APIs will adhere to the <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noreferrer" className="text-[#00C9FF] hover:underline">Google API Services User Data Policy</a>, including the Limited Use requirements.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Terms;