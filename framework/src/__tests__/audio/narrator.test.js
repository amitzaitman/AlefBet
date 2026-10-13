import { it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoundScope } from '../../core/round-scope.js';

// A voice that holds every sentence until the test ends it; cancel ends them all, like tts.
const voice = vi.hoisted(() => ({ held: [], endAtOnce: false }));
vi.mock('../../audio/tts.js', () => ({
  tts: {
    speak: vi.fn(text => (voice.endAtOnce ? Promise.resolve() : new Promise(resolve => { voice.held.push({ text, resolve }); }))),
    cancel: vi.fn(() => { for (const item of voice.held.splice(0)) item.resolve(); }),
  },
}));

/** A fresh narrator module (its speech counter starts at zero), the mocked tts and one narrator. */
async function setup() {
  vi.resetModules();
  const module = await import('../../audio/narrator.js');
  const { tts } = await import('../../audio/tts.js');
  const scope = createRoundScope();
  return { ...module, tts, scope, narrator: module.createNarrator(scope) };
}

/** Records when a promise settles. */
function track(promise) {
  const state = { done: false };
  promise.then(() => { state.done = true; });
  return state;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  voice.held = [];
  voice.endAtOnce = false;
});
afterEach(() => vi.unstubAllGlobals());

it('holds a sentence for the beat even when the voice ends at once', async () => {
  voice.endAtOnce = true;
  const { narrator } = await setup();
  const sentence = track(narrator.say('לְנוֹעָה יֵשׁ 5 בָּלוֹנִים.'));
  await vi.advanceTimersByTimeAsync(1199);
  expect(sentence.done).toBe(false);
  await vi.advanceTimersByTimeAsync(1);
  expect(sentence.done).toBe(true);
});

it('gives up on a voice that never ends after min + 1500 + 120 per letter, nikud not counted', async () => {
  const { narrator } = await setup();
  // 'שָׁלוֹם' and 'שלום' both have 4 letters: 1200 + 1500 + 480.
  const voweled = track(narrator.say('שָׁלוֹם'));
  const plain = track(narrator.say('שלום'));
  await vi.advanceTimersByTimeAsync(3179);
  expect([voweled.done, plain.done]).toEqual([false, false]);
  await vi.advanceTimersByTimeAsync(1);
  expect([voweled.done, plain.done]).toEqual([true, true]);
});

it('settles a sentence when its speech ends between the beat and the limit', async () => {
  const { narrator } = await setup();
  const sentence = track(narrator.say('שָׁלוֹם'));
  await vi.advanceTimersByTimeAsync(2000);
  expect(sentence.done).toBe(false);
  voice.held[0].resolve();
  await vi.advanceTimersByTimeAsync(0);
  expect(sentence.done).toBe(true);
});

it('hushes only when there is speech', async () => {
  const { narrator, tts } = await setup();
  expect(narrator.hush()).toBe(false);
  expect(tts.cancel).not.toHaveBeenCalled();

  void narrator.speak('שָׁלוֹם');
  expect(narrator.hush()).toBe(true);
  expect(tts.cancel).toHaveBeenCalledOnce();
  await vi.advanceTimersByTimeAsync(0);
  expect(narrator.hush()).toBe(false);
  expect(tts.cancel).toHaveBeenCalledOnce();
});

it('cancels speech on dispose, leaves no timers, and never settles afterwards', async () => {
  const { narrator, tts, scope } = await setup();
  const sentence = track(narrator.say('שָׁלוֹם'));
  scope.dispose();
  expect(tts.cancel).toHaveBeenCalledOnce();
  expect(vi.getTimerCount()).toBe(0);
  const later = track(narrator.say('עוֹד'));
  const pause = track(narrator.wait(10));
  await vi.advanceTimersByTimeAsync(60_000);
  expect([sentence.done, later.done, pause.done]).toEqual([false, false, false]);
});

it('still sees the cut sentence when the next round starts in the same tick', async () => {
  const { narrator, createNarrator, tts, scope } = await setup();
  void narrator.speak('כָּל הַכָּבוֹד');
  // runGame disposes the old round and builds the next one before any microtask runs,
  // so the next round's first hush() is true and it pauses HUSH_MS before speaking.
  scope.dispose();
  expect(createNarrator(createRoundScope()).hush()).toBe(true);
  expect(tts.cancel).toHaveBeenCalledTimes(2);
});

it('needsTap follows navigator.userActivation and is false without it', async () => {
  const { needsTap } = await setup();
  vi.stubGlobal('navigator', { userActivation: { hasBeenActive: false } });
  expect(needsTap()).toBe(true);
  vi.stubGlobal('navigator', { userActivation: { hasBeenActive: true } });
  expect(needsTap()).toBe(false);
  vi.stubGlobal('navigator', {});
  expect(needsTap()).toBe(false);
});
