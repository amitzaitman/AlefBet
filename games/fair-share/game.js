/**
 * מחלקים בשווה: חילוק דרך חלוקה הוגנת, לגיל 5 עד 8.
 * הילדים מחלקים את העוגיות בעצמם, עוגייה בכל נגיעה בצלחת, והתרגיל נבנה עם
 * הסיפור: `6`, `6 : 2`, `6 : 2 = ?`. שלושה שלבים: כמה מקבל כל אחד (חלוקה),
 * חצי, שליש ורבע מקבוצה (שבר הוא תמיד שבר של משהו), וכמה צלחות מתמלאות
 * (הכלה). השלב האחרון פותח באותו תרגיל כמו הראשון, במשמעות האחרת.
 * חלוקה לא שווה נבדקת כשהצנצנת מתרוקנת: הצלחות מראות כמה יש בכל אחת, והעוגיות
 * חוזרות לצנצנת. העקרונות ב-docs/math-pedagogy.md.
 */
import { runGame, createStoryRound, numberWord, countNoun, sounds, shuffle } from '../../framework/dist/runtime.js';

/** עוּגִיָּה and צַלַּחַת are feminine, יֶלֶד is masculine. */
const COOKIE = { one: 'עוּגִיָּה', many: 'עוּגִיּוֹת', gender: /** @type {const} */ ('f') };
const PLATE = { one: 'צַלַּחַת', many: 'צַלָּחוֹת', gender: /** @type {const} */ ('f') };
const CHILD = { one: 'יֶלֶד', many: 'יְלָדִים', gender: /** @type {const} */ ('m') };
/** The part each of 2, 3 or 4 children gets. */
const PART = { 2: 'חֲצִי', 3: 'שְׁלִישׁ', 4: 'רֶבַע' };
/** Noa and Dani, as in balloon-stories; more children have faces only. */
const FACES = ['👧', '👦', '🧒', '🧑'];
/** Plates waiting when grandma puts the same number on each. */
const GROUP_PLATES = 4;

/**
 * share: `total` cookies among `by` children; each gets total / by.
 * part: the same sharing, told as a half, a third or a quarter of the cookies.
 * group: `by` cookies on each plate; total / by plates are filled.
 * tip: the round says how to deal, the first time each way of dealing comes.
 * @typedef {{ kind: 'share' | 'part' | 'group', total: number, by: number, tip?: boolean }} Round
 */

/** @param {number} min @param {number} max */
const randomInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

/**
 * Three stages of two rounds: sharing, parts of a set, and filling plates. The
 * first plate round repeats the first exercise, so `6 : 2` is met with both meanings.
 * @returns {Round[]}
 */
export function createRounds() {
  const first = /** @type {Round} */ ({ kind: 'share', by: 2, total: 2 * randomInt(2, 4), tip: true });
  const smaller = Math.random() < 0.5 ? { by: 3, total: 3 * randomInt(2, 3) } : { by: 4, total: 8 };
  return [
    first,
    { kind: 'share', by: 3, total: 3 * randomInt(2, 3) },
    { kind: 'part', by: 2, total: 2 * randomInt(3, 5) },
    { kind: 'part', ...smaller },
    { kind: 'group', by: 2, total: first.total, tip: true },
    { kind: 'group', by: 3, total: 3 * randomInt(2, 3) },
  ];
}

/** @param {Round} round */
export const answerFor = round => round.total / round.by;

/** @param {Round} round */
export const plateCount = round => (round.kind === 'group' ? GROUP_PLATES : round.by);

/**
 * Four choices in ascending order. The divisor comes first: the number of
 * children, or the cookies on a plate, is the telling mistake.
 * @param {Round} round
 * @returns {number[]}
 */
export function shareChoices(round) {
  const answer = answerFor(round);
  const max = round.kind === 'group' ? GROUP_PLATES : 9;
  const candidates = [round.by, answer - 1, answer + 1, ...shuffle([answer + 2, answer - 2]), answer + 3, answer - 3];
  const others = [...new Set(candidates)].filter(v => v >= 1 && v <= max && v !== answer);
  return [answer, ...others.slice(0, 3)].sort((a, b) => a - b);
}

/** @param {number} n @param {typeof COOKIE} noun */
const shown = (n, noun) => countNoun(n, noun, { digits: true });
/** @param {number} n @param {typeof COOKIE} noun */
const spoken = (n, noun) => countNoun(n, noun);
/**
 * A sentence is shown with digits, so it matches the exercise, and spoken with words.
 * @param {(count: (n: number, noun: typeof COOKIE) => string) => string} build
 */
const sentence = build => ({ text: build(shown), say: build(spoken) });
/** @param {string} text */
const fixed = text => ({ text, say: text });

