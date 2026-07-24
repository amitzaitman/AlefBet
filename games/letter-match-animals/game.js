/**
 * משחק התאמת אותיות לחיות
 * הצג אות עברית — בחר את החיה שמתחילה באותה אות
 * 8 סיבובים; בכל הפעלה נבחרות 8 אותיות אקראיות מתוך 22 האותיות הרגילות,
 * כך שמשחקים חוזרים חושפים בסופו של דבר את כל האלף-בית (לא רק א-ח).
 */
import {
  bootstrapGame,
  getLetter,
  getLettersByGroup,
  randomLetters,
  createOptionCards,
  createProgressBar,
  createFeedback,
  showCompletionScreen,
  getNikud,
  tts,
  animate,
  mountAudioStatusBanner,
  PRAISE_PHRASES,
  RETRY_HINTS,
  randomPraise,
  randomRetryHint,
} from '../../framework/dist/alefbet.js';

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

/** כל 22 המילים לדוגמה - למאגר המסיחים של העורך ולטעינה מראש של ניקוד. */
const ALL_REGULAR_WORDS = getLettersByGroup('regular').map(l => ({ text: l.exampleWord, emoji: l.emoji }));

// ── All texts that need nikud ──────────────────────────────────────────────

const STATIC_TEXTS = [
  'מָצָא אֶת הַחַיָּה שֶׁמַּתְחִילָה בָּאוֹת:',
  'בְּרוּכִים הַבָּאִים! מָצָא אֶת הַחַיָּה שֶׁמַּתְחִילָה בָּאוֹת',
  'הָאוֹת',
  ...PRAISE_PHRASES,
  ...RETRY_HINTS,
  ...ALL_REGULAR_WORDS.map(w => w.text),
];

// ── Helpers ───────────────────────────────────────────────────────────────

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function buildOptions(round) {
  const correct = { id: 'correct', text: getNikud(round.correct), emoji: round.correctEmoji };
  const pool = getLettersByGroup('regular').filter(l => l.letter !== round.target);
  const distractors = shuffle(pool).slice(0, 3)
    .map((l, i) => ({ id: `wrong-${i}`, text: getNikud(l.exampleWord), emoji: l.emoji }));
  return shuffle([correct, ...distractors]);
}

// ── Game ──────────────────────────────────────────────────────────────────

export async function startGame(container) {
  const { shell, activeRounds } = await bootstrapGame(container, {
    gameId: 'letter-match-animals',
    title: getNikud('התאמת אותיות') || 'התאמת אותיות',
    preloadTexts: STATIC_TEXTS,
    defaultRounds: buildRounds(),
    editor: {
      type: 'multiple-choice',
      title: 'התאמת אותיות',
      distractors: ALL_REGULAR_WORDS,
      restartGame: startGame,
    },
  });

  let progressBar = null;
  let feedback = null;
  let cards = null;
  let currentRoundIndex = 0;
  let firstInteractionHandled = false;

  // Mounted on container so the banner sits above the game shell;
  // teardown fires on shell 'end' so a restart re-mounts cleanly.
  const audioBanner = mountAudioStatusBanner(container);
  shell.on('end', () => audioBanner.destroy());

  function handleFirstInteraction() {
    if (firstInteractionHandled) return;
    firstInteractionHandled = true;
    // Pre-warm audio from a real user gesture so the first speak() inside a round
    // doesn't trip autoplay restrictions and surface the awaiting-interaction banner.
    tts.unlock();
  }

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
    handleFirstInteraction();
    cards.disable();
    const letterName = getLetter(roundData.target)?.nameNikud || roundData.target;

    if (option.id === 'correct') {
      cards.highlight('correct', 'correct');
      feedback.correct(`!${randomPraise()} — ${getNikud(roundData.correct)} ${roundData.correctEmoji}`);

      setTimeout(() => {
        shell.state.addScore(1);
        progressBar?.update(shell.state.currentRound);
        const hasMore = shell.state.nextRound();
        if (hasMore) {
          currentRoundIndex++;
          buildRoundUI(activeRounds[currentRoundIndex]);
        } else {
          showCompletionScreen(container, shell.state.score, activeRounds.length, () => startGame(container), { gameId: 'letter-match-animals' });
        }
      }, 1600);

    } else {
      // ללא סימון שלילי או צליל שגוי - רק פעימה עדינה על הכרטיס שנלחץ
      // ורמז מעודד, כמו בשאר משחקי הפלטפורמה.
      const pressedEl = rightPanelEl?.querySelector(`.option-card[data-id="${CSS.escape(option.id)}"]`);
      if (pressedEl) animate(pressedEl, 'pulse');
      feedback.hint(`${randomRetryHint()} — חַפְּשׂוּ אֶת ${letterName}`);

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
