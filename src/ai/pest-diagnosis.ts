import {
  CropType,
  CropPathogen,
  DiagnosisRequest,
  DiagnosisResult
} from '../models/types.js';

export const AFRICAN_CROP_PATHOGENS: CropPathogen[] = [
  // MAIZE
  {
    id: 'maize-fall-armyworm',
    crop: 'MAIZE',
    commonName: 'Fall Armyworm',
    scientificName: 'Spodoptera frugiperda',
    type: 'PEST',
    severity: 'CRITICAL',
    symptoms: [
      'Ragged feeding holes in leaf whorls',
      'Sawdust-like frass inside the funnel',
      'Damaged growing points ("dead heart")',
      'Larvae with inverted Y on head capsule'
    ],
    organicRemedies: [
      'Apply neem seed extract (50g/L water) into whorls early morning',
      'Handpick egg masses and larvae in smallholder plots',
      'Apply fine sand or wood ash into funnel to suffocate larvae',
      'Encourage parasitoid wasps (Telenomus remus)'
    ],
    chemicalTreatments: [
      'Emamectin benzoate (50g/ha) targeting young instars',
      'Chlorantraniliprole 200 SC into the funnel'
    ],
    pcpbRegistrationRefs: ['PCPB(CR)1542', 'PCPB(CR)1890'],
    preventativeMeasures: [
      'Early planting with onset of rains',
      'Push-pull technology using Desmodium and Napier grass',
      'Intercropping with beans or cowpeas'
    ]
  },
  {
    id: 'maize-lethal-necrosis',
    crop: 'MAIZE',
    commonName: 'Maize Lethal Necrosis Disease (MLND)',
    scientificName: 'MCMV + Potyvirus coinfection',
    type: 'VIRAL',
    severity: 'CRITICAL',
    symptoms: [
      'Severe chlorotic mottling on leaves',
      'Premature drying of husks and tassels',
      'Necrosis from leaf margins inwards',
      'Deformed or barren cobs with premature death'
    ],
    organicRemedies: [
      'Rogue and burn infected plants immediately (do not feed to livestock)',
      'Use certified disease-free hybrid seed only'
    ],
    chemicalTreatments: [
      'Control insect vectors (thrips and chrysomelid beetles) with Imidacloprid 200 SL'
    ],
    pcpbRegistrationRefs: ['PCPB(CR)0832'],
    preventativeMeasures: [
      'Observe strict crop-free break season between maize cycles',
      'Do not plant continuous maize in known endemic zones',
      'Sanitize all farm equipment between parcels'
    ]
  },

  // TOMATO
  {
    id: 'tomato-late-blight',
    crop: 'TOMATO',
    commonName: 'Late Blight',
    scientificName: 'Phytophthora infestans',
    type: 'FUNGAL',
    severity: 'HIGH',
    symptoms: [
      'Water-soaked dark green/brown lesions on leaf tips',
      'White cottony fungal growth on underside of leaves in humid weather',
      'Brown greasy lesions on stems and fruit',
      'Rapid collapse of foliage during cold wet nights'
    ],
    organicRemedies: [
      'Spray copper hydroxide / Bordeaux mixture (30g/10L)',
      'Remove lower foliage to improve air circulation',
      'Avoid overhead sprinkler irrigation; switch to drip'
    ],
    chemicalTreatments: [
      'Metalaxyl + Mancozeb (e.g. Ridomil Gold) as preventive spray',
      'Cymoxanil + Propineb for systemic curative action'
    ],
    pcpbRegistrationRefs: ['PCPB(CR)0412', 'PCPB(CR)1158'],
    preventativeMeasures: [
      'Plant resistant cultivars (e.g. Eden F1, Kilele F1)',
      'Stake and mulch plants with dry straw',
      'Practice 3-year Solanaceae crop rotation'
    ]
  },
  {
    id: 'tomato-tuta-absoluta',
    crop: 'TOMATO',
    commonName: 'Tomato Leafminer',
    scientificName: 'Tuta absoluta',
    type: 'PEST',
    severity: 'HIGH',
    symptoms: [
      'Blotch-shaped mines on leaves that turn brown and necrotic',
      'Pin-head exit holes near the fruit calyx',
      'Black frass deposits inside larval mines'
    ],
    organicRemedies: [
      'Install delta pheromone traps (10-20 per acre) for mass trapping',
      'Spray Bacillus thuringiensis (Bt) kurstaki weekly',
      'Azadirachtin (neem oil formulation 0.03% EC)'
    ],
    chemicalTreatments: [
      'Flubendiamide or Spinetoram (Radiant 120 SC)',
      'Indoxacarb 150 SC'
    ],
    pcpbRegistrationRefs: ['PCPB(CR)1420', 'PCPB(CR)1610'],
    preventativeMeasures: [
      'Use insect-proof netting (40 mesh) in nursery and greenhouse',
      'Destroy wild host weeds (black nightshade / Solanum nigrum)',
      'Strict post-harvest crop residue destruction'
    ]
  },

  // CASSAVA
  {
    id: 'cassava-mosaic-disease',
    crop: 'CASSAVA',
    commonName: 'Cassava Mosaic Disease (CMD)',
    scientificName: 'African Cassava Mosaic Geminivirus (ACMV)',
    type: 'VIRAL',
    severity: 'HIGH',
    symptoms: [
      'Bright yellow and pale green mosaic pattern on leaves',
      'Severe leaf distortion and crinkling',
      'Stunting of overall bush and poor tuber formation'
    ],
    organicRemedies: [
      'Uproot and bury infected cassava bushes early in vegetative stage',
      'Source clean certified cuttings from KALRO or certified seed multipliers'
    ],
    chemicalTreatments: [
      'Control whitefly vector (Bemisia tabaci) using Thiamethoxam 250 WDG'
    ],
    pcpbRegistrationRefs: ['PCPB(CR)0994'],
    preventativeMeasures: [
      'Plant KALRO-certified resistant varieties (e.g. KME-1, Tajirika, Shibe)',
      'Inspect stem cuttings prior to planting for absence of chlorosis'
    ]
  },

  // FRENCH BEANS
  {
    id: 'french-beans-rust',
    crop: 'FRENCH_BEANS',
    commonName: 'Bean Rust',
    scientificName: 'Uromyces appendiculatus',
    type: 'FUNGAL',
    severity: 'MEDIUM',
    symptoms: [
      'Small reddish-brown powdery pustules on lower leaf surfaces',
      'Yellow chlorotic halos surrounding pustules',
      'Early defoliation causing yield collapse'
    ],
    organicRemedies: [
      'Sulfur dusting (wettable sulfur 80% WP)',
      'Spray compost tea or bio-fungicide Bacillus subtilis'
    ],
    chemicalTreatments: [
      'Azoxystrobin + Difenoconazole (Amistar Top)',
      'Tebuconazole 250 EW'
    ],
    pcpbRegistrationRefs: ['PCPB(CR)1234', 'PCPB(CR)1502'],
    preventativeMeasures: [
      'Avoid high density planting; maintain 15cm inter-plant spacing',
      'Destroy volunteer legumes from previous harvest'
    ]
  }
];

