/**
 * סיבוב סיפור: סיפור קצר שקורה על המסך, תרגיל שנבנה איתו, וכפתורי תשובה.
 *
 * כל סיבוב מציג את אותו מידע בשלוש שכבות: תמונה, תרגיל וסיפור מוקרא, וכל
 * אחת מספיקה לבד. המשחק נותן את התוכן: משפטי הסיפור (beats), התמונה וצעדיה
 * (scene), התשובות, משפט הסיום וסולם הרמזים. הערכה מנהלת את השאר: מקריאה
 * משפט אחר משפט, בונה את התרגיל, נועלת את התשובות עד השאלה, מטפלת בטעות
 * לפי הסולם (הסיפור שוב, ספירה בקול, סימון התשובה) ובתשובה נכונה, ומחכה
 * לנגיעה ראשונה כשהקול עוד חסום.
 *
 * הערכה לא יודעת מה זה בלון או צפרדע: כל מה שמצויר או זז נשאר במשחק.
 *
 * API ציבורי:
 *   createStoryRound(context, build) - בונה את הסיבוב ומחזיר { host, misses }.
 *     build מקבל { wait, say, speak } של הקריין ומחזיר StoryRoundSpec.
 */
import { createNarrator, needsTap, HUSH_MS } from '../audio/narrator.js';
import { createAnswerChoices } from '../ui/answer-choices.js';
import { createFeedback } from '../ui/feedback.js';

/**
 * משפט בסיפור.
 * @typedef {Object} StoryBeat
 * @property {string} text - מוצג, עם ספרות
 * @property {string} say - נאמר, עם מילות מספר
 * @property {string} equation - התרגיל עד עכשיו, אסימונים מופרדים ברווח; '?' הוא הנעלם; '' מסתיר
 * @property {'start' | 'change' | 'question'} scene - צעד התמונה שמתנגן עם המשפט
 * @property {boolean} [act] - הילד פועל בצעד הזה: הצעד מתחיל אחרי המשפט, והסיפור מחכה לו
 */

/**
 * התמונה של המשחק. כל צעד מקבל live, שהופך ל-false כשהסיפור התחיל מחדש או נעצר.
 * @typedef {Object} StoryScene
 * @property {HTMLElement} root
 * @property {() => void} reset - לפני שהסיפור מתנגן (שוב)
 * @property {() => void} settle - התמונה הסופית מיד, כשרמז או תשובה קוטעים את הסיפור
 * @property {(live: () => boolean) => void | Promise<void>} [start]
 * @property {(live: () => boolean) => void | Promise<void>} [change]
 * @property {(live: () => boolean) => void | Promise<void>} [question]
 * @property {() => { items: { say: string, mark: () => void }[], total?: string }} [counting]
 *   מה שהרמז 'count' סופר, נקרא אחרי settle; total נאמר בסוף ('שָׁלוֹשׁ קְפִיצוֹת')
 * @property {() => void} [clearCount] - מסיר את סימוני הספירה
 */

/**
 * צעד בסולם הרמזים: הטקסט שמוצג, והפעולה.
 * @typedef {{ hint: string, action: 'replay' | 'count' | 'mark' }} LadderStep
 */

/**
 * מה שהמשחק נותן לסיבוב.
 * @typedef {Object} StoryRoundSpec
 * @property {StoryBeat[]} beats
 * @property {StoryScene} [scene]
 * @property {import('../ui/answer-choices.js').StoryChoices} choices - מוצגות בסדר שניתן; המשחק מערבב
 * @property {{ text: string, say: string }} result - משפט הסיום אחרי תשובה נכונה
 * @property {boolean} [resultLine] - false: משפט הסיום רק נאמר, והתרגיל מראה את התשובה (ברירת מחדל true)
 * @property {string} [solvedEquation] - התרגיל שמוצג עם התשובה; ברירת מחדל: של המשפט האחרון
 * @property {LadderStep[]} ladder - צעד k עונה לטעות k+1; הצעד האחרון חוזר
 * @property {string} [className] - מחלקה נוספת על הסיבוב (למשל 'bs-game')
 * @property {boolean} [highlight] - איברים חדשים בתרגיל מהבהבים כשהמשפט שלהם מתחיל (ברירת מחדל false)
 * @property {boolean} [retireTried] - true: תשובה שגויה נפסלת ונעולה; false: נשארת לחיצה (ברירת מחדל true)
 * @property {(choice: number | string, live: () => boolean) => void | Promise<void>} [onMiss]
 *   רץ בבחירה שגויה לפני הסולם; התשובות נעולות עד שהוא מסתיים
 * @property {(live: () => boolean) => void | Promise<void>} [beforeResult]
 *   רץ אחרי בחירה נכונה ו-settle, לפני משפט הסיום; ממתינים לו בתוך onCorrect
 */

/**
 * כלי הקריין שהמשחק מקבל לבניית התמונה.
 * @typedef {Pick<ReturnType<typeof createNarrator>, 'wait' | 'say' | 'speak'>} StoryTools
 */

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

/**
 * בונה סיבוב סיפור בגוף המשחק ומתחיל אותו.
 * @param {import('./bootstrap.js').RoundContext} context
 * @param {(tools: StoryTools) => StoryRoundSpec} build
 * @returns {{ host: HTMLElement, readonly misses: number }}
 */
