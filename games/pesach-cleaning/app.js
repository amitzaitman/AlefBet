import { defaultRooms, cleaningGuides, kasheringGuides } from './data.js';

const STORAGE_KEY = 'pesach-cleaning-app';

// --- State ---
let state = loadState();

function defaultState() {
  const tasks = [];
  for (const room of defaultRooms) {
    for (const t of room.tasks) {
      tasks.push({
        id: t.id,
        roomId: room.id,
        text: t.text,
        done: false,
        assignee: null,
        guide: t.guide || null,
        custom: false,
      });
    }
  }
  return { tasks, members: [], nextCustomId: 1 };
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge any new default tasks that were added
      const existingIds = new Set(parsed.tasks.map(t => t.id));
      for (const room of defaultRooms) {
        for (const t of room.tasks) {
          if (!existingIds.has(t.id)) {
            parsed.tasks.push({
              id: t.id, roomId: room.id, text: t.text,
              done: false, assignee: null, guide: t.guide || null, custom: false,
            });
          }
        }
      }
      if (!parsed.nextCustomId) parsed.nextCustomId = 1;
      return parsed;
    }
  } catch (e) { /* ignore */ }
  return defaultState();
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// --- Helpers ---
function getRoom(roomId) {
  return defaultRooms.find(r => r.id === roomId);
}

function getTasksByRoom(roomId) {
  return state.tasks.filter(t => t.roomId === roomId);
}

function getTasksByMember(name) {
  return state.tasks.filter(t => t.assignee === name);
}

function getProgress() {
  const total = state.tasks.length;
  const done = state.tasks.filter(t => t.done).length;
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
}

// --- Render Engine ---
const app = document.getElementById('app');
let currentTab = 'rooms';
let openRooms = new Set(defaultRooms.map(r => r.id));
let openPicker = null; // task id with open assignee picker
let guideSubTab = 'cleaning'; // 'cleaning' | 'kashering'

function render() {
  const progress = getProgress();
  app.innerHTML = `
    ${renderHeader()}
    ${renderProgress(progress)}
    ${renderTabs()}
    <div class="tab-content">
      ${currentTab === 'rooms' ? renderRoomsView() : ''}
      ${currentTab === 'members' ? renderMembersView() : ''}
      ${currentTab === 'add' ? renderAddView() : ''}
      ${currentTab === 'guides' ? renderGuidesView() : ''}
    </div>
  `;
  bindEvents();
}

function renderHeader() {
  return `
    <header class="app-header">
      <h1>
        <a href="../../index.html" class="home-link" title="חזרה">🏠</a>
        🧹 ניקיון פסח
      </h1>
      <div class="header-actions">
        <button class="header-btn" id="btn-reset" title="איפוס">🔄</button>
      </div>
    </header>
  `;
}

function renderProgress(progress) {
  const circumference = 2 * Math.PI * 23;
  const offset = circumference - (progress.pct / 100) * circumference;
  return `
    <div class="progress-summary">
      <div class="progress-ring">
        <svg viewBox="0 0 56 56">
          <circle class="ring-bg" cx="28" cy="28" r="23"/>
          <circle class="ring-fill" cx="28" cy="28" r="23"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${offset}"/>
        </svg>
        <span class="progress-pct">${progress.pct}%</span>
      </div>
      <div class="progress-info">
        <div class="label">התקדמות כללית</div>
        <div class="numbers">${progress.done} מתוך ${progress.total} משימות</div>
      </div>
    </div>
  `;
}

function renderTabs() {
  const tabs = [
    { id: 'rooms', label: '🏠 חדרים', },
    { id: 'members', label: '👥 בני בית', },
    { id: 'add', label: '➕ הוספה', },
    { id: 'guides', label: '📖 הדרכות', },
  ];
  return `
    <nav class="tab-nav">
      ${tabs.map(t => `
        <button data-tab="${t.id}" class="${currentTab === t.id ? 'active' : ''}">${t.label}</button>
      `).join('')}
    </nav>
  `;
}

