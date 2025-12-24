import { create } from 'zustand';
import type { POI } from '@core/models/poi';
import type { POIFilter } from '@core/models/filter';
import { DEFAULT_FILTER } from '@core/models/filter';

interface POIState {
  pois: POI[];
  isSearching: boolean;
  searchError: string | null;
  searchRadius: number;
  suggestedZoom: number | null;
  filter: POIFilter;
  lastSearchPosition: { lat: number; lng: number } | null;
  selectedPOIId: string | null;
}

interface POIActions {
  setPOIs: (pois: POI[]) => void;
  setSearching: (isSearching: boolean) => void;
  setSearchError: (error: string | null) => void;
  setSearchRadius: (radius: number) => void;
  setSuggestedZoom: (zoom: number | null) => void;
  updateFilter: (filter: Partial<POIFilter>) => void;
  resetFilter: () => void;
  setLastSearchPosition: (lat: number, lng: number) => void;
  setSelectedPOI: (id: string | null) => void;
  clearPOIs: () => void;
}

type POIStore = POIState & POIActions;

const initialState: POIState = {
  pois: [],
  isSearching: false,
  searchError: null,
  searchRadius: 1000,
  suggestedZoom: null,
  filter: DEFAULT_FILTER,
  lastSearchPosition: null,
  selectedPOIId: null
};

export const usePOIStore = create<POIStore>()((set) => ({
  ...initialState,

  setPOIs: (pois) =>
    set({
      pois,
      isSearching: false,
      searchError: null
    }),

  setSearching: (isSearching) => set({ isSearching }),

  setSearchError: (searchError) => set({ searchError, isSearching: false }),

  setSearchRadius: (searchRadius) => set({ searchRadius }),

  setSuggestedZoom: (suggestedZoom) => set({ suggestedZoom }),

  updateFilter: (filterUpdate) =>
    set((state) => ({
      filter: { ...state.filter, ...filterUpdate }
    })),

  resetFilter: () => set({ filter: DEFAULT_FILTER }),

  setLastSearchPosition: (lat, lng) =>
    set({ lastSearchPosition: { lat, lng } }),

  setSelectedPOI: (selectedPOIId) => set({ selectedPOIId }),

  clearPOIs: () => set({ pois: [], suggestedZoom: null, selectedPOIId: null })
}));
