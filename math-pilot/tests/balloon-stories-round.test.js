import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createScope } from '../src/shell/scope.js';
import { Feedback } from '../src/shell/feedback.svelte.js';
import { RoundRunner } from '../src/shell/round-runner.svelte.js';
import { StoryRound } from '../src/games/balloon-stories/story-round.svelte.js';
import {
  COUNT_HINTS, COUNT_MS, HINT_MS, MATCH_HINT, NUMBER_HINT, STAGGER_MS, STORY_AGAIN_HINT, STORY_HINT,
  readingMs, resultFor, storyFor,
} from '../src/games/balloon-stories/logic.js';

/** @param {import('../src/games/balloon-stories/logic.js').Round} round */
function setup(round) {
  const scope = createScope();
  const runner = new RoundRunner([round], { transitionMs: 2600 });
  const story = new StoryRound(round, { scope, runner, feedback: new Feedback(scope, HINT_MS) });
  return { scope, runner, story };
}

/** Plays the story up to its question. @param {StoryRound} story */
async function untilQuestion(story) {
  void story.play();
  for (const beat of storyFor(story.round).slice(0, -1)) await vi.advanceTimersByTimeAsync(readingMs(beat.text));
}

/** @param {StoryRound} story */
const states = story => story.balloons.map(balloon => balloon.state);

/**
 * A tap, then the moment the runner opens the round again, as between two taps in the browser.
 * @param {StoryRound} story @param {import('../src/games/balloon-stories/story-round.svelte.js').Choice} choice
 */
async function tap(story, choice) {
  story.choose(choice);
  await vi.advanceTimersByTimeAsync(0);
}

