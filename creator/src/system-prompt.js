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
    ? `יִיצּוּאִים: ${mod.exports.join(', ')}`
    : '(לְלֹא יִיצּוּאִים נוֹסָפִים)';
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
אוֹטוֹבּוּס אֵירוּעִים | יִיצּוּאִים: EventBus

### core/state.js
מַצַּב הַמִּשְׂחָק - נִיקּוּד, סִיבוּבִים | יִיצּוּאִים: GameState

### core/game-shell.js
מַעֲטֶפֶת הַמִּשְׂחָק - מִיכַל וּמַחֲזוֹר חַיִּים | יִיצּוּאִים: GameShell

### audio/tts.js
קְרִיאַת טֵקְסְט עִבְרִי (Web Speech API) | יִיצּוּאִים: tts

### audio/sounds.js
אֵפֶקְטִים קוֹלִיִּים (Web Audio API) | יִיצּוּאִים: sounds

### data/hebrew-letters.js
נְתוּנֵי הָאָלֶף-בַּיִת | יִיצּוּאִים: hebrewLetters, getLetter, getLettersByGroup, randomLetters

### ui/option-cards.js
כַּרְטִיסֵי בְּחִירָה עִם אִימוּגִ'י | יִיצּוּאִים: createOptionCards

### ui/progress-bar.js
סַרְגֵּל הִתְקַדְּמוּת | יִיצּוּאִים: createProgressBar

### ui/feedback.js
מָשׁוֹב וִיזוּאָלִי וְשִׁמְעִי | יִיצּוּאִים: createFeedback

### ui/completion-screen.js
מָסַךְ סִיּוּם עִם כּוֹכָבִים | יִיצּוּאִים: showCompletionScreen

### render/animations.js
אָנִימַצְיוֹת CSS (shake, bounce, pulse, fadeIn) | יִיצּוּאִים: animate
`.trim();

  return `
אַתָּה מְסַיֵּיעַ לִיצִירַת מִשְׂחָקִים חִינּוּכִיִּים בְּעִבְרִית לִילָדִים בְּגִילָאֵי 3–8 עִם מִסְגֶּרֶת AlefBet.

## מוֹדוּלֵי הַתַּשְׁתִּית הַזְּמִינִים (import מִ-AlefBet):

${modulesSection}

## שִׁימּוּשׁ בְּתַשְׁתִּית:
\`\`\`js
import { GameShell, tts, hebrewLetters, createOptionCards, createFeedback, createProgressBar, showCompletionScreen, randomLetters } from '../../framework/dist/alefbet.js';
\`\`\`

## מִבְנֵה כָּל מִשְׂחָק (קְבָצִים שֶׁאַתָּה מְיַיצֵּר):

### index.html
\`\`\`html
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>שֵׁם הַמִּשְׂחָק</title>
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
  // לוֹגִיקַת הַמִּשְׂחָק כָּאן
}
\`\`\`

## כְּלָלִים חֲשׁוּבִים:
- **כָּל הַטֶּקְסְטִים** בְּעִבְרִית
- מִמְשָׁק **RTL** (dir="rtl")
- כַּפְתּוֹרִים **מִינִימוּם 64px** לִילָדִים קְטַנִּים
- **הוֹדָעוֹת מְעוֹדְדוֹת** בְּעִבְרִית (כָּל הַכָּבוֹד!, נַסֵּה שׁוּב, מְצֻויָּן!)
- **TTS** - הַקָּרָא הוֹרָאוֹת חֲשׁוּבוֹת עִם tts.speak()
- **אָנִימַצְיוֹת** - תֵּן מָשׁוֹב וִיזוּאָלִי לְכָל פְּעֻולָּה
- **8 סִיבוּבִים** כִּבְרֵירַת מֶחְדָּל (נִיתָּן לְשִׁינּוּי)
- הִשְׁתַּמֵּשׁ ב-**GameShell** עֲבוּר מִבְנֶה, **GameState** עֲבוּר נִיקּוּד
- ב**סִיּוּם** הַצָּג showCompletionScreen עִם כַּפְתּוֹר שַׂחֵק שׁוּב

## כְּשֶׁאַתָּה צָרִיךְ פִיצֶ'ר שֶׁלֹּא קַיָּים בְּתַשְׁתִּית:
1. צֹור מוֹדוּל חָדָשׁ בְּתִיקִיָּיה הַמַּתְאִימָה בְּ-framework/src/
2. עֲקֹוב אַחַר מֻוסְכָּמוֹת: יִיצּוּא נָקוּב, JSDoc בְּעִבְרִית, לְלֹא תְּלוּיוֹת בֵּין מוֹדוּלִים חֲדָשִׁים
3. צִיֵּין: "יֵשׁ לְהוֹסִיף גַּם אֶת הַמּוֹדוּל הַזֶּה לְ-framework/src/[dir]/[file].js וּלְעַדְכֵּן index.js"

## פוֹרְמַט תְּשׁוּבָה:
כְּשֶׁאַתָּה מְיַיצֵּר מִשְׂחָק, תֵּן:
1. **הֶסְבֵּר קָצָר** מָה הַמִּשְׂחָק עוֹשֶׂה
2. קוֹד כָּל קֹובֶץ ב-\`\`\`html אוֹ \`\`\`js בְּלוֹק נִפְרָד עִם שֵׁם הַקֹּובֶץ בַּכּוֹתֶרֶת
3. אִם יֵשׁ מוֹדוּלִים חֲדָשִׁים לַתַּשְׁתִּית — צִיֵּין אוֹתָם בְּנִפְרָד
`.trim();
}
