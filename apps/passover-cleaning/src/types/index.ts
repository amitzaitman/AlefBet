// ===== Room Enum =====

export enum Room {
  Kitchen = 'kitchen',
  LivingRoom = 'livingRoom',
  Bedroom = 'bedroom',
  Bathroom = 'bathroom',
  ChildrenRoom = 'childrenRoom',
  Office = 'office',
  Balcony = 'balcony',
  Car = 'car',
  Storage = 'storage',
  Other = 'other',
}

/** Hebrew labels for each room */
export const RoomLabels: Record<Room, string> = {
  [Room.Kitchen]: 'מטבח',
  [Room.LivingRoom]: 'סלון',
  [Room.Bedroom]: 'חדר שינה',
  [Room.Bathroom]: 'חדר אמבטיה',
  [Room.ChildrenRoom]: 'חדר ילדים',
  [Room.Office]: 'משרד',
  [Room.Balcony]: 'מרפסת',
  [Room.Car]: 'רכב',
  [Room.Storage]: 'מחסן',
  [Room.Other]: 'אחר',
};

// ===== Task Types =====

export type TaskStatus = 'pending' | 'in-progress' | 'done';

export type TaskPriority = 'critical' | 'important' | 'nice-to-have';

/** Difficulty from 1 (easy) to 5 (hard) */
export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface AgeRange {
  min: number;
  max: number;
}

export interface CleaningTask {
  id: string;
  name: string;
  description: string;
  room: Room;
  status: TaskStatus;
  priority: TaskPriority;
  difficulty: Difficulty;
  ageRange: AgeRange;
  timeEstimateMinutes: number;
  assigneeId: string | null;
  cleaningTip: string;
  kasheringGuide: string;
  isCustom: boolean;
  createdAt: string; // ISO 8601
}

// ===== Family Member =====

export interface FamilyMember {
  id: string;
  name: string;
  emoji: string;
  age: number;
}

// ===== App State =====

export interface AppState {
  tasks: CleaningTask[];
  familyMembers: FamilyMember[];
  pesachDate: string; // ISO 8601 date string (YYYY-MM-DD)
}
