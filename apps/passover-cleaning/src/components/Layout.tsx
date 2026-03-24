import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useMemo } from 'react';

const navItems = [
  { to: '/', label: 'לוח בקרה', icon: '📊' },
  { to: '/tasks', label: 'משימות', icon: '✅' },
  { to: '/family', label: 'משפחה', icon: '👨‍👩‍👧‍👦' },
  { to: '/guide', label: 'מדריך', icon: '📖' },
];

function usePesachCountdown(): string {
  return useMemo(() => {
    const pesachDate = new Date('2026-04-01T00:00:00');
    const now = new Date();
    const diffMs = pesachDate.getTime() - now.getTime();
    const days = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    if (days === 0) return 'חג שמח!';
    if (days === 1) return 'מחר פסח!';
    return `${days} ימים לפסח`;
  }, []);
}

export default function Layout() {
  const countdown = usePesachCountdown();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-pesach-50 font-hebrew">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-pesach-200 sticky top-0 z-30">
        <div className="max-w-2xl lg:max-w-5xl mx-auto px-4">
          {/* Title row */}
          <div className="flex items-center justify-between h-14">
            <h1 className="text-lg sm:text-xl font-bold text-pesach-700 flex items-center gap-1.5">
              <span>ניקיון פסח</span>
              <span className="text-base">🧹</span>
            </h1>
            <div className="flex items-center gap-1.5 bg-pesach-100 text-pesach-800 rounded-full px-3 py-1 text-sm font-medium transition-smooth">
              <span className="text-base">🕐</span>
              <span>{countdown}</span>
            </div>
          </div>

          {/* Desktop tab row (hidden on mobile) */}
          <div className="hidden sm:flex gap-1 -mb-px">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 touch-target transition-smooth ${
                    isActive
                      ? 'border-pesach-500 text-pesach-800'
                      : 'border-transparent text-gray-500 hover:text-pesach-600 hover:border-pesach-300'
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </header>

      {/* Page Content with transition */}
      <main
        key={location.pathname}
        className="max-w-2xl lg:max-w-5xl mx-auto w-full px-4 pt-4 pb-24 sm:pb-8 page-enter"
      >
        <Outlet />
      </main>

      {/* Bottom Tab Bar (mobile only) */}
      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-pesach-200 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] sm:hidden safe-bottom">
        <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg touch-target transition-smooth ${
                  isActive
                    ? 'text-pesach-700'
                    : 'text-gray-400 active:text-pesach-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="text-xl leading-none">{item.icon}</span>
                  <span
                    className={`text-[11px] leading-tight ${
                      isActive ? 'font-semibold' : 'font-normal'
                    }`}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="block w-5 h-0.5 rounded-full bg-pesach-500 mt-0.5" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
