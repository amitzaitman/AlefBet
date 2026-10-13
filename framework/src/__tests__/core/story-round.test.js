import { it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoundScope } from '../../core/round-scope.js';
import { createRoundManager } from '../../core/round-manager.js';
import { makeShellStub } from '../helpers.js';

// A voice that takes 20 ms per sentence and records what it was asked to say; cancel ends everything.
const voice = vi.hoisted(() => ({ said: [], held: [] }));
vi.mock('../../audio/tts.js', () => ({
  tts: {
    speak: vi.fn(text => new Promise(resolve => {
      voice.said.push(text);
      voice.held.push(resolve);
      setTimeout(resolve, 20);
    })),
    cancel: vi.fn(() => { for (const resolve of voice.held.splice(0)) resolve(); }),
  },
}));

const BEATS = [
  { text: 'יֵשׁ 3.', say: 'יֵשׁ שָׁלוֹשׁ.', equation: '3', scene: 'start' },
  { text: 'בָּאוּ 2.', say: 'בָּאוּ שְׁתַּיִם.', equation: '3 + 2', scene: 'change' },
  { text: 'כַּמָּה?', say: 'כַּמָּה עַכְשָׁיו?', equation: '3 + 2 = ?', scene: 'question' },
];
const LADDER = [
  { hint: 'שׁוּב', action: 'replay' },
  { hint: 'סִפְרוּ', action: 'count' },
  { hint: 'מְסֻמָּן', action: 'mark' },
];
const RESULT = { text: 'יֵשׁ 5.', say: 'יֵשׁ חָמֵשׁ.' };

/** A picture that records its steps; counting has three items and a total. */
function fakeScene(log) {
  const root = document.createElement('div');
  return {
    root,
    reset: () => log.push('reset'),
    settle: () => log.push('settle'),
    start: live => { log.push(`start:${live()}`); },
    change: live => { log.push(`change:${live()}`); },
    question: live => { log.push(`question:${live()}`); },
    counting: () => ({
      items: [1, 2, 3].map(n => ({ say: `מִלָּה ${n}`, mark: () => log.push(`mark ${n}`) })),
      total: 'שָׁלוֹשׁ קְפִיצוֹת',
    }),
    clearCount: () => log.push('clearCount'),
  };
}

/**
 * A round on a real round manager, with a fresh story-round module (so its speech counter starts at zero).
 * @param {object} [spec] overrides for the round spec
 */
async function setup(spec = {}) {
  vi.resetModules();
  const { createStoryRound } = await import('../../core/story-round.js');
  const { tts } = await import('../../audio/tts.js');
  const shell = makeShellStub(2);
  shell.state.nextRound();
  document.body.append(shell.container);
  const scope = createRoundScope();
  const manager = createRoundManager(shell, document.createElement('div'), {
    totalRounds: 2, buildRoundUI: () => scope.dispose(), playCorrectSound: false, transitionMs: 2600,
  });
  shell.on('end', () => scope.dispose());
  const isActive = () => !shell.ended && !scope.signal.aborted;
  const log = [];
  const scene = fakeScene(log);
  const tools = {};
  const round = createStoryRound({
    shell, scope, isActive, index: 0, round: {}, schedule: scope.schedule,
    isAnswered: () => !isActive() || manager.isAnswered(),
    subscribeAnswered: listener => scope.use(manager.subscribe(listener)),
    onCorrect: async action => { if (isActive()) await manager.handleCorrect(action); },
    onWrong: async action => { if (isActive()) await manager.handleWrong(action); },
  }, given => {
    Object.assign(tools, given);
    return { beats: BEATS, scene, choices: { values: [4, 5, 6, 7], answer: 5 }, result: RESULT, ladder: LADDER, ...spec };
  });
  const $ = selector => shell.container.querySelector(selector);
  const $$ = selector => [...shell.container.querySelectorAll(selector)];
  return {
    round, shell, scope, log, tools, tts, $, $$,
    lines: () => $$('.story-line').map(line => line.textContent),
    equation: () => $('.story-equation').textContent,
    choice: value => /** @type {HTMLButtonElement} */ ($(`.story-choice[data-value="${value}"]`)),
    feedback: () => $('.feedback-message').textContent,
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  voice.said = [];
  voice.held = [];
});
afterEach(() => { delete navigator.userActivation; });

