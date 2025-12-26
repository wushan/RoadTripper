import { useEffect } from 'react';
import { useUIStore, type ThemeMode } from '@store/ui-store';

/**
 * Hook to manage theme and apply dark mode class to document
 */
export function useTheme() {
  const theme = useUIStore((state) => state.theme);
  const isDarkMode = useUIStore((state) => state.isDarkMode);
  const setTheme = useUIStore((state) => state.setTheme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Listen for system preference changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (_e: MediaQueryListEvent) => {
      // Re-apply theme to trigger isDarkMode recalculation
      setTheme('system');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, setTheme]);

  return {
    theme,
    isDarkMode,
    setTheme,
    toggleTheme
  };
}

// Theme icons for UI
export const THEME_ICONS: Record<ThemeMode, string> = {
  light: '☀️',
  dark: '🌙',
  system: '💻'
};

export const THEME_LABELS: Record<ThemeMode, string> = {
  light: '淺色',
  dark: '深色',
  system: '系統'
};
