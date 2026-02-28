import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    displayName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true, // Allows OAuth-only users without email
    },

    // --- Spotify Auth ---
    spotifyId: {
      type: String,
      unique: true,
      sparse: true,
    },
    spotifyAccessToken: String,
    spotifyRefreshToken: String,

    // --- Google / YouTube Auth ---
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    googleAccessToken: String,
    googleRefreshToken: String,

    // Optional: If you want to keep youtubeId separate from googleId
    youtubeId: {
      type: String,
      unique: true,
      sparse: true,
    },
    youtubeAccessToken: String,
    youtubeRefreshToken: String,
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

const User = mongoose.model('User', userSchema);

export default User;