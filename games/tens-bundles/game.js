/**
 * צרורות של עשר: עשרות ואחדות, לגיל 6 עד 8.
 * עשר קשיות נקשרות לצרור אחד, וצרור הוא יחידה חדשה (עיקרון 7). בסיבובי הקשירה
 * הילדים לוקחים קשית אחר קשית מהערימה, סופרים עד עשר בקול וקושרים, ואז אומרים
 * כמה יש. התרגיל מראה כל צרור כ-10: `10 + 10 + 3 = ?`. בסיבוב הקריאה הצרורות
 * כבר קשורים, ובסיבובי הבנייה הילדים בונים מספר כתוב מצרורות ומקשיות. משמאל
 * לימין כמו הספרות: הצרורות משמאל והקשיות הבודדות מימין. העזרה סופרת בעשרות
 * ("עֶשֶׂר, עֶשְׂרִים") וממשיכה באחדות. העקרונות ב-docs/math-pedagogy.md.
 */
import {
  runGame, createStoryRound, createNarrator, createFeedback, numberWord, countNoun, sounds,
} from '../../framework/dist/runtime.js';

/** קַשִּׁית is feminine, like the counting words; צְרוֹר is masculine. */
const STRAW = { one: 'קַשִּׁית', many: 'קַשִּׁיּוֹת', gender: /** @type {const} */ ('f') };
const BUNDLE = { one: 'צְרוֹר', many: 'צְרוֹרוֹת', gender: /** @type {const} */ ('m') };
/** The bundles column has room for five; loose straws are at most nine. */
const MAX_TENS = 5;
/** Choices stay where the picture can show them. */
const MAX_CHOICE = 59;

/** Counting words from 11 up: "שְׁתֵּים עֶשְׂרֵה", "עֶשְׂרִים וְשָׁלוֹשׁ". */
const TEENS = ['אַחַת עֶשְׂרֵה', 'שְׁתֵּים עֶשְׂרֵה', 'שְׁלוֹשׁ עֶשְׂרֵה', 'אַרְבַּע עֶשְׂרֵה', 'חֲמֵשׁ עֶשְׂרֵה', 'שֵׁשׁ עֶשְׂרֵה', 'שְׁבַע עֶשְׂרֵה', 'שְׁמוֹנֶה עֶשְׂרֵה', 'תְּשַׁע עֶשְׂרֵה'];
const TENS = ['', 'עֶשֶׂר', 'עֶשְׂרִים', 'שְׁלוֹשִׁים', 'אַרְבָּעִים', 'חֲמִשִּׁים', 'שִׁשִּׁים', 'שִׁבְעִים', 'שְׁמוֹנִים', 'תִּשְׁעִים'];
const AND_ONES = ['', 'וְאַחַת', 'וּשְׁתַּיִם', 'וְשָׁלוֹשׁ', 'וְאַרְבַּע', 'וְחָמֵשׁ', 'וְשֵׁשׁ', 'וְשֶׁבַע', 'וּשְׁמוֹנֶה', 'וְתֵשַׁע'];

/**
 * The counting word for 0 to 99.
 * @param {number} n
 * @returns {string}
 */
export function countWord(n) {
  if (n <= 10) return numberWord(n);
  if (n < 20) return TEENS[n - 11];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones ? `${TENS[tens]} ${AND_ONES[ones]}` : TENS[tens];
}

/**
 * Straws with their number: '23 קַשִּׁיּוֹת' on screen, 'עֶשְׂרִים וְשָׁלוֹשׁ קַשִּׁיּוֹת' aloud.
 * @param {number} n
 */
export const straws = n => ({
  text: countNoun(n, STRAW, { digits: true }),
  say: n <= 10 ? countNoun(n, STRAW) : `${countWord(n)} ${STRAW.many}`,
});

/**
 * bundle: the straws lie in a pile, except `ready` bundles already tied; the
 * child ties every ten and then says how many there are.
 * read: the bundles are tied; the child says how many.
 * build: the child builds the written number from bundles and straws.
 * @typedef {{ kind: 'bundle' | 'read' | 'build', tens: number, ones: number, ready?: number }} Round
 */

