import { placesAPI } from '@/api';
import { getPlatformServices } from '@/adapters';
import { calculateDistance } from '@core/utils/geo';
import type { POI, POIType } from '@core/models/poi';
import type { CachedPOI } from '@core/interfaces/storage';

const CACHE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const CACHE_DISTANCE_THRESHOLD = 200; // 200 meters - use cached results within this distance

interface SearchParams {
  latitude: number;
  longitude: number;
  radius: number;
  types: POIType[];
}

interface CacheEntry {
  pois: POI[];
  latitude: number;
  longitude: number;
  radius: number;
  types: POIType[];
  timestamp: number;
}

class POIService {
  private memoryCache: CacheEntry | null = null;

  async searchNearby(params: SearchParams): Promise<POI[]> {
    const { latitude, longitude, radius, types } = params;

    // Check memory cache first
    const cached = this.checkCache(latitude, longitude, radius, types);
    if (cached) {
      console.log('[POIService] Using cached results');
      return this.recalculateDistances(cached, latitude, longitude);
    }

    // Check IndexedDB cache
    const dbCached = await this.checkDBCache(latitude, longitude, radius, types);
    if (dbCached) {
      console.log('[POIService] Using IndexedDB cached results');
      this.memoryCache = {
        pois: dbCached,
        latitude,
        longitude,
        radius,
        types,
        timestamp: Date.now()
      };
      return this.recalculateDistances(dbCached, latitude, longitude);
    }

    // Fetch from API
    console.log('[POIService] Fetching from API');
    const pois = await placesAPI.searchNearby({
      latitude,
      longitude,
      radius,
      types
    });

    // Calculate distances and sort by nearest first
    const poisWithDistance = pois
      .map((poi) => ({
        ...poi,
        distance: calculateDistance(
          latitude,
          longitude,
          poi.location.latitude,
          poi.location.longitude
        )
      }))
      .sort((a, b) => a.distance - b.distance);

    // Update caches
    this.memoryCache = {
      pois: poisWithDistance,
      latitude,
      longitude,
      radius,
      types,
      timestamp: Date.now()
    };
    await this.updateDBCache(poisWithDistance, latitude, longitude, radius);

    return poisWithDistance;
  }

  async getPlaceDetails(placeId: string): Promise<POI> {
    // Try to find in cache first
    const cached = this.memoryCache?.pois.find((p) => p.id === placeId);
    if (cached) {
      return cached;
    }

    // Fetch from API
    return placesAPI.getPlaceDetails(placeId);
  }

  private checkCache(
    lat: number,
    lng: number,
    radius: number,
    types: POIType[]
  ): POI[] | null {
    if (!this.memoryCache) return null;

    // Check if cache is expired
    if (Date.now() - this.memoryCache.timestamp > CACHE_EXPIRY_MS) {
      this.memoryCache = null;
      return null;
    }

    // Check if search params are compatible
    const distance = calculateDistance(
      lat,
      lng,
      this.memoryCache.latitude,
      this.memoryCache.longitude
    );

    // Cache is valid if:
    // 1. Position hasn't changed much
    // 2. New radius is not larger than cached radius
    // 3. All requested types were in the cached search
    const typesMatch = types.every((t) => this.memoryCache!.types.includes(t));

    if (
      distance <= CACHE_DISTANCE_THRESHOLD &&
      radius <= this.memoryCache.radius &&
      typesMatch
    ) {
      return this.memoryCache.pois;
    }

    return null;
  }

  private async checkDBCache(
    lat: number,
    lng: number,
    radius: number,
    types: POIType[]
  ): Promise<POI[] | null> {
    try {
      const storage = getPlatformServices().storage;
      const cached = await storage.getCachedPOIs(lat, lng, radius);

      if (cached.length === 0) return null;

      // Filter by types
      const filtered = cached.filter((poi) => types.includes(poi.type));
      if (filtered.length < cached.length * 0.5) {
        // Less than 50% of cached results match the types
        return null;
      }

      return filtered;
    } catch (error) {
      console.error('[POIService] Error reading DB cache:', error);
      return null;
    }
  }

  private async updateDBCache(
    pois: POI[],
    lat: number,
    lng: number,
    radius: number
  ): Promise<void> {
    try {
      const storage = getPlatformServices().storage;
      const cachedPOIs: CachedPOI[] = pois.map((poi) => ({
        ...poi,
        cachedAt: Date.now(),
        searchLat: lat,
        searchLng: lng,
        searchRadius: radius
      }));
      await storage.cachePOIs(cachedPOIs);
    } catch (error) {
      console.error('[POIService] Error updating DB cache:', error);
    }
  }

  private recalculateDistances(pois: POI[], lat: number, lng: number): POI[] {
    return pois
      .map((poi) => ({
        ...poi,
        distance: calculateDistance(
          lat,
          lng,
          poi.location.latitude,
          poi.location.longitude
        )
      }))
      .sort((a, b) => a.distance - b.distance);
  }

  clearCache(): void {
    this.memoryCache = null;
  }
}

export const poiService = new POIService();
