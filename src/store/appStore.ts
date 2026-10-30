import { create } from 'zustand';
import type { UploadedDocument, AppPage } from '../types';

interface AppStore {
  // Navigation
  currentPage: AppPage;
  setCurrentPage: (page: AppPage) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Documents
  documents: UploadedDocument[];
  activeDocumentId: string | null;
  addDocument: (doc: UploadedDocument) => void;
  updateDocument: (id: string, updates: Partial<UploadedDocument>) => void;
  removeDocument: (id: string) => void;
  setActiveDocument: (id: string | null) => void;
  getActiveDocument: () => UploadedDocument | null;

  // Search
  globalSearch: string;
  setGlobalSearch: (query: string) => void;

  // Simulation mode
  simulationMode: boolean;
  toggleSimulationMode: () => void;

  // Notifications
  notifications: { id: string; message: string; type: 'info' | 'warning' | 'error' | 'success'; timestamp: Date }[];
  addNotification: (message: string, type: 'info' | 'warning' | 'error' | 'success') => void;
  clearNotification: (id: string) => void;

  // Selected farm
  selectedFarmId: string | null;
  setSelectedFarmId: (id: string | null) => void;

  // Date range
  dateRange: { start: Date; end: Date };
  setDateRange: (range: { start: Date; end: Date }) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  currentPage: 'command-center',
  setCurrentPage: (page) => set({ currentPage: page }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  documents: [],
  activeDocumentId: null,
  addDocument: (doc) => set((s) => ({ documents: [...s.documents, doc] })),
  updateDocument: (id, updates) =>
    set((s) => ({
      documents: s.documents.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    })),
  removeDocument: (id) =>
    set((s) => ({
      documents: s.documents.filter((d) => d.id !== id),
      activeDocumentId: s.activeDocumentId === id ? null : s.activeDocumentId,
    })),
  setActiveDocument: (id) => set({ activeDocumentId: id }),
  getActiveDocument: () => {
    const state = get();
    return state.documents.find((d) => d.id === state.activeDocumentId) || null;
  },

  globalSearch: '',
  setGlobalSearch: (query) => set({ globalSearch: query }),

  simulationMode: false,
  toggleSimulationMode: () => set((s) => ({ simulationMode: !s.simulationMode })),

  notifications: [],
  addNotification: (message, type) =>
    set((s) => ({
      notifications: [
        ...s.notifications,
        { id: crypto.randomUUID(), message, type, timestamp: new Date() },
      ],
    })),
  clearNotification: (id) =>
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

  selectedFarmId: 'farm-01',
  setSelectedFarmId: (id) => set({ selectedFarmId: id }),

  dateRange: {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date(),
  },
  setDateRange: (range) => set({ dateRange: range }),
}));

