import { useMemo, useState, useCallback } from 'react';
import { useAppState } from '../hooks/useAppState';
import { RoomLabels, Room } from '../types';
import type { CleaningTask, TaskStatus, TaskPriority, Difficulty } from '../types';

// ===== Constants =====

const statusLabels: Record<TaskStatus, string> = {
  pending: 'ממתינה',
  'in-progress': 'בביצוע',
  done: 'הושלמה',
};

const priorityLabels: Record<TaskPriority, string> = {
  critical: 'קריטי',
  important: 'חשוב',
  'nice-to-have': 'נחמד',
};

const priorityColors: Record<TaskPriority, string> = {
  critical: 'bg-pesach-100 text-pesach-800 border-pesach-200',
  important: 'bg-pesach-50 text-pesach-600 border-pesach-100',
  'nice-to-have': 'bg-green-50 text-green-700 border-green-100',
};

const priorityOrder: Record<TaskPriority, number> = { critical: 0, important: 1, 'nice-to-have': 2 };
const statusOrder: Record<TaskStatus, number> = { pending: 0, 'in-progress': 1, done: 2 };

const ALL = 'all';

// ===== Sub-components =====

function DifficultyDots({ level }: { level: Difficulty }) {
  return (
    <span className="inline-flex gap-0.5" title={`קושי ${level}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`inline-block w-1.5 h-1.5 rounded-full transition-colors ${
            i < level ? 'bg-pesach-500' : 'bg-gray-200'
          }`}
        />
      ))}
    </span>
  );
}

function AgeBadge({ min, max }: { min: number; max: number }) {
  const label = max >= 99 ? `${min}+` : `${min}–${max}`;
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded bg-pesach-50 text-pesach-600 font-medium whitespace-nowrap">
      {label}
    </span>
  );
}

function TimeBadge({ minutes }: { minutes: number }) {
  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded bg-pesach-50 text-pesach-500 font-medium whitespace-nowrap">
      {minutes} דק׳
    </span>
  );
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium whitespace-nowrap ${priorityColors[priority]}`}>
      {priorityLabels[priority]}
    </span>
  );
}

// ===== Chevron icon =====

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-90' : 'rotate-180'}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

// ===== Add Task Modal =====

interface AddTaskModalProps {
  onClose: () => void;
  onAdd: (task: CleaningTask) => void;
}

