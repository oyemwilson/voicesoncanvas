// routes/dhlRoutes.js
import express from 'express';
import { createDhlShipmentHandler, pollDhlTrackingHandler } from '../controllers/dhlController.js';
const router = express.Router();

router.post('/dhl/create', createDhlShipmentHandler);
router.get('/dhl/track/:trackingNumber', pollDhlTrackingHandler);

export default router;
