import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
    googleId: String,
    sourceName: String,
    destinationName: String,
    trackCount: Number,
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('History', historySchema);