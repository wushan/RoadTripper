import { MapContainer } from './MapContainer';
import { MockMap } from './MockMap';
import type { POI } from '@core/models/poi';

interface MapProps {
  onPOIClick?: (poi: POI) => void;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

/**
 * Map component that renders either real Mapbox map or mock map
 */
export function Map({ onPOIClick }: MapProps) {
  if (!MAPBOX_TOKEN) {
    return <MockMap onPOIClick={onPOIClick} />;
  }

  return <MapContainer accessToken={MAPBOX_TOKEN} onPOIClick={onPOIClick} />;
}

export { MapContainer, MockMap };
export { UserMarker } from './UserMarker';
export { POIMarker } from './POIMarker';
