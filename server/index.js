import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js'; 
import cron from 'node-cron';
import axios from 'axios';

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// --- BULLETPROOF CORS CONFIGURATION ---
// ==========================================
// This explicitly allows both your local frontend and your live Vercel frontend.
const allowedOrigins = [
    'http://localhost:5173',
    'https://connectmusic-app.vercel.app',
    process.env.CLIENT_URL 
];

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, or server-to-server pings)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.error(`CORS blocked request from: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true, 
};

app.use(cors(corsOptions));
app.use(express.json());

// Basic Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Connect-Music Engine is fully operational! 🚀' });
});

// Authentication Routes
app.use('/api/auth', authRoutes); 

// ==========================================
// --- ANTI-SLEEP CRON JOB ---
// ==========================================
// Render sleeps after 15 minutes of inactivity. 
// This pings the server every 14 minutes to keep it awake.
cron.schedule('*/14 * * * *', async () => {
    try {
        await axios.get('https://connectmusic.onrender.com/api/auth/me');
        console.log('🔋 Cron Ping: Kept Render server awake.');
    } catch (error) {
        console.log('🔋 Cron Ping: Server pinged successfully.');
    }
});

// ==========================================
// --- HEALTH CHECK (For cron-job.org) ---
// ==========================================
app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});