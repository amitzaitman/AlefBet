/**
 * משחק התאמת אותיות למילים
 * הצג אות עברית — בחר את המילה שמתחילה באותה אות
 * 8 סיבובים; בכל הפעלה נבחרות 8 אותיות אקראיות מתוך 22 האותיות הרגילות,
 * כך שמשחקים חוזרים חושפים בסופו של דבר את כל האלף-בית (לא רק א-ח).
 */
import {
  runGame,
  shuffle,
  getLetter,
  getLettersByGroup,
  randomLetters,
  createChoiceRound,
  createFeedback,
  animate,
  randomPraise,
  randomRetryHint,
} from '../../framework/dist/runtime.js';

// ── Game data ─────────────────────────────────────────────────────────────
// הסיבובים והמסיחים נגזרים מ-hebrewLetters (מקור אמת יחיד) ולא ממערכים
// מקומיים משוכפלים - כל 22 האותיות הרגילות זמינות כמטרה או כמסיח.

/** בחר 8 אותיות מטרה אקראיות להפעלה נוכחית של המשחק. */
function buildRounds() {
  return randomLetters(8, 'regular').map(l => ({
    target: l.letter,
    correct: l.exampleWord,
    correctEmoji: l.emoji,
  }));
}

const INSTRUCTION = 'אֵיזוֹ מִלָּה מַתְחִילָה בָּאוֹת?';


// ── Helpers ───────────────────────────────────────────────────────────────


function buildOptions(round) {
  const correct = { id: 'correct', text: round.correct, emoji: round.correctEmoji };
  const pool = getLettersByGroup('regular').filter(l => l.letter !== round.target);
  const distractors = shuffle(pool).slice(0, 3)
    .map((l, i) => ({ id: `wrong-${i}`, text: l.exampleWord, emoji: l.emoji }));
  return shuffle([correct, ...distractors]);
}

// ── Game ──────────────────────────────────────────────────────────────────

export async function startGame(container) {
  return runGame(container, {
    gameId: 'letter-match-animals',
    title: 'הַתְאָמַת אוֹתִיּוֹת',
    defaultRounds: buildRounds(),
    transitionMs: 800,
    playCorrectSound: false,
    onReplay: () => startGame(container),
    // Rounds a teacher saved in the past still load (alefbet.editor.letter-match-animals).
    editor: {
      content: {
        version: 1,
        createRound: () => ({ target: 'א', correct: 'אַרְיֵה', correctEmoji: '🦁' }),
        validateRound: round => typeof round.target === 'string' && !!getLetter(round.target)
          && typeof round.correct === 'string' && !!round.correct.trim()
          && round.correct.replace(/[\u0591-\u05C7]/g, '').startsWith(round.target)
          && typeof round.correctEmoji === 'string',
      },
    },
    buildRound: context => {
      const { shell, round, scope } = context;
      // ── Left panel: instruction + letter ──
      const leftPanel = document.createElement('div');
      leftPanel.className = 'round-panel round-panel--letter';

      const instruction = document.createElement('p');
      instruction.className = 'game-instruction';
      instruction.textContent = INSTRUCTION;
      leftPanel.appendChild(instruction);

      const letterInfo = getLetter(round.target);
      const letterEl = document.createElement('div');
      letterEl.className = 'letter-display anim-appear';
      letterEl.textContent = round.target;
      letterEl.setAttribute('aria-label', `הָאוֹת ${letterInfo?.nameNikud || letterInfo?.name || round.target}`);
      leftPanel.appendChild(letterEl);

      shell.bodyEl.appendChild(leftPanel);

      // ── Right panel: options + feedback ──
      const rightPanel = document.createElement('div');
      rightPanel.className = 'round-panel round-panel--options';

      const optionsContainer = document.createElement('div');
      optionsContainer.className = 'letter-match-options';
      rightPanel.appendChild(optionsContainer);

      const feedbackContainer = document.createElement('div');
      rightPanel.appendChild(feedbackContainer);
      const feedback = scope.use(createFeedback(feedbackContainer));

      const options = buildOptions(round);
      createChoiceRound(context, optionsContainer, {
        options,
        isCorrect: option => option.id === 'correct',
        onCorrect: () => feedback.correct(`!${randomPraise()} — ${round.correct} ${round.correctEmoji}`),
        onWrong: option => {
          const letterName = getLetter(round.target)?.nameNikud || round.target;
          const pressedEl = rightPanel.querySelector(`.option-card[data-id="${CSS.escape(option.id)}"]`);
          if (pressedEl) animate(pressedEl, 'pulse');
          feedback.hint(`${randomRetryHint()} — חַפְּשׂוּ אֶת ${letterName}`);
        },
      });

      shell.bodyEl.appendChild(rightPanel);
    },
  });
}
