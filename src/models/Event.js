

import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, index: true },
    eventType: { type: String, enum: ['page_view', 'click'], required: true },
    page_url: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    x: { type: Number }, 
    y: { type: Number },

    element: {
        tag:     { type: String },    // button, a, div
        text:    { type: String },    // "Buy Now"
        id:      { type: String },    // "submit-btn"
        classes: { type: String },    // "btn-primary"
    }
});

const eventModel = mongoose.model('Event', eventSchema);

export default eventModel;