export function createStoryRound(context, build) {
  const { shell, scope, isActive } = context;
  const { wait, say, speak, hush } = createNarrator(scope);
  const spec = build({ wait, say, speak });
  const { beats, scene, choices, result, ladder, onMiss, beforeResult } = spec;
  const cards = 'cards' in choices;
  const lastEquation = spec.solvedEquation ?? beats[beats.length - 1].equation;
  let storyRun = 0;
  let asked = false;
  let misses = 0;

  const host = el('section', ['story-round', spec.className, cards && 'story-round--cards'].filter(Boolean).join(' '));
  const story = el('div', 'story');
  story.setAttribute('aria-live', 'polite');
  const equation = el('p', 'story-equation');
  equation.dir = 'ltr';
  const answers = createAnswerChoices(choices, { retireTried: spec.retireTried ?? true });
  const again = button('story-again', 'עוֹד פַּעַם 🔁');
  again.setAttribute('aria-label', 'שמיעת הסיפור שוב');
  host.append(story, ...(scene ? [scene.root] : []), equation, answers.root, again);
  shell.bodyEl.append(host);
  const feedback = scope.use(createFeedback(host));

  /** @param {{ text: string }} beat @param {string} [className] */
  function addLine(beat, className = 'story-line') {
    story.querySelector('.story-line--now')?.classList.remove('story-line--now');
    story.append(el('p', `${className} story-line--now`, beat.text));
    scene?.root.setAttribute('aria-label', [...story.querySelectorAll('.story-line')].map(line => line.textContent).join(' '));
  }

  /**
   * כותב את התרגיל. עם answer, סימן השאלה מתחלף בתשובה; עם before, איברים שלא היו שם מהבהבים.
   * @param {string} text @param {{ answer?: number, before?: string }} [options]
   */
  function showEquation(text, { answer, before } = {}) {
    const old = before?.split(' ');
    equation.replaceChildren(...text.split(' ').filter(Boolean).flatMap((token, k) => {
      const node = token === '?' && answer !== undefined
        ? el('span', 'story-solved', String(answer))
        : el('span', token === '?' ? 'story-unknown' : '', token);
      if (old && old[k] !== token) node.classList.add('story-term--new');
      return k ? [' ', node] : [node];
    }));
  }

  async function playStory() {
    const run = ++storyRun;
    const live = () => run === storyRun && isActive();
    // With nothing to cancel the story starts in the same tick, inside the tap that asked for it.
    if (hush()) await wait(HUSH_MS);
    if (!live()) return;
    scene?.clearCount?.();
    scene?.reset();
    story.replaceChildren();
    let shown = '';
    for (const beat of beats) {
      addLine(beat);
      showEquation(beat.equation, spec.highlight ? { before: shown } : {});
      shown = beat.equation;
      if (beat.scene === 'question' && !asked) { asked = true; update(); }
      if (beat.act) {
        await say(beat.say);
        if (!live()) return;
        await scene?.[beat.scene]?.(live);
      } else {
        await Promise.all([say(beat.say), scene?.[beat.scene]?.(live)]);
      }
      if (!live()) return;
    }
  }

  /**
   * מציג את כל הסיפור מיד, כשרמז או תשובה קוטעים אותו.
   * @returns {boolean} האם דיבור בוטל
   */
  function settle() {
    storyRun++;
    const hushed = hush();
    scene?.clearCount?.();
    scene?.settle();
    story.replaceChildren();
    beats.forEach(beat => addLine(beat));
    showEquation(beats[beats.length - 1].equation);
    return hushed;
  }

  async function countAloud() {
    const hushed = settle();
    const run = storyRun;
    const live = () => run === storyRun && isActive();
    if (hushed) await wait(HUSH_MS);
    if (!live() || !scene?.counting) return;
    const { items, total } = scene.counting();
    for (const item of items) {
      if (!live()) return;
      item.mark();
      await say(item.say, 700, 1500);
    }
    if (total && live()) await say(total);
  }

  function update() {
    answers.lock(!asked || context.isAnswered());
    again.disabled = context.isAnswered();
  }

  /** @param {LadderStep} step */
  function help(step) {
    if (step.action === 'mark') {
      answers.mark();
      feedback.hint(step.hint);
      return;
    }
    feedback.hint(step.hint);
    void (step.action === 'count' ? countAloud() : playStory());
  }

  /** @param {HTMLButtonElement} pick */
  function choose(pick) {
    if (!asked || context.isAnswered() || pick.disabled) return;
    if (!answers.isRight(pick)) {
      void context.onWrong(() => {
        misses++;
        answers.tried(pick);
        const step = ladder[Math.min(misses, ladder.length) - 1];
        if (!onMiss) return help(step);
        const run = storyRun;
        return (async () => {
          await onMiss(answers.valueOf(pick), () => run === storyRun && isActive());
          if (isActive()) help(step);
        })();
      });
      return;
    }
    void context.onCorrect(() => {
      answers.correct(pick);
      const hushed = settle();
      const finish = () => {
        showEquation(lastEquation, { answer: choices.answer });
        if (spec.resultLine ?? true) addLine(result, 'story-line story-line--result');
        feedback.correct();
        scope.schedule(() => { void speak(result.say); }, hushed ? HUSH_MS : 0);
      };
      if (!beforeResult) return finish();
      const run = storyRun;
      const live = () => run === storyRun && isActive();
      return (async () => {
        await beforeResult(live);
        if (isActive()) finish();
      })();
    });
  }

  for (const pick of answers.buttons) scope.listen(pick, 'click', () => choose(pick));
  scope.listen(again, 'click', () => { void playStory(); });
  context.subscribeAnswered(update);

  // Speech needs a first tap on most phones; until then the story waits for one.
  if (needsTap()) {
    const start = button('story-start', '▶ הַקְשִׁיבוּ לַסִּפּוּר');
    story.append(start);
    again.hidden = true;
    scope.listen(start, 'click', () => { again.hidden = false; void playStory(); });
  } else {
    void playStory();
  }

  return { host, get misses() { return misses; } };
}
