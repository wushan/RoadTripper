import { Marker } from 'react-map-gl';
import { useMemo, memo } from 'react';
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

  const markerStyle = useMemo(
    () => ({
      backgroundColor: color,
      transform: isSelected ? 'scale(1.2)' : 'scale(1)',
      transition: 'transform 0.2s ease-out'
    }),
    [color, isSelected]
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
          className="flex h-10 w-10 items-center justify-center rounded-full text-white"
          style={{ ...markerStyle, ...shadowStyle }}
        >
          <span className="text-lg">{icon}</span>
        </div>

        {/* Marker pointer */}
        <div
          className="-mt-1 h-0 w-0 border-x-[8px] border-t-[10px] border-x-transparent"
          style={{ borderTopColor: color }}
        />

        {/* Name label when selected */}
        {isSelected && (
          <div className="absolute -bottom-8 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white shadow-lg">
            {poi.name}
          </div>
        )}
      </button>
    </Marker>
  );
});
