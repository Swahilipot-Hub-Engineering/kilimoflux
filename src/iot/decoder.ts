import { SoilTelemetry, LoraUplinkMetadata } from '../models/types.js';

export interface ChirpStackUplinkPayload {
  deviceInfo?: {
    devEui: string;
    applicationId?: string;
    deviceName?: string;
  };
  devEUI?: string;
  fPort?: number;
  fCnt?: number;
  data?: string; // Base64 encoded payload
  object?: Record<string, unknown>; // Decoded JSON if codec ran in gateway
  rxInfo?: Array<{
    rssi: number;
    snr: number;
    gatewayId?: string;
  }>;
}

export interface TtnUplinkPayload {
  end_device_ids: {
    device_id: string;
    dev_eui: string;
  };
  uplink_message: {
    f_port: number;
    f_cnt: number;
    frm_payload?: string; // Base64 encoded
    decoded_payload?: Record<string, unknown>;
    rx_metadata?: Array<{
      rssi: number;
      snr: number;
      gateway_ids?: {
        gateway_id: string;
      };
    }>;
  };
}

/**
 * Decodes raw binary hexadecimal buffer from agricultural LoRaWAN sensors
 * (Matches standard Dragino LSE01 / Milesight EM500-SMTC binary layout):
 * Bytes 0-1: Soil Moisture VWC (% * 100)
 * Bytes 2-3: Soil Temp (°C * 10, signed int16)
 * Bytes 4-5: Electrical Conductivity (µS/cm)
 * Bytes 6-7: Battery Voltage (mV)
 * Bytes 8:   Soil pH (* 10, optional)
 * Bytes 9:   Nitrogen (mg/kg, optional)
 * Bytes 10:  Phosphorus (mg/kg, optional)
 * Bytes 11:  Potassium (mg/kg, optional)
 */
export function decodeSoilSensorBinary(buffer: Buffer): Partial<SoilTelemetry> {
  if (buffer.length < 8) {
    throw new Error(`Invalid sensor payload length: ${buffer.length} bytes (expected >= 8)`);
  }

  // 1. Volumetric Water Content (%)
  const rawVwc = buffer.readUInt16BE(0);
  const volumetricWaterContent = parseFloat((rawVwc / 100).toFixed(2));

  // 2. Soil Temperature (°C)
  const rawTemp = buffer.readInt16BE(2);
  const soilTemperatureC = parseFloat((rawTemp / 10).toFixed(1));

  // 3. Electrical Conductivity (µS/cm)
  const soilEcMicroSiemensCm = buffer.readUInt16BE(4);

  // 4. Battery (mV)
  const batteryMillivolts = buffer.readUInt16BE(6);

  // Optional NPK & pH extensions if 12 bytes
  let phLevel: number | undefined;
  let nitrogenMgKg: number | undefined;
  let phosphorusMgKg: number | undefined;
  let potassiumMgKg: number | undefined;

  if (buffer.length >= 9) {
    phLevel = parseFloat((buffer.readUInt8(8) / 10).toFixed(1));
  }
  if (buffer.length >= 12) {
    nitrogenMgKg = buffer.readUInt8(9);
    phosphorusMgKg = buffer.readUInt8(10);
    potassiumMgKg = buffer.readUInt8(11);
  }

  return {
    volumetricWaterContent,
    soilTemperatureC,
    soilEcMicroSiemensCm,
    batteryMillivolts,
    phLevel,
    nitrogenMgKg,
    phosphorusMgKg,
    potassiumMgKg
  };
}

/**
 * Normalizes uplinks coming from either ChirpStack or The Things Network (TTN)
 */
