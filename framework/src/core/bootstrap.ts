/**
 * bootstrapGame - הרכבה אחידה של רצף הפתיחה של כל משחק AlefBet.
 *
 * מחליף את הבלוק החוזר של
 *   showLoadingScreen -> preloadNikud -> hideLoadingScreen ->
 *   loadGameData -> new GameShell -> GameData.fromRoundsArray -> new GameEditor
 * שהופיע זהה בשלושת המשחקים. המודול נכתב כך שיציית לכלל ה-CLAUDE.md:
 * "Grow the framework; don't hardcode in games." כל הרכיבים שהוא מרכיב כבר
 * קיימים ומיוצאים מ-framework/src/index.ts - אין כאן לוגיקה חדשה, רק הרכבה.
 *
 * המודול כתוב ב-TypeScript כי הוא ניגש ל-GameEditor/GameData/loadGameData
 * שחיים באי ה-TS של העורך.
 */
import { GameShell } from './game-shell.js';
import { showLoadingScreen, hideLoadingScreen } from '../ui/loading-screen.js';
import { preloadNikud } from '../utils/nakdan.js';
import { loadGameData } from '../editor/editor-storage.js';
import { GameData } from '../editor/game-data.js';
import { GameEditor } from '../editor/game-editor.js';
import type { RoundRecord } from '../editor/schemas.js';

export interface BootstrapEditorOptions {
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
  showLoadingScreen(container, opts.loadingMessage ?? 'טוֹעֵן...');

  await preloadNikud(opts.preloadTexts ?? []);

  if (opts.onBeforeHide) {
    const proceed = await opts.onBeforeHide();
    if (proceed === false) {
      return { shell: null, activeRounds: [], gameData: null, aborted: true };
    }
  }

  hideLoadingScreen(container);

  const saved = loadGameData(opts.gameId);
  const activeRounds: RoundRecord[] = saved ? saved.rounds : (opts.defaultRounds ?? []);

  const shell = new GameShell(container, {
    totalRounds: opts.totalRounds ?? activeRounds.length,
    title:       opts.title,
  });

  let gameData: GameData | null = null;
  if (opts.editor) {
    const meta = {
      title: opts.editor.title ?? opts.title,
      type:  opts.editor.type  ?? 'multiple-choice',
    };
    gameData = GameData.fromRoundsArray(opts.gameId, activeRounds, meta, opts.editor.distractors ?? []);
    new GameEditor(container, gameData, { restartGame: opts.editor.restartGame });
  }

  return { shell, activeRounds, gameData, aborted: false };
}
