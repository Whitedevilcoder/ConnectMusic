import express from 'express';
import SpotifyWebApi from 'spotify-web-api-node';
import axios from 'axios';
import User from '../models/User.js';
import dotenv from 'dotenv';
import History from '../models/History.js'; // <-- ADD THIS
import { google } from 'googleapis';

dotenv.config();
const router = express.Router();


// ==========================================
// --- SPOTIFY AUTH ---
// ==========================================

router.get('/spotify', (req, res) => {
    const spotifyApi = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID.trim(),
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET.trim(),
        redirectUri: process.env.SPOTIFY_REDIRECT_URI.trim()
    });

    const scopes = [
        'user-read-private', 'user-read-email',
        'playlist-read-private',
        'playlist-modify-public',
        'playlist-modify-private'
    ];

    res.redirect(spotifyApi.createAuthorizeURL(scopes, 'auth-state', true));
});

router.get('/spotify/callback', async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).json({ error: 'Authorization code missing' });
    }

    const spotifyApi = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID.trim(),
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET.trim(),
        redirectUri: process.env.SPOTIFY_REDIRECT_URI.trim()
    });

    try {
        const data = await spotifyApi.authorizationCodeGrant(code);
        const access_token = data.body['access_token'];
        const refresh_token = data.body['refresh_token'];

        const profileResponse = await axios.get(
            'https://api.spotify.com/v1/me',
            { headers: { Authorization: `Bearer ${access_token}` } }
        );

        const userProfile = profileResponse.data;

        let user = await User.findOne({ spotifyId: userProfile.id });

        if (!user) {
            user = new User({
                displayName: userProfile.display_name,
                email: userProfile.email,
                spotifyId: userProfile.id,
                spotifyAccessToken: access_token,
                spotifyRefreshToken: refresh_token,
            });
        } else {
            user.spotifyAccessToken = access_token;
            user.spotifyRefreshToken = refresh_token;
        }

        await user.save();

        res.redirect(`http://localhost:5173/dashboard?spotifyId=${user.spotifyId}`);

    } catch (error) {
        console.error("SPOTIFY AUTH ERROR:", error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to authenticate with Spotify' });
    }
});


// ==========================================
// --- GOOGLE / YOUTUBE PRIMARY AUTH ---
// ==========================================

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID.trim(),
    process.env.GOOGLE_CLIENT_SECRET.trim(),
    process.env.GOOGLE_REDIRECT_URI.trim()
);

// 1️⃣ Send user to Google Login (Primary OR Linking)
router.get('/google', (req, res) => {
    const { spotifyId } = req.query;

    const scopes = [
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ];

    const authConfig = {
        access_type: 'offline',
        prompt: 'consent',
        scope: scopes
    };

    if (spotifyId) authConfig.state = spotifyId;

    res.redirect(oauth2Client.generateAuthUrl(authConfig));
});

// 2️⃣ Callback
router.get('/google/callback', async (req, res) => {
    const { code, state: spotifyId } = req.query;

    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
        const userInfo = await oauth2.userinfo.get();

        let user;

        if (spotifyId) {
            // Linking to Spotify account
            user = await User.findOne({ spotifyId });

            if (user) {
                user.googleId = userInfo.data.id;
                user.googleAccessToken = tokens.access_token;
                if (tokens.refresh_token)
                    user.googleRefreshToken = tokens.refresh_token;
                await user.save();
            }

            return res.redirect('http://localhost:5173/platforms');
        }

        // Primary Google Login
        user = await User.findOne({ googleId: userInfo.data.id });

        if (!user) {
            user = new User({
                displayName: userInfo.data.name,
                email: userInfo.data.email,
                googleId: userInfo.data.id,
                googleAccessToken: tokens.access_token,
                googleRefreshToken: tokens.refresh_token || ''
            });
        } else {
            user.googleAccessToken = tokens.access_token;
            if (tokens.refresh_token)
                user.googleRefreshToken = tokens.refresh_token;
        }

        await user.save();

        return res.redirect(
            `http://localhost:5173/dashboard?googleId=${user.googleId}`
        );

    } catch (error) {
        console.error("Google Auth Error:", error);
        res.redirect('http://localhost:5173/?error=auth_failed');
    }
});


// ==========================================
// --- UNIVERSAL PROFILE FETCHER ---
// ==========================================

router.get('/me', async (req, res) => {
    try {
        const { googleId, spotifyId } = req.query;
        let user;

        if (googleId) user = await User.findOne({ googleId });
        else if (spotifyId) user = await User.findOne({ spotifyId });

        if (!user)
            return res.status(404).json({ error: "User not found." });

        res.json(user);

    } catch (error) {
        res.status(500).json({ error: "Failed to fetch profile." });
    }
});


// ==========================================
// --- SPOTIFY PLAYLISTS ---
// ==========================================

router.get('/playlists', async (req, res) => {
    try {
        const { spotifyId } = req.query;

        const user = await User.findOne({ spotifyId });

        if (!user || !user.spotifyAccessToken)
            return res.status(404).json({ error: "User not connected." });

        const response = await axios.get(
            'https://api.spotify.com/v1/me/playlists',
            { headers: { Authorization: `Bearer ${user.spotifyAccessToken}` } }
        );

        res.json(response.data.items);

    } catch (error) {
        console.error("Spotify Fetch Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch playlists" });
    }
});