it('adds one line per beat, builds the equation and plays the scene steps in order', async () => {
  const { lines, equation, log, $$, round, shell } = await setup();
  expect(lines()).toEqual(['יֵשׁ 3.']);
  expect(equation()).toBe('3');
  await vi.advanceTimersByTimeAsync(1200);
  expect(lines()).toEqual(['יֵשׁ 3.', 'בָּאוּ 2.']);
  expect($$('.story-line--now').map(line => line.textContent)).toEqual(['בָּאוּ 2.']);
  expect(equation()).toBe('3 + 2');
  await vi.advanceTimersByTimeAsync(1200);
  expect(equation()).toBe('3 + 2 = ?');
  expect($$('.story-unknown').map(node => node.textContent)).toEqual(['?']);
  expect(log).toEqual(['clearCount', 'reset', 'start:true', 'change:true', 'question:true']);
  expect(voice.said).toEqual(BEATS.map(beat => beat.say));
  expect(round.host.classList.contains('story-round')).toBe(true);
  shell.end();
});

it('locks the answers until the question, and "again" once answered', async () => {
  const { choice, $, $$, shell } = await setup();
  const again = /** @type {HTMLButtonElement} */ ($('.story-again'));
  expect($$('.story-choice').every(button => button.disabled)).toBe(true);
  choice(5).click();
  await vi.advanceTimersByTimeAsync(2399);
  expect(choice(5).disabled).toBe(true);
  await vi.advanceTimersByTimeAsync(1);
  expect($$('.story-choice').every(button => !button.disabled)).toBe(true);
  expect(again.disabled).toBe(false);
  choice(5).click();
  expect(again.disabled).toBe(true);
  expect(choice(5).classList.contains('story-pick--correct')).toBe(true);
  shell.end();
});

it('speaks an act beat first, then waits for the child before the next beat', async () => {
  let done;
  const log = [];
  const scene = { ...fakeScene(log), change: () => { log.push('act'); return new Promise(resolve => { done = resolve; }); } };
  const beats = BEATS.map((beat, k) => (k === 1 ? { ...beat, act: true } : beat));
  const { lines, shell } = await setup({ beats, scene });
  await vi.advanceTimersByTimeAsync(1200 + 1199);
  expect(log).not.toContain('act');
  await vi.advanceTimersByTimeAsync(1);
  expect(log).toContain('act');
  await vi.advanceTimersByTimeAsync(10_000);
  expect(lines()).toHaveLength(2);
  done();
  await vi.advanceTimersByTimeAsync(0);
  expect(lines()).toHaveLength(3);
  shell.end();
});

it('climbs the hint ladder: the story again, counting aloud, then the marked answer', async () => {
  const { choice, log, lines, feedback, shell } = await setup({ retireTried: false });
  await vi.advanceTimersByTimeAsync(3600);
  log.length = 0;

  choice(4).click();
  await vi.advanceTimersByTimeAsync(0);
  expect(feedback()).toBe('שׁוּב');
  expect(lines()).toEqual(['יֵשׁ 3.']);
  expect(log.slice(0, 2)).toEqual(['clearCount', 'reset']);
  await vi.advanceTimersByTimeAsync(3600);

  log.length = 0;
  voice.said = [];
  choice(4).click();
  await vi.advanceTimersByTimeAsync(0);
  expect(feedback()).toBe('סִפְרוּ');
  expect(lines()).toHaveLength(3);
  expect(log).toEqual(['clearCount', 'settle', 'mark 1']);
  await vi.advanceTimersByTimeAsync(700 * 3);
  expect(log.slice(2)).toEqual(['mark 1', 'mark 2', 'mark 3']);
  expect(voice.said).toEqual(['מִלָּה 1', 'מִלָּה 2', 'מִלָּה 3', 'שָׁלוֹשׁ קְפִיצוֹת']);

  choice(4).click();
  await vi.advanceTimersByTimeAsync(0);
  expect(feedback()).toBe('מְסֻמָּן');
  expect(choice(5).classList.contains('story-pick--hint')).toBe(true);
  // The last step repeats.
  choice(6).click();
  await vi.advanceTimersByTimeAsync(0);
  expect(feedback()).toBe('מְסֻמָּן');
  shell.end();
});

