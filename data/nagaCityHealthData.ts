// Static health demographic data for Naga City barangays
// Data is representative for demonstration purposes

export interface BarangayHealthData {
  id: string;
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  childrenHealth: {
    totalChildren: number;
    vaccinationCoverage: number; // percentage
    vaccinationCompletionRate: number; // percentage
    fullyImmunized: number;
  };
  maternalHealth: {
    pregnantEnrolled: number;
    totalPregnant: number;
    enrollmentRate: number; // percentage
    prenatalVisitCompliance: number;
    trimesterBreakdown: {
      firstTrimester: number;
      secondTrimester: number;
      thirdTrimester: number;
    };
    scheduledCheckups: number;
    completedCheckups: number;
  };
  seniorCitizen: {
    total: number;
    receivingAssistance: number;
    assistanceTypes: {
      medicines: number;
      consultations: number;
      financialAid: number;
      homeVisits: number;
    };
    coverageRate: number; // percentage
  };
  population: number;
}



export const nagaCityHealthData: BarangayHealthData[] = [
  {
    id: 'brgy-abella',
    name: 'Abella',
    coordinates: { latitude: 13.6235, longitude: 123.1799 },
    population: 3245,
    childrenHealth: {
      totalChildren: 485,
      vaccinationCoverage: 92,
      vaccinationCompletionRate: 88,
      fullyImmunized: 427,
    },
    maternalHealth: {
      pregnantEnrolled: 38,
      totalPregnant: 42,
      enrollmentRate: 90,
      prenatalVisitCompliance: 85,
      trimesterBreakdown: {
        firstTrimester: 12,
        secondTrimester: 15,
        thirdTrimester: 11,
      },
      scheduledCheckups: 152,
      completedCheckups: 129,
    },
    seniorCitizen: {
      total: 285,
      receivingAssistance: 215,
      assistanceTypes: {
        medicines: 180,
        consultations: 150,
        financialAid: 95,
        homeVisits: 65,
      },
      coverageRate: 75,
    },
  },
  {
    id: 'brgy-bagumbayan-norte',
    name: 'Bagumbayan Norte',
    coordinates: { latitude: 13.6289, longitude: 123.1895 },
    population: 4120,
    childrenHealth: {
      totalChildren: 620,
      vaccinationCoverage: 88,
      vaccinationCompletionRate: 84,
      fullyImmunized: 521,
    },
    maternalHealth: {
      pregnantEnrolled: 45,
      totalPregnant: 52,
      enrollmentRate: 87,
      prenatalVisitCompliance: 82,
      trimesterBreakdown: {
        firstTrimester: 16,
        secondTrimester: 18,
        thirdTrimester: 11,
      },
      scheduledCheckups: 180,
      completedCheckups: 148,
    },
    seniorCitizen: {
      total: 365,
      receivingAssistance: 260,
      assistanceTypes: {
        medicines: 210,
        consultations: 180,
        financialAid: 115,
        homeVisits: 75,
      },
      coverageRate: 71,
    },
  },
  {
    id: 'brgy-bagumbayan-sur',
    name: 'Bagumbayan Sur',
    coordinates: { latitude: 13.6224, longitude: 123.1956 },
    population: 3890,
    childrenHealth: {
      totalChildren: 585,
      vaccinationCoverage: 91,
      vaccinationCompletionRate: 87,
      fullyImmunized: 533,
    },
    maternalHealth: {
      pregnantEnrolled: 44,
      totalPregnant: 49,
      enrollmentRate: 90,
      prenatalVisitCompliance: 86,
      trimesterBreakdown: {
        firstTrimester: 14,
        secondTrimester: 17,
        thirdTrimester: 13,
      },
      scheduledCheckups: 176,
      completedCheckups: 151,
    },
    seniorCitizen: {
      total: 345,
      receivingAssistance: 278,
      assistanceTypes: {
        medicines: 230,
        consultations: 195,
        financialAid: 125,
        homeVisits: 82,
      },
      coverageRate: 81,
    },
  },
  {
    id: 'brgy-balatas',
    name: 'Balatas',
    coordinates: { latitude: 13.6310, longitude: 123.2060 },
    population: 2890,
    childrenHealth: {
      totalChildren: 425,
      vaccinationCoverage: 95,
      vaccinationCompletionRate: 91,
      fullyImmunized: 387,
    },
    maternalHealth: {
      pregnantEnrolled: 32,
      totalPregnant: 35,
      enrollmentRate: 91,
      prenatalVisitCompliance: 89,
      trimesterBreakdown: {
        firstTrimester: 10,
        secondTrimester: 13,
        thirdTrimester: 9,
      },
      scheduledCheckups: 128,
      completedCheckups: 114,
    },
    seniorCitizen: {
      total: 255,
      receivingAssistance: 220,
      assistanceTypes: {
        medicines: 195,
        consultations: 165,
        financialAid: 105,
        homeVisits: 68,
      },
      coverageRate: 86,
    },
  },
  {
    id: 'brgy-calauag',
    name: 'Calauag',
    coordinates: { latitude: 13.6345, longitude: 123.1930 },
    population: 2450,
    childrenHealth: {
      totalChildren: 368,
      vaccinationCoverage: 94,
      vaccinationCompletionRate: 90,
      fullyImmunized: 331,
    },
    maternalHealth: {
      pregnantEnrolled: 26,
      totalPregnant: 29,
      enrollmentRate: 90,
      prenatalVisitCompliance: 88,
      trimesterBreakdown: {
        firstTrimester: 6,
        secondTrimester: 10,
        thirdTrimester: 13,
      },
      scheduledCheckups: 116,
      completedCheckups: 95,
    },
    seniorCitizen: {
      total: 245,
      receivingAssistance: 185,
      assistanceTypes: {
        medicines: 150,
        consultations: 130,
        financialAid: 80,
        homeVisits: 55,
      },
      coverageRate: 75,
    },
  },
  {
    id: 'brgy-cararayan',
    name: 'Cararayan',
    coordinates: { latitude: 13.6315, longitude: 123.2325 },
    population: 5670,
    childrenHealth: {
      totalChildren: 850,
      vaccinationCoverage: 89,
      vaccinationCompletionRate: 85,
      fullyImmunized: 723,
    },
    maternalHealth: {
      pregnantEnrolled: 60,
      totalPregnant: 68,
      enrollmentRate: 88,
      prenatalVisitCompliance: 84,
      trimesterBreakdown: {
        firstTrimester: 22,
        secondTrimester: 27,
        thirdTrimester: 19,
      },
      scheduledCheckups: 272,
      completedCheckups: 234,
    },
    seniorCitizen: {
      total: 510,
      receivingAssistance: 385,
      assistanceTypes: {
        medicines: 320,
        consultations: 280,
        financialAid: 170,
        homeVisits: 115,
      },
      coverageRate: 75,
    },
  },
  {
    id: 'brgy-carolina',
    name: 'Carolina',
    coordinates: { latitude: 13.6643, longitude: 123.2909 },
    population: 5210,
    childrenHealth: {
      totalChildren: 780,
      vaccinationCoverage: 90,
      vaccinationCompletionRate: 86,
      fullyImmunized: 671,
    },
    maternalHealth: {
      pregnantEnrolled: 58,
      totalPregnant: 65,
      enrollmentRate: 89,
      prenatalVisitCompliance: 87,
      trimesterBreakdown: {
        firstTrimester: 17,
        secondTrimester: 27,
        thirdTrimester: 21,
      },
      scheduledCheckups: 260,
      completedCheckups: 226,
    },
    seniorCitizen: {
      total: 470,
      receivingAssistance: 355,
      assistanceTypes: {
        medicines: 295,
        consultations: 260,
        financialAid: 155,
        homeVisits: 105,
      },
      coverageRate: 76,
    },
  },
  {
    id: 'brgy-concepcion-grande',
    name: 'Concepcion Grande',
    coordinates: { latitude: 13.6186, longitude: 123.2185 },
    population: 7580,
    childrenHealth: {
      totalChildren: 1140,
      vaccinationCoverage: 87,
      vaccinationCompletionRate: 83,
      fullyImmunized: 946,
    },
    maternalHealth: {
      pregnantEnrolled: 72,
      totalPregnant: 82,
      enrollmentRate: 88,
      prenatalVisitCompliance: 81,
      trimesterBreakdown: {
        firstTrimester: 22,
        secondTrimester: 30,
        thirdTrimester: 30,
      },
      scheduledCheckups: 328,
      completedCheckups: 280,
    },
    seniorCitizen: {
      total: 685,
      receivingAssistance: 515,
      assistanceTypes: {
        medicines: 430,
        consultations: 375,
        financialAid: 225,
        homeVisits: 155,
      },
      coverageRate: 75,
    },
  },
  {
    id: 'brgy-concepcion-pequena',
    name: 'Concepcion Pequeña',
    coordinates: { latitude: 13.6215, longitude: 123.2055 },
    population: 6340,
    childrenHealth: {
      totalChildren: 950,
      vaccinationCoverage: 87,
      vaccinationCompletionRate: 82,
      fullyImmunized: 779,
    },
    maternalHealth: {
      pregnantEnrolled: 68,
      totalPregnant: 78,
      enrollmentRate: 87,
      prenatalVisitCompliance: 80,
      trimesterBreakdown: {
        firstTrimester: 24,
        secondTrimester: 32,
        thirdTrimester: 22,
      },
      scheduledCheckups: 312,
      completedCheckups: 268,
    },
    seniorCitizen: {
      total: 570,
      receivingAssistance: 430,
      assistanceTypes: {
        medicines: 360,
        consultations: 315,
        financialAid: 190,
        homeVisits: 130,
      },
      coverageRate: 75,
    },
  },
  {
    id: 'brgy-dayangdang',
    name: 'Dayangdang',
    coordinates: { latitude: 13.6253, longitude: 123.1912 },
    population: 1850,
    childrenHealth: {
      totalChildren: 278,
      vaccinationCoverage: 95,
      vaccinationCompletionRate: 92,
      fullyImmunized: 256,
    },
    maternalHealth: {
      pregnantEnrolled: 22,
      totalPregnant: 24,
      enrollmentRate: 92,
      prenatalVisitCompliance: 90,
      trimesterBreakdown: {
        firstTrimester: 9,
        secondTrimester: 10,
        thirdTrimester: 5,
      },
      scheduledCheckups: 96,
      completedCheckups: 82,
    },
    seniorCitizen: {
      total: 165,
      receivingAssistance: 125,
      assistanceTypes: {
        medicines: 105,
        consultations: 90,
        financialAid: 50,
        homeVisits: 35,
      },
      coverageRate: 76,
    },
  },
  {
    id: 'brgy-del-rosario',
    name: 'Del Rosario',
    coordinates: { latitude: 13.6120, longitude: 123.2310 },
    population: 3100,
    childrenHealth: {
      totalChildren: 465,
      vaccinationCoverage: 91,
      vaccinationCompletionRate: 87,
      fullyImmunized: 423,
    },
    maternalHealth: {
      pregnantEnrolled: 36,
      totalPregnant: 40,
      enrollmentRate: 90,
      prenatalVisitCompliance: 85,
      trimesterBreakdown: {
        firstTrimester: 10,
        secondTrimester: 17,
        thirdTrimester: 13,
      },
      scheduledCheckups: 160,
      completedCheckups: 139,
    },
    seniorCitizen: {
      total: 280,
      receivingAssistance: 210,
      assistanceTypes: {
        medicines: 175,
        consultations: 155,
        financialAid: 90,
        homeVisits: 60,
      },
      coverageRate: 75,
    },
  },
  {
    id: 'brgy-dinaga',
    name: 'Dinaga',
    coordinates: { latitude: 13.6217, longitude: 123.1873 },
    population: 3780,
    childrenHealth: {
      totalChildren: 565,
      vaccinationCoverage: 93,
      vaccinationCompletionRate: 89,
      fullyImmunized: 503,
    },
    maternalHealth: {
      pregnantEnrolled: 42,
      totalPregnant: 46,
      enrollmentRate: 91,
      prenatalVisitCompliance: 88,
      trimesterBreakdown: {
        firstTrimester: 14,
        secondTrimester: 19,
        thirdTrimester: 13,
      },
      scheduledCheckups: 184,
      completedCheckups: 161,
    },
    seniorCitizen: {
      total: 340,
      receivingAssistance: 255,
      assistanceTypes: {
        medicines: 215,
        consultations: 185,
        financialAid: 110,
        homeVisits: 75,
      },
      coverageRate: 75,
    },
  },
  {
    id: 'brgy-igualdad-interior',
    name: 'Igualdad Interior',
    coordinates: { latitude: 13.6212, longitude: 123.1802 },
    population: 2650,
    childrenHealth: {
      totalChildren: 398,
      vaccinationCoverage: 94,
      vaccinationCompletionRate: 90,
      fullyImmunized: 358,
    },
    maternalHealth: {
      pregnantEnrolled: 28,
      totalPregnant: 31,
      enrollmentRate: 90,
      prenatalVisitCompliance: 86,
      trimesterBreakdown: {
        firstTrimester: 9,
        secondTrimester: 10,
        thirdTrimester: 12,
      },
      scheduledCheckups: 124,
      completedCheckups: 110,
    },
    seniorCitizen: {
      total: 240,
      receivingAssistance: 180,
      assistanceTypes: {
        medicines: 150,
        consultations: 130,
        financialAid: 75,
        homeVisits: 50,
      },
      coverageRate: 75,
    },
  },
  {
    id: 'brgy-lerma',
    name: 'Lerma',
    coordinates: { latitude: 13.6247, longitude: 123.1865 },
    population: 4560,
    childrenHealth: {
      totalChildren: 685,
      vaccinationCoverage: 91,
      vaccinationCompletionRate: 87,
      fullyImmunized: 596,
    },
    maternalHealth: {
      pregnantEnrolled: 51,
      totalPregnant: 58,
      enrollmentRate: 88,
      prenatalVisitCompliance: 84,
      trimesterBreakdown: {
        firstTrimester: 16,
        secondTrimester: 22,
        thirdTrimester: 20,
      },
      scheduledCheckups: 232,
      completedCheckups: 199,
    },
    seniorCitizen: {
      total: 410,
      receivingAssistance: 310,
      assistanceTypes: {
        medicines: 260,
        consultations: 225,
        financialAid: 130,
        homeVisits: 90,
      },
      coverageRate: 76,
    },
  },
  {
    id: 'brgy-liboton',
    name: 'Liboton',
    coordinates: { latitude: 13.6294, longitude: 123.1887 },
    population: 3120,
    childrenHealth: {
      totalChildren: 470,
      vaccinationCoverage: 89,
      vaccinationCompletionRate: 85,
      fullyImmunized: 400,
    },
    maternalHealth: {
      pregnantEnrolled: 35,
      totalPregnant: 40,
      enrollmentRate: 88,
      prenatalVisitCompliance: 83,
      trimesterBreakdown: {
        firstTrimester: 11,
        secondTrimester: 17,
        thirdTrimester: 12,
      },
      scheduledCheckups: 160,
      completedCheckups: 131,
    },
    seniorCitizen: {
      total: 280,
      receivingAssistance: 210,
      assistanceTypes: {
        medicines: 175,
        consultations: 155,
        financialAid: 90,
        homeVisits: 60,
      },
      coverageRate: 75,
    },
  },
  {
    id: 'brgy-mabolo',
    name: 'Mabolo',
    coordinates: { latitude: 13.6147, longitude: 123.1818 },
    population: 6240,
    childrenHealth: {
      totalChildren: 935,
      vaccinationCoverage: 86,
      vaccinationCompletionRate: 82,
      fullyImmunized: 767,
    },
    maternalHealth: {
      pregnantEnrolled: 64,
      totalPregnant: 74,
      enrollmentRate: 86,
      prenatalVisitCompliance: 80,
      trimesterBreakdown: {
        firstTrimester: 24,
        secondTrimester: 29,
        thirdTrimester: 21,
      },
      scheduledCheckups: 296,
      completedCheckups: 250,
    },
    seniorCitizen: {
      total: 560,
      receivingAssistance: 420,
      assistanceTypes: {
        medicines: 350,
        consultations: 305,
        financialAid: 180,
        homeVisits: 125,
      },
      coverageRate: 75,
    },
  },
  {
    id: 'brgy-pacol',
    name: 'Pacol',
    coordinates: { latitude: 13.6502, longitude: 123.2425 },
    population: 9850,
    childrenHealth: {
      totalChildren: 1480,
      vaccinationCoverage: 84,
      vaccinationCompletionRate: 79,
      fullyImmunized: 1170,
    },
    maternalHealth: {
      pregnantEnrolled: 92,
      totalPregnant: 108,
      enrollmentRate: 85,
      prenatalVisitCompliance: 77,
      trimesterBreakdown: {
        firstTrimester: 33,
        secondTrimester: 41,
        thirdTrimester: 34,
      },
      scheduledCheckups: 432,
      completedCheckups: 364,
    },
    seniorCitizen: {
      total: 885,
      receivingAssistance: 665,
      assistanceTypes: {
        medicines: 560,
        consultations: 485,
        financialAid: 285,
        homeVisits: 195,
      },
      coverageRate: 75,
    },
  },
  {
    id: 'brgy-panicuason',
    name: 'Panicuason',
    coordinates: { latitude: 13.6628, longitude: 123.3183 },
    population: 4120,
    childrenHealth: {
      totalChildren: 618,
      vaccinationCoverage: 90,
      vaccinationCompletionRate: 86,
      fullyImmunized: 531,
    },
    maternalHealth: {
      pregnantEnrolled: 46,
      totalPregnant: 52,
      enrollmentRate: 88,
      prenatalVisitCompliance: 84,
      trimesterBreakdown: {
        firstTrimester: 17,
        secondTrimester: 18,
        thirdTrimester: 17,
      },
      scheduledCheckups: 208,
      completedCheckups: 175,
    },
    seniorCitizen: {
      total: 370,
      receivingAssistance: 280,
      assistanceTypes: {
        medicines: 235,
        consultations: 205,
        financialAid: 120,
        homeVisits: 80,
      },
      coverageRate: 76,
    },
  },
  {
    id: 'brgy-penafrancia',
    name: 'Peñafrancia',
    coordinates: { latitude: 13.6318, longitude: 123.1955 },
    population: 7240,
    childrenHealth: {
      totalChildren: 1085,
      vaccinationCoverage: 92,
      vaccinationCompletionRate: 88,
      fullyImmunized: 955,
    },
    maternalHealth: {
      pregnantEnrolled: 78,
      totalPregnant: 88,
      enrollmentRate: 89,
      prenatalVisitCompliance: 86,
      trimesterBreakdown: {
        firstTrimester: 27,
        secondTrimester: 33,
        thirdTrimester: 28,
      },
      scheduledCheckups: 352,
      completedCheckups: 296,
    },
    seniorCitizen: {
      total: 570,
      receivingAssistance: 430,
      assistanceTypes: {
        medicines: 360,
        consultations: 315,
        financialAid: 190,
        homeVisits: 130,
      },
      coverageRate: 75,
    },
  },
  {
    id: 'brgy-sabang',
    name: 'Sabang',
    coordinates: { latitude: 13.6174, longitude: 123.1823 },
    population: 4320,
    childrenHealth: {
      totalChildren: 650,
      vaccinationCoverage: 90,
      vaccinationCompletionRate: 86,
      fullyImmunized: 559,
    },
    maternalHealth: {
      pregnantEnrolled: 48,
      totalPregnant: 54,
      enrollmentRate: 89,
      prenatalVisitCompliance: 85,
      trimesterBreakdown: {
        firstTrimester: 16,
        secondTrimester: 23,
        thirdTrimester: 15,
      },
      scheduledCheckups: 216,
      completedCheckups: 187,
    },
    seniorCitizen: {
      total: 390,
      receivingAssistance: 295,
      assistanceTypes: {
        medicines: 245,
        consultations: 215,
        financialAid: 125,
        homeVisits: 85,
      },
      coverageRate: 76,
    },
  },
  {
    id: 'brgy-san-felipe',
    name: 'San Felipe',
    coordinates: { latitude: 13.6385, longitude: 123.2091 },
    population: 3540,
    childrenHealth: {
      totalChildren: 530,
      vaccinationCoverage: 93,
      vaccinationCompletionRate: 89,
      fullyImmunized: 472,
    },
    maternalHealth: {
      pregnantEnrolled: 40,
      totalPregnant: 44,
      enrollmentRate: 91,
      prenatalVisitCompliance: 87,
      trimesterBreakdown: {
        firstTrimester: 11,
        secondTrimester: 17,
        thirdTrimester: 16,
      },
      scheduledCheckups: 176,
      completedCheckups: 152,
    },
    seniorCitizen: {
      total: 320,
      receivingAssistance: 240,
      assistanceTypes: {
        medicines: 200,
        consultations: 175,
        financialAid: 100,
        homeVisits: 70,
      },
      coverageRate: 75,
    },
  },
  {
    id: 'brgy-san-francisco',
    name: 'San Francisco',
    coordinates: { latitude: 13.6226, longitude: 123.1868 },
    population: 5430,
    childrenHealth: {
      totalChildren: 815,
      vaccinationCoverage: 88,
      vaccinationCompletionRate: 84,
      fullyImmunized: 685,
    },
    maternalHealth: {
      pregnantEnrolled: 58,
      totalPregnant: 66,
      enrollmentRate: 88,
      prenatalVisitCompliance: 83,
      trimesterBreakdown: {
        firstTrimester: 17,
        secondTrimester: 25,
        thirdTrimester: 24,
      },
      scheduledCheckups: 264,
      completedCheckups: 223,
    },
    seniorCitizen: {
      total: 490,
      receivingAssistance: 370,
      assistanceTypes: {
        medicines: 310,
        consultations: 270,
        financialAid: 155,
        homeVisits: 105,
      },
      coverageRate: 75,
    },
  },
  {
    id: 'brgy-san-isidro',
    name: 'San Isidro',
    coordinates: { latitude: 13.6358, longitude: 123.2628 },
    population: 2950,
    childrenHealth: {
      totalChildren: 442,
      vaccinationCoverage: 88,
      vaccinationCompletionRate: 84,
      fullyImmunized: 389,
    },
    maternalHealth: {
      pregnantEnrolled: 34,
      totalPregnant: 38,
      enrollmentRate: 89,
      prenatalVisitCompliance: 83,
      trimesterBreakdown: {
        firstTrimester: 10,
        secondTrimester: 17,
        thirdTrimester: 11,
      },
      scheduledCheckups: 152,
      completedCheckups: 127,
    },
    seniorCitizen: {
      total: 265,
      receivingAssistance: 200,
      assistanceTypes: {
        medicines: 165,
        consultations: 145,
        financialAid: 85,
        homeVisits: 60,
      },
      coverageRate: 75,
    },
  },
  {
    id: 'brgy-santa-cruz',
    name: 'Santa Cruz',
    coordinates: { latitude: 13.6257, longitude: 123.1821 },
    population: 4890,
    childrenHealth: {
      totalChildren: 735,
      vaccinationCoverage: 88,
      vaccinationCompletionRate: 84,
      fullyImmunized: 617,
    },
    maternalHealth: {
      pregnantEnrolled: 55,
      totalPregnant: 63,
      enrollmentRate: 87,
      prenatalVisitCompliance: 82,
      trimesterBreakdown: {
        firstTrimester: 17,
        secondTrimester: 27,
        thirdTrimester: 19,
      },
      scheduledCheckups: 252,
      completedCheckups: 212,
    },
    seniorCitizen: {
      total: 440,
      receivingAssistance: 330,
      assistanceTypes: {
        medicines: 275,
        consultations: 240,
        financialAid: 140,
        homeVisits: 95,
      },
      coverageRate: 75,
    },
  },
  {
    id: 'brgy-tabuco',
    name: 'Tabuco',
    coordinates: { latitude: 13.6185, longitude: 123.1861 },
    population: 3340,
    childrenHealth: {
      totalChildren: 500,
      vaccinationCoverage: 92,
      vaccinationCompletionRate: 88,
      fullyImmunized: 440,
    },
    maternalHealth: {
      pregnantEnrolled: 38,
      totalPregnant: 42,
      enrollmentRate: 90,
      prenatalVisitCompliance: 87,
      trimesterBreakdown: {
        firstTrimester: 13,
        secondTrimester: 17,
        thirdTrimester: 12,
      },
      scheduledCheckups: 168,
      completedCheckups: 141,
    },
    seniorCitizen: {
      total: 300,
      receivingAssistance: 225,
      assistanceTypes: {
        medicines: 190,
        consultations: 165,
        financialAid: 95,
        homeVisits: 65,
      },
      coverageRate: 75,
    },
  },
  {
    id: 'brgy-tinago',
    name: 'Tinago',
    coordinates: { latitude: 13.6228, longitude: 123.1903 },
    population: 2780,
    childrenHealth: {
      totalChildren: 418,
      vaccinationCoverage: 93,
      vaccinationCompletionRate: 89,
      fullyImmunized: 372,
    },
    maternalHealth: {
      pregnantEnrolled: 32,
      totalPregnant: 35,
      enrollmentRate: 91,
      prenatalVisitCompliance: 88,
      trimesterBreakdown: {
        firstTrimester: 8,
        secondTrimester: 13,
        thirdTrimester: 14,
      },
      scheduledCheckups: 140,
      completedCheckups: 116,
    },
    seniorCitizen: {
      total: 250,
      receivingAssistance: 190,
      assistanceTypes: {
        medicines: 155,
        consultations: 140,
        financialAid: 80,
        homeVisits: 55,
      },
      coverageRate: 76,
    },
  },
  {
    id: 'brgy-triangulo',
    name: 'Triangulo',
    coordinates: { latitude: 13.6139, longitude: 123.1952 },
    population: 8120,
    childrenHealth: {
      totalChildren: 1220,
      vaccinationCoverage: 85,
      vaccinationCompletionRate: 80,
      fullyImmunized: 976,
    },
    maternalHealth: {
      pregnantEnrolled: 82,
      totalPregnant: 96,
      enrollmentRate: 85,
      prenatalVisitCompliance: 78,
      trimesterBreakdown: {
        firstTrimester: 30,
        secondTrimester: 37,
        thirdTrimester: 29,
      },
      scheduledCheckups: 384,
      completedCheckups: 327,
    },
    seniorCitizen: {
      total: 730,
      receivingAssistance: 550,
      assistanceTypes: {
        medicines: 460,
        consultations: 400,
        financialAid: 235,
        homeVisits: 160,
      },
      coverageRate: 75,
    },
  },
];

// Calculate city-wide statistics
export const getCityWideStats = () => {
  const totals = nagaCityHealthData.reduce(
    (acc, barangay) => ({
      totalChildren: acc.totalChildren + barangay.childrenHealth.totalChildren,
      fullyImmunized: acc.fullyImmunized + barangay.childrenHealth.fullyImmunized,
      totalPregnant: acc.totalPregnant + barangay.maternalHealth.totalPregnant,
      pregnantEnrolled: acc.pregnantEnrolled + barangay.maternalHealth.pregnantEnrolled,
      population: acc.population + barangay.population,
    }),
    { totalChildren: 0, fullyImmunized: 0, totalPregnant: 0, pregnantEnrolled: 0, population: 0 }
  );

  return {
    ...totals,
    averageVaccinationRate: Math.round((totals.fullyImmunized / totals.totalChildren) * 100),
    averageEnrollmentRate: Math.round((totals.pregnantEnrolled / totals.totalPregnant) * 100),
  };
};

// Naga City center for initial map view
export const NAGA_CITY_CENTER = {
  latitude: 13.6218,
  longitude: 123.1948,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};