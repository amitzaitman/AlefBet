/**
 * Balloon stories: addition and subtraction up to 10 through a short story
 * that happens on the screen. Every round shows the same facts three ways,
 * picture, exercise and story, so each one is enough to solve it. The stages
 * move through the meanings of the operations (take away, add, compare,
 * complete) and end the other way round: from an exercise to its story.
 * Ported from games/balloon-stories with the same rounds, choices, stories
 * and hints. The pilot has no audio, so the story is read, not heard.
 */
import { HOLD_MS, readingMs } from '../../lib/reading.js';
import { shuffle } from '../../lib/shuffle.js';

export const TITLE = 'סִפּוּרֵי בָּלוֹנִים';
export const DESCRIPTION = 'סִפּוּר קָצָר קוֹרֶה עַל הַמָּסָךְ, וּבוֹ מְגַלִּים חִבּוּר וְחִסּוּר עַד 10';

/** Gap between balloons that pop, arrive or fill one after another. */
export const STAGGER_MS = 280;
/** After a change on the picture, the next sentence waits this long, so the change is seen. */
export const LOOK_MS = 800;
/** How long each balloon stays the newest one while the picture is counted. */
export const COUNT_MS = 700;

/** The help after each wrong answer goes back to the picture: the story, then counting, then the answer. */
export const STORY_AGAIN_HINT = 'בּוֹאוּ נִקְרָא שׁוּב אֶת הַסִּפּוּר';
export const COUNT_HINTS = {
  take: 'סִפְרוּ אֶת הַבָּלוֹנִים שֶׁנִּשְׁאֲרוּ',
  add: 'סִפְרוּ אֶת כָּל הַבָּלוֹנִים',
  compare: 'סִפְרוּ אֶת הַבָּלוֹנִים שֶׁאֵין לָהֶם זוּג',
  missing: 'סִפְרוּ אֶת הַמְּקוֹמוֹת הָרֵיקִים',
};
export const NUMBER_HINT = 'נַסּוּ אֶת הַמִּסְפָּר הַמְּסֻמָּן';
export const MATCH_HINT = 'סִפְרוּ אֶת הַבָּלוֹנִים בְּכָל סִפּוּר';
export const STORY_HINT = 'נַסּוּ אֶת הַסִּפּוּר הַמְּסֻמָּן';
export const AGAIN = 'עוֹד פַּעַם 🔁';
export const AGAIN_LABEL = 'הַסִּפּוּר עוֹד פַּעַם';

/**
 * take: a balloons, b pop. add: a balloons, b more arrive.
 * compare: Noa has a, Dani has b. missing: Noa has a and wants b.
 * match: the exercise `a op b`, answered by choosing its story.
 * @typedef {{ kind: 'take' | 'add' | 'compare' | 'missing' | 'match', a: number, b: number, op?: '+' | '-', look: 'balloons' | 'dots' }} Round
 */

/** @param {number} min @param {number} max */
const randomInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

/**
 * One round of the given kind. Story changes are always at least 2, so every
 * sentence in the story itself is plural; only answers can be 1.
 * @param {{ kind: Round['kind'], max?: number, op?: '+' | '-', look?: Round['look'] }} plan
 * @returns {Round}
 */
export function createRound({ kind, max = 10, op = '-', look = 'balloons' }) {
  if (kind === 'take') {
    const a = randomInt(4, max);
    return { kind, look, a, b: randomInt(2, Math.min(4, a - 1)) };
  }
  if (kind === 'add') {
    const total = randomInt(5, max);
    const b = randomInt(2, Math.min(4, total - 2));
    return { kind, look, a: total - b, b };
  }
  if (kind === 'compare') {
    const a = randomInt(4, max);
    return { kind, look, a, b: randomInt(Math.max(2, a - 4), a - 1) };
  }
  if (kind === 'missing') {
    const b = randomInt(5, max);
    return { kind, look, a: randomInt(Math.max(2, b - 4), b - 1), b };
  }
  // Every story card must fit: the other operation and one more balloon stay within 10.
  const b = randomInt(2, 3);
  const a = op === '-' ? randomInt(b + 2, 10 - b) : randomInt(b + 1, 9 - b);
  return { kind, look: 'dots', op, a, b };
}

/**
 * Three stages of three rounds. Each of the first two stages ends with plain
 * circles instead of drawn balloons: a step from the picture toward the exercise.
 * @returns {Round[]}
 */
