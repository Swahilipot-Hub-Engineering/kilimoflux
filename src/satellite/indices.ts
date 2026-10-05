/**
 * Sentinel-2 & Landsat Spectral Indices Calculator
 */

export interface SpectralBands {
  b02_blue: number;
  b03_green: number;
  b04_red: number;
  b08_nir: number;
  b8a_narrow_nir: number;
  b11_swir: number;
}

/**
 * Calculates NDVI (Normalized Difference Vegetation Index)
 * Range: -1.0 to +1.0
 * Values > 0.5 indicate healthy, dense green vegetation canopy.
 */
export function calculateNdvi(nir: number, red: number): number {
  const sum = nir + red;
  if (sum === 0) return 0;
  const ndvi = (nir - red) / sum;
  return parseFloat(Math.max(-1.0, Math.min(1.0, ndvi)).toFixed(3));
}

/**
 * Calculates NDWI (Normalized Difference Water Index / Gao 1996)
 * Measures liquid water content in crop canopy.
 * Range: -1.0 to +1.0
 * High positive values indicate high water content; negative values indicate water stress.
 */
export function calculateNdwi(nir: number, swir: number): number {
  const sum = nir + swir;
  if (sum === 0) return 0;
  const ndwi = (nir - swir) / sum;
  return parseFloat(Math.max(-1.0, Math.min(1.0, ndwi)).toFixed(3));
}

/**
 * Calculates NDRE (Normalized Difference Red Edge Index)
 * Sensitive to chlorophyll content in mid-to-late growth stages when NDVI saturates.
 */
export function calculateNdre(nir: number, redEdge: number): number {
  const sum = nir + redEdge;
  if (sum === 0) return 0;
  const ndre = (nir - redEdge) / sum;
  return parseFloat(Math.max(-1.0, Math.min(1.0, ndre)).toFixed(3));
}

export function classifyVegetationHealth(
  ndvi: number
): 'VIGOROUS' | 'MODERATE' | 'STRESSED' | 'SEVERELY_STRESSED' {
  if (ndvi >= 0.55) return 'VIGOROUS';
  if (ndvi >= 0.38) return 'MODERATE';
  if (ndvi >= 0.20) return 'STRESSED';
  return 'SEVERELY_STRESSED';
}

export function classifyWaterStress(
  ndwi: number
): 'OPTIMAL' | 'MILD_DEFICIT' | 'SEVERE_DEFICIT' {
  if (ndwi >= 0.05) return 'OPTIMAL';
  if (ndwi >= -0.15) return 'MILD_DEFICIT';
  return 'SEVERE_DEFICIT';
}
