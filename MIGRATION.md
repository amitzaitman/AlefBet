# MIGRATION — תכנית תיקונים לתשתית

התשתית עובדת לילדים עכשיו. כל שינוי גדול בלי חוזה ביניים שובר משחקים ו-PWA.

הסדר פה הוא לפי סיכון × תלות, לא לפי «חשיבות רעיונית». כל צעד הוא ענף קצר → `npm run check` + e2e של המשחק שנגעתם בו → merge ל-`main` → Pages עולה. לא צוברים 5 שכבות על אותו ענף.

**אל תתחילו מ-Vite לכל האתר.** זה הצעד הכי מפתה והכי מסוכן: הוא נוגע ב-`sw.js`, ב-Pages, ב-`start.js` ובכל נתיב טעינה בבת אחת.

---

## מעקב (סמנו אחרי כל merge ל-`main`)

ביצוע 2026-09-06: שלב 1 הוכן בענף `codex/migration-1-lifecycle-helpers`.
כולל תיקון lifecycle כתנאי לחיבור שמע משותף: סיום יחיד, ביטול timers
בהפעלה מחדש, ניקוי העורך, ומניעת אתחול ישן שמחליף משחק חדש.
תיבות הסימון נשארות פתוחות עד למיזוג ובדיקת טלפון אמיתי.

שלבים 2–3 הוכנו בנפרד: כניסות runtime/editor, ולאחריהן טעינת העורך
בלחיצה בלבד. מודל התוכן והשמירה עברו ל-core עם re-exports לתאימות.
בנייה נפרדת ל-runtime שומרת גם את החבילה הישנה; manifest שנוצר בבנייה
מוסיף ל-precache את כל התלויות הסטטיות. CSS העורך נטען עם העורך.
אין שינוי בנתיבי האתר או בצורך בבנייה בעת פתיחה מקומית.

- [x] 0 catalog — מקור אמת אחד למשחקים
- [ ] 1 shared helpers — shuffle + unlock-שמע + באנר כמודולי runtime
- [ ] 2 split entries (ה-dist עדיין מונוליטי כ-re-export)
- [ ] 3 lazy editor
- [ ] 4a `runGame` + syllable-read
- [ ] 4b `runGame` + letter-match-animals
- [ ] 4c `runGame` + nikud-match
- [ ] 4d החלטת לולאות ישנות (והחלה על nikud-speak / sound-studio)
- [ ] 5 vite app / uncommit dist
- [ ] 6 ניקוי: מחיקת UMD, `createAppShell` מחוץ ל-runtime

גיטהאב: PR לכל שורה, לייבל `infra`. בלי Projects ובלי מיילסטונים.

---

## מצב `main` כעת כתיבת התכנית

נכון ל-`c21e75b` (2026-07-29). המשחקים חיים, ה-PWA עובד, CI רץ `npm run check` + Playwright + בדיקת שה-`framework/dist` המחויב תואם בנייה טריה.

| נושא | מצב עכשיו | למה זה כואב |
|---|---|---|
| קטלוג משחקים | כפול: `sw.js` `GAMES`, כרטיסים קשוחים ב-`index.html`, רשימת CLAUDE.md | משחק חדש נשכח מה-SW ולא עובד אופליין |
| shuffle | מועתק ב-`letter-match-animals/game.js` ו-`syllable-read/game.js` | כפילות, וגם מימוש מוטה (`.sort(() => Math.random()-0.5)`) |
| unlock שמע | 4 וריאנטים שונים של `tts.unlock` בכל משחק | הריפקטור הכי מסוכן אצלכם הוא שמע+iOS |
| באנר שמע | `mountAudioStatusBanner` נקרא ידנית אחרי `bootstrapGame` | קל לשכוח במשחק חדש |
| פיצול runtime/editor | `framework/src/index.ts` מייצא הכול; Vite lib entry יחיד | הילד משלם 220KB `alefbet.js` כולל עורך+zod |
| עורך עצל | `bootstrap.ts` מייבא **סטטית** את `GameEditor` / `GameData` / `loadGameData` | אפילו משחק בלי `editor:` (הברות, אמור-ניקוד, אולפן) |
| עורך פעיל | רק `letter-match-animals` (`multiple-choice`) ו-`nikud-match` (`drag-match`) | שאר המשחקים לא צריכים לשלם עליו |
| מנהל סיבובים | `createRoundManager` קיים; רק `syllable-read` משתמש בו | השאר משכפלים לולאה ידנית (~40 שורות) |
| `runGame` | לא קיים | צעד 4 |
| dist בגיט | `framework/dist/{alefbet.js,alefbet.css,alefbet.umd.cjs}` מחויב; CI עם `git diff --exit-code` | לא לנגוע עד שה-API קפוא |
| UMD | נבנה, אף משחק לא טוען אותו | צעד 6 |
| `createAppShell` | מיוצא מ-`index.ts`, אף משחק לא קורא לו | צעד 6 |
| Node | `engines.node` כבר הוא `>=20.19.0`; README עדיין כותב «18+» | תיקון תיעוד בצעד 0 או 6 |

