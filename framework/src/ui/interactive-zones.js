/**
 * אזור אינטראקטיבי — לחצן/אזור שמיש עם מצבי משוב
 */

/**
 * צור אזור אינטראקטיבי
 * @param {Object} config
 * @param {string} config.color — צבע רקע
 * @param {string} config.symbol — תוכן ראשי (HTML)
 * @param {string} config.label — טקסט תווית
 * @param {Function} config.onTap — פעולה בלחיצה
 * @returns {{ el: HTMLElement, highlight: Function, reset: Function, destroy: Function }}
 */
export function createZone(config) {
  const el = document.createElement('div');
  el.className = 'ab-zone';
  el.style.setProperty('--zone-color', config.color || '#4f67ff');
  el.innerHTML = `
    <div class="ab-zone__symbol">${config.symbol || ''}</div>
    <div class="ab-zone__label">${config.label || ''}</div>
  `;

  const tapHandler = () => { if (config.onTap) config.onTap(); };
  el.addEventListener('click', tapHandler);

  return {
    el,
    highlight(state) {
      el.classList.remove('ab-zone--correct', 'ab-zone--hover');
      if (state) el.classList.add(`ab-zone--${state}`);
    },
    reset() {
      el.classList.remove('ab-zone--correct', 'ab-zone--hover');
    },
    destroy() {
      el.removeEventListener('click', tapHandler);
    },
  };
}
