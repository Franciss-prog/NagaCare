// ============================================================================
// LOCATION SERVICE
// Handles real-time GPS location with user permission
// Uses expo-location for native GPS access
// ============================================================================

import * as Location from 'expo-location';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}

export type LocationStatus =
  | 'idle'         // Haven't asked yet
  | 'requesting'   // Asking for permission
  | 'granted'      // Permission granted, location available
  | 'denied'       // User denied permission
  | 'unavailable'  // Location services are off / not available
  | 'error';       // Something went wrong

class LocationService {
  private currentLocation: UserLocation | null = null;
  private status: LocationStatus = 'idle';
  private lastFetch: number = 0;
  private cacheTimeout = 60 * 1000; // 1 minute cache — GPS doesn't change that fast for walking

  // ============================================================================
  // GET PERMISSION STATUS (without prompting)
  // ============================================================================
  async checkPermission(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch {
      return false;
    }
  }

  // ============================================================================
  // REQUEST PERMISSION
  // Prompts the user for location access
  // ============================================================================
  async requestPermission(): Promise<boolean> {
    try {
      this.status = 'requesting';
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        this.status = 'granted';
        return true;
      } else {
        this.status = 'denied';
        return false;
      }
    } catch (error) {
      console.error('Location permission error:', error);
      this.status = 'error';
      return false;
    }
  }

  // ============================================================================
  // GET CURRENT LOCATION
  // Returns cached location if fresh, otherwise fetches new GPS position.
  // Automatically requests permission if not yet asked.
  // ============================================================================
  async getCurrentLocation(): Promise<UserLocation | null> {
    // Return cache if fresh
    if (
      this.currentLocation &&
      Date.now() - this.lastFetch < this.cacheTimeout
    ) {
      return this.currentLocation;
    }

    try {
      // Check / request permission
      const hasPermission = await this.checkPermission();
      if (!hasPermission) {
        const granted = await this.requestPermission();
        if (!granted) {
          this.status = 'denied';
          return null;
        }
      }

      // Check if location services are enabled
      const serviceEnabled = await Location.hasServicesEnabledAsync();
      if (!serviceEnabled) {
        this.status = 'unavailable';
        console.warn('Location services are disabled');
        return null;
      }

      // Get actual GPS position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      this.currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      };
      this.lastFetch = Date.now();
      this.status = 'granted';

      return this.currentLocation;
    } catch (error) {
      console.error('Error getting location:', error);
      this.status = 'error';

      // Return stale cache as fallback
      return this.currentLocation;
    }
  }

  // ============================================================================
  // REVERSE GEOCODE — turn coordinates into a human-readable address
  // ============================================================================
  async reverseGeocode(
    location?: UserLocation | null
  ): Promise<{ address: string; area: string | null } | null> {
    const loc = location ?? this.currentLocation;
    if (!loc) return null;

    try {
      const results = await Location.reverseGeocodeAsync({
        latitude: loc.latitude,
        longitude: loc.longitude,
      });

      if (results.length > 0) {
        const r = results[0];
        // Build readable address from available parts
        const parts = [
          r.street,
          r.district,
          r.subregion,
          r.city,
          r.region,
        ].filter(Boolean);

        return {
          address: parts.join(', ') || `${loc.latitude.toFixed(5)}, ${loc.longitude.toFixed(5)}`,
          area: r.city || r.subregion || r.district || null,
        };
      }
    } catch (error) {
      console.error('Reverse geocode error:', error);
    }

    // Fallback to raw coords
    return {
      address: `${loc.latitude.toFixed(5)}, ${loc.longitude.toFixed(5)}`,
      area: null,
    };
  }

  // ============================================================================
  // GET LOCATION WITH ADDRESS — convenience method that fetches GPS + geocodes
  // ============================================================================
  async getLocationWithAddress(): Promise<{
    location: UserLocation;
    address: string;
    area: string | null;
  } | null> {
    const location = await this.getCurrentLocation();
    if (!location) return null;

    const geo = await this.reverseGeocode(location);
    return {
      location,
      address: geo?.address ?? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`,
      area: geo?.area ?? null,
    };
  }

  // ============================================================================
  // GET LAST KNOWN LOCATION (non-blocking, returns cache or null)
  // ============================================================================
  getLastKnownLocation(): UserLocation | null {
    return this.currentLocation;
  }

  // ============================================================================
  // GET CURRENT STATUS
  // ============================================================================
  getStatus(): LocationStatus {
    return this.status;
  }

  // ============================================================================
  // CLEAR CACHED LOCATION
  // ============================================================================
  clearCache(): void {
    this.currentLocation = null;
    this.lastFetch = 0;
  }
}

export const locationService = new LocationService();
