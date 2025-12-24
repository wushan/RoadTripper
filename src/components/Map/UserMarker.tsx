import { Marker } from 'react-map-gl';
import { useMemo } from 'react';

interface UserMarkerProps {
  latitude: number;
  longitude: number;
  heading: number | null;
}

export function UserMarker({ latitude, longitude, heading }: UserMarkerProps) {
  const markerStyle = useMemo(
    () => ({
      transform: heading !== null ? `rotate(${heading}deg)` : 'none'
    }),
    [heading]
  );

  return (
    <Marker latitude={latitude} longitude={longitude} anchor="center">
      <div className="relative">
        {/* Pulse animation */}
        <div className="absolute -inset-4 animate-ping rounded-full bg-blue-400/30" />

        {/* Outer ring */}
        <div className="absolute -inset-2 rounded-full bg-white shadow-lg" />

        {/* Inner dot with direction */}
        <div
          className="relative h-4 w-4 rounded-full bg-blue-500"
          style={markerStyle}
        >
          {heading !== null && (
            <div className="absolute -top-1 left-1/2 h-0 w-0 -translate-x-1/2 border-x-4 border-b-4 border-x-transparent border-b-blue-500" />
          )}
        </div>
      </div>
    </Marker>
  );
}
