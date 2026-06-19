import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    lastActivity: { type: Date, default: Date.now },
    eventCount: { type: Number, default: 0 },
});

const sessionModel = mongoose.model('Session', sessionSchema);

export default sessionModel;