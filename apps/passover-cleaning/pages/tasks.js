import { appState, updateTask, addTask } from '../utils/state.js';
import { Room, RoomLabels } from '../data/default-tasks.js';

// ── Constants ───────────────────────────────────────────────────────────────

const statusLabels = {
  pending: 'ממתינה',
  'in-progress': 'בביצוע',
  done: 'הושלמה',
};

const priorityLabels = {
  critical: 'קריטי',
  important: 'חשוב',
  'nice-to-have': 'נחמד',
};

const priorityColors = {
  critical: 'pc-badge--priority-critical',
  important: 'pc-badge--priority-important',
  'nice-to-have': 'pc-badge--priority-nice-to-have',
};

const statusOrder = { 'in-progress': 0, pending: 1, done: 2 };
const priorityOrder = { critical: 0, important: 1, 'nice-to-have': 2 };

const ROOM_ORDER = [
  Room.Kitchen,
  Room.LivingRoom,
  Room.Bedroom,
  Room.Bathroom,
  Room.ChildrenRoom,
  Room.Office,
  Room.Balcony,
  Room.Car,
  Room.Storage,
  Room.Other,
];

// ── HTML builders ────────────────────────────────────────────────────────────

function buildDifficultyDots(level) {
  const dots = Array.from({ length: 5 }, (_, i) => {
    const filled = i < level ? 'pc-difficulty-dots__dot--filled' : '';
    return `<span class="pc-difficulty-dots__dot ${filled}"></span>`;
  }).join('');
  return `<span class="pc-difficulty-dots" title="קושי ${level}/5">${dots}</span>`;
}

function buildPriorityBadge(priority) {
  return `<span class="pc-badge ${priorityColors[priority]}">${priorityLabels[priority]}</span>`;
}

function buildTimeBadge(minutes) {
  return `<span class="pc-badge" style="background:var(--pesach-50);color:var(--pesach-500);font-size:0.625rem;">${minutes} דק׳</span>`;
}

function buildAgeBadge(min, max) {
  const label = max >= 99 ? `${min}+` : `${min}–${max}`;
  return `<span class="pc-badge" style="background:var(--pesach-50);color:var(--pesach-600);font-size:0.625rem;">${label}</span>`;
}

function buildCircleBtn(status) {
  if (status === 'done') {
    return `
      <button class="pc-circle-btn pc-circle-btn--done" data-action="toggle-status" title="סמן כממתינה" style="color:#16a34a;border-color:#86efac;background:#f0fdf4;">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
        </svg>
      </button>`;
  }
  if (status === 'in-progress') {
    return `
      <button class="pc-circle-btn pc-circle-btn--in-progress" data-action="toggle-status" title="סמן כהושלם" style="color:#2563eb;border-color:#93c5fd;background:#eff6ff;">
        <span style="width:0.5rem;height:0.5rem;border-radius:9999px;background:var(--pesach-500);display:inline-block;"></span>
      </button>`;
  }
  return `
    <button class="pc-circle-btn pc-circle-btn--pending" data-action="toggle-status" title="סמן כבביצוע" style="color:#9ca3af;border-color:#d1d5db;background:white;">
    </button>`;
}

function buildAssigneeSection(task, familyMembers) {
  if (familyMembers.length === 0) {
    return `<span style="font-size:0.625rem;color:#d1d5db;padding:0 0.25rem;" title="הוסיפו בני משפחה בעמוד המשפחה">--</span>`;
  }
  const assigned = familyMembers.find(m => m.id === task.assigneeId);
  const btnContent = assigned
    ? `<span>${assigned.emoji}</span><span style="max-width:60px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${assigned.name}</span>`
    : `<span>שיוך</span>`;
  const btnStyle = assigned
    ? 'background:var(--pesach-50);color:var(--pesach-700);'
    : 'background:#f9fafb;color:#9ca3af;';
  return `
    <div class="pc-assignee-wrap" style="position:relative;">
      <button
        data-action="toggle-assignee"
        style="display:flex;align-items:center;gap:0.25rem;font-size:0.75rem;border-radius:0.5rem;padding:0.375rem 0.625rem;border:none;cursor:pointer;${btnStyle}"
        title="שיוך למשפחה"
      >
        ${btnContent}
        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
    </div>`;
}

