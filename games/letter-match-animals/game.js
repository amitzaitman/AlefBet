/**
 * משחק התאמת אותיות לחיות
 * הצג אות עברית — בחר את החיה שמתחילה באותה אות
 * 8 סיבובים, אותיות א–ח
 */
import {
  GameShell,
  tts,
  getLetter,
  createOptionCards,
  createProgressBar,
  createFeedback,
  showCompletionScreen,
} from '../../framework/dist/alefbet.js';

// ── Game data ─────────────────────────────────────────────────────────────

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

const DISTRACTORS = [
  { text: 'טלה',  emoji: '🐑' }, { text: 'יונה', emoji: '🕊️' },
  { text: 'כלב',  emoji: '🐕' }, { text: 'מים',  emoji: '💧' },
  { text: 'נחש',  emoji: '🐍' }, { text: 'סוס',  emoji: '🐎' },
  { text: 'עיט',  emoji: '🦅' }, { text: 'פיל',  emoji: '🐘' },
  { text: 'צב',   emoji: '🐢' }, { text: 'קוף',  emoji: '🐒' },
  { text: 'רכב',  emoji: '🚗' }, { text: 'שמש',  emoji: '☀️' },
  { text: 'תפוח', emoji: '🍎' },
];

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function buildOptions(round) {
  const correct     = { id: 'correct', text: round.correct, emoji: round.correctEmoji };
  const distractors = shuffle(DISTRACTORS).slice(0, 3)
    .map((d, i) => ({ id: `wrong-${i}`, text: d.text, emoji: d.emoji }));
  return shuffle([correct, ...distractors]);
}

// ── Game ──────────────────────────────────────────────────────────────────

export function startGame(container) {
  const shell = new GameShell(container, {
    totalRounds: ROUNDS.length,
    title: 'התאמת אותיות',
  });

  let progressBar = null;
  let feedback    = null;
  let cards       = null;
  let currentRoundIndex = 0;

  function buildRoundUI(roundData) {
    shell.bodyEl.innerHTML = '';

    // ── Left panel: instruction + letter ──
    const leftPanel = document.createElement('div');
    leftPanel.className = 'round-panel round-panel--letter';

    const instruction = document.createElement('p');
    instruction.className = 'game-instruction';
    instruction.textContent = 'מצא את החיה שמתחילה באות:';
    leftPanel.appendChild(instruction);

    const letterEl = document.createElement('div');
    letterEl.className = 'letter-display';
    letterEl.textContent = roundData.target;
    letterEl.setAttribute('aria-label', `האות ${getLetter(roundData.target)?.name || roundData.target}`);
    leftPanel.appendChild(letterEl);

    shell.bodyEl.appendChild(leftPanel);

    // ── Right panel: options + feedback ──
    const rightPanel = document.createElement('div');
    rightPanel.className = 'round-panel round-panel--options';

    const optionsContainer = document.createElement('div');
    rightPanel.appendChild(optionsContainer);

    const feedbackContainer = document.createElement('div');
    rightPanel.appendChild(feedbackContainer);
    feedback = createFeedback(feedbackContainer);

    const options = buildOptions(roundData);
    cards = createOptionCards(optionsContainer, options, option => onSelect(option, roundData));

    shell.bodyEl.appendChild(rightPanel);
  }

  function onSelect(option, roundData) {
    cards.disable();

    if (option.id === 'correct') {
      cards.highlight('correct', 'correct');
      feedback.correct(`!נכון — ${roundData.correct} ${roundData.correctEmoji}`);
      tts.speak('כל הכבוד');

      setTimeout(() => {
        shell.state.addScore(1);
        progressBar?.update(shell.state.currentRound);
        const hasMore = shell.state.nextRound();
        if (hasMore) {
          currentRoundIndex++;
          buildRoundUI(ROUNDS[currentRoundIndex]);
          const name = getLetter(ROUNDS[currentRoundIndex].target)?.name || ROUNDS[currentRoundIndex].target;
          tts.speak(`האות ${name}`);
        } else {
          showCompletionScreen(container, shell.state.score, ROUNDS.length, () => startGame(container));
        }
      }, 1600);
    } else {
      cards.highlight(option.id, 'wrong');
      feedback.wrong(`נסה שוב! חפש את ה-${roundData.target}`);
      tts.speak('נסה שוב');
      setTimeout(() => {
        cards.reset();
        const optionsContainer = rightPanel().querySelector('.option-cards-grid')?.parentElement;
        if (optionsContainer) {
          optionsContainer.innerHTML = '';
          const opts = buildOptions(roundData);
          cards = createOptionCards(optionsContainer, opts, o => onSelect(o, roundData));
        }
      }, 1200);
    }
  }

  // Helper to re-find right panel after rebuild
  function rightPanel() {
    return shell.bodyEl.querySelector('.round-panel--options');
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────

  shell.on('start', () => {
    shell.footerEl.innerHTML = '';
    progressBar = createProgressBar(shell.footerEl, ROUNDS.length);
    progressBar.update(0);

    currentRoundIndex = 0;
    buildRoundUI(ROUNDS[currentRoundIndex]);

    const name = getLetter(ROUNDS[0].target)?.name || ROUNDS[0].target;
    tts.speak(`ברוכים הבאים! מצא את החיה שמתחילה באות ${name}`);
  });

  shell.start();
}
