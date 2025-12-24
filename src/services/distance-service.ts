import { getPlatformServices } from '@/adapters';
import { useQuotaStore } from '@store/quota-store';
import { getTodayDateString } from '@core/utils/format';
import type { UsageQuota } from '@core/interfaces/storage';

const DEFAULT_QUOTA: UsageQuota = {
  distanceTraveled: 0,
  distanceLimit: 5000,
  searchCount: 0,
  searchLimit: 100,
  lastReset: getTodayDateString()
};

class DistanceService {
  private initialized = false;
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const storage = getPlatformServices().storage;
      const quota = await storage.getQuota();

      if (quota) {
        // Check if needs daily reset
        if (quota.lastReset !== getTodayDateString()) {
          const resetQuota = {
            ...quota,
            distanceTraveled: 0,
            searchCount: 0,
            lastReset: getTodayDateString()
          };
          await storage.updateQuota(resetQuota);
          this.syncToStore(resetQuota);
        } else {
          this.syncToStore(quota);
        }
      } else {
        // First time - save default quota
        await storage.updateQuota(DEFAULT_QUOTA);
      }

      this.initialized = true;
      console.log('[DistanceService] Initialized');
    } catch (error) {
      console.error('[DistanceService] Error initializing:', error);
    }
  }

  async saveQuota(): Promise<void> {
    try {
      const storage = getPlatformServices().storage;
      const state = useQuotaStore.getState();

      const quota: UsageQuota = {
        distanceTraveled: state.distanceTraveled,
        distanceLimit: state.distanceLimit,
        searchCount: state.searchCount,
        searchLimit: state.searchLimit,
        lastReset: state.lastReset
      };

      await storage.updateQuota(quota);
    } catch (error) {
      console.error('[DistanceService] Error saving quota:', error);
    }
  }

  // Debounced save - batches multiple updates
  debouncedSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveQuota();
      this.saveTimeout = null;
    }, 2000); // Save after 2 seconds of no updates
  }

  private syncToStore(quota: UsageQuota): void {
    const store = useQuotaStore.getState();

    // Only update if different to avoid infinite loops
    if (
      store.distanceTraveled !== quota.distanceTraveled ||
      store.searchCount !== quota.searchCount ||
      store.lastReset !== quota.lastReset
    ) {
      useQuotaStore.setState({
        distanceTraveled: quota.distanceTraveled,
        distanceLimit: quota.distanceLimit,
        searchCount: quota.searchCount,
        searchLimit: quota.searchLimit,
        lastReset: quota.lastReset
      });
    }
  }
}

export const distanceService = new DistanceService();

// Subscribe to quota store changes and persist
useQuotaStore.subscribe((state, prevState) => {
  // Only save if values actually changed (not just action references)
  if (
    state.distanceTraveled !== prevState.distanceTraveled ||
    state.searchCount !== prevState.searchCount
  ) {
    distanceService.debouncedSave();
  }
});