export function createRounds() {
  return [
    createRound({ kind: 'take', max: 7 }),
    createRound({ kind: 'add', max: 7 }),
    createRound({ kind: Math.random() < 0.5 ? 'take' : 'add', max: 8, look: 'dots' }),
    createRound({ kind: 'compare', max: 8 }),
    createRound({ kind: 'missing', max: 8 }),
    createRound({ kind: Math.random() < 0.5 ? 'compare' : 'missing', max: 8, look: 'dots' }),
    createRound({ kind: 'match', op: '-' }),
    createRound({ kind: 'match', op: '+' }),
    createRound({ kind: 'match', op: Math.random() < 0.5 ? '-' : '+' }),
  ];
}

/** @param {Round} round @returns {number} */
export function answerFor({ kind, a, b, op }) {
  if (kind === 'add' || (kind === 'match' && op === '+')) return a + b;
  if (kind === 'missing') return b - a;
  return a - b;
}

/**
 * Four choices in ascending order. The telling mistakes come first: the other
 * operation's result and a number taken straight from the story.
 * @param {Round} round
 * @returns {number[]}
 */
export function answerChoices(round) {
  const { kind, a, b } = round;
  const answer = answerFor(round);
  /** @type {Record<string, number[]>} */
  const tellingByKind = { take: [a + b, b], add: [a - b, b], compare: [a + b, b], missing: [b, a] };
  const telling = tellingByKind[kind] ?? [];
  const near = shuffle([answer - 1, answer + 1, answer - 2, answer + 2]);
  const distractors = [...new Set([...telling, ...near])].filter(n => n >= 0 && n <= 10 && n !== answer);
  return [answer, ...distractors.slice(0, 3)].sort((x, y) => x - y);
}

/** Digits in every sentence, so the story matches the exercise beside it. @param {number} n */
const balloons = n => (n === 1 ? 'בָּלוֹן אֶחָד' : `${n} בָּלוֹנִים`);

/** @param {'+' | '-'} op */
const sign = op => (op === '+' ? '+' : '−');

/**
 * @typedef {{ text: string, equation: string, scene: 'start' | 'change' | 'question' }} Beat
 */

/**
 * The story as beats: start, change and question. Each beat names the scene
 * step it plays and how much of the exercise is already written.
 * @param {Round} round
 * @returns {Beat[]}
 */
export function storyFor(round) {
  const { kind, a, b } = round;
  if (kind === 'take') {
    return [
      { text: `לְנוֹעָה יֵשׁ ${balloons(a)}.`, equation: `${a}`, scene: 'start' },
      { text: `${balloons(b)} הִתְפּוֹצְצוּ!`, equation: `${a} − ${b}`, scene: 'change' },
      { text: 'כַּמָּה בָּלוֹנִים נִשְׁאֲרוּ לְנוֹעָה?', equation: `${a} − ${b} = ?`, scene: 'question' },
    ];
  }
  if (kind === 'add') {
    return [
      { text: `לְנוֹעָה יֵשׁ ${balloons(a)}.`, equation: `${a}`, scene: 'start' },
      { text: `סָבְתָא הֵבִיאָה לָהּ עוֹד ${balloons(b)}.`, equation: `${a} + ${b}`, scene: 'change' },
      { text: 'כַּמָּה בָּלוֹנִים יֵשׁ לְנוֹעָה עַכְשָׁיו?', equation: `${a} + ${b} = ?`, scene: 'question' },
    ];
  }
  // Comparing and completing are not events, so their exercise appears with the question.
  if (kind === 'compare') {
    return [
      { text: `לְנוֹעָה יֵשׁ ${balloons(a)}.`, equation: '', scene: 'start' },
      { text: `לְדָנִי יֵשׁ ${balloons(b)}.`, equation: '', scene: 'change' },
      { text: 'כַּמָּה בָּלוֹנִים יֵשׁ לְנוֹעָה יוֹתֵר מִלְּדָנִי?', equation: `${a} − ${b} = ?`, scene: 'question' },
    ];
  }
  if (kind === 'missing') {
    return [
      { text: `נוֹעָה רוֹצָה ${balloons(b)}.`, equation: '', scene: 'start' },
      { text: `יֵשׁ לָהּ ${balloons(a)}.`, equation: '', scene: 'change' },
      { text: 'כַּמָּה בָּלוֹנִים חֲסֵרִים לָהּ?', equation: `${a} + ? = ${b}`, scene: 'question' },
    ];
  }
  return [{ text: 'אֵיזֶה סִפּוּר מַתְאִים לַתַּרְגִּיל?', equation: `${a} ${sign(round.op ?? '-')} ${b}`, scene: 'question' }];
}

/**
 * The closing sentence after a correct answer. A match round closes with
 * the whole exercise instead.
 * @param {Round} round
 * @returns {string}
 */
