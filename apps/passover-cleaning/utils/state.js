import { createLocalState } from '../../../framework/dist/alefbet.js';
import { defaultTasks } from '../data/default-tasks.js';

const STORAGE_KEY = 'passover-cleaning-state';

const DEFAULT_STATE = {
  tasks: defaultTasks,
  familyMembers: [],
  pesachDate: '2026-04-01',
};

export const appState = createLocalState(STORAGE_KEY, DEFAULT_STATE);

export function addTask(task) {
  appState.update(s => ({ ...s, tasks: [...s.tasks, task] }));
}

export function updateTask(id, patch) {
  appState.update(s => ({
    ...s,
    tasks: s.tasks.map(t => t.id === id ? { ...t, ...patch } : t),
  }));
}

export function deleteTask(id) {
  appState.update(s => ({ ...s, tasks: s.tasks.filter(t => t.id !== id) }));
}

export function addFamilyMember(member) {
  appState.update(s => ({ ...s, familyMembers: [...s.familyMembers, member] }));
}

export function updateFamilyMember(id, patch) {
  appState.update(s => ({
    ...s,
    familyMembers: s.familyMembers.map(m => m.id === id ? { ...m, ...patch } : m),
  }));
}

export function deleteFamilyMember(id) {
  appState.update(s => ({ ...s, familyMembers: s.familyMembers.filter(m => m.id !== id) }));
}

export function setPesachDate(date) {
  appState.update(s => ({ ...s, pesachDate: date }));
}
