import { useState, useMemo, useCallback } from 'react';
import { useAppState } from '../hooks/useAppState';
import { RoomLabels } from '../types';
import type { CleaningTask, FamilyMember, TaskStatus } from '../types';

// ===== Constants =====

const EMOJI_GRID = [
  '👩', '👨', '👧', '👦', '👶', '👵', '👴', '🧑',
  '👸', '🤴', '🧒', '👱', '🧔', '👩‍🦰', '👨‍🦱', '👩‍🦳',
  '🦸', '🦹', '🧙', '🧚', '🧛', '🧜', '🧝', '🧞',
  '👼', '🤠', '🥷', '🧑‍🍳', '🧑‍🎓', '🧑‍🏫', '🧑‍⚕️', '🧑‍🚀',
];

const statusOrder: Record<TaskStatus, number> = { pending: 0, 'in-progress': 1, done: 2 };

// ===== Helpers =====

function getAgeGroup(age: number): 'young' | 'older' | 'teen-adult' {
  if (age <= 7) return 'young';
  if (age <= 12) return 'older';
  return 'teen-adult';
}

function taskMatchesAge(task: CleaningTask, age: number): boolean {
  const group = getAgeGroup(age);
  switch (group) {
    case 'young':
      return task.ageRange.min <= 7;
    case 'older':
      return task.ageRange.min <= 12;
    case 'teen-adult':
      return true;
  }
}

// ===== Sub-components =====

/** Confirmation dialog overlay */
function ConfirmDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 transition-opacity" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 mx-4 max-w-sm w-full text-center space-y-4">
        <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300 touch-target transition-smooth"
          >
            ביטול
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 active:bg-red-700 touch-target transition-smooth"
          >
            הסרה
          </button>
        </div>
      </div>
    </div>
  );
}

/** Progress bar component */
function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-pesach-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-pesach-400 transition-all duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-pesach-600 font-medium whitespace-nowrap">
        {pct}%
      </span>
    </div>
  );
}

/** A single task row inside the member's expanded view */
function MemberTaskRow({
  task,
  onToggleDone,
}: {
  task: CleaningTask;
  onToggleDone: () => void;
}) {
  const isDone = task.status === 'done';
  return (
    <div
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 ${
        isDone ? 'opacity-60 bg-green-50/50' : 'bg-white hover:bg-pesach-50/30'
      }`}
    >
      <button
        onClick={onToggleDone}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 touch-target transition-smooth ${
          isDone
            ? 'bg-green-500 border-green-500 text-white'
            : task.status === 'in-progress'
              ? 'bg-pesach-100 border-pesach-400 hover:bg-pesach-200'
              : 'bg-white border-gray-300 hover:border-pesach-400'
        }`}
        title={isDone ? 'סמן כלא הושלם' : 'סמן כהושלם'}
      >
        {isDone && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
        {task.status === 'in-progress' && (
          <span className="w-1.5 h-1.5 rounded-full bg-pesach-500" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <span className={`text-xs font-medium ${isDone ? 'line-through text-gray-400' : 'text-gray-700'}`}>
          {task.name}
        </span>
        <span className="text-[10px] text-gray-400 mr-1.5">
          ({RoomLabels[task.room]})
        </span>
      </div>
      <span className="text-[10px] text-gray-400 shrink-0">{task.timeEstimateMinutes} דק׳</span>
    </div>
  );
}

/** Suggested task row with assign button */
function SuggestedTaskRow({
  task,
  onAssign,
}: {
  task: CleaningTask;
  onAssign: () => void;
}) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-pesach-50/60">
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium text-gray-700">{task.name}</span>
        <span className="text-[10px] text-gray-400 mr-1.5">
          ({RoomLabels[task.room]})
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] text-gray-400">{task.timeEstimateMinutes} דק׳</span>
          <span className="text-[10px] text-pesach-500">גיל {task.ageRange.min}+</span>
        </div>
      </div>
      <button
        onClick={onAssign}
        className="text-[11px] bg-pesach-500 hover:bg-pesach-600 active:bg-pesach-700 text-white rounded-lg px-3 py-1.5 font-medium shrink-0 touch-target transition-smooth"
      >
        שיוך
      </button>
    </div>
  );
}

// ===== Member Card (expandable) =====

