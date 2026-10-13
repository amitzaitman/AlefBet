/**
 * מאזניים: סימן השוויון אומר "אותו דבר כמו", לגיל 6 עד 8.
 * כל צד של התרגיל הוא כף במאזניים, ומשמאל לימין כמו התרגיל. הילדים מוסיפים
 * קוביות לצד שלהם ושוקלים. מאזניים ישרים הם `=`: בשני הצדדים אותו מספר.
 * הנעלם והסכום מופיעים גם משמאל ל-`=`: `? = 3 + 4`, `7 = 3 + ?`, `5 + ? = 3 + 4`
 * (עיקרון 20). שקילה לא נכונה מטה את המאזניים לצד הכבד, כך שהתמונה אומרת מה
 * התשובה אומרת (עיקרון 10). העקרונות ב-docs/math-pedagogy.md.
 */
import {
  runGame, createNarrator, needsTap, createFeedback, numberWord, countingSteps, shuffle,
} from '../../framework/dist/runtime.js';

/** A pan holds two rows of five. */
const PAN = 10;
/** Each step of a count aloud stays at least this long. */
const COUNT_MS = 700;
/** How far the beam tips toward the heavier side, in degrees. */
const TIP = 7;
/** The beam takes this long to settle, before the help speaks. */
const SWING_MS = 700;

/**
 * Each side of the exercise is a list of terms; '?' is the child's cubes.
 * @typedef {(number | '?')[]} Side
 * @typedef {{ left: Side, right: Side, tip?: boolean }} Round
 */

/** @param {number} min @param {number} max */
const randomInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

/**
 * Two different parts of a total, each at least 2.
 * @param {number} total
 * @returns {[number, number]}
 */
function split(total) {
  const a = randomInt(2, total - 2);
  return [a, total - a];
}

/**
 * Six rounds. The unknown moves around the `=`: alone on the right, alone on
 * the left, after a number, and with an exercise on both sides.
 * @returns {Round[]}
 */
export function createRounds() {
  const both = () => {
    const [a, b] = split(randomInt(6, 10));
    const c = shuffle([...Array(a + b - 3).keys()].map(k => k + 2).filter(n => n !== a && n !== b))[0] ?? 2;
    return { a, b, c };
  };
  const [p, q] = split(randomInt(5, 9));
  const [r, s] = split(randomInt(5, 10));
  const whole = randomInt(6, 10);
  const first = both();
  const second = both();
  return [
    { left: [randomInt(3, 6)], right: ['?'], tip: true },
    { left: [p, q], right: ['?'] },
    { left: ['?'], right: [r, s] },
    { left: [whole], right: [randomInt(2, whole - 2), '?'] },
    { left: [first.a, first.b], right: [first.c, '?'] },
    { left: [second.c, '?'], right: [second.a, second.b] },
  ];
}

/** @param {Side} side */
const known = side => side.reduce((sum, term) => sum + (term === '?' ? 0 : term), 0);

/** @param {Round} round @returns {'left' | 'right'} */
export const childSide = round => (round.left.includes('?') ? 'left' : 'right');

/** @param {Round} round */
export function answerFor(round) {
  const mine = childSide(round);
  return known(mine === 'left' ? round.right : round.left) - known(mine === 'left' ? round.left : round.right);
}

/**
 * The exercise as shown, with the answer in place of '?' when given.
 * @param {Round} round
 * @param {number} [answer]
 */
export function equationText(round, answer) {
  /** @param {Side} side */
  const show = side => side.map(term => (term === '?' && answer !== undefined ? answer : term)).join(' + ');
  return `${show(round.left)} = ${show(round.right)}`;
}

