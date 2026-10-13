/**
 * חוזה createOptionCards
 *
 * רשת כרטיסי בחירה למשחקי רב-ברירה. כל כרטיס מציג emoji + טקסט, מגיב ללחיצה,
 * וניתן להדגיש ולנטרל. משחקי בחירה בונים את הסיבוב סביבו דרך createChoiceRound.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOptionCards } from '../../ui/option-cards.js';
import { mountContainer } from '../helpers.js';

let container;
const cards = () => container.querySelectorAll('.option-card');
beforeEach(() => { container = mountContainer(); });

const OPTIONS = [
  { id: 'a', text: 'אוֹר',   emoji: '🌞' },
  { id: 'b', text: 'בַּיִת', emoji: '🏠' },
  { id: 'c', text: 'גָּמָל', emoji: '🐫' },
];

describe('createOptionCards', () => {
  it('replaces the container contents with one button per option, with matching id, text and emoji', () => {
    container.innerHTML = '<span class="old">stale</span>';
    createOptionCards(container, OPTIONS, () => {});
    expect(container.querySelector('.old')).toBeNull();
    expect(cards()).toHaveLength(3);
    expect(cards()[0].dataset.id).toBe('a');
    expect(cards()[0].querySelector('.option-card__text').textContent).toBe('אוֹר');
    expect(cards()[0].querySelector('.option-card__emoji').textContent).toBe('🌞');
  });

  it('tolerates a missing emoji and renders answer text and emoji literally', () => {
    createOptionCards(container, [{ id: 'x', text: 'הלום' }, { id: 'y', text: '<b>text</b>', emoji: '<img src=x>' }], vi.fn());
    expect(cards()[0].querySelector('.option-card__text').textContent).toBe('הלום');
    expect(cards()[0].querySelector('.option-card__emoji').textContent).toBe('');
    expect(cards()[1].querySelector('.option-card__text').textContent).toBe('<b>text</b>');
    expect(container.querySelector('b, img')).toBeNull();
  });

  it('calls onSelect with the selected option', () => {
    const onSelect = vi.fn();
    createOptionCards(container, OPTIONS, onSelect);
    cards()[1].click();
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith(OPTIONS[1]);
  });

  it('highlights only the matching card with a type-specific class, and destroy empties the container', () => {
    const handle = createOptionCards(container, OPTIONS, () => {});
    handle.highlight('b', 'correct');
    handle.highlight('a', 'wrong');
    expect(cards()[1].classList.contains('option-card--correct')).toBe(true);
    expect([...cards()].map(card => card.classList.contains('option-card--wrong'))).toEqual([true, false, false]);
    handle.destroy();
    expect(container.innerHTML).toBe('');
  });
});
