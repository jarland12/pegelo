import { create } from 'zustand';

export const useAppStore = create((set) => ({
  refreshTrigger: 0,
  triggerRefresh: () => set((state) => ({ refreshTrigger: state.refreshTrigger + 1 })),
  
  toast: null,
  showToast: (message, undoAction = null, duration = 3000) => {
    set({ toast: { message, undoAction, duration } });
  },
  hideToast: () => set({ toast: null }),
}));
