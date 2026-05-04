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

/**
 * ============================================================================
 * SPOTIFY AUTHENTICATION PIPELINE
 * ============================================================================
 * Handles the OAuth 2.0 flow for Spotify integration.
 * Currently uses standard (free) Web API scopes to read user playlists.
 */

/**
 * @route   GET /api/auth/spotify
 * @desc    Initiates the Spotify login sequence.
 * @access  Public (Redirects to Spotify)
 */
router.get('/spotify', (req, res) => {
    const spotifyApi = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID.trim(),
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET.trim(),
        redirectUri: process.env.SPOTIFY_REDIRECT_URI.trim()
    });

    // We specifically do NOT ask for streaming permissions to avoid the Premium requirement.
    const scopes = [
        'user-read-private', 
        'user-read-email',
        'playlist-read-private',
        'playlist-read-collaborative', // Needed to read collaborative playlists
        'playlist-modify-public',      // In case we want to push TO Spotify later
        'playlist-modify-private'
    ];

    res.redirect(spotifyApi.createAuthorizeURL(scopes, 'auth-state', true));
});

/**
 * @route   GET /api/auth/spotify/callback
 * @desc    Handles the callback from Spotify after user grants permission.
 *          Exchanges the auth code for access/refresh tokens.
 * @access  Public (Called by Spotify)
 */
router.get('/spotify/callback', async (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).json({ error: 'Authorization code missing from Spotify payload' });
    }

    const spotifyApi = new SpotifyWebApi({
        clientId: process.env.SPOTIFY_CLIENT_ID.trim(),
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET.trim(),
        redirectUri: process.env.SPOTIFY_REDIRECT_URI.trim()
    });

    try {
        // Exchange authorization code for tokens
        const data = await spotifyApi.authorizationCodeGrant(code);
        const access_token = data.body['access_token'];
        const refresh_token = data.body['refresh_token'];

        // Fetch basic profile info to associate the tokens with a user
        const profileResponse = await axios.get(
            'https://api.spotify.com/v1/me', 
            { headers: { Authorization: `Bearer ${access_token}` } }
        );

        const userProfile = profileResponse.data;

        // Upsert User Database Entry
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

        // Redirect back to frontend dashboard with the Spotify ID attached
        res.redirect(`${process.env.CLIENT_URL}/dashboard?spotifyId=${user.spotifyId}`);

    } catch (error) {
        console.error("SPOTIFY AUTH ERROR:", error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to complete Spotify authentication sequence' });
    }
});


/**
 * ============================================================================
 * GOOGLE / YOUTUBE PRIMARY AUTHENTICATION
 * ============================================================================
 * Serves as the primary account system for ConnectMusic. 
 * Allows users to read and write to their YouTube Music library.
 */

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID.trim(),
    process.env.GOOGLE_CLIENT_SECRET.trim(),
    process.env.GOOGLE_REDIRECT_URI.trim()
);

/**
 * @route   GET /api/auth/google
 * @desc    Initiates Google OAuth. Can accept a spotifyId state parameter 
 *          to link accounts together during callback.
 */
router.get('/google', (req, res) => {
    const { spotifyId } = req.query;

    const scopes = [
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ];

    const authConfig = {
        access_type: 'offline', // Crucial: Requests refresh token for long-term access
        prompt: 'consent',      // Forces Google to always return a refresh token
        scope: scopes
    };

    // Pass the spotifyId through the OAuth flow to link accounts later
    if (spotifyId) authConfig.state = spotifyId;

    res.redirect(oauth2Client.generateAuthUrl(authConfig));
});

/**
 * @route   GET /api/auth/google/callback
 * @desc    Handles Google token exchange. Handles both fresh logins and account linking.
 */
router.get('/google/callback', async (req, res) => {
    const { code, state: spotifyId } = req.query;

    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
        const userInfo = await oauth2.userinfo.get();

        let user;

        // ACCOUNT LINKING FLOW: If a Spotify ID was passed, attach Google data to that user
        if (spotifyId) {
            user = await User.findOne({ spotifyId });

            if (user) {
                user.googleId = userInfo.data.id;
                user.googleAccessToken = tokens.access_token;
                if (tokens.refresh_token) user.googleRefreshToken = tokens.refresh_token;
                await user.save();
            }

            return res.redirect(`${process.env.CLIENT_URL}/platforms`);
        }

        // STANDARD LOGIN FLOW
        user = await User.findOne({ googleId: userInfo.data.id });

        if (!user) {
            user = new User({
                displayName: userInfo.data.name,
                email: userInfo.data.email,
                googleId: userInfo.data.id,
                googleAccessToken: tokens.access_token,
                googleRefreshToken: tokens.refresh_token || '' // Save if provided
            });
        } else {
            user.googleAccessToken = tokens.access_token;
            if (tokens.refresh_token) user.googleRefreshToken = tokens.refresh_token;
        }

        await user.save();

        res.redirect(`${process.env.CLIENT_URL}/dashboard?googleId=${user.googleId}`);

    } catch (error) {
        console.error("Google Auth Error:", error);
        res.redirect(`${process.env.CLIENT_URL}/?error=auth_failed`);
    }
});


/**
 * ============================================================================
 * UNIVERSAL DATA ROUTES
 * ============================================================================
 */