function buildExpandedDetails(task) {
  const hasContent = task.description || task.cleaningTip || task.kasheringGuide;
  const descHtml = task.description
    ? `<p style="font-size:0.75rem;color:#4b5563;line-height:1.5;">${escapeHtml(task.description)}</p>`
    : '';
  const tipHtml = task.cleaningTip
    ? `<div style="display:flex;gap:0.5rem;font-size:0.75rem;">
        <span style="color:var(--pesach-400);flex-shrink:0;margin-top:0.125rem;">💡</span>
        <div><span style="font-weight:600;color:#374151;">טיפ: </span><span style="color:#4b5563;">${escapeHtml(task.cleaningTip)}</span></div>
       </div>`
    : '';
  const kasherHtml = task.kasheringGuide
    ? `<div style="display:flex;gap:0.5rem;font-size:0.75rem;">
        <span style="color:var(--pesach-500);flex-shrink:0;margin-top:0.125rem;">📋</span>
        <div><span style="font-weight:600;color:#374151;">הכשרה: </span><span style="color:#4b5563;">${escapeHtml(task.kasheringGuide)}</span></div>
       </div>`
    : '';
  const noInfoHtml = !hasContent
    ? `<p style="font-size:0.75rem;color:#9ca3af;">אין מידע נוסף</p>`
    : '';
  const customBadge = task.isCustom ? `<span style="color:var(--pesach-400);">משימה מותאמת</span>` : '';
  return `
    <div class="pc-task-details" style="border-top:1px solid var(--pesach-50);padding:0.75rem 1rem;background:rgba(254,247,236,0.4);display:flex;flex-direction:column;gap:0.5rem;">
      ${descHtml}
      ${tipHtml}
      ${kasherHtml}
      ${noInfoHtml}
      <div style="display:flex;align-items:center;gap:0.75rem;font-size:0.6875rem;color:#9ca3af;padding-top:0.25rem;">
        <span>${statusLabels[task.status]}</span>
        ${customBadge}
      </div>
    </div>`;
}

function buildTaskCard(task, familyMembers, expanded) {
  const isDone = task.status === 'done';
  const nameStyle = isDone
    ? 'text-decoration:line-through;color:#9ca3af;'
    : 'color:#1f2937;';
  const cardOpacity = isDone ? 'opacity:0.6;' : '';
  const detailsHtml = expanded ? buildExpandedDetails(task) : '';

  return `
    <div class="pc-task-card" data-task-id="${task.id}" style="background:white;border-radius:0.75rem;border:1px solid var(--pesach-100);box-shadow:0 1px 3px rgba(0,0,0,0.08);transition:all 0.2s;${cardOpacity}">
      <div style="padding:0.75rem 1rem;">
        <div style="display:flex;align-items:flex-start;gap:0.75rem;">
          ${buildCircleBtn(task.status)}
          <div class="pc-task-content" data-action="toggle-expand" style="flex:1;min-width:0;cursor:pointer;">
            <div style="display:flex;align-items:center;gap:0.375rem;flex-wrap:wrap;margin-bottom:0.375rem;">
              <span style="font-weight:600;font-size:0.875rem;${nameStyle}">${escapeHtml(task.name)}</span>
              ${buildPriorityBadge(task.priority)}
            </div>
            <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
              ${buildDifficultyDots(task.difficulty)}
              ${buildTimeBadge(task.timeEstimateMinutes)}
              ${buildAgeBadge(task.ageRange.min, task.ageRange.max)}
            </div>
          </div>
          <div style="flex-shrink:0;">
            ${buildAssigneeSection(task, familyMembers)}
          </div>
        </div>
      </div>
      ${detailsHtml}
    </div>`;
}