export function parseLoraUplink(
  rawBody: ChirpStackUplinkPayload | TtnUplinkPayload | Record<string, unknown>,
  farmId: string,
  parcelId: string
): SoilTelemetry {
  let devEUI = 'UNKNOWN';
  let fPort = 1;
  let fCnt = 0;
  let rssi = -100;
  let snr = 0;
  let gatewayId: string | undefined;
  let decoded: Partial<SoilTelemetry> = {};

  // Check if TTN payload
  if ('end_device_ids' in rawBody && 'uplink_message' in rawBody) {
    const ttn = rawBody as TtnUplinkPayload;
    devEUI = ttn.end_device_ids.dev_eui;
    fPort = ttn.uplink_message.f_port;
    fCnt = ttn.uplink_message.f_cnt;

    if (ttn.uplink_message.rx_metadata && ttn.uplink_message.rx_metadata.length > 0) {
      rssi = ttn.uplink_message.rx_metadata[0].rssi;
      snr = ttn.uplink_message.rx_metadata[0].snr;
      gatewayId = ttn.uplink_message.rx_metadata[0].gateway_ids?.gateway_id;
    }

    if (ttn.uplink_message.decoded_payload) {
      const obj = ttn.uplink_message.decoded_payload as Record<string, number>;
      decoded = {
        volumetricWaterContent: obj.soil_moisture ?? obj.vwc ?? 25.0,
        soilTemperatureC: obj.soil_temp ?? obj.temperature ?? 22.5,
        soilEcMicroSiemensCm: obj.ec ?? 350,
        batteryMillivolts: obj.battery ?? 3600,
        phLevel: obj.ph,
        nitrogenMgKg: obj.nitrogen,
        phosphorusMgKg: obj.phosphorus,
        potassiumMgKg: obj.potassium
      };
    } else if (ttn.uplink_message.frm_payload) {
      const buf = Buffer.from(ttn.uplink_message.frm_payload, 'base64');
      decoded = decodeSoilSensorBinary(buf);
    }
  }
  // Check if ChirpStack payload
  else if ('deviceInfo' in rawBody || 'devEUI' in rawBody) {
    const cs = rawBody as ChirpStackUplinkPayload;
    devEUI = cs.deviceInfo?.devEui || cs.devEUI || 'UNKNOWN';
    fPort = cs.fPort || 1;
    fCnt = cs.fCnt || 0;

    if (cs.rxInfo && cs.rxInfo.length > 0) {
      rssi = cs.rxInfo[0].rssi;
      snr = cs.rxInfo[0].snr;
      gatewayId = cs.rxInfo[0].gatewayId;
    }

    if (cs.object) {
      const obj = cs.object as Record<string, number>;
      decoded = {
        volumetricWaterContent: obj.soil_moisture ?? obj.vwc ?? 28.0,
        soilTemperatureC: obj.soil_temp ?? obj.temperature ?? 23.0,
        soilEcMicroSiemensCm: obj.ec ?? 400,
        batteryMillivolts: obj.battery ?? 3650
      };
    } else if (cs.data) {
      const buf = Buffer.from(cs.data, 'base64');
      decoded = decodeSoilSensorBinary(buf);
    }
  }
  // Direct JSON input format
  else {
    const raw = rawBody as Record<string, unknown>;
    devEUI = String(raw.devEUI || raw.nodeId || 'UNKNOWN');
    decoded = {
      volumetricWaterContent: Number(raw.volumetricWaterContent ?? raw.vwc ?? 25),
      soilTemperatureC: Number(raw.soilTemperatureC ?? raw.temp ?? 22),
      soilEcMicroSiemensCm: Number(raw.soilEcMicroSiemensCm ?? raw.ec ?? 300),
      batteryMillivolts: Number(raw.batteryMillivolts ?? 3600),
      phLevel: raw.phLevel !== undefined ? Number(raw.phLevel) : undefined,
      nitrogenMgKg: raw.nitrogenMgKg !== undefined ? Number(raw.nitrogenMgKg) : undefined,
      phosphorusMgKg: raw.phosphorusMgKg !== undefined ? Number(raw.phosphorusMgKg) : undefined,
      potassiumMgKg: raw.potassiumMgKg !== undefined ? Number(raw.potassiumMgKg) : undefined
    };
  }

  const metadata: LoraUplinkMetadata = {
    devEUI,
    fPort,
    fCnt,
    rssi,
    snr,
    gatewayId,
    receivedAt: new Date().toISOString()
  };

  return {
    nodeId: `node-${devEUI.toLowerCase()}`,
    farmId,
    parcelId,
    volumetricWaterContent: decoded.volumetricWaterContent ?? 25.0,
    soilTemperatureC: decoded.soilTemperatureC ?? 22.0,
    soilEcMicroSiemensCm: decoded.soilEcMicroSiemensCm ?? 300,
    batteryMillivolts: decoded.batteryMillivolts ?? 3600,
    phLevel: decoded.phLevel,
    nitrogenMgKg: decoded.nitrogenMgKg,
    phosphorusMgKg: decoded.phosphorusMgKg,
    potassiumMgKg: decoded.potassiumMgKg,
    metadata,
    timestamp: new Date().toISOString()
  };
}
