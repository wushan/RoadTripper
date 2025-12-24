import { create } from 'zustand';
import type { GeoPosition, LocationError } from '@core/interfaces/location';

interface LocationState {
  currentPosition: GeoPosition | null;
  error: LocationError | null;
  isTracking: boolean;
  permissionState: 'granted' | 'denied' | 'prompt' | null;
}

interface LocationActions {
  updatePosition: (position: GeoPosition) => void;
  setError: (error: LocationError | null) => void;
  setTracking: (isTracking: boolean) => void;
  setPermissionState: (state: 'granted' | 'denied' | 'prompt') => void;
  reset: () => void;
}

type LocationStore = LocationState & LocationActions;

const initialState: LocationState = {
  currentPosition: null,
  error: null,
  isTracking: false,
  permissionState: null
};

export const useLocationStore = create<LocationStore>()((set) => ({
  ...initialState,

  updatePosition: (position) =>
    set({ currentPosition: position, error: null }),

  setError: (error) => set({ error }),

  setTracking: (isTracking) => set({ isTracking }),

  setPermissionState: (permissionState) => set({ permissionState }),

  reset: () => set(initialState)
}));