/** @param {number} min @param {number} max */
const randomInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

/**
 * Tens and ones that differ, so the reversed number is a different number.
 * @param {[number, number]} tens @param {[number, number]} ones
 */
function differ(tens, ones) {
  for (;;) {
    const pick = { tens: randomInt(...tens), ones: randomInt(...ones) };
    if (pick.tens !== pick.ones) return pick;
  }
}

/**
 * Three bundling rounds (one bundle, two, and one more next to two that are
 * tied), one reading round, and two building rounds, the last a round ten.
 * @returns {Round[]}
 */
export function createRounds() {
  return [
    { kind: 'bundle', tens: 1, ones: randomInt(2, 9), ready: 0 },
    { kind: 'bundle', tens: 2, ones: randomInt(1, 9), ready: 0 },
    { kind: 'bundle', tens: 3, ones: randomInt(1, 7), ready: 2 },
    { kind: 'read', ...differ([2, 4], [1, 5]) },
    { kind: 'build', ...differ([2, 4], [1, 9]) },
    { kind: 'build', tens: randomInt(2, MAX_TENS), ones: 0 },
  ];
}

/** @param {{ tens: number, ones: number }} round */
export const totalOf = ({ tens, ones }) => tens * 10 + ones;

/**
 * Each bundle is 10 in the exercise: '10 + 10 + 3'.
 * @param {{ tens: number, ones: number }} round
 */
export const tensExercise = ({ tens, ones }) => [...Array(tens).fill('10'), ...(ones ? [String(ones)] : [])].join(' + ');

/**
 * Four choices in ascending order. The telling mistakes come first: the digits
 * swapped, the bundles counted as single straws, and one bundle more or less.
 * @param {Round} round
 * @returns {number[]}
 */
export function tensChoices(round) {
  const n = totalOf(round);
  const { tens, ones } = round;
  const candidates = [ones * 10 + tens, tens + ones, n + 10, n - 10, n + 1, n - 1];
  const others = [...new Set(candidates)].filter(c => c >= 1 && c <= MAX_CHOICE && c !== n);
  return [n, ...others.slice(0, 3)].sort((a, b) => a - b);
}

/**
 * What a number is made of, said after a wrong choice: "שְׁלוֹשִׁים וּשְׁתַּיִם זֶה
 * שְׁלוֹשָׁה צְרוֹרוֹת וְעוֹד שְׁתֵּי קַשִּׁיּוֹת."
 * @param {number} n
 */
export function madeOf(n) {
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  const parts = [tens && countNoun(tens, BUNDLE), ones && countNoun(ones, STRAW)].filter(Boolean);
  return `${countWord(n)} זֶה ${parts.join(' וְעוֹד ')}.`;
}

/**
 * The story as beats. In a bundling round the second beat's step is the child's:
 * once its sentence is said the pile opens, and the story waits while the child
 * ties the bundles.
 * @param {Round} round
 */
export function storyFor(round) {
  const ask = 'כַּמָּה קַשִּׁיּוֹת יֵשׁ?';
  const question = { text: ask, say: ask, equation: `${tensExercise(round)} = ?`, scene: /** @type {const} */ ('question') };
  if (round.kind === 'read') {
    const opening = {
      text: `בַּקֻּפְסָה יֵשׁ ${countNoun(round.tens, BUNDLE, { digits: true })}, וְעוֹד ${countNoun(round.ones, STRAW, { digits: true })}.`,
      say: `בַּקֻּפְסָה יֵשׁ ${countNoun(round.tens, BUNDLE)}, וְעוֹד ${countNoun(round.ones, STRAW)}.`,
    };
    return [{ ...opening, equation: '', scene: /** @type {const} */ ('start') }, question];
  }
  const opening = round.ready
    ? {
      text: `בַּקֻּפְסָה יֵשׁ ${countNoun(round.ready, BUNDLE, { digits: true })}, וְעוֹד הַרְבֵּה קַשִּׁיּוֹת.`,
      say: `בַּקֻּפְסָה יֵשׁ ${countNoun(round.ready, BUNDLE)}, וְעוֹד הַרְבֵּה קַשִּׁיּוֹת.`,
    }
    : { text: 'בַּקֻּפְסָה יֵשׁ הַרְבֵּה קַשִּׁיּוֹת.', say: 'בַּקֻּפְסָה יֵשׁ הַרְבֵּה קַשִּׁיּוֹת.' };
  const tie = 'קִשְׁרוּ כָּל עֶשֶׂר קַשִּׁיּוֹת לִצְרוֹר אֶחָד.';
  return [
    { ...opening, equation: '', scene: /** @type {const} */ ('start') },
    { text: tie, say: tie, equation: '', scene: /** @type {const} */ ('change') },
    question,
  ];
}

