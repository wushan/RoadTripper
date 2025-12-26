import { useUIStore } from '@store/ui-store';

const APP_VERSION = '0.1.0';
const CURRENT_YEAR = new Date().getFullYear();

export function AboutModal() {
  const isOpen = useUIStore((state) => state.isSettingsOpen);
  const closeModal = useUIStore((state) => state.setSettingsOpen);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => closeModal(false)}
    >
      <div
        className="mx-4 w-full max-w-sm rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Logo */}
        <div className="flex justify-center">
          <img
            src="/pwa-192x192.png"
            alt="RoadTripper"
            className="h-20 w-20 rounded-2xl shadow-lg"
          />
        </div>

        {/* App Name */}
        <h2 className="mt-4 text-center text-2xl font-bold text-gray-900 dark:text-white">
          RoadTripper
        </h2>

        {/* Tagline */}
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          探索路上的每一個驚喜
        </p>

        {/* Description */}
        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          讓公路旅行者不再錯過任何值得停留的地方。即時探索附近的景點、美食和服務，讓每一趟旅程都充滿驚喜。
        </p>

        {/* Version */}
        <div className="mt-6 flex justify-center">
          <span className="rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1 text-xs text-gray-600 dark:text-gray-400">
            版本 {APP_VERSION}
          </span>
        </div>

        {/* Copyright */}
        <p className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
          &copy; {CURRENT_YEAR} RoadTripper. All rights reserved.
        </p>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => closeModal(false)}
          className="mt-6 w-full rounded-xl bg-blue-500 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-600 active:bg-blue-700"
        >
          關閉
        </button>
      </div>
    </div>
  );
}
