import { appState, addFamilyMember, deleteFamilyMember, updateTask } from '../utils/state.js';
import { RoomLabels } from '../data/default-tasks.js';

// ── Constants ────────────────────────────────────────────────────────────────

const EMOJI_GRID = [
  '👩', '👨', '👧', '👦', '👶', '👵', '👴', '🧑',
  '👸', '🤴', '🧒', '👱', '🧔', '👩‍🦰', '👨‍🦱', '👩‍🦳',
  '🦸', '🦹', '🧙', '🧚', '🧛', '🧜', '🧝', '🧞',
  '👼', '🤠', '🥷', '🧑‍🍳', '🧑‍🎓', '🧑‍🏫', '🧑‍⚕️', '🧑‍🚀',
];

const statusOrder = { 'in-progress': 0, pending: 1, done: 2 };

// ── Helpers ──────────────────────────────────────────────────────────────────

function taskMatchesAge(task, age) {
  if (age <= 7) return task.ageRange && task.ageRange.min <= 7;
  if (age <= 12) return task.ageRange && task.ageRange.min <= 12;
  return true;
}

function getMemberTasks(tasks, memberId) {
  return tasks
    .filter(t => t.assigneeId === memberId)
    .sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
}

function getSuggestedTasks(tasks, member) {
  return tasks.filter(t => !t.assigneeId && t.status !== 'done' && taskMatchesAge(t, member.age));
}

// ── HTML Builders ─────────────────────────────────────────────────────────────

function buildCircleBtn(status) {
  if (status === 'done') {
    return `<button class="pc-circle-btn pc-circle-btn--done" data-action="toggle-task-status"
      title="סמן כממתינה"
      style="width:1.5rem;height:1.5rem;color:#16a34a;border-color:#86efac;background:#f0fdf4;flex-shrink:0;">
      <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
      </svg>
    </button>`;
  }
  if (status === 'in-progress') {
    return `<button class="pc-circle-btn pc-circle-btn--in-progress" data-action="toggle-task-status"
      title="סמן כהושלם"
      style="width:1.5rem;height:1.5rem;color:#2563eb;border-color:#93c5fd;background:#eff6ff;flex-shrink:0;">
      <span style="width:0.375rem;height:0.375rem;border-radius:9999px;background:var(--pesach-500);display:inline-block;"></span>
    </button>`;
  }
  return `<button class="pc-circle-btn pc-circle-btn--pending" data-action="toggle-task-status"
    title="סמן כבביצוע"
    style="width:1.5rem;height:1.5rem;color:#9ca3af;border-color:#d1d5db;background:white;flex-shrink:0;">
  </button>`;
}

function buildTaskRow(task) {
  const isDone = task.status === 'done';
  const nameStyle = isDone
    ? 'text-decoration:line-through;color:#9ca3af;font-size:0.75rem;font-weight:500;'
    : 'color:#374151;font-size:0.75rem;font-weight:500;';
  const rowStyle = isDone
    ? 'display:flex;align-items:center;gap:0.625rem;padding:0.625rem 0.75rem;border-radius:0.5rem;background:#f0fdf4;opacity:0.7;'
    : 'display:flex;align-items:center;gap:0.625rem;padding:0.625rem 0.75rem;border-radius:0.5rem;background:white;';

  return `
    <div style="${rowStyle}" data-task-id="${task.id}">
      ${buildCircleBtn(task.status)}
      <div style="flex:1;min-width:0;">
        <span style="${nameStyle}">${task.name}</span>
        <span style="font-size:0.625rem;color:#9ca3af;margin-right:0.375rem;">(${RoomLabels[task.room] || task.room})</span>
      </div>
      <span style="font-size:0.625rem;color:#9ca3af;flex-shrink:0;">${task.timeEstimateMinutes} דק׳</span>
    </div>`;
}