/** @param {Round} round */
export function resultFor(round) {
  const { text, say } = straws(totalOf(round));
  return { text: `יֵשׁ ${text}.`, say: `יֵשׁ ${say}.` };
}

/** @param {string} tag @param {string} [className] @param {string} [text] */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** @param {string} className @param {string} text @param {string} [label] */
function button(className, text, label) {
  const node = /** @type {HTMLButtonElement} */ (el('button', className, text));
  node.type = 'button';
  if (label) node.setAttribute('aria-label', label);
  return node;
}

const calm = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Moves a straw or a bundle from where it was to where it is now drawn.
 * @param {Element} node
 * @param {DOMRect} from
 */
function fly(node, from) {
  if (calm || typeof node.animate !== 'function') return;
  const to = node.getBoundingClientRect();
  node.animate([
    { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px)` },
    { transform: 'none' },
  ], { duration: 320, easing: 'ease-out' });
}

/**
 * The place-value mat: bundles on the left, single straws on the right, and the
 * running count under them. Each place is drawn or empty; a ghost is a place a
 * wrong number asks for.
 */
function buildMat() {
  const root = el('div', 'tb-mat');
  root.dir = 'ltr';
  const tensColumn = el('div', 'tb-column tb-column--tens');
  const onesColumn = el('div', 'tb-column tb-column--ones');
  const bundles = Array.from({ length: MAX_TENS }, () => el('span', 'tb-bundle'));
  const loose = Array.from({ length: 10 }, () => el('span', 'tb-straw'));
  const tensPlaces = el('div', 'tb-bundles');
  tensPlaces.append(...bundles);
  const onesPlaces = el('div', 'tb-loose');
  for (let k = 0; k < 10; k += 5) {
    const row = el('div', 'tb-row');
    row.append(...loose.slice(k, k + 5));
    onesPlaces.append(row);
  }
  tensColumn.append(el('p', 'tb-label', 'צְרוֹרוֹת'), tensPlaces);
  onesColumn.append(el('p', 'tb-label', 'בּוֹדְדוֹת'), onesPlaces);
  const running = el('p', 'tb-running');
  running.setAttribute('aria-live', 'polite');
  root.append(tensColumn, onesColumn);
  return {
    root, tensColumn, onesColumn, onesPlaces, bundles, loose, running,
    /** @param {number} tens @param {number} ones */
    show(tens, ones) {
      bundles.forEach((bundle, k) => { bundle.dataset.state = k < tens ? 'shown' : 'empty'; });
      loose.forEach((straw, k) => { straw.dataset.state = k < ones ? 'shown' : 'empty'; });
    },
    clearMarks() {
      for (const node of root.querySelectorAll('.tb-counted, .tb-chosen, .tb-extra')) node.classList.remove('tb-counted', 'tb-chosen', 'tb-extra');
      for (const node of root.querySelectorAll('[data-state="ghost"]')) /** @type {HTMLElement} */ (node).dataset.state = 'empty';
      running.textContent = '';
    },
    /**
     * Counts by tens, then on by ones: what the help says and marks.
     * @param {number} tens @param {number} ones
     */
    countingItems(tens, ones) {
      return [
        ...bundles.slice(0, tens).map((bundle, k) => ({ value: (k + 1) * 10, node: bundle })),
        ...loose.slice(0, ones).map((straw, k) => ({ value: tens * 10 + k + 1, node: straw })),
      ].map(({ value, node }) => ({
        say: countWord(value),
        mark: () => { node.classList.add('tb-counted'); running.textContent = String(value); },
      }));
    },
    /**
     * Shows a number on the mat next to what is there: places it fills are
     * circled, places it needs and the mat lacks are ghosts, and the rest fade.
     * @param {number} n
     * @param {number} tens - what the mat holds
     * @param {number} ones
     * @param {'chosen' | 'target'} mode - a wrong choice, or the number to build
     */
    compare(n, tens, ones, mode) {
      const wantTens = Math.min(Math.floor(n / 10), MAX_TENS);
      const wantOnes = n % 10;
      /** @param {HTMLElement[]} places @param {number} have @param {number} want */
      const mark = (places, have, want) => places.forEach((place, k) => {
        if (k < Math.min(have, want) && mode === 'chosen') place.classList.add('tb-chosen');
        if (k >= have && k < want) place.dataset.state = 'ghost';
        if (k >= want && k < have) place.classList.add('tb-extra');
      });
      mark(bundles, tens, wantTens);
      mark(loose, ones, wantOnes);
    },
  };
}

/**
 * A bundling or reading round: a story round whose picture is the mat. In a
 * bundling round the single straws start as a pile; a touch on the pile moves
 * one straw to the bundle being made, and a full bundle is tied with a touch.
 * @param {*} context - the round context from runGame
 * @param {Round} round
 */
function storyRound(context, round) {
  const { scope, isActive } = context;
  const n = totalOf(round);
  createStoryRound(context, ({ say, speak }) => {
    const mat = buildMat();
    const root = el('div', 'tb-scene');
    root.setAttribute('role', 'group');
    const bundling = round.kind === 'bundle';
    let tens = bundling ? round.ready : round.tens;
    let pile = bundling ? n - tens * 10 : round.ones;
    let making = 0;
    let done = !bundling;
    /** The pile opens when the story reaches the child's step. */
    let dealing = false;
    /** @type {() => void} */
    let finish = () => {};
    const tied = new Promise(resolve => { finish = () => resolve(undefined); });
    const note = el('p', 'tb-note');
    note.setAttribute('aria-live', 'polite');

    // The pile: the single straws, lying every which way, as one big button.
    const pileButton = button('tb-pile', '', 'לוֹקְחִים קַשִּׁית');
    const pileStraws = Array.from({ length: bundling ? pile : 0 }, () => {
      const straw = el('span', 'tb-straw tb-straw--lying');
      straw.style.left = `${8 + Math.random() * 70}%`;
      straw.style.top = `${4 + Math.random() * 30}%`;
      straw.style.transform = `rotate(${Math.round(Math.random() * 120 - 60)}deg)`;
      pileButton.append(straw);
      return straw;
    });
    // The bundle being made: ten places in one row, then a touch ties it.
    const frame = el('div', 'tb-frame');
    frame.dir = 'ltr';
    const framePlaces = Array.from({ length: 10 }, () => el('span', 'tb-straw'));
    frame.append(...framePlaces);
    const tie = button('tb-tie', 'קוֹשְׁרִים 🎀');
    const workbench = el('div', 'tb-workbench');
    workbench.append(frame, tie);
    root.append(mat.root, mat.running, workbench, note);

    function render() {
      const ones = done ? pile : 0;
      mat.show(tens, ones);
      pileStraws.forEach((straw, k) => { straw.hidden = k >= pile; });
      framePlaces.forEach((place, k) => { place.dataset.state = k < making ? 'shown' : 'empty'; });
      mat.onesColumn.classList.toggle('tb-column--pile', !done);
      pileButton.disabled = done || !dealing;
      tie.disabled = making < 10;
      tie.classList.toggle('tb-tie--ready', making === 10);
      workbench.hidden = done;
    }
    if (bundling) mat.onesPlaces.before(pileButton);

    scope.listen(pileButton, 'click', () => {
      if (done || !dealing || !isActive()) return;
      if (making === 10) {
        note.textContent = 'בַּצְּרוֹר כְּבָר עֶשֶׂר. קִשְׁרוּ אוֹתוֹ!';
        return;
      }
      const from = pileStraws[pile - 1].getBoundingClientRect();
      pile--;
      making++;
      note.textContent = '';
      render();
      fly(framePlaces[making - 1], from);
      void speak(numberWord(making));
    });

    scope.listen(tie, 'click', () => {
      if (making < 10 || !isActive()) return;
      const from = frame.getBoundingClientRect();
      making = 0;
      tens++;
      sounds.click();
      if (pile < 10) {
        done = true;
        dealing = false;
      }
      render();
      fly(mat.bundles[tens - 1], from);
      const line = tens === 1 && !round.ready ? 'עֶשֶׂר קַשִּׁיּוֹת הֵן צְרוֹר אֶחָד.' : `${countNoun(tens, BUNDLE)}.`;
      note.textContent = line;
      void speak(line);
      if (done) finish();
    });

    /** Ties everything at once, when the story must jump to its end. */
    function tieAll() {
      tens = round.tens;
      pile = round.ones;
      making = 0;
      done = true;
      dealing = false;
      note.textContent = '';
      render();
      finish();
    }

    render();
    return {
      className: 'tb-game',
      beats: storyFor(round),
      scene: {
        root,
        reset() {},
        start() {},
        /**
         * The child's step: the pile opens once its sentence is said.
         * @param {() => boolean} live
         * @param {Promise<unknown>} sentence
         */
        async change(live, sentence) {
          await sentence;
          if (live() && !done && !dealing) {
            dealing = true;
            render();
          }
          return tied;
        },
        settle() { if (!done) tieAll(); },
        counting: () => ({ items: mat.countingItems(round.tens, round.ones), total: straws(n).say }),
        clearCount: () => mat.clearMarks(),
      },
      choices: { values: tensChoices(round), answer: n },
      result: resultFor(round),
      ladder: [
        { hint: 'נִסְפֹּר: קֹדֶם הַצְּרוֹרוֹת, בַּעֲשָׂרוֹת', action: /** @type {const} */ ('count') },
        { hint: 'נַסּוּ אֶת הַמִּסְפָּר הַמְּסֻמָּן', action: /** @type {const} */ ('mark') },
      ],
      async onMiss(chosen) {
        mat.clearMarks();
        mat.compare(Number(chosen), round.tens, round.ones, 'chosen');
        mat.running.textContent = String(chosen);
        await say(madeOf(Number(chosen)));
      },
    };
  });
}

/**
 * Build the written number from bundles and single straws. Each change says the
 * number on the mat; "check" says what was built and what is needed.
 * @param {*} context - the round context from runGame
 * @param {Round} round
 */
function buildRound(context, round) {
  const { shell, scope, isActive } = context;
  const { say, speak, quiet } = createNarrator(scope);
  const n = totalOf(round);
  const host = el('section', 'story-round tb-game');
  const story = el('div', 'story tb-story');
  story.setAttribute('aria-live', 'polite');
  const equation = el('p', 'story-equation');
  equation.dir = 'ltr';
  const mat = buildMat();
  const controls = el('div', 'tb-controls');
  controls.dir = 'ltr';
  const lessTens = button('tb-step', '−', 'הוֹרָדַת צְרוֹר');
  const moreTens = button('tb-step', '+', 'הוֹסָפַת צְרוֹר');
  const lessOnes = button('tb-step', '−', 'הוֹרָדַת קַשִּׁית');
  const moreOnes = button('tb-step', '+', 'הוֹסָפַת קַשִּׁית');
  const tensSteps = el('div', 'tb-steps');
  tensSteps.append(lessTens, moreTens);
  const onesSteps = el('div', 'tb-steps');
  onesSteps.append(lessOnes, moreOnes);
  controls.append(tensSteps, onesSteps);
  const check = button('tb-check', 'בּוֹדְקִים ✓');
  const again = button('story-again', 'עוֹד פַּעַם 🔁', 'שמיעת המשימה שוב');
  const actions = el('div', 'tb-actions');
  actions.append(again, check);
  host.append(story, equation, mat.root, controls, mat.running, actions);
  shell.bodyEl.append(host);
  const feedback = scope.use(createFeedback(host));
  const ask = {
    text: 'בְּנוּ אֶת הַמִּסְפָּר מִצְּרוֹרוֹת וּמִקַּשִּׁיּוֹת.',
    say: `בְּנוּ אֶת הַמִּסְפָּר ${countWord(n)} מִצְּרוֹרוֹת וּמִקַּשִּׁיּוֹת.`,
  };
  let tens = 0;
  let ones = 0;
  let misses = 0;

  /** @param {{ text: string }} line @param {string} [className] */
  function addLine(line, className = 'story-line') {
    story.querySelector('.story-line--now')?.classList.remove('story-line--now');
    story.append(el('p', `${className} story-line--now`, line.text));
  }

  function render() {
    mat.clearMarks();
    mat.show(tens, ones);
    if (misses > 1) mat.compare(n, tens, ones, 'target');
    const locked = context.isAnswered();
    lessTens.disabled = locked || tens === 0;
    moreTens.disabled = locked || tens === MAX_TENS;
    lessOnes.disabled = locked || ones === 0;
    moreOnes.disabled = locked || ones === 9;
    check.disabled = locked;
    again.disabled = locked;
  }

  /** @param {number} dTens @param {number} dOnes */
  function change(dTens, dOnes) {
    if (context.isAnswered()) return;
    tens = Math.max(0, Math.min(MAX_TENS, tens + dTens));
    ones = Math.max(0, Math.min(9, ones + dOnes));
    story.querySelector('.tb-miss')?.remove();
    render();
    mat.running.textContent = String(tens * 10 + ones);
    void speak(countWord(tens * 10 + ones));
  }

  scope.listen(lessTens, 'click', () => change(-1, 0));
  scope.listen(moreTens, 'click', () => change(1, 0));
  scope.listen(lessOnes, 'click', () => change(0, -1));
  scope.listen(moreOnes, 'click', () => change(0, 1));

  scope.listen(check, 'click', () => {
    if (context.isAnswered()) return;
    const built = tens * 10 + ones;
    if (built === n) {
      void context.onCorrect(async () => {
        await quiet();
        equation.replaceChildren(`${tensExercise(round)} = `, el('span', 'story-solved', String(n)));
        const result = resultFor(round);
        addLine(result, 'story-line story-line--result');
        feedback.correct();
        void say(result.say);
      });
      return;
    }
    void context.onWrong(async () => {
      misses++;
      await quiet();
      const line = { text: `בְּנִיתֶם ${built}. צָרִיךְ ${n}.`, say: `בְּנִיתֶם ${countWord(built)}. צָרִיךְ ${countWord(n)}.` };
      story.querySelector('.tb-miss')?.remove();
      addLine(line, 'story-line tb-miss');
      feedback.hint(tens !== round.tens ? 'בִּדְקוּ אֶת הַצְּרוֹרוֹת' : 'בִּדְקוּ אֶת הַקַּשִּׁיּוֹת הַבּוֹדְדוֹת');
      // From the second miss the mat shows the places still to fill, and what is extra fades.
      render();
      mat.running.textContent = String(built);
      await say(line.say);
    });
  });

  scope.listen(again, 'click', () => {
    void (async () => {
      await quiet();
      if (isActive()) void say(ask.say);
    })();
  });
  context.subscribeAnswered(render);

  addLine(ask);
  equation.replaceChildren(el('span', 'tb-target', String(n)));
  render();
  void say(ask.say);
}

export function startGame(container) {
  return runGame(container, {
    gameId: 'tens-bundles', title: 'צְרוֹרוֹת שֶׁל עֶשֶׂר',
    defaultRounds: createRounds(),
    playCorrectSound: false,
    transitionMs: 3000,
    onReplay: () => startGame(container),
    buildRound(context) {
      const round = /** @type {Round} */ (context.round);
      if (round.kind === 'build') buildRound(context, round);
      else storyRound(context, round);
    },
  });
}
