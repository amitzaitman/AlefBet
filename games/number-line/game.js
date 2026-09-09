import { runGame, createFeedback, shuffle } from '../../framework/dist/common.js';

/** המשחק מחזיק את מיקום הסמן; אין צורך במנגנון סיבובים חדש בתשתית. */
export function startGame(container) {
  const rounds = [{ start: 2, steps: 3 }, { start: 7, steps: -2 }, { start: 0, steps: 4 },
    { start: 10, steps: -3 }, { start: 3, steps: 4 }, { start: 6, steps: -5 }];
  return runGame(container, {
    gameId: 'number-line', title: 'קְפִיצוֹת עַל צִיר הַמִּסְפָּרִים',
    defaultRounds: shuffle(rounds), audio: false, playCorrectSound: false,
    onReplay: () => startGame(container),
    buildRound(context) {
      const { shell, round, scope } = context;
      let position = round.start;
      const goal = round.start + round.steps;
      const instruction = document.createElement('h2');
      instruction.textContent = `הַתְחִילוּ בְּ־${round.start}. קִפְצוּ ${Math.abs(round.steps)} צְעָדִים ${round.steps > 0 ? 'יָמִינָה' : 'שְׂמֹאלָה'}.`;
      const equation = document.createElement('p');
      equation.className = 'line-equation';
      equation.dir = 'ltr';
      equation.textContent = `${round.start} ${round.steps > 0 ? '+' : '−'} ${Math.abs(round.steps)} = ?`;
      const line = document.createElement('div');
      line.className = 'number-line';
      line.dir = 'ltr';
      const markers = Array.from({ length: 11 }, (_, n) => {
        const marker = document.createElement('span');
        marker.textContent = String(n);
        marker.className = 'number-line__mark';
        line.append(marker);
        return marker;
      });
      const status = document.createElement('p');
      status.className = 'line-position';
      status.setAttribute('aria-live', 'polite');
      const controls = document.createElement('div');
      controls.className = 'line-controls';
      controls.dir = 'ltr';
      const button = (text, label) => {
        const el = document.createElement('button');
        el.type = 'button'; el.textContent = text; el.setAttribute('aria-label', label);
        return el;
      };
      const left = button('←', 'צעד שמאלה');
      const right = button('→', 'צעד ימינה');
      const reset = button('↺', 'חזרה לנקודת ההתחלה');
      const check = button('בְּדִיקָה', 'בדיקת התשובה');
      check.dir = 'rtl';
      controls.append(left, reset, right);
      shell.bodyEl.append(instruction, equation, line, status, controls, check);
      check.className = 'line-check';
      const feedback = scope.use(createFeedback(shell.bodyEl));
      const update = () => {
        markers.forEach((marker, n) => {
          marker.classList.toggle('number-line__mark--current', n === position);
          marker.classList.toggle('number-line__mark--start', n === round.start);
        });
        status.textContent = `אֲנַחְנוּ בַּמִּסְפָּר ${position}`;
        left.disabled = context.isAnswered() || position === 0;
        right.disabled = context.isAnswered() || position === 10;
        reset.disabled = check.disabled = context.isAnswered();
      };
      const move = delta => {
        if (context.isAnswered()) return;
        position = Math.max(0, Math.min(10, position + delta));
        update();
      };
      scope.listen(left, 'click', () => move(-1));
      scope.listen(right, 'click', () => move(1));
      scope.listen(reset, 'click', () => { if (!context.isAnswered()) { position = round.start; update(); } });
      scope.listen(check, 'click', () => {
        if (position === goal) void context.onCorrect(() => feedback.correct());
        else void context.onWrong(() => feedback.hint('חִזְרוּ לַהַתְחָלָה וְסִפְרוּ אֶת הַקְּפִיצוֹת'));
      });
      context.subscribeAnswered(update);
    },
  });
}
