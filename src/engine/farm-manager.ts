import { EventEmitter } from 'events';
import {
  Farm,
  Parcel,
  IrrigationZone,
  SoilTelemetry,
  WeatherTelemetry,
  SatelliteObservation,
  IrrigationRecommendation,
  ValveActuationCommand
} from '../models/types.js';
import { generateIrrigationRecommendation } from '../ai/fao-irrigation.js';
import { satelliteProcessor } from '../satellite/processor.js';
import { encodeValveDownlink, LoraDownlinkQueueItem } from '../iot/downlink.js';

export class FarmManager extends EventEmitter {
  private farms: Map<string, Farm> = new Map();
  private soilTelemetryHistory: Map<string, SoilTelemetry[]> = new Map();
  private latestWeather: Map<string, WeatherTelemetry> = new Map();
  private downlinkQueue: LoraDownlinkQueueItem[] = [];

  constructor() {
    super();
    this.seedDefaultFarms();
  }

  private seedDefaultFarms() {
    // 1. Kilifi Coastal Shamba (Mombasa / Pwani Region)
    const kilifiFarm: Farm = {
      id: 'farm-kilifi-01',
      name: 'Kilifi Coastal Shamba',
      county: 'Kilifi',
      ownerName: 'Amina Mwangi',
      phone: '+254712345678',
      center: { latitude: -3.6305, longitude: 39.8499 },
      parcels: [
        {
          id: 'parcel-kilifi-cassava',
          farmId: 'farm-kilifi-01',
          name: 'Block A (Tajirika Cassava)',
          cropType: 'CASSAVA',
          variety: 'Tajirika KME-1',
          plantingDate: '2026-06-15',
          growthStage: 'MID_SEASON',
          areaHectares: 1.2,
          soilType: 'SANDY_LOAM',
          rootDepthMeters: 0.8,
          polygon: {
            type: 'Polygon',
            coordinates: [
              [
                [39.8480, -3.6295],
                [39.8510, -3.6295],
                [39.8510, -3.6315],
                [39.8480, -3.6315],
                [39.8480, -3.6295]
              ]
            ]
          }
        },
        {
          id: 'parcel-kilifi-tomato',
          farmId: 'farm-kilifi-01',
          name: 'Block B (Kilele F1 Tomatoes)',
          cropType: 'TOMATO',
          variety: 'Kilele F1',
          plantingDate: '2026-08-01',
          growthStage: 'DEVELOPMENT',
          areaHectares: 0.8,
          soilType: 'SANDY_LOAM',
          rootDepthMeters: 0.5,
          polygon: {
            type: 'Polygon',
            coordinates: [
              [
                [39.8515, -3.6295],
                [39.8540, -3.6295],
                [39.8540, -3.6315],
                [39.8515, -3.6315],
                [39.8515, -3.6295]
              ]
            ]
          }
        }
      ],
      zones: [
        {
          id: 'zone-kilifi-z1',
          farmId: 'farm-kilifi-01',
          parcelId: 'parcel-kilifi-cassava',
          name: 'Drip Zone 1 (Cassava)',
          valveDevEUI: 'A84041000181A001',
          valveStatus: 'CLOSED',
          flowRateLpm: 60,
          targetMoistureMin: 20.0,
          targetMoistureMax: 35.0
        },
        {
          id: 'zone-kilifi-z2',
          farmId: 'farm-kilifi-01',
          parcelId: 'parcel-kilifi-tomato',
          name: 'Drip Zone 2 (Tomato)',
          valveDevEUI: 'A84041000181A002',
          valveStatus: 'CLOSED',
          flowRateLpm: 45,
          targetMoistureMin: 28.0,
          targetMoistureMax: 42.0
        }
      ]
    };

    // 2. Naivasha Greenhouse Shamba (Nakuru County / Rift Valley)
    const naivashaFarm: Farm = {
      id: 'farm-naivasha-02',
      name: 'Naivasha Precision Greens',
      county: 'Nakuru',
      ownerName: 'James Kariuki',
      phone: '+254722987654',
      center: { latitude: -0.7172, longitude: 36.4310 },
      parcels: [
        {
          id: 'parcel-naivasha-beans',
          farmId: 'farm-naivasha-02',
          name: 'Greenhouse 1 (French Beans)',
          cropType: 'FRENCH_BEANS',
          variety: 'Serengeti Export',
          plantingDate: '2026-08-20',
          growthStage: 'DEVELOPMENT',
          areaHectares: 0.5,
          soilType: 'CLAY_LOAM',
          rootDepthMeters: 0.4,
          polygon: {
            type: 'Polygon',
            coordinates: [
              [
                [36.4290, -0.7160],
                [36.4320, -0.7160],
                [36.4320, -0.7180],
                [36.4290, -0.7180],
                [36.4290, -0.7160]
              ]
            ]
          }
        }
      ],
      zones: [
        {
          id: 'zone-naivasha-z1',
          farmId: 'farm-naivasha-02',
          parcelId: 'parcel-naivasha-beans',
          name: 'Drip Zone 1 (Greenhouse Beans)',
          valveDevEUI: 'A84041000181B001',
          valveStatus: 'CLOSED',
          flowRateLpm: 35,
          targetMoistureMin: 30.0,
          targetMoistureMax: 45.0
        }
      ]
    };

    // 3. Uasin Gishu Grain Shamba (Eldoret / North Rift)
    const uasinGishuFarm: Farm = {
      id: 'farm-eldoret-03',
      name: 'Eldoret Highland Maize Shamba',
      county: 'Uasin Gishu',
      ownerName: 'Kiprono Cheruiyot',
      phone: '+254733112233',
      center: { latitude: 0.5143, longitude: 35.2698 },
      parcels: [
        {
          id: 'parcel-eldoret-maize',
          farmId: 'farm-eldoret-03',
          name: 'North Field (H614D Hybrid Maize)',
          cropType: 'MAIZE',
          variety: 'H614D',
          plantingDate: '2026-04-10',
          growthStage: 'MID_SEASON',
          areaHectares: 2.5,
          soilType: 'RED_VOLCANIC',
          rootDepthMeters: 1.0,
          polygon: {
            type: 'Polygon',
            coordinates: [
              [
                [35.2670, 0.5120],
                [35.2720, 0.5120],
                [35.2720, 0.5160],
                [35.2670, 0.5160],
                [35.2670, 0.5120]
              ]
            ]
          }
        }
      ],
      zones: [
        {
          id: 'zone-eldoret-z1',
          farmId: 'farm-eldoret-03',
          parcelId: 'parcel-eldoret-maize',
          name: 'Pivot Zone 1 (Maize)',
          valveDevEUI: 'A84041000181C001',
          valveStatus: 'CLOSED',
          flowRateLpm: 120,
          targetMoistureMin: 22.0,
          targetMoistureMax: 38.0
        }
      ]
    };

    this.farms.set(kilifiFarm.id, kilifiFarm);
    this.farms.set(naivashaFarm.id, naivashaFarm);
    this.farms.set(uasinGishuFarm.id, uasinGishuFarm);

    // Seed default baseline weather
    this.latestWeather.set(kilifiFarm.id, {
      stationId: 'wx-kilifi-01',
      farmId: kilifiFarm.id,
      ambientTemperatureC: 28.5,
      relativeHumidityPercent: 72,
      solarRadiationWm2: 650,
      windSpeedMs: 3.2,
      atmosphericPressureKpa: 101.2,
      rainfallMmPastHour: 0.0,
      forecastRainfallMmNext24h: 1.2,
      timestamp: new Date().toISOString()
    });

    this.latestWeather.set(naivashaFarm.id, {
      stationId: 'wx-naivasha-01',
      farmId: naivashaFarm.id,
      ambientTemperatureC: 22.0,
      relativeHumidityPercent: 55,
      solarRadiationWm2: 720,
      windSpeedMs: 2.1,
      atmosphericPressureKpa: 82.5,
      rainfallMmPastHour: 0.0,
      forecastRainfallMmNext24h: 0.0,
      timestamp: new Date().toISOString()
    });

    this.latestWeather.set(uasinGishuFarm.id, {
      stationId: 'wx-eldoret-01',
      farmId: uasinGishuFarm.id,
      ambientTemperatureC: 21.0,
      relativeHumidityPercent: 60,
      solarRadiationWm2: 700,
      windSpeedMs: 2.8,
      atmosphericPressureKpa: 79.8,
      rainfallMmPastHour: 0.0,
      forecastRainfallMmNext24h: 2.0,
      timestamp: new Date().toISOString()
    });

    // Seed initial satellite observations
    satelliteProcessor.processParcelObservation(
      kilifiFarm.parcels[0],
      { b02_blue: 0.04, b03_green: 0.08, b04_red: 0.06, b08_nir: 0.42, b8a_narrow_nir: 0.38, b11_swir: 0.18 },
      8.5
    );
    satelliteProcessor.processParcelObservation(
      kilifiFarm.parcels[1],
      { b02_blue: 0.05, b03_green: 0.09, b04_red: 0.08, b08_nir: 0.36, b8a_narrow_nir: 0.32, b11_swir: 0.22 },
      12.0
    );
    satelliteProcessor.processParcelObservation(
      naivashaFarm.parcels[0],
      { b02_blue: 0.03, b03_green: 0.07, b04_red: 0.04, b08_nir: 0.52, b8a_narrow_nir: 0.46, b11_swir: 0.15 },
      5.0
    );
    satelliteProcessor.processParcelObservation(
      uasinGishuFarm.parcels[0],
      { b02_blue: 0.04, b03_green: 0.08, b04_red: 0.07, b08_nir: 0.45, b8a_narrow_nir: 0.40, b11_swir: 0.20 },
      15.0
    );
  }

