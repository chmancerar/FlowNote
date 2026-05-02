import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
}

interface EditorState {
  isTyping: boolean;
  setIsTyping: (isTyping: boolean) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  isTyping: false,
  setIsTyping: (isTyping) => set({ isTyping }),
}));

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: true,
      toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
      setSidebarOpen: (isOpen) => set({ isOpen }),
    }),
    {
      name: 'sidebar-storage',
    }
  )
);