describe('a balloon-stories round', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('tells the story one sentence at a time, and the picture and exercise build with it', async () => {
    const round = /** @type {const} */ ({ kind: 'take', a: 5, b: 2, look: 'balloons' });
    const [start, change] = storyFor(round);
    const { story } = setup(round);
    void story.play();
    expect(story.lines.map(line => line.text)).toEqual([start.text]);
    expect(story.equation).toBe('5');
    expect(states(story)).toEqual(Array(5).fill('shown'));
    // The choices wait for the question.
    expect(story.isOpen(3)).toBe(false);

    await vi.advanceTimersByTimeAsync(readingMs(start.text));
    expect(story.lines).toHaveLength(2);
    expect(story.equation).toBe('5 − 2');
    // The balloons pop one after another, at the end of the row.
    expect(states(story)).toEqual(['shown', 'shown', 'shown', 'popped', 'shown']);
    await vi.advanceTimersByTimeAsync(STAGGER_MS);
    expect(states(story)).toEqual(['shown', 'shown', 'shown', 'popped', 'popped']);

    await vi.advanceTimersByTimeAsync(readingMs(change.text) - STAGGER_MS);
    expect(story.lines.map(line => line.text)).toEqual(storyFor(round).map(beat => beat.text));
    expect(story.lines.at(-1).motion).toBe('appear');
    expect(story.equation).toBe('5 − 2 = ?');
    expect(story.isOpen(3)).toBe(true);
  });

  it('helps after each wrong answer: the story again, counting on the picture, then the answer marked', async () => {
    const round = /** @type {const} */ ({ kind: 'take', a: 5, b: 2, look: 'balloons' });
    const { story, runner } = setup(round);
    await untilQuestion(story);
    const wrong = story.choices.filter(value => value !== 3);
    expect(wrong).toHaveLength(3);

    await tap(story, wrong[0]);
    expect(story.feedback.text).toBe(STORY_AGAIN_HINT);
    expect(story.lines).toHaveLength(1);
    expect(story.isOpen(wrong[0])).toBe(false);
    // Reading the story again keeps the other choices open.
    expect(story.isOpen(3)).toBe(true);

    await tap(story, wrong[1]);
    expect(story.feedback.text).toBe(COUNT_HINTS.take);
    // The whole story is back at once, and the balloons that are left get numbers.
    expect(story.lines.every(line => line.motion === 'none')).toBe(true);
    expect(story.lines).toHaveLength(3);
    expect(states(story)).toEqual(['shown', 'shown', 'shown', 'popped', 'popped']);
    expect(story.balloons.map(balloon => balloon.count)).toEqual([1, 0, 0, 0, 0]);
    await vi.advanceTimersByTimeAsync(2 * COUNT_MS);
    expect(story.balloons.map(balloon => balloon.count)).toEqual([1, 2, 3, 0, 0]);

    await tap(story, wrong[2]);
    expect(story.feedback.text).toBe(NUMBER_HINT);
    expect(story.marked).toBe(3);

    await tap(story, 3);
    expect(story.solved).toBe(true);
    expect(story.lines.at(-1)).toMatchObject({ text: resultFor(round), result: true });
    expect(story.feedback.tone).toBe('correct');
    expect(runner.solved).toBe(1);
    expect(story.choices.some(value => story.isOpen(value))).toBe(false);
    // The counting stopped with the answer.
    expect(story.balloons.every(balloon => balloon.count === 0)).toBe(true);
  });

  it('matches an exercise to its story, and marks the right story after two misses', async () => {
    const round = /** @type {const} */ ({ kind: 'match', op: '-', a: 5, b: 2, look: 'dots' });
    const { story } = setup(round);
    void story.play();
    expect(story.equation).toBe('5 − 2');
    expect(story.isOpen('right')).toBe(true);
    // Each card carries its finished picture.
    const pictures = Object.fromEntries(story.cards.map(card => [card.id, card.balloons.map(balloon => balloon.state)]));
    expect(pictures.right).toEqual(['shown', 'shown', 'shown', 'popped', 'popped']);
    expect(pictures.operation).toEqual(Array(7).fill('shown'));
    expect(pictures.number).toEqual(['shown', 'shown', 'popped', 'popped', 'popped']);

    await tap(story, 'operation');
    expect(story.feedback.text).toBe(MATCH_HINT);
    await tap(story, 'number');
    expect(story.feedback.text).toBe(STORY_HINT);
    expect(story.marked).toBe('right');
    await tap(story, 'right');
    expect(story.equation).toBe('5 − 2 = ?');
    expect(story.answer).toBe(3);
    expect(story.solved).toBe(true);
  });

  it('pairs the balloons when comparing, and fills the empty places when completing', async () => {
    const compare = setup({ kind: 'compare', a: 5, b: 3, look: 'balloons' }).story;
    void compare.play();
    expect(states(compare)).toEqual([...Array(5).fill('shown'), ...Array(3).fill('hidden')]);
    await untilQuestion(compare);
    expect(compare.paired).toBe(true);
    expect(compare.equation).toBe('5 − 3 = ?');
    expect(states(compare)).toEqual(Array(8).fill('shown'));

    const missing = setup({ kind: 'missing', a: 4, b: 7, look: 'balloons' }).story;
    void missing.play();
    expect(states(missing)).toEqual(Array(7).fill('empty'));
    expect(missing.equation).toBe('');
    await untilQuestion(missing);
    expect(states(missing)).toEqual([...Array(4).fill('shown'), ...Array(3).fill('empty')]);
    expect(missing.equation).toBe('4 + ? = 7');
  });

  it('stops when the round is gone, and a new telling stops the old one', async () => {
    const round = /** @type {const} */ ({ kind: 'add', a: 3, b: 2, look: 'balloons' });
    const first = setup(round);
    void first.story.play();
    first.scope.dispose();
    await vi.advanceTimersByTimeAsync(20_000);
    expect(first.story.lines).toHaveLength(1);

    const { story } = setup(round);
    void story.play();
    await vi.advanceTimersByTimeAsync(readingMs(storyFor(round)[0].text));
    void story.play();
    await vi.advanceTimersByTimeAsync(20_000);
    expect(story.lines.map(line => line.text)).toEqual(storyFor(round).map(beat => beat.text));
    expect(states(story)).toEqual(Array(5).fill('shown'));
  });
});
