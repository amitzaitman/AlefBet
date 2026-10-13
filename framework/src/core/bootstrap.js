/**
 * הפעלת משחק משותפת: bootstrapGame מכין מסך ו-GameShell, ו-runGame מוסיף
 * מחזור סיבובים אופציונלי (ניקוד, מעבר, סיום ופירוק רכיבי הסיבוב).
 */
import { GameShell, endGame } from './game-shell.js';
import { createRoundScope } from './round-scope.js';
import { createRoundManager } from './round-manager.js';
import { createProgressBar } from '../ui/progress-bar.js';
import { installGlobalErrorScreen } from '../ui/error-screen.js';
import { showLoadingScreen, hideLoadingScreen } from '../ui/loading-screen.js';

/** @type {WeakMap<HTMLElement, object>} */
const starts = new WeakMap();

/**
 * סיבוב: מפה פתוחה שהמשחק מגדיר.
 * @typedef {Record<string, unknown>} RoundRecord
 */

/**
 * הגדרות האתחול של משחק.
 * @typedef {Object} BootstrapOptions
 * @property {string} gameId - מזהה יציב לשמירה ב-localStorage
 * @property {string} title - כותרת ה-shell; המתקשר אחראי לניקוד אם נדרש
 * @property {string} [loadingMessage] - ברירת מחדל: 'טוֹעֵן...'
 * @property {RoundRecord[]} [defaultRounds] - סיבובי המשחק
 * @property {number} [totalRounds] - אם לא מסופק, נגזר מ-activeRounds.length
 * @property {boolean} [audio] - false מוותר על טעינת השמע (דיבור ובאנר שמע)
 * @property {() => boolean | void | Promise<boolean | void>} [onBeforeHide]
 *   הפעל בין preload ל-hide. החזרת false מאותתת שהמשחק טיפל ב-DOM בעצמו
 *   והאתחול יבוטל; במצב זה bootstrap לא יסיר את מסך הטעינה ולא יבנה shell.
 */

/**
 * תוצאת האתחול.
 * @typedef {Object} BootstrapResult
 * @property {GameShell | null} shell - null כאשר aborted=true
 * @property {RoundRecord[]} activeRounds - הסיבובים שיש להציג בפועל
 * @property {boolean} aborted - true אם onBeforeHide החזיר false או שהתחלה חדשה החליפה את זו
 */

/**
 * מציג מסך טעינה, טוען את מודול השמע (אלא אם audio=false), מריץ onBeforeHide
 * ובונה GameShell - הכל בקריאה אחת.
 * @param {HTMLElement} container
 * @param {BootstrapOptions} opts
 * @returns {Promise<BootstrapResult>}
 */
export async function bootstrapGame(container, opts) {
  endGame(container);
  const start = {};
  starts.set(container, start);
  // רשת ביטחון: שגיאה לא-מטופלת בכל שלב במשחק מציגה מסך ידידותי עם
  // כפתור "להתחיל מחדש" במקום מסך לבן. ההתקנה אידמפוטנטית.
  installGlobalErrorScreen();

  showLoadingScreen(container, opts.loadingMessage ?? 'טוֹעֵן...');

  const audioModule = opts.audio !== false ? await import('../audio/game-audio.js') : null;
  if (starts.get(container) !== start) {
    return { shell: null, activeRounds: [], aborted: true };
  }

  if (opts.onBeforeHide) {
    const proceed = await opts.onBeforeHide();
    if (proceed === false || starts.get(container) !== start) {
      return { shell: null, activeRounds: [], aborted: true };
    }
  }

  hideLoadingScreen(container);

  /** @type {RoundRecord[]} */
  const activeRounds = opts.defaultRounds ?? [];

  const shell = new GameShell(container, {
    totalRounds: opts.totalRounds ?? activeRounds.length,
    title:       opts.title,
    gameId:      opts.gameId,
  });
  audioModule?.attachGameAudio(shell);

  return { shell, activeRounds, aborted: false };
}