  public getFarms(): Farm[] {
    return Array.from(this.farms.values());
  }

  public getFarmById(id: string): Farm | undefined {
    return this.farms.get(id);
  }

  public getParcelById(parcelId: string): Parcel | undefined {
    for (const farm of this.farms.values()) {
      const p = farm.parcels.find(x => x.id === parcelId);
      if (p) return p;
    }
    return undefined;
  }

  public getZoneById(zoneId: string): IrrigationZone | undefined {
    for (const farm of this.farms.values()) {
      const z = farm.zones.find(x => x.id === zoneId);
      if (z) return z;
    }
    return undefined;
  }

  public addSoilTelemetry(telemetry: SoilTelemetry) {
    const list = this.soilTelemetryHistory.get(telemetry.parcelId) || [];
    list.push(telemetry);
    if (list.length > 50) list.shift();
    this.soilTelemetryHistory.set(telemetry.parcelId, list);

    this.emit('telemetry', telemetry);
  }

  public getLatestSoilTelemetry(parcelId: string): SoilTelemetry | undefined {
    const list = this.soilTelemetryHistory.get(parcelId);
    if (!list || list.length === 0) return undefined;
    return list[list.length - 1];
  }

  public updateWeather(weather: WeatherTelemetry) {
    this.latestWeather.set(weather.farmId, weather);
    this.emit('weather', weather);
  }

