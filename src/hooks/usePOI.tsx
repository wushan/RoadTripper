import { useCallback, useRef, useEffect } from 'react';
import { usePOIStore } from '@store/poi-store';
import { useLocationStore } from '@store/location-store';
import { useQuotaStore } from '@store/quota-store';
import { calculateDistance } from '@core/utils/geo';
import { getZoomForRadius } from '@core/models/poi';
import type { POI } from '@core/models/poi';

// Search will trigger if moved more than this distance (meters)
const SEARCH_DISTANCE_THRESHOLD = 100;

// Search radius configuration (for Phase 2 API implementation)
const SEARCH_CONFIG = {
  initialRadius: 1000,
  maxRadius: 10000,
  radiusStep: 1000,
  minResults: 3
} as const;

interface UsePOIReturn {
  /** Current POI list */
  pois: POI[];
  /** Whether currently searching */
  isSearching: boolean;
  /** Search error if any */
  searchError: string | null;
  /** Currently selected POI ID */
  selectedPOIId: string | null;
  /** Trigger a search at current position */
  searchNearby: () => Promise<void>;
  /** Select a POI */
  selectPOI: (id: string | null) => void;
  /** Get POI by ID */
  getPOIById: (id: string) => POI | undefined;
}

export function usePOI(): UsePOIReturn {
  const lastSearchPositionRef = useRef<{ lat: number; lng: number } | null>(null);

  const currentPosition = useLocationStore((state) => state.currentPosition);

  const pois = usePOIStore((state) => state.pois);
  const isSearching = usePOIStore((state) => state.isSearching);
  const searchError = usePOIStore((state) => state.searchError);
  const selectedPOIId = usePOIStore((state) => state.selectedPOIId);
  const setSearching = usePOIStore((state) => state.setSearching);
  const setSearchError = usePOIStore((state) => state.setSearchError);
  const setSearchRadius = usePOIStore((state) => state.setSearchRadius);
  const setSuggestedZoom = usePOIStore((state) => state.setSuggestedZoom);
  const setSelectedPOI = usePOIStore((state) => state.setSelectedPOI);
  const setLastSearchPosition = usePOIStore((state) => state.setLastSearchPosition);
  const filter = usePOIStore((state) => state.filter);

  const incrementSearchCount = useQuotaStore((state) => state.incrementSearchCount);
  const isSearchExceeded = useQuotaStore((state) => state.isSearchExceeded);

  const searchNearby = useCallback(async () => {
    if (!currentPosition) {
      setSearchError('\u7121\u6CD5\u53D6\u5F97\u4F4D\u7F6E\u8CC7\u8A0A');
      return;
    }

    if (isSearchExceeded()) {
      setSearchError('\u4ECA\u65E5\u641C\u5C0B\u6B21\u6578\u5DF2\u9054\u4E0A\u9650');
      return;
    }

    setSearching(true);
    setSearchError(null);

    try {
      // TODO: Replace with actual API call in Phase 2
      // For now, this is a placeholder that would call the Cloudflare Worker

      // Simulated delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // The actual implementation would:
      // 1. Start with SEARCH_CONFIG.initialRadius
      // 2. If results < SEARCH_CONFIG.minResults, expand by SEARCH_CONFIG.radiusStep
      // 3. Continue until SEARCH_CONFIG.maxRadius or enough results

      const finalRadius = SEARCH_CONFIG.initialRadius;
      setSearchRadius(finalRadius);
      setSuggestedZoom(getZoomForRadius(finalRadius));

      // Update last search position
      setLastSearchPosition(currentPosition.latitude, currentPosition.longitude);
      lastSearchPositionRef.current = {
        lat: currentPosition.latitude,
        lng: currentPosition.longitude
      };

      incrementSearchCount();
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : '\u641C\u5C0B\u5931\u6557');
    } finally {
      setSearching(false);
    }
  }, [
    currentPosition,
    filter,
    isSearchExceeded,
    setSearching,
    setSearchError,
    setSearchRadius,
    setSuggestedZoom,
    setLastSearchPosition,
    incrementSearchCount
  ]);

  const selectPOI = useCallback(
    (id: string | null) => {
      setSelectedPOI(id);
    },
    [setSelectedPOI]
  );

  const getPOIById = useCallback(
    (id: string) => {
      return pois.find((poi) => poi.id === id);
    },
    [pois]
  );

  // Auto-search when position changes significantly
  useEffect(() => {
    if (!currentPosition || isSearching) return;

    if (!lastSearchPositionRef.current) {
      // First search - will be triggered by component
      return;
    }

    const distance = calculateDistance(
      lastSearchPositionRef.current.lat,
      lastSearchPositionRef.current.lng,
      currentPosition.latitude,
      currentPosition.longitude
    );

    if (distance > SEARCH_DISTANCE_THRESHOLD) {
      // Trigger new search
      searchNearby();
    }
  }, [currentPosition, isSearching, searchNearby]);

  return {
    pois,
    isSearching,
    searchError,
    selectedPOIId,
    searchNearby,
    selectPOI,
    getPOIById
  };
}
