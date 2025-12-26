import { memo, useCallback, useState } from 'react';
import type { POI } from '@core/models/poi';
import { POI_TYPE_ICONS, POI_MARKER_COLORS } from '@core/models/poi';
import { formatDistance, formatPriceLevel } from '@core/utils/format';
import { getPlatformServices } from '@/adapters';

interface POICardProps {
  poi: POI;
  isActive: boolean;
  onTap: () => void;
  compact?: boolean;
}

export const POICard = memo(function POICard({
  poi,
  isActive,
  onTap,
  compact = false
}: POICardProps) {
  const icon = POI_TYPE_ICONS[poi.type];
  const color = POI_MARKER_COLORS[poi.type];
  const priceDisplay = formatPriceLevel(poi.priceLevel);
  const [imageError, setImageError] = useState(false);

  const hasPhoto = poi.photoUrl && !imageError;

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
        relative flex cursor-pointer rounded-xl bg-white dark:bg-gray-700 shadow-md
        transition-all duration-200 flex-row items-center gap-3
        ${compact ? 'p-2' : 'p-3'}
        ${isActive ? 'scale-[1.02] ring-2 ring-blue-500' : 'hover:shadow-xl active:scale-[0.98]'}
      `}
    >
      {/* Photo with icon overlay */}
      <div
        className={`relative flex-shrink-0 rounded-lg overflow-hidden ${compact ? 'h-12 w-12' : 'h-14 w-14'}`}
        style={{ backgroundColor: color }}
      >
        {hasPhoto ? (
          <>
            <img
              src={poi.photoUrl}
              alt={poi.name}
              className="h-full w-full object-cover"
              onError={() => setImageError(true)}
            />
            {/* Icon badge */}
            <div
              className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-white text-sm shadow-md"
              style={{ backgroundColor: color }}
            >
              {icon}
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className={`text-white ${compact ? 'text-2xl' : 'text-3xl'}`}>{icon}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* First row: Name + Distance */}
        <div className="flex items-center justify-between gap-2">
          <h3 className={`truncate font-bold text-gray-900 dark:text-gray-100 ${compact ? 'text-sm' : 'text-base'}`}>
            {poi.name}
          </h3>
          <span className={`flex-shrink-0 font-medium text-blue-600 dark:text-blue-400 ${compact ? 'text-xs' : 'text-sm'}`}>
            {formatDistance(poi.distance)}
          </span>
        </div>

        {/* Second row: Rating, Open status, Price */}
        <div className={`flex flex-wrap items-center gap-1.5 text-gray-600 dark:text-gray-400 ${compact ? 'text-xs mt-0.5' : 'text-sm mt-1'}`}>
          <span className="flex items-center gap-0.5">
            <span className="text-yellow-500">★</span>
            <span className="font-medium">{poi.rating.toFixed(1)}</span>
            <span className="text-gray-400 dark:text-gray-500">({poi.ratingCount.toLocaleString()})</span>
          </span>

          {poi.isOpen !== undefined && (
            <>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <span className={poi.isOpen ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}>
                {poi.isOpen ? '營業中' : '已打烊'}
              </span>
            </>
          )}

          {priceDisplay && (
            <>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <span className="font-medium">{priceDisplay}</span>
            </>
          )}
        </div>

        {/* Third row: Address (only in non-compact mode) */}
        {!compact && poi.address && (
          <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
            {poi.address}
          </p>
        )}
      </div>

      {/* Navigate button */}
      <button
        type="button"
        onClick={handleNavigate}
        className={`flex-shrink-0 rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-600 active:bg-blue-700 ${
          compact ? 'p-1.5' : 'p-2'
        }`}
        aria-label="導航"
      >
        <svg
          className={compact ? 'h-4 w-4' : 'h-5 w-5'}
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
  );
});