חוזה ישן (חי עד שכל המשחקים עברו): `games/*/game.js` מייבא מ-`framework/dist/alefbet.js`, `bootstrapGame` עובד כמו היום.

חוזה חדש (נולד בצעד 2–4): runtime נפרד + `runGame`. רק אחרי שכל המשחקים עברו מוחקים את הישן.

---

## צעד 0 — קטלוג משחקים אחד

**ענף:** `chore/game-catalog`
**סיכון:** נמוך. לא נוגע ב-bundle.
**למה עכשיו:** זול, מונע שכחה ב-SW, וגם מתקן טעות בכרטיס הבית של אותיות (עדיין כתוב «אותיות אַגאח» אף ש-`buildRounds` כבר בוחר 8 מתוך 22).

### מה לעשות

קובץ אחד, למשל `games/catalog.js`, שמייצא מערך עם `id` / `title` / `desc` / `kind` (`game` | `teacher-tool`). ה-SW הוא classic script ולא ESM, לכן הקובץ חייב לעבוד גם כ-`importScripts` וגם מסקריפט בדף הבית — בלי צעד בנייה.

- `sw.js` בונה את `CORE_ASSETS` מהמערך הזה. לא רשימת `GAMES` נפרדת.
- `index.html` מצייר את הכרטיסים מאותו מקור (אייקונים ו-CSS נשארים; רק הנתונים זזים).
- `CLAUDE.md` / `_template`: «משחק חדש = העתיקו תבנית + שורה בקטלוג». בלי שני מקומות.
- באותה הזדמנות: כרטיס האותיות יורד מ«אותיות אגאח», README «Node 18+» → «Node 20+» כמו `package.json`.

### סימן שסיימתם

`index.html` ו-`sw.js` קוראים מאותו מערך. `e2e/pwa.spec.js` ירוק (הקבצים עדיין במטמון).

### מה לא לעשות

לא לשנות את `CACHE_VERSION` בלי צורך. לא להעביר את הקטלוג דרך Vite.

---

## צעד 1 — עזרים משותפים ב-runtime

**ענף:** `chore/shared-helpers`
**סיכון:** נמוך. אין שינוי התנהגות לילד.
**אם e2e נכשל — זה באג קיים שנחשף, לא הריפקטור.**

### מה לעשות

1. `framework/src/utils/shuffle.js` — Fisher–Yates. ייצוא מ-`index.ts`. מחיקת ההעתקים במשחקים.
2. `bootstrapGame` מרכיב בפנים, אם לא ביטלו:
   - `mountAudioStatusBanner(container)` + `destroy` על `shell.on('end')`
   - `tts.unlock()` על `pointerdown` ראשון (`once`, `capture`)
3. המשחקים (כולל `_template`) מורידים את העתיקים. `sound-studio` לא עובר דרך `bootstrapGame` — או שמעבירים אותו אליו, או שמשאירים את קריאת `unlock` המקומית.

### סימן שסיימתם

המשחקים קוראים לפונקציה אחת במקום להעתיק. e2e של כל 5 המשחקים ירוק.

---

## צעד 2 — פיצול פנימי, API חיצוני זהה

**ענף:** `chore/split-entries`
**סיכון:** בינוני.

### מה לעשות

```
framework/src/runtime/index.ts   ← כל מה שהילד צריך
framework/src/editor/index.ts    ← עורך + zod schemas (כבר קיים תחת editor/)
framework/src/index.ts           ← עדיין מייצא הכול, בשביל dist הישן
```

ה-Vite entry נשאר `src/index.ts`. הילדים עדיין טוענים את `framework/dist/alefbet.js`.

