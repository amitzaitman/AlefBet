/**
 * כפתורי התשובה של סיבוב סיפור: מספרים או כרטיסי סיפור.
 *
 * כפתור מספר מציג את הספרה ומתחתיה נקודות בשורות של חמש, כך שילד שעוד לא
 * קורא ספרות יכול להתאים כמות שספר לכפתור. כרטיס מציג כיתוב ותמונה שהמשחק
 * בנה. המודול לא מאזין ללחיצות: story-round רושם את המאזינים ב-scope של הסיבוב.
 *
 * API ציבורי:
 *   createAnswerChoices(choices, options) - בונה את הכפתורים ומחזיר:
 *     root, buttons     - המיכל והכפתורים, בסדר שניתן.
 *     valueOf(button)   - הערך של כפתור: מספר, או מזהה הכרטיס.
 *     isRight(button)   - האם זו התשובה הנכונה.
 *     lock(locked)      - נועל או פותח; כפתור שנוסה ונפסל נשאר נעול.
 *     tried(button)     - מסמן תשובה שגויה שנוסתה (רק עם retireTried).
 *     correct(button)   - מסמן את התשובה הנכונה שנבחרה.
 *     mark()            - מסמן את התשובה הנכונה כרמז.
 */

/**
 * כרטיס סיפור: מזהה, כיתוב, תמונה, ושדות data-* לבחירה בבדיקות.
 * @typedef {{ id: string, label: string, picture: HTMLElement, data?: Record<string, string> }} StoryCard
 */

/**
 * התשובות: מספרים, או כרטיסים ומזהה הכרטיס הנכון. answer הוא המספר שמחליף
 * את סימן השאלה בתרגיל כשהסיבוב נפתר. המשחק קובע את הסדר.
 * @typedef {{ values: number[], answer: number } | { cards: StoryCard[], right: string, answer: number }} StoryChoices
 */

/** @param {string} tag @param {string} [className] @param {string} [text] */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** @param {number} value */
function choiceDots(value) {
  const dots = el('span', 'story-choice__dots');
  dots.setAttribute('aria-hidden', 'true');
  for (let k = 0; k < value; k++) dots.append(el('span'));
  return dots;
}

/**
 * @param {StoryChoices} choices
 * @param {{ retireTried?: boolean }} [options] - retireTried: תשובה שגויה נפסלת ונעולה (ברירת מחדל true)
 */
export function createAnswerChoices(choices, { retireTried = true } = {}) {
  const cards = 'cards' in choices;
  const root = el('div', cards ? 'story-cards' : 'story-choices');
  if (!cards) root.dir = 'ltr';
  /** @type {HTMLButtonElement[]} */
  const buttons = cards
    ? choices.cards.map(card => {
      const button = /** @type {HTMLButtonElement} */ (el('button', 'story-card'));
      button.type = 'button';
      Object.assign(button.dataset, { id: card.id, ...card.data });
      button.setAttribute('aria-label', card.label);
      button.append(el('span', 'story-card__caption', card.label), card.picture);
      return button;
    })
    : choices.values.map(value => {
      const button = /** @type {HTMLButtonElement} */ (el('button', 'story-choice'));
      button.type = 'button';
      button.dataset.value = String(value);
      button.setAttribute('aria-label', String(value));
      button.append(el('span', 'story-choice__number', String(value)), choiceDots(value));
      return button;
    });
  root.append(...buttons);

  /** @param {HTMLElement} button @returns {number | string} */
  const valueOf = button => (cards ? button.dataset.id : Number(button.dataset.value));
  /** @param {HTMLElement} button */
  const isRight = button => valueOf(button) === ('cards' in choices ? choices.right : choices.answer);

  return {
    root,
    buttons,
    valueOf,
    isRight,
    /** @param {boolean} locked */
    lock(locked) {
      for (const button of buttons) button.disabled = locked || button.classList.contains('story-pick--tried');
    },
    /** @param {HTMLElement} button */
    tried(button) {
      if (retireTried) button.classList.add('story-pick--tried');
    },
    /** @param {HTMLElement} button */
    correct(button) {
      button.classList.add('story-pick--correct');
    },
    mark() {
      buttons.find(isRight)?.classList.add('story-pick--hint');
    },
  };
}
