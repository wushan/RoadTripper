import { useUIStore } from '@store/ui-store';
import { useQuotaStore } from '@store/quota-store';

export function PaywallModal() {
  const isPaywallOpen = useUIStore((state) => state.isPaywallOpen);
  const setPaywallOpen = useUIStore((state) => state.setPaywallOpen);

  const distanceTraveled = useQuotaStore((state) => state.distanceTraveled);
  const distanceLimit = useQuotaStore((state) => state.distanceLimit);
  const searchCount = useQuotaStore((state) => state.searchCount);
  const searchLimit = useQuotaStore((state) => state.searchLimit);

  if (!isPaywallOpen) return null;

  const isDistanceExceeded = distanceTraveled >= distanceLimit;
  const isSearchExceeded = searchCount >= searchLimit;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70"
        onClick={() => setPaywallOpen(false)}
        role="button"
        aria-label="Close paywall"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Escape' && setPaywallOpen(false)}
      />

      {/* Modal */}
      <div className="fixed inset-x-4 top-1/2 z-50 -translate-y-1/2 rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-4 text-center">
          <div className="mb-3 text-5xl">
            {isDistanceExceeded ? '🛑' : '🔔'}
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {isDistanceExceeded
              ? '今日探索距離已達上限'
              : isSearchExceeded
                ? '今日搜尋次數已達上限'
                : '升級 Pro 解鎖更多功能'}
          </h2>
        </div>

        {/* Stats */}
        <div className="mb-6 rounded-xl bg-gray-50 dark:bg-gray-700 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">探索距離</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {(distanceTraveled / 1000).toFixed(1)} / {distanceLimit / 1000} KM
            </span>
          </div>
          <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
            <div
              className={`h-full transition-all ${
                isDistanceExceeded ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{
                width: `${Math.min((distanceTraveled / distanceLimit) * 100, 100)}%`
              }}
            />
          </div>

          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">搜尋次數</span>
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {searchCount} / {searchLimit} 次
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
            <div
              className={`h-full transition-all ${
                isSearchExceeded ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{
                width: `${Math.min((searchCount / searchLimit) * 100, 100)}%`
              }}
            />
          </div>
        </div>

        {/* Pro Features */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium text-gray-600 dark:text-gray-400">Pro 功能</h3>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              無限探索距離
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              無限搜尋次數
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              解鎖住宿、加油站、便利店類別
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              離線地圖快取
            </li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => {
              // TODO: Implement upgrade flow
              alert('升級功能即將推出！');
            }}
            className="w-full rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 py-3 font-medium text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            升級 Pro - NT$99/月
          </button>
          <button
            onClick={() => setPaywallOpen(false)}
            className="w-full py-2 text-sm text-gray-500 dark:text-gray-400 transition-colors hover:text-gray-700 dark:hover:text-gray-300"
          >
            明天再繼續探索
          </button>
        </div>
      </div>
    </>
  );
}
