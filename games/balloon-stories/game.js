/**
 * סיפורי בלונים: חיבור וחיסור עד 10 דרך סיפור קצר שקורה על המסך.
 * כל סיבוב מציג את אותו מידע בשלוש שכבות: תמונה, תרגיל וסיפור מוקרא,
 * כך שגם ילד שלא הבין את המילים יכול לפתור מהתמונה. השלבים עוברים בין
 * משמעויות הפעולות (לקחו, הוסיפו, השוואה, השלמה) ומסתיימים בכיוון ההפוך:
 * מתרגיל לסיפור. העקרונות מתוארים ב-docs/math-pedagogy.md.
 */
import {
  runGame, createStoryRound, numberWord, countNoun, exerciseWords, sounds, shuffle, getAudioContext,
} from '../../framework/dist/runtime.js';

/** Gap between balloons that pop, arrive, fill or are counted one after another. */
const STAGGER_MS = 280;

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
  const telling = { take: [a + b, b], add: [a - b, b], compare: [a + b, b], missing: [b, a] }[kind] ?? [];
  const near = shuffle([answer - 1, answer + 1, answer - 2, answer + 2]);
  const distractors = [...new Set([...telling, ...near])].filter(n => n >= 0 && n <= 10 && n !== answer);
  return [answer, ...distractors.slice(0, 3)].sort((x, y) => x - y);
}

/** בָּלוֹן is masculine: 'בָּלוֹן אֶחָד', 'שְׁנֵי בָּלוֹנִים', 'אַרְבָּעָה בָּלוֹנִים'. */
const BALLOON = { one: 'בָּלוֹן', many: 'בָּלוֹנִים', gender: /** @type {const} */ ('m') };
/** @param {number} n */
const shownBalloons = n => countNoun(n, BALLOON, { digits: true });
/** @param {number} n */
const spokenBalloons = n => countNoun(n, BALLOON);
/**
 * A sentence is shown with digits, so it matches the exercise, and spoken with words.
 * @param {(count: (n: number) => string) => string} build
 */
const sentence = build => ({ text: build(shownBalloons), say: build(spokenBalloons) });
/** @param {string} text */
const fixed = text => ({ text, say: text });

/** @param {'+' | '-'} op */
const sign = op => (op === '+' ? '+' : '−');

/**
 * The story as beats: start, change and question. Each beat names the scene
 * step it plays and how much of the exercise is already written.
 * @param {Round} round
 * @returns {{ text: string, say: string, equation: string, scene: 'start' | 'change' | 'question' }[]}
 */
export function storyFor(round) {
  const { kind, a, b } = round;
  if (kind === 'take') {
    return [
      { ...sentence(n => `לְנוֹעָה יֵשׁ ${n(a)}.`), equation: `${a}`, scene: 'start' },
      { ...sentence(n => `${n(b)} הִתְפּוֹצְצוּ!`), equation: `${a} − ${b}`, scene: 'change' },
      { ...fixed('כַּמָּה בָּלוֹנִים נִשְׁאֲרוּ לְנוֹעָה?'), equation: `${a} − ${b} = ?`, scene: 'question' },
    ];
  }
  if (kind === 'add') {
    return [
      { ...sentence(n => `לְנוֹעָה יֵשׁ ${n(a)}.`), equation: `${a}`, scene: 'start' },
      { ...sentence(n => `סָבְתָא הֵבִיאָה לָהּ עוֹד ${n(b)}.`), equation: `${a} + ${b}`, scene: 'change' },
      { ...fixed('כַּמָּה בָּלוֹנִים יֵשׁ לְנוֹעָה עַכְשָׁיו?'), equation: `${a} + ${b} = ?`, scene: 'question' },
    ];
  }
  // Comparing and completing are not events, so their exercise appears with the question.
  if (kind === 'compare') {
    return [
      { ...sentence(n => `לְנוֹעָה יֵשׁ ${n(a)}.`), equation: '', scene: 'start' },
      { ...sentence(n => `לְדָנִי יֵשׁ ${n(b)}.`), equation: '', scene: 'change' },
      { ...fixed('כַּמָּה בָּלוֹנִים יֵשׁ לְנוֹעָה יוֹתֵר מִלְּדָנִי?'), equation: `${a} − ${b} = ?`, scene: 'question' },
    ];
  }
  if (kind === 'missing') {
    return [
      { ...sentence(n => `נוֹעָה רוֹצָה ${n(b)}.`), equation: '', scene: 'start' },
      { ...sentence(n => `יֵשׁ לָהּ ${n(a)}.`), equation: '', scene: 'change' },
      { ...fixed('כַּמָּה בָּלוֹנִים חֲסֵרִים לָהּ?'), equation: `${a} + ? = ${b}`, scene: 'question' },
    ];
  }
  const op = round.op ?? '-';
  return [{
    text: 'אֵיזֶה סִפּוּר מַתְאִים לַתַּרְגִּיל?',
    say: `אֵיזֶה סִפּוּר מַתְאִים לַתַּרְגִּיל ${exerciseWords(op, a, b)}?`,
    equation: `${a} ${sign(op)} ${b}`,
    scene: 'question',
  }];
}

