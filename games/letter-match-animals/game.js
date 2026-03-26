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
  preloadNikud,
  getNikud,
  showLoadingScreen,
  hideLoadingScreen,
  GameEditor,
  GameData,
  loadGameData,
} from '../../framework/dist/alefbet.js';

// ── Game data ─────────────────────────────────────────────────────────────

const ROUNDS = [
  { target: 'א', correct: 'אַרְיֵה', correctEmoji: '🦁' },
  { target: 'ב', correct: 'בַּיִת', correctEmoji: '🏠' },
  { target: 'ג', correct: 'גָּמָל', correctEmoji: '🐪' },
  { target: 'ד', correct: 'דָּג', correctEmoji: '🐟' },
  { target: 'ה', correct: 'הַר', correctEmoji: '⛰️' },
  { target: 'ו', correct: 'וֶרֶד', correctEmoji: '🌹' },
  { target: 'ז', correct: 'זְאֵב', correctEmoji: '🐺' },
  { target: 'ח', correct: 'חָתוּל', correctEmoji: '🐱' },
];

const DISTRACTORS = [
  { text: 'טָלֶה', emoji: '🐑' }, { text: 'יוֹנָה', emoji: '🕊️' },
  { text: 'כֶּלֶב', emoji: '🐕' }, { text: 'מַיִם', emoji: '💧' },
  { text: 'נָחָשׁ', emoji: '🐍' }, { text: 'סוּס', emoji: '🐎' },
  { text: 'עַיִט', emoji: '🦅' }, { text: 'פִּיל', emoji: '🐘' },
  { text: 'צָב', emoji: '🐢' }, { text: 'קוֹף', emoji: '🐒' },
  { text: 'רֶכֶב', emoji: '🚗' }, { text: 'שֶׁמֶשׁ', emoji: '☀️' },
  { text: 'תַּפּוּחַ', emoji: '🍎' },
];

// ── All texts that need nikud ──────────────────────────────────────────────

const STATIC_TEXTS = [
  'מָצָא אֶת הַחַיָּה שֶׁמַּתְחִילָה בָּאוֹת:',
  'בְּרוּכִים הַבָּאִים! מָצָא אֶת הַחַיָּה שֶׁמַּתְחִילָה בָּאוֹת',
  'כָּל הַכָּבוֹד',
  'נַסֵּה שׁוּב',
  'הָאוֹת',
  ...ROUNDS.map(r => r.correct),
  ...DISTRACTORS.map(d => d.text),
];

// ── Helpers ───────────────────────────────────────────────────────────────

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function buildOptions(round) {
  const correct = { id: 'correct', text: getNikud(round.correct), emoji: round.correctEmoji };
  const distractors = shuffle(DISTRACTORS).slice(0, 3)
    .map((d, i) => ({ id: `wrong-${i}`, text: getNikud(d.text), emoji: d.emoji }));
  return shuffle([correct, ...distractors]);
}

// ── Game ──────────────────────────────────────────────────────────────────

export async function startGame(container) {
  // Show loading indicator while nikud loads
  showLoadingScreen(container, 'טוֹעֵן...');

  await preloadNikud(STATIC_TEXTS);

  hideLoadingScreen(container);

  // Load saved rounds (if teacher has edited them) or fall back to defaults
  const savedData = loadGameData('letter-match-animals');
  const activeRounds = savedData ? savedData.rounds : ROUNDS;

  const shell = new GameShell(container, {
    totalRounds: activeRounds.length,
    title: getNikud('התאמת אותיות') || 'התאמת אותיות',
  });

  // Live editing support
  const gameData = GameData.fromRoundsArray('letter-match-animals', activeRounds, {
    title: 'התאמת אותיות', type: 'multiple-choice',
  }, DISTRACTORS);
  new GameEditor(container, gameData, { restartGame: c => startGame(c) });

  let progressBar = null;
  let feedback = null;
  let cards = null;
  let currentRoundIndex = 0;

  function buildRoundUI(roundData) {
    shell.bodyEl.innerHTML = '';

    // ── Left panel: instruction + letter ──
    const leftPanel = document.createElement('div');
    leftPanel.className = 'round-panel round-panel--letter';

    const instruction = document.createElement('p');
    instruction.className = 'game-instruction';
    instruction.textContent = getNikud('מצא את החיה שמתחילה באות:');
    leftPanel.appendChild(instruction);

    const letterInfo = getLetter(roundData.target);
    const letterEl = document.createElement('div');
    letterEl.className = 'letter-display anim-appear';
    letterEl.textContent = roundData.target;
    letterEl.setAttribute('aria-label', `הָאוֹת ${letterInfo?.nameNikud || letterInfo?.name || roundData.target}`);
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
    cards = createOptionCards(optionsContainer, options,
      option => onSelect(option, roundData, rightPanel));

    shell.bodyEl.appendChild(rightPanel);
  }

  function onSelect(option, roundData, rightPanelEl) {
    cards.disable();
    const letterName = getLetter(roundData.target)?.nameNikud || roundData.target;

    if (option.id === 'correct') {
      cards.highlight('correct', 'correct');
      feedback.correct(`!נָכוֹן — ${getNikud(roundData.correct)} ${roundData.correctEmoji}`);

      setTimeout(() => {
        shell.state.addScore(1);
        progressBar?.update(shell.state.currentRound);
        const hasMore = shell.state.nextRound();
        if (hasMore) {
          currentRoundIndex++;
          buildRoundUI(activeRounds[currentRoundIndex]);
        } else {
          showCompletionScreen(container, shell.state.score, activeRounds.length, () => startGame(container));
        }
      }, 1600);

    } else {
      cards.highlight(option.id, 'wrong');
      feedback.wrong(`!נַסֵּה שׁוּב — חַפֵּשׂ אֶת ${letterName}`);

      setTimeout(() => {
        cards.reset();
        const optionsEl = rightPanelEl?.querySelector('.option-cards-grid')?.parentElement;
        if (optionsEl) {
          optionsEl.innerHTML = '';
          cards = createOptionCards(optionsEl, buildOptions(roundData),
            o => onSelect(o, roundData, rightPanelEl));
        }
      }, 1200);
    }
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────

  shell.on('start', () => {
    shell.footerEl.innerHTML = '';
    progressBar = createProgressBar(shell.footerEl, activeRounds.length);
    progressBar.update(0);

    currentRoundIndex = 0;
    buildRoundUI(activeRounds[currentRoundIndex]);
  });

  shell.start();
}