function buildSuggestedTaskRow(task) {
  const ageMin = task.ageRange ? task.ageRange.min : 0;
  return `
    <div style="display:flex;align-items:center;gap:0.625rem;padding:0.625rem 0.75rem;border-radius:0.5rem;background:var(--pesach-50);" data-suggested-task-id="${task.id}">
      <div style="flex:1;min-width:0;">
        <span style="font-size:0.75rem;font-weight:500;color:#374151;">${task.name}</span>
        <span style="font-size:0.625rem;color:#9ca3af;margin-right:0.375rem;">(${RoomLabels[task.room] || task.room})</span>
        <div style="display:flex;align-items:center;gap:0.375rem;margin-top:0.125rem;">
          <span style="font-size:0.625rem;color:#9ca3af;">${task.timeEstimateMinutes} דק׳</span>
          <span style="font-size:0.625rem;color:var(--pesach-500);">גיל ${ageMin}+</span>
        </div>
      </div>
      <button data-action="assign-task" data-task-id="${task.id}"
        style="font-size:0.6875rem;background:var(--pesach-500);color:white;border:none;border-radius:0.5rem;padding:0.375rem 0.75rem;font-weight:500;cursor:pointer;flex-shrink:0;font-family:inherit;">
        שיוך
      </button>
    </div>`;
}

function buildProgressBar(done, total) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return `
    <div style="display:flex;align-items:center;gap:0.5rem;">
      <div class="pc-progress-bar" style="flex:1;">
        <div class="pc-progress-bar__fill" style="width:${pct}%;"></div>
      </div>
      <span style="font-size:0.75rem;color:var(--pesach-600);font-weight:500;white-space:nowrap;">${pct}%</span>
    </div>`;
}

