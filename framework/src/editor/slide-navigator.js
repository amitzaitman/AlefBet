/**
 * ניווט שקופיות — רשימת ממוזערים של כל סיבובי המשחק
 * מוצב בצד inline-start (ימין ב-RTL)
 * תומך בגרירה לשינוי סדר ושכפול סיבובים
 */

import { createDragSource, createDropTarget } from '../input/drag.js';

/**
 * @param {HTMLElement} mountEl  — element to append the panel into
 * @param {import('./game-data.js').GameData} gameData
 * @param {{
 *   onSelectRound:    (roundId: string) => void,
 *   onAddRound:       (afterId: string|null) => void,
 *   onDuplicateRound: (roundId: string) => void,
 *   onMoveRound:      (roundId: string, toIndex: number) => void,
 * }} callbacks
 * @returns {{ refresh(), setActiveRound(id), destroy() }}
 */
export function createSlideNavigator(mountEl, gameData, {
  onSelectRound,
  onAddRound,
  onDuplicateRound,
  onMoveRound,
}) {
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
  // Track destroyable drag/drop objects so they can be cleaned up on refresh
  let _dragDropItems = [];

  function _clearDragDrop() {
    _dragDropItems.forEach(item => item.destroy());
    _dragDropItems = [];
  }

  function buildThumbnail(round, index) {
    const thumb = document.createElement('div');
    thumb.className = 'ab-editor-nav__thumb';
    if (round.id === activeId) thumb.classList.add('ab-editor-nav__thumb--active');
    thumb.setAttribute('role', 'button');
    thumb.setAttribute('tabindex', '0');
    thumb.setAttribute('aria-label', `סיבוב ${index + 1}`);
    thumb.dataset.roundId = round.id;

    // Background image (if round has one)
    if (round.image) {
      thumb.style.backgroundImage = `url(${round.image})`;
      thumb.classList.add('ab-editor-nav__thumb--has-img');
    }

    // Drag handle — the only draggable element so clicks still select
    const grip = document.createElement('div');
    grip.className = 'ab-editor-nav__grip';
    grip.innerHTML = '⠿';
    grip.setAttribute('aria-hidden', 'true');
    grip.title = 'גרור לשינוי סדר';
    thumb.appendChild(grip);

    // Round number
    const num = document.createElement('div');
    num.className = 'ab-editor-nav__num';
    num.textContent = index + 1;
    thumb.appendChild(num);

    if (round.correctEmoji && !round.image) {
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

    // Duplicate button — appears on hover
    const dupBtn = document.createElement('button');
    dupBtn.className = 'ab-editor-nav__dup';
    dupBtn.innerHTML = '⧉';
    dupBtn.title = 'שכפל סיבוב';
    dupBtn.setAttribute('aria-label', 'שכפל סיבוב');
    dupBtn.addEventListener('click', e => {
      e.stopPropagation();
      onDuplicateRound(round.id);
    });
    thumb.appendChild(dupBtn);

    // Click → select
    thumb.addEventListener('click', () => onSelectRound(round.id));
    thumb.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectRound(round.id); }
    });

    // Drag source on the grip only
    const src = createDragSource(grip, { roundId: round.id });
    _dragDropItems.push(src);

    // Drop target on the whole thumb (drop means "move before this thumb")
    const tgt = createDropTarget(thumb, ({ data }) => {
      if (data.roundId === round.id) return; // dropped on itself
      const targetIndex = gameData.getRoundIndex(round.id);
      onMoveRound(data.roundId, targetIndex);
    });
    _dragDropItems.push(tgt);

    return thumb;
  }

  function refresh() {
    _clearDragDrop();
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
    _clearDragDrop();
    panel.remove();
  }

  refresh();

  return { refresh, setActiveRound, destroy };
}
