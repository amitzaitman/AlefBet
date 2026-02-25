/**
 * נתוני האלף-בית העברי
 * כולל את כל 22 האותיות + 5 צורות סופיות עם מטא-דאטה מלאה
 */
export const hebrewLetters = [
  { letter: 'א', name: 'אלף',       nameNikud: 'אָלֶף',          sound: '',   exampleWord: 'אריה',  emoji: '🦁',  isFinal: false },
  { letter: 'ב', name: 'בית',       nameNikud: 'בֵּית',           sound: 'b',  exampleWord: 'בית',   emoji: '🏠',  isFinal: false },
  { letter: 'ג', name: 'גימל',      nameNikud: 'גִּימֶל',          sound: 'g',  exampleWord: 'גמל',   emoji: '🐪',  isFinal: false },
  { letter: 'ד', name: 'דלת',       nameNikud: 'דָּלֶת',           sound: 'd',  exampleWord: 'דג',    emoji: '🐟',  isFinal: false },
  { letter: 'ה', name: 'הא',        nameNikud: 'הֵא',             sound: 'h',  exampleWord: 'הר',    emoji: '⛰️', isFinal: false },
  { letter: 'ו', name: 'וו',        nameNikud: 'וָו',             sound: 'v',  exampleWord: 'ורד',   emoji: '🌹',  isFinal: false },
  { letter: 'ז', name: 'זין',       nameNikud: 'זַיִן',            sound: 'z',  exampleWord: 'זאב',   emoji: '🐺',  isFinal: false },
  { letter: 'ח', name: 'חית',       nameNikud: 'חֵית',            sound: 'ch', exampleWord: 'חתול',  emoji: '🐱',  isFinal: false },
  { letter: 'ט', name: 'טית',       nameNikud: 'טֵית',            sound: 't',  exampleWord: 'טלה',   emoji: '🐑',  isFinal: false },
  { letter: 'י', name: 'יוד',       nameNikud: 'יוֹד',            sound: 'y',  exampleWord: 'יונה',  emoji: '🕊️', isFinal: false },
  { letter: 'כ', name: 'כף',        nameNikud: 'כַּף',             sound: 'k',  exampleWord: 'כלב',   emoji: '🐕',  isFinal: false },
  { letter: 'ך', name: 'כף סופית',  nameNikud: 'כַּף סוֹפִית',     sound: 'k',  exampleWord: 'מלך',   emoji: '👑',  isFinal: true  },
  { letter: 'ל', name: 'למד',       nameNikud: 'לָמֶד',           sound: 'l',  exampleWord: 'לב',    emoji: '❤️', isFinal: false },
  { letter: 'מ', name: 'מם',        nameNikud: 'מֵם',             sound: 'm',  exampleWord: 'מים',   emoji: '💧',  isFinal: false },
  { letter: 'ם', name: 'מם סופית',  nameNikud: 'מֵם סוֹפִית',      sound: 'm',  exampleWord: 'שמים',  emoji: '🌤️', isFinal: true  },
  { letter: 'נ', name: 'נון',       nameNikud: 'נוּן',            sound: 'n',  exampleWord: 'נחש',   emoji: '🐍',  isFinal: false },
  { letter: 'ן', name: 'נון סופית', nameNikud: 'נוּן סוֹפִית',     sound: 'n',  exampleWord: 'גן',    emoji: '🌳',  isFinal: true  },
  { letter: 'ס', name: 'סמך',       nameNikud: 'סָמֶךְ',           sound: 's',  exampleWord: 'סוס',   emoji: '🐎',  isFinal: false },
  { letter: 'ע', name: 'עין',       nameNikud: 'עַיִן',            sound: '',   exampleWord: 'עיט',   emoji: '🦅',  isFinal: false },
  { letter: 'פ', name: 'פא',        nameNikud: 'פֵּא',             sound: 'p',  exampleWord: 'פיל',   emoji: '🐘',  isFinal: false },
  { letter: 'ף', name: 'פא סופית',  nameNikud: 'פֵּא סוֹפִית',     sound: 'p',  exampleWord: 'אף',    emoji: '👃',  isFinal: true  },
  { letter: 'צ', name: 'צדי',       nameNikud: 'צַדִּי',           sound: 'ts', exampleWord: 'צב',    emoji: '🐢',  isFinal: false },
  { letter: 'ץ', name: 'צדי סופית', nameNikud: 'צַדִּי סוֹפִית',   sound: 'ts', exampleWord: 'עץ',    emoji: '🌲',  isFinal: true  },
  { letter: 'ק', name: 'קוף',       nameNikud: 'קוֹף',            sound: 'k',  exampleWord: 'קוף',   emoji: '🐒',  isFinal: false },
  { letter: 'ר', name: 'ריש',       nameNikud: 'רֵישׁ',           sound: 'r',  exampleWord: 'רכב',   emoji: '🚗',  isFinal: false },
  { letter: 'ש', name: 'שין',       nameNikud: 'שִׁין',           sound: 'sh', exampleWord: 'שמש',   emoji: '☀️', isFinal: false },
  { letter: 'ת', name: 'תו',        nameNikud: 'תָּו',             sound: 't',  exampleWord: 'תפוח',  emoji: '🍎',  isFinal: false },
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