function buildMemberCard(member, tasks, suggestedTasks, isExpanded, showSuggestions) {
  const doneCount = tasks.filter(t => t.status === 'done').length;

  // Header
  const taskCountHtml = tasks.length > 0
    ? `<div style="text-align:center;padding:0 0.5rem;">
        <span style="display:block;font-size:1.125rem;font-weight:700;color:var(--pesach-600);">${doneCount}/${tasks.length}</span>
        <span style="font-size:0.625rem;color:#9ca3af;">משימות</span>
       </div>`
    : `<span style="font-size:0.75rem;color:#d1d5db;">אין משימות</span>`;

  const chevronRotation = isExpanded ? 'rotate(-90deg)' : 'rotate(0deg)';
  const chevron = `
    <svg style="width:1rem;height:1rem;color:#9ca3af;transition:transform 0.2s;flex-shrink:0;transform:${chevronRotation};"
      fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
    </svg>`;

  let expandedHtml = '';
  if (isExpanded) {
    // Progress bar
    const progressHtml = tasks.length > 0 ? buildProgressBar(doneCount, tasks.length) : '';

    // Tasks grouped by status
    let tasksHtml = '';
    if (tasks.length > 0) {
      const groups = {
        'in-progress': { label: 'בביצוע', items: [] },
        pending: { label: 'ממתינות', items: [] },
        done: { label: 'הושלמו', items: [] },
      };
      for (const t of tasks) {
        if (groups[t.status]) groups[t.status].items.push(t);
      }
      const sections = ['in-progress', 'pending', 'done']
        .filter(s => groups[s].items.length > 0)
        .map(s => {
          const { label, items } = groups[s];
          return `
            <div>
              <p style="font-size:0.6875rem;font-weight:600;color:var(--pesach-600);margin:0 0 0.375rem;padding:0 0.25rem;">
                ${label} (${items.length})
              </p>
              <div style="display:flex;flex-direction:column;gap:0.25rem;">
                ${items.map(buildTaskRow).join('')}
              </div>
            </div>`;
        }).join('');
      tasksHtml = `<div style="display:flex;flex-direction:column;gap:0.75rem;">${sections}</div>`;
    } else {
      tasksHtml = `
        <div style="text-align:center;padding:0.75rem 0;">
          <span style="font-size:1.5rem;display:block;margin-bottom:0.25rem;">📋</span>
          <p style="font-size:0.75rem;color:#9ca3af;margin:0 0 0.125rem;">לא שויכו משימות עדיין</p>
          <p style="font-size:0.6875rem;color:#d1d5db;margin:0;">השתמשו בהצעת משימות למטה או שייכו מעמוד המשימות</p>
        </div>`;
    }

    // Suggest tasks button + section
    const suggestBtnLabel = showSuggestions ? 'הסתר הצעות' : 'הצע משימות מתאימות';
    const suggestChevronRot = showSuggestions ? 'rotate(180deg)' : 'rotate(0deg)';
    let suggestionsHtml = '';
    if (showSuggestions) {
      if (suggestedTasks.length > 0) {
        suggestionsHtml = `
          <div style="display:flex;flex-direction:column;gap:0.25rem;margin-top:0.25rem;">
            ${suggestedTasks.map(buildSuggestedTaskRow).join('')}
          </div>`;
      } else {
        suggestionsHtml = `
          <div style="text-align:center;padding:0.75rem 0;margin-top:0.25rem;">
            <span style="font-size:1.25rem;display:block;margin-bottom:0.25rem;">✅</span>
            <p style="font-size:0.75rem;color:#9ca3af;margin:0;">אין משימות פנויות המתאימות לגיל ${member.age}</p>
          </div>`;
      }
    }

    const suggestSection = `
      <div style="padding-top:0.25rem;display:flex;flex-direction:column;gap:0.5rem;">
        <button data-action="toggle-suggestions" data-member-id="${member.id}"
          style="width:100%;display:flex;align-items:center;justify-content:center;gap:0.375rem;
                 font-size:0.75rem;font-weight:500;color:var(--pesach-600);
                 background:rgba(233,198,140,0.2);border:none;border-radius:0.5rem;
                 padding:0.625rem;cursor:pointer;font-family:inherit;">
          <span>${suggestBtnLabel}</span>
          <svg style="width:0.75rem;height:0.75rem;transition:transform 0.2s;transform:${suggestChevronRot};"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        ${suggestionsHtml}
      </div>`;

    // Remove button
    const removeBtn = `
      <div style="padding-top:0.25rem;border-top:1px solid var(--pesach-100);">
        <button data-action="remove-member" data-member-id="${member.id}"
          style="font-size:0.75rem;color:#f87171;background:none;border:none;cursor:pointer;
                 padding:0.375rem 0;font-family:inherit;">
          הסרת ${member.name} מהמשפחה
        </button>
      </div>`;

    expandedHtml = `
      <div style="border-top:1px solid var(--pesach-50);background:rgba(254,247,236,0.3);
                  padding:0.75rem 1rem;display:flex;flex-direction:column;gap:0.75rem;">
        ${progressHtml}
        ${tasksHtml}
        ${suggestSection}
        ${removeBtn}
      </div>`;
  }

  return `
    <div style="background:white;border-radius:0.75rem;border:1px solid var(--pesach-100);
                box-shadow:0 1px 3px rgba(0,0,0,0.08);overflow:hidden;" data-member-id="${member.id}">
      <div data-action="toggle-member" data-member-id="${member.id}"
        style="padding:1rem;display:flex;align-items:center;gap:0.75rem;cursor:pointer;">
        <span style="font-size:1.875rem;">${member.emoji}</span>
        <div style="flex:1;min-width:0;">
          <p style="font-weight:500;color:#1f2937;font-size:0.875rem;margin:0;">${member.name}</p>
          <p style="font-size:0.75rem;color:#9ca3af;margin:0;">גיל ${member.age}</p>
        </div>
        ${taskCountHtml}
        ${chevron}
      </div>
      ${expandedHtml}
    </div>`;
}

