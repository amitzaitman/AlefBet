/**
 * תפוחים בסל: ספירה עד 10 לגיל 3 עד 5.
 * שני סוגי סיבובים. "כמה תפוחים?": סופרים בנגיעה, תפוח אחד בכל נגיעה, ובוחרים
 * מספר. "שימו 4 תפוחים בסל": בונים קבוצה ואומרים "סיימתי", כך שהילד צריך לדעת
 * מתי לעצור. כל ספירה בקול נגמרת בסכום עם שם החפץ (עיקרון 13), והעץ והסל הם
 * שורות של חמש משמאל לימין (עיקרון 14). קודם עד 5, אחר כך עד 10, ומעבר לחמש
 * העזרה סופרת שורה מלאה כ"חמש" וממשיכה משם. העקרונות ב-docs/math-pedagogy.md.
 */
import {
  runGame, createStoryRound, createNarrator, createFeedback, numberWord, countNoun, shuffle,
} from '../../framework/dist/runtime.js';

/** תַּפּוּחַ is masculine: 'תַּפּוּחַ אֶחָד', 'שְׁנֵי תַּפּוּחִים', 'חֲמִשָּׁה תַּפּוּחִים'. */
const APPLE = { one: 'תַּפּוּחַ', many: 'תַּפּוּחִים', gender: /** @type {const} */ ('m') };
/** The tree and the basket are both ten places: two rows of five. */
const PLACES = 10;
/** Each step of a count aloud stays at least this long, like the story's counting help. */
const COUNT_MS = 700;

/**
 * how-many: n apples hang on the tree; the child counts them and picks the number.
 * build: the tree is full; the child puts n apples in the basket and says done.
 * @typedef {{ kind: 'how-many' | 'build', n: number }} Round
 */

/**
 * Two stages of three rounds: up to five, then six to ten. Numbers do not repeat
 * within a stage.
 * @returns {Round[]}
 */
export function createRounds() {
  const small = shuffle([2, 3, 4, 5]);
  const big = shuffle([6, 7, 8, 9, 10]);
  return [
    { kind: 'how-many', n: small[0] },
    { kind: 'build', n: small[1] },
    { kind: 'how-many', n: small[2] },
    { kind: 'how-many', n: big[0] },
    { kind: 'build', n: big[1] },
    { kind: Math.random() < 0.5 ? 'how-many' : 'build', n: big[2] },
  ];
}

/**
 * Four choices from 1 to 10 in ascending order. One more and one less come
 * first: counting an apple twice, or skipping one.
 * @param {number} n
 * @returns {number[]}
 */
export function countChoices(n) {
  const near = [n - 1, n + 1, ...shuffle([n - 2, n + 2]), n - 3, n + 3].filter(v => v >= 1 && v <= PLACES);
  return [n, ...near.slice(0, 3)].sort((a, b) => a - b);
}

/**
 * How the help counts n apples: one by one up to five. Past five the full row
 * is one step, 'חָמֵשׁ', and the count goes on from there.
 * @param {number} n
 * @returns {{ upto: number, say: string }[]} upto - how many apples are counted after the step
 */
export function countingSteps(n) {
  const from = n > 5 ? 5 : 1;
  return Array.from({ length: n - from + 1 }, (_, k) => ({ upto: from + k, say: numberWord(from + k) }));
}

/**
 * The build instruction: shown with a digit, spoken with words.
 * @param {number} n
 */
export const buildAsk = n => ({
  text: `שִׂימוּ ${countNoun(n, APPLE, { digits: true })} בַּסַּל.`,
  say: `שִׂימוּ ${countNoun(n, APPLE)} בַּסַּל.`,
});

/**
 * What a wrong basket says, after it was counted aloud.
 * @param {number} count - apples in the basket
 * @param {number} n - apples asked for
 */
export function basketMiss(count, n) {
  return {
    text: `בַּסַּל ${countNoun(count, APPLE, { digits: true })}. צָרִיךְ ${n}.`,
    say: `צָרִיךְ ${numberWord(n, 'm')}.`,
    hint: count > n ? 'יֵשׁ יוֹתֵר מִדַּי. הַחְזִירוּ לָעֵץ' : 'חֲסֵרִים תַּפּוּחִים. הוֹסִיפוּ עוֹד',
  };
}

