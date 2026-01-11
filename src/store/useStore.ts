import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { zustandStorage } from '../services/storage';

const generateId = (): string => {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 11)}`;
};

export interface Project {
  id: string;
  name: string;
  color: string;
  icon: string;
  isDefault?: boolean;
}

export interface Session {
  id: string;
  label: string;
  projectId: string;
  projectSnapshot?: {
    name: string;
    icon: string;
    color: string;
  };
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

const DEFAULT_PROJECTS: Project[] = [
  { id: 'work', name: 'Work', color: '#52525B', icon: 'briefcase-outline', isDefault: true },
  { id: 'learning', name: 'Learning', color: '#52525B', icon: 'book-outline', isDefault: true },
  { id: 'personal', name: 'Personal', color: '#52525B', icon: 'person-outline', isDefault: true },
  { id: 'creative', name: 'Creative', color: '#52525B', icon: 'brush-outline', isDefault: true },
];

const DEFAULT_SETTINGS: Settings = {
  intervalMinutes: 25,
  soundEnabled: true,
  hapticEnabled: true,
  notificationsEnabled: true,
  selectedSound: 'glass',
  onboardingCompleted: false,
};

interface PersistedState {
  sessions: Session[];
  notes: IntervalNote[];
  settings: Settings;
  projects: Project[];
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
  isStartSessionModalVisible: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;

  // Setters
  setCurrentLabel: (label: string) => void;
  setTimerSeconds: (seconds: number) => void;
  setElapsedSeconds: (seconds: number) => void;
  setIsTimerRunning: (running: boolean) => void;
  setCheckInModalVisible: (visible: boolean) => void;
  setStartSessionModalVisible: (visible: boolean) => void;
  setHasHydrated: (state: boolean) => void;

  // Settings actions
  updateSettings: (updates: Partial<Settings>) => void;

  // Project actions
  createProject: (project: Omit<Project, 'id'>) => Project;
  updateProject: (id: string, updates: Partial<Omit<Project, 'id'>>) => void;
  deleteProject: (id: string) => void;
  getProject: (id: string) => Project | undefined;

  // Session actions
  startSession: (projectId: string) => Session;
  restoreSession: (session: Session) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => void;

  // Interval actions
  completeInterval: () => void;
  submitCheckIn: (note?: string) => void;

  // Data actions
  getSessionNotes: (sessionId: string) => IntervalNote[];
  deleteSession: (sessionId: string) => void;
  discardSession: (sessionId: string) => void;
  endOrphanedSession: (sessionId: string, totalSeconds: number) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Persisted state
      sessions: [],
      notes: [],
      settings: DEFAULT_SETTINGS,
      projects: DEFAULT_PROJECTS,

      activeSession: null,
      currentLabel: '',
      timerSeconds: 0,
      isTimerRunning: false,
      elapsedSeconds: 0,

      isCheckInModalVisible: false,
      isStartSessionModalVisible: false,
      isLoading: false,
      _hasHydrated: false,

      // Setters
      setCurrentLabel: (label) => set({ currentLabel: label }),
      setTimerSeconds: (seconds) => set({ timerSeconds: seconds }),
      setElapsedSeconds: (seconds) => set({ elapsedSeconds: seconds }),
      setIsTimerRunning: (running) => set({ isTimerRunning: running }),
      setCheckInModalVisible: (visible) => set({ isCheckInModalVisible: visible }),
      setStartSessionModalVisible: (visible) => set({ isStartSessionModalVisible: visible }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      // Settings
      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      // Project actions
      createProject: (projectData) => {
        const project: Project = {
          ...projectData,
          id: generateId(),
        };
        set((state) => ({
          projects: [...state.projects, project],
        }));
        return project;
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        }));
      },

      getProject: (id) => {
        return get().projects.find((p) => p.id === id);
      },

      // Session actions
      startSession: (projectId) => {
        const { settings, projects } = get();
        const project = projects.find((p) => p.id === projectId);
        const now = new Date().toISOString();
        const session: Session = {
          id: generateId(),
          label: project?.name ?? 'Focus Session',
          projectId,
          projectSnapshot: project
            ? { name: project.name, icon: project.icon, color: project.color }
            : undefined,
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
          isStartSessionModalVisible: false,
          sessions: [session, ...get().sessions],
        });

        return session;
      },

      restoreSession: (session) => {
        const sessionStartTime = new Date(session.startedAt).getTime();
        const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
        const intervalDuration = session.intervalMinutes * 60;
        const elapsedInCurrentInterval = elapsed % intervalDuration;
        const remaining = Math.max(0, intervalDuration - elapsedInCurrentInterval);

        set({
          activeSession: session,
          timerSeconds: remaining,
          isTimerRunning: false,
          elapsedSeconds: elapsed,
        });
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
          isTimerRunning: false,
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
            id: generateId(),
            sessionId: activeSession.id,
            note: note.trim(),
            createdAt: new Date().toISOString(),
          };
          set((state) => ({
            notes: [intervalNote, ...state.notes],
          }));
        }

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

      discardSession: (sessionId) => {
        set((state) => ({
          activeSession: null,
          isTimerRunning: false,
          timerSeconds: 0,
          elapsedSeconds: 0,
          currentLabel: '',
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          notes: state.notes.filter((n) => n.sessionId !== sessionId),
        }));
      },

      endOrphanedSession: (sessionId, totalSeconds) => {
        const now = new Date().toISOString();
        set((state) => ({
          activeSession: null,
          isTimerRunning: false,
          timerSeconds: 0,
          elapsedSeconds: 0,
          currentLabel: '',
          sessions: state.sessions.map((s) =>
            s.id === sessionId
              ? { ...s, status: 'completed' as const, endedAt: now, totalSeconds }
              : s
          ),
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
        projects: state.projects,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
