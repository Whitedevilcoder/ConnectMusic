import React from 'react';
import Logo from '../components/Logo';
import { useNavigate } from 'react-router-dom';

const Privacy = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#050505] text-gray-300 font-sans p-10 selection:bg-[#FF0000] selection:text-white">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center border-b border-white/10 pb-6 mb-10">
                    <Logo size={40} />
                    <button onClick={() => navigate('/')} className="text-sm font-bold text-white hover:text-[#FF0000] transition-colors">Back to Home</button>
                </div>

                <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
                <p className="mb-4 text-sm text-gray-500">Last Updated: March 2026</p>

                <div className="space-y-8 leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
                        <p>ConnectMusic utilizes Google's OAuth 2.0 authentication. We do not store or have access to your Google password. We only collect your email address and basic profile information to create your account.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Use of YouTube Data</h2>
                        <p>ConnectMusic requests access to your YouTube account via the YouTube Data API v3. This access is strictly used to:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                            <li>Read your existing YouTube Music playlists.</li>
                            <li>Create new, private playlists on your behalf.</li>
                            <li>Insert tracks into those newly created playlists during a transfer.</li>
                        </ul>
                        <p className="mt-4"><strong>We do not delete, modify, or share your existing YouTube data with any third parties.</strong> All data operations are performed solely at your explicit request within the application.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Data Retention and Revocation</h2>
                        <p>You can revoke ConnectMusic's access to your YouTube data at any time by visiting your Google Account Security settings. Upon account deletion within our app, all associated tokens and history logs are permanently removed from our databases.</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Privacy;