function buildAddForm(formState) {
  const { name, age, emoji } = formState;

  const emojiBtns = EMOJI_GRID.map(e => {
    const isSelected = e === emoji;
    const btnStyle = isSelected
      ? 'background:var(--pesach-200);box-shadow:0 0 0 2px var(--pesach-400);'
      : 'background:#f9fafb;';
    return `<button data-action="select-emoji" data-emoji="${encodeURIComponent(e)}"
      style="font-size:1.25rem;width:2.5rem;height:2.5rem;border-radius:0.5rem;border:none;
             cursor:pointer;display:flex;align-items:center;justify-content:center;${btnStyle}">
      ${e}
    </button>`;
  }).join('');

  const submitDisabled = (!name.trim() || !age) ? 'disabled' : '';
  const submitStyle = (!name.trim() || !age)
    ? 'background:#d1d5db;cursor:not-allowed;'
    : 'background:var(--pesach-500);cursor:pointer;';

  const inputStyle = 'width:100%;border-radius:0.5rem;border:1px solid var(--pesach-200);font-size:0.875rem;padding:0.625rem 0.75rem;box-sizing:border-box;font-family:inherit;';

  return `
    <div style="background:white;border-radius:1rem;border:1px solid var(--pesach-100);
                box-shadow:0 1px 3px rgba(0,0,0,0.08);padding:1rem;
                display:flex;flex-direction:column;gap:0.75rem;">
      <div>
        <label style="display:block;font-size:0.875rem;font-weight:500;color:#374151;margin-bottom:0.25rem;">שם</label>
        <input id="family-name-input" type="text" value="${name}"
          placeholder="שם בן/בת המשפחה"
          style="${inputStyle}"/>
      </div>
      <div>
        <label style="display:block;font-size:0.875rem;font-weight:500;color:#374151;margin-bottom:0.25rem;">גיל</label>
        <input id="family-age-input" type="number" value="${age}" min="1" max="120"
          placeholder="גיל"
          style="width:8rem;border-radius:0.5rem;border:1px solid var(--pesach-200);font-size:0.875rem;padding:0.625rem 0.75rem;box-sizing:border-box;font-family:inherit;"/>
      </div>
      <div>
        <label style="display:block;font-size:0.875rem;font-weight:500;color:#374151;margin-bottom:0.375rem;">אימוג׳י</label>
        <div style="display:grid;grid-template-columns:repeat(8,1fr);gap:0.375rem;">
          ${emojiBtns}
        </div>
      </div>
      <button id="family-submit-btn" data-action="submit-member" ${submitDisabled}
        style="width:100%;color:white;font-weight:500;border:none;border-radius:0.75rem;
               padding:0.625rem;font-size:0.875rem;font-family:inherit;${submitStyle}">
        הוספה למשפחה
      </button>
    </div>`;
}

function buildEmptyState() {
  return `
    <div style="background:white;border-radius:1rem;border:1px solid var(--pesach-100);
                box-shadow:0 1px 3px rgba(0,0,0,0.08);padding:2rem 1rem;text-align:center;">
      <span style="font-size:2.5rem;display:block;margin-bottom:0.75rem;">👨‍👩‍👧‍👦</span>
      <p style="font-size:0.875rem;color:#6b7280;margin:0 0 0.25rem;">עדיין לא הוספתם בני משפחה</p>
      <p style="font-size:0.75rem;color:#9ca3af;margin:0;line-height:1.5;">
        הוסיפו חברי משפחה כדי לשייך משימות ולעקוב אחרי ההתקדמות של כל אחד
      </p>
    </div>`;
}

function buildConfirmDialog(member) {
  return `
    <div id="confirm-delete-overlay"
      style="position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;">
      <div id="confirm-delete-backdrop"
        style="position:absolute;inset:0;background:rgba(0,0,0,0.4);"></div>
      <div style="position:relative;background:white;border-radius:1rem;box-shadow:0 8px 32px rgba(0,0,0,0.2);
                  padding:1.5rem;margin:1rem;max-width:22rem;width:100%;text-align:center;
                  display:flex;flex-direction:column;gap:1rem;">
        <p style="font-size:0.875rem;color:#374151;line-height:1.6;margin:0;">
          להסיר את ${member.emoji} ${member.name} מהמשפחה? כל המשימות שלו/ה יבוטלו.
        </p>
        <div style="display:flex;gap:0.75rem;justify-content:center;">
          <button id="confirm-cancel-btn"
            style="padding:0.625rem 1.25rem;border-radius:0.75rem;font-size:0.875rem;
                   font-weight:500;background:#f3f4f6;color:#6b7280;border:none;cursor:pointer;font-family:inherit;">
            ביטול
          </button>
          <button id="confirm-delete-btn" data-member-id="${member.id}"
            style="padding:0.625rem 1.25rem;border-radius:0.75rem;font-size:0.875rem;
                   font-weight:500;background:#ef4444;color:white;border:none;cursor:pointer;font-family:inherit;">
            הסרה
          </button>
        </div>
      </div>
    </div>`;
}

