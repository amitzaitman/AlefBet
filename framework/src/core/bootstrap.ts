/** Shared game startup and round lifecycle. */
import { GameShell, endGame } from './game-shell.js';
import { attachGameAudio } from '../audio/game-audio.js';
import { createRoundScope } from './round-scope.js';
import { createRoundManager } from './round-manager.js';
import { createProgressBar } from '../ui/progress-bar.js';
import { installGlobalErrorScreen } from '../ui/error-screen.js';
import { showLoadingScreen, hideLoadingScreen } from '../ui/loading-screen.js';
import { preloadNikud } from '../utils/nakdan.js';
import { loadGameData } from './editor-storage.js';
import { GameData } from './game-data.js';
import type { ContentContract } from './game-data.js';
import { attachLazyEditor } from './lazy-editor.js';
import type { RoundRecord } from '../editor/schemas.js';

const starts = new WeakMap<HTMLElement, object>();

export interface BootstrapEditorOptions {
  content?: ContentContract;
  /** סוג המשחק (meta.type), למשל 'multiple-choice' או 'drag-match' */
  type?:        string;
  /** כותרת לתצוגה בעורך (meta.title) - ברירת מחדל title של bootstrap */
  title?:       string;
  /** מפתים אופציונליים שיישמרו ב-GameData */
  distractors?: unknown[];
  /** מופעל ע"י העורך בעת חזרה למצב משחק */
  restartGame?: (container: HTMLElement) => void;
}

export interface BootstrapOptions {
  /** מזהה יציב לשמירה ב-localStorage */
  gameId:          string;
  /** כותרת ה-shell - המתקשר אחראי לניקוד אם נדרש */
  title:           string;
  /** טקסטים שיועברו ל-preloadNikud */
  preloadTexts:    string[];
  /** ברירת מחדל: 'טוֹעֵן...' */
  loadingMessage?: string;
  /** סיבובים שיוחלו כאשר אין נתונים שמורים */
  defaultRounds?:  RoundRecord[];
  /** אם לא מסופק, נגזר מ-activeRounds.length */
  totalRounds?:    number;
  /** השמט כדי להשבית את העורך */
  editor?:         BootstrapEditorOptions;
  audio?:          boolean;
  /**
   * הפעל בין preload ל-hide. החזרת false מאותתת שהמשחק טיפל ב-DOM בעצמו
   * והאתחול יבוטל; במצב זה bootstrap לא יסיר את מסך הטעינה ולא יבנה shell.
   */
  onBeforeHide?:   () => boolean | void | Promise<boolean | void>;
}

export interface BootstrapResult {
  /** null כאשר aborted=true */
  shell:        GameShell | null;
  /** הסיבובים שיש להציג בפועל */
  activeRounds: RoundRecord[];
  /** null כאשר העורך לא הופעל או במצב abort */
  gameData:     GameData | null;
  /** true אם onBeforeHide החזיר false */
  aborted:      boolean;
}

/**
 * מציג מסך טעינה, טוען ניקוד, בונה GameShell ומחבר עורך - הכל בקריאה אחת.
 */
export async function bootstrapGame(container: HTMLElement, opts: BootstrapOptions): Promise<BootstrapResult> {
  endGame(container);
  const start = {};
  starts.set(container, start);
  // רשת ביטחון: שגיאה לא-מטופלת בכל שלב במשחק מציגה מסך ידידותי עם
  // כפתור "להתחיל מחדש" במקום מסך לבן. ההתקנה אידמפוטנטית.
  installGlobalErrorScreen();

  showLoadingScreen(container, opts.loadingMessage ?? 'טוֹעֵן...');

  await preloadNikud(opts.preloadTexts ?? []);
  if (starts.get(container) !== start) {
    return { shell: null, activeRounds: [], gameData: null, aborted: true };
  }

  if (opts.onBeforeHide) {
    const proceed = await opts.onBeforeHide();
    if (proceed === false || starts.get(container) !== start) {
      return { shell: null, activeRounds: [], gameData: null, aborted: true };
    }
  }

  hideLoadingScreen(container);

  const saved = opts.editor ? loadGameData(opts.gameId, opts.editor.content) : null;
  const activeRounds: RoundRecord[] = saved?.rounds.length ? saved.rounds : (opts.defaultRounds ?? []);

  const shell = new GameShell(container, {
    totalRounds: opts.totalRounds ?? activeRounds.length,
    title:       opts.title,
    gameId:      opts.gameId,
  });
  if (opts.audio !== false) attachGameAudio(shell);

  let gameData: GameData | null = null;
  if (opts.editor) {
    const meta = {
      title: opts.editor.title ?? opts.title,
      type:  opts.editor.type  ?? 'multiple-choice',
    };
    gameData = GameData.fromRoundsArray(opts.gameId, activeRounds, meta, opts.editor.distractors ?? [], opts.editor.content);
    attachLazyEditor(shell, gameData, { restartGame: opts.editor.restartGame });
  }

  return { shell, activeRounds, gameData, aborted: false };
}

export interface RoundContext {
  shell: GameShell;
  round: RoundRecord;
  index: number;
  onCorrect: (action?: () => void | Promise<void>) => Promise<void>;
  onWrong: (action?: () => void | Promise<void>) => Promise<void>;
  isAnswered: () => boolean;
  isActive: () => boolean;
  scope: ReturnType<typeof createRoundScope>;
  subscribeAnswered: (listener: (answered: boolean) => void) => () => void;
  /** Compatibility alias; new games may use scope.schedule. */
  schedule: (action: () => void, delayMs: number) => () => void;
}

export interface RunGameOptions extends Omit<BootstrapOptions, 'totalRounds'> {
  buildRound: (context: RoundContext) => void | (() => void);
  onStart?: (shell: GameShell) => void;
  onReplay?: () => void;
  transitionMs?: number;
  playCorrectSound?: boolean;
}

/**
 * עזר אופציונלי למשחקי סיבובים. המשחק מגדיר תוכן ומשוב; העזר מנהל
 * ניקוד, מעבר, סיום ופירוק רכיבי הסיבוב. אולפנים וכלים אינם חייבים להשתמש בו.
 */
export async function runGame(container: HTMLElement, opts: RunGameOptions): Promise<BootstrapResult> {
  const result = await bootstrapGame(container, opts);
  if (result.aborted) return result;
  const { shell, activeRounds } = result;
  if (!activeRounds.length) {
    shell.bodyEl.textContent = 'אֵין סִבּוּבִים לַמִּשְׂחָק.';
    shell.end();
    return result;
  }
  const progress = createProgressBar(shell.footerEl as HTMLElement, activeRounds.length);
  let scope: ReturnType<typeof createRoundScope> | undefined;
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
