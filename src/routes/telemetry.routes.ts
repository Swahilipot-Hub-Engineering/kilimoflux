import { Router, Request, Response } from 'express';
import { parseLoraUplink } from '../iot/decoder.js';
import { farmManager } from '../engine/farm-manager.js';
import { WeatherTelemetry } from '../models/types.js';

export const telemetryRouter = Router();

/**
 * POST /api/v1/telemetry/lorawan
 * Receives standard LoRaWAN webhook uplinks from ChirpStack or TTN
 */
telemetryRouter.post('/lorawan', (req: Request, res: Response): void => {
  try {
    const farmId = (req.query.farmId as string) || req.body.farmId || 'farm-kilifi-01';
    const parcelId = (req.query.parcelId as string) || req.body.parcelId || 'parcel-kilifi-cassava';

    const telemetry = parseLoraUplink(req.body, farmId, parcelId);
    farmManager.addSoilTelemetry(telemetry);

    res.status(201).json({
      success: true,
      message: 'LoRaWAN telemetry processed successfully',
      data: telemetry
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ success: false, error: message });
  }
});

/**
 * POST /api/v1/telemetry/raw
 * Direct JSON telemetry ingest from ESP32 or custom gateway
 */
telemetryRouter.post('/raw', (req: Request, res: Response): void => {
  try {
    const { farmId, parcelId, vwc, temperature, ec, battery, ph, n, p, k } = req.body;
    if (!farmId || !parcelId) {
      res.status(400).json({ success: false, error: 'farmId and parcelId are required' });
      return;
    }

    const telemetry = {
      nodeId: req.body.nodeId || `node-${Math.random().toString(36).substring(2, 8)}`,
      farmId,
      parcelId,
      zoneId: req.body.zoneId,
      volumetricWaterContent: Number(vwc ?? 25.0),
      soilTemperatureC: Number(temperature ?? 24.0),
      soilEcMicroSiemensCm: Number(ec ?? 350),
      phLevel: ph !== undefined ? Number(ph) : undefined,
      nitrogenMgKg: n !== undefined ? Number(n) : undefined,
      phosphorusMgKg: p !== undefined ? Number(p) : undefined,
      potassiumMgKg: k !== undefined ? Number(k) : undefined,
      batteryMillivolts: Number(battery ?? 3600),
      metadata: {
        devEUI: req.body.devEUI || 'DIRECT-IP',
        fPort: 1,
        fCnt: 1,
        rssi: -75,
        snr: 9.0,
        receivedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };

    farmManager.addSoilTelemetry(telemetry);
    res.status(201).json({ success: true, data: telemetry });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ success: false, error: message });
  }
});

/**
 * GET /api/v1/telemetry/latest/:parcelId
 */
telemetryRouter.get('/latest/:parcelId', (req: Request, res: Response): void => {
  const parcelId = Array.isArray(req.params.parcelId) ? req.params.parcelId[0] : req.params.parcelId;
  const telemetry = farmManager.getLatestSoilTelemetry(parcelId);
  if (!telemetry) {
    res.status(404).json({ success: false, error: 'No telemetry found for parcel' });
    return;
  }
  res.json({ success: true, data: telemetry });
});

/**
 * POST /api/v1/telemetry/weather
 */
telemetryRouter.post('/weather', (req: Request, res: Response): void => {
  try {
    const { farmId, ambientTemp, humidity, solarRad, windSpeed, rainForecast24h } = req.body;
    if (!farmId) {
      res.status(400).json({ success: false, error: 'farmId is required' });
      return;
    }

    const weather: WeatherTelemetry = {
      stationId: req.body.stationId || `wx-${farmId}`,
      farmId,
      ambientTemperatureC: Number(ambientTemp ?? 25),
      relativeHumidityPercent: Number(humidity ?? 60),
      solarRadiationWm2: Number(solarRad ?? 650),
      windSpeedMs: Number(windSpeed ?? 2.5),
      atmosphericPressureKpa: 101.3,
      rainfallMmPastHour: Number(req.body.rainfallPastHour ?? 0),
      forecastRainfallMmNext24h: Number(rainForecast24h ?? 0),
      timestamp: new Date().toISOString()
    };

    farmManager.updateWeather(weather);
    res.status(201).json({ success: true, data: weather });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ success: false, error: message });
  }
});