/**
 * The story as beats. The second beat's step is the child's: once its sentence
 * is said the child deals, the story waits, and the exercise already shows the division.
 * @param {Round} round
 * @returns {{ text: string, say: string, equation: string, scene: 'start' | 'change' | 'question' }[]}
 */
export function storyFor(round) {
  const { kind, total, by } = round;
  const exercise = `${total} : ${by}`;
  const opening = { ...sentence(c => `לְסָבְתָא יֵשׁ ${c(total, COOKIE)}.`), equation: `${total}`, scene: /** @type {const} */ ('start') };
  /** @param {{ text: string, say: string }} line */
  const deal = line => ({ ...line, equation: exercise, scene: /** @type {const} */ ('change') });
  /** @param {{ text: string, say: string }} line */
  const ask = line => ({ ...line, equation: `${exercise} = ?`, scene: /** @type {const} */ ('question') });
  if (kind === 'group') {
    return [
      opening,
      deal(sentence(c => `הִיא שָׂמָה ${c(by, COOKIE)} בְּכָל צַלַּחַת.`)),
      ask(fixed('כַּמָּה צַלָּחוֹת הִיא מִלְּאָה?')),
    ];
  }
  const children = by === 2 ? fixed('נוֹעָה וְדָנִי') : sentence(c => c(by, CHILD));
  if (kind === 'share') {
    return [
      opening,
      deal({ text: `${children.text} מְקַבְּלִים אוֹתָן בְּשָׁוֶה.`, say: `${children.say} מְקַבְּלִים אוֹתָן בְּשָׁוֶה.` }),
      ask(fixed('כַּמָּה עוּגִיּוֹת קִבֵּל כָּל אֶחָד?')),
    ];
  }
  return [
    opening,
    deal(by === 2
      ? fixed('חֲצִי לְנוֹעָה, וַחֲצִי לְדָנִי.')
      : { text: `${children.text}, וְכָל אֶחָד מְקַבֵּל ${PART[by]}.`, say: `${children.say}, וְכָל אֶחָד מְקַבֵּל ${PART[by]}.` }),
    ask(sentence(c => `כַּמָּה זֶה ${PART[by]} מִתּוֹךְ ${c(total, COOKIE)}?`)),
  ];
}

/**
 * The closing sentence after a correct answer.
 * @param {Round} round
 */
export function resultFor(round) {
  const answer = answerFor(round);
  if (round.kind === 'group') return sentence(c => `הִיא מִלְּאָה ${c(answer, PLATE)}.`);
  if (round.kind === 'share') return sentence(c => `כָּל אֶחָד קִבֵּל ${c(answer, COOKIE)}.`);
  return sentence(c => `${PART[round.by]} מִתּוֹךְ ${c(round.total, COOKIE)} זֶה ${c(answer, COOKIE)}.`);
}

/**
 * How the child deals, said when a way of dealing comes for the first time.
 * @param {Round} round
 */
export const dealTip = round => fixed(round.kind === 'group'
  ? 'גְּעוּ בְּצַלַּחַת כְּדֵי לָשִׂים בָּהּ עוּגִיָּה.'
  : 'גְּעוּ בְּצַלַּחַת כְּדֵי לָתֵת עוּגִיָּה.');

/**
 * Checks the plates once the jar is empty: null when the dealing is right,
 * otherwise what is wrong, to show and say before the cookies go back.
 * @param {Round} round
 * @param {number[]} counts - cookies on each plate, left to right
 * @returns {{ text: string, say: string } | null}
 */
export function dealMiss(round, counts) {
  if (round.kind === 'group') {
    if (counts.every(c => c === 0 || c === round.by)) return null;
    return sentence(c => `בְּכָל צַלַּחַת צְרִיכוֹת לִהְיוֹת ${c(round.by, COOKIE)}.`);
  }
  if (counts.every(c => c === counts[0])) return null;
  if (round.by === 2) {
    return {
      text: `לְנוֹעָה ${counts[0]} וּלְדָנִי ${counts[1]}. זֶה לֹא שָׁוֶה.`,
      say: `לְנוֹעָה ${numberWord(counts[0])} וּלְדָנִי ${numberWord(counts[1])}. זֶה לֹא שָׁוֶה.`,
    };
  }
  return fixed('לֹא לְכֻלָּם יֵשׁ אוֹתוֹ מִסְפָּר. זֶה לֹא שָׁוֶה.');
}

/**
 * Said when a plate that is already full gets another touch.
 * @param {Round} round
 */
export const overfull = round => sentence(c => `בְּכָל צַלַּחַת ${c(round.by, COOKIE)}, לֹא יוֹתֵר.`);

