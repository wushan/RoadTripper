import { useRef, useCallback, useEffect, useState } from 'react';
import { POICard } from './POICard';
import { usePOIStore } from '@store/poi-store';
import { useUIStore } from '@store/ui-store';
import { useFilteredPOIs } from '@hooks/useFilteredPOIs';
import type { POI } from '@core/models/poi';

interface POICardStackProps {
  onPOISelect: (poi: POI) => void;
}

export function POICardStack({ onPOISelect }: POICardStackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pois = useFilteredPOIs();
  const selectedPOIId = usePOIStore((state) => state.selectedPOIId);
  const isExpanded = useUIStore((state) => state.isPOIListExpanded);
  const toggleExpanded = useUIStore((state) => state.togglePOIListExpanded);
  const [animatedIds, setAnimatedIds] = useState<Set<string>>(new Set());

  // Animate new POIs
  useEffect(() => {
    const newIds = new Set(animatedIds);
    let hasNew = false;

    pois.forEach((poi) => {
      if (!newIds.has(poi.id)) {
        newIds.add(poi.id);
        hasNew = true;
      }
    });

    if (hasNew) {
      setAnimatedIds(newIds);
    }
  }, [pois, animatedIds]);

  // Scroll to selected POI
  useEffect(() => {
    if (selectedPOIId && containerRef.current && isExpanded) {
      const element = containerRef.current.querySelector(`[data-poi-id="${selectedPOIId}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedPOIId, isExpanded]);

  const handlePOITap = useCallback(
    (poi: POI) => {
      onPOISelect(poi);
    },
    [onPOISelect]
  );

  if (pois.length === 0) {
    return (
      <div className="flex h-20 items-center justify-center bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm text-gray-500 dark:text-gray-400 rounded-t-2xl shadow-lg">
        <p>附近沒有找到符合條件的地點</p>
      </div>
    );
  }

  const topPOI = pois[0];
  const remainingCount = pois.length - 1;

  return (
    <section
      className={`flex flex-col bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-t-2xl shadow-lg transition-all duration-300 ${
        isExpanded ? 'flex-1 min-h-0' : 'flex-shrink-0'
      }`}
    >
      {/* Handle bar */}
      <button
        onClick={toggleExpanded}
        className="w-full flex justify-center pt-2 pb-1"
        aria-label={isExpanded ? '收合' : '展開'}
      >
        <div className={`w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600 transition-all ${
          isExpanded ? 'bg-gray-400 dark:bg-gray-500' : ''
        }`} />
      </button>

      {/* Header with count */}
      <div className="flex items-center justify-between px-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            附近地點
          </span>
          <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full">
            {pois.length}
          </span>
        </div>
        {!isExpanded && remainingCount > 0 && (
          <button
            onClick={toggleExpanded}
            className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            查看全部
          </button>
        )}
      </div>

      {/* Collapsed view - show only top POI */}
      {!isExpanded && topPOI && (
        <div
          className="px-4 pb-4 animate-slide-up"
          data-poi-id={topPOI.id}
        >
          <POICard
            poi={topPOI}
            isActive={topPOI.id === selectedPOIId}
            onTap={() => handlePOITap(topPOI)}
            compact
          />
        </div>
      )}

      {/* Expanded view - scrollable list */}
      {isExpanded && (
        <div
          ref={containerRef}
          className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 space-y-3"
        >
          {pois.map((poi, index) => (
            <div
              key={poi.id}
              data-poi-id={poi.id}
              className="animate-slide-up"
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: 'backwards'
              }}
            >
              <POICard
                poi={poi}
                isActive={poi.id === selectedPOIId}
                onTap={() => handlePOITap(poi)}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