// ── Main export ───────────────────────────────────────────────────────────────

export function renderFamily(container) {
  // ── Local UI state ──
  let showForm = false;
  let expandedMemberId = null;
  let confirmDeleteId = null;
  let showSuggestionsFor = new Set(); // Set of member IDs with suggestions open
  let formState = { name: '', age: '', emoji: EMOJI_GRID[0] };

  // ── Render function ──
  function render() {
    const state = appState.get();
    const { familyMembers, tasks } = state;

    // Header
    const headerHtml = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;">
        <h2 style="font-size:1.125rem;font-weight:700;color:var(--pesach-800);margin:0;">בני המשפחה</h2>
        <button data-action="toggle-form"
          style="background:var(--pesach-500);color:white;font-size:0.875rem;font-weight:500;
                 border:none;border-radius:0.75rem;padding:0.625rem 1rem;cursor:pointer;font-family:inherit;">
          ${showForm ? 'ביטול' : '+ הוספה'}
        </button>
      </div>`;

    // Form
    const formHtml = showForm ? buildAddForm(formState) : '';

    // Member list or empty state
    let membersHtml = '';
    if (familyMembers.length === 0 && !showForm) {
      membersHtml = buildEmptyState();
    } else if (familyMembers.length > 0) {
      membersHtml = `
        <div style="display:flex;flex-direction:column;gap:0.625rem;">
          ${familyMembers.map(member => {
            const memberTasks = getMemberTasks(tasks, member.id);
            const suggestedTasks = getSuggestedTasks(tasks, member);
            const isExpanded = expandedMemberId === member.id;
            const showSuggestions = showSuggestionsFor.has(member.id);
            return buildMemberCard(member, memberTasks, suggestedTasks, isExpanded, showSuggestions);
          }).join('')}
        </div>`;
    }

    // Confirm delete dialog
    let confirmHtml = '';
    if (confirmDeleteId) {
      const member = familyMembers.find(m => m.id === confirmDeleteId);
      if (member) confirmHtml = buildConfirmDialog(member);
    }

    container.innerHTML = `
      <div class="pc-content-pad" style="display:flex;flex-direction:column;gap:0.75rem;">
        ${headerHtml}
        ${formHtml}
        ${membersHtml}
      </div>
      ${confirmHtml}`;

    attachEventListeners();
  }

  // ── Event listeners ──
  function attachEventListeners() {
    // Toggle add-form
    const toggleFormBtn = container.querySelector('[data-action="toggle-form"]');
    if (toggleFormBtn) {
      toggleFormBtn.addEventListener('click', () => {
        showForm = !showForm;
        if (!showForm) formState = { name: '', age: '', emoji: EMOJI_GRID[0] };
        render();
      });
    }

    // Name input (live update to enable/disable submit)
    const nameInput = container.querySelector('#family-name-input');
    if (nameInput) {
      nameInput.addEventListener('input', e => {
        formState.name = e.target.value;
        // Update submit button state without full re-render
        const submitBtn = container.querySelector('#family-submit-btn');
        if (submitBtn) {
          const enabled = formState.name.trim() && formState.age;
          submitBtn.disabled = !enabled;
          submitBtn.style.background = enabled ? 'var(--pesach-500)' : '#d1d5db';
          submitBtn.style.cursor = enabled ? 'pointer' : 'not-allowed';
        }
      });
    }

    // Age input
    const ageInput = container.querySelector('#family-age-input');
    if (ageInput) {
      ageInput.addEventListener('input', e => {
        formState.age = e.target.value;
        const submitBtn = container.querySelector('#family-submit-btn');
        if (submitBtn) {
          const enabled = formState.name.trim() && formState.age;
          submitBtn.disabled = !enabled;
          submitBtn.style.background = enabled ? 'var(--pesach-500)' : '#d1d5db';
          submitBtn.style.cursor = enabled ? 'pointer' : 'not-allowed';
        }
      });
    }

    // Emoji selection
    container.querySelectorAll('[data-action="select-emoji"]').forEach(btn => {
      btn.addEventListener('click', e => {
        const rawEmoji = btn.dataset.emoji;
        formState.emoji = decodeURIComponent(rawEmoji);
        // Re-render only the emoji grid area (full render to update selection)
        render();
        // Restore form input values after re-render
        const ni = container.querySelector('#family-name-input');
        const ai = container.querySelector('#family-age-input');
        if (ni) ni.value = formState.name;
        if (ai) ai.value = formState.age;
      });
    });

    // Submit new member
    const submitBtn = container.querySelector('[data-action="submit-member"]');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const { name, age, emoji } = formState;
        if (!name.trim() || !age) return;
        addFamilyMember({
          id: 'member-' + Date.now(),
          name: name.trim(),
          age: Number(age),
          emoji,
        });
        formState = { name: '', age: '', emoji: EMOJI_GRID[0] };
        showForm = false;
        // render() triggered by state subscription
      });
    }

    // Toggle member expand/collapse
    container.querySelectorAll('[data-action="toggle-member"]').forEach(el => {
      el.addEventListener('click', () => {
        const memberId = el.dataset.memberId;
        expandedMemberId = expandedMemberId === memberId ? null : memberId;
        render();
      });
    });

    // Toggle suggestions panel
    container.querySelectorAll('[data-action="toggle-suggestions"]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const memberId = btn.dataset.memberId;
        if (showSuggestionsFor.has(memberId)) {
          showSuggestionsFor.delete(memberId);
        } else {
          showSuggestionsFor.add(memberId);
        }
        render();
      });
    });

    // Toggle task status (cycle: pending → in-progress → done → pending)
    container.querySelectorAll('[data-action="toggle-task-status"]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const row = btn.closest('[data-task-id]');
        const taskId = row?.dataset.taskId;
        if (!taskId) return;
        const state = appState.get();
        const task = state.tasks.find(t => t.id === taskId);
        if (!task) return;
        const next = { pending: 'in-progress', 'in-progress': 'done', done: 'pending' };
        updateTask(taskId, { status: next[task.status] });
        // render() triggered by state subscription
      });
    });

    // Assign suggested task
    container.querySelectorAll('[data-action="assign-task"]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const taskId = btn.dataset.taskId;
        const row = btn.closest('[data-member-id]');
        const memberId = row?.dataset.memberId;
        if (!taskId || !memberId) return;
        updateTask(taskId, { assigneeId: memberId });
        // render() triggered by state subscription
      });
    });

    // Remove member button (open confirm dialog)
    container.querySelectorAll('[data-action="remove-member"]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        confirmDeleteId = btn.dataset.memberId;
        render();
      });
    });

    // Confirm dialog — cancel
    const cancelBtn = container.querySelector('#confirm-cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        confirmDeleteId = null;
        render();
      });
    }

    // Confirm dialog — backdrop click = cancel
    const backdrop = container.querySelector('#confirm-delete-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => {
        confirmDeleteId = null;
        render();
      });
    }

    // Confirm dialog — confirm delete
    const confirmBtn = container.querySelector('#confirm-delete-btn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        const memberId = confirmBtn.dataset.memberId;
        if (!memberId) return;
        const state = appState.get();
        // Unassign all tasks from this member
        for (const task of state.tasks) {
          if (task.assigneeId === memberId) {
            updateTask(task.id, { assigneeId: null });
          }
        }
        deleteFamilyMember(memberId);
        if (expandedMemberId === memberId) expandedMemberId = null;
        showSuggestionsFor.delete(memberId);
        confirmDeleteId = null;
        // render() triggered by state subscription
      });
    }
  }

  // ── Initial render ──
  render();

  // ── Subscribe to state changes ──
  const unsub = appState.subscribe(() => render());

  // ── Cleanup ──
  container._cleanup = () => unsub();
}