function buildRoomSection(room, tasks, familyMembers, collapsed, expandedTaskId) {
  const roomDone = tasks.filter(t => t.status === 'done').length;
  const pct = tasks.length > 0 ? (roomDone / tasks.length) * 100 : 0;
  const chevronTransform = collapsed ? 'rotate(0deg)' : 'rotate(90deg)';

  const tasksHtml = collapsed
    ? ''
    : `<div class="pc-room-tasks" style="margin-top:0.5rem;margin-right:0.5rem;display:flex;flex-direction:column;gap:0.5rem;">
        ${tasks.map(t => buildTaskCard(t, familyMembers, expandedTaskId === t.id)).join('')}
       </div>`;

  return `
    <div class="pc-room-section" data-room="${room}">
      <button
        class="pc-room-header"
        data-action="toggle-room"
        style="width:100%;display:flex;align-items:center;gap:0.5rem;padding:0.625rem 0.75rem;background:white;border-radius:0.75rem;border:1px solid var(--pesach-100);box-shadow:0 1px 3px rgba(0,0,0,0.06);cursor:pointer;text-align:right;"
      >
        <svg style="width:1rem;height:1rem;transition:transform 0.2s;transform:${chevronTransform};flex-shrink:0;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
        </svg>
        <span style="font-weight:700;font-size:0.875rem;color:var(--pesach-800);">${RoomLabels[room]}</span>
        <span style="font-size:0.6875rem;color:#9ca3af;margin-right:auto;">${roomDone}/${tasks.length}</span>
        <div style="width:4rem;height:0.375rem;border-radius:9999px;background:var(--pesach-100);overflow:hidden;">
          <div style="height:100%;border-radius:9999px;background:var(--pesach-400);transition:width 0.3s;width:${pct}%;"></div>
        </div>
      </button>
      ${tasksHtml}
    </div>`;
}

function buildFilterBar(state, filters) {
  const { roomFilter, priorityFilter, statusFilter, assigneeFilter } = filters;

  // Rooms that actually have tasks
  const activeRooms = ROOM_ORDER.filter(r => state.tasks.some(t => t.room === r));

  const filteredCount = getFilteredTasks(state.tasks, filters);
  const doneCount = filteredCount.filter(t => t.status === 'done').length;

  const roomOptions = activeRooms.map(r =>
    `<option value="${r}" ${roomFilter === r ? 'selected' : ''}>${RoomLabels[r]}</option>`
  ).join('');

  const memberOptions = state.familyMembers.map(m =>
    `<option value="${m.id}" ${assigneeFilter === m.id ? 'selected' : ''}>${m.emoji} ${m.name}</option>`
  ).join('');

  const selectStyle = 'border-radius:0.5rem;border:1px solid var(--pesach-200);background:white;font-size:0.875rem;padding:0.5rem 0.75rem;color:#374151;cursor:pointer;';

  return `
    <div style="display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center;margin-bottom:1rem;">
      <select data-filter="room" style="${selectStyle}">
        <option value="all" ${roomFilter === 'all' ? 'selected' : ''}>כל החדרים</option>
        ${roomOptions}
      </select>
      <select data-filter="priority" style="${selectStyle}">
        <option value="all" ${priorityFilter === 'all' ? 'selected' : ''}>כל העדיפויות</option>
        <option value="critical" ${priorityFilter === 'critical' ? 'selected' : ''}>קריטי</option>
        <option value="important" ${priorityFilter === 'important' ? 'selected' : ''}>חשוב</option>
        <option value="nice-to-have" ${priorityFilter === 'nice-to-have' ? 'selected' : ''}>נחמד</option>
      </select>
      <select data-filter="status" style="${selectStyle}">
        <option value="all" ${statusFilter === 'all' ? 'selected' : ''}>כל הסטטוסים</option>
        <option value="pending" ${statusFilter === 'pending' ? 'selected' : ''}>ממתינות</option>
        <option value="in-progress" ${statusFilter === 'in-progress' ? 'selected' : ''}>בביצוע</option>
        <option value="done" ${statusFilter === 'done' ? 'selected' : ''}>הושלמו</option>
      </select>
      <select data-filter="assignee" style="${selectStyle}">
        <option value="all" ${assigneeFilter === 'all' ? 'selected' : ''}>כל המשויכים</option>
        <option value="unassigned" ${assigneeFilter === 'unassigned' ? 'selected' : ''}>לא משויך</option>
        ${memberOptions}
      </select>
      <span style="font-size:0.875rem;color:#6b7280;font-weight:500;margin-right:auto;">${doneCount}/${filteredCount.length} הושלמו</span>
    </div>`;
}

