import { useState, useEffect } from 'react';

interface UpdateNotificationProps {
  onUpdate: () => void;
  onDismiss: () => void;
}

export function UpdateNotification({ onUpdate, onDismiss }: UpdateNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Animate in after mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };

  const handleUpdate = () => {
    setIsVisible(false);
    setTimeout(onUpdate, 300);
  };

  return (
    <div
      className={`fixed inset-x-0 top-0 z-50 p-4 transition-transform duration-300 ease-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="mx-auto max-w-md rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 p-4 shadow-2xl">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white">
              有新版本可用
            </h3>
            <p className="text-xs text-white/80">
              更新以獲得最新功能和修正
            </p>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex gap-2">
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:text-white hover:bg-white/10"
            >
              稍後
            </button>
            <button
              type="button"
              onClick={handleUpdate}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50"
            >
              更新
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
