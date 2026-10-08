/**
 * מפרקים תרגיל ארוך: שרשרת חיבור וחיסור נפתרת משמאל לימין, חלק אחד בכל פעם.
 * כל חלק שנפתר מתכווץ למספר אחד, והתרגיל מתקצר עד שנשארת התשובה.
 * המשחק מחזיק את יצירת התרגילים, הרמזים והרינדור; runGame מנהל סיבובים וסיום.
 */
import { runGame, createFeedback, sounds, shuffle, animate } from '../../framework/dist/common.js';

/** Every running total stays within 1..MAX_TOTAL, so each part is a small sum. */
const MAX_TOTAL = 20;
const STEP_PAUSE_MS = 700;

/** Exercises grow longer; subtraction joins once decomposing is familiar. */
export const LEVELS = [
  { terms: 3, minus: false, biggest: 5 },
  { terms: 4, minus: false, biggest: 5 },
  { terms: 4, minus: true, biggest: 6 },
  { terms: 5, minus: true, biggest: 7 },
  { terms: 6, minus: true, biggest: 8 },
  { terms: 7, minus: true, biggest: 9 },
];

/** @param {number} min @param {number} max */
const randomInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

/**
 * @param {{ terms: number, minus: boolean, biggest: number }} level
 * @returns {{ start: number, parts: { op: '+' | '-', value: number }[] }}
 */
export function createExercise({ terms, minus, biggest }) {
  const start = randomInt(1, biggest);
  let total = start;
  let usedMinus = false;
  const parts = [];
  for (let i = 1; i < terms; i++) {
    const canAdd = total < MAX_TOTAL;
    const canSubtract = minus && total > 1;
    const mustSubtract = canSubtract && !usedMinus && i === terms - 1;
    const subtract = canSubtract && (!canAdd || mustSubtract || Math.random() < 0.4);
    const value = subtract
      ? randomInt(1, Math.min(biggest, total - 1))
      : randomInt(1, Math.min(biggest, MAX_TOTAL - total));
    total += subtract ? -value : value;
    usedMinus ||= subtract;
    parts.push({ op: subtract ? '-' : '+', value });
  }
  return { start, parts };
}

/**
 * The order in which the chain is solved: the running total meets the next term.
 * @param {{ start: number, parts: { op: '+' | '-', value: number }[] }} exercise
 */
export function solveSteps({ start, parts }) {
  let total = start;
  return parts.map(({ op, value }) => {
    const left = total;
    total = op === '+' ? total + value : total - value;
    return { left, op, right: value, result: total };
  });
}

/**
 * Four nearby answers in ascending order, including the other operation's result.
 * @param {{ left: number, op: string, right: number, result: number }} step
 */
export function answerChoices({ left, op, right, result }) {
  const swapped = op === '+' ? left - right : left + right;
  const near = [result - 1, result + 1, result - 2, result + 2, swapped, left];
  const distractors = shuffle([...new Set(near)].filter(n => n >= 0 && n !== result)).slice(0, 3);
  return [result, ...distractors].sort((a, b) => a - b);
}

const sign = op => (op === '+' ? '+' : '−');

/** @param {string} tag @param {string} [className] @param {string} [text] */
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Ten-frame rows: the first number, then the added or crossed-out dots. */
function dotsFor({ left, op, right }) {
  const count = op === '+' ? left + right : left;
  const dots = Array.from({ length: count }, (_, i) => {
    if (i >= left) return 'chain-dot chain-dot--added';
    return op === '-' && i >= left - right ? 'chain-dot chain-dot--removed' : 'chain-dot';
  });
  const rows = [];
  for (let i = 0; i < dots.length; i += 10) {
    const row = el('div', 'chain-dots__row');
    for (let j = i; j < Math.min(i + 10, dots.length); j += 5) {
      const group = el('span', 'chain-dots__group');
      dots.slice(j, Math.min(j + 5, i + 10)).forEach(name => group.append(el('span', name)));
      row.append(group);
    }
    rows.push(row);
  }
  return rows;
}

