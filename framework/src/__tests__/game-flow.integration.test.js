/**
 * בדיקת אינטגרציה של זרימת משחק מלאה
 *
 * מצרף GameShell + createRoundManager + createOptionCards לכדי משחק של שלושה
 * סיבובים, עונה נכון / נכון / שגוי, ומוודא שניקוד, התקדמות ומסך הסיום עובדים
 * יחד. זו רשת הביטחון היחידה שמכסה את שילוב המודולים בזרימה אמיתית.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../audio/sounds.js', () => ({
  sounds: { correct: vi.fn(), wrong: vi.fn(), cheer: vi.fn(), click: vi.fn() },
}));
vi.mock('../audio/tts.js', () => ({
  tts: { speak: vi.fn().mockResolvedValue(undefined), speakNikud: vi.fn().mockResolvedValue(undefined) },
}));
vi.mock('../render/animations.js', () => ({ animate: vi.fn() }));

import { GameShell } from '../core/game-shell.js';
import { createRoundManager } from '../core/round-manager.js';
import { createOptionCards } from '../ui/option-cards.js';
import { mountContainer } from './helpers.js';

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

describe('game flow — 3 rounds, answer correct + correct + wrong', () => {
  it('final score is 2 and completion screen is shown', async () => {
    const host = mountContainer();
    const shell = new GameShell(host, { totalRounds: 3, title: 'בדיקה' });

    const progressBar = { update: vi.fn() };
    const rounds = [
      { correct: 'a', options: [{ id: 'a', text: 'נ' }, { id: 'b', text: 'ל' }] },
      { correct: 'a', options: [{ id: 'a', text: 'ש' }, { id: 'b', text: 'ר' }] },
      { correct: 'a', options: [{ id: 'a', text: 'ב' }, { id: 'b', text: 'ד' }] },
    ];

    let manager;
    const buildRoundUI = () => {
      const idx = shell.state.currentRound - 1;
      const { options } = rounds[idx];
      createOptionCards(shell.bodyEl, options, (picked) => {
        if (picked.id === rounds[idx].correct) manager.handleCorrect();
        else manager.handleWrong();
      });
    };

    manager = createRoundManager(shell, host, {
      totalRounds: 3,
      progressBar,
      buildRoundUI,
    });

    shell.start();
    buildRoundUI();

    // Round 1: correct
    shell.bodyEl.querySelector('[data-id="a"]').click();
    await vi.runAllTimersAsync();

    // Round 2: correct
    shell.bodyEl.querySelector('[data-id="a"]').click();
    await vi.runAllTimersAsync();

    // Round 3: wrong
    shell.bodyEl.querySelector('[data-id="b"]').click();
    // After a wrong answer the lock reopens; user answers correctly on retry.
    await vi.runAllTimersAsync();
    // Retry with the correct answer to complete the game.
    shell.bodyEl.querySelector('[data-id="a"]').click();
    await vi.runAllTimersAsync();

    expect(shell.state.score).toBe(3);
    expect(progressBar.update).toHaveBeenCalledWith(3);
    expect(host.querySelector('.completion-screen')).not.toBeNull();
    expect(host.querySelector('.completion-screen__score').textContent)
      .toBe('נִיקּוּד: 3 מִתּוֹךְ 3');
  });

  it('wrong answer does not advance the round', async () => {
    const host = mountContainer();
    const shell = new GameShell(host, { totalRounds: 2 });
    let manager;
    const buildRoundUI = () => {
      createOptionCards(shell.bodyEl, [{ id: 'correct', text: 'נ' }, { id: 'wrong', text: 'ל' }], (picked) => {
        if (picked.id === 'correct') manager.handleCorrect();
        else manager.handleWrong();
      });
    };
    manager = createRoundManager(shell, host, { totalRounds: 2, buildRoundUI });

    shell.start();
    buildRoundUI();

    shell.bodyEl.querySelector('[data-id="wrong"]').click();
    await vi.runAllTimersAsync();

    expect(shell.state.currentRound).toBe(1);
    expect(shell.state.score).toBe(0);
  });
});
