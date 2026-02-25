import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js'; // <-- 1. Import the routes

dotenv.config();
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true
}));
app.use(express.json());

// Basic Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Connect-Music Engine is fully operational! 🚀' });
});

// Authentication Routes
app.use('/api/auth', authRoutes); // <-- 2. Tell Express to use them

app.listen(PORT, () => {
    console.log(`[Server] running successfully on http://localhost:${PORT}`);
});
