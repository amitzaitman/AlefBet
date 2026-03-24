import { useMemo, useState, useEffect } from 'react';
import { useAppState } from '../hooks/useAppState';
import { RoomLabels } from '../types';
import type { Room } from '../types';

// Pesach countdown hook

function usePesachCountdown(pesachDate: string) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  return useMemo(() => {
    const seder = new Date(pesachDate + 'T18:00:00');
    const diff = seder.getTime() - now;
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, passed: true };
    const days = Math.floor(diff / 86_400_000);
    const hours = Math.floor((diff % 86_400_000) / 3_600_000);
    const minutes = Math.floor((diff % 3_600_000) / 60_000);
    return { days, hours, minutes, passed: false };
  }, [pesachDate, now]);
}

// Motivational messages

function getMotivation(pct: number): { emoji: string; text: string } {
  if (pct >= 100) return { emoji: '🎉', text: 'מדהים! סיימתם הכול — חג פסח שמח!' };
  if (pct >= 75) return { emoji: '🔥', text: 'כמעט שם! עוד קצת מאמץ וסיימתם!' };
  if (pct >= 50) return { emoji: '💪', text: 'עברתם את חצי הדרך — כל הכבוד!' };
  if (pct >= 25) return { emoji: '🌟', text: 'התחלה טובה — ממשיכים בקצב!' };
  return { emoji: '🧹', text: 'כל משימה שמסיימים מקרבת אותנו לחג נקי ושמח!' };
}

// Circular progress component

function CircularProgress({ pct }: { pct: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60" cy="60" r={radius}
          fill="none" stroke="#f9edd9" strokeWidth="10"
        />
        <circle
          cx="60" cy="60" r={radius}
          fill="none" stroke="url(#progressGrad)" strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
        <defs>
          <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#df9b4e" />
            <stop offset="100%" stopColor="#a4501f" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold text-pesach-800">{pct}%</span>
        <span className="text-xs text-pesach-600 font-medium">הושלם</span>
      </div>
    </div>
  );
}

// Main Dashboard