**אם שיניתם `games/` כאן — פיצלתם יותר מדי.**

### בדיקה ידנית קצרה

אותיות, ניקוד-גרירה, הברות, אולפן, וכפתור «ערוך» ב-letter-match.

### סימן שסיימתם

`npm run build` עובר, `npm run check` ירוק, כל ה-e2e ירוק, העורך עדיין נפתח במשחקים עם `editor:`.

---

## צעד 3 — העורך עצל

**ענף:** `chore/lazy-editor`
**סיכון:** בינוני.

### הצמדה האמית

`bootstrap.ts` כרגע מייבא את `../editor/editor-storage.js`, `../editor/game-data.js`, `../editor/game-editor.js` גם כש-`opts.editor` חסר. יותר מכך: `loadGameData(opts.gameId)` רץ **תמיד** (שורה 88), לא רק בעריכה. בגלל הכניסה היחידה של Vite, כל משחק משלם את העורך ואת zod.

### מה לעשות

- `bootstrapGame` עושה `await import('../editor/...')` **רק אם** `opts.editor` קיים. בלי עורך — אין `loadGameData`, `defaultRounds` הם הסיבובים.
- Vite מפצל chunk (`alefbet-editor-*.js`). לעדכן `sw.js` שיקבל את `alefbet.js` הראשי בהתקנה; ה-chunk ייכנס למטמון ב-stale-while-revalidate אחרי שימוש ראשון. לא להוסיף אותו ל-`CORE_ASSETS` אם השם מחוחש.
- `index.ts` הישן עדיין מייצא את העורך (תאימות לאחור). ה-runtime entry לא.

סיילבל-ריד / ניקוד-ספיק / אולפן **לא** אמורים להוריד את העורך.

### מדידה (פעם אחת בענף הזה)

גודל `alefbet.js` לפני/אחרי, וזמן עד כרטיס ראשון במובייל. רושמים מספרים ב-PR.

### סימן שסיימתם

ב-Network tab של משחק בלי עורך אין `alefbet-editor`.

---

## צעד 4 — `runGame`, משחק אחד בכל PR

**סיכון:** בינוני–גבוה. פה מקצרים באמת.

`runGame` **עוטף** את `createRoundManager`, לא מחליף ביום אחד. אל תמחקו את `createRoundManager` עד שאין קוראים. תאריך המחיקה («אחרי ש-5 המשחקים על `runGame`», או פחות מהמשחקים העגולים) כתוב ב-PR הראשון של `runGame`, לא בראש של מישהו.

### סדר המעבר (קרוב למנהל הסיבובים הקיים)

| PR | ענף | משחק | למה |
|---|---|---|---|
| 4a | `feat/rungame-syllable-read` | syllable-read | כבר על `createRoundManager` — מוכיח את ה-API |
| 4b | `feat/rungame-letter-match` | letter-match-animals | מחליף לולאה ידנית + `showCompletionScreen` |
| 4c | `feat/rungame-nikud-match` | nikud-match | גרירה — בודק שה-API לא מקובע לכרטיסים |
| 4d | החלטה | nikud-speak / sound-studio | רק אם הם באמת «משחק סיבובים». האולפן כנראה **נשאר מחוץ** |

עדכון התבנית `games/_template` **רק אחרי ששניים עברו בהצלחה** (4a+4b).

כל PR: ה-spec הקיים של המשחק הזה חייב לעבור באותו PR. אל תוסיפו spec חדש במקום לתקן את הישן.

### צורת `runGame` (נקבע ב-4a, לא לפניו)

עוטף את `bootstrapGame` + `createRoundManager` + באנר/שחרור שמע. המשחק מספק `buildRound({ shell, round, index, onCorrect, onWrong })`. בלי DOM קשוח של «כרטיס» ב-API — 4c יישבר את זה.

---

## צעד 5 — Vite לאתר / ביטול dist-בגיט

**ענף:** `chore/vite-app` — **אחרון בכוונה.**
**סיכון:** גבוה. רק כשה-API קפוא (אחרי 4).

אז מחליפים «HTML סטטי + dist מחויב» ב-Vite multi-page. deploy בונה במקום לבדוק `git diff dist`. `start.js` נשאר כעטיפה שמגישה את `dist/` של האתר, כדי שלחיצה כפולה על `start.bat` תמשיך לעבוד.

