import { Marker } from 'react-map-gl';
import { useMemo, memo, useState } from 'react';
import type { POI } from '@core/models/poi';
import { POI_MARKER_COLORS, POI_TYPE_ICONS } from '@core/models/poi';

interface POIMarkerProps {
  poi: POI;
  isSelected: boolean;
  onClick: () => void;
}

export const POIMarker = memo(function POIMarker({
  poi,
  isSelected,
  onClick
}: POIMarkerProps) {
  const color = POI_MARKER_COLORS[poi.type];
  const icon = POI_TYPE_ICONS[poi.type];
  const [imageError, setImageError] = useState(false);

  const hasPhoto = poi.photoUrl && !imageError;

  const markerStyle = useMemo(
    () => ({
      transform: isSelected ? 'scale(1.2)' : 'scale(1)',
      transition: 'transform 0.2s ease-out'
    }),
    [isSelected]
  );

  const shadowStyle = useMemo(
    () => ({
      boxShadow: isSelected
        ? `0 0 0 4px ${color}40, 0 4px 12px ${color}60`
        : `0 2px 8px ${color}40`
    }),
    [color, isSelected]
  );

  return (
    <Marker
      latitude={poi.location.latitude}
      longitude={poi.location.longitude}
      anchor="bottom"
      style={{ zIndex: isSelected ? 100 : 1 }}
      onClick={(e: { originalEvent: MouseEvent }) => {
        e.originalEvent.stopPropagation();
        onClick();
      }}
    >
      <button
        type="button"
        className="flex cursor-pointer flex-col items-center focus:outline-none"
        aria-label={`View ${poi.name}`}
      >
        {/* Marker body */}
        <div
          className="relative flex h-10 w-10 items-center justify-center rounded-full overflow-hidden"
          style={{
            ...markerStyle,
            ...shadowStyle,
            backgroundColor: hasPhoto ? 'white' : color,
            border: hasPhoto ? `3px solid ${color}` : 'none'
          }}
        >
          {hasPhoto ? (
            <>
              {/* Photo with conditional opacity */}
              <img
                src={poi.photoUrl}
                alt={poi.name}
                className="h-full w-full object-cover transition-opacity duration-200"
                style={{ opacity: isSelected ? 1 : 0.4 }}
                onError={() => setImageError(true)}
              />
              {/* Icon overlay when not selected */}
              {!isSelected && (
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-full"
                  style={{ backgroundColor: `${color}90` }}
                >
                  <span className="text-lg text-white drop-shadow-md">{icon}</span>
                </div>
              )}
            </>
          ) : (
            <span className="text-lg text-white">{icon}</span>
          )}
        </div>

        {/* Marker pointer */}
        <div
          className="-mt-1 h-0 w-0 border-x-[8px] border-t-[10px] border-x-transparent"
          style={{ borderTopColor: color }}
        />

        {/* Name and rating label when selected */}
        {isSelected && (
          <div className="absolute -bottom-12 flex flex-col items-center whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white shadow-lg">
            <span className="font-medium">{poi.name}</span>
            <span className="flex items-center gap-1 text-yellow-400">
              <span>★</span>
              <span>{poi.rating.toFixed(1)}</span>
              <span className="text-gray-400">({poi.ratingCount.toLocaleString()})</span>
            </span>
          </div>
        )}
      </button>
    </Marker>
  );
});
