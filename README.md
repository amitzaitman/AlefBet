# AlefBet — משחקים לשיפור הקריאה בעברית

פלטפורמת משחקים ללימוד קריאה לילדים בגילאי 3–8: הכרת האותיות, התנועות
והניקוד — עם שמע עברי שעובד **גם ללא אינטרנט**, ופידבק בונה בלבד (בלי
"טעית!", עם רמזים מדורגים במקום).

**🌐 לשחק אונליין:** [amitzaitman.github.io/AlefBet](https://amitzaitman.github.io/AlefBet/)

---

## הפעלה מקומית

**Windows:** לחיצה כפולה על `start.bat` — השרת עולה והדפדפן נפתח לבד.

**מכל טרמינל:**

```bash
node start.js        # http://localhost:8080
node start.js 3000   # פורט אחר
```

> דרוש [Node.js](https://nodejs.org) גרסה 18 ומעלה. אין תלויות נוספות להרצה.

---

## המשחקים

| משחק | מה מתרגלים | איך |
|---|---|---|
| 🦁 **התאמת אותיות** (`letter-match-animals`) | זיהוי אותיות | מחברים כל אות לחיה שמתחילה בה |
| אָ **לימוד ניקוד** (`nikud-match`) | סימני הניקוד | גוררים את האות אל צורת הניקוד הנכונה |
| 🔊 **קריאת הברות** (`syllable-read`) | חיבור אות+תנועה | שומעים הברה ובוחרים את הכרטיס הנכון |
| 🎤 **אמור את הניקוד** (`nikud-speak`) | הגיית תנועות | אומרים את התנועה למיקרופון — זיהוי פורמנטים מקומי |
| 🎙️ **אולפן הצלילים** (`sound-studio`) | *כלי למורה/הורה* | מקליטים את האותיות, הניקוד וההברות לבנק צלילים מקומי |

עקרונות משותפים לכל המשחקים:

- **פידבק בונה בלבד** — טעות לא מסומנת באדום ולא משמיעה צליל שלילי.
  אחרי כמה ניסיונות מגיע רמז עדין (התשובה מהבהבת), ואז עזרה מוגברת
  (המסיחים מתעמעמים). ראו `core/hints.js`.
- **RTL מלא, ניקוד מלא, כפתורים גדולים** (64px+) לגיל הרך.
- **יציבות** — שום פעולת שמע לא חוסמת את המשחק; הבטחות שמע תמיד נפתרות.

---

## שמע עברי ללא רשת — איך זה עובד

בזמן משחק **לא יוצאת אף בקשת רשת**. כל השמעה עוברת שרשרת ספקים מקומיים
(`audio/hebrew-audio.js`):

1. **בנק הצלילים** — הקלטות אנושיות ב-IndexedDB במכשיר. ממלאים אותו
   באחת משתי דרכים באולפן הצלילים:
   - 🎤 הקלטה בקול שלכם (מורה/הורה) — הכי טוב פדגוגית.
   - ⬇️ **מילוי אוטומטי חד-פעמי** — הורדת קולות מחשב דרך ה-proxy של
     הפרויקט (חיבור רשת פעם אחת, ואז הכול מקומי לתמיד).
2. **קול מערכת** — Web Speech API מקומי (`audio/tts.js`), עם watchdog
   נגד קולות רשת תקועים והעדפת קול מותקן כשאין אינטרנט.
3. **סינתזת פונמות** — יצירת תנועות והברות ב-Web Audio
   (`audio/phoneme-synth.js`), ההיפוך של גלאי הפורמנטים. זמינה תמיד.

אם שום ספק לא הצליח — מוצג באנר ברור לילד; אין כשלים שקטים.

גם הניקוד האוטומטי (Dicta Nakdan, `utils/nakdan.js`) לא נדרש בזמן משחק:
טקסטים מנוקדים מראש מדלגים על הרשת לגמרי, ותוצאות שהושגו פעם אחת נשמרות
ב-localStorage. הגופנים (Rubik, Frank Ruhl Libre) ארוזים בריפו — אין תלות
ב-Google Fonts.

---

## פיתוח

```bash
npm install          # התקנה ראשונית (כל ה-workspaces)
npm run check        # lint + typecheck + vitest — חייב לעבור לפני push
npm run build        # בניית framework/dist/ (מחויב לריפו בכוונה)
npx playwright test  # בדיקות e2e (בסביבה מנוהלת: PW_CHROMIUM_PATH=/opt/pw-browsers/chromium)
```

**הכלל החשוב:** מגדילים את התשתית, לא מקודדים במשחקים. פונקציונליות
חדשה נכנסת ל-`framework/src/` כמודול named-export, מיוצאת מ-`index.ts`,
ומקבלת בדיקה ב-`__tests__/`. אחרי שינוי בתשתית — `npm run build`,
אחרת המשחקים לא יראו אותו.

### מבנה הפרויקט

```
framework/src/
  core/      GameShell, GameState, round-manager, hints, bootstrap
  audio/     hebrew-audio (שרשרת ההשמעה), tts, phoneme-synth,
             sound-bank-compiler, audio-context (שחרור iOS),
             voice-recorder, voice-store, vowel-detector, sounds
  data/      hebrew-letters, nikud
  ui/        option-cards, progress-bar, feedback, zones, nikud-box,
             audio-status-banner, completion-screen, ...
  utils/     nakdan (ניקוד אוטומטי, עם מטמון מתמיד)
  editor/    עורך משחקים בדפדפן (TypeScript + zod)
  styles/    alefbet.css + גופנים מקומיים
framework/dist/   תוצר בנוי ומחויב — המשחקים טוענים ממנו ישירות
games/<name>/     index.html + game.js + game.css למשחק
e2e/              בדיקות Playwright
deploy/           Cloudflare Worker: proxy לנקדן + מסלול /tts לקימפול
```

### משחק חדש

1. מעתיקים את `games/_template/` לתיקייה חדשה.
2. עורכים את `game.js` — מייבאים מ-`../../framework/dist/alefbet.js`.
3. מוסיפים כרטיס בדף הבית `index.html`.

---

## פריסה

דחיפה ל-`main` מפרסמת אוטומטית ל-GitHub Pages
(`.github/workflows/deploy.yml`).

**Proxy (חד-פעמי, אופציונלי):** ה-worker שב-`deploy/cloudflare-nakdan-proxy/`
משרת שני מסלולים עם CORS — ניקוד אוטומטי (Dicta) ומסלול `/tts` למילוי
האוטומטי של בנק הצלילים. פריסה עם `wrangler deploy`; חיבור דרך
`?nakdanProxy=...` או `localStorage`. פרטים ב-README של התיקייה.

---

## רישיון

MIT
