/**
 * KilimoFlux Multi-Farm Telemetry Simulator
 * Simulates LoRaWAN uplinks and environmental changes across Kenyan farms
 */

import { farmManager } from '../engine/farm-manager.js';
import { SoilTelemetry } from '../models/types.js';

console.log('🌾 KilimoFlux LoRaWAN Telemetry Simulator started...');
console.log('📡 Generating synthetic sensor packets across Kenyan agricultural zones...');

const farms = farmManager.getFarms();

function generatePacket(farmIndex: number): SoilTelemetry {
  const farm = farms[farmIndex % farms.length];
  const parcel = farm.parcels[0];
  const zone = farm.zones[0];

  // Fluctuate soil moisture around threshold
  const isValveOpen = zone.valveStatus === 'OPEN';
  const current = farmManager.getLatestSoilTelemetry(parcel.id);
  let vwc = current ? current.volumetricWaterContent : 26.0;

  if (isValveOpen) {
    vwc = Math.min(45.0, vwc + 1.5);
  } else {
    vwc = Math.max(16.0, vwc - 0.4);
  }

  // Generate synthetic sensor binary payload (Dragino LSE01 format)
  const buf = Buffer.alloc(12);
  buf.writeUInt16BE(Math.round(vwc * 100), 0); // VWC * 100
  buf.writeInt16BE(Math.round((24.5 + Math.random() * 4) * 10), 2); // Temp * 10
  buf.writeUInt16BE(Math.round(350 + Math.random() * 50), 4); // EC
  buf.writeUInt16BE(3620, 6); // Battery mV
  buf.writeUInt8(65, 8); // pH 6.5
  buf.writeUInt8(45, 9); // N
  buf.writeUInt8(30, 10); // P
  buf.writeUInt8(60, 11); // K

  const telemetry: SoilTelemetry = {
    nodeId: `node-${zone.valveDevEUI.toLowerCase()}`,
    farmId: farm.id,
    parcelId: parcel.id,
    zoneId: zone.id,
    volumetricWaterContent: parseFloat(vwc.toFixed(1)),
    soilTemperatureC: parseFloat((24.5 + Math.random() * 3).toFixed(1)),
    soilEcMicroSiemensCm: Math.round(350 + Math.random() * 40),
    batteryMillivolts: 3620,
    nitrogenMgKg: 45,
    phosphorusMgKg: 30,
    potassiumMgKg: 60,
    phLevel: 6.5,
    metadata: {
      devEUI: zone.valveDevEUI,
      fPort: 2,
      fCnt: Math.floor(Math.random() * 1000),
      rssi: Math.round(-85 + Math.random() * 10),
      snr: parseFloat((7.5 + Math.random() * 3).toFixed(1)),
      receivedAt: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  };

  farmManager.addSoilTelemetry(telemetry);

  console.log(
    `[${new Date().toLocaleTimeString()}] 📡 LoRa Uplink | Farm: ${farm.name} | Parcel: ${parcel.name} | VWC: ${telemetry.volumetricWaterContent}% | Temp: ${telemetry.soilTemperatureC}°C | RSSI: ${telemetry.metadata.rssi}dBm`
  );

  return telemetry;
}

// Tick every 3 seconds across farms
let tick = 0;
setInterval(() => {
  generatePacket(tick++);
}, 3000);
