import { Router, Request, Response } from 'express';
import { pestDiagnosisEngine } from '../ai/pest-diagnosis.js';
import { DiagnosisRequest, CropType } from '../models/types.js';

export const pestRouter = Router();

/**
 * POST /api/v1/pest-diagnosis/analyze
 * AI diagnosis of plant pathology from leaf photos, observed symptoms, or notes
 */
pestRouter.post('/analyze', (req: Request, res: Response): void => {
  try {
    const {
      farmId,
      parcelId,
      cropType,
      affectedPart,
      imageBase64,
      imageFileName,
      observedSymptoms,
      symptomNotes
    } = req.body;

    if (!cropType) {
      res.status(400).json({ success: false, error: 'cropType is required' });
      return;
    }

    const diagnosisRequest: DiagnosisRequest = {
      farmId: farmId || 'farm-kilifi-01',
      parcelId,
      cropType: cropType.toUpperCase() as CropType,
      affectedPart: (affectedPart ? affectedPart.toUpperCase() : 'LEAF') as 'LEAF' | 'STEM' | 'FRUIT' | 'ROOT' | 'WHOLE_PLANT',
      imageBase64,
      imageFileName,
      observedSymptoms: Array.isArray(observedSymptoms) ? observedSymptoms : undefined,
      symptomNotes
    };

    const result = pestDiagnosisEngine.diagnose(diagnosisRequest);

    res.json({
      success: true,
      message: 'Plant pathology diagnosis completed',
      data: result
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(400).json({ success: false, error: message });
  }
});

/**
 * GET /api/v1/pest-diagnosis/pathogens
 * Returns the knowledge base of African crop pests & diseases
 */
pestRouter.get('/pathogens', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    data: pestDiagnosisEngine.getAllPathogens()
  });
});