/** Counting words after the prefix לְ: "שָׁוֶה לְשֶׁבַע", "שָׁוֶה לִשְׁתַּיִם". */
const TO_WORD = ['לְאֶפֶס', 'לְאַחַת', 'לִשְׁתַּיִם', 'לְשָׁלוֹשׁ', 'לְאַרְבַּע', 'לְחָמֵשׁ', 'לְשֵׁשׁ', 'לְשֶׁבַע', 'לִשְׁמוֹנֶה', 'לְתֵשַׁע', 'לְעֶשֶׂר'];
/** Counting words after the prefix וְ: "שֵׁשׁ וְשֶׁבַע", "שֵׁשׁ וּשְׁמוֹנֶה". */
const AND_WORD = ['וְאֶפֶס', 'וְאַחַת', 'וּשְׁתַּיִם', 'וְשָׁלוֹשׁ', 'וְאַרְבַּע', 'וְחָמֵשׁ', 'וְשֵׁשׁ', 'וְשֶׁבַע', 'וּשְׁמוֹנֶה', 'וְתֵשַׁע', 'וְעֶשֶׂר'];

/**
 * The exercise in words, with `=` read as "שָׁוֶה לְ": "שֶׁבַע שָׁוֶה לְשָׁלוֹשׁ וְעוֹד כַּמָּה?".
 * @param {Round} round
 * @param {number} [answer] - says the solved exercise
 */
export function equationWords(round, answer) {
  /** @param {number | '?'} term */
  const word = term => (term !== '?' ? numberWord(term) : answer !== undefined ? numberWord(answer) : 'כַּמָּה');
  /** @param {number | '?'} term */
  const toWord = term => (term !== '?' ? TO_WORD[term] : answer !== undefined ? TO_WORD[answer] : 'לְכַמָּה');
  const left = round.left.map(word).join(' וְעוֹד ');
  const right = [toWord(round.right[0]), ...round.right.slice(1).map(word)].join(' וְעוֹד ');
  return `${left} שָׁוֶה ${right}${answer === undefined ? '?' : '.'}`;
}

/** The = sign, said once at the start. */
export const EQUALS_TIP = {
  text: 'הַסִּימָן = אוֹמֵר: שְׁנֵי הַצְּדָדִים שָׁוִים.',
  say: 'הַסִּימָן "שָׁוֶה" אוֹמֵר שֶׁשְּׁנֵי הַצְּדָדִים שָׁוִים.',
};
/** What to do, each round. */
export const ASK = 'שִׂימוּ קֻבִּיּוֹת בַּצַּד שֶׁלָּכֶם, וְאָז שִׁקְלוּ.';

/**
 * What a wrong weighing says, step by step: which side has more, then both
 * totals. The totals are spoken left to right, like the exercise and the count;
 * on screen they stand above their pans, so the line itself has no numbers.
 * @param {number} mine - total on the child's side
 * @param {number} other - total on the other side
 * @param {'left' | 'right'} side - where the child's pan is
 */
