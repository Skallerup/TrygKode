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
  mitIdSub: string;
  biometricsEnabled: boolean;
  createdAt: string;
}

export interface ManagedProfile {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  contacts: Contact[];
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
  managedProfiles: ManagedProfile[];

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
  addManagedProfile: (profile: ManagedProfile) => void;
  removeManagedProfile: (id: string) => void;
  updateManagedProfile: (id: string, updates: Partial<ManagedProfile>) => void;
  addManagedContact: (profileId: string, contact: Contact) => void;
  removeManagedContact: (profileId: string, contactId: string) => void;
  updateManagedCodeWord: (profileId: string, contactId: string, newCodeWord: string) => void;
  resetStore: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isOnboarded: false,
  isAuthenticated: false,
  hasSeedData: false,
  user: null,
  contacts: [],
  scamTips: [],
  managedProfiles: [],

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

  addManagedProfile: (profile) =>
    set((state) => ({ managedProfiles: [...state.managedProfiles, profile] })),

  removeManagedProfile: (id) =>
    set((state) => ({
      managedProfiles: state.managedProfiles.filter((p) => p.id !== id),
    })),

  updateManagedProfile: (id, updates) =>
    set((state) => ({
      managedProfiles: state.managedProfiles.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  addManagedContact: (profileId, contact) =>
    set((state) => ({
      managedProfiles: state.managedProfiles.map((p) =>
        p.id === profileId
          ? { ...p, contacts: [...p.contacts, contact] }
          : p
      ),
    })),

  removeManagedContact: (profileId, contactId) =>
    set((state) => ({
      managedProfiles: state.managedProfiles.map((p) =>
        p.id === profileId
          ? { ...p, contacts: p.contacts.filter((c) => c.id !== contactId) }
          : p
      ),
    })),

  updateManagedCodeWord: (profileId, contactId, newCodeWord) =>
    set((state) => ({
      managedProfiles: state.managedProfiles.map((p) =>
        p.id === profileId
          ? { ...p, contacts: p.contacts.map((c) => c.id === contactId ? { ...c, codeWord: newCodeWord } : c) }
          : p
      ),
    })),

  resetStore: () =>
    set({
      isOnboarded: false,
      isAuthenticated: false,
      hasSeedData: false,
      user: null,
      contacts: [],
      scamTips: [],
      managedProfiles: [],
    }),
}));
