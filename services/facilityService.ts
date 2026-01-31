// ============================================================================
// FACILITY SERVICE
// Handles health facility data from Supabase
// ============================================================================

import { supabase } from '../lib/supabase';
import type { HealthFacility as DBHealthFacility } from '../types/database';

// Extended facility type for app use (with computed fields)
export interface HealthFacility extends DBHealthFacility {
  // Computed/display fields
  services: string[];
  contact: string;
  type: 'hospital' | 'health-center' | 'clinic' | 'pharmacy';
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
}

export const facilityService = new FacilityService();