/**
 * מה ש-buildRound מקבל בכל סיבוב.
 * @typedef {Object} RoundContext
 * @property {GameShell} shell
 * @property {RoundRecord} round - הסיבוב הנוכחי מתוך defaultRounds
 * @property {number} index - מיקום הסיבוב, מ-0
 * @property {(action?: () => void | Promise<void>) => Promise<void>} onCorrect - תשובה נכונה: נועל, מריץ את הפעולה, מוסיף ניקוד ועובר לסיבוב הבא
 * @property {(action?: () => void | Promise<void>) => Promise<void>} onWrong - תשובה שגויה: נועל בזמן הפעולה ונשארים בסיבוב
 * @property {() => boolean} isAnswered - true כשהתשובה נעולה (בזמן טיפול בתשובה ואחרי תשובה נכונה) או כשהסיבוב לא פעיל
 * @property {() => boolean} isActive - false אחרי מעבר, התחלה מחדש או יציאה; לבדוק אחרי await
 * @property {ReturnType<typeof createRoundScope>} scope - משאבי הסיבוב, מתפרקים יחד בסופו
 * @property {(listener: (answered: boolean) => void) => () => void} subscribeAnswered - מאזין לשינויי הנעילה; מחזיר ביטול הרשמה
 * @property {(action: () => void, delayMs: number) => () => void} schedule - כינוי לתאימות; משחקים חדשים יכולים להשתמש ב-scope.schedule
 */

/**
 * מה שמשחק סיבובים מוסיף להגדרות האתחול.
 * @typedef {Object} RunGameHooks
 * @property {(context: RoundContext) => void | (() => void)} buildRound - בונה את ממשק הסיבוב; פונקציה מוחזרת רצה בפירוק
 * @property {(shell: GameShell) => void} [onStart] - בכל התחלה, לפני הסיבוב הראשון
 * @property {() => void} [onReplay] - "שוב" במסך הסיום; ברירת מחדל: runGame מחדש
 * @property {number} [transitionMs] - זמן לפני הסיבוב הבא
 * @property {boolean} [playCorrectSound] - כבה אם המשחק כבר משמיע משוב
 */

/**
 * הגדרות runGame: כל הגדרות האתחול מלבד totalRounds, שנגזר ממספר הסיבובים.
 * @typedef {Omit<BootstrapOptions, 'totalRounds'> & RunGameHooks} RunGameOptions
 */

/**
 * עזר אופציונלי למשחקי סיבובים. המשחק מגדיר תוכן ומשוב; העזר מנהל
 * ניקוד, מעבר, סיום ופירוק רכיבי הסיבוב. אולפנים וכלים אינם חייבים להשתמש בו.
 * @param {HTMLElement} container
 * @param {RunGameOptions} opts
 * @returns {Promise<BootstrapResult>}
 */
export async function runGame(container, opts) {
  const result = await bootstrapGame(container, opts);
  if (result.aborted) return result;
  const { shell, activeRounds } = result;
  if (!activeRounds.length) {
    shell.bodyEl.textContent = 'אֵין סִבּוּבִים לַמִּשְׂחָק.';
    shell.end();
    return result;
  }
  const progress = createProgressBar(/** @type {HTMLElement} */ (shell.footerEl), activeRounds.length);
  /** @type {ReturnType<typeof createRoundScope> | undefined} */
  let scope;
  const disposeRound = () => { scope?.dispose(); scope = undefined; };
  const manager = createRoundManager(shell, container, {
    totalRounds: activeRounds.length,
    completionOnly: true,
    progressBar: progress,
    transitionMs: opts.transitionMs,
    playCorrectSound: opts.playCorrectSound,
    onReplay: opts.onReplay ?? (() => { void runGame(container, opts); }),
    buildRoundUI,
  });
  shell.on('end', disposeRound);
  shell.on('start', () => {
    progress.update(0);
    opts.onStart?.(shell);
    manager.reset();
  });
  shell.on('start', buildRoundUI);
  function buildRoundUI() {
    disposeRound();
    shell.bodyEl.innerHTML = '';
    const currentScope = createRoundScope();
    scope = currentScope;
    const isActive = () => !shell.ended && !currentScope.signal.aborted;
    const index = shell.state.currentRound - 1;
    try {
      const cleanup = opts.buildRound({
        shell, index, round: activeRounds[index], isActive, scope: currentScope,
        isAnswered: () => !isActive() || manager.isAnswered(),
        subscribeAnswered: listener => {
          if (!isActive()) { listener(true); return () => {}; }
          return currentScope.use(manager.subscribe(listener));
        },
        onCorrect: async action => { if (isActive()) await manager.handleCorrect(action); },
        onWrong: async action => { if (isActive()) await manager.handleWrong(action); },
        schedule: currentScope.schedule,
      });
      if (cleanup) currentScope.use(cleanup);
    } catch (error) {
      currentScope.dispose();
      throw error;
    }
  }
  shell.start();
  return result;
}
