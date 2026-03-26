/**
 * slide-navigator — thumbnail panel for all game rounds.
 * Positioned at inline-start (right in RTL).
 * Supports drag-to-reorder (grip handle) and duplicate (hover button).
 */
import { createDragSource, createDropTarget } from '../input/drag.js';
import type { GameData } from './game-data.js';

interface SlideNavigatorCallbacks {
  onSelectRound:    (roundId: string) => void;
  onAddRound:       (afterId: string | null) => void;
  onDuplicateRound: (roundId: string) => void;
  onMoveRound:      (roundId: string, toIndex: number) => void;
}

export interface SlideNavigator {
  refresh():           void;
  setActiveRound(id: string): void;
  destroy():           void;
}

export function createSlideNavigator(
  mountEl:  HTMLElement,
  gameData: GameData,
  { onSelectRound, onAddRound, onDuplicateRound, onMoveRound }: SlideNavigatorCallbacks,
): SlideNavigator {

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

  let activeId: string | null = null;
  let _dragDropItems: Array<{ destroy(): void }> = [];

  function _clearDragDrop() {
    _dragDropItems.forEach(item => item.destroy());
    _dragDropItems = [];
  }

  function buildThumbnail(round: Record<string, unknown> & { id: string }, index: number): HTMLElement {
    const thumb = document.createElement('div');
    thumb.className = 'ab-editor-nav__thumb';
    if (round.id === activeId) thumb.classList.add('ab-editor-nav__thumb--active');
    thumb.setAttribute('role', 'button');
    thumb.setAttribute('tabindex', '0');
    thumb.setAttribute('aria-label', `סיבוב ${index + 1}`);
    thumb.dataset.roundId = round.id;

    if (round.image) {
      thumb.style.backgroundImage = `url(${round.image as string})`;
      thumb.classList.add('ab-editor-nav__thumb--has-img');
    }

    // Drag grip — only this element is the drag source so clicks still select
    const grip = document.createElement('div');
    grip.className = 'ab-editor-nav__grip';
    grip.innerHTML = '⠿';
    grip.setAttribute('aria-hidden', 'true');
    grip.title = 'גרור לשינוי סדר';
    thumb.appendChild(grip);

    const num = document.createElement('div');
    num.className = 'ab-editor-nav__num';
    num.textContent = String(index + 1);
    thumb.appendChild(num);

    if (round.correctEmoji && !round.image) {
      const emoji = document.createElement('div');
      emoji.className = 'ab-editor-nav__emoji';
      emoji.textContent = round.correctEmoji as string;
      thumb.appendChild(emoji);
    }

    if (round.target) {
      const letter = document.createElement('div');
      letter.className = 'ab-editor-nav__letter';
      letter.textContent = round.target as string;
      thumb.appendChild(letter);
    }

    // Duplicate button — visible on hover
    const dupBtn = document.createElement('button');
    dupBtn.className = 'ab-editor-nav__dup';
    dupBtn.innerHTML = '⧉';
    dupBtn.title = 'שכפל סיבוב';
    dupBtn.setAttribute('aria-label', 'שכפל סיבוב');
    dupBtn.addEventListener('click', e => { e.stopPropagation(); onDuplicateRound(round.id); });
    thumb.appendChild(dupBtn);

    thumb.addEventListener('click', () => onSelectRound(round.id));
    thumb.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectRound(round.id); }
    });

    // Drag source on grip only
    _dragDropItems.push(createDragSource(grip, { roundId: round.id }));

    // Drop target on whole thumb
    _dragDropItems.push(createDropTarget(thumb, ({ data }: { data: { roundId: string } }) => {
      if (data.roundId === round.id) return;
      onMoveRound(data.roundId, gameData.getRoundIndex(round.id));
    }));

    return thumb;
  }

  function refresh() {
    _clearDragDrop();
    list.innerHTML = '';
    gameData.rounds.forEach((round, i) => list.appendChild(buildThumbnail(round, i)));
  }

  function setActiveRound(id: string) {
    activeId = id;
    list.querySelectorAll<HTMLElement>('.ab-editor-nav__thumb').forEach(el => {
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