// --- Rooms View ---
function renderRoomsView() {
  // Filter bar for members
  let filterHtml = '';
  if (state.members.length > 0) {
    filterHtml = `
      <div class="filter-bar">
        <button class="filter-chip ${!state._filterMember ? 'active' : ''}" data-filter="">הכל</button>
        ${state.members.map(m => `
          <button class="filter-chip ${state._filterMember === m ? 'active' : ''}" data-filter="${m}">${m}</button>
        `).join('')}
        <button class="filter-chip ${state._filterMember === '__unassigned' ? 'active' : ''}" data-filter="__unassigned">לא משובץ</button>
      </div>
    `;
  }

  return filterHtml + defaultRooms.map(room => {
    const tasks = getTasksByRoom(room.id);
    let filtered = tasks;
    if (state._filterMember === '__unassigned') {
      filtered = tasks.filter(t => !t.assignee);
    } else if (state._filterMember) {
      filtered = tasks.filter(t => t.assignee === state._filterMember);
    }
    if (state._filterMember && filtered.length === 0) return '';

    const done = tasks.filter(t => t.done).length;
    const isOpen = openRooms.has(room.id);
    const allDone = done === tasks.length && tasks.length > 0;

    return `
      <div class="room-section">
        <div class="room-header ${isOpen ? 'open' : ''}" data-room="${room.id}">
          <span class="room-emoji">${room.emoji}</span>
          <span class="room-name">${room.name}</span>
          <span class="room-count ${allDone ? 'all-done' : ''}">${done}/${tasks.length}</span>
          <span class="chevron">◀</span>
        </div>
        ${isOpen ? `<div class="task-list">${filtered.map(t => renderTask(t, room)).join('')}</div>` : ''}
      </div>
    `;
  }).join('');
}

function renderTask(task, room) {
  const assigneeHtml = task.assignee
    ? `<span class="task-assignee" data-task="${task.id}" title="שנה משובץ">${task.assignee}</span>`
    : (state.members.length > 0
      ? `<span class="task-assignee" data-task="${task.id}" style="opacity:0.5" title="שבץ מישהו">+ שיבוץ</span>`
      : '');

  const guideHtml = task.guide
    ? `<button class="task-guide-btn" data-guide="${task.guide}">💡 הדרכה</button>`
    : '';

  return `
    <div class="task-item ${task.done ? 'done' : ''} ${task.custom ? 'task-custom' : ''}" style="position:relative">
      <div class="task-check" data-task-toggle="${task.id}">${task.done ? '✓' : ''}</div>
      <div class="task-body">
        <div class="task-text">${task.text}</div>
        <div class="task-meta">${assigneeHtml}${guideHtml}</div>
      </div>
      <div class="task-actions">
        ${task.custom ? `<button class="task-action-btn" data-delete-task="${task.id}" title="מחק">🗑️</button>` : ''}
      </div>
      ${openPicker === task.id ? renderAssigneePicker(task) : ''}
    </div>
  `;
}

function renderAssigneePicker(task) {
  return `
    <div class="assignee-picker">
      <button data-assign="${task.id}" data-member="">${task.assignee ? 'ללא שיבוץ' : '—'}</button>
      ${state.members.map(m => `
        <button data-assign="${task.id}" data-member="${m}" class="${task.assignee === m ? 'current' : ''}">${m}</button>
      `).join('')}
    </div>
  `;
}

// --- Members View ---
function renderMembersView() {
  // Members management
  let html = `
    <div class="members-manage">
      <h3>👥 ניהול בני בית</h3>
      <div style="margin-bottom:12px">
        ${state.members.map(m => `
          <span class="member-chip">${m}<button class="remove-member" data-remove-member="${m}">✕</button></span>
        `).join('')}
        ${state.members.length === 0 ? '<p style="color:var(--text-muted);font-size:14px">עדיין לא הוספתם בני בית</p>' : ''}
      </div>
      <div class="form-row">
        <input class="form-input" id="new-member-input" placeholder="שם בן/בת בית..." maxlength="20">
        <button class="btn btn-primary btn-sm" id="add-member-btn">הוסף</button>
      </div>
    </div>
  `;

  // Per-member task breakdown
  if (state.members.length === 0) {
    html += `<div class="empty-state"><div class="emoji">👆</div><p>הוסיפו בני בית כדי לשבץ משימות</p></div>`;
  } else {
    for (const member of state.members) {
      const tasks = getTasksByMember(member);
      const done = tasks.filter(t => t.done).length;
      html += `
        <div class="member-card">
          <div class="member-card-header">
            <div class="member-avatar">${member[0]}</div>
            <div class="member-name">${member}</div>
            <div class="member-stats">${done}/${tasks.length}</div>
          </div>
          ${tasks.length === 0
            ? '<p style="color:var(--text-muted);font-size:14px;text-align:center;padding:8px">אין משימות משובצות</p>'
            : tasks.map(t => {
              const room = getRoom(t.roomId);
              return `
                <div class="member-task-item">
                  <div class="task-check" data-task-toggle="${t.id}" style="width:24px;height:24px;font-size:12px">${t.done ? '✓' : ''}</div>
                  <div style="flex:1">
                    <div class="task-text" style="font-size:14px;${t.done ? 'text-decoration:line-through;color:var(--text-muted)' : ''}">${t.text}</div>
                    <div class="member-task-room">${room ? room.emoji + ' ' + room.name : ''}</div>
                  </div>
                </div>
              `;
            }).join('')}
        </div>
      `;
    }

    // Unassigned tasks count
    const unassigned = state.tasks.filter(t => !t.assignee);
    if (unassigned.length > 0) {
      html += `<p style="text-align:center;color:var(--text-muted);font-size:14px;margin-top:8px">📌 ${unassigned.length} משימות עדיין לא שובצו</p>`;
    }
  }

  return html;
}

