import { create } from 'zustand';

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

export type ThemeMode = 'light' | 'dark' | 'system';

interface UIState {
  isFilterPanelOpen: boolean;
  isSettingsOpen: boolean;
  isPaywallOpen: boolean;
  isPOIListExpanded: boolean;
  isSearchRadiusVisible: boolean;
  shouldCenterOnUser: boolean; // Whether to center map on user after list collapse
  toast: Toast | null;
  isLoading: boolean;
  loadingMessage: string;
  theme: ThemeMode;
  isDarkMode: boolean; // Resolved dark mode (considering system preference)
}

interface UIActions {
  toggleFilterPanel: () => void;
  setFilterPanelOpen: (open: boolean) => void;
  toggleSettings: () => void;
  setSettingsOpen: (open: boolean) => void;
  setPaywallOpen: (open: boolean) => void;
  togglePOIListExpanded: () => void;
  setPOIListExpanded: (expanded: boolean) => void;
  collapsePOIList: () => void; // Collapse list and trigger center on user
  setShouldCenterOnUser: (value: boolean) => void;
  toggleSearchRadiusVisible: () => void;
  showToast: (message: string, type?: Toast['type']) => void;
  hideToast: () => void;
  setLoading: (isLoading: boolean, message?: string) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

type UIStore = UIState & UIActions;

// Helper to check system dark mode preference
const getSystemDarkMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// Helper to resolve dark mode based on theme setting
const resolveDarkMode = (theme: ThemeMode): boolean => {
  if (theme === 'system') return getSystemDarkMode();
  return theme === 'dark';
};

const initialState: UIState = {
  isFilterPanelOpen: false,
  isSettingsOpen: false,
  isPaywallOpen: false,
  isPOIListExpanded: false,
  isSearchRadiusVisible: false,
  shouldCenterOnUser: false,
  toast: null,
  isLoading: false,
  loadingMessage: '',
  theme: 'system',
  isDarkMode: getSystemDarkMode()
};

export const useUIStore = create<UIStore>()((set) => ({
  ...initialState,

  toggleFilterPanel: () =>
    set((state) => ({ isFilterPanelOpen: !state.isFilterPanelOpen })),

  setFilterPanelOpen: (isFilterPanelOpen) => set({ isFilterPanelOpen }),

  toggleSettings: () =>
    set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),

  setSettingsOpen: (isSettingsOpen) => set({ isSettingsOpen }),

  setPaywallOpen: (isPaywallOpen) => set({ isPaywallOpen }),

  togglePOIListExpanded: () =>
    set((state) => ({
      isPOIListExpanded: !state.isPOIListExpanded,
      shouldCenterOnUser: state.isPOIListExpanded // Center on user when collapsing
    })),

  setPOIListExpanded: (isPOIListExpanded) => set({ isPOIListExpanded }),

  collapsePOIList: () =>
    set({ isPOIListExpanded: false, shouldCenterOnUser: true }),

  setShouldCenterOnUser: (shouldCenterOnUser) => set({ shouldCenterOnUser }),

  toggleSearchRadiusVisible: () =>
    set((state) => ({ isSearchRadiusVisible: !state.isSearchRadiusVisible })),

  showToast: (message, type = 'info') => set({ toast: { message, type } }),

  hideToast: () => set({ toast: null }),

  setLoading: (isLoading, message = '') =>
    set({ isLoading, loadingMessage: message }),

  setTheme: (theme) =>
    set({ theme, isDarkMode: resolveDarkMode(theme) }),

  toggleTheme: () =>
    set((state) => {
      // Cycle through: system -> light -> dark -> system
      const nextTheme: ThemeMode =
        state.theme === 'system' ? 'light' : state.theme === 'light' ? 'dark' : 'system';
      return { theme: nextTheme, isDarkMode: resolveDarkMode(nextTheme) };
    })
}));
