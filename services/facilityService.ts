// ============================================================================
// FACILITY SERVICE
// Handles health facility data from Supabase
// ============================================================================

import { supabase } from '../lib/supabase';
import type { HealthFacility as DBHealthFacility } from '../types/database';
import {
  classifyServiceNeed,
  facilityMatchesNeed,
  type ServiceType,
  type ServiceClassification,
} from './serviceClassifier';

// Extended facility type for app use (with computed fields)
export interface HealthFacility extends DBHealthFacility {
  // Computed/display fields
  services: string[];
  contact: string;
  type: 'hospital' | 'health-center' | 'clinic' | 'pharmacy';
}

// Facility with distance info (for distance-sorted results)
export interface FacilityWithDistance extends HealthFacility {
  distanceKm: number | null;
  matchedServiceType: ServiceType;
  matchedServiceLabel: string;
}

// User location (from GPS)
export interface UserLocation {
  latitude: number;
  longitude: number;
}

class FacilityService {
  private facilitiesCache: HealthFacility[] = [];
  private lastFetch: Date | null = null;
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  // ============================================================================
  // TRANSFORM DB FACILITY TO APP FACILITY
  // ============================================================================
  private transformFacility(dbFacility: DBHealthFacility): HealthFacility {
    // Parse services from general_services and specialized_services
    const services: string[] = [];
    if (dbFacility.general_services) {
      services.push(...dbFacility.general_services.split(',').map(s => s.trim()));
    }
    if (dbFacility.specialized_services) {
      services.push(...dbFacility.specialized_services.split(',').map(s => s.trim()));
    }

    // Extract contact from contact_json
    const contactJson = dbFacility.contact_json as Record<string, string> | null;
    const contact = contactJson?.phone || contactJson?.mobile || 'N/A';

    // Determine facility type based on name/capability
    let type: 'hospital' | 'health-center' | 'clinic' | 'pharmacy' = 'health-center';
    const nameLower = dbFacility.name.toLowerCase();
    if (nameLower.includes('hospital')) {
      type = 'hospital';
    } else if (nameLower.includes('clinic')) {
      type = 'clinic';
    } else if (nameLower.includes('pharmacy') || nameLower.includes('drugstore')) {
      type = 'pharmacy';
    }

    return {
      ...dbFacility,
      services,
      contact,
      type,
    };
  }

