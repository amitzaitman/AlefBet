/**
 * תבנית למשחק סיבובים. הוסיפו את המשחק ל-games/catalog.js אחרי ההעתקה.
 * runGame הוא עזר אופציונלי; כלי או משחק עם זרימה אחרת יכול להשתמש ברכיבים ישירות.
 */
import { runGame, createChoiceRound, createFeedback, shuffle } from '../../framework/dist/runtime.js';

const ROUNDS = [
  { target: 'א', correct: 'אַרְיֵה', correctEmoji: '🦁', other: 'כֶּלֶב' },
  { target: 'ב', correct: 'בַּיִת', correctEmoji: '🏠', other: 'שֶׁמֶשׁ' },
];

export async function startGame(container) {
  return runGame(container, {
    gameId: 'template-game',
    title: 'שֵׁם הַמִּשְׂחָק',
    preloadTexts: [],
    defaultRounds: ROUNDS,
    playCorrectSound: false,
    onReplay: () => startGame(container),
    buildRound: context => {
      const { shell, round, scope } = context;
      const target = document.createElement('p');
      target.className = 'letter-display';
      target.textContent = round.target;
      shell.bodyEl.appendChild(target);
      const options = document.createElement('div');
      shell.bodyEl.appendChild(options);
      const feedback = scope.use(createFeedback(shell.bodyEl));
      createChoiceRound(context, options, {
        options: shuffle([
          { id: 'correct', text: round.correct, emoji: round.correctEmoji },
          { id: 'other', text: round.other, emoji: '' },
        ]),
        isCorrect: option => option.id === 'correct',
        onCorrect: () => feedback.correct(),
        onWrong: () => feedback.hint('נַסּוּ שׁוּב'),
      });
    },
  });
}
