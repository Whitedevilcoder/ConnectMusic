import { BrowserRouter as Router, Routes, Route, Outlet, Link, useNavigate } from 'react-router-dom';

// Import your page components
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Platforms from './pages/Platforms';
import Transfer from './pages/Transfer';
import History from './pages/History';

// --- THE PERSISTENT LAYOUT ---
// This wrapper keeps the sidebar on the screen while the right side changes smoothly.
const MainLayout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Nuke the session entirely to prevent caching loops and ghost logins
        localStorage.clear();
        navigate('/', { replace: true });
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0c', color: 'white', fontFamily: "'Inter', sans-serif" }}>

            {/* SIDEBAR NAVIGATION */}
            <nav style={{ width: '250px', background: '#121212', padding: '30px 20px', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ color: '#1db954', marginBottom: '40px', fontSize: '24px', letterSpacing: '-0.5px' }}>
                    🎵 ConnectMusic
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flexGrow: 1 }}>
                    <Link to="/dashboard" style={{ color: '#a0a0a0', textDecoration: 'none', fontSize: '16px', padding: '10px', borderRadius: '8px', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = '#222'} onMouseOut={(e) => e.target.style.background = 'transparent'}>
                        Dashboard
                    </Link>

                    <Link to="/platforms" style={{ color: '#a0a0a0', textDecoration: 'none', fontSize: '16px', padding: '10px', borderRadius: '8px', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = '#222'} onMouseOut={(e) => e.target.style.background = 'transparent'}>
                        Integration Hub
                    </Link>

                    <Link
                        to="/history"
                        style={{ color: '#a0a0a0', textDecoration: 'none', fontSize: '16px', padding: '10px', borderRadius: '8px', transition: 'background 0.2s' }}
                        onMouseOver={(e) => e.target.style.background = '#222'}
                        onMouseOut={(e) => e.target.style.background = 'transparent'}
                    >
                        Transfer History
                    </Link>

                    {/* Future Pages - Ready for when we build the actual transfer engine */}
                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <Link to="/transfer" style={{ color: 'white', textDecoration: 'none', fontSize: '16px', fontWeight: 'bold', background: '#333', padding: '12px 10px', borderRadius: '8px', textAlign: 'center', transition: '0.2s' }} onMouseOver={(e) => e.target.style.background = '#444'} onMouseOut={(e) => e.target.style.background = '#333'}>
                            + New Transfer
                        </Link>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    style={{ background: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}
                    onMouseOver={(e) => { e.target.style.background = '#ff4d4d'; e.target.style.color = 'black'; }}
                    onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#ff4d4d'; }}
                >
                    Logout
                </button>
            </nav>

            {/* DYNAMIC MAIN CONTENT AREA */}
            <main style={{ flexGrow: 1, padding: '40px', overflowY: 'auto', height: '100vh', boxSizing: 'border-box' }}>
                {/* The Outlet renders whatever page component matches the current URL */}
                <Outlet />
            </main>

        </div>
    );
};

// --- THE MASTER ROUTER ---
function App() {
    return (
        <Router>
            <Routes>
                {/* Public Route (The Login/Landing Page Guard) */}
                <Route path="/" element={<Home />} />

                {/* Protected Routes (Wrapped inside the Sidebar Layout) */}
                <Route element={<MainLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/platforms" element={<Platforms />} />
                    <Route path="/transfer" element={<Transfer />} />
                    <Route path="/history" element={<History />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;