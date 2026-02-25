import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        displayName: { 
            type: String, 
            required: true 
        },
        email: { 
            type: String, 
            unique: true,
            sparse: true // Allows users to sign up without an email if the platform doesn't provide one
        },
        
        // --- Spotify Credentials ---
        spotifyId: { 
            type: String, 
            unique: true, 
            sparse: true 
        },
        spotifyAccessToken: { type: String },
        spotifyRefreshToken: { type: String },

        // --- YouTube Credentials ---
        youtubeId: { 
            type: String, 
            unique: true, 
            sparse: true 
        },
        youtubeAccessToken: { type: String },
        youtubeRefreshToken: { type: String },
    },
    { 
        timestamps: true // Automatically adds 'createdAt' and 'updatedAt' fields
    }
);

const User = mongoose.model('User', userSchema);

export default User;