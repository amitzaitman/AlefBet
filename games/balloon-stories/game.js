/**
 * סיפורי בלונים: חיבור וחיסור עד 10 דרך סיפור קצר שקורה על המסך.
 * כל סיבוב מציג את אותו מידע בשלוש שכבות: תמונה, תרגיל וסיפור מוקרא,
 * כך שגם ילד שלא הבין את המילים יכול לפתור מהתמונה. השלבים עוברים בין
 * משמעויות הפעולות (לקחו, הוסיפו, השוואה, השלמה) ומסתיימים בכיוון ההפוך:
 * מתרגיל לסיפור. העקרונות מתוארים ב-docs/math-pedagogy.md.
 */
import { runGame, createFeedback, sounds, shuffle, tts, getAudioContext } from '../../framework/dist/runtime.js';

/** Shortest time a story sentence stays current, even when there is no voice. */
const BEAT_MS = 1200;
/** Gap between balloons that pop, arrive, fill or are counted one after another. */
const STAGGER_MS = 280;
/** Pause after cancelling speech; iOS can drop an utterance spoken right after cancel. */
const HUSH_MS = 250;
const NIKUD = /[֑-ׇ]/g;

/** Masculine numbers agree with בָּלוֹן; feminine numbers are for counting and exercises. */
const MASCULINE = ['אֶפֶס', 'אֶחָד', 'שְׁנַיִם', 'שְׁלוֹשָׁה', 'אַרְבָּעָה', 'חֲמִשָּׁה', 'שִׁשָּׁה', 'שִׁבְעָה', 'שְׁמוֹנָה', 'תִּשְׁעָה', 'עֲשָׂרָה'];
const FEMININE = ['אֶפֶס', 'אַחַת', 'שְׁתַּיִם', 'שָׁלוֹשׁ', 'אַרְבַּע', 'חָמֵשׁ', 'שֵׁשׁ', 'שֶׁבַע', 'שְׁמוֹנֶה', 'תֵּשַׁע', 'עֶשֶׂר'];

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

/** @param {number} n */
const shownBalloons = n => (n === 1 ? 'בָּלוֹן אֶחָד' : `${n} בָּלוֹנִים`);
/** @param {number} n */
const spokenBalloons = n => (n === 1 ? 'בָּלוֹן אֶחָד' : n === 2 ? 'שְׁנֵי בָּלוֹנִים' : `${MASCULINE[n]} בָּלוֹנִים`);
/**
 * A sentence is shown with digits, so it matches the exercise, and spoken with words.
 * @param {(count: (n: number) => string) => string} build
 */
const sentence = build => ({ text: build(shownBalloons), say: build(spokenBalloons) });
/** @param {string} text */
const fixed = text => ({ text, say: text });

/** @param {'+' | '-'} op */
const sign = op => (op === '+' ? '+' : '−');

/** @param {'+' | '-'} op @param {number} a @param {number} b */
export const exerciseWords = (op, a, b) => `${FEMININE[a]} ${op === '+' ? 'וְעוֹד' : 'פָּחוֹת'} ${FEMININE[b]}`;

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
  return { text: `${round.a} ${sign(op)} ${round.b} = ${c}`, say: `${exerciseWords(op, round.a, round.b)} שָׁוֶה ${FEMININE[c]}.` };
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