// --- Add View ---
function renderAddView() {
  return `
    <div class="add-form">
      <h3>➕ הוספת משימה חדשה</h3>
      <div class="form-row">
        <input class="form-input" id="new-task-input" placeholder="תיאור המשימה...">
      </div>
      <div class="form-row">
        <select class="form-select" id="new-task-room">
          ${defaultRooms.map(r => `<option value="${r.id}">${r.emoji} ${r.name}</option>`).join('')}
        </select>
        <select class="form-select" id="new-task-assignee">
          <option value="">ללא שיבוץ</option>
          ${state.members.map(m => `<option value="${m}">${m}</option>`).join('')}
        </select>
      </div>
      <button class="btn btn-success" id="add-task-btn">הוסף משימה</button>
    </div>

    <div class="add-form">
      <h3>👤 הוספת בן/בת בית</h3>
      <div class="form-row">
        <input class="form-input" id="new-member-input-2" placeholder="שם..." maxlength="20">
        <button class="btn btn-primary" id="add-member-btn-2">הוסף</button>
      </div>
    </div>
  `;
}

// --- Guides View ---
function renderGuidesView() {
  return `
    <div class="guide-tabs">
      <button class="guide-tab-btn ${guideSubTab === 'cleaning' ? 'active' : ''}" data-guide-tab="cleaning">🧹 ניקיון מעשי</button>
      <button class="guide-tab-btn ${guideSubTab === 'kashering' ? 'active' : ''}" data-guide-tab="kashering">📜 הכשרה לפסח</button>
    </div>
    ${guideSubTab === 'cleaning' ? renderCleaningGuides() : renderKasheringGuides()}
  `;
}

function renderCleaningGuides() {
  return cleaningGuides.map(g => `
    <div class="guide-card" data-guide-id="${g.id}">
      <h3>${g.title}</h3>
      <div class="guide-steps">
        <ol>${g.steps.map(s => `<li>${s}</li>`).join('')}</ol>
      </div>
    </div>
  `).join('');
}

function renderKasheringGuides() {
  return kasheringGuides.map(g => `
    <div class="guide-card" data-guide-id="${g.id}">
      <h3>${g.emoji} ${g.title}</h3>
      <div class="guide-content">${formatGuideContent(g.content)}</div>
    </div>
  `).join('');
}