function buildEmptyState(hasActiveFilters) {
  if (hasActiveFilters) {
    return `
      <div style="background:white;border-radius:1rem;border:1px solid var(--pesach-100);box-shadow:0 1px 3px rgba(0,0,0,0.08);text-align:center;padding:3rem 1.5rem;">
        <span style="font-size:2.5rem;display:block;margin-bottom:0.75rem;">🔍</span>
        <p style="font-size:0.875rem;color:#6b7280;margin:0 0 0.25rem;">אין משימות התואמות את הסינון</p>
        <p style="font-size:0.75rem;color:#9ca3af;margin:0;">נסו לשנות את הפילטרים או לאפס אותם</p>
      </div>`;
  }
  return `
    <div style="background:white;border-radius:1rem;border:1px solid var(--pesach-100);box-shadow:0 1px 3px rgba(0,0,0,0.08);text-align:center;padding:3rem 1.5rem;">
      <span style="font-size:2.5rem;display:block;margin-bottom:0.75rem;">✨</span>
      <p style="font-size:0.875rem;color:#6b7280;margin:0 0 0.25rem;">אין משימות להצגה</p>
      <p style="font-size:0.75rem;color:#9ca3af;margin:0;">לחצו על + להוספת משימה חדשה</p>
    </div>`;
}

