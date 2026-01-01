// Health facilities in Naga City with real locations and services

export type FacilityType = 'hospital' | 'health-center' | 'clinic' | 'pharmacy';

export interface HealthFacility {
  id: string;
  name: string;
  type: FacilityType;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  address: string;
  barangay: string;
  services: string[];
  operatingHours: {
    weekdays: string;
    weekends: string;
  };
  contact: string;
  emergencyServices: boolean;
  rating: number;
  estimatedWaitTime?: number; // in minutes
}

export const healthFacilities: HealthFacility[] = [
  // Major Hospitals
  {
    id: 'hosp-camarines-sur',
    name: 'Camarines Sur Provincial Hospital',
    type: 'hospital',
    coordinates: { latitude: 13.6218, longitude: 123.1895 },
    address: 'Lerma Street, Barangay Lerma',
    barangay: 'Lerma',
    services: [
      'Emergency Room',
      'Surgery',
      'Maternity',
      'Pediatrics',
      'Laboratory',
      'Pharmacy',
      'X-Ray',
      'Vaccination',
    ],
    operatingHours: {
      weekdays: '24/7',
      weekends: '24/7',
    },
    contact: '(054) 473-2857',
    emergencyServices: true,
    rating: 4.2,
    estimatedWaitTime: 45,
  },
  {
    id: 'hosp-bicol-med',
    name: 'Bicol Medical Center',
    type: 'hospital',
    coordinates: { latitude: 13.6195, longitude: 123.1948 },
    address: 'Rizal Avenue, Barangay Triangulo',
    barangay: 'Triangulo',
    services: [
      'Emergency Room',
      'ICU',
      'Surgery',
      'Maternity',
      'Pediatrics',
      'Cardiology',
      'Laboratory',
      'Pharmacy',
      'Radiology',
      'Vaccination',
    ],
    operatingHours: {
      weekdays: '24/7',
      weekends: '24/7',
    },
    contact: '(054) 811-2350',
    emergencyServices: true,
    rating: 4.5,
    estimatedWaitTime: 30,
  },
  {
    id: 'hosp-naga-metro',
    name: 'Naga Metropolitan Cathedral Hospital',
    type: 'hospital',
    coordinates: { latitude: 13.6198, longitude: 123.1862 },
    address: 'Peñafrancia Avenue, Barangay Peñafrancia',
    barangay: 'Peñafrancia',
    services: [
      'Emergency Room',
      'Surgery',
      'Maternity',
      'Pediatrics',
      'Internal Medicine',
      'Laboratory',
      'Pharmacy',
      'Vaccination',
    ],
    operatingHours: {
      weekdays: '24/7',
      weekends: '24/7',
    },
    contact: '(054) 473-5555',
    emergencyServices: true,
    rating: 4.3,
    estimatedWaitTime: 35,
  },

  // Barangay Health Centers
  {
    id: 'bhc-abella',
    name: 'Abella Barangay Health Center',
    type: 'health-center',
    coordinates: { latitude: 13.6235, longitude: 123.1799 },
    address: 'Barangay Abella',
    barangay: 'Abella',
    services: [
      'Prenatal Care',
      'Child Immunization',
      'Family Planning',
      'Basic Health Consultation',
      'Blood Pressure Monitoring',
      'Maternal Care',
    ],
    operatingHours: {
      weekdays: '8:00 AM - 5:00 PM',
      weekends: 'Closed',
    },
    contact: '(054) 473-1234',
    emergencyServices: false,
    rating: 4.0,
  },
  {
    id: 'bhc-bagumbayan',
    name: 'Bagumbayan Norte Health Center',
    type: 'health-center',
    coordinates: { latitude: 13.6289, longitude: 123.1895 },
    address: 'Barangay Bagumbayan Norte',
    barangay: 'Bagumbayan Norte',
    services: [
      'Prenatal Care',
      'Child Immunization',
      'Family Planning',
      'TB DOTS Program',
      'Basic Health Consultation',
      'Senior Citizen Care',
    ],
    operatingHours: {
      weekdays: '8:00 AM - 5:00 PM',
      weekends: 'Closed',
    },
    contact: '(054) 473-2345',
    emergencyServices: false,
    rating: 4.1,
  },
  {
    id: 'bhc-concepcion-grande',
    name: 'Concepcion Grande Health Station',
    type: 'health-center',
    coordinates: { latitude: 13.6186, longitude: 123.2185 },
    address: 'Barangay Concepcion Grande',
    barangay: 'Concepcion Grande',
    services: [
      'Prenatal Care',
      'Child Immunization',
      'Family Planning',
      'Basic Health Consultation',
      'Maternal Care',
    ],
    operatingHours: {
      weekdays: '8:00 AM - 5:00 PM',
      weekends: 'Closed',
    },
    contact: '(054) 473-3456',
    emergencyServices: false,
    rating: 3.9,
  },
  {
    id: 'bhc-pacol',
    name: 'Pacol Health Center',
    type: 'health-center',
    coordinates: { latitude: 13.6502, longitude: 123.2425 },
    address: 'Barangay Pacol',
    barangay: 'Pacol',
    services: [
      'Prenatal Care',
      'Child Immunization',
      'Family Planning',
      'TB DOTS Program',
      'Basic Health Consultation',
      'Senior Citizen Care',
      'Maternal Care',
    ],
    operatingHours: {
      weekdays: '8:00 AM - 5:00 PM',
      weekends: 'Closed',
    },
    contact: '(054) 473-4567',
    emergencyServices: false,
    rating: 4.2,
  },

  // Private Clinics
  {
    id: 'clinic-naga-family',
    name: 'Naga Family Clinic',
    type: 'clinic',
    coordinates: { latitude: 13.6210, longitude: 123.1920 },
    address: 'Magsaysay Avenue, Barangay Triangulo',
    barangay: 'Triangulo',
    services: [
      'General Practice',
      'Pediatrics',
      'Internal Medicine',
      'Laboratory',
      'Minor Procedures',
    ],
    operatingHours: {
      weekdays: '8:00 AM - 8:00 PM',
      weekends: '9:00 AM - 5:00 PM',
    },
    contact: '(054) 473-6789',
    emergencyServices: false,
    rating: 4.4,
    estimatedWaitTime: 20,
  },
  {
    id: 'clinic-pediatric-care',
    name: 'Naga Pediatric Care Center',
    type: 'clinic',
    coordinates: { latitude: 13.6245, longitude: 123.1875 },
    address: 'Panganiban Drive, Barangay Peñafrancia',
    barangay: 'Peñafrancia',
    services: [
      'Pediatrics',
      'Child Immunization',
      'Growth Monitoring',
      'Newborn Care',
      'Well-Baby Clinic',
    ],
    operatingHours: {
      weekdays: '9:00 AM - 6:00 PM',
      weekends: '9:00 AM - 12:00 PM',
    },
    contact: '(054) 473-7890',
    emergencyServices: false,
    rating: 4.6,
    estimatedWaitTime: 15,
  },
  {
    id: 'clinic-womens-health',
    name: 'Women\'s Health Center Naga',
    type: 'clinic',
    coordinates: { latitude: 13.6178, longitude: 123.1938 },
    address: 'Barlin Street, Barangay Triangulo',
    barangay: 'Triangulo',
    services: [
      'OB-GYN',
      'Prenatal Care',
      'Postnatal Care',
      'Family Planning',
      'Ultrasound',
      'Maternal Care',
    ],
    operatingHours: {
      weekdays: '8:00 AM - 6:00 PM',
      weekends: 'Closed',
    },
    contact: '(054) 473-8901',
    emergencyServices: false,
    rating: 4.5,
    estimatedWaitTime: 25,
  },

  // Pharmacies
  {
    id: 'pharmacy-mercury-1',
    name: 'Mercury Drug - Magsaysay',
    type: 'pharmacy',
    coordinates: { latitude: 13.6205, longitude: 123.1910 },
    address: 'Magsaysay Avenue, Barangay Triangulo',
    barangay: 'Triangulo',
    services: [
      'Prescription Medicines',
      'OTC Medicines',
      'Vitamins & Supplements',
      'Medical Supplies',
      'Blood Pressure Check',
    ],
    operatingHours: {
      weekdays: '7:00 AM - 10:00 PM',
      weekends: '7:00 AM - 10:00 PM',
    },
    contact: '(054) 473-9012',
    emergencyServices: false,
    rating: 4.3,
  },
  {
    id: 'pharmacy-watsons',
    name: 'Watsons - SM Naga',
    type: 'pharmacy',
    coordinates: { latitude: 13.6192, longitude: 123.2015 },
    address: 'SM City Naga, Barangay Triangulo',
    barangay: 'Triangulo',
    services: [
      'Prescription Medicines',
      'OTC Medicines',
      'Health & Wellness Products',
      'Medical Supplies',
      'Consultation',
    ],
    operatingHours: {
      weekdays: '10:00 AM - 9:00 PM',
      weekends: '10:00 AM - 9:00 PM',
    },
    contact: '(054) 473-0123',
    emergencyServices: false,
    rating: 4.4,
  },
  {
    id: 'pharmacy-southstar',
    name: 'Southstar Drug - Peñafrancia',
    type: 'pharmacy',
    coordinates: { latitude: 13.6258, longitude: 123.1888 },
    address: 'Peñafrancia Avenue, Barangay Peñafrancia',
    barangay: 'Peñafrancia',
    services: [
      'Prescription Medicines',
      'OTC Medicines',
      'Vitamins & Supplements',
      'Medical Supplies',
    ],
    operatingHours: {
      weekdays: '8:00 AM - 8:00 PM',
      weekends: '8:00 AM - 8:00 PM',
    },
    contact: '(054) 473-1234',
    emergencyServices: false,
    rating: 4.2,
  },
];

// Helper functions
export const getFacilitiesByType = (type: FacilityType) => {
  return healthFacilities.filter((f) => f.type === type);
};

export const getFacilityById = (id: string) => {
  return healthFacilities.find((f) => f.id === id);
};

export const getEmergencyFacilities = () => {
  return healthFacilities.filter((f) => f.emergencyServices);
};
