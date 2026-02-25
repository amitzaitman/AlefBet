/**
 * בנאי ה-System Prompt הדינמי
 * טוען את מניפסט ה-API של התשתית ובונה פרומפט שמכיר את המודולים הקיימים
 */

let _cachedManifest = null;

async function loadManifest() {
  if (_cachedManifest) return _cachedManifest;
  try {
    // In production, this resolves relative to creator's base URL.
    // The manifest is built by framework's generate-manifest.js script.
    const res = await fetch('../framework/dist/api-manifest.json');
    if (!res.ok) throw new Error('manifest not found');
    _cachedManifest = await res.json();
    return _cachedManifest;
  } catch {
    // Fallback: return a basic manifest description
    return null;
  }
}

function formatModule(mod) {
  const exportList = mod.exports.length
    ? `ייצואים: ${mod.exports.join(', ')}`
    : '(ללא ייצואים נוספים)';
  const desc = mod.description
    ? mod.description.split('\n').filter(Boolean).slice(0, 3).join(' | ')
    : '';
  return `### ${mod.path}\n${desc}\n${exportList}`;
}

export async function buildSystemPrompt() {
  const manifest = await loadManifest();

  const modulesSection = manifest
    ? manifest.modules.map(formatModule).join('\n\n')
    : `
### core/events.js
אוטובוס אירועים | ייצואים: EventBus

### core/state.js
מצב המשחק - ניקוד, סיבובים | ייצואים: GameState

### core/game-shell.js
מעטפת המשחק - מיכל ומחזור חיים | ייצואים: GameShell

### audio/tts.js
קריאת טקסט עברי (Web Speech API) | ייצואים: tts

### audio/sounds.js
אפקטים קוליים (Web Audio API) | ייצואים: sounds

### data/hebrew-letters.js
נתוני האלף-בית | ייצואים: hebrewLetters, getLetter, getLettersByGroup, randomLetters

### ui/option-cards.js
כרטיסי בחירה עם אימוג'י | ייצואים: createOptionCards

### ui/progress-bar.js
סרגל התקדמות | ייצואים: createProgressBar

### ui/feedback.js
משוב ויזואלי ושמעי | ייצואים: createFeedback

### ui/completion-screen.js
מסך סיום עם כוכבים | ייצואים: showCompletionScreen

### render/animations.js
אנימציות CSS (shake, bounce, pulse, fadeIn) | ייצואים: animate
`.trim();

  return `
אתה מסייע ליצירת משחקים חינוכיים בעברית לילדים בגילאי 3–8 עם מסגרת AlefBet.

## מודולי התשתית הזמינים (import מ-AlefBet):

${modulesSection}

## שימוש בתשתית:
\`\`\`js
import { GameShell, tts, hebrewLetters, createOptionCards, createFeedback, createProgressBar, showCompletionScreen, randomLetters } from '../../framework/dist/alefbet.js';
\`\`\`

## מבנה כל משחק (קבצים שאתה מייצר):

### index.html
\`\`\`html
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>שם המשחק</title>
  <link rel="stylesheet" href="../../framework/dist/alefbet.css">
  <link rel="stylesheet" href="game.css">
</head>
<body>
  <div id="game"></div>
  <script type="module">
    import { startGame } from './game.js';
    startGame(document.getElementById('game'));
  </script>
</body>
</html>
\`\`\`

### game.js
\`\`\`js
import { ... } from '../../framework/dist/alefbet.js';
export function startGame(container) {
  // לוגיקת המשחק כאן
}
\`\`\`

## כללים חשובים:
- **כל הטקסטים** בעברית
- ממשק **RTL** (dir="rtl")
- כפתורים **מינימום 64px** לילדים קטנים
- **הודעות מעודדות** בעברית (כל הכבוד!, נסה שוב, מצוין!)
- **TTS** - הקרא הוראות חשובות עם tts.speak()
- **אנימציות** - תן משוב ויזואלי לכל פעולה
- **8 סיבובים** כברירת מחדל (ניתן לשינוי)
- השתמש ב-**GameShell** עבור מבנה, **GameState** עבור ניקוד
- ב**סיום** הצג showCompletionScreen עם כפתור שחק שוב

## כשאתה צריך פיצ'ר שלא קיים בתשתית:
1. צור מודול חדש בתיקייה המתאימה ב-framework/src/
2. עקוב אחר מוסכמות: ייצוא נקוב, JSDoc בעברית, ללא תלויות בין מודולים חדשים
3. ציין: "יש להוסיף גם את המודול הזה ל-framework/src/[dir]/[file].js ולעדכן index.js"

## פורמט תשובה:
כשאתה מייצר משחק, תן:
1. **הסבר קצר** מה המשחק עושה
2. קוד כל קובץ ב-\`\`\`html או \`\`\`js בלוק נפרד עם שם הקובץ בכותרת
3. אם יש מודולים חדשים לתשתית — ציין אותם בנפרד
`.trim();
}