function AddTaskModal({ onClose, onAdd }: AddTaskModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [room, setRoom] = useState<Room>(Room.Kitchen);
  const [priority, setPriority] = useState<TaskPriority>('important');
  const [difficulty, setDifficulty] = useState<Difficulty>(2);
  const [ageMin, setAgeMin] = useState('8');
  const [ageMax, setAgeMax] = useState('99');
  const [time, setTime] = useState('20');
  const [cleaningTip, setCleaningTip] = useState('');
  const [kasheringGuide, setKasheringGuide] = useState('');

  const canSubmit = name.trim().length > 0 && Number(time) > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onAdd({
      id: `custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      room,
      status: 'pending',
      priority,
      difficulty,
      ageRange: { min: Number(ageMin) || 1, max: Number(ageMax) || 99 },
      timeEstimateMinutes: Number(time) || 20,
      assigneeId: null,
      cleaningTip: cleaningTip.trim(),
      kasheringGuide: kasheringGuide.trim(),
      isCustom: true,
      createdAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 transition-opacity" onClick={onClose} />

      {/* Modal content */}
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-pesach-100 px-5 py-3 flex items-center justify-between rounded-t-2xl z-10">
          <h3 className="text-base font-bold text-pesach-800">משימה חדשה</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-50 touch-target transition-smooth"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שם המשימה *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="לדוגמה: ניקוי ארון מטבח עליון"
              className="w-full rounded-lg border-pesach-200 text-sm py-2.5 px-3 focus:border-pesach-400 focus:ring-pesach-300 transition-smooth"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="תיאור קצר של המשימה"
              className="w-full rounded-lg border-pesach-200 text-sm py-2.5 px-3 focus:border-pesach-400 focus:ring-pesach-300 transition-smooth"
            />
          </div>

          {/* Room + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">חדר</label>
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value as Room)}
                className="w-full rounded-lg border-pesach-200 text-sm py-2.5 px-3 focus:border-pesach-400 focus:ring-pesach-300 transition-smooth"
              >
                {Object.values(Room).map((r) => (
                  <option key={r} value={r}>{RoomLabels[r]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">עדיפות</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full rounded-lg border-pesach-200 text-sm py-2.5 px-3 focus:border-pesach-400 focus:ring-pesach-300 transition-smooth"
              >
                <option value="critical">קריטי</option>
                <option value="important">חשוב</option>
                <option value="nice-to-have">נחמד</option>
              </select>
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              רמת קושי: {difficulty}
            </label>
            <div className="flex gap-2">
              {([1, 2, 3, 4, 5] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium touch-target transition-smooth ${
                    difficulty >= d
                      ? 'bg-pesach-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-400 hover:bg-pesach-100 hover:text-pesach-500'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Age range + Time row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">גיל מינימלי</label>
              <input
                type="number"
                value={ageMin}
                onChange={(e) => setAgeMin(e.target.value)}
                min={1}
                max={99}
                className="w-full rounded-lg border-pesach-200 text-sm py-2.5 px-3 focus:border-pesach-400 focus:ring-pesach-300 transition-smooth"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">גיל מקסימלי</label>
              <input
                type="number"
                value={ageMax}
                onChange={(e) => setAgeMax(e.target.value)}
                min={1}
                max={99}
                className="w-full rounded-lg border-pesach-200 text-sm py-2.5 px-3 focus:border-pesach-400 focus:ring-pesach-300 transition-smooth"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">זמן (דק׳)</label>
              <input
                type="number"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                min={1}
                className="w-full rounded-lg border-pesach-200 text-sm py-2.5 px-3 focus:border-pesach-400 focus:ring-pesach-300 transition-smooth"
              />
            </div>
          </div>

          {/* Cleaning tip */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">טיפ לניקוי</label>
            <input
              type="text"
              value={cleaningTip}
              onChange={(e) => setCleaningTip(e.target.value)}
              placeholder="טיפ שימושי (לא חובה)"
              className="w-full rounded-lg border-pesach-200 text-sm py-2.5 px-3 focus:border-pesach-400 focus:ring-pesach-300 transition-smooth"
            />
          </div>

          {/* Kashering guide */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">הנחיית הכשרה</label>
            <input
              type="text"
              value={kasheringGuide}
              onChange={(e) => setKasheringGuide(e.target.value)}
              placeholder="הנחיה להכשרה לפסח (לא חובה)"
              className="w-full rounded-lg border-pesach-200 text-sm py-2.5 px-3 focus:border-pesach-400 focus:ring-pesach-300 transition-smooth"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full bg-pesach-500 hover:bg-pesach-600 active:bg-pesach-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl py-3 text-sm touch-target transition-smooth"
          >
            הוספת משימה
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== Assign Dropdown =====

interface AssignDropdownProps {
  taskId: string;
  currentAssignee: string | null;
  familyMembers: { id: string; name: string; emoji: string }[];
  onAssign: (taskId: string, assigneeId: string | null) => void;
}

function AssignDropdown({ taskId, currentAssignee, familyMembers, onAssign }: AssignDropdownProps) {
  const [open, setOpen] = useState(false);

  if (familyMembers.length === 0) {
    return (
      <span className="text-[10px] text-gray-300 px-1" title="הוסיפו בני משפחה בעמוד המשפחה">
        --
      </span>
    );
  }

  const assigned = familyMembers.find((m) => m.id === currentAssignee);

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className={`flex items-center gap-1 text-xs rounded-lg px-2.5 py-1.5 touch-target transition-smooth ${
          assigned
            ? 'bg-pesach-50 text-pesach-700 hover:bg-pesach-100'
            : 'bg-gray-50 text-gray-400 hover:bg-pesach-50 hover:text-pesach-500'
        }`}
        title="שיוך למשפחה"
      >
        {assigned ? (
          <>
            <span>{assigned.emoji}</span>
            <span className="max-w-[60px] truncate">{assigned.name}</span>
          </>
        ) : (
          <span>שיוך</span>
        )}
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 sm:right-0 top-full mt-1 z-50 bg-white rounded-lg shadow-lg border border-pesach-100 py-1 min-w-[140px]">
            {currentAssignee && (
              <button
                onClick={(e) => { e.stopPropagation(); onAssign(taskId, null); setOpen(false); }}
                className="w-full text-right px-3 py-2 text-xs text-gray-400 hover:bg-gray-50 touch-target transition-smooth"
              >
                ביטול שיוך
              </button>
            )}
            {familyMembers.map((m) => (
              <button
                key={m.id}
                onClick={(e) => { e.stopPropagation(); onAssign(taskId, m.id); setOpen(false); }}
                className={`w-full text-right px-3 py-2 text-xs hover:bg-pesach-50 flex items-center gap-2 touch-target transition-smooth ${
                  m.id === currentAssignee ? 'bg-pesach-50 font-medium' : ''
                }`}
              >
                <span>{m.emoji}</span>
                <span>{m.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ===== Task Card =====

interface TaskCardProps {
  task: CleaningTask;
  familyMembers: { id: string; name: string; emoji: string }[];
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleDone: () => void;
  onAssign: (taskId: string, assigneeId: string | null) => void;
}

function TaskCard({ task, familyMembers, expanded, onToggleExpand, onToggleDone, onAssign }: TaskCardProps) {
  const isDone = task.status === 'done';

  return (
    <div
      className={`bg-white rounded-xl border border-pesach-100 shadow-sm transition-all duration-200 ${
        isDone ? 'opacity-60' : 'card-hover'
      }`}
    >
      {/* Main row */}
      <div className="p-3 sm:p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={onToggleDone}
            className={`mt-0.5 w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 touch-target transition-smooth ${
              isDone
                ? 'bg-green-500 border-green-500 text-white'
                : task.status === 'in-progress'
                  ? 'bg-pesach-100 border-pesach-400 hover:bg-pesach-200'
                  : 'bg-white border-gray-300 hover:border-pesach-400 hover:bg-pesach-50'
            }`}
            title={isDone ? 'סמן כלא הושלם' : 'סמן כהושלם'}
          >
            {isDone && (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {task.status === 'in-progress' && (
              <span className="w-2 h-2 rounded-full bg-pesach-500" />
            )}
          </button>

          {/* Content clickable to expand */}
          <div className="flex-1 min-w-0 cursor-pointer" onClick={onToggleExpand}>
            {/* Top line: name + badges */}
            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
              <span
                className={`font-medium text-sm ${
                  isDone ? 'line-through text-gray-400' : 'text-gray-800'
                }`}
              >
                {task.name}
              </span>
              <PriorityBadge priority={task.priority} />
            </div>

            {/* Badge row */}
            <div className="flex items-center gap-2 flex-wrap">
              <DifficultyDots level={task.difficulty} />
              <TimeBadge minutes={task.timeEstimateMinutes} />
              <AgeBadge min={task.ageRange.min} max={task.ageRange.max} />
            </div>
          </div>

          {/* Assignee */}
          <div className="shrink-0">
            <AssignDropdown
              taskId={task.id}
              currentAssignee={task.assigneeId}
              familyMembers={familyMembers}
              onAssign={onAssign}
            />
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="accordion-body border-t border-pesach-50 px-4 py-3 space-y-2 bg-pesach-50/40">
          {task.description && (
            <p className="text-xs text-gray-600 leading-relaxed">{task.description}</p>
          )}
          {task.cleaningTip && (
            <div className="flex gap-2 text-xs">
              <span className="text-pesach-400 shrink-0 mt-0.5">💡</span>
              <div>
                <span className="font-medium text-gray-700">טיפ: </span>
                <span className="text-gray-600 leading-relaxed">{task.cleaningTip}</span>
              </div>
            </div>
          )}
          {task.kasheringGuide && (
            <div className="flex gap-2 text-xs">
              <span className="text-pesach-500 shrink-0 mt-0.5">📋</span>
              <div>
                <span className="font-medium text-gray-700">הכשרה: </span>
                <span className="text-gray-600 leading-relaxed">{task.kasheringGuide}</span>
              </div>
            </div>
          )}
          {!task.description && !task.cleaningTip && !task.kasheringGuide && (
            <p className="text-xs text-gray-400">אין מידע נוסף</p>
          )}
          <div className="flex items-center gap-3 text-[11px] text-gray-400 pt-1">
            <span>{statusLabels[task.status]}</span>
            {task.isCustom && <span className="text-pesach-400">משימה מותאמת</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Main Page =====

export default function TasksPage() {
  const { state, updateTask, addTask } = useAppState();

  // Filters
  const [roomFilter, setRoomFilter] = useState<string>(ALL);
  const [priorityFilter, setPriorityFilter] = useState<string>(ALL);
  const [statusFilter, setStatusFilter] = useState<string>(ALL);
  const [assigneeFilter, setAssigneeFilter] = useState<string>(ALL);

  // UI state
  const [collapsedRooms, setCollapsedRooms] = useState<Set<string>>(new Set());
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Which rooms actually have tasks
  const activeRooms = useMemo(() => {
    const seen = new Set(state.tasks.map((t) => t.room));
    return Object.values(Room).filter((r) => seen.has(r));
  }, [state.tasks]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    let list = state.tasks;
    if (roomFilter !== ALL) list = list.filter((t) => t.room === roomFilter);
    if (priorityFilter !== ALL) list = list.filter((t) => t.priority === priorityFilter);
    if (statusFilter !== ALL) list = list.filter((t) => t.status === statusFilter);
    if (assigneeFilter !== ALL) {
      if (assigneeFilter === 'unassigned') {
        list = list.filter((t) => !t.assigneeId);
      } else {
        list = list.filter((t) => t.assigneeId === assigneeFilter);
      }
    }
    return list;
  }, [state.tasks, roomFilter, priorityFilter, statusFilter, assigneeFilter]);

  // Group by room, sorted
  const grouped = useMemo(() => {
    const map = new Map<Room, CleaningTask[]>();
    for (const task of filteredTasks) {
      const arr = map.get(task.room) ?? [];
      arr.push(task);
      map.set(task.room, arr);
    }
    // Sort tasks within each room
    for (const [, tasks] of map) {
      tasks.sort(
        (a, b) =>
          statusOrder[a.status] - statusOrder[b.status] ||
          priorityOrder[a.priority] - priorityOrder[b.priority],
      );
    }
    // Return rooms in enum order
    const result: { room: Room; tasks: CleaningTask[] }[] = [];
    for (const room of Object.values(Room)) {
      const tasks = map.get(room);
      if (tasks && tasks.length > 0) {
        result.push({ room, tasks });
      }
    }
    return result;
  }, [filteredTasks]);

  const toggleRoom = useCallback((room: string) => {
    setCollapsedRooms((prev) => {
      const next = new Set(prev);
      if (next.has(room)) next.delete(room);
      else next.add(room);
      return next;
    });
  }, []);

  const toggleDone = useCallback((task: CleaningTask) => {
    const next: Record<TaskStatus, TaskStatus> = {
      pending: 'done',
      'in-progress': 'done',
      done: 'pending',
    };
    updateTask(task.id, { status: next[task.status] });
  }, [updateTask]);

  const handleAssign = useCallback((taskId: string, assigneeId: string | null) => {
    updateTask(taskId, { assigneeId });
  }, [updateTask]);

  // Stats
  const doneCount = filteredTasks.filter((t) => t.status === 'done').length;
  const hasActiveFilters = roomFilter !== ALL || priorityFilter !== ALL || statusFilter !== ALL || assigneeFilter !== ALL;

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={roomFilter}
          onChange={(e) => setRoomFilter(e.target.value)}
          className="rounded-lg border-pesach-200 bg-white text-sm py-2 px-3 text-gray-700 focus:border-pesach-400 focus:ring-pesach-300 touch-target transition-smooth"
        >
          <option value={ALL}>כל החדרים</option>
          {activeRooms.map((r) => (
            <option key={r} value={r}>{RoomLabels[r]}</option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-lg border-pesach-200 bg-white text-sm py-2 px-3 text-gray-700 focus:border-pesach-400 focus:ring-pesach-300 touch-target transition-smooth"
        >
          <option value={ALL}>כל העדיפויות</option>
          <option value="critical">קריטי</option>
          <option value="important">חשוב</option>
          <option value="nice-to-have">נחמד</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border-pesach-200 bg-white text-sm py-2 px-3 text-gray-700 focus:border-pesach-400 focus:ring-pesach-300 touch-target transition-smooth"
        >
          <option value={ALL}>כל הסטטוסים</option>
          <option value="pending">ממתינות</option>
          <option value="in-progress">בביצוע</option>
          <option value="done">הושלמו</option>
        </select>

        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className="rounded-lg border-pesach-200 bg-white text-sm py-2 px-3 text-gray-700 focus:border-pesach-400 focus:ring-pesach-300 touch-target transition-smooth"
        >
          <option value={ALL}>כל המשויכים</option>
          <option value="unassigned">לא משויך</option>
          {state.familyMembers.map((m) => (
            <option key={m.id} value={m.id}>{m.emoji} {m.name}</option>
          ))}
        </select>

        <span className="text-sm text-gray-500 mr-auto font-medium">
          {doneCount}/{filteredTasks.length} הושלמו
        </span>
      </div>

      {/* Empty state */}
      {grouped.length === 0 && (
        <div className="bg-white rounded-2xl border border-pesach-100 shadow-sm text-center py-12 px-6">
          {hasActiveFilters ? (
            <>
              <span className="text-4xl block mb-3">🔍</span>
              <p className="text-sm text-gray-500 mb-1">אין משימות התואמות את הסינון</p>
              <p className="text-xs text-gray-400">נסו לשנות את הפילטרים או לאפס אותם</p>
            </>
          ) : (
            <>
              <span className="text-4xl block mb-3">✨</span>
              <p className="text-sm text-gray-500 mb-1">אין משימות להצגה</p>
              <p className="text-xs text-gray-400">לחצו על + להוספת משימה חדשה</p>
            </>
          )}
        </div>
      )}

      {/* Grouped task list */}
      <div className="space-y-3">
        {grouped.map(({ room, tasks }) => {
          const isCollapsed = collapsedRooms.has(room);
          const roomDone = tasks.filter((t) => t.status === 'done').length;
          return (
            <div key={room}>
              {/* Room header */}
              <button
                onClick={() => toggleRoom(room)}
                className="w-full flex items-center gap-2 px-3 py-2.5 bg-white rounded-xl border border-pesach-100 shadow-sm hover:bg-pesach-50 touch-target transition-smooth"
              >
                <ChevronIcon open={!isCollapsed} />
                <span className="font-bold text-sm text-pesach-800">{RoomLabels[room]}</span>
                <span className="text-[11px] text-gray-400 mr-auto">
                  {roomDone}/{tasks.length}
                </span>
                {/* mini progress */}
                <div className="w-16 h-1.5 rounded-full bg-pesach-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-pesach-400 transition-all duration-300"
                    style={{ width: `${tasks.length > 0 ? (roomDone / tasks.length) * 100 : 0}%` }}
                  />
                </div>
              </button>

              {/* Tasks */}
              {!isCollapsed && (
                <div className="accordion-body space-y-2 mt-2 mr-2">
                  {tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      familyMembers={state.familyMembers}
                      expanded={expandedTask === task.id}
                      onToggleExpand={() =>
                        setExpandedTask((prev) => (prev === task.id ? null : task.id))
                      }
                      onToggleDone={() => toggleDone(task)}
                      onAssign={handleAssign}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FAB: Add Task */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-20 w-14 h-14 rounded-full bg-pesach-500 hover:bg-pesach-600 active:bg-pesach-700 text-white shadow-lg hover:shadow-xl flex items-center justify-center touch-target transition-smooth"
        title="הוספת משימה"
      >
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Add Task Modal */}
      {showAddModal && (
        <AddTaskModal
          onClose={() => setShowAddModal(false)}
          onAdd={addTask}
        />
      )}
    </div>
  );
}
