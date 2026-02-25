import express from 'express';
import axios from 'axios';
import User from '../models/User.js';

const router = express.Router();

// 1. Redirect the user to Spotify's login page
router.get('/spotify', (req, res) => {
    // These are the permissions we are asking the user for
    const scope = 'user-read-private user-read-email playlist-read-private playlist-modify-public playlist-modify-private';

    const queryParams = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope: scope,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    });

    res.redirect(`https://accounts.spotify.com/authorize?${queryParams.toString()}`);
});

// 2. Spotify sends the user back here with a "code"
router.get('/spotify/callback', async (req, res) => {
    const code = req.query.code || null;

    if (!code) {
        return res.status(400).json({ error: 'Authorization code missing' });
    }

    try {
        // Trade the code for an Access Token
        const tokenResponse = await axios({
            method: 'post',
            url: 'https://accounts.spotify.com/api/token',
            data: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
            }).toString(),
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`
            }
        });

        const { access_token, refresh_token } = tokenResponse.data;

        // Use the access token to get the user's Spotify profile data
        const profileResponse = await axios.get('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const spotifyData = profileResponse.data;

        // Find the user in our database, or create a new one if they don't exist
        let user = await User.findOne({ spotifyId: spotifyData.id });

        if (!user) {
            user = new User({
                displayName: spotifyData.display_name,
                email: spotifyData.email,
                spotifyId: spotifyData.id,
                spotifyAccessToken: access_token,
                spotifyRefreshToken: refresh_token,
            });
        } else {
            // If they exist, just update their tokens
            user.spotifyAccessToken = access_token;
            user.spotifyRefreshToken = refresh_token;
        }

        await user.save();

        // Success! For now, we will just send a success message to the browser.
        // Later, we will redirect them to your React frontend dashboard.
        // ... (previous code where user is saved)
        await user.save();

        // REMOVE THIS OLD JSON RESPONSE:
        // res.status(200).json({ 
        //     message: "Successfully logged in with Spotify and saved to Database!",
        //     user: user.displayName 
        // });

        // ADD THIS NEW REDIRECT:
        // This sends the user back to your React frontend!
        res.redirect('http://localhost:5173/dashboard');



    } catch (error) {
        console.error("Error during Spotify Auth:", error?.response?.data || error.message);
        res.status(500).json({ error: 'Failed to authenticate with Spotify' });
    }
});

export default router;