/** Sentences queued or playing, so speech is only cancelled when there is some. */
let pendingSpeech = 0;
/** @param {string} text */
function speak(text) {
  pendingSpeech++;
  return tts.speak(text).finally(() => { pendingSpeech--; });
}
/** @returns {boolean} whether there was speech to cancel */
function hush() {
  if (!pendingSpeech) return false;
  tts.cancel();
  return true;
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

/** @param {number} value */
function choiceDots(value) {
  const dots = el('span', 'bs-choice__dots');
  dots.setAttribute('aria-hidden', 'true');
  for (let k = 0; k < value; k++) dots.append(el('span'));
  return dots;
}

/** @param {string} equation @param {number} [answer] */
function equationTokens(equation, answer) {
  return equation.split(' ').filter(Boolean).flatMap((token, k) => {
    const node = token === '?' && answer !== undefined
      ? el('span', 'bs-solved', String(answer))
      : el('span', token === '?' ? 'bs-unknown' : '', token);
    return k ? [' ', node] : [node];
  });
}

const COUNT_HINTS = {
  take: 'סִפְרוּ אֶת הַבָּלוֹנִים שֶׁנִּשְׁאֲרוּ',
  add: 'סִפְרוּ אֶת כָּל הַבָּלוֹנִים',
  compare: 'סִפְרוּ אֶת הַבָּלוֹנִים שֶׁאֵין לָהֶם זוּג',
  missing: 'סִפְרוּ אֶת הַמְּקוֹמוֹת הָרֵיקִים',
};

export function startGame(container) {
  return runGame(container, {
    gameId: 'balloon-stories', title: 'סִפּוּרֵי בָּלוֹנִים',
    defaultRounds: createRounds(),
    playCorrectSound: false,
    transitionMs: 2600,
    onReplay: () => startGame(container),
    buildRound(context) {
      const { shell, scope, isActive } = context;
      const round = /** @type {Round} */ (context.round);
      const matching = round.kind === 'match';
      const beats = storyFor(round);
      const answer = answerFor(round);
      let storyRun = 0;
      let asked = false;
      let misses = 0;

      /** @param {number} ms */
      const wait = ms => new Promise(resolve => { scope.schedule(() => resolve(undefined), ms); });
      /** Speaks without letting a silent or blocked voice hold the story for long. */
      const say = (text, minMs = BEAT_MS, limitMs = minMs + 1500 + text.replace(NIKUD, '').length * 120) =>
        Promise.all([wait(minMs), Promise.race([speak(text), wait(limitMs)])]);

      const host = el('section', matching ? 'bs-game bs-game--match' : 'bs-game');
      const story = el('div', 'bs-story');
      story.setAttribute('aria-live', 'polite');
      const scene = matching ? null : buildScene(round, wait);
      const equation = el('p', 'bs-equation');
      equation.dir = 'ltr';
      const choices = el('div', matching ? 'bs-cards' : 'bs-choices');
      if (!matching) choices.dir = 'ltr';
      const again = el('button', 'bs-again', 'עוֹד פַּעַם 🔁');
      again.type = 'button';
      again.setAttribute('aria-label', 'שמיעת הסיפור שוב');
      host.append(story, ...(scene ? [scene.root] : []), equation, choices, again);
      shell.bodyEl.append(host);
      const feedback = scope.use(createFeedback(host));
      scope.use(() => { hush(); });

      /** @param {{ text: string }} beat @param {string} [className] */
      function addLine(beat, className = 'bs-line') {
        story.querySelector('.bs-line--now')?.classList.remove('bs-line--now');
        story.append(el('p', `${className} bs-line--now`, beat.text));
        scene?.root.setAttribute('aria-label', [...story.querySelectorAll('.bs-line')].map(line => line.textContent).join(' '));
      }

      async function playStory() {
        const run = ++storyRun;
        const live = () => run === storyRun && isActive();
        if (hush()) await wait(HUSH_MS);
        if (!live()) return;
        clearCounting();
        scene?.reset();
        story.replaceChildren();
        for (const beat of beats) {
          addLine(beat);
          equation.replaceChildren(...equationTokens(beat.equation));
          if (beat.scene === 'question' && !asked) { asked = true; update(); }
          await Promise.all([say(beat.say), scene?.[beat.scene](live)]);
          if (!live()) return;
        }
      }

      function clearCounting() {
        for (const item of host.querySelectorAll('.bs-balloon--counted')) {
          item.classList.remove('bs-balloon--counted');
          item.firstElementChild.textContent = '';
        }
      }

      /**
       * Shows the whole story at once, when a hint or an answer interrupts it.
       * @returns {boolean} whether speech was cancelled
       */
      function settle() {
        storyRun++;
        const hushed = hush();
        clearCounting();
        scene?.settle();
        story.replaceChildren();
        beats.forEach(beat => addLine(beat));
        equation.replaceChildren(...equationTokens(beats[beats.length - 1].equation));
        return hushed;
      }

      async function countAloud() {
        const hushed = settle();
        const run = storyRun;
        if (hushed) await wait(HUSH_MS);
        for (const [k, item] of scene.counted().entries()) {
          if (run !== storyRun || !isActive()) return;
          item.classList.add('bs-balloon--counted');
          item.firstElementChild.textContent = String(k + 1);
          await say(FEMININE[k + 1], 700, 1500);
        }
      }

      function update() {
        const locked = !asked || context.isAnswered();
        for (const button of choices.querySelectorAll('button')) {
          button.disabled = locked || button.classList.contains('bs-pick--tried');
        }
        again.disabled = context.isAnswered();
      }

      function help() {
        if (matching) {
          if (misses >= 2) {
            choices.querySelector('[data-id="right"]')?.classList.add('bs-pick--hint');
            feedback.hint('נַסּוּ אֶת הַסִּפּוּר הַמְּסֻמָּן');
          } else {
            feedback.hint('סִפְרוּ אֶת הַבָּלוֹנִים בְּכָל סִפּוּר');
            void playStory();
          }
          return;
        }
        // The help goes back to the picture: the story again, then counting, then the answer.
        if (misses === 1) {
          feedback.hint('בּוֹאוּ נִשְׁמַע שׁוּב אֶת הַסִּפּוּר');
          void playStory();
        } else if (misses === 2) {
          feedback.hint(COUNT_HINTS[round.kind]);
          void countAloud();
        } else {
          choices.querySelector(`[data-value="${answer}"]`)?.classList.add('bs-pick--hint');
          feedback.hint('נַסּוּ אֶת הַמִּסְפָּר הַמְּסֻמָּן');
        }
      }

      /** @param {HTMLButtonElement} button @param {boolean} correct */
      function choose(button, correct) {
        if (!asked || context.isAnswered() || button.disabled) return;
        if (!correct) {
          void context.onWrong(() => {
            misses++;
            button.classList.add('bs-pick--tried');
            help();
          });
          return;
        }
        void context.onCorrect(() => {
          button.classList.add('bs-pick--correct');
          const hushed = settle();
          const result = resultFor(round);
          if (matching) equation.replaceChildren(...equationTokens(`${beats[0].equation} = ?`, answer));
          else {
            equation.replaceChildren(...equationTokens(beats[beats.length - 1].equation, answer));
            addLine(result, 'bs-line bs-line--result');
          }
          feedback.correct();
          scope.schedule(() => { void speak(result.say); }, hushed ? HUSH_MS : 0);
        });
      }

      if (matching) {
        choices.replaceChildren(...shuffle(matchOptions(round)).map(option => {
          const card = el('button', 'bs-card');
          card.type = 'button';
          Object.assign(card.dataset, { id: option.id, op: option.op, a: String(option.a), b: String(option.b) });
          const caption = storyCaption(option);
          card.setAttribute('aria-label', caption);
          const picture = buildScene({ kind: option.op === '-' ? 'take' : 'add', a: option.a, b: option.b, look: 'dots' }, wait);
          picture.root.classList.add('bs-scene--mini');
          picture.root.setAttribute('aria-hidden', 'true');
          picture.settle();
          card.append(el('span', 'bs-card__caption', caption), picture.root);
          scope.listen(card, 'click', () => choose(card, option.id === 'right'));
          return card;
        }));
      } else {
        choices.replaceChildren(...answerChoices(round).map(value => {
          const button = el('button', 'bs-choice');
          button.type = 'button';
          button.dataset.value = String(value);
          button.setAttribute('aria-label', String(value));
          button.append(el('span', 'bs-choice__number', String(value)), choiceDots(value));
          scope.listen(button, 'click', () => choose(button, value === answer));
          return button;
        }));
      }
      scope.listen(again, 'click', () => { void playStory(); });
      context.subscribeAnswered(update);

      // Speech needs a first tap on most phones; until then the story waits for one.
      if (navigator.userActivation && !navigator.userActivation.hasBeenActive) {
        const start = el('button', 'bs-start', '▶ הַקְשִׁיבוּ לַסִּפּוּר');
        start.type = 'button';
        story.append(start);
        again.hidden = true;
        scope.listen(start, 'click', () => { again.hidden = false; void playStory(); });
      } else {
        void playStory();
      }
    },
  });
}
