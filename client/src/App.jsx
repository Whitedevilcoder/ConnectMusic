import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
// Import Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Platforms from './pages/Platforms';
import Transfer from './pages/Transfer';
import History from './pages/History';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Player from './pages/Player'; 
import Maintenance from './pages/Maintenance'; // <-- 1. IMPORTED MAINTENANCE
import { MusicProvider } from './context/MusicContext';
// Import the New Layout
import CyberLayout from './components/CyberLayout';

function App() {
  // --- 2. MAINTENANCE MODE SWITCH ---
  // If VITE_MAINTENANCE_MODE is set to 'true', lock the app down.
  const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

  if (isMaintenanceMode) {
    return <Maintenance />;
  }

  return (
    <MusicProvider>
      <Router>
        {/* Toast Notifications stay on top */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
              border: '1px solid #444'
            },
          }}
        />

        {/* THE ROUTER - No extra divs or sidebars here! */}
        <Routes>
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* Public Home Page */}
          <Route path="/" element={<Home />} />

          {/* Protected Pages (Wrapped in CyberLayout) */}
          <Route path="/dashboard" element={<CyberLayout><Dashboard /></CyberLayout>} />
          <Route path="/platforms" element={<CyberLayout><Platforms /></CyberLayout>} />
          <Route path="/transfer" element={<CyberLayout><Transfer /></CyberLayout>} />
          <Route path="/history" element={<CyberLayout><History /></CyberLayout>} />

          {/* NEW THEATER MODE ROUTE */}
          <Route path="/player/:id" element={<CyberLayout><Player /></CyberLayout>} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </MusicProvider>
  );
}

export default App;