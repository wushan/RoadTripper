import Dexie, { type Table } from 'dexie';
import type { CachedPOI, UserPreferences, UsageQuota } from '@core/interfaces/storage';

/**
 * RoadTripper IndexedDB 資料庫
 */
class RoadTripperDB extends Dexie {
  pois!: Table<CachedPOI, string>;
  preferences!: Table<UserPreferences & { id: number }, number>;
  quota!: Table<UsageQuota & { id: number }, number>;

  constructor() {
    super('RoadTripperDB');

    this.version(1).stores({
      pois: 'id, cachedAt, [searchLat+searchLng]',
      preferences: 'id',
      quota: 'id, lastReset'
    });
  }
}

export const db = new RoadTripperDB();