it('stops counting when the story starts again', async () => {
  const { choice, log, $, shell } = await setup({ retireTried: false });
  await vi.advanceTimersByTimeAsync(2400);
  choice(4).click();
  await vi.advanceTimersByTimeAsync(3600);
  choice(4).click();
  await vi.advanceTimersByTimeAsync(700);
  /** @type {HTMLButtonElement} */ ($('.story-again')).click();
  await vi.advanceTimersByTimeAsync(5000);
  expect(log.filter(entry => entry.startsWith('mark'))).toEqual(['mark 1', 'mark 2']);
  shell.end();
});

it('retires a tried answer only with retireTried', async () => {
  const retired = await setup();
  await vi.advanceTimersByTimeAsync(2400);
  retired.choice(4).click();
  await vi.advanceTimersByTimeAsync(0);
  expect(retired.choice(4).classList.contains('story-pick--tried')).toBe(true);
  expect(retired.choice(4).disabled).toBe(true);
  expect(retired.choice(6).disabled).toBe(false);
  retired.shell.end();

  const kept = await setup({ retireTried: false });
  await vi.advanceTimersByTimeAsync(2400);
  kept.choice(4).click();
  await vi.advanceTimersByTimeAsync(0);
  expect(kept.choice(4).classList.contains('story-pick--tried')).toBe(false);
  expect(kept.choice(4).disabled).toBe(false);
  kept.shell.end();
});

it('awaits onMiss with the answers locked, before the ladder', async () => {
  let release;
  const onMiss = vi.fn(() => new Promise(resolve => { release = resolve; }));
  const { choice, $$, feedback, round, shell } = await setup({ onMiss, retireTried: false });
  await vi.advanceTimersByTimeAsync(2400);
  choice(6).click();
  expect(onMiss).toHaveBeenCalledWith(6, expect.any(Function));
  expect(onMiss.mock.calls[0][1]()).toBe(true);
  await vi.advanceTimersByTimeAsync(1000);
  expect($$('.story-choice').every(button => button.disabled)).toBe(true);
  expect(feedback()).toBe('');
  expect(round.misses).toBe(1);
  release();
  await vi.advanceTimersByTimeAsync(0);
  expect(feedback()).toBe('שׁוּב');
  expect(choice(6).disabled).toBe(false);
  shell.end();
});

it('on a right pick settles, awaits beforeResult, shows the answer and the result, then speaks it after a hush', async () => {
  let release;
  const beforeResult = vi.fn(() => new Promise(resolve => { release = resolve; }));
  const { choice, log, $, lines, tts, shell } = await setup({ beforeResult });
  await vi.advanceTimersByTimeAsync(2400);
  // The question is still being spoken, so the answer cuts it.
  log.length = 0;
  choice(5).click();
  expect(choice(5).classList.contains('story-pick--correct')).toBe(true);
  expect(log).toEqual(['clearCount', 'settle']);
  expect(tts.cancel).toHaveBeenCalledOnce();
  expect(beforeResult).toHaveBeenCalledOnce();
  expect($('.story-solved')).toBeNull();
  release();
  await vi.advanceTimersByTimeAsync(0);
  expect($('.story-solved').textContent).toBe('5');
  expect(lines().at(-1)).toBe('יֵשׁ 5.');
  expect($('.story-line--result.story-line--now')).not.toBeNull();
  voice.said = [];
  await vi.advanceTimersByTimeAsync(249);
  expect(voice.said).toEqual([]);
  await vi.advanceTimersByTimeAsync(1);
  expect(voice.said).toEqual(['יֵשׁ חָמֵשׁ.']);
  shell.end();
});

