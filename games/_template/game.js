/** תבנית כללית: התוכן והחוקים כאן; התשתית מנהלת סיבובים וניקוי. */
import { runGame, createChoiceRound, createFeedback, shuffle } from '../../framework/dist/common.js';

const ROUNDS = [
  { question: '1 + 1 = ?', answer: 2, choices: [1, 2, 3] },
  { question: '2 + 1 = ?', answer: 3, choices: [2, 3, 4] },
];

export async function startGame(container) {
  return runGame(container, {
    gameId: 'template-game',
    title: 'שֵׁם הַמִּשְׂחָק',
    defaultRounds: ROUNDS,
    audio: false, playCorrectSound: false,
    onReplay: () => startGame(container),
    buildRound: context => {
      const { shell, round, scope } = context;
      const question = document.createElement('h2');
      question.dir = 'ltr';
      question.textContent = round.question;
      const options = document.createElement('div');
      shell.bodyEl.append(question, options);
      const feedback = scope.use(createFeedback(shell.bodyEl));
      createChoiceRound(context, options, {
        options: shuffle(round.choices).map(value => ({ id: String(value), text: String(value) })),
        isCorrect: option => Number(option.id) === round.answer,
        onCorrect: () => feedback.correct(),
        onWrong: () => feedback.hint('נַסּוּ שׁוּב'),
      });
    },
  });
}