  public getWeather(farmId: string): WeatherTelemetry | undefined {
    return this.latestWeather.get(farmId);
  }

  public actuateValve(
    zoneId: string,
    action: 'OPEN' | 'CLOSE',
    durationMinutes: number = 30,
    triggeredBy: 'AUTONOMOUS_AI' | 'MANUAL_OVERRIDE' | 'FAILSAFE_WATCHDOG' = 'MANUAL_OVERRIDE'
  ): { zone: IrrigationZone; downlink: LoraDownlinkQueueItem } {
    const zone = this.getZoneById(zoneId);
    if (!zone) {
      throw new Error(`Zone ${zoneId} not found`);
    }

    zone.valveStatus = action === 'OPEN' ? 'OPEN' : 'CLOSED';
    zone.lastActuatedAt = new Date().toISOString();
    zone.lastActuationMinutes = action === 'OPEN' ? durationMinutes : 0;

    const command: ValveActuationCommand = {
      zoneId: zone.id,
      valveDevEUI: zone.valveDevEUI,
      action,
      durationMinutes,
      triggeredBy,
      timestamp: new Date().toISOString()
    };

    const downlink = encodeValveDownlink(command);
    this.downlinkQueue.push(downlink);

    this.emit('actuation', { zone, command, downlink });
    return { zone, downlink };
  }

  public getDownlinkQueue(): LoraDownlinkQueueItem[] {
    return this.downlinkQueue;
  }

  public getIrrigationRecommendations(farmId?: string): IrrigationRecommendation[] {
    const recommendations: IrrigationRecommendation[] = [];

    const targetFarms = farmId
      ? [this.getFarmById(farmId)].filter(Boolean) as Farm[]
      : this.getFarms();

    for (const farm of targetFarms) {
      const weather = this.getWeather(farm.id);
      if (!weather) continue;

      for (const zone of farm.zones) {
        const parcel = farm.parcels.find(p => p.id === zone.parcelId);
        if (!parcel) continue;

        // Use latest recorded soil telemetry or generate realistic baseline
        let soil = this.getLatestSoilTelemetry(parcel.id);
        if (!soil) {
          soil = {
            nodeId: `node-default-${parcel.id}`,
            farmId: farm.id,
            parcelId: parcel.id,
            zoneId: zone.id,
            volumetricWaterContent: 22.5,
            soilTemperatureC: 24.0,
            soilEcMicroSiemensCm: 380,
            batteryMillivolts: 3650,
            metadata: {
              devEUI: zone.valveDevEUI,
              fPort: 1,
              fCnt: 1,
              rssi: -85,
              snr: 8.5,
              receivedAt: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
          };
        }

        const latestSat = satelliteProcessor.getLatestObservation(parcel.id);
        const rec = generateIrrigationRecommendation(zone, parcel, soil, weather, latestSat);
        recommendations.push(rec);
      }
    }

    return recommendations;
  }
}

export const farmManager = new FarmManager();
