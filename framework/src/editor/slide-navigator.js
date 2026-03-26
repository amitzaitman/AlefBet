/**
 * ניווט שקופיות — רשימת ממוזערים של כל סיבובי המשחק
 * מוצב בצד inline-start (ימין ב-RTL)
 */

/**
 * @param {HTMLElement} mountEl  — element to append the panel into
 * @param {import('./game-data.js').GameData} gameData
 * @param {{
 *   onSelectRound: (roundId: string) => void,
 *   onAddRound:    (afterId: string|null) => void,
 *   onRemoveRound: (roundId: string) => void,
 * }} callbacks
 * @returns {{ refresh(), setActiveRound(id), destroy() }}
 */
export function createSlideNavigator(mountEl, gameData, { onSelectRound, onAddRound }) {
  const panel = document.createElement('div');
  panel.className = 'ab-editor-nav';
  panel.setAttribute('aria-label', 'ניווט סיבובים');

  const header = document.createElement('div');
  header.className = 'ab-editor-nav__header';
  header.textContent = 'סיבובים';
  panel.appendChild(header);

  const list = document.createElement('div');
  list.className = 'ab-editor-nav__list';
  panel.appendChild(list);

  const addBtn = document.createElement('button');
  addBtn.className = 'ab-editor-nav__add';
  addBtn.textContent = '+ הוסף';
  addBtn.addEventListener('click', () => onAddRound(null));
  panel.appendChild(addBtn);

  mountEl.appendChild(panel);

  let activeId = null;

  function buildThumbnail(round, index) {
    const thumb = document.createElement('div');
    thumb.className = 'ab-editor-nav__thumb';
    if (round.id === activeId) thumb.classList.add('ab-editor-nav__thumb--active');
    thumb.setAttribute('role', 'button');
    thumb.setAttribute('tabindex', '0');
    thumb.setAttribute('aria-label', `סיבוב ${index + 1}`);
    thumb.dataset.roundId = round.id;

    const num = document.createElement('div');
    num.className = 'ab-editor-nav__num';
    num.textContent = index + 1;
    thumb.appendChild(num);

    if (round.correctEmoji) {
      const emoji = document.createElement('div');
      emoji.className = 'ab-editor-nav__emoji';
      emoji.textContent = round.correctEmoji;
      thumb.appendChild(emoji);
    }

    if (round.target) {
      const letter = document.createElement('div');
      letter.className = 'ab-editor-nav__letter';
      letter.textContent = round.target;
      thumb.appendChild(letter);
    }

    thumb.addEventListener('click', () => onSelectRound(round.id));
    thumb.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectRound(round.id); }
    });

    return thumb;
  }

  function refresh() {
    list.innerHTML = '';
    gameData.rounds.forEach((round, i) => {
      list.appendChild(buildThumbnail(round, i));
    });
  }

  function setActiveRound(id) {
    activeId = id;
    list.querySelectorAll('.ab-editor-nav__thumb').forEach(el => {
      el.classList.toggle('ab-editor-nav__thumb--active', el.dataset.roundId === id);
    });
  }

  function destroy() {
    panel.remove();
  }

  refresh();

  return { refresh, setActiveRound, destroy };
}
