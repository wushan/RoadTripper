import { usePOIStore } from '@store/poi-store';
import { useLocationStore } from '@store/location-store';
import { POI_MARKER_COLORS, POI_TYPE_ICONS } from '@core/models/poi';
import type { POI } from '@core/models/poi';

interface MockMapProps {
  onPOIClick?: (poi: POI) => void;
}

/**
 * Mock map component for development without Mapbox token
 */
export function MockMap({ onPOIClick }: MockMapProps) {
  const currentPosition = useLocationStore((state) => state.currentPosition);
  const pois = usePOIStore((state) => state.pois);
  const selectedPOIId = usePOIStore((state) => state.selectedPOIId);

  return (
    <div className="relative h-full w-full bg-gradient-to-b from-blue-100 to-green-100">
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, #94a3b8 1px, transparent 1px),
            linear-gradient(to bottom, #94a3b8 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Map center label */}
      <div className="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-white px-4 py-2 shadow-md">
        <span className="text-sm text-gray-600">
          {currentPosition
            ? `${currentPosition.latitude.toFixed(4)}, ${currentPosition.longitude.toFixed(4)}`
            : 'Mock Map (No Mapbox Token)'}
        </span>
      </div>

      {/* User location indicator */}
      {currentPosition && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="absolute -inset-4 animate-ping rounded-full bg-blue-400/30" />
            <div className="h-6 w-6 rounded-full border-4 border-white bg-blue-500 shadow-lg" />
          </div>
        </div>
      )}

      {/* POI markers in a grid */}
      <div className="absolute bottom-20 left-4 right-4 flex flex-wrap justify-center gap-3">
        {pois.slice(0, 6).map((poi, index) => (
          <button
            key={poi.id}
            onClick={() => onPOIClick?.(poi)}
            className={`flex flex-col items-center rounded-lg p-2 transition-transform ${
              poi.id === selectedPOIId
                ? 'scale-110 bg-white shadow-lg'
                : 'bg-white/80 hover:bg-white hover:shadow-md'
            }`}
            style={{
              transform: `translateY(${Math.sin(index * 0.5) * 10}px)`
            }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: POI_MARKER_COLORS[poi.type] }}
            >
              <span className="text-lg">{POI_TYPE_ICONS[poi.type]}</span>
            </div>
            <span className="mt-1 max-w-[80px] truncate text-xs text-gray-700">
              {poi.name}
            </span>
          </button>
        ))}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-yellow-100 px-4 py-2 text-center">
        <p className="text-sm text-yellow-800">
          Add VITE_MAPBOX_ACCESS_TOKEN to .env.local for real map
        </p>
      </div>
    </div>
  );
}
