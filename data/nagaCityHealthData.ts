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
    prenatalVisitCompliance: number; // percentage
  };
  population: number;
}

// Naga City center coordinates: 13.6218° N, 123.1948° E
// Data for selected barangays in Naga City, Camarines Sur

export const nagaCityHealthData: BarangayHealthData[] = [
  {
    id: 'brgy-abella',
    name: 'Abella',
    coordinates: { latitude: 13.6195, longitude: 123.1920 },
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
    },
  },
  {
    id: 'brgy-bagumbayan-norte',
    name: 'Bagumbayan Norte',
    coordinates: { latitude: 13.6240, longitude: 123.1885 },
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
    },
  },
  {
    id: 'brgy-balatas',
    name: 'Balatas',
    coordinates: { latitude: 13.6155, longitude: 123.1975 },
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
    },
  },
  {
    id: 'brgy-carolina',
    name: 'Carolina',
    coordinates: { latitude: 13.6280, longitude: 123.1950 },
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
    },
  },
  {
    id: 'brgy-concepcion-pequena',
    name: 'Concepcion Pequeña',
    coordinates: { latitude: 13.6210, longitude: 123.2010 },
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
    },
  },
  {
    id: 'brgy-dinaga',
    name: 'Dinaga',
    coordinates: { latitude: 13.6170, longitude: 123.1890 },
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
    },
  },
  {
    id: 'brgy-igualdad-interior',
    name: 'Igualdad Interior',
    coordinates: { latitude: 13.6250, longitude: 123.1970 },
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
    },
  },
  {
    id: 'brgy-lerma',
    name: 'Lerma',
    coordinates: { latitude: 13.6300, longitude: 123.1920 },
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
    },
  },
  {
    id: 'brgy-liboton',
    name: 'Liboton',
    coordinates: { latitude: 13.6135, longitude: 123.1945 },
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
    },
  },
  {
    id: 'brgy-panganiban',
    name: 'Panganiban',
    coordinates: { latitude: 13.6265, longitude: 123.1935 },
    population: 5890,
    childrenHealth: {
      totalChildren: 885,
      vaccinationCoverage: 86,
      vaccinationCompletionRate: 81,
      fullyImmunized: 717,
    },
    maternalHealth: {
      pregnantEnrolled: 62,
      totalPregnant: 72,
      enrollmentRate: 86,
      prenatalVisitCompliance: 79,
    },
  },
  {
    id: 'brgy-penafrancia',
    name: 'Peñafrancia',
    coordinates: { latitude: 13.6190, longitude: 123.1960 },
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
    },
  },
  {
    id: 'brgy-sabang',
    name: 'Sabang',
    coordinates: { latitude: 13.6325, longitude: 123.1975 },
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
    },
  },
  {
    id: 'brgy-san-felipe',
    name: 'San Felipe',
    coordinates: { latitude: 13.6220, longitude: 123.1895 },
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
    },
  },
  {
    id: 'brgy-sta-cruz',
    name: 'Sta. Cruz',
    coordinates: { latitude: 13.6285, longitude: 123.2000 },
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
    },
  },
  {
    id: 'brgy-triangulo',
    name: 'Triangulo',
    coordinates: { latitude: 13.6245, longitude: 123.1915 },
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
    },
  },
  {
    id: 'brgy-bagumbayan-sur',
    name: 'Bagumbayan Sur',
    coordinates: { latitude: 13.6215, longitude: 123.1870 },
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
    },
  },
  {
    id: 'brgy-calauag',
    name: 'Calauag',
    coordinates: { latitude: 13.6180, longitude: 123.2025 },
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
    },
  },
  {
    id: 'brgy-cararayan',
    name: 'Cararayan',
    coordinates: { latitude: 13.6340, longitude: 123.1890 },
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
    },
  },
  {
    id: 'brgy-concepcion-grande',
    name: 'Concepcion Grande',
    coordinates: { latitude: 13.6165, longitude: 123.2050 },
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
    },
  },
  {
    id: 'brgy-dayangdang',
    name: 'Dayangdang',
    coordinates: { latitude: 13.6090, longitude: 123.1985 },
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
    },
  },
  {
    id: 'brgy-mabolo',
    name: 'Mabolo',
    coordinates: { latitude: 13.6380, longitude: 123.1930 },
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
    },
  },
  {
    id: 'brgy-pacol',
    name: 'Pacol',
    coordinates: { latitude: 13.6350, longitude: 123.2020 },
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
    },
  },
  {
    id: 'brgy-panicuason',
    name: 'Panicuason',
    coordinates: { latitude: 13.6050, longitude: 123.1920 },
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
    },
  },
  {
    id: 'brgy-san-francisco',
    name: 'San Francisco',
    coordinates: { latitude: 13.6310, longitude: 123.1895 },
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
    },
  },
  {
    id: 'brgy-tabuco',
    name: 'Tabuco',
    coordinates: { latitude: 13.6120, longitude: 123.1860 },
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
    },
  },
  {
    id: 'brgy-tinago',
    name: 'Tinago',
    coordinates: { latitude: 13.6270, longitude: 123.2030 },
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
    },
  },
  {
    id: 'brgy-palestina',
    name: 'Palestina',
    coordinates: { latitude: 13.6145, longitude: 123.1850 },
    population: 4560,
    childrenHealth: {
      totalChildren: 684,
      vaccinationCoverage: 89,
      vaccinationCompletionRate: 85,
      fullyImmunized: 581,
    },
    maternalHealth: {
      pregnantEnrolled: 50,
      totalPregnant: 57,
      enrollmentRate: 88,
      prenatalVisitCompliance: 83,
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
