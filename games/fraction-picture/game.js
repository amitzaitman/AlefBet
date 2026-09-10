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
  // Familiar halves and quarters first; thirds come after partitioning is understood.
  return [2, 4, 3].flatMap(d => shuffle(Array.from({ length: d - 1 }, (_, i) => ({ n: i + 1, d }))));
}

export function runFractionGame(container, { id, title, rounds, build }) {
  return runGame(container, {
    gameId: id, title, defaultRounds: rounds(), audio: false, playCorrectSound: false,
    transitionMs: 1600,
    onReplay: () => runFractionGame(container, { id, title, rounds, build }),
    buildRound(context) {
      const host = document.createElement('section');
      host.className = 'fraction-game';
      context.shell.bodyEl.append(host);
      const { prompt, hints, success, options, correct, render } = build(context.round);
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
        onCorrect: () => feedback.correct(success || 'כָּל הַכָּבוֹד!'),
        onWrong: () => {
          feedback.hint(hints[Math.min(attempts++, hints.length - 1)]);
          if (attempts >= 3) cards.highlight(correct, 'hint');
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

/** Tap-to-paint interaction shared by painting a target and completing a whole. */
export function startPainting(container, mode) {
  const completing = mode === 'whole';
  return runGame(container, {
    gameId: completing ? 'fraction-whole' : 'fraction-picture',
    title: completing ? 'מַשְׁלִימִים לְשָׁלֵם' : 'צוֹבְעִים שְׁבָרִים',
    defaultRounds: practiceRounds(), audio: false, playCorrectSound: false,
    transitionMs: 1600,
    onReplay: () => startPainting(container, mode),
    buildRound(context) {
      const { round: { n, d }, scope, shell } = context;
      const given = completing ? n : 0;
      const goal = completing ? d - n : n;
      const selected = new Set();
      let hintLevel = 0;
      const host = document.createElement('section');
      host.className = 'fraction-game';
      const heading = document.createElement('h2');
      heading.textContent = completing ? 'הוֹסִיפוּ חֲלָקִים עַד שֶׁיִּהְיֶה שָׁלֵם' : 'צִבְעוּ אֶת הַשֶּׁבֶר';
      const target = document.createElement('p');
      target.className = 'fraction-equation';
      target.dir = 'ltr';
      target.append(fractionLabel(n, d));
      if (completing) target.append(' + ? = 1');
      const instruction = document.createElement('p');
      instruction.className = 'fraction-instruction';
      instruction.textContent = 'לַחֲצוּ עַל חֵלֶק כְּדֵי לִצְבֹּעַ. לְבִטּוּל, לַחֲצוּ עָלָיו שׁוּב.';
      const bar = document.createElement('div');
      bar.className = 'fraction-bar fraction-bar--interactive';
      bar.setAttribute('role', 'group');
      bar.setAttribute('aria-label', `שלם מחולק ל-${d} חלקים שווים`);
      bar.dataset.d = d;
      bar.dataset.n = n;
      const cells = Array.from({ length: d }, (_, i) => {
        const fixed = i < given;
        const cell = document.createElement(fixed ? 'span' : 'button');
        cell.className = 'fraction-cell' + (fixed ? ' fraction-cell--given' : '');
        if (fixed) {
          cell.setAttribute('role', 'img');
          cell.setAttribute('aria-label', `חלק ${i + 1} כבר צבוע`);
          cell.textContent = '●';
        } else {
          cell.type = 'button';
          cell.setAttribute('aria-label', `חלק ${i + 1} מתוך ${d}`);
          cell.setAttribute('aria-pressed', 'false');
          scope.listen(cell, 'click', () => {
            if (context.isAnswered()) return;
            if (selected.has(i)) selected.delete(i); else selected.add(i);
            update();
          });
        }
        bar.append(cell);
        return cell;
      });
      const status = document.createElement('p');
      status.className = 'fraction-status';
      status.setAttribute('aria-live', 'polite');
      const hint = document.createElement('p');
      hint.className = 'fraction-guidance';
      hint.setAttribute('aria-live', 'polite');
      const controls = document.createElement('div');
      controls.className = 'fraction-controls';
      const button = (label, className) => {
        const el = document.createElement('button');
        el.type = 'button'; el.textContent = label; el.className = className;
        controls.append(el);
        return el;
      };
      const check = button('בְּדִיקָה', 'fraction-check');
      check.setAttribute('aria-label', 'בדיקת התשובה');
      const reset = button('הַתְחָלָה מֵחָדָשׁ', 'fraction-reset');
      const help = button('רֶמֶז', 'fraction-help');
      host.append(heading, target, instruction, bar, status, controls, hint);
      shell.bodyEl.append(host);
      const feedback = scope.use(createFeedback(host));
      function update() {
        cells.forEach((cell, i) => {
          if (i < given) return;
          cell.classList.toggle('fraction-cell--filled', selected.has(i));
          cell.setAttribute('aria-pressed', String(selected.has(i)));
          cell.textContent = selected.has(i) ? '✓' : '';
          cell.disabled = context.isAnswered();
        });
        status.textContent = completing
          ? `הוֹסַפְתֶּם ${selected.size} מִתּוֹךְ ${d} חֲלָקִים. הַחֲלָקִים עִם הַנְּקֻדָּה כְּבָר הָיוּ צְבוּעִים.`
          : `צְבוּעִים ${selected.size} מִתּוֹךְ ${d} חֲלָקִים.`;
        check.disabled = reset.disabled = help.disabled = context.isAnswered();
      }
      function showHint() {
        hintLevel++;
        if (hintLevel === 1) {
          hint.textContent = completing
            ? 'הִסְתַּכְּלוּ עַל הַחֲלָקִים הָרֵיקִים. כַּמָּה צָרִיךְ לְהוֹסִיף?'
            : 'הַמִּסְפָּר הָעֶלְיוֹן אוֹמֵר כַּמָּה חֲלָקִים לִצְבֹּעַ. הַתַּחְתּוֹן אוֹמֵר לְכַמָּה חֲלָקִים הַשָּׁלֵם מְחֻלָּק.';
        } else if (hintLevel === 2) {
          hint.textContent = selected.size > goal
            ? 'צְבוּעִים יוֹתֵר מִדַּי חֲלָקִים. לַחֲצוּ שׁוּב עַל חֵלֶק כְּדֵי לְבַטֵּל.'
            : 'סִפְרוּ אֶת הַחֲלָקִים שֶׁצְּבַעְתֶּם וְאֶת אֵלֶּה שֶׁעוֹד חֲסֵרִים.';
        } else {
          hint.textContent = completing ? `צָרִיךְ לְהוֹסִיף ${goal} חֲלָקִים מִתּוֹךְ ${d}.` : `צָרִיךְ לִצְבֹּעַ ${goal} חֲלָקִים מִתּוֹךְ ${d}.`;
        }
      }
      scope.listen(help, 'click', () => { if (!context.isAnswered()) showHint(); });
      scope.listen(reset, 'click', () => {
        if (context.isAnswered()) return;
        selected.clear(); hint.textContent = ''; update();
      });
      scope.listen(check, 'click', () => {
        if (context.isAnswered()) return;
        if (selected.size === goal) void context.onCorrect(() => {
          if (completing) target.replaceChildren(fractionLabel(n, d), ' + ', fractionLabel(goal, d), ' = 1');
          hint.textContent = '';
          feedback.correct(completing ? 'הִשְׁלַמְתֶּם לְשָׁלֵם!' : 'צְבַעְתֶּם אֶת הַשֶּׁבֶר!');
        });
        else void context.onWrong(showHint);
      });
      context.subscribeAnswered(update);
      update();
    },
  });
}

export function startGame(container) { return startPainting(container, 'picture'); }
