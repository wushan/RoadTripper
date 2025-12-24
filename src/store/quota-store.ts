import { create } from 'zustand';
import { getTodayDateString, isToday } from '@core/utils/format';

interface QuotaState {
  distanceTraveled: number;
  distanceLimit: number;
  searchCount: number;
  searchLimit: number;
  lastReset: string;
}

interface QuotaActions {
  addDistance: (meters: number) => void;
  incrementSearchCount: () => void;
  checkAndResetIfNeeded: () => void;
  isDistanceExceeded: () => boolean;
  isSearchExceeded: () => boolean;
  getDistancePercentage: () => number;
  reset: () => void;
}

type QuotaStore = QuotaState & QuotaActions;

const DEFAULT_DISTANCE_LIMIT = 5000;
const DEFAULT_SEARCH_LIMIT = 100;

const initialState: QuotaState = {
  distanceTraveled: 0,
  distanceLimit: DEFAULT_DISTANCE_LIMIT,
  searchCount: 0,
  searchLimit: DEFAULT_SEARCH_LIMIT,
  lastReset: getTodayDateString()
};

export const useQuotaStore = create<QuotaStore>()((set, get) => ({
  ...initialState,

  addDistance: (meters) =>
    set((state) => ({
      distanceTraveled: state.distanceTraveled + meters
    })),

  incrementSearchCount: () =>
    set((state) => ({
      searchCount: state.searchCount + 1
    })),

  checkAndResetIfNeeded: () => {
    const { lastReset } = get();
    if (!isToday(lastReset)) {
      set({
        distanceTraveled: 0,
        searchCount: 0,
        lastReset: getTodayDateString()
      });
    }
  },

  isDistanceExceeded: () => {
    const { distanceTraveled, distanceLimit } = get();
    return distanceTraveled >= distanceLimit;
  },

  isSearchExceeded: () => {
    const { searchCount, searchLimit } = get();
    return searchCount >= searchLimit;
  },

  getDistancePercentage: () => {
    const { distanceTraveled, distanceLimit } = get();
    return Math.min((distanceTraveled / distanceLimit) * 100, 100);
  },

  reset: () => set(initialState)
}));
