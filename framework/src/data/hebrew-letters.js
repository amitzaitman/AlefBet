/**
 * נתוני האלף-בית העברי
 * כולל את כל 22 האותיות + 5 צורות סופיות עם מטא-דאטה מלאה
 */
export const hebrewLetters = [
  { letter: 'א', name: 'אֶלֶף',       nameNikud: 'אָלֶף',          sound: '',   exampleWord: 'אַרְיֵה',  emoji: '🦁',  isFinal: false },
  { letter: 'ב', name: 'בַּיִת',       nameNikud: 'בֵּית',           sound: 'b',  exampleWord: 'בַּיִת',   emoji: '🏠',  isFinal: false },
  { letter: 'ג', name: 'גִּימֶל',      nameNikud: 'גִּימֶל',          sound: 'g',  exampleWord: 'גָּמָל',   emoji: '🐪',  isFinal: false },
  { letter: 'ד', name: 'דֶּלֶת',       nameNikud: 'דָּלֶת',           sound: 'd',  exampleWord: 'דָּג',    emoji: '🐟',  isFinal: false },
  { letter: 'ה', name: 'הָא',        nameNikud: 'הֵא',             sound: 'h',  exampleWord: 'הַר',    emoji: '⛰️', isFinal: false },
  { letter: 'ו', name: 'ווּ',        nameNikud: 'וָו',             sound: 'v',  exampleWord: 'וֶרֶד',   emoji: '🌹',  isFinal: false },
  { letter: 'ז', name: 'זַיִן',       nameNikud: 'זַיִן',            sound: 'z',  exampleWord: 'זְאֵב',   emoji: '🐺',  isFinal: false },
  { letter: 'ח', name: 'חֵית',       nameNikud: 'חֵית',            sound: 'ch', exampleWord: 'חָתוּל',  emoji: '🐱',  isFinal: false },
  { letter: 'ט', name: 'טֵית',       nameNikud: 'טֵית',            sound: 't',  exampleWord: 'טָלֶה',   emoji: '🐑',  isFinal: false },
  { letter: 'י', name: 'יוֹד',       nameNikud: 'יוֹד',            sound: 'y',  exampleWord: 'יוֹנָה',  emoji: '🕊️', isFinal: false },
  { letter: 'כ', name: 'כַּף',        nameNikud: 'כַּף',             sound: 'k',  exampleWord: 'כֶּלֶב',   emoji: '🐕',  isFinal: false },
  { letter: 'ךְ', name: 'כָּף סוֹפִית',  nameNikud: 'כָּף סוֹפִית',     sound: 'k',  exampleWord: 'מֶלֶךְ',   emoji: '👑',  isFinal: true  },
  { letter: 'ל', name: 'לָמַד',       nameNikud: 'לָמֵד',           sound: 'l',  exampleWord: 'לֵב',    emoji: '❤️', isFinal: false },
  { letter: 'מ', name: 'מֵם',        nameNikud: 'מֵם',             sound: 'm',  exampleWord: 'מַיִם',   emoji: '💧',  isFinal: false },
  { letter: 'םִ', name: 'מֵם סוֹפִית',  nameNikud: 'מֵם סוֹפִית',      sound: 'm',  exampleWord: 'שָׂמִים',  emoji: '🌤️', isFinal: true  },
  { letter: 'נ', name: 'נוּן',       nameNikud: 'נוּן',            sound: 'n',  exampleWord: 'נָחָשׁ',   emoji: '🐍',  isFinal: false },
  { letter: 'ן', name: 'נוּן סוֹפִית', nameNikud: 'נוּן סוֹפִית',     sound: 'n',  exampleWord: 'גַּן',    emoji: '🌳',  isFinal: true  },
  { letter: 'ס', name: 'סֶמֶךְ',       nameNikud: 'סָמֶךְ',           sound: 's',  exampleWord: 'סוּס',   emoji: '🐎',  isFinal: false },
  { letter: 'ע', name: 'עַיִן',       nameNikud: 'עַיִן',            sound: '',   exampleWord: 'עַיִט',   emoji: '🦅',  isFinal: false },
  { letter: 'פ', name: 'פא',        nameNikud: 'פֵּא',             sound: 'p',  exampleWord: 'פִּיל',   emoji: '🐘',  isFinal: false },
  { letter: 'ף', name: 'פא סוֹפִית',  nameNikud: 'פֵּא סוֹפִית',     sound: 'p',  exampleWord: 'אַף',    emoji: '👃',  isFinal: true  },
  { letter: 'צ', name: 'צִדֵּי',       nameNikud: 'צַדִּי',           sound: 'ts', exampleWord: 'צָב',    emoji: '🐢',  isFinal: false },
  { letter: 'ץ', name: 'צִדֵּי סוֹפִית', nameNikud: 'צַדִּי סוֹפִית',   sound: 'ts', exampleWord: 'עֵץ',    emoji: '🌲',  isFinal: true  },
  { letter: 'ק', name: 'קוֹף',       nameNikud: 'קוֹף',            sound: 'k',  exampleWord: 'קוֹף',   emoji: '🐒',  isFinal: false },
  { letter: 'ר', name: 'רֵישׁ',       nameNikud: 'רֵישׁ',           sound: 'r',  exampleWord: 'רֶכֶב',   emoji: '🚗',  isFinal: false },
  { letter: 'ש', name: 'שִׁין',       nameNikud: 'שִׁין',           sound: 'sh', exampleWord: 'שֶׁמֶשׁ',   emoji: '☀️', isFinal: false },
  { letter: 'ת', name: 'תָּו',        nameNikud: 'תָּו',             sound: 't',  exampleWord: 'תַּפּוּחַ',  emoji: '🍎',  isFinal: false },
];

/** מצא אות לפי תו */
export function getLetter(char) {
  return hebrewLetters.find(l => l.letter === char) || null;
}

/** קבל אותיות לפי קבוצה: 'regular' | 'final' | 'all' */
export function getLettersByGroup(group = 'regular') {
  if (group === 'regular') return hebrewLetters.filter(l => !l.isFinal);
  if (group === 'final')   return hebrewLetters.filter(l => l.isFinal);
  return hebrewLetters;
}

/** בחר count אותיות אקראיות מהאלף-בית */
export function randomLetters(count, groupFilter = 'regular') {
  const pool = getLettersByGroup(groupFilter);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, pool.length));
}
