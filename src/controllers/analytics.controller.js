import eventModel from '../models/Event.js';
import sessionModel from '../models/Session.js';

export const trackEvent = async (req, res) => {
    try {
        const { sessionId, eventType, page_url, x, y, element } = req.body;

        if (!sessionId || !eventType || !page_url) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (eventType === 'click' && (x === undefined || y === undefined)) {
            return res.status(400).json({ message: 'Missing coordinates for click event' });
        }

        await eventModel.create({ sessionId, eventType, page_url, x, y, element });

        await sessionModel.findOneAndUpdate(
            { sessionId },
            {
                $inc: { eventCount: 1 },
                $set: { lastActivity: new Date() },
                $setOnInsert: { createdAt: new Date() },
            },
            { upsert: true, returnDocument: 'after' }
        );

        res.status(201).json({ message: 'Event tracked successfully' });
    } catch (error) {
        console.error('Error tracking event:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getSessions = async (req, res) => {
    try {
        const page  = parseInt(req.query.page)  || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip  = (page - 1) * limit;

        const [sessions, total] = await Promise.all([
            sessionModel.find().sort({ lastActivity: -1 }).skip(skip).limit(limit),
            sessionModel.countDocuments(),
        ]);

        res.status(200).json({
            data: sessions,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSessionEvents = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const [events, session] = await Promise.all([
            eventModel.find({ sessionId }).sort({ timestamp: 1 }),
            sessionModel.findOne({ sessionId }),
        ]);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        let duration_ms = 0;
        if (events.length >= 2) {
            duration_ms = new Date(events[events.length - 1].timestamp) - new Date(events[0].timestamp);
        }

        res.status(200).json({
            session,
            duration_ms,
            duration_readable: formatDuration(duration_ms),
            events,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getHeatmap = async (req, res) => {
    try {
        const { page_url } = req.query;
        if (!page_url) {
            return res.status(400).json({ message: 'page_url is required' });
        }

        const heatmapData = await eventModel.aggregate([
            { $match: { eventType: 'click', page_url } },
            {
                $group: {
                    _id: {
                        x: { $multiply: [{ $floor: { $divide: ['$x', 50] } }, 50] },
                        y: { $multiply: [{ $floor: { $divide: ['$y', 50] } }, 50] },
                    },
                    count:  { $sum: 1 },
                    points: { $push: { x: '$x', y: '$y' } },
                },
            },
            { $sort: { count: -1 } },
        ]);

        const totalClicks = heatmapData.reduce((sum, d) => sum + d.count, 0);
        const hottestZone = heatmapData[0] || null;

        res.status(200).json({
            page_url,
            total_clicks: totalClicks,
            hottest_zone: hottestZone
                ? { x: hottestZone._id.x, y: hottestZone._id.y, count: hottestZone.count }
                : null,
            heatmap: heatmapData.map(d => ({
                x:      d._id.x,
                y:      d._id.y,
                count:  d.count,
                points: d.points,
            })),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getStats = async (req, res) => {
    try {
        const [
            totalSessions,
            totalEvents,
            totalClicks,
            totalPageViews,
            topPages,
        ] = await Promise.all([
            sessionModel.countDocuments(),
            eventModel.countDocuments(),
            eventModel.countDocuments({ eventType: 'click' }),
            eventModel.countDocuments({ eventType: 'page_view' }),
            eventModel.aggregate([
                { $match: { eventType: 'page_view' } },
                { $group: { _id: '$page_url', visits: { $sum: 1 } } },
                { $sort: { visits: -1 } },
                { $limit: 5 },
            ]),
        ]);

        res.status(200).json({
            total_sessions:         totalSessions,
            total_events:           totalEvents,
            total_clicks:           totalClicks,
            total_page_views:       totalPageViews,
            avg_events_per_session: totalSessions > 0
                ? (totalEvents / totalSessions).toFixed(1)
                : 0,
            top_pages: topPages.map(p => ({ url: p._id, visits: p.visits })),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const formatDuration = (ms) => {
    if (ms < 1000) return '< 1s';
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    if (m === 0) return `${s}s`;
    return `${m}m ${s % 60}s`;
};