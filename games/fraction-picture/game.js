import { runGame, createChoiceRound, createFeedback, shuffle } from '../../framework/dist/common.js';

// These visual helpers are shared by the three fraction games, not the runtime.
export function fraction(n, d) { return `${n}/${d}`; }

export function fractionBar(n, d) {
  const bar = document.createElement('div');
  bar.className = 'fraction-bar';
  bar.setAttribute('role', 'img');
  bar.setAttribute('aria-label', `${n} חלקים צבועים מתוך ${d} חלקים שווים`);
  bar.dataset.n = n;
  bar.dataset.d = d;
  for (let i = 0; i < d; i++) {
    const cell = document.createElement('span');
    cell.className = i < n ? 'fraction-cell fraction-cell--filled' : 'fraction-cell';
    bar.append(cell);
  }
  return bar;
}

export function fractionLabel(n, d) {
  const label = document.createElement('span');
  label.className = 'fraction-label';
  label.setAttribute('aria-label', `${n} מתוך ${d}`);
  label.innerHTML = `<span aria-hidden="true">${n}</span><span aria-hidden="true">${d}</span>`;
  return label;
}

export function practiceRounds() {
  // Gentle progression: halves, thirds, then quarters, with fresh order on replay.
  return [2, 3, 4].flatMap(d => shuffle(Array.from({ length: d - 1 }, (_, i) => ({ n: i + 1, d }))));
}

export function runFractionGame(container, { id, title, rounds, build }) {
  return runGame(container, {
    gameId: id, title, defaultRounds: rounds(), audio: false, playCorrectSound: false,
    onReplay: () => runFractionGame(container, { id, title, rounds, build }),
    buildRound(context) {
      const host = document.createElement('section');
      host.className = 'fraction-game';
      context.shell.bodyEl.append(host);
      const { prompt, hint, options, correct, render } = build(context.round);
      const heading = document.createElement('h2');
      heading.textContent = prompt;
      host.append(heading);
      render(host);
      const choices = document.createElement('div');
      host.append(choices);
      const feedback = context.scope.use(createFeedback(host));
      let attempts = 0;
      const cards = createChoiceRound(context, choices, {
        options: shuffle(options),
        isCorrect: option => option.id === correct,
        onCorrect: () => feedback.correct('כָּל הַכָּבוֹד!'),
        onWrong: () => {
          feedback.hint(hint);
          if (++attempts >= 2) cards.highlight(correct, 'hint');
        },
      });
      // Render conventional stacked fractions while keeping accessible button names.
      for (const button of choices.querySelectorAll('.option-card')) {
        const value = button.dataset.id;
        if (/^\d+\/\d+$/.test(value)) {
          const [n, d] = value.split('/').map(Number);
          button.setAttribute('aria-label', `${n} מתוך ${d}`);
          button.querySelector('.option-card__text').replaceChildren(fractionLabel(n, d));
        }
      }
    },
  });
}

export function startGame(container) {
  return runFractionGame(container, {
    id: 'fraction-picture', title: 'מְזַהִים שְׁבָרִים', rounds: practiceRounds,
    build: ({ n, d }) => ({
      prompt: 'אֵיזֶה שֶׁבֶר צָבוּעַ?',
      hint: `סִפְרוּ: ${n} חֲלָקִים צְבוּעִים מִתּוֹךְ ${d} חֲלָקִים שָׁוִים.`,
      options: Array.from({ length: d + 1 }, (_, i) => ({ id: fraction(i, d), text: fraction(i, d) })),
      correct: fraction(n, d),
      render: host => host.append(fractionBar(n, d)),
    }),
  });
}