export function weighMiss(mine, other, side) {
  const more = mine > other;
  const [left, right] = side === 'left' ? [mine, other] : [other, mine];
  return {
    more,
    side: more ? 'בַּצַּד שֶׁלָּכֶם יוֹתֵר.' : 'בַּצַּד שֶׁלָּכֶם פָּחוֹת.',
    hint: more ? 'הוֹרִידוּ קֻבִּיּוֹת' : 'הוֹסִיפוּ קֻבִּיּוֹת',
    totals: { text: 'שְׁנֵי הַצְּדָדִים אֵינָם שָׁוִים.', say: `${numberWord(left)} ${AND_WORD[right]} אֵינָם שָׁוִים.` },
  };
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

/**
 * One pan: the cubes of each term in rows of five, left to right; the child's
 * cubes come last. `total` shows under the pan after weighing.
 * @param {Side} side
 * @param {boolean} mine
 */
function buildPan(side, mine) {
  const root = el('div', mine ? 'bl-side bl-side--mine' : 'bl-side');
  const label = el('p', 'bl-label', mine ? 'הַצַּד שֶׁלָּכֶם' : '');
  const pan = el('div', 'bl-pan');
  const total = el('p', 'bl-total');
  const places = Array.from({ length: PAN }, () => el('span', 'bl-cube'));
  for (let k = 0; k < PAN; k += 5) {
    const row = el('div', 'bl-row');
    row.append(...places.slice(k, k + 5));
    pan.append(row);
  }
  let filled = 0;
  side.forEach((term, k) => {
    if (term === '?') return;
    for (let j = 0; j < term; j++) places[filled++].dataset.term = String(k);
  });
  root.append(label, total, pan);
  return { root, pan, total, places, fixed: filled };
}

/**
 * Put cubes on your side until it is the same as the other side, then weigh.
 * @param {*} context - the round context from runGame
 * @param {Round} round
 */
function buildRound(context, round) {
  const { shell, scope, isActive } = context;
  const { say, speak, quiet, wait } = createNarrator(scope);
  const mine = childSide(round);
  const answer = answerFor(round);
  const host = el('section', 'story-round bl-game');
  const story = el('div', 'story bl-story');
  story.setAttribute('aria-live', 'polite');
  const equation = el('p', 'story-equation');
  equation.dir = 'ltr';
  const scale = el('div', 'bl-scale');
  scale.dir = 'ltr';
  scale.setAttribute('role', 'group');
  scale.setAttribute('aria-label', 'מֹאזְנַיִם');
  const left = buildPan(round.left, mine === 'left');
  const right = buildPan(round.right, mine === 'right');
  const child = mine === 'left' ? left : right;
  const other = mine === 'left' ? right : left;
  const sides = el('div', 'bl-sides');
  sides.append(left.root, right.root);
  const beam = el('div', 'bl-beam');
  scale.append(sides, beam, el('div', 'bl-stand'));
  const less = button('bl-step', '−', 'הוֹרָדַת קֻבִּיָּה');
  const more = button('bl-step', '+', 'הוֹסָפַת קֻבִּיָּה');
  // The buttons stay under the child's pan and do not move with it.
  const controls = el('div', 'bl-controls');
  controls.dir = 'ltr';
  const steps = el('div', 'bl-steps');
  steps.append(less, more);
  controls.append(...(mine === 'left' ? [steps, el('div')] : [el('div'), steps]));
  scale.append(controls);
  const weigh = button('bl-weigh', 'שׁוֹקְלִים ⚖️');
  const again = button('story-again', 'עוֹד פַּעַם 🔁', 'שמיעת התרגיל שוב');
  const actions = el('div', 'bl-actions');
  actions.append(again, weigh);
  host.append(story, equation, scale, actions);
  shell.bodyEl.append(host);
  const feedback = scope.use(createFeedback(host));
  let added = 0;
  let misses = 0;

  /** @param {{ text: string }} line @param {string} [className] */
  function addLine(line, className = 'story-line') {
    story.querySelector('.story-line--now')?.classList.remove('story-line--now');
    story.append(el('p', `${className} story-line--now`, line.text));
  }

  /** @param {boolean} [solved] */
  function showEquation(solved = false) {
    equation.replaceChildren(...equationText(round).split(' ').flatMap((token, k) => {
      const node = token === '?' && solved
        ? el('span', 'story-solved', String(answer))
        : el('span', token === '?' ? 'story-unknown bl-unknown' : '', token);
      return k ? [' ', node] : [node];
    }));
  }

  /** @param {'level' | 'left' | 'right'} down */
  function tilt(down) {
    const angle = down === 'level' ? 0 : down === 'left' ? -TIP : TIP;
    // Each pan rides its end of the beam: it rises or falls by its distance from the middle.
    const reach = sides.offsetWidth / 2 - left.root.offsetWidth / 2;
    const lift = Math.round(reach * Math.sin(angle * Math.PI / 180));
    scale.style.setProperty('--bl-tilt', `${angle}deg`);
    scale.style.setProperty('--bl-lift', `${lift}px`);
    scale.dataset.down = down;
  }

  function clearMarks() {
    for (const cube of scale.querySelectorAll('.bl-cube')) {
      cube.classList.remove('bl-cube--counted');
      cube.textContent = '';
    }
    left.total.textContent = '';
    right.total.textContent = '';
  }

  /** From the third miss the child's pan shows the places to fill, and cubes past them fade. */
  function markTarget() {
    child.places.forEach((place, k) => {
      const index = k - child.fixed;
      place.classList.toggle('bl-cube--target', misses > 2 && index >= 0 && index < answer && index >= added);
      place.classList.toggle('bl-cube--extra', misses > 2 && index >= answer && index < added);
    });
  }

  function render() {
    child.places.forEach((place, k) => {
      if (k < child.fixed) return;
      if (k - child.fixed < added) place.dataset.term = 'mine';
      else delete place.dataset.term;
    });
    const locked = context.isAnswered();
    less.disabled = locked || added === 0;
    more.disabled = locked || child.fixed + added >= PAN;
    weigh.disabled = locked;
    again.disabled = locked;
    markTarget();
  }

  /** @param {number} change */
  function step(change) {
    if (context.isAnswered()) return;
    added = Math.max(0, Math.min(PAN - child.fixed, added + change));
    clearMarks();
    tilt('level');
    render();
    void speak(numberWord(added));
  }

  /**
   * Counts a pan aloud by the row of five, and shows its total under it.
   * @param {ReturnType<typeof buildPan>} side
   * @param {number} count
   */
  async function countPan(side, count) {
    let from = 0;
    for (const { upto, say: word } of countingSteps(count)) {
      if (!isActive()) return;
      side.places.slice(from, upto).forEach((cube, k) => {
        cube.classList.add('bl-cube--counted');
        cube.textContent = String(from + k + 1);
      });
      from = upto;
      await say(word, COUNT_MS, COUNT_MS + 800);
    }
    if (isActive()) side.total.textContent = String(count);
  }

  scope.listen(less, 'click', () => step(-1));
  scope.listen(more, 'click', () => step(1));

  scope.listen(weigh, 'click', () => {
    if (context.isAnswered()) return;
    const mineTotal = child.fixed + added;
    const otherTotal = other.fixed;
    if (mineTotal === otherTotal) {
      void context.onCorrect(async () => {
        await quiet();
        clearMarks();
        tilt('level');
        scale.classList.add('bl-scale--weighed');
        left.total.textContent = String(otherTotal);
        right.total.textContent = String(otherTotal);
        showEquation(true);
        addLine({ text: 'שְׁנֵי הַצְּדָדִים שָׁוִים.' }, 'story-line story-line--result');
        feedback.correct();
        void say(equationWords(round, answer));
      });
      return;
    }
    void context.onWrong(async () => {
      misses++;
      await quiet();
      clearMarks();
      const heavy = mineTotal > otherTotal ? mine : (mine === 'left' ? 'right' : 'left');
      tilt(heavy);
      await wait(SWING_MS);
      if (!isActive()) return;
      const miss = weighMiss(mineTotal, otherTotal, mine);
      story.querySelector('.bl-miss')?.remove();
      feedback.hint(miss.hint);
      if (misses === 1) {
        addLine({ text: miss.side }, 'story-line bl-miss');
        await say(miss.side);
        return;
      }
      // From the second miss the help counts both pans, left to right like the exercise.
      await countPan(left, left === child ? mineTotal : otherTotal);
      await countPan(right, right === child ? mineTotal : otherTotal);
      if (!isActive()) return;
      addLine(miss.totals, 'story-line bl-miss');
      markTarget();
      await say(miss.totals.say);
    });
  });

  scope.listen(again, 'click', () => {
    void (async () => {
      await quiet();
      if (isActive() && !context.isAnswered()) void say(`${equationWords(round)} ${ASK}`);
    })();
  });
  context.subscribeAnswered(render);

  if (round.tip) addLine(EQUALS_TIP);
  addLine({ text: ASK });
  showEquation();
  tilt('level');
  render();
  const intro = [round.tip ? EQUALS_TIP.say : '', equationWords(round), ASK].filter(Boolean).join(' ');
  // Speech needs a first tap on most phones; until then the intro waits for one, as a story does.
  // Playing without listening removes the button too: the words are on the screen.
  if (needsTap()) {
    const start = button('story-start', '▶ הַקְשִׁיבוּ');
    story.append(start);
    const begin = () => start.remove();
    scope.listen(start, 'click', () => { begin(); void say(intro); });
    for (const control of [less, more, weigh, again]) scope.listen(control, 'click', begin);
  } else {
    void say(intro);
  }
}

export function startGame(container) {
  return runGame(container, {
    gameId: 'balance-scale', title: 'מֹאזְנַיִם',
    defaultRounds: createRounds(),
    playCorrectSound: false,
    transitionMs: 3400,
    onReplay: () => startGame(container),
    buildRound(context) {
      buildRound(context, /** @type {Round} */ (context.round));
    },
  });
}
