import express from 'express';
import SpotifyWebApi from 'spotify-web-api-node';
import axios from 'axios';
import User from '../models/User.js';
import dotenv from 'dotenv';
import History from '../models/History.js';
import cleanTrackData from '../utils/sanitizer.js';
import { Parser } from 'json2csv';
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

        // UPDATED FOR PRODUCTION
        res.redirect(`https://connectmusic-bay.vercel.app/dashboard?spotifyId=${user.spotifyId}`);

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

router.get('/google/callback', async (req, res) => {
    const { code, state: spotifyId } = req.query;

    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
        const userInfo = await oauth2.userinfo.get();

        let user;

        if (spotifyId) {
            user = await User.findOne({ spotifyId });

            if (user) {
                user.googleId = userInfo.data.id;
                user.googleAccessToken = tokens.access_token;
                if (tokens.refresh_token) user.googleRefreshToken = tokens.refresh_token;
                await user.save();
            }

            // UPDATED FOR PRODUCTION
            return res.redirect('https://connectmusic-bay.vercel.app/platforms');
        }

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
            if (tokens.refresh_token) user.googleRefreshToken = tokens.refresh_token;
        }

        await user.save();

        // UPDATED FOR PRODUCTION
        return res.redirect(`https://connectmusic-bay.vercel.app/dashboard?googleId=${user.googleId}`);

    } catch (error) {
        console.error("Google Auth Error:", error);
        // UPDATED FOR PRODUCTION
        res.redirect('https://connectmusic-bay.vercel.app/?error=auth_failed');
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

        if (!user) return res.status(404).json({ error: "User not found." });

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

        if (!user || !user.spotifyAccessToken) return res.status(404).json({ error: "User not connected." });

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
// --- YOUTUBE PLAYLISTS ---
// ==========================================

router.get('/youtube/playlists', async (req, res) => {
    try {
        const { googleId } = req.query;
        const user = await User.findOne({ googleId });

        if (!user || !user.googleAccessToken) return res.status(404).json({ error: "YouTube not connected." });

        oauth2Client.setCredentials({
            access_token: user.googleAccessToken,
            refresh_token: user.googleRefreshToken
        });

        const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

        const response = await youtube.playlists.list({
            part: 'snippet,contentDetails,status', 
            mine: true,
            maxResults: 50
        });

        res.json(response.data.items || []);

    } catch (error) {
        console.error("YouTube Fetch Error:", error.message);
        res.status(500).json({ error: "Failed to fetch YouTube playlists" });
    }
});

router.get('/youtube/playlist-items', async (req, res) => {
    try {
        const { googleId, playlistId } = req.query;

        if (!playlistId) return res.status(400).json({ error: "No Playlist ID provided." });

        const user = await User.findOne({ googleId });
        if (!user || !user.googleAccessToken) return res.status(404).json({ error: "YouTube not connected." });

        oauth2Client.setCredentials({
            access_token: user.googleAccessToken,
            refresh_token: user.googleRefreshToken
        });

        const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

        const response = await youtube.playlistItems.list({
            part: 'snippet',
            playlistId: playlistId,
            maxResults: 50 
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
        const { googleId, sourcePlaylistId, newPlaylistName, sourcePlaylistName } = req.body;

        if (!googleId || !sourcePlaylistId || !newPlaylistName) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        const user = await User.findOne({ googleId });
        if (!user || !user.googleAccessToken) return res.status(404).json({ error: "YouTube not connected." });

        oauth2Client.setCredentials({
            access_token: user.googleAccessToken,
            refresh_token: user.googleRefreshToken
        });

        const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

        const tracksResponse = await youtube.playlistItems.list({
            part: 'snippet',
            playlistId: sourcePlaylistId,
            maxResults: 50
        });
        const tracks = tracksResponse.data.items || [];

        if (tracks.length === 0) return res.status(400).json({ error: "Source playlist is empty." });

        const newPlaylistResponse = await youtube.playlists.insert({
            part: 'snippet,status',
            requestBody: {
                snippet: {
                    title: newPlaylistName,
                    description: 'Cloned via ConnectMusic 🎵'
                },
                status: {
                    privacyStatus: 'private' 
                }
            }
        });
        const newPlaylistId = newPlaylistResponse.data.id;

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
                                videoId: track.snippet.resourceId.videoId 
                            }
                        }
                    }
                });
                successCount++;
            } catch (trackError) {
                console.error(`Failed to copy track: ${track.snippet.title}`, trackError.message);
            }
        }

        const historyLog = new History({
            googleId: googleId,
            sourceName: sourcePlaylistName || 'Unknown Playlist',
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


// ==========================================
// --- HISTORY & EXPORT ENGINES ---
// ==========================================

router.get('/history', async (req, res) => {
    try {
        const { googleId } = req.query;
        if (!googleId) return res.status(400).json({ error: "No user ID provided" });

        const logs = await History.find({ googleId }).sort({ createdAt: -1 });
        res.json(logs);
    } catch (error) {
        console.error("History Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch history." });
    }
});

router.get('/youtube/preview-clean', async (req, res) => {
    try {
        const { googleId, playlistId } = req.query;
        if (!playlistId) return res.status(400).json({ error: "Missing Playlist ID" });

        const user = await User.findOne({ googleId });
        if (!user) return res.status(404).json({ error: "User not found" });

        oauth2Client.setCredentials({
            access_token: user.googleAccessToken,
            refresh_token: user.googleRefreshToken
        });

        const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

        const response = await youtube.playlistItems.list({
            part: 'snippet',
            playlistId: playlistId,
            maxResults: 50
        });

        const cleanedTracks = response.data.items.map(item => {
            const rawTitle = item.snippet.title;
            const channelName = item.snippet.videoOwnerChannelTitle || "";
            const metadata = cleanTrackData(rawTitle, channelName);

            return {
                id: item.id,
                originalTitle: rawTitle,
                cleanedMetadata: metadata
            };
        });

        res.json(cleanedTracks);

    } catch (error) {
        console.error("Preview Error:", error.message);
        res.status(500).json({ error: "Failed to generate preview." });
    }
});

router.get('/youtube/export', async (req, res) => {
    try {
        const { googleId, playlistId } = req.query;

        const user = await User.findOne({ googleId });
        if (!user) return res.status(404).send("User not found");

        oauth2Client.setCredentials({
            access_token: user.googleAccessToken,
            refresh_token: user.googleRefreshToken
        });

        const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
        const response = await youtube.playlistItems.list({
            part: 'snippet',
            playlistId: playlistId,
            maxResults: 50 
        });

        const cleanTracks = response.data.items.map(item => {
            const { artist, track } = cleanTrackData(item.snippet.title, item.snippet.videoOwnerChannelTitle);
            return {
                Title: track,
                Artist: artist,
                Album: "Unknown (YouTube Export)",
                Original_Source: "YouTube Music"
            };
        });

        const fields = ['Title', 'Artist', 'Album', 'Original_Source'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(cleanTracks);

        res.header('Content-Type', 'text/csv');
        res.attachment(`playlist_export.csv`);
        return res.send(csv);

    } catch (error) {
        console.error("Export Error:", error);
        res.status(500).send("Export failed");
    }
});

// ==========================================
// --- UNLINK ACCOUNTS ---
// ==========================================

router.post('/spotify/unlink', async (req, res) => {
    try {
        const { googleId } = req.body;
        
        await User.findOneAndUpdate(
            { googleId }, 
            { $unset: { spotifyId: 1, spotifyAccessToken: 1, spotifyRefreshToken: 1 } }
        );

        res.json({ success: true, message: "Spotify disconnected successfully." });
    } catch (error) {
        console.error("Unlink Error:", error);
        res.status(500).json({ error: "Failed to unlink account." });
    }
});

export default router;