/** @param {string} tag @param {string} [className] @param {string} [text] */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** @param {string} className @param {string} text */
function button(className, text) {
  const node = /** @type {HTMLButtonElement} */ (el('button', className, text));
  node.type = 'button';
  return node;
}

/** @param {string} label */
function appleButton(label) {
  const apple = button('ab-apple', '');
  apple.setAttribute('aria-label', label);
  apple.append(el('span', 'ab-apple__mark'));
  return apple;
}

/**
 * Ten places in two rows of five, left to right like the exercise and the number line.
 * @param {string} className
 * @param {HTMLElement[]} places
 * @returns {{ frame: HTMLElement, rows: HTMLElement[] }}
 */
function tenFrame(className, places) {
  const frame = el('div', className);
  frame.dir = 'ltr';
  const rows = [0, 5].map(k => {
    const row = el('div', 'ab-row');
    row.append(...places.slice(k, k + 5));
    return row;
  });
  frame.append(...rows);
  return { frame, rows };
}

/** @param {HTMLElement} apple @param {number} number */
function markCounted(apple, number) {
  apple.classList.add('ab-apple--counted');
  apple.firstElementChild.textContent = String(number);
}

/** @param {HTMLElement} root */
function clearMarks(root) {
  for (const apple of root.querySelectorAll('.ab-apple')) {
    apple.classList.remove('ab-apple--counted', 'ab-apple--chosen', 'ab-apple--total');
    apple.firstElementChild.textContent = '';
  }
  for (const row of root.querySelectorAll('.ab-row--counted')) row.classList.remove('ab-row--counted');
}

/**
 * Marks one counting step: past five, the first step is the whole top row.
 * @param {HTMLElement[]} apples - in counting order
 * @param {HTMLElement[]} rows
 * @param {number} from - apples already counted
 * @param {number} upto
 */
function markStep(apples, rows, from, upto) {
  apples.slice(from, upto).forEach((apple, k) => markCounted(apple, from + k + 1));
  if (upto - from === 5) rows[0].classList.add('ab-row--counted');
}

const calm = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Moves an apple from where it was to where it is now drawn.
 * @param {HTMLElement} node
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
 * The tree for a how-many round. The child counts by touching: each apple once,
 * marked with its number. The help counts the same way and ends with the total.
 * @param {*} context - the round context from runGame
 * @param {number} n
 * @param {{ say: (text: string) => Promise<unknown>, speak: (text: string) => Promise<void> }} tools
 */
function countingTree(context, n, { say, speak }) {
  const places = Array.from({ length: PLACES }, () => appleButton('תַּפּוּחַ'));
  const apples = places.slice(0, n);
  const { frame, rows } = tenFrame('ab-frame', places);
  const root = el('div', n > 5 ? 'ab-tree' : 'ab-tree ab-tree--small');
  root.setAttribute('role', 'group');
  root.append(frame);
  /** The help is counting: touches wait until it is done. */
  let helping = false;
  let counted = 0;
  const show = state => apples.forEach(apple => { apple.dataset.state = state; });

  show('hidden');
  places.slice(n).forEach(place => { place.dataset.state = 'none'; place.disabled = true; });
  for (const apple of apples) {
    context.scope.listen(apple, 'click', () => {
      if (helping || apple.dataset.state !== 'shown' || apple.classList.contains('ab-apple--counted')) return;
      counted += 1;
      markCounted(apple, counted);
      void speak(numberWord(counted));
    });
  }

  function clearCount() {
    clearMarks(root);
    root.classList.toggle('ab-tree--small', n <= 5);
    places.slice(n).forEach(place => { place.dataset.state = 'none'; });
    counted = 0;
    helping = false;
  }

  return {
    root,
    reset() { show('hidden'); },
    start() {
      show('shown');
      if (!calm) apples.forEach(apple => apple.animate?.([{ opacity: 0 }, { opacity: 1 }], 320));
    },
    settle() { show('shown'); },
    counting() {
      helping = true;
      const steps = countingSteps(n);
      return {
        items: steps.map((step, k) => ({
          say: step.say,
          mark() {
            markStep(apples, rows, k ? steps[k - 1].upto : 0, step.upto);
            if (k === steps.length - 1) {
              apples.forEach(apple => apple.classList.add('ab-apple--total'));
              helping = false;
            }
          },
        })),
        total: countNoun(n, APPLE),
      };
    },
    clearCount,
    /**
     * Shows what a wrong number says: that many apples circled, and empty places
     * for apples that are not there.
     * @param {number} chosen
     */
    async miss(chosen) {
      clearCount();
      apples.slice(0, chosen).forEach(apple => apple.classList.add('ab-apple--chosen'));
      places.slice(n, chosen).forEach(place => { place.dataset.state = 'ghost'; });
      if (chosen > 5) root.classList.remove('ab-tree--small');
      await say(countNoun(chosen, APPLE));
    },
  };
}

