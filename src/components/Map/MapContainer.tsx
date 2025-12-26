import { useRef, useCallback, useEffect } from 'react';
import Map, { type MapRef, NavigationControl, GeolocateControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import { UserMarker } from './UserMarker';
import { POIMarker } from './POIMarker';
import { SearchRadiusCircle } from './SearchRadiusCircle';
import { useLocationStore } from '@store/location-store';
import { usePOIStore } from '@store/poi-store';
import { useUIStore } from '@store/ui-store';
import { useFilteredPOIs } from '@hooks/useFilteredPOIs';
import type { POI } from '@core/models/poi';

const MAP_STYLE_LIGHT = 'mapbox://styles/mapbox/streets-v12';
const MAP_STYLE_DARK = 'mapbox://styles/mapbox/dark-v11';
const INITIAL_ZOOM = 15;
const MIN_ZOOM = 10;
const MAX_ZOOM = 18;

interface MapContainerProps {
  accessToken: string;
  onPOIClick?: (poi: POI) => void;
  listExpanded?: boolean;
}

export function MapContainer({ accessToken, onPOIClick, listExpanded }: MapContainerProps) {
  const mapRef = useRef<MapRef>(null);

  const currentPosition = useLocationStore((state) => state.currentPosition);
  const pois = useFilteredPOIs();
  const selectedPOIId = usePOIStore((state) => state.selectedPOIId);
  const suggestedZoom = usePOIStore((state) => state.suggestedZoom);
  const searchRadius = usePOIStore((state) => state.searchRadius);
  const lastSearchPosition = usePOIStore((state) => state.lastSearchPosition);
  const isDarkMode = useUIStore((state) => state.isDarkMode);
  const isSearchRadiusVisible = useUIStore((state) => state.isSearchRadiusVisible);
  const toggleSearchRadiusVisible = useUIStore((state) => state.toggleSearchRadiusVisible);
  const shouldCenterOnUser = useUIStore((state) => state.shouldCenterOnUser);
  const setShouldCenterOnUser = useUIStore((state) => state.setShouldCenterOnUser);

  const mapStyle = isDarkMode ? MAP_STYLE_DARK : MAP_STYLE_LIGHT;

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

  // Resize map when list expanded state changes, only center on user when explicitly requested
  useEffect(() => {
    if (mapRef.current) {
      // Trigger map resize after the transition
      const timer = setTimeout(() => {
        mapRef.current?.resize();
        // Only recenter on user position when shouldCenterOnUser is true (e.g., list collapsed by user)
        if (shouldCenterOnUser && currentPosition) {
          mapRef.current?.flyTo({
            center: [currentPosition.longitude, currentPosition.latitude],
            duration: 300
          });
          setShouldCenterOnUser(false);
        }
      }, 350); // Slightly longer than the CSS transition (300ms)

      return () => clearTimeout(timer);
    }
  }, [listExpanded, shouldCenterOnUser, currentPosition, setShouldCenterOnUser]);

  // Fly to selected POI when selection changes (from list or other source)
  useEffect(() => {
    if (mapRef.current && selectedPOIId) {
      const selectedPOI = pois.find((poi) => poi.id === selectedPOIId);
      if (selectedPOI) {
        mapRef.current.flyTo({
          center: [selectedPOI.location.longitude, selectedPOI.location.latitude],
          duration: 500
        });
      }
    }
  }, [selectedPOIId, pois]);

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

  // Determine the center for the search radius circle
  const radiusCenter = lastSearchPosition
    ? { lat: lastSearchPosition.lat, lng: lastSearchPosition.lng }
    : currentPosition
      ? { lat: currentPosition.latitude, lng: currentPosition.longitude }
      : null;

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={accessToken}
      initialViewState={initialViewState}
      style={{ width: '100%', height: '100%' }}
      mapStyle={mapStyle}
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

      {/* Search Radius Toggle Button */}
      <div className="absolute left-3 top-3 z-10">
        <button
          type="button"
          onClick={toggleSearchRadiusVisible}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium shadow-md transition-all ${
            isSearchRadiusVisible
              ? 'bg-blue-500 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          aria-label="顯示搜尋範圍"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="12" cy="12" r="10" strokeDasharray="4 2" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
          <span className="hidden sm:inline">搜尋範圍</span>
        </button>
      </div>

      {/* Search Radius Circle */}
      {isSearchRadiusVisible && radiusCenter && (
        <SearchRadiusCircle
          latitude={radiusCenter.lat}
          longitude={radiusCenter.lng}
          radiusMeters={searchRadius}
        />
      )}

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
