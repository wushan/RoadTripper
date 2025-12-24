import { useCallback, useRef } from 'react';
import type { MapRef } from 'react-map-gl';
import { usePOIStore } from '@store/poi-store';
import { useLocationStore } from '@store/location-store';

interface FlyToOptions {
  duration?: number;
  zoom?: number;
}

interface UseMapReturn {
  /** Ref to attach to the Map component */
  mapRef: React.RefObject<MapRef | null>;
  /** Fly to a specific location */
  flyTo: (lat: number, lng: number, options?: FlyToOptions) => void;
  /** Fly to current user position */
  flyToUser: (options?: FlyToOptions) => void;
  /** Fly to a specific POI */
  flyToPOI: (poiId: string, options?: FlyToOptions) => void;
  /** Fit bounds to include all visible POIs */
  fitToPOIs: () => void;
  /** Get current zoom level */
  getZoom: () => number | undefined;
  /** Set zoom level */
  setZoom: (zoom: number) => void;
}

const DEFAULT_FLY_DURATION = 1000;
const DEFAULT_ZOOM = 15;

export function useMap(): UseMapReturn {
  const mapRef = useRef<MapRef | null>(null);

  const currentPosition = useLocationStore((state) => state.currentPosition);
  const pois = usePOIStore((state) => state.pois);

  const flyTo = useCallback(
    (lat: number, lng: number, options: FlyToOptions = {}) => {
      const { duration = DEFAULT_FLY_DURATION, zoom } = options;

      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [lng, lat],
          zoom: zoom ?? mapRef.current.getZoom(),
          duration
        });
      }
    },
    []
  );

  const flyToUser = useCallback(
    (options: FlyToOptions = {}) => {
      if (currentPosition) {
        flyTo(currentPosition.latitude, currentPosition.longitude, {
          zoom: DEFAULT_ZOOM,
          ...options
        });
      }
    },
    [currentPosition, flyTo]
  );

  const flyToPOI = useCallback(
    (poiId: string, options: FlyToOptions = {}) => {
      const poi = pois.find((p) => p.id === poiId);
      if (poi) {
        flyTo(poi.location.latitude, poi.location.longitude, options);
      }
    },
    [pois, flyTo]
  );

  const fitToPOIs = useCallback(() => {
    if (!mapRef.current || pois.length === 0) return;

    const bounds: [[number, number], [number, number]] = [
      [pois[0]!.location.longitude, pois[0]!.location.latitude],
      [pois[0]!.location.longitude, pois[0]!.location.latitude]
    ];

    pois.forEach((poi) => {
      bounds[0][0] = Math.min(bounds[0][0], poi.location.longitude);
      bounds[0][1] = Math.min(bounds[0][1], poi.location.latitude);
      bounds[1][0] = Math.max(bounds[1][0], poi.location.longitude);
      bounds[1][1] = Math.max(bounds[1][1], poi.location.latitude);
    });

    // Add user position to bounds if available
    if (currentPosition) {
      bounds[0][0] = Math.min(bounds[0][0], currentPosition.longitude);
      bounds[0][1] = Math.min(bounds[0][1], currentPosition.latitude);
      bounds[1][0] = Math.max(bounds[1][0], currentPosition.longitude);
      bounds[1][1] = Math.max(bounds[1][1], currentPosition.latitude);
    }

    mapRef.current.fitBounds(bounds, {
      padding: 50,
      duration: DEFAULT_FLY_DURATION
    });
  }, [pois, currentPosition]);

  const getZoom = useCallback(() => {
    return mapRef.current?.getZoom();
  }, []);

  const setZoom = useCallback((zoom: number) => {
    if (mapRef.current) {
      mapRef.current.setZoom(zoom);
    }
  }, []);

  return {
    mapRef,
    flyTo,
    flyToUser,
    flyToPOI,
    fitToPOIs,
    getZoom,
    setZoom
  };
}
