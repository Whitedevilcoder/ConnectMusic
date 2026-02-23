import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // This will be your Vite React app's local URL
    credentials: true
}));
app.use(express.json()); // Allows us to parse JSON data from the frontend

// Basic Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: 'Connect-Music Engine is fully operational! 🚀' 
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`[Server] running successfully on http://localhost:${PORT}`);
});