// ==========================================
// --- YOUTUBE PLAYLISTS (Uses googleId) ---
// ==========================================

router.get('/youtube/playlists', async (req, res) => {
    try {
        const { googleId } = req.query;

        const user = await User.findOne({ googleId });

        if (!user || !user.googleAccessToken)
            return res.status(404).json({ error: "YouTube not connected." });

        oauth2Client.setCredentials({
            access_token: user.googleAccessToken,
            refresh_token: user.googleRefreshToken
        });

        const youtube = google.youtube({
            version: 'v3',
            auth: oauth2Client
        });

        const response = await youtube.playlists.list({
            part: 'snippet,contentDetails',
            mine: true,
            maxResults: 50
        });

        res.json(response.data.items || []);

    } catch (error) {
        console.error("YouTube Fetch Error:", error.message);
        res.status(500).json({ error: "Failed to fetch YouTube playlists" });
    }
});
// Fetch the actual songs/videos inside a specific YouTube playlist
router.get('/youtube/playlist-items', async (req, res) => {
    try {
        const { googleId, playlistId } = req.query;

        if (!playlistId) {
            return res.status(400).json({ error: "No Playlist ID provided." });
        }

        const user = await User.findOne({ googleId });

        if (!user || !user.googleAccessToken) {
            return res.status(404).json({ error: "YouTube not connected." });
        }

        // Load the user's keys
        oauth2Client.setCredentials({
            access_token: user.googleAccessToken,
            refresh_token: user.googleRefreshToken
        });

        const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

        // Ask Google for the items inside the specific playlist
        const response = await youtube.playlistItems.list({
            part: 'snippet',
            playlistId: playlistId,
            maxResults: 50 // Grabs up to 50 songs at a time
        });

        res.json(response.data.items || []);

    } catch (error) {
        console.error("YouTube Tracks Fetch Error:", error.message);
        res.status(500).json({ error: "Failed to fetch playlist tracks" });
    }
});
// ==========================================
// --- THE TRANSFER ENGINE ---
// ==========================================

router.post('/youtube/clone-playlist', async (req, res) => {
    try {
        const { googleId, sourcePlaylistId, newPlaylistName } = req.body;

        if (!googleId || !sourcePlaylistId || !newPlaylistName) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        const user = await User.findOne({ googleId });
        if (!user || !user.googleAccessToken) {
            return res.status(404).json({ error: "YouTube not connected." });
        }

        oauth2Client.setCredentials({
            access_token: user.googleAccessToken,
            refresh_token: user.googleRefreshToken
        });

        const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

        // 1. Fetch the songs from the source playlist
        const tracksResponse = await youtube.playlistItems.list({
            part: 'snippet',
            playlistId: sourcePlaylistId,
            maxResults: 50
        });
        const tracks = tracksResponse.data.items || [];

        if (tracks.length === 0) {
            return res.status(400).json({ error: "Source playlist is empty." });
        }

        // 2. Create the brand new empty playlist on YouTube
        const newPlaylistResponse = await youtube.playlists.insert({
            part: 'snippet,status',
            requestBody: {
                snippet: {
                    title: newPlaylistName,
                    description: 'Cloned via ConnectMusic 🎵'
                },
                status: {
                    privacyStatus: 'private' // Keep it private by default
                }
            }
        });
        const newPlaylistId = newPlaylistResponse.data.id;

        // 3. Loop through the tracks and push them into the new playlist
        // Note: We use a standard for-loop to avoid hitting Google's rate limits too fast
        let successCount = 0;
        for (const track of tracks) {
            try {
                await youtube.playlistItems.insert({
                    part: 'snippet',
                    requestBody: {
                        snippet: {
                            playlistId: newPlaylistId,
                            resourceId: {
                                kind: 'youtube#video',
                                videoId: track.snippet.resourceId.videoId // The actual YouTube Video ID
                            }
                        }
                    }
                });
                successCount++;
            } catch (trackError) {
                console.error(`Failed to copy track: ${track.snippet.title}`, trackError.message);
            }
        }
        // --- NEW: Save the receipt to MongoDB ---
        const historyLog = new History({
            googleId: googleId,
            sourceName: req.body.sourcePlaylistName, // We will pass this from React next!
            destinationName: 'YouTube Music',
            trackCount: successCount
        });
        await historyLog.save();

        res.json({
            success: true,
            message: `Successfully copied ${successCount}/${tracks.length} tracks!`,
            newPlaylistId
        });

    } catch (error) {
        console.error("Transfer Engine Error:", error.message);
        res.status(500).json({ error: "Transfer failed." });
    }
});
// Fetch user's transfer history
router.get('/history', async (req, res) => {
    try {
        const { googleId } = req.query;
        if (!googleId) return res.status(400).json({ error: "No user ID provided" });

        // Fetch logs and sort by newest first (-1)
        const logs = await History.find({ googleId }).sort({ createdAt: -1 });
        res.json(logs);
    } catch (error) {
        console.error("History Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch history." });
    }
});
export default router;