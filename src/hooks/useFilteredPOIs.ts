import { useMemo } from 'react';
import { usePOIStore } from '@store/poi-store';
import type { POI } from '@core/models/poi';

/**
 * Hook that returns POIs filtered by current filter settings
 */
export function useFilteredPOIs(): POI[] {
  const pois = usePOIStore((state) => state.pois);
  const filter = usePOIStore((state) => state.filter);

  const filteredPOIs = useMemo(() => {
    return pois.filter((poi) => {
      // Filter by category
      if (!filter.categories.includes(poi.type)) {
        return false;
      }

      // Filter by minimum rating
      if (filter.minRating > 0 && poi.rating < filter.minRating) {
        return false;
      }

      // Filter by open now (only if the flag is set and we have isOpen data)
      if (filter.openNow && poi.isOpen === false) {
        return false;
      }

      return true;
    });
  }, [pois, filter]);

  return filteredPOIs;
}