/**
 * The closing sentence after a correct answer.
 * @param {Round} round
 * @returns {{ text: string, say: string }}
 */
export function resultFor(round) {
  const c = answerFor(round);
  if (round.kind === 'take') {
    return c === 1 ? sentence(n => `נִשְׁאַר לְנוֹעָה ${n(c)}.`) : sentence(n => `נִשְׁאֲרוּ לְנוֹעָה ${n(c)}.`);
  }
  if (round.kind === 'add') return sentence(n => `עַכְשָׁיו יֵשׁ לְנוֹעָה ${n(c)}.`);
  if (round.kind === 'compare') return sentence(n => `לְנוֹעָה יֵשׁ ${n(c)} יוֹתֵר.`);
  if (round.kind === 'missing') {
    return c === 1 ? sentence(n => `חָסֵר לָהּ ${n(c)}.`) : sentence(n => `חֲסֵרִים לָהּ ${n(c)}.`);
  }
  const op = round.op ?? '-';
  return { text: `${round.a} ${sign(op)} ${round.b} = ${c}`, say: `${exerciseWords(op, round.a, round.b)} שָׁוֶה ${numberWord(c)}.` };
}

/**
 * The right story, the same numbers with the other operation, and one more
 * balloon in the change. Every card is a take or add picture of at most 10.
 * @param {Round} round
 * @returns {{ id: 'right' | 'operation' | 'number', op: '+' | '-', a: number, b: number }[]}
 */
export function matchOptions({ a, b, op = '-' }) {
  return [
    { id: 'right', op, a, b },
    { id: 'operation', op: op === '-' ? '+' : '-', a, b },
    { id: 'number', op, a, b: b + 1 },
  ];
}

/** @param {{ op: '+' | '-', a: number, b: number }} story */
export const storyCaption = ({ op, a, b }) => (op === '-' ? `הָיוּ ${a}, ${b} הִתְפּוֹצְצוּ` : `הָיוּ ${a}, הִגִּיעוּ עוֹד ${b}`);