export default function DashboardPage() {
  const { state } = useAppState();
  const { tasks, familyMembers } = state;
  const countdown = usePesachCountdown(state.pesachDate);

  // Overall stats
  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const inProgress = tasks.filter((t) => t.status === 'in-progress').length;
    const pending = total - done - inProgress;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const remainingMinutes = tasks
      .filter((t) => t.status !== 'done')
      .reduce((sum, t) => sum + t.timeEstimateMinutes, 0);
    return { total, done, inProgress, pending, pct, remainingMinutes };
  }, [tasks]);

  // Room progress
  const roomProgress = useMemo(() => {
    const rooms = new Map<Room, { total: number; done: number }>();
    for (const t of tasks) {
      const entry = rooms.get(t.room) ?? { total: 0, done: 0 };
      entry.total++;
      if (t.status === 'done') entry.done++;
      rooms.set(t.room, entry);
    }
    return Array.from(rooms.entries())
      .map(([room, { total, done }]) => ({
        room,
        label: RoomLabels[room],
        total,
        done,
        pct: Math.round((done / total) * 100),
      }))
      .sort((a, b) => b.total - a.total);
  }, [tasks]);

  // Critical tasks remaining
  const criticalTasks = useMemo(
    () => tasks.filter((t) => t.priority === 'critical' && t.status !== 'done'),
    [tasks],
  );

  // Per-person progress
  const personProgress = useMemo(() => {
    return familyMembers.map((member) => {
      const assigned = tasks.filter((t) => t.assigneeId === member.id);
      const done = assigned.filter((t) => t.status === 'done').length;
      const pct = assigned.length > 0 ? Math.round((done / assigned.length) * 100) : 0;
      return { ...member, assigned: assigned.length, done, pct };
    });
  }, [tasks, familyMembers]);

  const motivation = getMotivation(stats.pct);

  // Format remaining time
  const remainingTimeLabel = useMemo(() => {
    const h = Math.floor(stats.remainingMinutes / 60);
    const m = stats.remainingMinutes % 60;
    if (h === 0) return `${m} דקות`;
    if (m === 0) return `${h} שעות`;
    return `${h} שע׳ ו-${m} דק׳`;
  }, [stats.remainingMinutes]);

  return (
    <div className="space-y-5">
      {/* Pesach Countdown */}
      <div className="festive-header bg-gradient-to-br from-pesach-700 to-pesach-900 rounded-2xl p-6 text-center text-white shadow-lg">
        <h2 className="text-sm font-medium opacity-80 mb-1">הספירה לאחור</h2>
        <p className="text-xl font-bold mb-4">🕯️ ליל הסדר 🕯️</p>
        {countdown.passed ? (
          <p className="text-2xl font-bold">חג פסח שמח!</p>
        ) : (
          <div className="flex justify-center gap-4">
            {[
              { value: countdown.days, label: 'ימים' },
              { value: countdown.hours, label: 'שעות' },
              { value: countdown.minutes, label: 'דקות' },
            ].map((unit) => (
              <div key={unit.label} className="bg-white/15 backdrop-blur rounded-xl px-4 py-3 min-w-[72px]">
                <span className="block text-3xl font-extrabold">{unit.value}</span>
                <span className="text-xs opacity-80">{unit.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Overall Progress */}
      <div className="bg-white rounded-2xl shadow-sm border border-pesach-100 p-5">
        <h2 className="text-lg font-bold text-pesach-800 mb-4 text-center">התקדמות כללית</h2>
        <CircularProgress pct={stats.pct} />
        <p className="text-sm text-gray-500 text-center mt-3">
          {stats.done} מתוך {stats.total} משימות הושלמו
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl shadow-sm border border-pesach-100 p-4 text-center card-hover">
          <span className="block text-2xl font-bold text-pesach-500">{stats.pending}</span>
          <span className="text-xs text-gray-500 font-medium">ממתינות</span>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-pesach-100 p-4 text-center card-hover">
          <span className="block text-2xl font-bold text-pesach-400">{stats.inProgress}</span>
          <span className="text-xs text-gray-500 font-medium">בביצוע</span>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-pesach-100 p-4 text-center card-hover">
          <span className="block text-2xl font-bold text-green-600">{stats.done}</span>
          <span className="text-xs text-gray-500 font-medium">הושלמו</span>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-pesach-100 p-4 text-center card-hover">
          <span className="block text-lg font-bold text-pesach-700 leading-tight">{remainingTimeLabel}</span>
          <span className="text-xs text-gray-500 font-medium">זמן משוער שנותר</span>
        </div>
      </div>

      {/* Critical Tasks */}
      {criticalTasks.length > 0 && (
        <div className="bg-pesach-50 border border-pesach-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">⚠️</span>
            <h2 className="text-base font-bold text-pesach-900">
              {criticalTasks.length} משימות קריטיות שנותרו
            </h2>
          </div>
          <p className="text-xs text-pesach-600 mb-3">
            חובה לסיים לפני החג — בדיקת חמץ וכשרות
          </p>
          <ul className="space-y-2">
            {criticalTasks.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between bg-white/70 rounded-lg px-3 py-2.5 text-sm"
              >
                <span className="text-pesach-900 font-medium">{t.name}</span>
                <span className="text-pesach-400 text-xs">{RoomLabels[t.room]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Room Progress */}
      <div className="bg-white rounded-2xl shadow-sm border border-pesach-100 p-5">
        <h2 className="text-lg font-bold text-pesach-800 mb-4">התקדמות לפי חדרים</h2>
        {roomProgress.length > 0 ? (
          <div className="space-y-3">
            {roomProgress.map((r) => (
              <div key={r.room}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{r.label}</span>
                  <span className="text-gray-400 text-xs">
                    {r.done}/{r.total} ({r.pct}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-pesach-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      r.pct === 100
                        ? 'bg-green-400'
                        : r.pct >= 50
                          ? 'bg-pesach-400'
                          : 'bg-pesach-300'
                    }`}
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">
            אין משימות עדיין — הוסיפו משימות מעמוד המשימות
          </p>
        )}
      </div>

      {/* Per-Person Progress */}
      {personProgress.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-pesach-100 p-5">
          <h2 className="text-lg font-bold text-pesach-800 mb-4">התקדמות לפי בני משפחה</h2>
          <div className="grid grid-cols-2 gap-3">
            {personProgress.map((p) => (
              <div
                key={p.id}
                className="bg-pesach-50 rounded-xl p-3 text-center border border-pesach-100 card-hover"
              >
                <span className="block text-3xl mb-1">{p.emoji}</span>
                <span className="block text-sm font-semibold text-pesach-800 mb-1 truncate">
                  {p.name}
                </span>
                <span className="block text-xs text-gray-500 mb-2">
                  {p.assigned > 0 ? `${p.assigned} משימות` : 'טרם שויכו משימות'}
                </span>
                {/* Mini progress bar */}
                <div className="w-full h-1.5 bg-pesach-200 rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full bg-pesach-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-pesach-700">{p.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-pesach-100 p-6 text-center">
          <span className="text-3xl block mb-2">👨‍👩‍👧‍👦</span>
          <p className="text-sm text-gray-500 mb-1">עדיין לא הוספתם בני משפחה</p>
          <p className="text-xs text-gray-400">הוסיפו חברי משפחה כדי לחלק משימות ולעקוב אחרי ההתקדמות</p>
        </div>
      )}

      {/* Motivational Message */}
      <div className="bg-gradient-to-br from-pesach-100 to-pesach-200 rounded-2xl p-5 text-center border border-pesach-200">
        <span className="text-3xl mb-2 block">{motivation.emoji}</span>
        <p className="text-pesach-800 font-medium text-sm leading-relaxed">{motivation.text}</p>
      </div>
    </div>
  );
}
