import { useMemo } from 'react';
import { useQuotaStore } from '@store/quota-store';
import { useUIStore } from '@store/ui-store';

export function StatusBar() {
  const distanceTraveled = useQuotaStore((state) => state.distanceTraveled);
  const distanceLimit = useQuotaStore((state) => state.distanceLimit);
  const toggleFilterPanel = useUIStore((state) => state.toggleFilterPanel);
  const toggleSettings = useUIStore((state) => state.toggleSettings);

  const distanceKm = useMemo(() => {
    return (distanceTraveled / 1000).toFixed(1);
  }, [distanceTraveled]);

  const limitKm = useMemo(() => {
    return (distanceLimit / 1000).toFixed(0);
  }, [distanceLimit]);

  const progressPercentage = useMemo(() => {
    return Math.min((distanceTraveled / distanceLimit) * 100, 100);
  }, [distanceTraveled, distanceLimit]);

  const progressColor = useMemo(() => {
    if (progressPercentage >= 90) return 'bg-red-500';
    if (progressPercentage >= 70) return 'bg-yellow-500';
    return 'bg-blue-500';
  }, [progressPercentage]);

  return (
    <header className="flex h-12 items-center justify-between bg-white px-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-lg">{'\u{1F697}'}</span>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800">
            {'\u5DF2\u63A2\u7D22'} {distanceKm}/{limitKm} KM
          </span>
          <div className="h-1 w-24 overflow-hidden rounded-full bg-gray-200">
            <div
              className={`h-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleFilterPanel}
          className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
          aria-label="Filter"
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
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={toggleSettings}
          className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100"
          aria-label="Settings"
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
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