/** @param {string} tag @param {string} [className] @param {string} [text] */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const calm = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
/** @type {Record<string, [Keyframe[], number]>} */
const MOTION = {
  appear: [[{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], 320],
  arrive: [[{ opacity: 0, transform: 'translateY(-56px)' }, { opacity: 1, transform: 'none' }], 480],
  pop: [[{ transform: 'scale(1.5)', opacity: 0.3 }, { transform: 'scale(1)', opacity: 1 }], 280],
  fill: [[{ transform: 'scale(0.4)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }], 360],
};
/** @param {HTMLElement} node @param {keyof typeof MOTION} name */
function move(node, name) {
  if (calm || typeof node.animate !== 'function') return;
  const [frames, duration] = MOTION[name];
  node.animate(frames, { duration, easing: 'ease-out' });
}

/** A short noise burst on the shared audio context. */
function popSound() {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    if (ctx.state === 'suspended') void ctx.resume();
    const length = Math.floor(ctx.sampleRate * 0.12);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3;
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = 0.35;
    source.buffer = buffer;
    source.connect(gain).connect(ctx.destination);
    source.start();
  } catch { /* no audio output */ }
}

/** @param {'noa' | 'added' | 'dani'} owner */
function balloon(owner) {
  const item = el('span', `bs-balloon bs-balloon--${owner}`);
  item.dataset.state = 'hidden';
  item.append(el('span', 'bs-balloon__mark'));
  return item;
}

/** @param {HTMLElement[]} items @param {string} state */
const setState = (items, state) => items.forEach(item => { item.dataset.state = state; });

/**
 * The picture for a take, add, compare or missing story. Steps follow the
 * story beats; `settle` jumps to the final picture without motion.
 * @param {Round} round
 * @param {(ms: number) => Promise<unknown>} wait
 */
function buildScene(round, wait) {
  const { kind, a, b } = round;
  const root = el('div', `bs-scene bs-scene--${kind}${round.look === 'dots' ? ' bs-scene--dots' : ''}`);
  root.dir = 'ltr';
  root.setAttribute('role', 'img');
  /** Changes balloons one after another and stops if the story restarts. */
  async function oneByOne(items, live, change) {
    for (const [k, item] of items.entries()) {
      if (k) await wait(STAGGER_MS);
      if (!live()) return;
      change(item);
    }
  }

  if (kind === 'compare') {
    // One column per balloon of Noa's, so each of Dani's balloons sits under a partner.
    const tops = Array.from({ length: a }, () => balloon('noa'));
    const bottoms = Array.from({ length: b }, () => balloon('dani'));
    const who = el('span', 'bs-pair bs-who');
    who.setAttribute('aria-hidden', 'true');
    who.append(el('span', 'bs-face', '👧'), el('span', 'bs-face', '👦'));
    const pairs = tops.map((top, k) => {
      const pair = el('span', k === 5 ? 'bs-pair bs-pair--group' : 'bs-pair');
      pair.append(top, bottoms[k] ?? el('span', 'bs-balloon bs-balloon--none'));
      return pair;
    });
    const row = el('div', 'bs-pairs');
    row.append(who, ...pairs);
    root.append(row);
    const question = () => pairs.slice(0, b).forEach(pair => pair.classList.add('bs-pair--matched'));
    return {
      root,
      reset() {
        setState([...tops, ...bottoms], 'hidden');
        pairs.forEach(pair => pair.classList.remove('bs-pair--matched'));
      },
      async start() { setState(tops, 'shown'); tops.forEach(item => move(item, 'appear')); },
      change: live => oneByOne(bottoms, live, item => { item.dataset.state = 'shown'; move(item, 'appear'); }),
      question,
      settle() { setState([...tops, ...bottoms], 'shown'); question(); },
      /** Noa's balloons without a partner are the answer. */
      counted: () => tops.slice(b),
    };
  }

  const size = kind === 'add' ? a + b : kind === 'missing' ? b : a;
  const items = Array.from({ length: size }, (_, k) => balloon(kind === 'add' && k >= a ? 'added' : 'noa'));
  // Rows of five, like a ten frame; balloons that pop or arrive come last.
  for (let k = 0; k < items.length; k += 5) {
    const row = el('div', 'bs-row');
    row.append(...items.slice(k, k + 5));
    root.append(row);
  }
  const before = items.slice(0, kind === 'take' ? a - b : a);
  const after = items.slice(before.length);
  const steps = {
    take: {
      async start() { setState(items, 'shown'); items.forEach(item => move(item, 'appear')); },
      change: live => oneByOne(after, live, item => { item.dataset.state = 'popped'; move(item, 'pop'); popSound(); }),
      settle() { setState(before, 'shown'); setState(after, 'popped'); },
      counted: () => before,
    },
    add: {
      async start() { setState(before, 'shown'); before.forEach(item => move(item, 'appear')); },
      change: live => oneByOne(after, live, item => { item.dataset.state = 'shown'; move(item, 'arrive'); sounds.click(); }),
      settle() { setState(items, 'shown'); },
      counted: () => items,
    },
    missing: {
      async start() { setState(items, 'empty'); items.forEach(item => move(item, 'appear')); },
      change: live => oneByOne(before, live, item => { item.dataset.state = 'shown'; move(item, 'fill'); }),
      settle() { setState(before, 'shown'); setState(after, 'empty'); },
      counted: () => after,
    },
  }[kind];
  return { root, reset: () => setState(items, 'hidden'), question() {}, ...steps };
}

/**
 * A story card's picture: the take or add story drawn small, already finished.
 * @param {{ op: '+' | '-', a: number, b: number }} option
 * @param {(ms: number) => Promise<unknown>} wait
 */
function miniPicture(option, wait) {
  const picture = buildScene({ kind: option.op === '-' ? 'take' : 'add', a: option.a, b: option.b, look: 'dots' }, wait);
  picture.root.classList.add('bs-scene--mini');
  picture.root.setAttribute('aria-hidden', 'true');
  picture.settle();
  return picture.root;
}

const COUNT_HINTS = {
  take: 'סִפְרוּ אֶת הַבָּלוֹנִים שֶׁנִּשְׁאֲרוּ',
  add: 'סִפְרוּ אֶת כָּל הַבָּלוֹנִים',
  compare: 'סִפְרוּ אֶת הַבָּלוֹנִים שֶׁאֵין לָהֶם זוּג',
  missing: 'סִפְרוּ אֶת הַמְּקוֹמוֹת הָרֵיקִים',
};

/**
 * The help goes back to the picture: the story again, then counting, then the answer.
 * @param {Round['kind']} kind
 * @returns {{ hint: string, action: 'replay' | 'count' | 'mark' }[]}
 */
const numberLadder = kind => [
  { hint: 'בּוֹאוּ נִשְׁמַע שׁוּב אֶת הַסִּפּוּר', action: 'replay' },
  { hint: COUNT_HINTS[kind], action: 'count' },
  { hint: 'נַסּוּ אֶת הַמִּסְפָּר הַמְּסֻמָּן', action: 'mark' },
];
/** @type {{ hint: string, action: 'replay' | 'count' | 'mark' }[]} */
const MATCH_LADDER = [
  { hint: 'סִפְרוּ אֶת הַבָּלוֹנִים בְּכָל סִפּוּר', action: 'replay' },
  { hint: 'נַסּוּ אֶת הַסִּפּוּר הַמְּסֻמָּן', action: 'mark' },
];

export function startGame(container) {
  return runGame(container, {
    gameId: 'balloon-stories', title: 'סִפּוּרֵי בָּלוֹנִים',
    defaultRounds: createRounds(),
    playCorrectSound: false,
    transitionMs: 2600,
    onReplay: () => startGame(container),
    buildRound(context) {
      const round = /** @type {Round} */ (context.round);
      const matching = round.kind === 'match';
      createStoryRound(context, ({ wait }) => {
        const picture = matching ? null : buildScene(round, wait);
        return {
          className: 'bs-game',
          beats: storyFor(round),
          scene: picture && {
            ...picture,
            counting: () => ({
              items: picture.counted().map((item, k) => ({
                say: numberWord(k + 1),
                mark() {
                  item.classList.add('bs-balloon--counted');
                  item.firstElementChild.textContent = String(k + 1);
                },
              })),
            }),
            clearCount() {
              for (const item of picture.root.querySelectorAll('.bs-balloon--counted')) {
                item.classList.remove('bs-balloon--counted');
                item.firstElementChild.textContent = '';
              }
            },
          },
          choices: matching
            ? {
              right: 'right',
              answer: answerFor(round),
              cards: shuffle(matchOptions(round)).map(option => ({
                id: option.id,
                label: storyCaption(option),
                data: { op: option.op, a: String(option.a), b: String(option.b) },
                picture: miniPicture(option, wait),
              })),
            }
            : { values: answerChoices(round), answer: answerFor(round) },
          result: resultFor(round),
          resultLine: !matching,
          solvedEquation: matching ? `${round.a} ${sign(round.op ?? '-')} ${round.b} = ?` : undefined,
          ladder: matching ? MATCH_LADDER : numberLadder(round.kind),
        };
      });
    },
  });
}
