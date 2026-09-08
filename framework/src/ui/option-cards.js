/**
 * כרטיסי בחירה למשחקי התאמה
 * מציג רשת של כרטיסים עם אימוג'י וטקסט, תומך בלחיצה ובמגע
 * [נוסף על ידי: letter-match game]
 *
 * @param {HTMLElement} container - אלמנט המיכל
 * @param {Array<{id: string, text: string, emoji?: string}>} options - רשימת האפשרויות
 * @param {function} onSelect - קולבק שנקרא עם האפשרות שנבחרה
 */
export function createOptionCards(container, options, onSelect) {
  container.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'option-cards-grid';

  const cards = options.map(option => {
    const card = document.createElement('button');
    card.className = 'option-card';
    card.dataset.id = option.id;
    card.innerHTML = `
      <span class="option-card__emoji">${option.emoji || ''}</span>
      <span class="option-card__text">${option.text}</span>
    `;
    card.addEventListener('click', () => {
      if (card.disabled) return;
      onSelect(option);
    });
    grid.appendChild(card);
    return { el: card, option };
  });

  container.appendChild(grid);

  return {
    /** הַדָּגֵשׁ כַּרְטִיס לְפִי סוּג: 'correct' | 'wrong' | 'hint' */
    highlight(id, type) {
      cards.forEach(({ el, option }) => {
        if (option.id === id) {
          el.classList.add(`option-card--${type}`);
        }
      });
    },

    /** Visual hints never change the answer lock or other highlights. */
    clearHighlight(id, type) {
      cards.forEach(({ el, option }) => {
        if (option.id === id) el.classList.remove(`option-card--${type}`);
      });
    },

    setDisabled(disabled) {
      cards.forEach(({ el }) => { el.disabled = disabled; });
    },

    /** נטרל את כל הכרטיסים */
    disable() {
      cards.forEach(({ el }) => { el.disabled = true; });
    },

    /** אפס את מצב הכרטיסים */
    reset() {
      cards.forEach(({ el }) => {
        el.className = 'option-card';
        el.disabled = false;
      });
    },

    /** הסר את הרכיב */
    destroy() {
      container.innerHTML = '';
    },
  };
}
