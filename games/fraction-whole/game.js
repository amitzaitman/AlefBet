import { fraction, fractionBar, fractionLabel, practiceRounds, runFractionGame } from '../fraction-picture/game.js';

export function startGame(container) {
  return runFractionGame(container, {
    id: 'fraction-whole', title: 'מַשְׁלִימִים לְשָׁלֵם', rounds: practiceRounds,
    build: ({ n, d }) => ({
      prompt: 'אֵיזֶה שֶׁבֶר חָסֵר לְשָׁלֵם?',
      hint: `סִפְרוּ אֶת הַחֲלָקִים הָרֵיקִים: ${d - n} מִתּוֹךְ ${d}.`,
      options: Array.from({ length: d + 1 }, (_, i) => ({ id: fraction(i, d), text: fraction(i, d) })),
      correct: fraction(d - n, d),
      render(host) {
        const equation = document.createElement('p');
        equation.className = 'fraction-equation';
        equation.dir = 'ltr';
        equation.append(fractionLabel(n, d), ' + ? = 1');
        host.append(equation, fractionBar(n, d));
      },
    }),
  });
}
