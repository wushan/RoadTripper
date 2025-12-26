import { Source, Layer } from 'react-map-gl';
import { useMemo } from 'react';

interface SearchRadiusCircleProps {
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

/**
 * Generate a GeoJSON polygon circle
 */
function createCirclePolygon(
  centerLat: number,
  centerLng: number,
  radiusMeters: number,
  points: number = 64
): GeoJSON.Feature<GeoJSON.Polygon> {
  const coords: [number, number][] = [];
  const distanceX = radiusMeters / (111320 * Math.cos((centerLat * Math.PI) / 180));
  const distanceY = radiusMeters / 110540;

  for (let i = 0; i <= points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([centerLng + x, centerLat + y]);
  }

  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [coords]
    }
  };
}

export function SearchRadiusCircle({
  latitude,
  longitude,
  radiusMeters
}: SearchRadiusCircleProps) {
  const circleData = useMemo(
    () => createCirclePolygon(latitude, longitude, radiusMeters),
    [latitude, longitude, radiusMeters]
  );

  return (
    <Source id="search-radius" type="geojson" data={circleData}>
      {/* Fill layer */}
      <Layer
        id="search-radius-fill"
        type="fill"
        paint={{
          'fill-color': '#3B82F6',
          'fill-opacity': 0.08
        }}
      />
      {/* Border layer */}
      <Layer
        id="search-radius-border"
        type="line"
        paint={{
          'line-color': '#3B82F6',
          'line-width': 2,
          'line-opacity': 0.4,
          'line-dasharray': [4, 2]
        }}
      />
    </Source>
  );
}
