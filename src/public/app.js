/**
 * KilimoFlux Interactive Web Dashboard
 */

let map;
let parcelPolygonGroup;
let currentFarmId = 'farm-kilifi-01';
let farmsData = [];
let recommendationsData = [];

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', async () => {
  initMap();
  setupEventListeners();
  await loadFarms();
  await loadRecommendations();
  connectEventStream();
});

function initMap() {
  // Center on Kenya
  map = L.map('map', {
    zoomControl: true,
    attributionControl: false
  }).setView([-3.6305, 39.8499], 16);

  // Satellite basemap (Esri World Imagery)
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19
  }).addTo(map);

  parcelPolygonGroup = L.featureGroup().addTo(map);
}

function setupEventListeners() {
  document.getElementById('farmSelect').addEventListener('change', (e) => {
    currentFarmId = e.target.value;
    updateSelectedFarmView();
  });

  // Preset buttons for Pest Diagnosis
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const crop = btn.getAttribute('data-crop');
      const symptoms = btn.getAttribute('data-symptoms');
      document.getElementById('diagCrop').value = crop;
      document.getElementById('diagNotes').value = symptoms;
      runDiagnosis();
    });
  });

  document.getElementById('btnRunDiagnosis').addEventListener('click', () => {
    runDiagnosis();
  });
}

async function loadFarms() {
  try {
    const res = await fetch('/api/v1/farms');
    const data = await res.json();
    if (data.success && data.data) {
      farmsData = data.data;
      updateSelectedFarmView();
    }
  } catch (err) {
    console.error('Failed to load farms:', err);
  }
}

async function loadRecommendations() {
  try {
    const res = await fetch('/api/v1/irrigation/recommendations');
    const data = await res.json();
    if (data.success && data.data) {
      recommendationsData = data.data;
      renderRecommendations();
    }
  } catch (err) {
    console.error('Failed to load recommendations:', err);
  }
}

function updateSelectedFarmView() {
  const farm = farmsData.find(f => f.id === currentFarmId);
  if (!farm) return;

  // Pan map to farm center
  map.setView([farm.center.latitude, farm.center.longitude], 16);
  parcelPolygonGroup.clearLayers();

  // Render parcel polygons
  farm.parcels.forEach((parcel, idx) => {
    // Leaflet coordinates are [lat, lon], GeoJSON has [lon, lat]
    const latLngs = parcel.polygon.coordinates[0].map(c => [c[1], c[0]]);

    // Color based on mock NDVI or sample
    const colors = ['#10b981', '#059669', '#34d399', '#f59e0b'];
    const color = colors[idx % colors.length];

    const poly = L.polygon(latLngs, {
      color: color,
      fillColor: color,
      fillOpacity: 0.45,
      weight: 2
    }).addTo(parcelPolygonGroup);

    poly.bindPopup(`
      <div class="text-slate-900 text-xs p-1">
        <strong class="font-bold text-sm text-emerald-800">${parcel.name}</strong><br/>
        <b>Crop:</b> ${parcel.cropType} (${parcel.variety || 'Standard'})<br/>
        <b>Stage:</b> ${parcel.growthStage}<br/>
        <b>Area:</b> ${parcel.areaHectares} ha<br/>
        <b>Soil:</b> ${parcel.soilType}
      </div>
    `);
  });

  renderValves(farm);
  renderRecommendations();
}

function renderValves(farm) {
  const valveList = document.getElementById('valveList');
  if (!valveList) return;

  let activeCount = 0;
  valveList.innerHTML = '';

  farm.zones.forEach(zone => {
    if (zone.valveStatus === 'OPEN') activeCount++;

    const item = document.createElement('div');
    item.className = 'p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex items-center justify-between';
    item.innerHTML = `
      <div>
        <div class="flex items-center space-x-2">
          <span class="w-2.5 h-2.5 rounded-full ${zone.valveStatus === 'OPEN' ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}"></span>
          <span class="text-xs font-bold text-slate-200">${zone.name}</span>
        </div>
        <p class="text-[10px] text-slate-400 mt-0.5">EUI: ${zone.valveDevEUI} • Flow: ${zone.flowRateLpm} L/min</p>
      </div>

      <button
        onclick="toggleValve('${zone.id}', '${zone.valveStatus === 'OPEN' ? 'CLOSE' : 'OPEN'}')"
        class="text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
          zone.valveStatus === 'OPEN'
            ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
        }"
      >
        ${zone.valveStatus === 'OPEN' ? 'Close Valve' : 'Open Valve'}
      </button>
    `;
    valveList.appendChild(item);
  });

  document.getElementById('metricValves').innerText = `${activeCount} / ${farm.zones.length} Active`;
}

