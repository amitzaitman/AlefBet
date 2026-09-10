/**
 * מקור האמת לרשימת המשחקים.
 *
 * נטען גם מ-sw.js (importScripts, classic worker) וגם מדף הבית (script רגיל).
 * אין ESM כאן - ה-service worker אינו מודול, ואין צעד בנייה.
 *
 * משחק חדש = תיקייה מ-games/_template + שורה במערך הזה. בלי לגעת ב-index.html או ב-sw.js.
 */
(function (root) {
  'use strict';

  root.ALEFBET_CATEGORIES = [
    { id: 'reading', title: 'קְרִיאָה וְשָׂפָה', icon: '📖', desc: 'אוֹתִיּוֹת, נִיקּוּד וַהֲבָרוֹת' },
    { id: 'math', title: 'חֶשְׁבּוֹן', icon: '🔢', desc: 'מִסְפָּרִים, פְּעֻלּוֹת וּשְׁבָרִים' },
    { id: 'other', title: 'עוֹד מִשְׂחָקִים', icon: '🎲', desc: 'מְגַלִּים וְלוֹמְדִים בְּמִשְׂחָק' },
  ];

  root.ALEFBET_CATALOG = [
    {
      "id": "make-ten",
      "title": "מַשְׁלִימִים לְעֶשֶׂר",
      "desc": "סופרים משבצות ובוחרים כמה חסר עד עשר",
      "kind": "game",
      "category": "math",
      "topic": "מִסְפָּרִים וּפְעֻלּוֹת",
      "icon": "🔟",
      "play": "שחקו עכשיו ▶"
},
    {
      "id": "number-line",
      "title": "קְפִיצוֹת עַל צִיר הַמִּסְפָּרִים",
      "desc": "זזים על הציר ומתרגלים חיבור וחיסור עד 10",
      "kind": "game",
      "category": "math",
      "topic": "מִסְפָּרִים וּפְעֻלּוֹת",
      "icon": "🐸",
      "play": "שחקו עכשיו ▶"
},
    {
      "id": "fraction-picture",
      "title": "מְזַהִים שְׁבָרִים",
      "desc": "בַּחֲרוּ אֶת הַשֶּׁבֶר שֶׁמַּתְאִים לַצִּיּוּר",
      "kind": "game",
      "category": "math",
      "topic": "שְׁבָרִים",
      "icon": "🟩",
      "play": "שחקו עכשיו ▶"
    },
    {
      "id": "fraction-whole",
      "title": "מַשְׁלִימִים לְשָׁלֵם",
      "desc": "גַּלּוּ אֵיזֶה שֶׁבֶר חָסֵר לְשָׁלֵם",
      "kind": "game",
      "category": "math",
      "topic": "שְׁבָרִים",
      "icon": "🧩",
      "play": "שחקו עכשיו ▶"
    },
    {
      "id": "fraction-compare",
      "title": "מַשְׁוִים שְׁבָרִים",
      "desc": "הַשְׁווּ חֲצָאִים, שְׁלִישִׁים וּרְבָעִים",
      "kind": "game",
      "category": "math",
      "topic": "שְׁבָרִים",
      "icon": "⚖️",
      "play": "שחקו עכשיו ▶"
    },
    {
      id: 'letter-match-animals',
      title: 'הַתְאָמַת אוֹתִיּוֹת',
      desc: 'בַּחֲרוּ מִלָּה שֶׁמַּתְחִילָה בָּאוֹת — 8 סִיבוּבִים מִתּוֹךְ 22 אוֹתִיּוֹת',
      kind: 'game',
      category: 'reading',
      icon: 'letters',
      play: 'שַׂחֵק עַכְשָׁיו ▶',
    },
    {
      id: 'nikud-match',
      title: 'לִימּוּד נִיקּוּד',
      desc: 'גִּרְרוּ אֶת הָאוֹת לַנִּיקּוּד הַמַּתְאִים, אוֹ בַּחֲרוּ בִּלְחִיצָה',
      kind: 'game',
      category: 'reading',
      icon: 'nikud',
      play: 'שַׂחֵק עַכְשָׁיו ▶',
    },
    {
      id: 'syllable-read',
      title: 'קְרִיאַת הֲבָרוֹת',
      desc: 'הַקְשִׁיבוּ לַהֲבָרָה וּבַחֲרוּ אֶת הָאוֹת וְהַנִּיקּוּד הַמַּתְאִימִים — עִם רְמָזִים מַדְרִיכִים',
      kind: 'game',
      category: 'reading',
      icon: 'syllables',
      play: 'שַׂחֵק עַכְשָׁיו ▶',
    },
    {
      id: 'nikud-speak',
      title: 'אֱמוֹר אֶת הַנִּיקּוּד',
      desc: 'הַקְשִׁיבוּ לְשֵׁם הַנִּיקּוּד וְאִמְרוּ אוֹתוֹ בְּקוֹל — תַּרְגִּילֵי הִגּוּי עִם זִיהוּי דִּיבּוּר',
      kind: 'game',
      category: 'reading',
      icon: 'speak',
      play: 'שַׂחֵק עַכְשָׁיו ▶',
    },
    {
      id: 'sound-studio',
      title: 'אֻלְפַּן הַצְּלִילִים (לַמּוֹרֶה)',
      desc: 'הַקְלִיטוּ אֶת הָאוֹתִיּוֹת, הַנִּיקּוּד וְהַהֲבָרוֹת בְּקוֹלְכֶם — הַמִּשְׂחָקִים יַשְׁמִיעוּ אוֹתָם גַּם לְלֹא אִינְטֶרְנֶט',
      kind: 'teacher-tool',
      icon: 'studio',
      play: 'פִּתְחוּ אֶת הָאֻלְפָּן ▶',
    },
  ];
})(typeof self !== 'undefined' ? self : globalThis);
