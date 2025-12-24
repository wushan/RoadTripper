import { memo, useCallback } from 'react';
import type { POI } from '@core/models/poi';
import { POI_TYPE_ICONS } from '@core/models/poi';
import { formatDistance, formatPriceLevel } from '@core/utils/format';
import { getPlatformServices } from '@/adapters';

interface POICardProps {
  poi: POI;
  isActive: boolean;
  onTap: () => void;
}

export const POICard = memo(function POICard({
  poi,
  isActive,
  onTap
}: POICardProps) {
  const icon = POI_TYPE_ICONS[poi.type];
  const priceDisplay = formatPriceLevel(poi.priceLevel);

  const handleNavigate = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      const { navigation } = getPlatformServices();
      await navigation.openNavigation({
        latitude: poi.location.latitude,
        longitude: poi.location.longitude,
        name: poi.name,
        placeId: poi.id
      });
    },
    [poi]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => e.key === 'Enter' && onTap()}
      className={`
        relative flex cursor-pointer flex-col rounded-xl bg-white p-4 shadow-lg
        transition-all duration-200
        ${isActive ? 'scale-[1.02] ring-2 ring-blue-500' : 'hover:shadow-xl'}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex-shrink-0 text-2xl">{icon}</span>
          <h3 className="truncate text-lg font-bold text-gray-900">
            {poi.name}
          </h3>
        </div>

        <button
          type="button"
          onClick={handleNavigate}
          className="flex-shrink-0 rounded-full bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600"
          aria-label="Navigate"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <span className="text-yellow-500">{'\u2605'}</span>
          <span className="font-medium">{poi.rating.toFixed(1)}</span>
          <span className="text-gray-400">({poi.ratingCount.toLocaleString()})</span>
        </span>

        <span className="text-gray-300">{'\u00B7'}</span>

        <span className="font-medium text-blue-600">
          {formatDistance(poi.distance)}
        </span>

        {poi.isOpen !== undefined && (
          <>
            <span className="text-gray-300">{'\u00B7'}</span>
            <span className={poi.isOpen ? 'text-green-600' : 'text-red-500'}>
              {poi.isOpen ? '\u71DF\u696D\u4E2D' : '\u5DF2\u6253\u70CA'}
            </span>
          </>
        )}
      </div>

      <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
        {priceDisplay && (
          <>
            <span className="font-medium">{priceDisplay}</span>
            <span className="text-gray-300">{'\u00B7'}</span>
          </>
        )}
        <span className="truncate">{poi.address || poi.type}</span>
      </div>
    </div>
  );
});
