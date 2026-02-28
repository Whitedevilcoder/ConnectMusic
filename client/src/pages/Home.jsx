import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    const handleYouTubeLogin = () => {
        // Triggers the Primary Google Login flow on your backend
        window.location.href = 'https://overthin-controvertibly-buster.ngrok-free.dev/api/auth/google';
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at center, #1e1e24 0%, #0a0a0c 100%)', color: 'white', fontFamily: "'Inter', sans-serif" }}>
            
            <h1 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '15px', letterSpacing: '-1px' }}>
                Connect Your Music
            </h1>
            
            <p style={{ color: '#a0a0a0', fontSize: '1.1rem', marginBottom: '40px', textAlign: 'center', maxWidth: '450px', lineHeight: '1.6' }}>
                Seamlessly transfer your entire music library to YouTube Music in seconds. No hassle, just your favorite tracks, everywhere.
            </p>
            
            <button 
                onClick={handleYouTubeLogin} 
                style={{ 
                    backgroundColor: '#FF0000', 
                    color: 'white', 
                    padding: '16px 40px', 
                    borderRadius: '30px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold', 
                    border: 'none', 
                    fontSize: '16px',
                    boxShadow: '0 4px 15px rgba(255, 0, 0, 0.3)',
                    transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
                ▶ Connect with YouTube
            </button>

            {/* A helpful button if you are already logged in and just wanted to check the home page */}
            {localStorage.getItem('googleId') && (
                <button 
                    onClick={() => navigate('/dashboard')} 
                    style={{ marginTop: '20px', background: 'transparent', color: '#a0a0a0', border: '1px solid #555', padding: '10px 20px', borderRadius: '20px', cursor: 'pointer' }}
                >
                    Return to Dashboard
                </button>
            )}
        </div>
    );
};

export default Home;