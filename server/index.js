import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js'; // <-- 1. Import the routes
import cron from 'node-cron';
import axios from 'axios';

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: 'https://connectmusic-app.vercel.app', 
    credentials: true
}));
app.use(express.json());

// Basic Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Connect-Music Engine is fully operational! 🚀' });
});

// Authentication Routes
app.use('/api/auth', authRoutes); // <-- 2. Tell Express to use them

// ==========================================
// --- ANTI-SLEEP CRON JOB ---
// ==========================================
// Render sleeps after 15 minutes of inactivity. 
// This pings the server every 14 minutes to keep it awake.
cron.schedule('*/14 * * * *', async () => {
    try {
        // Ping our own /me route. We don't care about the 400 error from missing IDs, 
        // we just care that the server receives a request and stays awake.
        await axios.get('https://connectmusic.onrender.com/api/auth/me');
        console.log('🔋 Cron Ping: Kept Render server awake.');
    } catch (error) {
        // It might throw a 400/404 because we didn't pass a googleId, but that's fine!
        // The request still hit the server and reset the sleep timer.
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
