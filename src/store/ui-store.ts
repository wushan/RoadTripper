import { create } from 'zustand';

interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UIState {
  isFilterPanelOpen: boolean;
  isSettingsOpen: boolean;
  isPaywallOpen: boolean;
  toast: Toast | null;
  isLoading: boolean;
  loadingMessage: string;
}

interface UIActions {
  toggleFilterPanel: () => void;
  setFilterPanelOpen: (open: boolean) => void;
  toggleSettings: () => void;
  setSettingsOpen: (open: boolean) => void;
  setPaywallOpen: (open: boolean) => void;
  showToast: (message: string, type?: Toast['type']) => void;
  hideToast: () => void;
  setLoading: (isLoading: boolean, message?: string) => void;
}

type UIStore = UIState & UIActions;

const initialState: UIState = {
  isFilterPanelOpen: false,
  isSettingsOpen: false,
  isPaywallOpen: false,
  toast: null,
  isLoading: false,
  loadingMessage: ''
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

  showToast: (message, type = 'info') => set({ toast: { message, type } }),

  hideToast: () => set({ toast: null }),

  setLoading: (isLoading, message = '') =>
    set({ isLoading, loadingMessage: message })
}));