  // ============================================================================
  // GET ALL FACILITIES
  // ============================================================================
  async getAllFacilities(forceRefresh = false): Promise<HealthFacility[]> {
    // Return cache if valid
    if (
      !forceRefresh &&
      this.facilitiesCache.length > 0 &&
      this.lastFetch &&
      Date.now() - this.lastFetch.getTime() < this.cacheTimeout
    ) {
      return this.facilitiesCache;
    }

    try {
      const { data, error } = await supabase
        .from('health_facilities')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching facilities:', error);
        return this.facilitiesCache; // Return stale cache on error
      }

      this.facilitiesCache = (data || []).map(f => this.transformFacility(f));
      this.lastFetch = new Date();
      return this.facilitiesCache;
    } catch (error) {
      console.error('Error fetching facilities:', error);
      return this.facilitiesCache;
    }
  }

  // ============================================================================
  // GET FACILITY BY ID
  // ============================================================================
  async getFacilityById(id: string): Promise<HealthFacility | null> {
    // Check cache first
    const cached = this.facilitiesCache.find(f => f.id === id);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('health_facilities')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        return null;
      }

      return this.transformFacility(data);
    } catch (error) {
      console.error('Error fetching facility:', error);
      return null;
    }
  }

  // ============================================================================
  // SEARCH FACILITIES
  // ============================================================================
  async searchFacilities(query: string): Promise<HealthFacility[]> {
    const facilities = await this.getAllFacilities();
    const queryLower = query.toLowerCase();

    return facilities.filter(
      f =>
        f.name.toLowerCase().includes(queryLower) ||
        f.barangay.toLowerCase().includes(queryLower) ||
        f.services.some(s => s.toLowerCase().includes(queryLower))
    );
  }

  // ============================================================================
  // GET FACILITIES BY TYPE
  // ============================================================================
  async getFacilitiesByType(type: HealthFacility['type']): Promise<HealthFacility[]> {
    const facilities = await this.getAllFacilities();
    return facilities.filter(f => f.type === type);
  }

  // ============================================================================
  // GET FACILITIES BY BARANGAY
  // ============================================================================
  async getFacilitiesByBarangay(barangay: string): Promise<HealthFacility[]> {
    const facilities = await this.getAllFacilities();
    return facilities.filter(f => f.barangay.toLowerCase() === barangay.toLowerCase());
  }

  // ============================================================================
  // GET YAKAP ACCREDITED FACILITIES
  // ============================================================================
  async getYakapAccreditedFacilities(): Promise<HealthFacility[]> {
    const facilities = await this.getAllFacilities();
    return facilities.filter(f => f.yakap_accredited);
  }

  // ============================================================================
  // GET FACILITIES WITH SERVICE
  // ============================================================================
  async getFacilitiesWithService(service: string): Promise<HealthFacility[]> {
    const facilities = await this.getAllFacilities();
    const serviceLower = service.toLowerCase();
    return facilities.filter(f =>
      f.services.some(s => s.toLowerCase().includes(serviceLower))
    );
  }

  // ============================================================================
  // HAVERSINE DISTANCE CALCULATION
  // Returns distance in kilometers between two lat/lng points
  // ============================================================================
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // ============================================================================
  // FIND FACILITIES BY SERVICE COMPATIBILITY
  // Core logic: classify the user's need, filter by service match,
  // then rank by distance. Never prioritizes proximity over service fit.
  // ============================================================================
  async findFacilitiesForService(
    reason: string,
    userLocation?: UserLocation | null
  ): Promise<{
    facilities: FacilityWithDistance[];
    classification: ServiceClassification;
    noMatch: boolean;
  }> {
    const classification = classifyServiceNeed(reason);
    const allFacilities = await this.getAllFacilities();

    // STEP 1: Filter to only facilities that provide the required service
    let compatible: HealthFacility[];
    if (classification.serviceType === 'general') {
      // For general/unclassified needs, include all non-pharmacy facilities
      compatible = allFacilities.filter(f => f.type !== 'pharmacy');
    } else {
      // Filter using dynamic fuzzy matching against actual facility services
      compatible = allFacilities.filter(f =>
        facilityMatchesNeed(f.services, classification)
      );
    }

    // STEP 2: If no facilities match the service, return empty with noMatch flag
    if (compatible.length === 0) {
      return {
        facilities: [],
        classification,
        noMatch: true,
      };
    }

    // STEP 3: Compute distance for each compatible facility (if user location available)
    // Facility coordinates are looked up from a known coordinate map since
    // the DB doesn't store lat/lng.
    const facilitiesWithDistance: FacilityWithDistance[] = compatible.map(f => {
      let distanceKm: number | null = null;

      if (userLocation) {
        const coords = FACILITY_COORDINATES[f.id];
        if (coords) {
          distanceKm = this.calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            coords.latitude,
            coords.longitude
          );
        }
      }

      return {
        ...f,
        distanceKm,
        matchedServiceType: classification.serviceType,
        matchedServiceLabel: classification.label,
      };
    });

    // STEP 4: Sort by distance (closest first). Facilities without coordinates go last.
    facilitiesWithDistance.sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null) {
        return a.distanceKm - b.distanceKm;
      }
      if (a.distanceKm !== null) return -1;
      if (b.distanceKm !== null) return 1;
      return 0; // Both null — keep original order
    });

    return {
      facilities: facilitiesWithDistance,
      classification,
      noMatch: false,
    };
  }

  // ============================================================================
  // GET ALL FACILITIES WITH DISTANCE (no service filter, just sorted by proximity)
  // ============================================================================
  async getAllFacilitiesWithDistance(
    userLocation?: UserLocation | null
  ): Promise<FacilityWithDistance[]> {
    const allFacilities = await this.getAllFacilities();

    const withDistance: FacilityWithDistance[] = allFacilities.map(f => {
      let distanceKm: number | null = null;

      if (userLocation) {
        const coords = FACILITY_COORDINATES[f.id];
        if (coords) {
          distanceKm = this.calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            coords.latitude,
            coords.longitude
          );
        }
      }

      return {
        ...f,
        distanceKm,
        matchedServiceType: 'general' as ServiceType,
        matchedServiceLabel: 'All Services',
      };
    });

    // Sort by distance (closest first)
    withDistance.sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null) {
        return a.distanceKm - b.distanceKm;
      }
      if (a.distanceKm !== null) return -1;
      if (b.distanceKm !== null) return 1;
      return 0;
    });

    return withDistance;
  }

  // ============================================================================
  // CLASSIFY A REASON INTO A SERVICE TYPE (public helper)
  // ============================================================================
  classifyReason(reason: string): ServiceClassification {
    return classifyServiceNeed(reason);
  }
}

// ============================================================================
// KNOWN FACILITY COORDINATES
// Since the DB doesn't store lat/lng, we maintain a lookup map here.
// These match the coordinates from healthFacilities.ts static data.
// ============================================================================
const FACILITY_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  'hosp-camarines-sur': { latitude: 13.6218, longitude: 123.1895 },
  'hosp-bicol-med': { latitude: 13.6195, longitude: 123.1948 },
  'hosp-naga-metro': { latitude: 13.6198, longitude: 123.1862 },
  'bhc-abella': { latitude: 13.6235, longitude: 123.1799 },
  'bhc-bagumbayan': { latitude: 13.6289, longitude: 123.1895 },
  'bhc-concepcion-grande': { latitude: 13.6186, longitude: 123.2185 },
  'bhc-pacol': { latitude: 13.6502, longitude: 123.2425 },
  'clinic-naga-family': { latitude: 13.6210, longitude: 123.1920 },
  'clinic-pediatric-care': { latitude: 13.6245, longitude: 123.1875 },
  'clinic-womens-health': { latitude: 13.6178, longitude: 123.1938 },
  'pharmacy-mercury-1': { latitude: 13.6205, longitude: 123.1910 },
  'pharmacy-watsons': { latitude: 13.6192, longitude: 123.2015 },
  'pharmacy-southstar': { latitude: 13.6258, longitude: 123.1888 },
};

export const facilityService = new FacilityService();
