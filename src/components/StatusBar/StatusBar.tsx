import { useMemo } from 'react';
import { useQuotaStore } from '@store/quota-store';
import { useUIStore, type ThemeMode } from '@store/ui-store';

// Theme icons
const THEME_ICONS: Record<ThemeMode, React.ReactNode> = {
  light: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  dark: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
  system: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
};

export function StatusBar() {
  const distanceTraveled = useQuotaStore((state) => state.distanceTraveled);
  const distanceLimit = useQuotaStore((state) => state.distanceLimit);
  const toggleFilterPanel = useUIStore((state) => state.toggleFilterPanel);
  const toggleSettings = useUIStore((state) => state.toggleSettings);
  const theme = useUIStore((state) => state.theme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);

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
    <header className="flex h-12 items-center justify-between bg-white dark:bg-gray-800 px-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-lg">{'\u{1F697}'}</span>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {'\u5DF2\u63A2\u7D22'} {distanceKm}/{limitKm} KM
          </span>
          <div className="h-1 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className={`h-full transition-all duration-500 ${progressColor}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-lg p-2 text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label={`切換主題 (目前: ${theme === 'light' ? '淺色' : theme === 'dark' ? '深色' : '系統'})`}
          title={theme === 'light' ? '淺色模式' : theme === 'dark' ? '深色模式' : '跟隨系統'}
        >
          {THEME_ICONS[theme]}
        </button>

        {/* Filter */}
        <button
          type="button"
          onClick={toggleFilterPanel}
          className="rounded-lg p-2 text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="篩選"
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

        {/* Settings */}
        <button
          type="button"
          onClick={toggleSettings}
          className="rounded-lg p-2 text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
          aria-label="設定"
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
