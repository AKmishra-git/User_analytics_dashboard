import express from 'express';
import {
  trackEvent,
  getSessions,
  getSessionEvents,
  getHeatmap,
  getStats
} from '../controllers/analytics.controller.js';

const router = express.Router();

router.post('/events',                     trackEvent);
router.get('/sessions',                    getSessions);
router.get('/sessions/:sessionId/events',  getSessionEvents);
router.get('/heatmap',                     getHeatmap);
router.get('/stats',                       getStats);
export default router;