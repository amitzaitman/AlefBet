/**
 * קריאת הברות - הילד שומע הברה (אות+ניקוד) ובוחר את ההברה הנכונה
 * מבין שלוש אפשרויות. זהו הצעד המחבר בין הכרת האותיות להכרת
 * התנועות: המסיחים נבחרים בכוונה - אחד עם אותה אות וניקוד אחר,
 * ואחד עם אות אחרת ואותו ניקוד - כדי לתרגל הבחנה אמיתית.
 *
 * עקרונות:
 * - שמע דרך hebrew-audio: הקלטת מורה -> TTS -> סינתזה. עובד גם בלי רשת.
 * - פידבק בונה בלבד: טעות לא מסומנת באדום ולא מושמע צליל שלילי;
 *   ההברה מושמעת שוב, ואחרי כמה ניסיונות מגיעים רמזים מדורגים
 *   (הבהוב התשובה, ואז עמעום המסיחים) דרך createHintTracker.
 */
import {
  bootstrapGame,
  tts,
  sounds,
  nikudList,
  nikudBaseLetters,
  letterWithNikud,
  randomNikud,
  speakSyllable,
  createOptionCards,
  createProgressBar,
  createRoundManager,
  createFeedback,
  createHintTracker,
  injectHeaderButton,
  showNikudSettingsDialog,
  mountAudioStatusBanner,
  animate,
  RETRY_HINTS,
  randomRetryHint,
} from '../../framework/dist/alefbet.js';

const ROUNDS = 8;

const STATIC_TEXTS = [
  'הַקְשִׁיבוּ לַהֲבָרָה וּבַחֲרוּ אוֹתָהּ',
  'כָּל הַכָּבוֹד',
  ...RETRY_HINTS,
];

function pickOther(pool, exclude) {
  const others = pool.filter(x => !exclude.includes(x));
  return others[Math.floor(Math.random() * others.length)];
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

/**
 * בונה סיבוב: הברת מטרה + שני מסיחים מכוונים
 * (אותה אות/ניקוד אחר, אות אחרת/אותו ניקוד).
 */
function buildRound(targetNikud) {
  const letter = nikudBaseLetters[Math.floor(Math.random() * nikudBaseLetters.length)];
  const otherNikud = pickOther(nikudList, [targetNikud]);
  const otherLetter = pickOther(nikudBaseLetters, [letter]);

  const target = { letter, nikud: targetNikud };
  const options = shuffle([
    target,
    { letter, nikud: otherNikud },
    { letter: otherLetter, nikud: targetNikud },
  ]).map(o => ({
    id: `${o.letter}:${o.nikud.id}`,
    text: letterWithNikud(o.letter, o.nikud.symbol),
    emoji: '',
  }));

  return { target, targetId: `${letter}:${targetNikud.id}`, options };
}

// ── Game ──────────────────────────────────────────────────────────────────

export async function startGame(container) {
  const { shell } = await bootstrapGame(container, {
    gameId: 'syllable-read',
    title: 'קְרִיאַת הֲבָרוֹת',
    preloadTexts: STATIC_TEXTS,
    loadingMessage: 'טוֹעֵן הֲבָרוֹת...',
    totalRounds: ROUNDS,
  });

  injectHeaderButton(container, '⚙️', 'הגדרות', () => showNikudSettingsDialog(container, startGame));
  const audioBanner = mountAudioStatusBanner(container);

  let audioUnlocked = false;
  container.addEventListener('pointerdown', () => {
    if (audioUnlocked) return;
    audioUnlocked = true;
    try { tts.unlock?.(); } catch { /* noop */ }
  }, { once: true, capture: true });

  const roundNikud = randomNikud(ROUNDS);
  let progressBar = null;
  let feedback = null;
  let cards = null;
  let round = null;
  const hints = createHintTracker({ hintAfter: 2, escalateAfter: 4 });

  function playTarget() {
    return speakSyllable(round.target.letter, round.target.nikud.id);
  }

  const roundManager = createRoundManager(shell, container, {
    totalRounds: ROUNDS,
    // עטיפה יציבה: סרגל ההתקדמות נוצר רק ב-start, אחרי יצירת המנהל.
    progressBar: { update: n => progressBar?.update(n) },
    buildRoundUI,
    onWrong: () => {
      // עידוד בלבד: משמיעים שוב את ההברה - זו העזרה, לא עונש.
      feedback?.hint(randomRetryHint());
      const level = hints.miss();
      if (level >= 2) {
        // עזרה מוגברת: מעמעמים את המסיחים ומשאירים את התשובה בולטת.
        cards?.highlight(round.targetId, 'hint');
        dimWrongOptions();
      } else if (level === 1) {
        // רמז עדין: הבהוב קצר של התשובה הנכונה.
        cards?.highlight(round.targetId, 'hint');
        setTimeout(() => cards?.reset(), 1600);
      }
      // ללא await בכוונה: שמע לעולם לא חוסם את זרימת המשחק - גם כשקול
      // המערכת איטי או תקוע, הילד יכול להמשיך לנסות מיד.
      playTarget();
    },
  });

  function dimWrongOptions() {
    shell.bodyEl.querySelectorAll('.option-card').forEach(el => {
      if (el.dataset.id !== round.targetId) el.classList.add('sr-card--dimmed');
    });
  }

  function buildRoundUI() {
    hints.reset();
    shell.bodyEl.innerHTML = '';
    round = buildRound(roundNikud[shell.state.currentRound % roundNikud.length]);

    const stage = document.createElement('div');
    stage.className = 'sr-stage';

    // כפתור השמעה גדול - הילד תמיד יכול לשמוע שוב.
    const replay = document.createElement('button');
    replay.type = 'button';
    replay.className = 'sr-replay';
    replay.setAttribute('aria-label', 'השמע שוב את ההברה');
    replay.innerHTML = '<span class="sr-replay__icon">🔊</span><span class="sr-replay__label">הַקְשִׁיבוּ</span>';
    replay.addEventListener('click', async () => {
      replay.disabled = true;
      animate(replay, 'pulse');
      await playTarget();
      replay.disabled = false;
    });
    stage.appendChild(replay);

    const optionsHost = document.createElement('div');
    optionsHost.className = 'sr-options';
    stage.appendChild(optionsHost);

    shell.bodyEl.appendChild(stage);

    feedback?.destroy();
    feedback = createFeedback(stage);

    cards = createOptionCards(optionsHost, round.options, async (option) => {
      if (roundManager.isAnswered()) return;
      if (option.id === round.targetId) {
        cards.highlight(option.id, 'correct');
        cards.disable();
        feedback.correct();
        // ההברה מושמעת ברקע; אין await כדי שהמעבר לסיבוב הבא לא ייתקע
        // אם ספק השמע איטי.
        await roundManager.handleCorrect(() => { playTarget(); });
      } else {
        // ללא סימון שלילי - הכרטיס רק "נושם" לאישור הלחיצה.
        const el = shell.bodyEl.querySelector(`.option-card[data-id="${CSS.escape(option.id)}"]`);
        if (el) animate(el, 'pulse');
        await roundManager.handleWrong();
      }
    });

    // השמעה אוטומטית של ההברה בפתיחת הסיבוב (אחרי אינטראקציה ראשונה).
    playTarget();
  }

  shell.on('start', () => {
    shell.footerEl.innerHTML = '';
    progressBar = createProgressBar(shell.footerEl, ROUNDS);
    progressBar.update(0);
    buildRoundUI();
  });

  shell.on('end', () => audioBanner?.destroy?.());

  shell.start();
  sounds.click();
}
