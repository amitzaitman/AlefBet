import { useState, useEffect, useCallback } from 'react';
import type { AppState, CleaningTask, FamilyMember } from '../types';
import { defaultTasks } from '../data/defaultTasks';

const STORAGE_KEY = 'passover-cleaning-state';

/** Default Pesach date — 2026-04-01 (first seder night) */
const DEFAULT_PESACH_DATE = '2026-04-01';

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as AppState;
    }
  } catch {
    // corrupted data — fall through to defaults
  }
  return {
    tasks: defaultTasks,
    familyMembers: [],
    pesachDate: DEFAULT_PESACH_DATE,
  };
}

function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useAppState() {
  const [state, setState] = useState<AppState>(loadState);

  // Persist on every change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // ----- Tasks -----

  const addTask = useCallback((task: CleaningTask) => {
    setState((prev) => ({ ...prev, tasks: [...prev.tasks, task] }));
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<CleaningTask>) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  }, []);

  // ----- Family Members -----

  const addFamilyMember = useCallback((member: FamilyMember) => {
    setState((prev) => ({
      ...prev,
      familyMembers: [...prev.familyMembers, member],
    }));
  }, []);

  const updateFamilyMember = useCallback(
    (id: string, patch: Partial<FamilyMember>) => {
      setState((prev) => ({
        ...prev,
        familyMembers: prev.familyMembers.map((m) =>
          m.id === id ? { ...m, ...patch } : m,
        ),
      }));
    },
    [],
  );

  const deleteFamilyMember = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      familyMembers: prev.familyMembers.filter((m) => m.id !== id),
    }));
  }, []);

  // ----- Pesach Date -----

  const setPesachDate = useCallback((date: string) => {
    setState((prev) => ({ ...prev, pesachDate: date }));
  }, []);

  return {
    state,
    addTask,
    updateTask,
    deleteTask,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    setPesachDate,
  };
}
