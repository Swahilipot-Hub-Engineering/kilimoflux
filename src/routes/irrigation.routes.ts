import { Router, Request, Response } from 'express';
import { farmManager } from '../engine/farm-manager.js';

export const irrigationRouter = Router();

/**
 * GET /api/v1/irrigation/recommendations
 * Computes multimodal FAO-56 precision irrigation recommendations
 */
irrigationRouter.get('/recommendations', (req: Request, res: Response): void => {
  try {
    const farmId = req.query.farmId as string | undefined;
    const recommendations = farmManager.getIrrigationRecommendations(farmId);
    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

/**
 * POST /api/v1/irrigation/zones/:id/actuate
 * Commands a valve to open or close, generating a LoRaWAN downlink payload
 */
irrigationRouter.post('/zones/:id/actuate', (req: Request, res: Response): void => {
  try {
    const zoneId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { action, durationMinutes, triggeredBy } = req.body;

    if (!action || !['OPEN', 'CLOSE'].includes(action)) {
      res.status(400).json({ success: false, error: 'action must be either OPEN or CLOSE' });
      return;
    }

    const duration = durationMinutes ? parseInt(durationMinutes, 10) : 30;
    const trigger = triggeredBy || 'MANUAL_OVERRIDE';

    const result = farmManager.actuateValve(zoneId, action, duration, trigger);

    res.json({
      success: true,
      message: `Valve command ${action} queued successfully`,
      data: {
        zone: result.zone,
        downlinkHex: result.downlink.dataHex,
        downlinkBase64: result.downlink.dataBase64,
        devEUI: result.downlink.devEUI,
        durationMinutes: duration,
        triggeredBy: trigger
      }
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ success: false, error: message });
  }
});

/**
 * GET /api/v1/irrigation/downlinks
 * Returns queued LoRaWAN downlinks for ChirpStack/TTN polling
 */
irrigationRouter.get('/downlinks', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    data: farmManager.getDownlinkQueue()
  });
});
