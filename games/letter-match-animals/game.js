/**
 * משחק התאמת אותיות לחיות
 * הצג אות עברית — בחר את החיה שמתחילה באותה אות
 * 8 סיבובים, אותיות א–ח
 */
import {
  GameShell,
  tts,
  getLetter,
  getLettersByGroup,
  createOptionCards,
  createProgressBar,
  createFeedback,
  showCompletionScreen,
} from '../../framework/dist/alefbet.js';

// ── Game data: 8 rounds with letters א–ח ──────────────────────────────────

const ROUNDS = [
  { target: 'א', correct: 'אריה',  correctEmoji: '🦁' },
  { target: 'ב', correct: 'בית',   correctEmoji: '🏠' },
  { target: 'ג', correct: 'גמל',   correctEmoji: '🐪' },
  { target: 'ד', correct: 'דג',    correctEmoji: '🐟' },
  { target: 'ה', correct: 'הר',    correctEmoji: '⛰️' },
  { target: 'ו', correct: 'ורד',   correctEmoji: '🌹' },
  { target: 'ז', correct: 'זאב',   correctEmoji: '🐺' },
  { target: 'ח', correct: 'חתול',  correctEmoji: '🐱' },
];

// Pool of distractor animals (all with emojis)
const DISTRACTORS = [
  { text: 'טלה',  emoji: '🐑' },
  { text: 'יונה', emoji: '🕊️' },
  { text: 'כלב',  emoji: '🐕' },
  { text: 'למד',  emoji: '📚' },
  { text: 'מים',  emoji: '💧' },
  { text: 'נחש',  emoji: '🐍' },
  { text: 'סוס',  emoji: '🐎' },
  { text: 'עיט',  emoji: '🦅' },
  { text: 'פיל',  emoji: '🐘' },
  { text: 'צב',   emoji: '🐢' },
  { text: 'קוף',  emoji: '🐒' },
  { text: 'רכב',  emoji: '🚗' },
  { text: 'שמש',  emoji: '☀️' },
  { text: 'תפוח', emoji: '🍎' },
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function buildOptions(round) {
  const correct = { id: 'correct', text: round.correct, emoji: round.correctEmoji };
  const distractors = shuffle(DISTRACTORS)
    .slice(0, 3)
    .map((d, i) => ({ id: `wrong-${i}`, text: d.text, emoji: d.emoji }));
  return shuffle([correct, ...distractors]);
}

// ── Game ──────────────────────────────────────────────────────────────────

export function startGame(container) {
  const shell = new GameShell(container, {
    totalRounds: ROUNDS.length,
    title: 'התאמת אותיות',
  });

  // UI elements inside game-body
  let progressBar = null;
  let feedback    = null;
  let cards       = null;
  let currentRoundIndex = 0;

  function buildRoundUI(roundData) {
    shell.bodyEl.innerHTML = '';

    // Instruction
    const instruction = document.createElement('p');
    instruction.className = 'game-instruction';
    instruction.textContent = 'מצא את החיה שמתחילה באות:';
    shell.bodyEl.appendChild(instruction);

    // Letter display
    const letterEl = document.createElement('div');
    letterEl.className = 'letter-display';
    letterEl.textContent = roundData.target;
    letterEl.setAttribute('aria-label', `האות ${getLetter(roundData.target)?.name || roundData.target}`);
    shell.bodyEl.appendChild(letterEl);

    // Options grid
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-container';
    shell.bodyEl.appendChild(optionsContainer);

    const options = buildOptions(roundData);
    cards = createOptionCards(optionsContainer, options, option => onSelect(option, roundData));

    // Feedback message
    const feedbackContainer = document.createElement('div');
    shell.bodyEl.appendChild(feedbackContainer);
    feedback = createFeedback(feedbackContainer);
  }

  function onSelect(option, roundData) {
    cards.disable();
    const isCorrect = option.id === 'correct';

    if (isCorrect) {
      cards.highlight('correct', 'correct');
      feedback.correct(`!נכון מאוד — ${roundData.correct} ${roundData.correctEmoji}`);
      tts.speak('כל הכבוד');

      setTimeout(() => {
        shell.state.addScore(1);
        progressBar?.update(shell.state.currentRound);
        const hasMore = shell.state.nextRound();
        if (hasMore) {
          currentRoundIndex++;
          buildRoundUI(ROUNDS[currentRoundIndex]);
          tts.speak(`האות ${getLetter(ROUNDS[currentRoundIndex].target)?.name || ROUNDS[currentRoundIndex].target}`);
        } else {
          showCompletionScreen(
            container,
            shell.state.score,
            ROUNDS.length,
            () => startGame(container)
          );
        }
      }, 1600);
    } else {
      cards.highlight(option.id, 'wrong');
      feedback.wrong(`נסה שוב! חפש את ה-${roundData.target}`);
      tts.speak('נסה שוב');

      // Re-enable after short delay
      setTimeout(() => {
        cards.reset();
        // Re-create to reset state cleanly
        const optionsContainer = shell.bodyEl.querySelector('.options-container');
        if (optionsContainer) {
          const options = buildOptions(roundData);
          cards = createOptionCards(optionsContainer, options, o => onSelect(o, roundData));
        }
      }, 1200);
    }
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────

  shell.on('start', () => {
    // Build progress bar in footer
    shell.footerEl.innerHTML = '';
    progressBar = createProgressBar(shell.footerEl, ROUNDS.length);
    progressBar.update(0);

    // First round
    currentRoundIndex = 0;
    buildRoundUI(ROUNDS[currentRoundIndex]);

    const firstName = getLetter(ROUNDS[0].target)?.name || ROUNDS[0].target;
    tts.speak(`ברוכים הבאים למשחק התאמת אותיות! מצא את החיה שמתחילה באות ${firstName}`);
  });

  shell.start();
}
