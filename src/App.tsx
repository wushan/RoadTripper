import { useEffect, useCallback, useRef } from 'react';
import { Map } from '@components/Map';
import { StatusBar } from '@components/StatusBar';
import { POICardStack } from '@components/POI';
import { ErrorBoundary } from '@components/common/ErrorBoundary';
import { Loading } from '@components/common/Loading';
import { FilterPanel } from '@components/Filter';
import { PaywallModal } from '@components/Paywall';
import { useLocationStore } from '@store/location-store';
import { usePOIStore } from '@store/poi-store';
import { useUIStore } from '@store/ui-store';
import { usePOI } from '@hooks/usePOI';
import { useLocation } from '@hooks/useLocation';
import { useTheme } from '@hooks/useTheme';
import { distanceService, filterService } from '@/services';
import type { POI as POIType } from '@core/models/poi';

export function App() {
  const hasInitialSearched = useRef(false);

  // Apply theme class to document
  useTheme();

  const currentPosition = useLocationStore((state) => state.currentPosition);
  const permissionState = useLocationStore((state) => state.permissionState);

  const setSelectedPOI = usePOIStore((state) => state.setSelectedPOI);

  const isLoading = useUIStore((state) => state.isLoading);
  const setLoading = useUIStore((state) => state.setLoading);
  const isPOIListExpanded = useUIStore((state) => state.isPOIListExpanded);

  // Initialize location tracking
  const { startTracking, error: locationError } = useLocation();

  // Initialize POI search
  const { searchNearby, isSearching, searchError } = usePOI();

  // Initialize services and start location tracking on mount
  useEffect(() => {
    setLoading(true, '正在取得您的位置...');
    Promise.all([
      distanceService.initialize(),
      filterService.initialize()
    ]).then(() => {
      startTracking();
    });
  }, [startTracking, setLoading]);

  // Stop loading when position is available
  useEffect(() => {
    if (currentPosition && isLoading) {
      setLoading(false);
    }
  }, [currentPosition, isLoading, setLoading]);

  // Initial search when position is first available
  useEffect(() => {
    if (currentPosition && !hasInitialSearched.current && !isSearching) {
      hasInitialSearched.current = true;
      searchNearby();
    }
  }, [currentPosition, searchNearby, isSearching]);

  const handlePOISelect = useCallback(
    (poi: POIType) => {
      setSelectedPOI(poi.id);
    },
    [setSelectedPOI]
  );

  // Show permission denied screen
  if (permissionState === 'denied') {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 px-6 text-center">
        <div className="mb-4 text-6xl">{'\u{1F4CD}'}</div>
        <h1 className="mb-2 text-xl font-bold text-gray-800 dark:text-gray-100">
          {'\u9700\u8981\u5B9A\u4F4D\u6B0A\u9650'}
        </h1>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          RoadTripper {'\u9700\u8981\u5B58\u53D6\u60A8\u7684\u4F4D\u7F6E\u624D\u80FD\u63A8\u85A6\u9644\u8FD1\u7684\u666F\u9EDE\u3002'}
          {'\u8ACB\u5728\u700F\u89BD\u5668\u8A2D\u5B9A\u4E2D\u5141\u8A31\u5B9A\u4F4D\u6B0A\u9650\u3002'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-blue-500 px-6 py-3 text-white transition-colors hover:bg-blue-600"
        >
          {'\u91CD\u65B0\u8F09\u5165'}
        </button>
      </div>
    );
  }

  // Show loading screen
  if (isLoading || !currentPosition) {
    return <Loading message={'\u6B63\u5728\u53D6\u5F97\u60A8\u7684\u4F4D\u7F6E...'} />;
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen flex-col bg-gray-100 dark:bg-gray-900">
        <StatusBar />

        {/* Main content area with map and POI list */}
        <div className="flex flex-1 flex-col min-h-0">
          {/* Map container - shrinks when list is expanded */}
          <main
            className={`relative transition-all duration-300 ${
              isPOIListExpanded ? 'h-[40vh] flex-shrink-0' : 'flex-1'
            }`}
          >
            <Map onPOIClick={handlePOISelect} listExpanded={isPOIListExpanded} />

            {isSearching && (
              <div className="absolute left-4 top-4 rounded-full bg-white dark:bg-gray-800 px-4 py-2 shadow-lg">
                <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                  搜尋附近地點...
                </span>
              </div>
            )}

            {searchError && !isSearching && (
              <div className="absolute left-4 top-4 rounded-lg bg-red-50 dark:bg-red-900/30 px-4 py-2 shadow-lg">
                <span className="text-sm text-red-600 dark:text-red-400">{searchError}</span>
              </div>
            )}

            {locationError && (
              <div className="absolute left-4 top-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 px-4 py-2 shadow-lg">
                <span className="text-sm text-yellow-700 dark:text-yellow-400">{locationError.message}</span>
              </div>
            )}
          </main>

          {/* POI List - expands to fill remaining space */}
          <POICardStack onPOISelect={handlePOISelect} />
        </div>

        <FilterPanel />
        <PaywallModal />
      </div>
    </ErrorBoundary>
  );
}

export default App;
