// ============================================================================
// SERVICE CLASSIFIER
// Dynamically classifies resident health needs and matches them against
// the ACTUAL services listed by facilities (from facilityService / Supabase).
//
// The classifier does NOT hardcode which services exist — it uses keyword
// groups to understand user intent, then directly fuzzy-matches the user's
// need against each facility's real service list.
// ============================================================================

// ============================================================================
// SERVICE TYPE
// ============================================================================

export type ServiceType =
  | 'matched'   // Direct/keyword match against a facility's service string
  | 'general';  // No specific match — show all non-pharmacy facilities

export interface ServiceClassification {
  serviceType: ServiceType;
  label: string;                   // Human-readable label to show the user
  matchedKeywords: string[];       // Keywords that triggered the match
  searchTerms: string[];           // Normalized terms to fuzzy-match facility services
}

// ============================================================================
// KEYWORD → SEARCH TERM MAPPING
// Maps common user phrases to the kind of service strings that might
// appear in a facility's services list. This translates user language
// into facility language. The actual filtering always runs against whatever
// services each facility really provides.
// ============================================================================

interface KeywordMapping {
  keywords: string[];       // What the user might say
  searchTerms: string[];    // What to look for in facility.services
  label: string;            // User-facing label
}

const KEYWORD_MAPPINGS: KeywordMapping[] = [
  {
    keywords: [
      'consultation', 'checkup', 'check up', 'check-up', 'general checkup',
      'consult', 'doctor', 'sick', 'illness', 'fever', 'flu', 'cough', 'cold',
      'headache', 'stomachache', 'diarrhea', 'infection', 'general practice',
      'internal medicine', 'medical advice', 'diagnosis', 'body pain',
      'follow up', 'follow-up',
    ],
    searchTerms: ['consultation', 'general practice', 'internal medicine', 'health consultation'],
    label: 'Medical Consultation',
  },
  {
    keywords: [
      'dental', 'dentist', 'tooth', 'teeth', 'toothache', 'tooth ache',
      'oral', 'cavity', 'filling', 'extraction', 'cleaning', 'braces',
      'gum', 'wisdom tooth', 'root canal',
    ],
    searchTerms: ['dental'],
    label: 'Dental Service',
  },
  {
    keywords: [
      'vaccination', 'vaccine', 'immunization', 'immunize', 'booster',
      'flu shot', 'covid vaccine', 'tetanus', 'hepatitis', 'polio',
      'measles', 'bcg', 'dpt', 'child immunization', 'baby vaccine',
      'shot', 'inject',
    ],
    searchTerms: ['vaccination', 'immunization', 'child immunization'],
    label: 'Vaccination',
  },
  {
    keywords: [
      'maternal', 'maternity', 'prenatal', 'postnatal', 'pregnancy',
      'pregnant', 'delivery', 'labor', 'breastfeeding',
      'prenatal care', 'postnatal care', 'antenatal', 'midwife', 'birthing',
    ],
    searchTerms: ['maternal', 'maternity', 'prenatal', 'postnatal', 'newborn'],
    label: 'Maternal Care',
  },
  {
    keywords: [
      'laboratory', 'lab', 'lab test', 'blood test', 'blood work',
      'urinalysis', 'cbc', 'fasting blood sugar', 'lipid profile',
      'thyroid', 'hba1c', 'glucose test', 'cholesterol test', 'blood chemistry',
      'test result', 'diagnostic', 'specimen',
    ],
    searchTerms: ['laboratory', 'lab'],
    label: 'Laboratory',
  },
  {
    keywords: [
      'mental health', 'counseling', 'counselling', 'therapy', 'therapist',
      'psychologist', 'psychiatrist', 'depression', 'anxiety', 'stress',
      'mental', 'emotional', 'behavioral', 'psychological', 'panic',
      'trauma', 'ptsd', 'self harm', 'mental wellness',
    ],
    searchTerms: ['mental health', 'counseling', 'psychological', 'psychiatric'],
    label: 'Mental Health',
  },
  {
    keywords: [
      'emergency', 'er', 'emergency room', 'urgent', 'accident',
      'severe', 'critical', 'icu', 'intensive care', 'trauma',
      'ambulance', 'life threatening',
    ],
    searchTerms: ['emergency', 'icu', 'intensive care'],
    label: 'Emergency',
  },
  {
    keywords: [
      'pediatric', 'pediatrics', 'child', 'children', 'kids',
      'infant', 'toddler', 'child doctor', 'pedia', 'well baby',
      'growth monitoring', 'child health',
    ],
    searchTerms: ['pediatric', 'child', 'growth monitoring', 'well-baby', 'newborn'],
    label: 'Pediatrics',
  },
  {
    keywords: [
      'surgery', 'surgical', 'operation', 'procedure', 'minor surgery',
      'appendix', 'hernia', 'cyst', 'biopsy', 'removal',
    ],
    searchTerms: ['surgery', 'surgical', 'minor procedures'],
    label: 'Surgery',
  },
  {
    keywords: [
      'xray', 'x-ray', 'x ray', 'radiology', 'ct scan', 'mri',
      'ultrasound', 'imaging', 'scan', 'ecg', 'ekg', 'echocardiogram',
    ],
    searchTerms: ['radiology', 'x-ray', 'ultrasound', 'imaging', 'ct scan', 'mri'],
    label: 'Radiology / Imaging',
  },
  {
    keywords: ['dialysis', 'kidney dialysis', 'hemodialysis'],
    searchTerms: ['dialysis', 'hemodialysis'],
    label: 'Dialysis',
  },
  {
    keywords: [
      'pharmacy', 'medicine', 'medication', 'prescription', 'drug',
      'drugstore', 'buy medicine', 'refill', 'vitamins', 'supplements',
      'otc', 'over the counter',
    ],
    searchTerms: ['pharmacy', 'prescription', 'otc', 'medicines', 'medical supplies', 'vitamins'],
    label: 'Pharmacy',
  },
  {
    keywords: [
      'family planning', 'contraception', 'contraceptive', 'birth control',
      'iud', 'implant', 'condom', 'reproductive health',
    ],
    searchTerms: ['family planning', 'reproductive'],
    label: 'Family Planning',
  },
  {
    keywords: [
      'tb', 'tuberculosis', 'dots', 'tb treatment', 'tb test',
      'tb dots', 'tb screening',
    ],
    searchTerms: ['tb', 'tuberculosis', 'dots'],
    label: 'TB Treatment',
  },
  {
    keywords: [
      'senior', 'senior citizen', 'elderly', 'geriatric', 'old age',
      'aging', 'senior care',
    ],
    searchTerms: ['senior', 'geriatric', 'elderly'],
    label: 'Senior Citizen Care',
  },
  {
    keywords: [
      'cardiology', 'heart', 'cardiac', 'cardiologist', 'blood pressure',
      'hypertension', 'palpitation', 'arrhythmia',
    ],
    searchTerms: ['cardiology', 'cardiac', 'blood pressure', 'heart'],
    label: 'Cardiology',
  },
  {
    keywords: [
      'ob-gyn', 'ob gyn', 'obgyn', 'gynecology', 'gynecologist',
      'women health', "women's health", 'pap smear', 'pelvic',
      'menstrual', 'period', 'menopause',
    ],
    searchTerms: ['ob-gyn', 'gynecology', 'prenatal', 'postnatal', 'maternal'],
    label: 'OB-GYN',
  },
];