נגע ב-`sw.js` רק כאן, בענף נפרד, אחרי שה-Vite יציב.

**אפשר לדחות את הצעד הזה לעד.** אם אחרי שלב 3 הגודל כבר בסדר ומשחק חדש נכתב מהר עם עזרי שלב 1 — לא חובה להגיע ל-Vite. התשתית «פשוטה למשחקים כאלה» נמדדת בזמן עד משחק חדש שעובד אופליין, לא באחוז ארכיטקטורה טהורה.

---

## צעד 6 — ניקוי, אחרי 5

- מחיקת פורמט UMD (`alefbet.umd.cjs`). אף משחק לא טוען אותו.
- `createAppShell` יוצא מה-runtime (אין קוראים).
- README / CLAUDE.md מיושרים ל-Node 20 (אם עדיין לא תוקן בצעד 0).
- מחיקת `index.ts` הישן רק אחרי שאין משחק על החוזה הישן.

---

## חוקים שמונעים בלגן

1. **ענפים קצרים.** ימים, לא שבועות. `main` תמיד ניתן לפריסה.
2. **אין «עוד פיצ'ר על הדרך».** פאזל, מעקב תלמיד, ייצוא ZIP — אחרי שלב 4, משימה נפרדת מ-BACKLOG.
3. **תאימות לאחור מפורשת.** כל עוד שיש משחק על החוזה הישן, `index.ts` הישן נשאר.
4. **e2e הוא שער.** לכל משחק שנוגעים בו — ה-spec הקיים עובר באותו PR.
5. **מסך אחד של אמת לילד.** אחרי כל merge ל-`main`: טלפון אמיתי, בלי רשת, משחק אחד מקצה לקצה כולל שמע.
6. **לא מערבבים JS→TS.** בזמן המעבר לא ממירים קבצי runtime ל-TS «כי כבר פתוח». PR נפרד שלעולם לא חייבים.
7. **משחק חדש באמצע המעבר** נכתב על החוזה **החדש** אם הוא קיים, אחרת על הישן.

---

## סימנים שאתם בדרך הלא נכונה

- משחק חדש מתווסף על החוזה הישן באמצע המעבר (אחרי ש-4a כבר על `main`)
- PR אחד נוגע ב-`sw.js` + `vite.config` + שלושה `game.js`
- העורך נשבר ואתם מתקנים אותו בתוך PR של `runGame`

במקרה כזה: עוצרים, ממזגים מה שכבר ירוק, חותכים את השאר לענף חדש.

---

## מה לא למזג

ענפים קיימים שמייצגים ריפקטור גדול או אפליקציה אחרת. לא למזג אל `main`:

- `claude/optimize-repo-structure-KSBWZ` — פיצול `apps/`, ביג-בנג
- `claude/improve-repo-maintainability-t2RPb` — אותו כיוון
- `claude/document-framework-alternatives-PKtQL` — `plan.md` + `creator/` מהדור הקודם, לא המצב החי
- `claude/passover-*`, `claude/sonos-baby-monitor-*` — לא קשור לאלף-בית

---

## תיקוני תיעוד נלווים (אפשר לצרף לצעד 0)

- `CLAUDE.md` מזכיר `audio/speech-recognition` — **הקובץ לא קיים**. המודולים החיים: `hebrew-audio`, `phoneme-synth`, `audio-context`, `vowel-detector`.
- `BACKLOG.md` «שיפורי תשתית» עדיין רושם את PWA ו-e2e כ-TODO; הם ב-`main` מיולי 2026-07.
- `BACKLOG.md` מצביע `audio/speech-recognition.js` כבסיס ל-«דבר או הקלד».
- כרטיס הבית של אותיות: «אותיות אַגאח» אחרי שהמשחק עבר ל-22 אותיות.

---

## מתי לעצור ולאחד כיוון

אם אחרי שלב 3 הגודל כבר בסדר והמשחקים הבאים נכתבים מהר עם העזרים של שלב 1 — אפשר לדחות את `runGame`. לא חובה להגיע ל-Vite.

אם רוצים להתחיל עכשיו — הצעד הראשון לבד (קטלוג + העזרים המשותפים) הוא הבטוח ביותר, ואפשר לעשות אותו בריפו בלי לשנות התנהגות למשתמש.
