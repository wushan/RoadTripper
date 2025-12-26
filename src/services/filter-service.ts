import { getPlatformServices } from '@/adapters';
import { usePOIStore } from '@store/poi-store';
import { useUIStore, type ThemeMode } from '@store/ui-store';
import { DEFAULT_FILTER } from '@core/models/filter';
import type { POIFilter } from '@core/models/filter';
import type { UserPreferences } from '@core/interfaces/storage';

class FilterService {
  private initialized = false;
  private saveTimeout: ReturnType<typeof setTimeout> | null = null;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const storage = getPlatformServices().storage;
      const preferences = await storage.getPreferences();

      if (preferences) {
        // Sync filter to store
        usePOIStore.setState({
          filter: {
            categories: preferences.enabledCategories as POIFilter['categories'],
            minRating: preferences.minRating,
            openNow: preferences.openNowOnly
          }
        });

        // Sync theme to store
        if (preferences.theme) {
          useUIStore.getState().setTheme(preferences.theme as ThemeMode);
        }
      }

      this.initialized = true;
      console.log('[FilterService] Initialized');
    } catch (error) {
      console.error('[FilterService] Error initializing:', error);
    }
  }

  async savePreferences(): Promise<void> {
    try {
      const storage = getPlatformServices().storage;
      const filter = usePOIStore.getState().filter;
      const theme = useUIStore.getState().theme;

      const preferences: UserPreferences = {
        enabledCategories: filter.categories,
        minRating: filter.minRating,
        openNowOnly: filter.openNow,
        theme: theme
      };

      await storage.savePreferences(preferences);
      console.log('[FilterService] Preferences saved');
    } catch (error) {
      console.error('[FilterService] Error saving preferences:', error);
    }
  }

  // Legacy method for backwards compatibility
  async saveFilter(): Promise<void> {
    return this.savePreferences();
  }

  // Debounced save
  debouncedSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveFilter();
      this.saveTimeout = null;
    }, 500);
  }

  reset(): void {
    usePOIStore.setState({ filter: DEFAULT_FILTER });
    this.saveFilter();
  }
}

export const filterService = new FilterService();

// Subscribe to filter changes and persist
let previousFilter = usePOIStore.getState().filter;
usePOIStore.subscribe((state) => {
  if (state.filter !== previousFilter) {
    previousFilter = state.filter;
    filterService.debouncedSave();
  }
});

// Subscribe to theme changes and persist
let previousTheme = useUIStore.getState().theme;
useUIStore.subscribe((state) => {
  if (state.theme !== previousTheme) {
    previousTheme = state.theme;
    filterService.debouncedSave();
  }
});