// ============================================================================
// CLASSIFY USER'S HEALTH NEED
// 1. Match user keywords → get search terms + label
// 2. If no keyword match, use the raw reason as the search term
//    so ANY service string from any facility can be matched directly
// ============================================================================

export function classifyServiceNeed(reason: string): ServiceClassification {
  const reasonLower = reason.toLowerCase().trim();

  let bestMapping: KeywordMapping | null = null;
  let bestScore = 0;
  let matchedKeywords: string[] = [];

  for (const mapping of KEYWORD_MAPPINGS) {
    let score = 0;
    const found: string[] = [];

    for (const keyword of mapping.keywords) {
      if (reasonLower.includes(keyword)) {
        // Longer keyword = more specific = higher score
        score += keyword.split(' ').length;
        found.push(keyword);
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMapping = mapping;
      matchedKeywords = found;
    }
  }

  if (bestMapping) {
    return {
      serviceType: 'matched',
      label: bestMapping.label,
      matchedKeywords,
      searchTerms: bestMapping.searchTerms,
    };
  }

  // No keyword match — use the raw reason as a direct search term.
  // This lets users type ANY service a facility might have (e.g. "Blood Pressure
  // Monitoring") and still get results, even if we don't have a keyword group for it.
  return {
    serviceType: reasonLower.length > 0 ? 'matched' : 'general',
    label: reason,
    matchedKeywords: [],
    searchTerms: reasonLower.length > 0 ? [reasonLower] : [],
  };
}

// ============================================================================
// CHECK IF A FACILITY'S SERVICES MATCH A CLASSIFIED NEED
// Fuzzy-matches the classification's searchTerms against the facility's
// actual services list. Works with ANY service string — no hardcoding.
// ============================================================================

export function facilityMatchesNeed(
  facilityServices: string[],
  classification: ServiceClassification
): boolean {
  if (classification.serviceType === 'general') return true;
  if (classification.searchTerms.length === 0) return true;

  const facilityServicesLower = facilityServices.map(s => s.toLowerCase());

  return classification.searchTerms.some(term =>
    facilityServicesLower.some(
      service => service.includes(term) || term.includes(service)
    )
  );
}

// ============================================================================
// LEGACY COMPAT — facilitySupportsService
// Kept so existing code that imports it doesn't break.
// Actual filtering should use facilityMatchesNeed with a classification.
// ============================================================================

export function facilitySupportsService(
  _facilityServices: string[],
  _serviceType: ServiceType
): boolean {
  return true;
}

// ============================================================================
// GET SERVICE LABEL
// ============================================================================

export function getServiceLabel(classification: ServiceClassification): string {
  return classification.label;
}

// ============================================================================
// GET ALL KNOWN SERVICE CATEGORIES (for UI dropdowns, etc.)
// ============================================================================

export function getAllServiceTypes(): Array<{ label: string; searchTerms: string[] }> {
  return KEYWORD_MAPPINGS.map(m => ({
    label: m.label,
    searchTerms: m.searchTerms,
  }));
}

// Legacy export kept for backwards compat
export function getServiceMatchers(_serviceType: ServiceType): string[] {
  return [];
}