interface MemberCardProps {
  member: FamilyMember;
  tasks: CleaningTask[];
  suggestedTasks: CleaningTask[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRemove: () => void;
  onToggleTaskDone: (taskId: string) => void;
  onAssignTask: (taskId: string) => void;
}

function MemberCard({
  member,
  tasks,
  suggestedTasks,
  isExpanded,
  onToggleExpand,
  onRemove,
  onToggleTaskDone,
  onAssignTask,
}: MemberCardProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const doneCount = tasks.filter((t) => t.status === 'done').length;

  // Group tasks by status
  const grouped = useMemo(() => {
    const groups: Record<TaskStatus, CleaningTask[]> = {
      pending: [],
      'in-progress': [],
      done: [],
    };
    for (const t of tasks) {
      groups[t.status].push(t);
    }
    return groups;
  }, [tasks]);

  const statusSections: { status: TaskStatus; label: string; items: CleaningTask[] }[] = [
    { status: 'in-progress', label: 'בביצוע', items: grouped['in-progress'] },
    { status: 'pending', label: 'ממתינות', items: grouped['pending'] },
    { status: 'done', label: 'הושלמו', items: grouped['done'] },
  ];

  return (
    <div className="bg-white rounded-xl border border-pesach-100 shadow-sm overflow-hidden transition-all duration-200 card-hover">
      {/* Header row */}
      <div
        className="p-4 flex items-center gap-3 cursor-pointer hover:bg-pesach-50/40 touch-target transition-smooth"
        onClick={onToggleExpand}
      >
        <span className="text-3xl">{member.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-800 text-sm">{member.name}</p>
          <p className="text-xs text-gray-400">גיל {member.age}</p>
        </div>
        {tasks.length > 0 && (
          <div className="text-center px-2">
            <span className="block text-lg font-bold text-pesach-600">
              {doneCount}/{tasks.length}
            </span>
            <span className="text-[10px] text-gray-400">משימות</span>
          </div>
        )}
        {tasks.length === 0 && (
          <span className="text-xs text-gray-300">אין משימות</span>
        )}
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-90' : 'rotate-180'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </div>

      {/* Expanded section */}
      {isExpanded && (
        <div className="accordion-body border-t border-pesach-50 bg-pesach-50/30 px-4 py-3 space-y-3">
          {/* Progress bar */}
          {tasks.length > 0 && <ProgressBar done={doneCount} total={tasks.length} />}

          {/* Tasks grouped by status */}
          {tasks.length > 0 ? (
            <div className="space-y-3">
              {statusSections.map(({ status, label, items }) =>
                items.length > 0 ? (
                  <div key={status}>
                    <p className="text-[11px] font-semibold text-pesach-600 mb-1.5 px-1">
                      {label} ({items.length})
                    </p>
                    <div className="space-y-1">
                      {items.map((task) => (
                        <MemberTaskRow
                          key={task.id}
                          task={task}
                          onToggleDone={() => onToggleTaskDone(task.id)}
                        />
                      ))}
                    </div>
                  </div>
                ) : null,
              )}
            </div>
          ) : (
            <div className="text-center py-3">
              <span className="text-2xl block mb-1">📋</span>
              <p className="text-xs text-gray-400">
                לא שויכו משימות עדיין
              </p>
              <p className="text-[11px] text-gray-300 mt-0.5">
                השתמשו בהצעת משימות למטה או שייכו מעמוד המשימות
              </p>
            </div>
          )}

          {/* Suggest tasks section */}
          <div className="pt-1 space-y-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowSuggestions(!showSuggestions);
              }}
              className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-pesach-600 bg-pesach-100/60 hover:bg-pesach-100 active:bg-pesach-200 rounded-lg py-2.5 touch-target transition-smooth"
            >
              <span>{showSuggestions ? 'הסתר הצעות' : 'הצע משימות מתאימות'}</span>
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${showSuggestions ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showSuggestions && (
              <div className="accordion-body space-y-1">
                {suggestedTasks.length > 0 ? (
                  suggestedTasks.map((task) => (
                    <SuggestedTaskRow
                      key={task.id}
                      task={task}
                      onAssign={() => onAssignTask(task.id)}
                    />
                  ))
                ) : (
                  <div className="text-center py-3">
                    <span className="text-xl block mb-1">✅</span>
                    <p className="text-xs text-gray-400">
                      אין משימות פנויות המתאימות לגיל {member.age}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Remove button */}
          <div className="pt-1 border-t border-pesach-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="text-xs text-red-400 hover:text-red-500 active:text-red-600 py-1.5 touch-target transition-smooth"
            >
              הסרת {member.name} מהמשפחה
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===== Main Page =====

export default function FamilyPage() {
  const { state, addFamilyMember, deleteFamilyMember, updateTask } = useAppState();

  // UI state
  const [showForm, setShowForm] = useState(false);
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [emoji, setEmoji] = useState(EMOJI_GRID[0]);

  // Computed: tasks per member
  const memberTasks = useMemo(() => {
    const map = new Map<string, CleaningTask[]>();
    for (const member of state.familyMembers) {
      map.set(member.id, []);
    }
    for (const task of state.tasks) {
      if (task.assigneeId && map.has(task.assigneeId)) {
        map.get(task.assigneeId)!.push(task);
      }
    }
    // Sort tasks within each member by status
    for (const [, tasks] of map) {
      tasks.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    }
    return map;
  }, [state.tasks, state.familyMembers]);

  // Computed: suggested tasks per member (unassigned, matching age)
  const memberSuggestions = useMemo(() => {
    const unassigned = state.tasks.filter((t) => !t.assigneeId && t.status !== 'done');
    const map = new Map<string, CleaningTask[]>();
    for (const member of state.familyMembers) {
      map.set(
        member.id,
        unassigned.filter((t) => taskMatchesAge(t, member.age)),
      );
    }
    return map;
  }, [state.tasks, state.familyMembers]);

  // Handlers
  const handleAdd = useCallback(() => {
    if (!name.trim() || !age) return;
    addFamilyMember({
      id: `member-${Date.now()}`,
      name: name.trim(),
      age: Number(age),
      emoji,
    });
    setName('');
    setAge('');
    setEmoji(EMOJI_GRID[0]);
    setShowForm(false);
  }, [name, age, emoji, addFamilyMember]);

  const handleConfirmDelete = useCallback(() => {
    if (confirmDeleteId) {
      // Unassign all tasks from this member first
      for (const task of state.tasks) {
        if (task.assigneeId === confirmDeleteId) {
          updateTask(task.id, { assigneeId: null });
        }
      }
      deleteFamilyMember(confirmDeleteId);
      setConfirmDeleteId(null);
      if (expandedMember === confirmDeleteId) {
        setExpandedMember(null);
      }
    }
  }, [confirmDeleteId, deleteFamilyMember, updateTask, state.tasks, expandedMember]);

  const handleToggleTaskDone = useCallback(
    (taskId: string) => {
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) return;
      const nextStatus: Record<TaskStatus, TaskStatus> = {
        pending: 'done',
        'in-progress': 'done',
        done: 'pending',
      };
      updateTask(taskId, { status: nextStatus[task.status] });
    },
    [state.tasks, updateTask],
  );

  const handleAssignTask = useCallback(
    (taskId: string, memberId: string) => {
      updateTask(taskId, { assigneeId: memberId });
    },
    [updateTask],
  );

  const memberToDelete = confirmDeleteId
    ? state.familyMembers.find((m) => m.id === confirmDeleteId)
    : null;

  return (
    <div className="space-y-4">
      {/* Header + Add button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-pesach-800">בני המשפחה</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-pesach-500 hover:bg-pesach-600 active:bg-pesach-700 text-white text-sm font-medium rounded-xl px-4 py-2.5 touch-target transition-smooth"
        >
          {showForm ? 'ביטול' : '+ הוספה'}
        </button>
      </div>

      {/* Add member form */}
      {showForm && (
        <div className="accordion-body bg-white rounded-2xl border border-pesach-100 shadow-sm p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שם</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="שם בן/בת המשפחה"
              className="w-full rounded-lg border-pesach-200 text-sm py-2.5 px-3 focus:border-pesach-400 focus:ring-pesach-300 transition-smooth"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">גיל</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min={1}
              max={120}
              placeholder="גיל"
              className="w-32 rounded-lg border-pesach-200 text-sm py-2.5 px-3 focus:border-pesach-400 focus:ring-pesach-300 transition-smooth"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">אימוג׳י</label>
            <div className="grid grid-cols-8 gap-1.5">
              {EMOJI_GRID.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`text-2xl w-10 h-10 rounded-lg flex items-center justify-center touch-target transition-smooth ${
                    emoji === e
                      ? 'bg-pesach-200 ring-2 ring-pesach-400 shadow-sm'
                      : 'bg-gray-50 hover:bg-pesach-50'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleAdd}
            disabled={!name.trim() || !age}
            className="w-full bg-pesach-500 hover:bg-pesach-600 active:bg-pesach-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl py-2.5 text-sm touch-target transition-smooth"
          >
            הוספה למשפחה
          </button>
        </div>
      )}

      {/* Empty state */}
      {state.familyMembers.length === 0 && !showForm && (
        <div className="bg-white rounded-2xl border border-pesach-100 shadow-sm p-8 text-center">
          <span className="text-4xl block mb-3">👨‍👩‍👧‍👦</span>
          <p className="text-gray-500 text-sm mb-1">עדיין לא הוספתם בני משפחה</p>
          <p className="text-gray-400 text-xs leading-relaxed">
            הוסיפו חברי משפחה כדי לשייך משימות ולעקוב אחרי ההתקדמות של כל אחד
          </p>
        </div>
      )}

      {/* Member list */}
      <div className="space-y-2.5">
        {state.familyMembers.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            tasks={memberTasks.get(member.id) ?? []}
            suggestedTasks={memberSuggestions.get(member.id) ?? []}
            isExpanded={expandedMember === member.id}
            onToggleExpand={() =>
              setExpandedMember((prev) => (prev === member.id ? null : member.id))
            }
            onRemove={() => setConfirmDeleteId(member.id)}
            onToggleTaskDone={handleToggleTaskDone}
            onAssignTask={(taskId) => handleAssignTask(taskId, member.id)}
          />
        ))}
      </div>

      {/* Confirm delete dialog */}
      {confirmDeleteId && memberToDelete && (
        <ConfirmDialog
          message={`להסיר את ${memberToDelete.emoji} ${memberToDelete.name} מהמשפחה? כל המשימות שלו/ה יבוטלו.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}