function formatGuideContent(text) {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

// --- Event Binding ---
function bindEvents() {
  // Tab navigation
  app.querySelectorAll('.tab-nav button[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentTab = btn.dataset.tab;
      render();
    });
  });

  // Room collapse/expand
  app.querySelectorAll('.room-header[data-room]').forEach(el => {
    el.addEventListener('click', () => {
      const roomId = el.dataset.room;
      if (openRooms.has(roomId)) openRooms.delete(roomId);
      else openRooms.add(roomId);
      render();
    });
  });

  // Task toggle done
  app.querySelectorAll('[data-task-toggle]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const taskId = el.dataset.taskToggle;
      const task = state.tasks.find(t => t.id === taskId);
      if (task) {
        task.done = !task.done;
        saveState();
        // Quick animation
        const item = el.closest('.task-item, .member-task-item');
        if (item && task.done) item.classList.add('celebrate');
        render();
      }
    });
  });

  // Assignee picker open
  app.querySelectorAll('.task-assignee[data-task]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      openPicker = openPicker === el.dataset.task ? null : el.dataset.task;
      render();
    });
  });

  // Assignee selection
  app.querySelectorAll('[data-assign]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const taskId = el.dataset.assign;
      const member = el.dataset.member || null;
      const task = state.tasks.find(t => t.id === taskId);
      if (task) {
        task.assignee = member;
        saveState();
      }
      openPicker = null;
      render();
    });
  });

  // Close picker on outside click
  document.addEventListener('click', () => {
    if (openPicker) {
      openPicker = null;
      render();
    }
  }, { once: true });

  // Filter by member
  app.querySelectorAll('.filter-chip[data-filter]').forEach(el => {
    el.addEventListener('click', () => {
      const val = el.dataset.filter;
      state._filterMember = val || null;
      render();
    });
  });

  // Add member (both in members view and add view)
  const bindAddMember = (inputId, btnId) => {
    const input = app.querySelector(`#${inputId}`);
    const btn = app.querySelector(`#${btnId}`);
    if (!input || !btn) return;
    const doAdd = () => {
      const name = input.value.trim();
      if (name && !state.members.includes(name)) {
        state.members.push(name);
        saveState();
        render();
      }
    };
    btn.addEventListener('click', doAdd);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') doAdd(); });
  };
  bindAddMember('new-member-input', 'add-member-btn');
  bindAddMember('new-member-input-2', 'add-member-btn-2');

  // Remove member
  app.querySelectorAll('[data-remove-member]').forEach(el => {
    el.addEventListener('click', () => {
      const name = el.dataset.removeMember;
      state.members = state.members.filter(m => m !== name);
      // Unassign from tasks
      state.tasks.forEach(t => { if (t.assignee === name) t.assignee = null; });
      saveState();
      render();
    });
  });

  // Add task
  const addTaskBtn = app.querySelector('#add-task-btn');
  const addTaskInput = app.querySelector('#new-task-input');
  if (addTaskBtn && addTaskInput) {
    const doAddTask = () => {
      const text = addTaskInput.value.trim();
      if (!text) return;
      const roomId = app.querySelector('#new-task-room').value;
      const assignee = app.querySelector('#new-task-assignee').value || null;
      state.tasks.push({
        id: `custom-${state.nextCustomId++}`,
        roomId,
        text,
        done: false,
        assignee,
        guide: null,
        custom: true,
      });
      saveState();
      addTaskInput.value = '';
      render();
    };
    addTaskBtn.addEventListener('click', doAddTask);
    addTaskInput.addEventListener('keydown', e => { if (e.key === 'Enter') doAddTask(); });
  }

  // Delete custom task
  app.querySelectorAll('[data-delete-task]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const taskId = el.dataset.deleteTask;
      state.tasks = state.tasks.filter(t => t.id !== taskId);
      saveState();
      render();
    });
  });

  // Guide cards toggle
  app.querySelectorAll('.guide-card[data-guide-id]').forEach(el => {
    el.addEventListener('click', () => {
      el.classList.toggle('open');
    });
  });

  // Guide sub-tabs
  app.querySelectorAll('[data-guide-tab]').forEach(el => {
    el.addEventListener('click', () => {
      guideSubTab = el.dataset.guideTab;
      render();
    });
  });

  // Guide button in task
  app.querySelectorAll('.task-guide-btn[data-guide]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      currentTab = 'guides';
      guideSubTab = 'cleaning';
      render();
      // Open the relevant guide
      setTimeout(() => {
        const card = app.querySelector(`[data-guide-id="${el.dataset.guide}"]`);
        if (card) {
          card.classList.add('open');
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    });
  });

  // Reset
  const resetBtn = app.querySelector('#btn-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      showResetModal();
    });
  }
}

function showResetModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <h2>🔄 איפוס נתונים</h2>
      <p>האם לאפס את כל הנתונים? כל הסימונים, השיבוצים והמשימות שהוספתם יימחקו.</p>
      <div class="modal-actions">
        <button class="btn btn-danger" id="confirm-reset">כן, אפס</button>
        <button class="btn" id="cancel-reset" style="background:var(--border)">ביטול</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('#confirm-reset').addEventListener('click', () => {
    state = defaultState();
    saveState();
    overlay.remove();
    render();
  });

  overlay.querySelector('#cancel-reset').addEventListener('click', () => {
    overlay.remove();
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });
}

// --- Init ---
render();