/**
 * After a miss the next plate to touch glows: the one with the fewest cookies,
 * or, when filling plates, the first one that is started and not full.
 * @param {Round} round
 * @param {number[]} counts
 * @returns {number}
 */
export function nextPlate(round, counts) {
  if (round.kind === 'group') {
    const started = counts.findIndex(c => c > 0 && c < round.by);
    return started >= 0 ? started : counts.indexOf(0);
  }
  return counts.indexOf(Math.min(...counts));
}

/** @param {string} tag @param {string} [className] @param {string} [text] */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const calm = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Moves a cookie from where it was to where it is now drawn.
 * @param {HTMLElement} node
 * @param {DOMRect} from
 */
function fly(node, from) {
  if (calm || typeof node.animate !== 'function') return;
  const to = node.getBoundingClientRect();
  node.animate([
    { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px)` },
    { transform: 'none' },
  ], { duration: 300, easing: 'ease-out' });
}

/** @param {HTMLElement} node @param {number} number */
function markCounted(node, number) {
  node.classList.add('fs-counted');
  node.dataset.count = String(number);
}

/**
 * The jar, the plates and the dealing. The dealing step resolves once the jar
 * is empty and the plates are right; replaying the story keeps what was dealt.
 * @param {*} context - the round context from runGame
 * @param {Round} round
 * @param {{ say: (text: string) => Promise<unknown>, wait: (ms: number) => Promise<unknown> }} tools
 */
function buildScene(context, round, { say, wait }) {
  const { scope, isActive } = context;
  const sharing = round.kind !== 'group';
  const answer = answerFor(round);
  const root = el('div', `fs-scene fs-scene--${round.kind}`);
  root.setAttribute('role', 'group');
  const jar = el('div', 'fs-jar');
  jar.dir = 'ltr';
  const inJar = Array.from({ length: round.total }, () => el('span', 'fs-cookie'));
  for (let k = 0; k < inJar.length; k += 5) {
    const row = el('div', 'fs-row');
    row.append(...inJar.slice(k, k + 5));
    jar.append(row);
  }
  const table = el('div', 'fs-plates');
  table.dir = 'ltr';
  table.style.setProperty('--fs-cols', String(plateCount(round) === 4 && sharing ? 2 : plateCount(round)));
  const counts = Array(plateCount(round)).fill(0);
  const plates = counts.map((_, k) => {
    const plate = /** @type {HTMLButtonElement} */ (el('button', 'fs-plate'));
    plate.type = 'button';
    plate.disabled = true;
    plate.setAttribute('aria-label', sharing && round.by === 2
      ? `הַצַּלַּחַת שֶׁל ${k ? 'דָּנִי' : 'נוֹעָה'}`
      : `צַלַּחַת ${k + 1}`);
    if (sharing) plate.append(el('span', 'fs-face', FACES[k]));
    plate.append(el('span', 'fs-dish'), el('span', 'fs-badge'));
    table.append(plate);
    return plate;
  });
  const dish = k => /** @type {HTMLElement} */ (plates[k].querySelector('.fs-dish'));
  const note = el('p', 'fs-note');
  note.setAttribute('aria-live', 'polite');
  root.append(jar, table, note);

  let dealing = false;
  let busy = false;
  let dealt = false;
  let misses = 0;
  /** @type {() => void} */
  let finish = () => {};
  const done = new Promise(resolve => { finish = () => resolve(undefined); });

  function update() {
    plates.forEach((plate, k) => {
      plate.disabled = !dealing || busy;
      plate.classList.toggle('fs-plate--next', dealing && !busy && misses > 0 && k === nextPlate(round, counts));
    });
  }

  /** @param {number} k */
  function give(k) {
    if (!dealing || busy || !isActive()) return;
    if (!sharing && counts[k] >= round.by) {
      misses++;
      const line = overfull(round);
      note.textContent = line.text;
      void say(line.say);
      update();
      return;
    }
    const from = inJar[inJar.length - 1 - sum()];
    const rect = from.getBoundingClientRect();
    from.dataset.state = 'taken';
    counts[k]++;
    const cookie = el('span', 'fs-cookie');
    dish(k).append(cookie);
    fly(cookie, rect);
    sounds.click();
    if (sum() === round.total) void check();
    update();
  }

  const sum = () => counts.reduce((a, b) => a + b, 0);

  async function check() {
    const miss = dealMiss(round, counts);
    if (!miss) {
      dealing = false;
      dealt = true;
      note.textContent = '';
      update();
      finish();
      return;
    }
    misses++;
    busy = true;
    update();
    plates.forEach((plate, k) => { plate.querySelector('.fs-badge').textContent = String(counts[k]); });
    note.textContent = miss.text;
    await say(miss.say);
    await wait(600);
    if (!isActive()) return;
    putBack();
    busy = false;
    note.textContent = sharing ? 'נְחַלֵּק שׁוּב, כָּל אֶחָד בְּתוֹרוֹ.' : 'נְנַסֶּה שׁוּב.';
    update();
  }

  /** Every cookie goes back to the jar. */
  function putBack() {
    counts.fill(0);
    plates.forEach((plate, k) => {
      dish(k).replaceChildren();
      plate.querySelector('.fs-badge').textContent = '';
    });
    inJar.forEach(cookie => { cookie.dataset.state = 'in'; });
  }

  /** The dealt picture, when the story must jump to its end. */
  function dealAll() {
    putBack();
    if (sharing) counts.fill(answer);
    else counts.fill(round.by, 0, answer);
    counts.forEach((count, k) => { for (let j = 0; j < count; j++) dish(k).append(el('span', 'fs-cookie')); });
    inJar.forEach(cookie => { cookie.dataset.state = 'taken'; });
    dealing = false;
    dealt = true;
    note.textContent = '';
    update();
    finish();
  }

  plates.forEach((plate, k) => scope.listen(plate, 'click', () => give(k)));

  /** What the help counts: one child's share, or the filled plates, left to right. */
  const counted = () => (sharing
    ? /** @type {HTMLElement[]} */ ([...dish(0).querySelectorAll('.fs-cookie:not(.fs-cookie--ghost)')])
    : plates.filter((_, k) => counts[k] > 0));

  function clearCount() {
    for (const node of root.querySelectorAll('.fs-counted, .fs-chosen')) {
      node.classList.remove('fs-counted', 'fs-chosen');
      delete /** @type {HTMLElement} */ (node).dataset.count;
    }
    for (const ghost of root.querySelectorAll('.fs-cookie--ghost')) ghost.remove();
  }

  return {
    root,
    reset() {},
    start() {
      if (!dealt && !calm) inJar.forEach(cookie => cookie.animate?.([{ opacity: 0 }, { opacity: 1 }], 320));
    },
    /**
     * The child's step: the plates open once its sentence is said, and the story
     * waits until the jar is empty and the plates are right.
     * @param {() => boolean} live
     * @param {Promise<unknown>} sentence
     */
    async change(live, sentence) {
      await sentence;
      if (live() && !dealt && !dealing) {
        dealing = true;
        update();
        if (round.tip) {
          const tip = dealTip(round);
          note.textContent = tip.text;
          void say(tip.say);
        }
      }
      return done;
    },
    settle() { if (!dealt) dealAll(); },
    counting() {
      return {
        items: counted().map((node, k) => ({ say: numberWord(k + 1), mark: () => markCounted(node, k + 1) })),
        total: countNoun(answer, sharing ? COOKIE : PLATE),
      };
    },
    clearCount,
    /**
     * Shows what a wrong number says: that many cookies on one plate, with empty
     * places for cookies that are not there, or that many plates.
     * @param {number} chosen
     */
    async miss(chosen) {
      clearCount();
      const nodes = counted();
      if (sharing) {
        nodes.slice(0, chosen).forEach(node => node.classList.add('fs-chosen'));
        for (let k = nodes.length; k < chosen; k++) dish(0).append(el('span', 'fs-cookie fs-cookie--ghost'));
      } else {
        [...nodes, ...plates.filter((_, k) => !counts[k])].slice(0, chosen).forEach(plate => plate.classList.add('fs-chosen'));
      }
      await say(countNoun(chosen, sharing ? COOKIE : PLATE));
    },
  };
}

/** @param {Round} round */
const ladder = round => [
  { hint: round.kind === 'group' ? 'נִסְפֹּר אֶת הַצַּלָּחוֹת הַמְּלֵאוֹת' : 'נִסְפֹּר אֶת הָעוּגִיּוֹת בְּצַלַּחַת אַחַת', action: /** @type {const} */ ('count') },
  { hint: 'נַסּוּ אֶת הַמִּסְפָּר הַמְּסֻמָּן', action: /** @type {const} */ ('mark') },
];

export function startGame(container) {
  return runGame(container, {
    gameId: 'fair-share', title: 'מְחַלְּקִים בְּשָׁוֶה',
    defaultRounds: createRounds(),
    playCorrectSound: false,
    transitionMs: 2800,
    onReplay: () => startGame(container),
    buildRound(context) {
      const round = /** @type {Round} */ (context.round);
      createStoryRound(context, tools => {
        const scene = buildScene(context, round, tools);
        return {
          className: 'fs-game',
          beats: storyFor(round),
          scene,
          choices: { values: shareChoices(round), answer: answerFor(round) },
          result: resultFor(round),
          ladder: ladder(round),
          highlight: true,
          onMiss: chosen => scene.miss(Number(chosen)),
        };
      });
    },
  });
}