export class PestDiagnosisEngine {
  /**
   * Evaluates symptoms and image metadata to identify pathogen
   */
  public diagnose(request: DiagnosisRequest): DiagnosisResult {
    const candidates = AFRICAN_CROP_PATHOGENS.filter(p => p.crop === request.cropType);
    let bestMatch: CropPathogen = candidates[0] || AFRICAN_CROP_PATHOGENS[0];
    let highestScore = 0.65; // Base confidence

    const queryText = (
      (request.observedSymptoms || []).join(' ') +
      ' ' +
      (request.symptomNotes || '') +
      ' ' +
      (request.imageFileName || '')
    ).toLowerCase();

    for (const pathogen of candidates) {
      let score = 0.50;

      // Match common or scientific name in query/filename
      if (queryText.includes(pathogen.commonName.toLowerCase()) ||
          queryText.includes(pathogen.scientificName.toLowerCase())) {
        score += 0.35;
      }

      // Check symptom keyword overlap
      let symptomMatches = 0;
      for (const symptom of pathogen.symptoms) {
        const words = symptom.toLowerCase().split(' ').filter(w => w.length > 4);
        for (const word of words) {
          if (queryText.includes(word)) {
            symptomMatches++;
          }
        }
      }

      if (symptomMatches > 0) {
        score += Math.min(0.40, symptomMatches * 0.12);
      }

      // Base boost if specific crop match
      if (pathogen.crop === request.cropType) {
        score += 0.10;
      }

      score = Math.min(0.98, score);

      if (score > highestScore) {
        highestScore = score;
        bestMatch = pathogen;
      }
    }

    const phiDays = bestMatch.type === 'PEST' ? 7 : bestMatch.type === 'FUNGAL' ? 14 : 3;

    return {
      diagnosisId: `diag-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      cropType: request.cropType,
      detectedPathogen: bestMatch,
      confidenceScore: parseFloat(highestScore.toFixed(2)),
      affectedPart: request.affectedPart,
      urgency: bestMatch.severity,
      ipmAdvice: {
        culturalAndOrganic: bestMatch.organicRemedies,
        chemicalControls: bestMatch.chemicalTreatments,
        pcpbRecommendedProducts: bestMatch.pcpbRegistrationRefs,
        preHarvestIntervalDays: phiDays
      },
      analyzedAt: new Date().toISOString()
    };
  }

  public getAllPathogens(): CropPathogen[] {
    return AFRICAN_CROP_PATHOGENS;
  }
}

export const pestDiagnosisEngine = new PestDiagnosisEngine();
