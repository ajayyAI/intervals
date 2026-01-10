import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from '../services/storage';

// ============ TYPES ============

export interface Session {
  id: string;
  label: string;
  intervalMinutes: number;
  status: 'active' | 'paused' | 'completed';
  startedAt: string;
  endedAt?: string;
  totalSeconds: number;
  intervalsCompleted: number;
}

export interface IntervalNote {
  id: string;
  sessionId: string;
  note: string;
  createdAt: string;
}

export interface Settings {
  intervalMinutes: number;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  notificationsEnabled: boolean;
  selectedSound: string;
  onboardingCompleted: boolean;
}

// ============ DEFAULT VALUES ============

const DEFAULT_SETTINGS: Settings = {
  intervalMinutes: 25,
  soundEnabled: true,
  hapticEnabled: true,
  notificationsEnabled: true,
  selectedSound: 'glass',
  onboardingCompleted: false,
};

// ============ STORE STATE & ACTIONS ============

interface PersistedState {
  sessions: Session[];
  notes: IntervalNote[];
  settings: Settings;
}

interface AppState extends PersistedState {
  // Active session state
  activeSession: Session | null;
  currentLabel: string;
  timerSeconds: number;
  isTimerRunning: boolean;
  elapsedSeconds: number;

  // UI state
  isCheckInModalVisible: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;

  // Setters
  setCurrentLabel: (label: string) => void;
  setTimerSeconds: (seconds: number) => void;
  setIsTimerRunning: (running: boolean) => void;
  setCheckInModalVisible: (visible: boolean) => void;
  setHasHydrated: (state: boolean) => void;

  // Settings actions
  updateSettings: (updates: Partial<Settings>) => void;

  // Session actions
  startSession: (label: string) => Session;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => void;

  // Interval actions
  completeInterval: () => void;
  submitCheckIn: (note?: string) => void;

  // Data actions
  getSessionNotes: (sessionId: string) => IntervalNote[];
  deleteSession: (sessionId: string) => void;
}

// ============ STORE ============

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Persisted state
      sessions: [],
      notes: [],
      settings: DEFAULT_SETTINGS,

      // Active state
      activeSession: null,
      currentLabel: '',
      timerSeconds: 0,
      isTimerRunning: false,
      elapsedSeconds: 0,

      // UI state
      isCheckInModalVisible: false,
      isLoading: false,
      _hasHydrated: false,

      // Setters
      setCurrentLabel: (label) => set({ currentLabel: label }),
      setTimerSeconds: (seconds) => set({ timerSeconds: seconds }),
      setIsTimerRunning: (running) => set({ isTimerRunning: running }),
      setCheckInModalVisible: (visible) => set({ isCheckInModalVisible: visible }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      // Settings
      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      // Session actions
      startSession: (label) => {
        const { settings } = get();
        const now = new Date().toISOString();
        const session: Session = {
          id: uuidv4(),
          label,
          intervalMinutes: settings.intervalMinutes,
          status: 'active',
          startedAt: now,
          totalSeconds: 0,
          intervalsCompleted: 0,
        };

        set({
          activeSession: session,
          timerSeconds: settings.intervalMinutes * 60,
          isTimerRunning: true,
          elapsedSeconds: 0,
          sessions: [session, ...get().sessions],
        });

        return session;
      },

      pauseSession: () => {
        const { activeSession } = get();
        if (!activeSession) return;

        set((state) => ({
          isTimerRunning: false,
          activeSession: { ...activeSession, status: 'paused' },
          sessions: state.sessions.map((s) =>
            s.id === activeSession.id ? { ...s, status: 'paused' as const } : s
          ),
        }));
      },

      resumeSession: () => {
        const { activeSession } = get();
        if (!activeSession) return;

        set((state) => ({
          isTimerRunning: true,
          activeSession: { ...activeSession, status: 'active' },
          sessions: state.sessions.map((s) =>
            s.id === activeSession.id ? { ...s, status: 'active' as const } : s
          ),
        }));
      },

      endSession: () => {
        const { activeSession, elapsedSeconds } = get();
        if (!activeSession) return;

        const now = new Date().toISOString();
        set((state) => ({
          activeSession: null,
          isTimerRunning: false,
          timerSeconds: 0,
          elapsedSeconds: 0,
          currentLabel: '',
          sessions: state.sessions.map((s) =>
            s.id === activeSession.id
              ? { ...s, status: 'completed' as const, endedAt: now, totalSeconds: elapsedSeconds }
              : s
          ),
        }));
      },

      completeInterval: () => {
        const { activeSession } = get();
        if (!activeSession) return;

        set((state) => ({
          isCheckInModalVisible: true,
          activeSession: {
            ...activeSession,
            intervalsCompleted: activeSession.intervalsCompleted + 1,
          },
          sessions: state.sessions.map((s) =>
            s.id === activeSession.id ? { ...s, intervalsCompleted: s.intervalsCompleted + 1 } : s
          ),
        }));
      },

      submitCheckIn: (note) => {
        const { activeSession, settings } = get();
        if (!activeSession) return;

        if (note?.trim()) {
          const intervalNote: IntervalNote = {
            id: uuidv4(),
            sessionId: activeSession.id,
            note: note.trim(),
            createdAt: new Date().toISOString(),
          };
          set((state) => ({
            notes: [intervalNote, ...state.notes],
          }));
        }

        // Reset timer for next interval
        set({
          timerSeconds: settings.intervalMinutes * 60,
          isCheckInModalVisible: false,
          isTimerRunning: true,
        });
      },

      getSessionNotes: (sessionId) => {
        return get().notes.filter((n) => n.sessionId === sessionId);
      },

      deleteSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          notes: state.notes.filter((n) => n.sessionId !== sessionId),
        }));
      },
    }),
    {
      name: '@intervals/store',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        sessions: state.sessions,
        notes: state.notes,
        settings: state.settings,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