/**
 * @route   GET /api/auth/me
 * @desc    Fetches complete user profile. Accepts either googleId or spotifyId.
 */
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


/**
 * ============================================================================
 * SPOTIFY DATA FETCHERS
 * ============================================================================
 */

/**
 * @route   GET /api/auth/playlists
 * @desc    Fetches the user's Spotify playlists.
 */
router.get('/playlists', async (req, res) => {
    try {
        const { spotifyId } = req.query;
        const user = await User.findOne({ spotifyId });

        if (!user || !user.spotifyAccessToken) return res.status(404).json({ error: "Spotify account not connected." });

        const response = await axios.get(
            'https://api.spotify.com/v1/me/playlists', 
            { headers: { Authorization: `Bearer ${user.spotifyAccessToken}` } }
        );

        res.json(response.data.items);

    } catch (error) {
        console.error("Spotify Fetch Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to fetch Spotify playlists." });
    }
});


/**
 * ============================================================================
 * YOUTUBE DATA FETCHERS
 * ============================================================================
 */

/**
 * @route   GET /api/auth/youtube/playlists
 * @desc    Fetches up to 50 playlists belonging to the authenticated Google user.
 */
router.get('/youtube/playlists', async (req, res) => {
    try {
        const { googleId } = req.query;
        const user = await User.findOne({ googleId });

        if (!user || !user.googleAccessToken) return res.status(404).json({ error: "YouTube account not connected." });

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
        res.status(500).json({ error: "Failed to fetch YouTube playlists." });
    }
});

/**
 * @route   GET /api/auth/youtube/playlist-items
 * @desc    Fetches the tracks inside a specific YouTube playlist.
 */
router.get('/youtube/playlist-items', async (req, res) => {
    try {
        const { googleId, playlistId } = req.query;

        if (!playlistId) return res.status(400).json({ error: "No Playlist ID provided." });

        const user = await User.findOne({ googleId });
        if (!user || !user.googleAccessToken) return res.status(404).json({ error: "YouTube account not connected." });

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
        res.status(500).json({ error: "Failed to fetch playlist tracks." });
    }
});


/**
 * ============================================================================
 * THE TRANSFER ENGINE (Legacy YouTube-to-YouTube clone)
 * ============================================================================
 * Currently clones a YouTube playlist. Will be adapted for Spotify-to-YouTube.
 */
router.post('/youtube/clone-playlist', async (req, res) => {
    try {
        const { googleId, sourcePlaylistId, newPlaylistName, sourcePlaylistName } = req.body;

        if (!googleId || !sourcePlaylistId || !newPlaylistName) {
            return res.status(400).json({ error: "Missing required fields for clone operation." });
        }

        const user = await User.findOne({ googleId });
        if (!user || !user.googleAccessToken) return res.status(404).json({ error: "YouTube account not connected." });

        oauth2Client.setCredentials({
            access_token: user.googleAccessToken,
            refresh_token: user.googleRefreshToken
        });

        const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

        // 1. Fetch tracks from source
        const tracksResponse = await youtube.playlistItems.list({
            part: 'snippet',
            playlistId: sourcePlaylistId,
            maxResults: 50
        });
        const tracks = tracksResponse.data.items || [];

        if (tracks.length === 0) return res.status(400).json({ error: "Source playlist is empty." });

        // 2. Create the new destination playlist
        const newPlaylistResponse = await youtube.playlists.insert({
            part: 'snippet,status',
            requestBody: {
                snippet: {
                    title: newPlaylistName,
                    description: 'Cloned via ConnectMusic Engine 🎵'
                },
                status: {
                    privacyStatus: 'private' // Default to private for safety
                }
            }
        });
        const newPlaylistId = newPlaylistResponse.data.id;

        // 3. Iterate and copy tracks
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

        // 4. Log the transfer
        const historyLog = new History({
            googleId: googleId,
            sourceName: sourcePlaylistName || 'Unknown Playlist',
            destinationName: 'YouTube Music Clone',
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
        res.status(500).json({ error: "Transfer operation failed." });
    }
});


/**
 * ============================================================================
 * HISTORY & EXPORT UTILITIES
 * ============================================================================
 */

router.get('/history', async (req, res) => {
    try {
        const { googleId } = req.query;
        if (!googleId) return res.status(400).json({ error: "No user ID provided." });

        const logs = await History.find({ googleId }).sort({ createdAt: -1 });
        res.json(logs);
    } catch (error) {
        console.error("History Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch history logs." });
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
        console.error("Preview Generation Error:", error.message);
        res.status(500).json({ error: "Failed to generate track preview." });
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
        console.error("CSV Export Error:", error);
        res.status(500).send("Export failed");
    }
});

/**
 * ============================================================================
 * ACCOUNT MANAGEMENT
 * ============================================================================
 */
router.post('/spotify/unlink', async (req, res) => {
    try {
        const { googleId } = req.body;
        
        await User.findOneAndUpdate(
            { googleId }, 
            { $unset: { spotifyId: 1, spotifyAccessToken: 1, spotifyRefreshToken: 1 } }
        );

        res.json({ success: true, message: "Spotify disconnected successfully." });
    } catch (error) {
        console.error("Spotify Unlink Error:", error);
        res.status(500).json({ error: "Failed to unlink Spotify account." });
    }
});

export default router;