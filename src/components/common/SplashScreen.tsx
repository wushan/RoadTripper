import { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
  minDisplayTime?: number;
}

export function SplashScreen({ onComplete, minDisplayTime = 1500 }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      // Wait for fade out animation to complete
      setTimeout(onComplete, 300);
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [onComplete, minDisplayTime]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-300 ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ backgroundColor: '#1a2744' }}
    >
      {/* Logo */}
      <div className="animate-bounce-slow">
        <img
          src="/pwa-512x512.png"
          alt="RoadTripper"
          className="h-32 w-32 drop-shadow-xl"
        />
      </div>

      {/* App Name */}
      <h1 className="mt-6 text-3xl font-bold text-white drop-shadow-md">
        RoadTripper
      </h1>

      {/* Tagline */}
      <p className="mt-2 text-sm text-white/80">
        探索路上的每一個驚喜
      </p>

      {/* Loading indicator */}
      <div className="mt-8 flex gap-1">
        <span className="h-2 w-2 animate-pulse rounded-full bg-white/60" style={{ animationDelay: '0ms' }} />
        <span className="h-2 w-2 animate-pulse rounded-full bg-white/60" style={{ animationDelay: '150ms' }} />
        <span className="h-2 w-2 animate-pulse rounded-full bg-white/60" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
