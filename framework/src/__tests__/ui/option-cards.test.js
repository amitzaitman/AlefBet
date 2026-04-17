/**
 * חוזה createOptionCards
 *
 * רשת כרטיסי בחירה למשחקי רב-ברירה. כל כרטיס מציג emoji + טקסט, מגיב ללחיצה,
 * וניתן להדגיש / לנטרל / לאפס. משחקים רבים בונים את הסיבוב סביב החוזה הזה.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOptionCards } from '../../ui/option-cards.js';
import { mountContainer } from '../helpers.js';

let container;
beforeEach(() => { container = mountContainer(); });

const OPTIONS = [
  { id: 'a', text: 'אוֹר',   emoji: '🌞' },
  { id: 'b', text: 'בַּיִת', emoji: '🏠' },
  { id: 'c', text: 'גָּמָל', emoji: '🐫' },
];

describe('createOptionCards — rendering', () => {
  it('renders one button per option with matching id, text, and emoji', () => {
    createOptionCards(container, OPTIONS, () => {});

    const cards = container.querySelectorAll('.option-card');
    expect(cards).toHaveLength(3);
    expect(cards[0].dataset.id).toBe('a');
    expect(cards[0].querySelector('.option-card__text').textContent).toBe('אוֹר');
    expect(cards[0].querySelector('.option-card__emoji').textContent).toBe('🌞');
  });

  it('replaces any existing contents of the container', () => {
    container.innerHTML = '<span class="old">stale</span>';
    createOptionCards(container, OPTIONS, () => {});
    expect(container.querySelector('.old')).toBeNull();
  });

  it('tolerates options with no emoji', () => {
    createOptionCards(container, [{ id: 'x', text: 'הלום' }], () => {});
    const card = container.querySelector('.option-card');
    expect(card.querySelector('.option-card__text').textContent).toBe('הלום');
    expect(card.querySelector('.option-card__emoji').textContent).toBe('');
  });
});

describe('createOptionCards — click', () => {
  it('calls onSelect with the selected option', () => {
    const onSelect = vi.fn();
    createOptionCards(container, OPTIONS, onSelect);

    container.querySelectorAll('.option-card')[1].click();

    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith(OPTIONS[1]);
  });
});

describe('createOptionCards — highlight', () => {
  it('applies a type-specific class to the matching card', () => {
    const cards = createOptionCards(container, OPTIONS, () => {});
    cards.highlight('b', 'correct');

    const [, bCard] = container.querySelectorAll('.option-card');
    expect(bCard.classList.contains('option-card--correct')).toBe(true);
  });

  it('leaves other cards unchanged', () => {
    const cards = createOptionCards(container, OPTIONS, () => {});
    cards.highlight('a', 'wrong');

    const nodes = container.querySelectorAll('.option-card');
    expect(nodes[0].classList.contains('option-card--wrong')).toBe(true);
    expect(nodes[1].classList.contains('option-card--wrong')).toBe(false);
    expect(nodes[2].classList.contains('option-card--wrong')).toBe(false);
  });
});

describe('createOptionCards — disable / reset', () => {
  it('disable() blocks further clicks from invoking onSelect', () => {
    const onSelect = vi.fn();
    const cards = createOptionCards(container, OPTIONS, onSelect);

    cards.disable();
    container.querySelectorAll('.option-card').forEach(el => el.click());

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('reset() re-enables the cards and clears state classes', () => {
    const onSelect = vi.fn();
    const cards = createOptionCards(container, OPTIONS, onSelect);

    cards.highlight('a', 'correct');
    cards.disable();
    cards.reset();

    const nodes = container.querySelectorAll('.option-card');
    expect(nodes[0].className).toBe('option-card');
    expect(nodes[0].disabled).toBe(false);

    nodes[0].click();
    expect(onSelect).toHaveBeenCalledOnce();
  });
});

describe('createOptionCards — destroy', () => {
  it('empties the container', () => {
    const cards = createOptionCards(container, OPTIONS, () => {});
    cards.destroy();
    expect(container.innerHTML).toBe('');
  });
});