export function resultFor(round) {
  const c = answerFor(round);
  if (round.kind === 'take') return c === 1 ? `נִשְׁאַר לְנוֹעָה ${balloons(c)}.` : `נִשְׁאֲרוּ לְנוֹעָה ${balloons(c)}.`;
  if (round.kind === 'add') return `עַכְשָׁיו יֵשׁ לְנוֹעָה ${balloons(c)}.`;
  if (round.kind === 'compare') return `לְנוֹעָה יֵשׁ ${balloons(c)} יוֹתֵר.`;
  if (round.kind === 'missing') return c === 1 ? `חָסֵר לָהּ ${balloons(c)}.` : `חֲסֵרִים לָהּ ${balloons(c)}.`;
  return `${round.a} ${sign(round.op ?? '-')} ${round.b} = ${c}`;
}

/**
 * How long the story takes to reach its question. The setting comes with its
 * sentence; a change happens on the picture once its sentence has been read,
 * one balloon after another, and the child gets a moment to look at it.
 * @param {Round} round
 * @returns {number} milliseconds
 */
export function storyMs(round) {
  if (round.kind === 'match') return 0;
  const [start, change] = storyFor(round);
  return readingMs(start.text) + readingMs(change.text) + (scenePlan(round).change.length - 1) * STAGGER_MS + LOOK_MS;
}

/**
 * The pause after a correct answer: the closing sentence (or the finished
 * exercise) stays until it has been read, then the next round comes.
 * @param {Round} round
 * @returns {number} milliseconds
 */
export const pauseAfter = round => readingMs(resultFor(round)) + HOLD_MS;

/**
 * The right story, the same numbers with the other operation, and one more
 * balloon in the change. Every card is a take or add picture of at most 10.
 * @param {Round} round
 * @returns {StoryCard[]}
 */
export function matchOptions({ a, b, op = '-' }) {
  return [
    { id: 'right', op, a, b },
    { id: 'operation', op: op === '-' ? '+' : '-', a, b },
    { id: 'number', op, a, b: b + 1 },
  ];
}

/** @typedef {{ id: 'right' | 'operation' | 'number', op: '+' | '-', a: number, b: number }} StoryCard */

/** @param {{ op: '+' | '-', a: number, b: number }} story */
export const storyCaption = ({ op, a, b }) => (op === '-' ? `הָיוּ ${a}, ${b} הִתְפּוֹצְצוּ` : `הָיוּ ${a}, הִגִּיעוּ עוֹד ${b}`);

/**
 * @typedef {'noa' | 'added' | 'dani'} Owner
 * @typedef {'hidden' | 'shown' | 'popped' | 'empty'} BalloonState
 * @typedef {'appear' | 'arrive' | 'pop' | 'fill'} Motion
 */

/**
 * The picture of a take, add, compare or missing story, step by step. The
 * start shows some balloons; the change turns `change` into `changeTo` one
 * after another, with `motion`; `counted` is what the counting hint numbers,
 * and it is always the answer. Balloons that pop or arrive come last, so in
 * rows of five from the left they are the end of the row.
 * @param {Pick<Round, 'kind' | 'a' | 'b'>} round
 * @returns {{ owners: Owner[], start: BalloonState[], change: number[], changeTo: BalloonState, motion: Motion, counted: number[] }}
 */
export function scenePlan({ kind, a, b }) {
  /** @param {number} from @param {number} to */
  const range = (from, to) => Array.from({ length: to - from }, (_, k) => from + k);
  /** @template T @param {number} n @param {T} value @returns {T[]} */
  const many = (n, value) => Array.from({ length: n }, () => value);
  if (kind === 'take') {
    return { owners: many(a, 'noa'), start: many(a, 'shown'), change: range(a - b, a), changeTo: 'popped', motion: 'pop', counted: range(0, a - b) };
  }
  if (kind === 'add') {
    return {
      owners: [...many(a, 'noa'), ...many(b, 'added')],
      start: [...many(a, 'shown'), ...many(b, 'hidden')],
      change: range(a, a + b), changeTo: 'shown', motion: 'arrive', counted: range(0, a + b),
    };
  }
  if (kind === 'missing') {
    return { owners: many(b, 'noa'), start: many(b, 'empty'), change: range(0, a), changeTo: 'shown', motion: 'fill', counted: range(a, b) };
  }
  if (kind === 'compare') {
    // Noa's balloons first, then Dani's; the picture puts each of Dani's under a partner.
    return {
      owners: [...many(a, 'noa'), ...many(b, 'dani')],
      start: [...many(a, 'shown'), ...many(b, 'hidden')],
      change: range(a, a + b), changeTo: 'shown', motion: 'appear', counted: range(b, a),
    };
  }
  throw new Error(`No picture for a ${kind} round`);
}

/**
 * The picture once the story is over.
 * @param {ReturnType<typeof scenePlan>} plan
 * @returns {BalloonState[]}
 */
export const finalStates = plan => plan.start.map((state, k) => (plan.change.includes(k) ? plan.changeTo : state));