window.toggleValve = async function(zoneId, action) {
  try {
    const res = await fetch(`/api/v1/irrigation/zones/${zoneId}/actuate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, durationMinutes: 30, triggeredBy: 'MANUAL_OVERRIDE' })
    });
    const data = await res.json();
    if (data.success) {
      await loadFarms();
      await loadRecommendations();
    }
  } catch (err) {
    console.error('Failed to actuate valve:', err);
  }
};

function renderRecommendations() {
  const container = document.getElementById('recommendationsContainer');
  if (!container) return;

  const farmRecs = recommendationsData.filter(r => r.farmId === currentFarmId);
  if (farmRecs.length === 0) {
    container.innerHTML = `<p class="text-xs text-slate-500">No active irrigation alerts for this farm.</p>`;
    return;
  }

  container.innerHTML = '';
  farmRecs.forEach(rec => {
    const card = document.createElement('div');
    card.className = `p-3 rounded-xl border text-xs space-y-2 ${
      rec.status === 'RECOMMENDED'
        ? 'bg-amber-500/10 border-amber-500/30'
        : rec.status === 'ACTIVE'
        ? 'bg-emerald-500/10 border-emerald-500/30'
        : 'bg-slate-800/60 border-slate-700/60'
    }`;

    card.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="font-bold text-slate-200">${rec.cropType} (Zone ${rec.zoneId.split('-').pop()})</span>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
          rec.status === 'RECOMMENDED' ? 'bg-amber-500/20 text-amber-300' :
          rec.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' :
          'bg-slate-700 text-slate-300'
        }">${rec.status}</span>
      </div>

      <div class="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
        <div>Moisture: <strong>${rec.currentVwc}%</strong> (Target: ${rec.targetVwc}%)</div>
        <div>Deficit: <strong>${rec.soilMoistureDeficitMm} mm</strong></div>
        <div>FAO ETc: <strong>${rec.faoEtcMmDay} mm/day</strong></div>
        <div>Water Volume: <strong>${rec.estimatedWaterLiters.toLocaleString()} Liters</strong></div>
      </div>

      ${rec.weatherGated ? `
        <div class="text-[10px] text-cyan-400 bg-cyan-950/40 p-1.5 rounded border border-cyan-800">
          ☔ ${rec.gatingReason || 'Rain forecasted. Automated irrigation paused.'}
        </div>
      ` : ''}

      ${rec.status === 'RECOMMENDED' ? `
        <button
          onclick="toggleValve('${rec.zoneId}', 'OPEN')"
          class="w-full mt-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-1.5 rounded text-xs transition-colors"
        >
          Execute Smart Irrigation (${rec.recommendedRuntimeMinutes} mins)
        </button>
      ` : ''}
    `;
    container.appendChild(card);
  });
}

async function runDiagnosis() {
  const cropType = document.getElementById('diagCrop').value;
  const symptomNotes = document.getElementById('diagNotes').value;
  const outputEl = document.getElementById('diagOutput');

  outputEl.innerHTML = `
    <div class="flex items-center justify-center py-8 text-emerald-400">
      <i class="ph-bold ph-spinner animate-spin text-2xl mr-2"></i>
      <span class="text-xs font-semibold">Running AI plant pathology model...</span>
    </div>
  `;

  try {
    const res = await fetch('/api/v1/pest-diagnosis/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        farmId: currentFarmId,
        cropType,
        affectedPart: 'LEAF',
        symptomNotes
      })
    });

    const data = await res.json();
    if (!data.success) {
      outputEl.innerHTML = `<div class="text-red-400 text-xs">Error: ${data.error}</div>`;
      return;
    }

    const result = data.data;
    const pathogen = result.detectedPathogen;

    outputEl.innerHTML = `
      <div class="space-y-3">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <h3 class="font-extrabold text-sm text-red-400 flex items-center gap-1.5">
              <i class="ph-bold ph-warning-circle"></i>
              ${pathogen.commonName}
            </h3>
            <p class="text-xs text-slate-400 italic">${pathogen.scientificName} (${pathogen.type})</p>
          </div>
          <div class="text-right">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
              result.urgency === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              result.urgency === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-blue-500/20 text-blue-400'
            }">Severity: ${result.urgency}</span>
            <p class="text-[10px] text-emerald-400 mt-0.5">Confidence: ${(result.confidenceScore * 100).toFixed(0)}%</p>
          </div>
        </div>

        <div>
          <h4 class="text-xs font-bold text-slate-200 mb-1">🌿 Cultural & Organic Remedies:</h4>
          <ul class="list-disc list-inside text-[11px] text-slate-300 space-y-1">
            ${result.ipmAdvice.culturalAndOrganic.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>

        <div>
          <h4 class="text-xs font-bold text-slate-200 mb-1">🧪 Registered Agrochemical Controls (PCPB Kenya):</h4>
          <ul class="list-disc list-inside text-[11px] text-slate-300 space-y-1">
            ${result.ipmAdvice.chemicalControls.map((c, i) => `
              <li>${c} <span class="text-emerald-400 font-mono text-[10px]">(${result.ipmAdvice.pcpbRecommendedProducts[i] || 'PCPB Registered'})</span></li>
            `).join('')}
          </ul>
          <p class="text-[10px] text-amber-400 mt-1">Pre-Harvest Interval (PHI): <strong>${result.ipmAdvice.preHarvestIntervalDays} days</strong></p>
        </div>
      </div>
    `;
  } catch (err) {
    outputEl.innerHTML = `<div class="text-red-400 text-xs">Diagnosis request failed. Check server connection.</div>`;
    console.error(err);
  }
}

function connectEventStream() {
  const eventSource = new EventSource('/api/v1/farms/stream');

  eventSource.onopen = () => {
    document.getElementById('liveStatus').innerText = 'LoRaWAN Live';
  };

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'SOIL_TELEMETRY') {
        const soil = data.payload;
        document.getElementById('metricVwc').innerText = `${soil.volumetricWaterContent}%`;
        loadRecommendations();
      } else if (data.type === 'VALVE_ACTUATION') {
        loadFarms();
        loadRecommendations();
      }
    } catch {
      // ignore
    }
  };

  eventSource.onerror = () => {
    document.getElementById('liveStatus').innerText = 'Reconnecting...';
  };
}
