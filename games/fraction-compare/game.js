import { fractionBar, fractionLabel, runFractionGame } from '../fraction-picture/game.js';

export function startGame(container) {
  return runFractionGame(container, {
    id: 'fraction-compare', title: 'מַשְׁוִים שְׁבָרִים',
    rounds: () => [
      { a: [1, 4], b: [3, 4] }, { a: [2, 3], b: [1, 3] },
      { a: [1, 2], b: [1, 4] }, { a: [1, 3], b: [1, 2] },
      { a: [1, 2], b: [2, 4] }, { a: [3, 4], b: [2, 3] },
    ],
    build: ({ a, b }) => ({
      prompt: 'אֵיפֹה הַשֶּׁבֶר הַגָּדוֹל יוֹתֵר?',
      hint: 'הַשְׁווּ אֶת הָאֹרֶךְ הַצָּבוּעַ. שְׁנֵי הַשְּׁלֵמִים בְּאוֹתוֹ גֹּדֶל.',
      options: [
        { id: 'top', text: 'הַשֶּׁבֶר הָעֶלְיוֹן' },
        { id: 'equal', text: 'הַשְּׁבָרִים שָׁוִים' },
        { id: 'bottom', text: 'הַשֶּׁבֶר הַתַּחְתּוֹן' },
      ],
      correct: a[0] * b[1] === b[0] * a[1] ? 'equal' : a[0] * b[1] > b[0] * a[1] ? 'top' : 'bottom',
      render(host) {
        for (const [n, d] of [a, b]) {
          const row = document.createElement('div');
          row.className = 'fraction-row';
          row.append(fractionLabel(n, d), fractionBar(n, d));
          host.append(row);
        }
      },
    }),
  });
}
