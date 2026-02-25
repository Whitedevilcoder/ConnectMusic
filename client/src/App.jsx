import { motion } from 'framer-motion';
import { Music, ArrowRight } from 'lucide-react';

function App() {
  // This is the URL that triggers our Express backend auth route!
  const handleSpotifyLogin = () => {
    window.location.href = 'http://127.0.0.1:5000/api/auth/spotify';
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white overflow-hidden relative">
      
      {/* Background glowing gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-red-500/20 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 flex flex-col items-center text-center px-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
          className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/10 shadow-2xl"
        >
          <Music size={40} className="text-white" />
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
          Connect Your Music
        </h1>
        
        <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mb-12 leading-relaxed">
          Seamlessly transfer your entire music library between Spotify and YouTube in seconds. No hassle, just your favorite tracks, everywhere.
        </p>

        {/* The Login Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSpotifyLogin}
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#1DB954] text-black font-bold text-lg rounded-full overflow-hidden transition-all hover:bg-[#1ed760] shadow-[0_0_40px_rgba(29,185,84,0.4)]"
        >
          <span>Connect with Spotify</span>
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </motion.div>
    </div>
  );
}

export default App;