function buildAddTaskModal(difficulty, familyMembers) {
  const diffBtns = [1, 2, 3, 4, 5].map(d => {
    const active = d <= difficulty;
    const style = active
      ? 'background:var(--pesach-500);color:white;'
      : 'background:#f3f4f6;color:#9ca3af;';
    return `<button type="button" data-diff="${d}" style="width:2.5rem;height:2.5rem;border-radius:0.5rem;border:none;cursor:pointer;font-size:0.875rem;font-weight:600;${style}">${d}</button>`;
  }).join('');

  const roomOptions = ROOM_ORDER.map(r =>
    `<option value="${r}" ${r === Room.Kitchen ? 'selected' : ''}>${RoomLabels[r]}</option>`
  ).join('');

  const inputStyle = 'width:100%;border-radius:0.5rem;border:1px solid var(--pesach-200);font-size:0.875rem;padding:0.625rem 0.75rem;box-sizing:border-box;font-family:inherit;';

  return `
    <div class="pc-modal-overlay" id="add-task-modal">
      <div class="pc-modal" style="max-width:36rem;">
        <div class="pc-modal__header" style="position:sticky;top:0;background:white;border-bottom:1px solid var(--pesach-100);padding:0.75rem 1.25rem;margin:-1.5rem -1rem 1rem;border-radius:1rem 1rem 0 0;z-index:10;">
          <span class="pc-modal__title">משימה חדשה</span>
          <button class="pc-modal__close" id="close-add-modal" style="font-size:1.25rem;">&times;</button>
        </div>

        <div style="padding:0 0.25rem;display:flex;flex-direction:column;gap:1rem;">
          <!-- Name -->
          <div>
            <label style="display:block;font-size:0.875rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">שם המשימה *</label>
            <input id="atm-name" type="text" placeholder="לדוגמה: ניקוי ארון מטבח עליון" style="${inputStyle}"/>
          </div>

          <!-- Description -->
          <div>
            <label style="display:block;font-size:0.875rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">תיאור</label>
            <textarea id="atm-desc" rows="2" placeholder="תיאור קצר של המשימה" style="${inputStyle}resize:vertical;"></textarea>
          </div>

          <!-- Room + Priority -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
            <div>
              <label style="display:block;font-size:0.875rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">חדר</label>
              <select id="atm-room" style="${inputStyle}">${roomOptions}</select>
            </div>
            <div>
              <label style="display:block;font-size:0.875rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">עדיפות</label>
              <select id="atm-priority" style="${inputStyle}">
                <option value="critical">קריטי</option>
                <option value="important" selected>חשוב</option>
                <option value="nice-to-have">נחמד</option>
              </select>
            </div>
          </div>

          <!-- Difficulty -->
          <div>
            <label id="atm-diff-label" style="display:block;font-size:0.875rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">רמת קושי: ${difficulty}</label>
            <div id="atm-diff-row" style="display:flex;gap:0.5rem;">
              ${diffBtns}
            </div>
          </div>

          <!-- Age + Time -->
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.75rem;">
            <div>
              <label style="display:block;font-size:0.875rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">גיל מינימלי</label>
              <input id="atm-age-min" type="number" value="8" min="1" max="99" style="${inputStyle}"/>
            </div>
            <div>
              <label style="display:block;font-size:0.875rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">גיל מקסימלי</label>
              <input id="atm-age-max" type="number" value="99" min="1" max="99" style="${inputStyle}"/>
            </div>
            <div>
              <label style="display:block;font-size:0.875rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">זמן (דק׳)</label>
              <input id="atm-time" type="number" value="20" min="1" style="${inputStyle}"/>
            </div>
          </div>

          <!-- Tip -->
          <div>
            <label style="display:block;font-size:0.875rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">טיפ לניקוי</label>
            <input id="atm-tip" type="text" placeholder="טיפ שימושי (לא חובה)" style="${inputStyle}"/>
          </div>

          <!-- Kashering -->
          <div>
            <label style="display:block;font-size:0.875rem;font-weight:600;color:#374151;margin-bottom:0.25rem;">הנחיית הכשרה</label>
            <input id="atm-kasher" type="text" placeholder="הנחיה להכשרה לפסח (לא חובה)" style="${inputStyle}"/>
          </div>

          <!-- Submit -->
          <button id="atm-submit" disabled style="width:100%;background:#d1d5db;color:white;font-weight:600;border-radius:0.75rem;padding:0.75rem;font-size:0.875rem;border:none;cursor:not-allowed;font-family:inherit;">
            הוספת משימה
          </button>
        </div>
      </div>
    </div>`;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getFilteredTasks(tasks, filters) {
  const { roomFilter, priorityFilter, statusFilter, assigneeFilter } = filters;
  let list = tasks;
  if (roomFilter !== 'all') list = list.filter(t => t.room === roomFilter);
  if (priorityFilter !== 'all') list = list.filter(t => t.priority === priorityFilter);
  if (statusFilter !== 'all') list = list.filter(t => t.status === statusFilter);
  if (assigneeFilter !== 'all') {
    if (assigneeFilter === 'unassigned') {
      list = list.filter(t => !t.assigneeId);
    } else {
      list = list.filter(t => t.assigneeId === assigneeFilter);
    }
  }
  return list;
}

function groupByRoom(tasks) {
  const map = new Map();
  for (const task of tasks) {
    const arr = map.get(task.room) ?? [];
    arr.push(task);
    map.set(task.room, arr);
  }
  for (const [, arr] of map) {
    arr.sort((a, b) =>
      statusOrder[a.status] - statusOrder[b.status] ||
      priorityOrder[a.priority] - priorityOrder[b.priority]
    );
  }
  const result = [];
  for (const room of ROOM_ORDER) {
    const tasks = map.get(room);
    if (tasks && tasks.length > 0) result.push({ room, tasks });
  }
  return result;
}

function hasActiveFilters(filters) {
  return (
    filters.roomFilter !== 'all' ||
    filters.priorityFilter !== 'all' ||
    filters.statusFilter !== 'all' ||
    filters.assigneeFilter !== 'all'
  );
}

// ── Main renderTasks ─────────────────────────────────────────────────────────

export function renderTasks(container) {
  // ── Local UI state ──
  let filters = {
    roomFilter: 'all',
    priorityFilter: 'all',
    statusFilter: 'all',
    assigneeFilter: 'all',
  };
  let collapsedRooms = new Set();
  let expandedTaskId = null;
  let showAddModal = false;
  let modalDifficulty = 2;

  // Track open assignee dropdown
  let openAssigneeTaskId = null;

  // ── Render function ──
  function render() {
    const state = appState.get();
    const filtered = getFilteredTasks(state.tasks, filters);
    const grouped = groupByRoom(filtered);
    const activeFilters = hasActiveFilters(filters);

    const roomSectionsHtml = grouped.length === 0
      ? buildEmptyState(activeFilters)
      : `<div style="display:flex;flex-direction:column;gap:0.75rem;">
          ${grouped.map(({ room, tasks }) =>
            buildRoomSection(
              room,
              tasks,
              state.familyMembers,
              collapsedRooms.has(room),
              expandedTaskId
            )
          ).join('')}
         </div>`;

    const modalHtml = showAddModal ? buildAddTaskModal(modalDifficulty, state.familyMembers) : '';

    container.innerHTML = `
      <div class="pc-content-pad">
        ${buildFilterBar(state, filters)}
        ${roomSectionsHtml}
      </div>

      <!-- FAB -->
      <button class="pc-fab" id="tasks-fab" title="הוספת משימה">
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
      </button>

      ${modalHtml}
    `;

    attachEventListeners(state);
  }

  // ── Event delegation ──
  function attachEventListeners(state) {
    // Filter dropdowns
    container.querySelectorAll('[data-filter]').forEach(sel => {
      sel.addEventListener('change', e => {
        const key = e.target.dataset.filter;
        filters[key + 'Filter'] = e.target.value;
        render();
      });
    });

    // Room collapse toggles
    container.querySelectorAll('[data-action="toggle-room"]').forEach(btn => {
      btn.addEventListener('click', e => {
        const section = btn.closest('[data-room]');
        const room = section?.dataset.room;
        if (!room) return;
        if (collapsedRooms.has(room)) collapsedRooms.delete(room);
        else collapsedRooms.add(room);
        render();
      });
    });

    // Task status toggle (circle button)
    container.querySelectorAll('[data-action="toggle-status"]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const card = btn.closest('[data-task-id]');
        const taskId = card?.dataset.taskId;
        if (!taskId) return;
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return;
        const next = { pending: 'in-progress', 'in-progress': 'done', done: 'pending' };
        updateTask(taskId, { status: next[task.status] });
        // render() will be triggered by state subscription
      });
    });

    // Task expand/collapse (content area)
    container.querySelectorAll('[data-action="toggle-expand"]').forEach(el => {
      el.addEventListener('click', e => {
        const card = el.closest('[data-task-id]');
        const taskId = card?.dataset.taskId;
        if (!taskId) return;
        expandedTaskId = expandedTaskId === taskId ? null : taskId;
        render();
      });
    });

    // Assignee toggle button
    container.querySelectorAll('[data-action="toggle-assignee"]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const card = btn.closest('[data-task-id]');
        const taskId = card?.dataset.taskId;
        if (!taskId) return;

        // Close any already-open dropdown first
        removeAssigneeDropdown();

        if (openAssigneeTaskId === taskId) {
          openAssigneeTaskId = null;
          return;
        }

        openAssigneeTaskId = taskId;
        showAssigneeDropdown(btn, taskId, state);
      });
    });

    // FAB
    const fab = container.querySelector('#tasks-fab');
    if (fab) {
      fab.addEventListener('click', () => {
        showAddModal = true;
        modalDifficulty = 2;
        render();
      });
    }

    // Add task modal
    if (showAddModal) {
      attachModalListeners(state);
    }

    // Close assignee dropdown on outside click
    document.addEventListener('click', onDocumentClick, { once: true });
  }

  function onDocumentClick() {
    if (openAssigneeTaskId) {
      openAssigneeTaskId = null;
      removeAssigneeDropdown();
    }
  }

  function removeAssigneeDropdown() {
    const existing = document.getElementById('assignee-dropdown');
    if (existing) existing.remove();
  }

  function showAssigneeDropdown(triggerBtn, taskId, state) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    const wrap = triggerBtn.closest('.pc-assignee-wrap');
    if (!wrap) return;

    const dropdown = document.createElement('div');
    dropdown.id = 'assignee-dropdown';
    dropdown.style.cssText = 'position:absolute;left:0;top:100%;margin-top:0.25rem;z-index:200;background:white;border-radius:0.5rem;box-shadow:0 4px 16px rgba(0,0,0,0.15);border:1px solid var(--pesach-100);padding:0.25rem 0;min-width:140px;';

    let html = '';
    if (task.assigneeId) {
      html += `<button data-unassign style="width:100%;text-align:right;padding:0.5rem 0.75rem;font-size:0.75rem;color:#9ca3af;background:none;border:none;cursor:pointer;font-family:inherit;">ביטול שיוך</button>`;
    }
    html += state.familyMembers.map(m => {
      const active = m.id === task.assigneeId ? 'background:var(--pesach-50);font-weight:600;' : '';
      return `<button data-assign="${m.id}" style="width:100%;text-align:right;padding:0.5rem 0.75rem;font-size:0.75rem;background:none;border:none;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:0.5rem;${active}"><span>${m.emoji}</span><span>${m.name}</span></button>`;
    }).join('');

    dropdown.innerHTML = html;
    wrap.appendChild(dropdown);

    dropdown.querySelector('[data-unassign]')?.addEventListener('click', e => {
      e.stopPropagation();
      updateTask(taskId, { assigneeId: null });
      openAssigneeTaskId = null;
    });
    dropdown.querySelectorAll('[data-assign]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        updateTask(taskId, { assigneeId: btn.dataset.assign });
        openAssigneeTaskId = null;
      });
    });
  }

  function attachModalListeners(state) {
    const overlay = document.getElementById('add-task-modal');
    if (!overlay) return;

    // Close on backdrop click
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal();
    });

    document.getElementById('close-add-modal')?.addEventListener('click', closeModal);

    // Difficulty buttons
    document.getElementById('atm-diff-row')?.querySelectorAll('[data-diff]').forEach(btn => {
      btn.addEventListener('click', () => {
        modalDifficulty = Number(btn.dataset.diff);
        // Update button styles in place
        document.getElementById('atm-diff-row')?.querySelectorAll('[data-diff]').forEach(b => {
          const d = Number(b.dataset.diff);
          if (d <= modalDifficulty) {
            b.style.background = 'var(--pesach-500)';
            b.style.color = 'white';
          } else {
            b.style.background = '#f3f4f6';
            b.style.color = '#9ca3af';
          }
        });
        const label = document.getElementById('atm-diff-label');
        if (label) label.textContent = `רמת קושי: ${modalDifficulty}`;
      });
    });

    // Enable/disable submit button based on name
    const nameInput = document.getElementById('atm-name');
    const timeInput = document.getElementById('atm-time');
    const submitBtn = document.getElementById('atm-submit');

    function updateSubmitBtn() {
      const nameVal = nameInput?.value.trim() ?? '';
      const timeVal = Number(timeInput?.value ?? 0);
      const canSubmit = nameVal.length > 0 && timeVal > 0;
      if (submitBtn) {
        submitBtn.disabled = !canSubmit;
        submitBtn.style.background = canSubmit ? 'var(--pesach-500)' : '#d1d5db';
        submitBtn.style.cursor = canSubmit ? 'pointer' : 'not-allowed';
      }
    }

    nameInput?.addEventListener('input', updateSubmitBtn);
    timeInput?.addEventListener('input', updateSubmitBtn);

    submitBtn?.addEventListener('click', () => {
      const name = document.getElementById('atm-name')?.value.trim() ?? '';
      const timeVal = Number(document.getElementById('atm-time')?.value ?? 0);
      if (!name || timeVal <= 0) return;

      const newTask = {
        id: `custom-${Date.now()}`,
        name,
        description: document.getElementById('atm-desc')?.value.trim() ?? '',
        room: document.getElementById('atm-room')?.value ?? Room.Kitchen,
        status: 'pending',
        priority: document.getElementById('atm-priority')?.value ?? 'important',
        difficulty: modalDifficulty,
        ageRange: {
          min: Number(document.getElementById('atm-age-min')?.value) || 1,
          max: Number(document.getElementById('atm-age-max')?.value) || 99,
        },
        timeEstimateMinutes: timeVal,
        assigneeId: null,
        cleaningTip: document.getElementById('atm-tip')?.value.trim() ?? '',
        kasheringGuide: document.getElementById('atm-kasher')?.value.trim() ?? '',
        isCustom: true,
        createdAt: new Date().toISOString(),
      };

      addTask(newTask);
      closeModal();
    });
  }

  function closeModal() {
    showAddModal = false;
    modalDifficulty = 2;
    render();
  }

  // ── Subscribe to state changes ──
  const unsubscribe = appState.subscribe(() => {
    render();
  });

  // Initial render
  render();

  // Return cleanup (called by framework or app.js on tab change if supported)
  container._cleanup = () => {
    unsubscribe();
    document.removeEventListener('click', onDocumentClick);
  };
}
