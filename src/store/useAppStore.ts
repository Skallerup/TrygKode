import { create } from 'zustand';

export type ContactStatus = 'pending_sent' | 'pending_received' | 'accepted' | 'declined';

export interface Contact {
  id: string;
  name: string;
  imageUri?: string;
  phone?: string;
  codeWord: string;
  codeType: 'static' | 'rotating';
  createdAt: string;
  expiresAt?: string;
  lastCheckIn?: string;
  isAdmin?: boolean;
  status: ContactStatus;
  requestedAt: string;
  acceptedAt?: string;
  requestedBy: 'me' | 'them';
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  imageUri?: string;
  mitIdVerified: boolean;
  biometricsEnabled: boolean;
  createdAt: string;
}

export interface ScamTip {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  category: 'tip' | 'news' | 'warning';
}

interface AppState {
  isOnboarded: boolean;
  isAuthenticated: boolean;
  hasSeedData: boolean;
  user: UserProfile | null;
  contacts: Contact[];
  scamTips: ScamTip[];

  setOnboarded: (value: boolean) => void;
  setAuthenticated: (value: boolean) => void;
  setHasSeedData: (value: boolean) => void;
  setUser: (user: UserProfile | null) => void;
  addContact: (contact: Contact) => void;
  removeContact: (id: string) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  updateCodeWord: (contactId: string, newCodeWord: string) => void;
  acceptContact: (id: string) => void;
  declineContact: (id: string) => void;
  setScamTips: (tips: ScamTip[]) => void;
  resetStore: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isOnboarded: false,
  isAuthenticated: false,
  hasSeedData: false,
  user: null,
  contacts: [],
  scamTips: [],

  setOnboarded: (value) => set({ isOnboarded: value }),
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setHasSeedData: (value) => set({ hasSeedData: value }),
  setUser: (user) => set({ user }),

  addContact: (contact) =>
    set((state) => ({ contacts: [...state.contacts, contact] })),

  removeContact: (id) =>
    set((state) => ({
      contacts: state.contacts.filter((c) => c.id !== id),
    })),

  updateContact: (id, updates) =>
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  updateCodeWord: (contactId, newCodeWord) =>
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c.id === contactId ? { ...c, codeWord: newCodeWord } : c
      ),
    })),

  acceptContact: (id) =>
    set((state) => ({
      contacts: state.contacts.map((c) =>
        c.id === id
          ? { ...c, status: 'accepted' as const, acceptedAt: new Date().toISOString() }
          : c
      ),
    })),

  declineContact: (id) =>
    set((state) => ({
      contacts: state.contacts.filter((c) => c.id !== id),
    })),

  setScamTips: (tips) => set({ scamTips: tips }),

  resetStore: () =>
    set({
      isOnboarded: false,
      isAuthenticated: false,
      hasSeedData: false,
      user: null,
      contacts: [],
      scamTips: [],
    }),
}));
