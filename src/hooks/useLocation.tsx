import { useEffect, useCallback, useRef } from 'react';
import { useLocationStore } from '@store/location-store';
import { useQuotaStore } from '@store/quota-store';
import { getPlatformServices } from '@/adapters';
import { calculateDistance, isGPSDrift } from '@core/utils/geo';
import type { GeoPosition, LocationError } from '@core/interfaces/location';

interface UseLocationOptions {
  /** Whether to start tracking automatically */
  autoStart?: boolean;
  /** Whether to track distance */
  trackDistance?: boolean;
}

interface UseLocationReturn {
  /** Current position */
  position: GeoPosition | null;
  /** Error if any */
  error: LocationError | null;
  /** Whether currently tracking */
  isTracking: boolean;
  /** Permission state */
  permissionState: 'granted' | 'denied' | 'prompt' | null;
  /** Start location tracking */
  startTracking: () => void;
  /** Stop location tracking */
  stopTracking: () => void;
  /** Request permission */
  requestPermission: () => Promise<boolean>;
}

export function useLocation(options: UseLocationOptions = {}): UseLocationReturn {
  const { autoStart = true, trackDistance = true } = options;

  const { location } = getPlatformServices();
  const lastPositionRef = useRef<GeoPosition | null>(null);

  const currentPosition = useLocationStore((state) => state.currentPosition);
  const error = useLocationStore((state) => state.error);
  const isTracking = useLocationStore((state) => state.isTracking);
  const permissionState = useLocationStore((state) => state.permissionState);
  const updatePosition = useLocationStore((state) => state.updatePosition);
  const setError = useLocationStore((state) => state.setError);
  const setTracking = useLocationStore((state) => state.setTracking);
  const setPermissionState = useLocationStore((state) => state.setPermissionState);

  const addDistance = useQuotaStore((state) => state.addDistance);

  const handlePositionUpdate = useCallback(
    (position: GeoPosition) => {
      // Track distance if enabled
      if (trackDistance && lastPositionRef.current) {
        const distance = calculateDistance(
          lastPositionRef.current.latitude,
          lastPositionRef.current.longitude,
          position.latitude,
          position.longitude
        );

        // Only add distance if it's not GPS drift
        if (!isGPSDrift(distance)) {
          addDistance(distance);
        }
      }

      lastPositionRef.current = position;
      updatePosition(position);
    },
    [trackDistance, updatePosition, addDistance]
  );

  const startTracking = useCallback(() => {
    location.watchPosition(
      handlePositionUpdate,
      (err) => {
        // Handle different error types appropriately
        if (err.code === 'PERMISSION_DENIED') {
          setError(err);
          setPermissionState('denied');
        } else if (err.code === 'POSITION_UNAVAILABLE') {
          // This is often a transient error (e.g., CoreLocation kCLErrorLocationUnknown)
          // Don't treat as fatal - the system may recover automatically
          console.debug('[Location] Transient location error - waiting for GPS signal...');
          // Don't set error state for transient errors
        } else if (err.code === 'TIMEOUT') {
          // Timeout is also transient - watchPosition will keep trying
          console.debug('[Location] Position timeout - retrying...');
        } else {
          setError(err);
        }
      }
    );
    setTracking(true);
  }, [location, handlePositionUpdate, setError, setTracking, setPermissionState]);

  const stopTracking = useCallback(() => {
    location.stopWatching();
    setTracking(false);
  }, [location, setTracking]);

  const requestPermission = useCallback(async () => {
    const granted = await location.requestPermission();
    setPermissionState(granted ? 'granted' : 'denied');
    return granted;
  }, [location, setPermissionState]);

  // Check permission on mount
  useEffect(() => {
    location.checkPermission().then(setPermissionState);
  }, [location, setPermissionState]);

  // Auto-start tracking if enabled
  useEffect(() => {
    if (autoStart && permissionState === 'granted') {
      startTracking();
    }

    return () => {
      if (isTracking) {
        stopTracking();
      }
    };
  }, [autoStart, permissionState, startTracking, stopTracking, isTracking]);

  return {
    position: currentPosition,
    error,
    isTracking,
    permissionState,
    startTracking,
    stopTracking,
    requestPermission
  };
}
