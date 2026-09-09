import { runGame, createChoiceRound, createFeedback, shuffle } from '../../framework/dist/common.js';

export function startGame(container) {
  return runGame(container, {
    gameId: 'make-ten', title: 'מַשְׁלִימִים לְעֶשֶׂר',
    defaultRounds: shuffle(Array.from({ length: 11 }, (_, given) => ({ given }))).slice(0, 6),
    audio: false, playCorrectSound: false,
    onReplay: () => startGame(container),
    buildRound(context) {
      const { shell, round, scope } = context;
      const answer = 10 - round.given;
      const instruction = document.createElement('h2');
      instruction.textContent = 'כַּמָּה חָסֵר עַד עֶשֶׂר?';
      const equation = document.createElement('p');
      equation.className = 'ten-equation';
      equation.dir = 'ltr';
      equation.textContent = `${round.given} + ? = 10`;
      const frame = document.createElement('div');
      frame.className = 'ten-frame';
      frame.setAttribute('role', 'img');
      frame.setAttribute('aria-label', `${round.given} משבצות מלאות מתוך 10`);
      for (let i = 0; i < 10; i++) {
        const cell = document.createElement('span');
        cell.className = i < round.given ? 'ten-cell ten-cell--filled' : 'ten-cell';
        frame.append(cell);
      }
      const choices = document.createElement('div');
      shell.bodyEl.append(instruction, equation, frame, choices);
      const feedback = scope.use(createFeedback(shell.bodyEl));
      const others = shuffle(Array.from({ length: 11 }, (_, n) => n).filter(n => n !== answer)).slice(0, 3);
      createChoiceRound(context, choices, {
        options: shuffle([answer, ...others]).map(n => ({ id: String(n), text: String(n) })),
        isCorrect: option => Number(option.id) === answer,
        onCorrect: () => { equation.textContent = `${round.given} + ${answer} = 10`; feedback.correct(); },
        onWrong: () => feedback.hint('סִפְרוּ אֶת הַמִּשְׁבָּצוֹת הָרֵיקוֹת'),
      });
    },
  });
}