it('shows only the solved equation when resultLine is false, and speaks at once when nothing was cut', async () => {
  const { choice, $, lines, equation, shell } = await setup({ resultLine: false, solvedEquation: '3 + 2 = ?' });
  await vi.advanceTimersByTimeAsync(3600);
  voice.said = [];
  choice(5).click();
  expect(equation()).toBe('3 + 2 = 5');
  expect($('.story-solved').textContent).toBe('5');
  expect(lines()).toHaveLength(3);
  await vi.advanceTimersByTimeAsync(0);
  expect(voice.said).toEqual(['יֵשׁ חָמֵשׁ.']);
  shell.end();
});

it('highlights only the terms each beat adds', async () => {
  const { $$, shell } = await setup({ highlight: true });
  const fresh = () => $$('.story-term--new').map(node => node.textContent);
  expect(fresh()).toEqual(['3']);
  await vi.advanceTimersByTimeAsync(1200);
  expect(fresh()).toEqual(['+', '2']);
  await vi.advanceTimersByTimeAsync(1200);
  expect(fresh()).toEqual(['=', '?']);
  shell.end();
  const plain = await setup();
  expect(plain.$$('.story-term--new')).toHaveLength(0);
  plain.shell.end();
});

it('waits for a first tap before the story when speech needs one', async () => {
  Object.defineProperty(navigator, 'userActivation', { configurable: true, value: { hasBeenActive: false } });
  const { $, $$, lines, shell } = await setup();
  const start = /** @type {HTMLButtonElement} */ ($('.story-start'));
  expect(start.textContent).toBe('▶ הַקְשִׁיבוּ לַסִּפּוּר');
  expect(/** @type {HTMLButtonElement} */ ($('.story-again')).hidden).toBe(true);
  await vi.advanceTimersByTimeAsync(10_000);
  expect(lines()).toEqual([]);
  expect($$('.story-choice').every(button => button.disabled)).toBe(true);
  start.click();
  expect($('.story-start')).toBeNull();
  expect(/** @type {HTMLButtonElement} */ ($('.story-again')).hidden).toBe(false);
  expect(lines()).toEqual(['יֵשׁ 3.']);
  shell.end();
});

it('builds story cards in the given order with their data, and marks the right one', async () => {
  const card = (id, label) => ({ id, label, picture: document.createElement('div'), data: { op: '+', a: '3' } });
  const { $, $$, round, shell } = await setup({
    choices: { cards: [card('number', 'א'), card('right', 'ב'), card('operation', 'ג')], right: 'right', answer: 5 },
    ladder: [LADDER[0], LADDER[2]],
  });
  const cards = $$('.story-card');
  expect(cards.map(node => node.dataset.id)).toEqual(['number', 'right', 'operation']);
  expect(cards.map(node => node.querySelector('.story-card__caption').textContent)).toEqual(['א', 'ב', 'ג']);
  expect(cards[0].dataset.op).toBe('+');
  expect(cards[0].dataset.a).toBe('3');
  expect(cards[0].getAttribute('aria-label')).toBe('א');
  expect(round.host.classList.contains('story-round--cards')).toBe(true);
  expect($('.story-choices')).toBeNull();
  await vi.advanceTimersByTimeAsync(2400);
  cards[0].click();
  await vi.advanceTimersByTimeAsync(3600);
  cards[2].click();
  await vi.advanceTimersByTimeAsync(0);
  expect(cards[1].classList.contains('story-pick--hint')).toBe(true);
  cards[1].click();
  expect($('.story-solved').textContent).toBe('5');
  shell.end();
});

it('cancels speech when the round is disposed, and adds nothing afterwards', async () => {
  const { scope, tts, lines, $, shell } = await setup();
  await vi.advanceTimersByTimeAsync(1210);
  expect(lines()).toHaveLength(2);
  scope.dispose();
  expect(tts.cancel).toHaveBeenCalledOnce();
  expect($('.feedback-message')).toBeNull();
  await vi.advanceTimersByTimeAsync(60_000);
  expect(lines()).toHaveLength(2);
  expect(vi.getTimerCount()).toBe(0);
  shell.end();
});
