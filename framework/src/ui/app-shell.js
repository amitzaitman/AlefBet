/**
 * מעטפת אפליקציה רב-לשונית — כותרת, ניווט טאבים, ניווט תחתון לנייד
 *
 * מיועדת לאפליקציות שירות (לא משחקים) עם ניווט רב-טאבים.
 * שונה מ-GameShell: אין ניהול סיבובים — רק מבנה ניווט.
 *
 * @param {HTMLElement} container - אלמנט המיכל של האפליקציה
 * @param {object} config - הגדרות האפליקציה
 * @param {string} config.title - כותרת ראשית
 * @param {string} [config.subtitle] - כותרת משנה (אופציונלית)
 * @param {Array<{id: string, label: string, icon: string}>} config.tabs - רשימת טאבים
 * @param {string} [config.homeUrl] - כתובת דף הבית (לכפתור 🏠)
 * @param {Function} [config.onTabChange] - קולבק בעת החלפת טאב: fn(tabId)
 * @returns {{ contentEl: HTMLElement, setSubtitle(text: string): void, setActiveTab(tabId: string): void }}
 *
 * @example
 * const shell = createAppShell(document.getElementById('app'), {
 *   title: 'ניהול משימות',
 *   subtitle: 'פסח תשפ״ו',
 *   tabs: [
 *     { id: 'rooms', label: 'חדרים', icon: '🏠' },
 *     { id: 'tasks', label: 'משימות', icon: '✅' },
 *   ],
 *   homeUrl: '../../index.html',
 *   onTabChange: id => renderTab(id),
 * });
 * shell.setSubtitle('3 משימות נותרו');
 * shell.setActiveTab('tasks');
 */
export function createAppShell(container, config) {
  const {
    title = '',
    subtitle = '',
    tabs = [],
    homeUrl = null,
    onTabChange = null,
  } = config;

  // ── בנה את מבנה ה-HTML ────────────────────────────────────────────────────

  container.classList.add('ab-app');

  const backLink = homeUrl
    ? `<a href="${homeUrl}" class="ab-app-back-link" aria-label="דף הבית">🏠</a>`
    : '';

  const subtitleHtml = subtitle
    ? `<span class="ab-app-subtitle">${subtitle}</span>`
    : '<span class="ab-app-subtitle"></span>';

  const tabButtonsHtml = tabs
    .map(
      tab =>
        `<button class="ab-app-tab" data-tab="${tab.id}" aria-selected="false" role="tab">` +
        `<span class="ab-app-tab-icon">${tab.icon}</span>` +
        `<span class="ab-app-tab-label">${tab.label}</span>` +
        `</button>`
    )
    .join('');

  const navItemsHtml = tabs
    .map(
      tab =>
        `<button class="ab-app-nav-item" data-tab="${tab.id}" aria-selected="false" role="tab">` +
        `<span class="ab-app-nav-icon">${tab.icon}</span>` +
        `<span class="ab-app-nav-label">${tab.label}</span>` +
        `</button>`
    )
    .join('');

  container.innerHTML = `
    <header class="ab-app-header">
      <div class="ab-app-header-text">
        <h1 class="ab-app-title">${title}</h1>
        ${subtitleHtml}
      </div>
      ${backLink}
    </header>
    <nav class="ab-app-tabs" role="tablist" aria-label="ניווט ראשי">
      ${tabButtonsHtml}
    </nav>
    <main class="ab-app-content"></main>
    <nav class="ab-app-bottom-nav" role="tablist" aria-label="ניווט תחתון">
      ${navItemsHtml}
    </nav>
  `;

  // ── שמירת הפניות לאלמנטים ─────────────────────────────────────────────────

  const subtitleEl = /** @type {HTMLElement} */ (container.querySelector('.ab-app-subtitle'));
  const contentEl  = /** @type {HTMLElement} */ (container.querySelector('.ab-app-content'));

  // ── טיפול באירועי לחיצה על טאבים ─────────────────────────────────────────

  function _handleTabClick(tabId) {
    _setActiveTab(tabId);
    if (typeof onTabChange === 'function') onTabChange(tabId);
  }

  container.querySelectorAll('.ab-app-tab, .ab-app-nav-item').forEach(btn => {
    btn.addEventListener('click', () => _handleTabClick(/** @type {HTMLElement} */ (btn).dataset.tab));
  });

  // ── פונקציות פנימיות ──────────────────────────────────────────────────────

  /**
   * הגדר את הטאב הפעיל (מעדכן גם את שורת הטאבים וגם ניווט תחתון)
   * @param {string} tabId
   */
  function _setActiveTab(tabId) {
    container.querySelectorAll('.ab-app-tab, .ab-app-nav-item').forEach(el => {
      const btn = /** @type {HTMLElement} */ (el);
      const isActive = btn.dataset.tab === tabId;
      btn.classList.toggle('ab-active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  }

  // הפעל את הטאב הראשון כברירת מחדל
  if (tabs.length > 0) {
    _setActiveTab(tabs[0].id);
  }

  // ── ממשק ציבורי ───────────────────────────────────────────────────────────

  return {
    /** אלמנט תוכן הראשי — כאן מרנדרים את תוכן הטאב הנוכחי */
    contentEl,

    /**
     * עדכן את כותרת המשנה
     * @param {string} text - הטקסט החדש לכותרת המשנה
     */
    setSubtitle(text) {
      subtitleEl.textContent = text;
    },

    /**
     * הגדר את הטאב הפעיל באופן תכנותי
     * @param {string} tabId - מזהה הטאב להפעלה
     */
    setActiveTab(tabId) {
      _setActiveTab(tabId);
    },
  };
}
