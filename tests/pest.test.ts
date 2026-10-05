import { describe, it, expect } from 'vitest';
import { pestDiagnosisEngine } from '../src/ai/pest-diagnosis.js';

describe('AI Pest & Disease Pathology Engine', () => {
  it('should diagnose Maize Fall Armyworm with high confidence from symptoms', () => {
    const result = pestDiagnosisEngine.diagnose({
      farmId: 'farm-eldoret-03',
      cropType: 'MAIZE',
      affectedPart: 'LEAF',
      symptomNotes: 'Ragged feeding holes in leaf whorls with sawdust frass'
    });

    expect(result.detectedPathogen.commonName).toBe('Fall Armyworm');
    expect(result.detectedPathogen.scientificName).toBe('Spodoptera frugiperda');
    expect(result.urgency).toBe('CRITICAL');
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0.80);
    expect(result.ipmAdvice.culturalAndOrganic.length).toBeGreaterThan(0);
    expect(result.ipmAdvice.pcpbRecommendedProducts.length).toBeGreaterThan(0);
  });

  it('should diagnose Tomato Late Blight from foliar symptoms', () => {
    const result = pestDiagnosisEngine.diagnose({
      farmId: 'farm-kilifi-01',
      cropType: 'TOMATO',
      affectedPart: 'LEAF',
      symptomNotes: 'Dark water-soaked brown lesions on leaf tips with white cottony mold'
    });

    expect(result.detectedPathogen.commonName).toBe('Late Blight');
    expect(result.detectedPathogen.scientificName).toBe('Phytophthora infestans');
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0.80);
    expect(result.ipmAdvice.chemicalControls[0]).toContain('Mancozeb');
  });

  it('should return catalog of African crop pathogens', () => {
    const pathogens = pestDiagnosisEngine.getAllPathogens();
    expect(pathogens.length).toBeGreaterThanOrEqual(5);
    const crops = pathogens.map(p => p.crop);
    expect(crops).toContain('MAIZE');
    expect(crops).toContain('TOMATO');
    expect(crops).toContain('CASSAVA');
  });
});