export function startGame(container) {
  return runGame(container, {
    gameId: 'long-exercise', title: 'מְפָרְקִים תַּרְגִּיל אָרֹךְ',
    defaultRounds: LEVELS.map(createExercise), audio: false, playCorrectSound: false,
    transitionMs: 1600,
    onReplay: () => startGame(container),
    buildRound(context) {
      const { shell, round, scope } = context;
      const steps = solveSteps(round);
      const answer = steps[steps.length - 1].result;
      let step = 0;
      let misses = 0;
      let pausing = false;

      const host = el('section', 'chain-game');
      const heading = el('h2', '', 'פִּתְרוּ אֶת הַתַּרְגִּיל חֵלֶק אַחַר חֵלֶק');
      const original = el('p', 'chain-original');
      original.dir = 'ltr';
      original.setAttribute('aria-label', 'התרגיל המלא');
      const current = el('p', 'chain-current');
      current.dir = 'ltr';
      const question = el('p', 'chain-question');
      question.setAttribute('aria-live', 'polite');
      const choices = el('div', 'chain-choices');
      choices.dir = 'ltr';
      const help = el('button', 'chain-help', 'רֶמֶז');
      help.type = 'button';
      help.setAttribute('aria-label', 'רמז לחלק המסומן');
      const dots = el('div', 'chain-dots');
      dots.setAttribute('role', 'img');
      dots.dir = 'ltr';
      dots.hidden = true;
      const trail = el('ol', 'chain-trail');
      trail.dir = 'ltr';
      trail.setAttribute('aria-label', 'חלקים שפתרנו');
      host.append(heading, original, current, question, choices, help, dots, trail);
      shell.bodyEl.append(host);
      const feedback = scope.use(createFeedback(host));

      const term = (value, className = '') => el('span', `chain-term ${className}`.trim(), String(value));
      const operator = op => el('span', 'chain-op', sign(op));
      const countHint = () => (steps[step].op === '+'
        ? 'סִפְרוּ אֶת כָּל הַנְּקֻדּוֹת'
        : 'סִפְרוּ אֶת הַנְּקֻדּוֹת שֶׁנִּשְׁאֲרוּ');

      /** The full exercise stays visible: merged terms are green, the next term is marked. */
      function renderOriginal() {
        const values = [round.start, ...round.parts.map(part => part.value)];
        const state = k => {
          if (step === values.length - 1 || (step > 0 && k <= step)) return 'chain-term--done';
          return k <= step + 1 && !pausing ? 'chain-term--next' : '';
        };
        const tokens = values.flatMap((value, k) => {
          const piece = term(value, state(k));
          return k === 0 ? [piece] : [operator(round.parts[k - 1].op), piece];
        });
        const solved = step === steps.length;
        original.replaceChildren(...tokens, el('span', 'chain-op', '='),
          el('span', solved ? 'chain-answer chain-answer--solved' : 'chain-answer', solved ? String(answer) : '?'));
      }

      /** The shortened exercise: the running total, then the terms still waiting. */
      function renderCurrent() {
        const total = step === 0 ? round.start : steps[step - 1].result;
        const first = term(total, step > 0 ? 'chain-term--total' : '');
        const rest = round.parts.slice(step + (pausing ? 0 : 1)).flatMap(part => [operator(part.op), term(part.value)]);
        if (step === steps.length) {
          current.replaceChildren(first);
        } else if (pausing) {
          current.replaceChildren(first, ...rest, el('span', 'chain-op', '='), el('span', 'chain-answer', '?'));
        } else {
          const box = el('span', 'chain-part');
          box.setAttribute('role', 'group');
          box.setAttribute('aria-label', `החלק המסומן: ${steps[step].left} ${steps[step].op === '+' ? 'ועוד' : 'פחות'} ${steps[step].right}`);
          box.append(first, operator(steps[step].op), term(steps[step].right, step > 0 ? 'chain-term--next' : ''));
          current.replaceChildren(box, ...rest, el('span', 'chain-op', '='), el('span', 'chain-answer', '?'));
        }
        if (step > 0 && (pausing || step === steps.length)) animate(first, 'bounce');
      }

      function renderChoices() {
        if (pausing || step === steps.length) { choices.replaceChildren(); return; }
        choices.replaceChildren(...answerChoices(steps[step]).map(value => {
          const button = el('button', 'chain-choice', String(value));
          button.type = 'button';
          button.dataset.value = String(value);
          scope.listen(button, 'click', () => choose(button, value));
          return button;
        }));
      }

      function render() {
        renderOriginal();
        renderCurrent();
        renderChoices();
        if (step === steps.length) question.replaceChildren();
        else if (!pausing) question.textContent = `חֵלֶק ${step + 1} מִתּוֹךְ ${steps.length}: כַּמָּה זֶה?`;
        dots.hidden = true;
        update();
      }

      function update() {
        const locked = pausing || context.isAnswered();
        for (const button of choices.querySelectorAll('button')) {
          if (locked) button.disabled = true;
          else if (!button.classList.contains('chain-choice--tried')) button.disabled = false;
        }
        help.disabled = locked || step === steps.length;
      }

      function showDots() {
        const { left, op, right } = steps[step];
        dots.setAttribute('aria-label', op === '+'
          ? `${left} נקודות ועוד ${right} נקודות`
          : `${left} נקודות, ${right} מהן מחוקות`);
        dots.replaceChildren(...dotsFor(steps[step]));
        dots.hidden = false;
      }

      function choose(button, value) {
        if (pausing || context.isAnswered() || button.disabled) return;
        const { left, op, right, result } = steps[step];
        if (value !== result) {
          void context.onWrong(() => {
            misses++;
            button.disabled = true;
            button.classList.add('chain-choice--tried');
            showDots();
            if (misses >= 2) {
              choices.querySelector(`[data-value="${result}"]`)?.classList.add('chain-choice--hint');
              feedback.hint('נַסּוּ אֶת הַמִּסְפָּר הַמְּסֻמָּן');
            } else feedback.hint(countHint());
          });
          return;
        }
        misses = 0;
        const solved = `${left} ${sign(op)} ${right} = ${result}`;
        trail.append(el('li', '', solved));
        step++;
        if (step === steps.length) {
          render();
          void context.onCorrect(() => feedback.correct('פְּתַרְתֶּם אֶת כָּל הַתַּרְגִּיל!'));
          return;
        }
        // Pause on the merged number before marking the next part.
        sounds.correct();
        pausing = true;
        // An isolated LTR run keeps "3 + 4 = 7" from being reordered inside Hebrew text.
        const equation = el('bdi', 'chain-equation', solved);
        equation.dir = 'ltr';
        question.replaceChildren('נָכוֹן! ', equation);
        render();
        scope.schedule(() => { pausing = false; render(); }, STEP_PAUSE_MS);
      }

      scope.listen(help, 'click', () => {
        if (pausing || context.isAnswered() || step === steps.length) return;
        showDots();
        feedback.hint(countHint());
      });
      context.subscribeAnswered(update);
      render();
    },
  });
}
