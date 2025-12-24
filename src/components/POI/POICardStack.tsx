import { useRef, useCallback, useEffect } from 'react';
import { POICard } from './POICard';
import { usePOIStore } from '@store/poi-store';
import type { POI } from '@core/models/poi';

interface POICardStackProps {
  onPOISelect: (poi: POI) => void;
}

export function POICardStack({ onPOISelect }: POICardStackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pois = usePOIStore((state) => state.pois);
  const selectedPOIId = usePOIStore((state) => state.selectedPOIId);

  useEffect(() => {
    if (selectedPOIId && containerRef.current) {
      const selectedIndex = pois.findIndex((p) => p.id === selectedPOIId);
      if (selectedIndex !== -1) {
        const cardWidth = 300 + 16;
        containerRef.current.scrollTo({
          left: selectedIndex * cardWidth,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedPOIId, pois]);

  const handlePOITap = useCallback(
    (poi: POI) => {
      onPOISelect(poi);
    },
    [onPOISelect]
  );

  if (pois.length === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center bg-gray-50 text-gray-500">
        <p>{'\u9644\u8FD1\u6C92\u6709\u627E\u5230\u7B26\u5408\u689D\u4EF6\u7684\u5730\u9EDE'}</p>
      </div>
    );
  }

  return (
    <section className="h-[180px] bg-gray-50 pb-safe pt-3">
      <div
        ref={containerRef}
        className="scrollbar-hide flex gap-4 overflow-x-auto px-4 pb-3"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {pois.map((poi) => (
          <div
            key={poi.id}
            className="flex-shrink-0"
            style={{
              width: '300px',
              scrollSnapAlign: 'start'
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

      {pois.length > 1 && (
        <div className="mt-1 flex justify-center gap-1">
          {pois.slice(0, 5).map((poi) => (
            <div
              key={poi.id}
              className={`h-1.5 rounded-full transition-all ${
                poi.id === selectedPOIId
                  ? 'w-4 bg-blue-500'
                  : 'w-1.5 bg-gray-300'
              }`}
            />
          ))}
          {pois.length > 5 && (
            <span className="ml-1 text-xs text-gray-400">+{pois.length - 5}</span>
          )}
        </div>
      )}
    </section>
  );
}
