/**
 * סרגל התקדמות ויזואלי
 * מציג את ההתקדמות בסיבובי המשחק
 * [נוסף על ידי: letter-match game]
 *
 * @param {HTMLElement} container - אלמנט המיכל
 * @param {number} total - מספר הסיבובים הכולל
 * @returns {{ update(current), destroy() }}
 */
export function createProgressBar(container, total) {
  const bar = document.createElement('div');
  bar.className = 'progress-bar';
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', String(total));
  bar.innerHTML = `
    <div class="progress-bar__track">
      <div class="progress-bar__fill" style="width: 0%"></div>
    </div>
    <span class="progress-bar__label">0 / ${total}</span>
  `;
  container.appendChild(bar);

  const fill = bar.querySelector('.progress-bar__fill');
  const label = bar.querySelector('.progress-bar__label');

  return {
    /** עדכן את ההתקדמות */
    update(current) {
      const pct = Math.round((current / total) * 100);
      fill.style.width = `${pct}%`;
      label.textContent = `${current} / ${total}`;
      bar.setAttribute('aria-valuenow', String(current));
    },

    /** הסר את הרכיב */
    destroy() {
      bar.remove();
    },
  };
}
