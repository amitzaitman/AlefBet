import { defaultTasks } from '../data/default-tasks.js';

// ===== Constants =====

const DEFAULT_PESACH_DATE = '2026-04-01';

/** Maximum safe payload size for QR code (version 40, EC level L, binary) */
export const MAX_QR_BYTES = 2953;

// ===== Helpers: base64url =====

function base64urlEncode(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(str) {
  // Restore standard base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Re-add padding
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// ===== Helpers: status/priority mapping =====

function encodeStatus(status) {
  if (status === 'in-progress') return 'i';
  if (status === 'done') return 'd';
  return undefined; // pending — omit
}

function decodeStatus(s) {
  if (s === 'i') return 'in-progress';
  if (s === 'd') return 'done';
  return 'pending';
}

function encodePriority(p) {
  if (p === 'critical') return 'c';
  if (p === 'important') return 'i';
  return 'n'; // nice-to-have
}

function decodePriority(p) {
  if (p === 'c') return 'critical';
  if (p === 'i') return 'important';
  return 'nice-to-have';
}

function encodeStatusFull(status) {
  if (status === 'in-progress') return 'i';
  if (status === 'done') return 'd';
  return 'p';
}

function decodeStatusFull(s) {
  if (s === 'i') return 'in-progress';
  if (s === 'd') return 'done';
  return 'pending';
}

// ===== Helpers: default task index mapping =====

/** Map from default task id → index (0-based) */
function defaultTaskIndex(id) {
  // id format: "default-N" where N is 1-based
  const n = parseInt(id.split('-')[1], 10);
  return n - 1;
}

// ===== Build delta =====

function buildDelta(state) {
  const delta = { v: 1 };

  // Pesach date
  if (state.pesachDate !== DEFAULT_PESACH_DATE) {
    delta.d = state.pesachDate;
  }

  // Family members
  if (state.familyMembers.length > 0) {
    delta.f = state.familyMembers.map((m) => ({
      i: m.id,
      n: m.name,
      e: m.emoji,
      a: m.age,
    }));
  }

  // Separate default vs custom tasks
  const stateTasks = new Map();
  const customTasks = [];

  for (const task of state.tasks) {
    if (task.isCustom) {
      customTasks.push(task);
    } else {
      stateTasks.set(task.id, task);
    }
  }

  // Default task overrides and deletions
  const patches = {};
  const deleted = [];

  for (const defTask of defaultTasks) {
    const idx = defaultTaskIndex(defTask.id);
    const stateTask = stateTasks.get(defTask.id);

    if (!stateTask) {
      // Default task was deleted by user
      deleted.push(idx);
      continue;
    }

    // Check if status or assigneeId changed from default
    const patch = {};
    let hasChange = false;

    const encodedStatus = encodeStatus(stateTask.status);
    if (encodedStatus !== undefined) {
      patch.s = encodedStatus;
      hasChange = true;
    }

    if (stateTask.assigneeId !== null) {
      patch.a = stateTask.assigneeId;
      hasChange = true;
    }

    if (hasChange) {
      patches[idx] = patch;
    }
  }

  if (Object.keys(patches).length > 0) {
    delta.t = patches;
  }

  if (deleted.length > 0) {
    delta.x = deleted;
  }

  // Custom tasks
  if (customTasks.length > 0) {
    delta.c = customTasks.map((t) => ({
      i: t.id,
      n: t.name,
      de: t.description,
      r: t.room,
      s: encodeStatusFull(t.status),
      p: encodePriority(t.priority),
      di: t.difficulty,
      ar: [t.ageRange.min, t.ageRange.max],
      tm: t.timeEstimateMinutes,
      a: t.assigneeId,
      ct: t.cleaningTip,
      kg: t.kasheringGuide,
      ca: t.createdAt,
    }));
  }

  return delta;
}

// ===== Rehydrate delta → AppState =====

function rehydrate(delta) {
  // Start with fresh copy of defaults
  const tasks = [];
  const deletedSet = new Set(delta.x ?? []);

  for (const defTask of defaultTasks) {
    const idx = defaultTaskIndex(defTask.id);

    // Skip deleted default tasks
    if (deletedSet.has(idx)) continue;

    // Deep copy the default task
    const task = {
      ...defTask,
      ageRange: { ...defTask.ageRange },
    };

    // Apply patches
    const patch = delta.t?.[idx];
    if (patch) {
      task.status = decodeStatus(patch.s);
      if (patch.a !== undefined) {
        task.assigneeId = patch.a;
      }
    }

    tasks.push(task);
  }

  // Add custom tasks
  if (delta.c) {
    for (const ct of delta.c) {
      tasks.push({
        id: ct.i,
        name: ct.n,
        description: ct.de,
        room: ct.r,
        status: decodeStatusFull(ct.s),
        priority: decodePriority(ct.p),
        difficulty: ct.di,
        ageRange: { min: ct.ar[0], max: ct.ar[1] },
        timeEstimateMinutes: ct.tm,
        assigneeId: ct.a,
        cleaningTip: ct.ct,
        kasheringGuide: ct.kg,
        isCustom: true,
        createdAt: ct.ca,
      });
    }
  }

  // Family members
  const familyMembers = (delta.f ?? []).map((fm) => ({
    id: fm.i,
    name: fm.n,
    emoji: fm.e,
    age: fm.a,
  }));

  // Pesach date
  const pesachDate = delta.d ?? DEFAULT_PESACH_DATE;

  return { tasks, familyMembers, pesachDate };
}

// ===== Public API =====

/** Encode full AppState to a QR-safe base64url string */
export function encodeDelta(state) {
  const delta = buildDelta(state);
  const json = JSON.stringify(delta);
  const compressed = window.pako.gzip(new TextEncoder().encode(json));
  return base64urlEncode(compressed);
}

/** Decode a base64url string back to full AppState */
export function decodeDelta(encoded) {
  const bytes = base64urlDecode(encoded);
  const decompressed = window.pako.ungzip(bytes);
  const json = new TextDecoder().decode(decompressed);
  const delta = JSON.parse(json);

  if (delta.v !== 1) {
    throw new Error('גרסה לא נתמכת — עדכנו את האפליקציה');
  }

  return rehydrate(delta);
}

/** Get the byte size of the encoded payload (for UI display) */
export function encodedByteSize(encoded) {
  return encoded.length;
}
