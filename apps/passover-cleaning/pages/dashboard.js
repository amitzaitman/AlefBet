import { appState } from '../utils/state.js';
import { RoomLabels } from '../data/default-tasks.js';

// ── Helpers ────────────────────────────────────────────────────────────────

function getPesachCountdown(pesachDate) {
  const seder = new Date(pesachDate + 'T18:00:00');
  const diff = seder.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, passed: true };
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  return { days, hours, minutes, passed: false };
}

function getMotivation(pct) {
  if (pct >= 100) return { emoji: '🎉', text: 'מדהים! סיימתם הכול — חג פסח שמח!' };
  if (pct >= 75)  return { emoji: '🔥', text: 'כמעט שם! עוד קצת מאמץ וסיימתם!' };
  if (pct >= 50)  return { emoji: '💪', text: 'עברתם את חצי הדרך — כל הכבוד!' };
  if (pct >= 25)  return { emoji: '🌟', text: 'התחלה טובה — ממשיכים בקצב!' };
  return { emoji: '🧹', text: 'כל משימה שמסיימים מקרבת אותנו לחג נקי ושמח!' };
}

function formatRemainingTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} דקות`;
  if (m === 0) return `${h} שעות`;
  return `${h} שע׳ ו-${m} דק׳`;
}

function computeStats(tasks) {
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const pending = total - done - inProgress;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const remainingMinutes = tasks
    .filter(t => t.status !== 'done')
    .reduce((sum, t) => sum + (t.timeEstimateMinutes || 0), 0);
  return { total, done, inProgress, pending, pct, remainingMinutes };
}

function computeRoomProgress(tasks) {
  const rooms = new Map();
  for (const t of tasks) {
    const entry = rooms.get(t.room) ?? { total: 0, done: 0 };
    entry.total++;
    if (t.status === 'done') entry.done++;
    rooms.set(t.room, entry);
  }
  return Array.from(rooms.entries())
    .map(([room, { total, done }]) => ({
      room,
      label: RoomLabels[room] || room,
      total,
      done,
      pct: Math.round((done / total) * 100),
    }))
    .sort((a, b) => b.total - a.total);
}

function computePersonProgress(tasks, familyMembers) {
  return familyMembers.map(member => {
    const assigned = tasks.filter(t => t.assigneeId === member.id);
    const done = assigned.filter(t => t.status === 'done').length;
    const pct = assigned.length > 0 ? Math.round((done / assigned.length) * 100) : 0;
    return { ...member, assigned: assigned.length, done, pct };
  });
}

// ── HTML builders ──────────────────────────────────────────────────────────

function buildCircularProgressSVG(pct) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  return `
    <div style="position:relative;width:9rem;height:9rem;margin:0 auto;">
      <svg style="width:100%;height:100%;transform:rotate(-90deg);" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#df9b4e"/>
            <stop offset="100%" stop-color="#a4501f"/>
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="${radius}" fill="none" stroke="#f9edd9" stroke-width="10"/>
        <circle cx="60" cy="60" r="${radius}" fill="none" stroke="url(#progressGrad)" stroke-width="10"
          stroke-linecap="round"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${offset}"
          style="transition:stroke-dashoffset 0.7s ease-out;"/>
      </svg>
      <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
        <span style="font-size:1.75rem;font-weight:800;color:var(--pesach-800);">${pct}%</span>
        <span style="font-size:0.7rem;color:var(--pesach-600);font-weight:500;">הושלם</span>
      </div>
    </div>`;
}

function buildCountdownHTML(pesachDate) {
  const cd = getPesachCountdown(pesachDate);
  if (cd.passed) {
    return `<p style="font-size:1.5rem;font-weight:700;">חג פסח שמח!</p>`;
  }
  const units = [
    { value: cd.days, label: 'ימים' },
    { value: cd.hours, label: 'שעות' },
    { value: cd.minutes, label: 'דקות' },
  ];
  return `
    <div style="display:flex;justify-content:center;gap:1rem;">
      ${units.map(u => `
        <div style="background:rgba(255,255,255,0.15);backdrop-filter:blur(4px);border-radius:0.75rem;padding:0.75rem 1rem;min-width:72px;text-align:center;">
          <span style="display:block;font-size:1.875rem;font-weight:800;">${u.value}</span>
          <span style="font-size:0.75rem;opacity:0.8;">${u.label}</span>
        </div>`).join('')}
    </div>`;
}

function buildHTML(state) {
  const { tasks, familyMembers, pesachDate } = state;
  const stats = computeStats(tasks);
  const roomProgress = computeRoomProgress(tasks);
  const criticalTasks = tasks.filter(t => t.priority === 'critical' && t.status !== 'done');
  const personProgress = computePersonProgress(tasks, familyMembers);
  const motivation = getMotivation(stats.pct);
  const remainingTimeLabel = formatRemainingTime(stats.remainingMinutes);

  // ── Share/Scan buttons ──
  const shareRow = `
    <div style="display:flex;justify-content:flex-end;gap:0.5rem;margin-bottom:0.75rem;">
      <button onclick="window.openScanQr && window.openScanQr()"
        style="display:flex;align-items:center;gap:0.375rem;padding:0.5rem 1rem;border-radius:0.75rem;
               background:var(--pesach-100);color:var(--pesach-800);font-size:0.875rem;font-weight:500;
               border:none;cursor:pointer;"
        aria-label="סריקת קוד QR לייבוא">
        <svg xmlns="http://www.w3.org/2000/svg" style="width:1rem;height:1rem;" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
        </svg>
        <span>סריקה</span>
      </button>
      <button onclick="window.openShareQr && window.openShareQr()"
        style="display:flex;align-items:center;gap:0.375rem;padding:0.5rem 1rem;border-radius:0.75rem;
               background:var(--pesach-100);color:var(--pesach-800);font-size:0.875rem;font-weight:500;
               border:none;cursor:pointer;"
        aria-label="שיתוף מצב הניקיון">
        <svg xmlns="http://www.w3.org/2000/svg" style="width:1rem;height:1rem;" fill="none" viewBox="0 0 24 24"
          stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
        </svg>
        <span>שיתוף</span>
      </button>
    </div>`;

  // ── Pesach Countdown ──
  const countdownCard = `
    <div style="background:linear-gradient(135deg, var(--pesach-700) 0%, var(--pesach-900) 100%);
                border-radius:1rem;padding:1.5rem;text-align:center;color:#fff;
                box-shadow:0 4px 16px rgba(0,0,0,0.2);margin-bottom:0.75rem;">
      <h2 style="font-size:0.875rem;font-weight:500;opacity:0.8;margin:0 0 0.25rem;">הספירה לאחור</h2>
      <p style="font-size:1.25rem;font-weight:700;margin:0 0 1rem;">🕯️ ליל הסדר 🕯️</p>
      ${buildCountdownHTML(pesachDate)}
    </div>`;

  // ── Overall Progress ──
  const overallCard = `
    <div class="pc-card" style="text-align:center;margin-bottom:0.75rem;">
      <h2 style="font-size:1.125rem;font-weight:700;color:var(--pesach-800);margin:0 0 1rem;">התקדמות כללית</h2>
      ${buildCircularProgressSVG(stats.pct)}
      <p style="font-size:0.875rem;color:#6b7280;margin:0.75rem 0 0;">
        ${stats.done} מתוך ${stats.total} משימות הושלמו
      </p>
    </div>`;

  // ── Quick Stats ──
  const statsGrid = `
    <div class="pc-stats-grid" style="margin-bottom:0.75rem;">
      <div class="pc-stat">
        <span class="pc-stat__value" style="color:var(--pesach-500);">${stats.pending}</span>
        <span class="pc-stat__label">ממתינות</span>
      </div>
      <div class="pc-stat">
        <span class="pc-stat__value" style="color:var(--pesach-400);">${stats.inProgress}</span>
        <span class="pc-stat__label">בביצוע</span>
      </div>
      <div class="pc-stat">
        <span class="pc-stat__value" style="color:#16a34a;">${stats.done}</span>
        <span class="pc-stat__label">הושלמו</span>
      </div>
      <div class="pc-stat">
        <span class="pc-stat__value" style="font-size:1.1rem;color:var(--pesach-700);">${remainingTimeLabel}</span>
        <span class="pc-stat__label">זמן משוער שנותר</span>
      </div>
    </div>`;

  // ── Critical Tasks ──
  let criticalSection = '';
  if (criticalTasks.length > 0) {
    const items = criticalTasks.map(t => `
      <li style="display:flex;align-items:center;justify-content:space-between;
                 background:rgba(255,255,255,0.7);border-radius:0.5rem;
                 padding:0.625rem 0.75rem;font-size:0.875rem;margin-bottom:0.5rem;">
        <span style="color:var(--pesach-900);font-weight:500;">${t.name}</span>
        <span style="color:var(--pesach-400);font-size:0.75rem;">${RoomLabels[t.room] || t.room}</span>
      </li>`).join('');
    criticalSection = `
      <div style="background:var(--pesach-50);border:1px solid var(--pesach-200);border-radius:1rem;
                  padding:1.25rem;margin-bottom:0.75rem;">
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem;">
          <span style="font-size:1.125rem;">⚠️</span>
          <h2 style="font-size:1rem;font-weight:700;color:var(--pesach-900);margin:0;">
            ${criticalTasks.length} משימות קריטיות שנותרו
          </h2>
        </div>
        <p style="font-size:0.75rem;color:var(--pesach-600);margin:0 0 0.75rem;">
          חובה לסיים לפני החג — בדיקת חמץ וכשרות
        </p>
        <ul style="list-style:none;margin:0;padding:0;">${items}</ul>
      </div>`;
  }

  // ── Room Progress ──
  let roomBars = '';
  if (roomProgress.length > 0) {
    roomBars = roomProgress.map(r => {
      const fillClass = r.pct === 100 ? 'pc-progress-bar__fill--done' : '';
      return `
        <div style="margin-bottom:0.75rem;">
          <div style="display:flex;justify-content:space-between;font-size:0.875rem;margin-bottom:0.25rem;">
            <span style="font-weight:500;color:#374151;">${r.label}</span>
            <span style="color:#9ca3af;font-size:0.75rem;">${r.done}/${r.total} (${r.pct}%)</span>
          </div>
          <div class="pc-progress-bar">
            <div class="pc-progress-bar__fill ${fillClass}" style="width:${r.pct}%;"></div>
          </div>
        </div>`;
    }).join('');
  } else {
    roomBars = `<p style="font-size:0.875rem;color:#9ca3af;text-align:center;padding:1rem 0;">
      אין משימות עדיין — הוסיפו משימות מעמוד המשימות
    </p>`;
  }
  const roomCard = `
    <div class="pc-card" style="margin-bottom:0.75rem;">
      <h2 style="font-size:1.125rem;font-weight:700;color:var(--pesach-800);margin:0 0 1rem;">התקדמות לפי חדרים</h2>
      ${roomBars}
    </div>`;

  // ── Per-Person Progress ──
  let personSection = '';
  if (personProgress.length > 0) {
    const cards = personProgress.map(p => {
      const assignedLabel = p.assigned > 0 ? `${p.assigned} משימות` : 'טרם שויכו משימות';
      return `
        <div style="background:var(--pesach-50);border-radius:0.75rem;padding:0.75rem;
                    text-align:center;border:1px solid var(--pesach-100);">
          <span style="display:block;font-size:1.875rem;margin-bottom:0.25rem;">${p.emoji || '👤'}</span>
          <span style="display:block;font-size:0.875rem;font-weight:600;color:var(--pesach-800);
                       margin-bottom:0.25rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.name}</span>
          <span style="display:block;font-size:0.75rem;color:#6b7280;margin-bottom:0.5rem;">${assignedLabel}</span>
          <div class="pc-progress-bar" style="height:0.375rem;margin-bottom:0.25rem;">
            <div class="pc-progress-bar__fill" style="width:${p.pct}%;"></div>
          </div>
          <span style="font-size:0.75rem;font-weight:700;color:var(--pesach-700);">${p.pct}%</span>
        </div>`;
    }).join('');
    personSection = `
      <div class="pc-card" style="margin-bottom:0.75rem;">
        <h2 style="font-size:1.125rem;font-weight:700;color:var(--pesach-800);margin:0 0 1rem;">התקדמות לפי בני משפחה</h2>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:0.75rem;">${cards}</div>
      </div>`;
  } else {
    personSection = `
      <div class="pc-card" style="text-align:center;padding:1.5rem;margin-bottom:0.75rem;">
        <span style="font-size:1.875rem;display:block;margin-bottom:0.5rem;">👨‍👩‍👧‍👦</span>
        <p style="font-size:0.875rem;color:#6b7280;margin:0 0 0.25rem;">עדיין לא הוספתם בני משפחה</p>
        <p style="font-size:0.75rem;color:#9ca3af;margin:0;">הוסיפו חברי משפחה כדי לחלק משימות ולעקוב אחרי ההתקדמות</p>
      </div>`;
  }

  // ── Motivational Message ──
  const motivationCard = `
    <div style="background:linear-gradient(135deg, var(--pesach-100) 0%, var(--pesach-200) 100%);
                border-radius:1rem;padding:1.25rem;text-align:center;
                border:1px solid var(--pesach-200);margin-bottom:0.75rem;">
      <span style="font-size:1.875rem;display:block;margin-bottom:0.5rem;">${motivation.emoji}</span>
      <p style="color:var(--pesach-800);font-weight:500;font-size:0.875rem;line-height:1.6;margin:0;">${motivation.text}</p>
    </div>`;

  return shareRow + countdownCard + overallCard + statsGrid + criticalSection + roomCard + personSection + motivationCard;
}

// ── Main export ────────────────────────────────────────────────────────────

export function renderDashboard(container) {
  // Unsubscribe previous subscription if re-rendering
  if (container._dashboardUnsub) {
    container._dashboardUnsub();
    container._dashboardUnsub = null;
  }

  // Clear any previous interval
  if (container._countdownInterval) {
    clearInterval(container._countdownInterval);
    container._countdownInterval = null;
  }

  // Initial render
  container.innerHTML = buildHTML(appState.get());

  // Update countdown every minute (updates only the countdown portion by re-rendering)
  container._countdownInterval = setInterval(() => {
    container.innerHTML = buildHTML(appState.get());
  }, 60_000);

  // Subscribe to state changes for full re-renders
  const unsub = appState.subscribe(() => {
    container.innerHTML = buildHTML(appState.get());
  });

  container._dashboardUnsub = () => {
    unsub();
    if (container._countdownInterval) {
      clearInterval(container._countdownInterval);
      container._countdownInterval = null;
    }
  };
}
