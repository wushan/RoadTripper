import { useRef, useCallback, useEffect } from 'react';
import Map, { type MapRef, NavigationControl, GeolocateControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import { UserMarker } from './UserMarker';
import { POIMarker } from './POIMarker';
import { useLocationStore } from '@store/location-store';
import { usePOIStore } from '@store/poi-store';
import type { POI } from '@core/models/poi';

const MAP_STYLE = 'mapbox://styles/mapbox/streets-v12';
const INITIAL_ZOOM = 15;
const MIN_ZOOM = 10;
const MAX_ZOOM = 18;

interface MapContainerProps {
  accessToken: string;
  onPOIClick?: (poi: POI) => void;
}

export function MapContainer({ accessToken, onPOIClick }: MapContainerProps) {
  const mapRef = useRef<MapRef>(null);

  const currentPosition = useLocationStore((state) => state.currentPosition);
  const pois = usePOIStore((state) => state.pois);
  const selectedPOIId = usePOIStore((state) => state.selectedPOIId);
  const suggestedZoom = usePOIStore((state) => state.suggestedZoom);

  const initialViewState = {
    longitude: currentPosition?.longitude ?? 121.5654,
    latitude: currentPosition?.latitude ?? 25.033,
    zoom: INITIAL_ZOOM
  };

  useEffect(() => {
    if (mapRef.current && suggestedZoom) {
      mapRef.current.flyTo({
        zoom: suggestedZoom,
        duration: 1000
      });
    }
  }, [suggestedZoom]);

  useEffect(() => {
    if (mapRef.current && currentPosition) {
      mapRef.current.flyTo({
        center: [currentPosition.longitude, currentPosition.latitude],
        duration: 1000
      });
    }
  }, [currentPosition?.latitude, currentPosition?.longitude]);

  const handlePOIClick = useCallback(
    (poi: POI) => {
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [poi.location.longitude, poi.location.latitude],
          duration: 500
        });
      }
      onPOIClick?.(poi);
    },
    [onPOIClick]
  );

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={accessToken}
      initialViewState={initialViewState}
      style={{ width: '100%', height: '100%' }}
      mapStyle={MAP_STYLE}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      attributionControl={false}
    >
      <NavigationControl position="top-right" showCompass showZoom />

      <GeolocateControl
        position="top-right"
        trackUserLocation
        showUserHeading
        showAccuracyCircle={false}
      />

      {currentPosition && (
        <UserMarker
          latitude={currentPosition.latitude}
          longitude={currentPosition.longitude}
          heading={currentPosition.heading}
        />
      )}

      {pois.map((poi) => (
        <POIMarker
          key={poi.id}
          poi={poi}
          isSelected={poi.id === selectedPOIId}
          onClick={() => handlePOIClick(poi)}
        />
      ))}
    </Map>
  );
}
