import { usePOIStore } from '@store/poi-store';
import { useUIStore } from '@store/ui-store';
import {
  POI_TYPE_ICONS,
  POI_TYPE_LABELS,
  POI_MARKER_COLORS
} from '@core/models/poi';
import { ALL_CATEGORIES, FREE_TIER_CATEGORIES } from '@core/models/filter';
import type { POIType } from '@core/models/poi';

export function FilterPanel() {
  const isFilterPanelOpen = useUIStore((state) => state.isFilterPanelOpen);
  const toggleFilterPanel = useUIStore((state) => state.toggleFilterPanel);

  const filter = usePOIStore((state) => state.filter);
  const updateFilter = usePOIStore((state) => state.updateFilter);
  const resetFilter = usePOIStore((state) => state.resetFilter);

  if (!isFilterPanelOpen) return null;

  const toggleCategory = (category: POIType) => {
    const categories = filter.categories.includes(category)
      ? filter.categories.filter((c) => c !== category)
      : [...filter.categories, category];
    updateFilter({ categories });
  };

  const handleMinRatingChange = (rating: number) => {
    updateFilter({ minRating: rating });
  };

  const handleOpenNowChange = (checked: boolean) => {
    updateFilter({ openNow: checked });
  };

  const isPremiumCategory = (category: POIType): boolean => {
    return !FREE_TIER_CATEGORIES.includes(category);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={toggleFilterPanel}
        role="button"
        aria-label="Close filter panel"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Escape' && toggleFilterPanel()}
      />

      {/* Panel */}
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white pb-safe shadow-2xl">
        {/* Handle */}
        <div className="flex justify-center pt-3">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-lg font-semibold text-gray-800">篩選條件</h2>
          <button
            onClick={resetFilter}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            重設
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] space-y-6 overflow-y-auto px-4 pb-6">
          {/* Categories */}
          <section>
            <h3 className="mb-3 text-sm font-medium text-gray-600">類別</h3>
            <div className="grid grid-cols-3 gap-2">
              {ALL_CATEGORIES.map((category) => {
                const isActive = filter.categories.includes(category);
                const isPremium = isPremiumCategory(category);

                return (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`relative flex flex-col items-center rounded-lg border-2 p-3 transition-all ${
                      isActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    {isPremium && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-[10px]">
                        PRO
                      </span>
                    )}
                    <span
                      className="mb-1 text-2xl"
                      style={{ color: isActive ? POI_MARKER_COLORS[category] : undefined }}
                    >
                      {POI_TYPE_ICONS[category]}
                    </span>
                    <span
                      className={`text-xs ${isActive ? 'font-medium text-blue-700' : 'text-gray-600'}`}
                    >
                      {POI_TYPE_LABELS[category]}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Minimum Rating */}
          <section>
            <h3 className="mb-3 text-sm font-medium text-gray-600">最低評分</h3>
            <div className="flex gap-2">
              {[0, 3.0, 3.5, 4.0, 4.5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleMinRatingChange(rating)}
                  className={`flex-1 rounded-lg border-2 px-2 py-2 text-sm transition-all ${
                    filter.minRating === rating
                      ? 'border-blue-500 bg-blue-50 font-medium text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {rating === 0 ? '不限' : `${rating}+`}
                </button>
              ))}
            </div>
          </section>

          {/* Open Now Toggle */}
          <section>
            <label className="flex cursor-pointer items-center justify-between">
              <span className="text-sm font-medium text-gray-600">只顯示營業中</span>
              <button
                role="switch"
                aria-checked={filter.openNow}
                onClick={() => handleOpenNowChange(!filter.openNow)}
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  filter.openNow ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                    filter.openNow ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </label>
          </section>
        </div>

        {/* Apply Button */}
        <div className="border-t border-gray-100 px-4 py-4">
          <button
            onClick={toggleFilterPanel}
            className="w-full rounded-xl bg-blue-500 py-3 font-medium text-white transition-colors hover:bg-blue-600 active:bg-blue-700"
          >
            套用篩選
          </button>
        </div>
      </div>
    </>
  );
}
