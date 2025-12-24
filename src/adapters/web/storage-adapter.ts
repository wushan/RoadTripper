import type {
  StorageProvider,
  CachedPOI,
  UserPreferences,
  UsageQuota
} from '@core/interfaces/storage';
import { approximateDistance } from '@core/utils/geo';
import { db } from '@/db';

/**
 * Web 平台儲存服務實作
 * 使用 IndexedDB (透過 Dexie.js)
 */
export class WebStorageAdapter implements StorageProvider {
  async cachePOIs(pois: CachedPOI[]): Promise<void> {
    await db.pois.bulkPut(pois);
  }

  async getCachedPOIs(
    lat: number,
    lng: number,
    radius: number,
    maxAge: number = 10 * 60 * 1000
  ): Promise<CachedPOI[]> {
    const now = Date.now();
    const minCachedAt = now - maxAge;

    const allPOIs = await db.pois.where('cachedAt').above(minCachedAt).toArray();

    return allPOIs.filter((poi) => {
      const distance = approximateDistance(lat, lng, poi.searchLat, poi.searchLng);
      return distance <= radius;
    });
  }

  async clearExpiredCache(maxAge: number): Promise<void> {
    const minCachedAt = Date.now() - maxAge;
    await db.pois.where('cachedAt').below(minCachedAt).delete();
  }

  async getPreferences(): Promise<UserPreferences | null> {
    const result = await db.preferences.get(1);
    if (result) {
      const { id: _, ...preferences } = result;
      return preferences;
    }
    return null;
  }

  async savePreferences(preferences: UserPreferences): Promise<void> {
    await db.preferences.put({ ...preferences, id: 1 });
  }

  async getQuota(): Promise<UsageQuota | null> {
    const result = await db.quota.get(1);
    if (result) {
      const { id: _, ...quota } = result;
      return quota;
    }
    return null;
  }

  async updateQuota(quota: UsageQuota): Promise<void> {
    await db.quota.put({ ...quota, id: 1 });
  }
}