/** @param {number} n */
const countLadder = n => [
  { hint: n > 5 ? 'שׁוּרָה מְלֵאָה הִיא חָמֵשׁ. נַמְשִׁיךְ לִסְפֹּר' : 'נִסְפֹּר יַחַד', action: /** @type {const} */ ('count') },
  { hint: 'נַסּוּ אֶת הַמִּסְפָּר הַמְּסֻמָּן', action: /** @type {const} */ ('mark') },
];

/**
 * How many apples are on the tree? A story round: the tree, the question, and
 * number choices with dots for children who do not read digits yet.
 * @param {*} context - the round context from runGame
 * @param {number} n
 */
function howManyRound(context, n) {
  createStoryRound(context, ({ say, speak }) => {
    const tree = countingTree(context, n, { say, speak });
    const ask = 'כַּמָּה תַּפּוּחִים עַל הָעֵץ?';
    return {
      className: 'ab-game',
      beats: [
        { text: 'עַל הָעֵץ יֵשׁ תַּפּוּחִים.', say: 'עַל הָעֵץ יֵשׁ תַּפּוּחִים.', equation: '', scene: 'start' },
        { text: ask, say: ask, equation: '', scene: 'question' },
      ],
      scene: tree,
      choices: { values: countChoices(n), answer: n },
      // The number alone, as the last step from the picture to the symbol.
      solvedEquation: '?',
      result: {
        text: `עַל הָעֵץ ${countNoun(n, APPLE, { digits: true })}.`,
        say: `עַל הָעֵץ ${countNoun(n, APPLE)}.`,
      },
      ladder: countLadder(n),
      onMiss: chosen => tree.miss(Number(chosen)),
    };
  });
}

/**
 * Put n apples in the basket. The child moves apples one touch at a time and
 * hears the count; a touch in the basket puts an apple back. "Done" counts the
 * basket aloud, ending with the total, and then says what is missing or extra.
 * @param {*} context - the round context from runGame
 * @param {number} n
 */
