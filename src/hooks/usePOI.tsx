import { useCallback, useRef, useEffect } from 'react';
import { usePOIStore } from '@store/poi-store';
import { useLocationStore } from '@store/location-store';
import { useQuotaStore } from '@store/quota-store';
import { calculateDistance } from '@core/utils/geo';
import { getZoomForRadius } from '@core/models/poi';
import { placesAPI } from '@/api';
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

  const setPOIs = usePOIStore((state) => state.setPOIs);

  const searchNearby = useCallback(async () => {
    if (!currentPosition) {
      setSearchError('無法取得位置資訊');
      return;
    }

    if (isSearchExceeded()) {
      setSearchError('今日搜尋次數已達上限');
      return;
    }

    setSearching(true);
    setSearchError(null);

    try {
      // Get enabled POI types from filter
      const enabledTypes = filter.categories;

      if (enabledTypes.length === 0) {
        setPOIs([]);
        setSearchRadius(SEARCH_CONFIG.initialRadius);
        return;
      }

      let currentRadius = SEARCH_CONFIG.initialRadius;
      let results: POI[] = [];

      // Progressive radius expansion
      while (
        results.length < SEARCH_CONFIG.minResults &&
        currentRadius <= SEARCH_CONFIG.maxRadius
      ) {
        results = await placesAPI.searchNearby({
          latitude: currentPosition.latitude,
          longitude: currentPosition.longitude,
          radius: currentRadius,
          types: enabledTypes
        });

        // Calculate distance for each POI
        results = results.map((poi) => ({
          ...poi,
          distance: calculateDistance(
            currentPosition.latitude,
            currentPosition.longitude,
            poi.location.latitude,
            poi.location.longitude
          )
        }));

        // Sort by distance
        results.sort((a, b) => a.distance - b.distance);

        if (results.length < SEARCH_CONFIG.minResults) {
          currentRadius += SEARCH_CONFIG.radiusStep;
        }
      }

      setPOIs(results);
      setSearchRadius(currentRadius);
      setSuggestedZoom(getZoomForRadius(currentRadius));

      // Update last search position
      setLastSearchPosition(currentPosition.latitude, currentPosition.longitude);
      lastSearchPositionRef.current = {
        lat: currentPosition.latitude,
        lng: currentPosition.longitude
      };

      incrementSearchCount();
    } catch (err) {
      console.error('Search error:', err);
      setSearchError(err instanceof Error ? err.message : '搜尋失敗');
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
    incrementSearchCount,
    setPOIs
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