function buildRound(context, n) {
  const { shell, scope, isActive } = context;
  const { say, speak, quiet } = createNarrator(scope);
  const ask = buildAsk(n);
  const host = el('section', 'story-round ab-game ab-build');
  const story = el('div', 'story ab-story');
  story.setAttribute('aria-live', 'polite');
  const treeApples = Array.from({ length: PLACES }, () => appleButton('תַּפּוּחַ עַל הָעֵץ'));
  const slots = Array.from({ length: PLACES }, () => appleButton('תַּפּוּחַ בַּסַּל'));
  const tree = el('div', 'ab-tree');
  tree.setAttribute('role', 'group');
  tree.setAttribute('aria-label', 'הָעֵץ');
  tree.append(tenFrame('ab-frame', treeApples).frame);
  const { frame: basket, rows: basketRows } = tenFrame('ab-basket', slots);
  basket.setAttribute('role', 'group');
  basket.setAttribute('aria-label', 'הַסַּל');
  const equation = el('p', 'story-equation');
  equation.dir = 'ltr';
  const again = button('story-again', 'עוֹד פַּעַם 🔁');
  again.setAttribute('aria-label', 'שמיעת המשימה שוב');
  const done = button('ab-done', 'סִיַּמְתִּי ✓');
  const actions = el('div', 'ab-actions');
  actions.append(again, done);
  host.append(story, tree, basket, equation, actions);
  shell.bodyEl.append(host);
  const feedback = scope.use(createFeedback(host));
  /** Tree places of the apples in the basket, in the order they were put in. */
  const inBasket = [];
  let misses = 0;

  /** @param {{ text: string }} line @param {string} [className] */
  function addLine(line, className = 'story-line') {
    story.querySelector('.story-line--now')?.classList.remove('story-line--now');
    story.append(el('p', `${className} story-line--now`, line.text));
  }

  function render() {
    const locked = context.isAnswered();
    treeApples.forEach((apple, k) => {
      apple.dataset.state = inBasket.includes(k) ? 'taken' : 'shown';
      apple.disabled = locked || inBasket.includes(k);
    });
    slots.forEach((slot, j) => {
      slot.dataset.state = j < inBasket.length ? 'shown' : 'empty';
      slot.disabled = locked || j >= inBasket.length;
    });
    done.disabled = locked || !inBasket.length;
    again.disabled = locked;
  }

  /** After the basket changes, the old count no longer describes it. Counts queue up in order. */
  function changed() {
    clearMarks(basket);
    render();
    void speak(numberWord(inBasket.length));
  }

  treeApples.forEach((apple, k) => scope.listen(apple, 'click', () => {
    if (context.isAnswered() || inBasket.includes(k)) return;
    const from = apple.getBoundingClientRect();
    inBasket.push(k);
    changed();
    fly(slots[inBasket.length - 1], from);
  }));
  slots.forEach((slot, j) => scope.listen(slot, 'click', () => {
    if (context.isAnswered() || j >= inBasket.length) return;
    const from = slot.getBoundingClientRect();
    const [k] = inBasket.splice(j, 1);
    changed();
    fly(treeApples[k], from);
  }));

  /** Counts the basket aloud, by the row of five past five, and ends with the total. */
  async function countBasket() {
    await quiet();
    let from = 0;
    for (const step of countingSteps(inBasket.length)) {
      if (!isActive()) return;
      markStep(slots, basketRows, from, step.upto);
      from = step.upto;
      await say(step.say, COUNT_MS, COUNT_MS + 800);
    }
    if (!isActive()) return;
    slots.slice(0, inBasket.length).forEach(slot => slot.classList.add('ab-apple--total'));
    await say(countNoun(inBasket.length, APPLE));
  }

  scope.listen(done, 'click', () => {
    if (context.isAnswered() || !inBasket.length) return;
    const count = inBasket.length;
    if (count === n) {
      void context.onCorrect(async () => {
        await countBasket();
        if (!isActive()) return;
        equation.replaceChildren(el('span', 'story-solved', String(n)));
        addLine({ text: `בַּסַּל ${countNoun(n, APPLE, { digits: true })}.` }, 'story-line story-line--result');
        feedback.correct();
      });
      return;
    }
    void context.onWrong(async () => {
      misses++;
      await countBasket();
      if (!isActive()) return;
      const miss = basketMiss(count, n);
      story.querySelector('.ab-miss')?.remove();
      addLine(miss, 'story-line ab-miss');
      feedback.hint(miss.hint);
      // From the second miss the basket shows the n places to fill.
      if (misses > 1) {
        basket.classList.add('ab-basket--target');
        slots.slice(0, n).forEach(slot => slot.classList.add('ab-slot--target'));
      }
      void say(miss.say);
    });
  });

  scope.listen(again, 'click', () => {
    void (async () => {
      await quiet();
      if (isActive() && !context.isAnswered()) void say(ask.say);
    })();
  });
  context.subscribeAnswered(render);

  addLine(ask);
  render();
  void say(ask.say);
}

export function startGame(container) {
  return runGame(container, {
    gameId: 'apple-basket', title: 'תַּפּוּחִים בַּסַּל',
    defaultRounds: createRounds(),
    playCorrectSound: false,
    transitionMs: 2400,
    onReplay: () => startGame(container),
    buildRound(context) {
      const round = /** @type {Round} */ (context.round);
      if (round.kind === 'build') buildRound(context, round.n);
      else howManyRound(context, round.n);
    },
  });
}
