/**
 * משחק לימוד ניקוד - גרסה פשוטה לילדים
 * אות עם ניקוד במרכז, שני סמלי ניקוד בצדדים - גוררים את האות לצד הנכון
 * 8 סיבובים
 */
import {
  bootstrapGame,
  tts,
  nikudList,
  nikudBaseLetters,
  letterWithNikud,
  createProgressBar,
  showCompletionScreen,
  animate,
  sounds,
  randomNikud,
  showNikudSettingsDialog,
  injectHeaderButton,
  createNikudBox,
  createDragSource,
  createDropTarget,
} from '../../framework/dist/alefbet.js';

const ROUNDS = 8;

// מסיר את סימני הניקוד ממחרוזת, כדי שהתווית לא תסגיר את התשובה
const stripNikud = (s) => s.replace(/[\u05B0-\u05C7]/g, '');

const STATIC_TEXTS = [
  'בְּרוּכִים הַבָּאִים לְמִשְׂחַק הַנִּיקּוּד',
  'כָּל הַכָּבוֹד',
  ...nikudList.map(n => n.name),
];

function pickDistractor(correct, pool) {
  const others = pool.filter(n => n.id !== correct.id);
  return others[Math.floor(Math.random() * others.length)];
}

function pickLetter() {
  return nikudBaseLetters[Math.floor(Math.random() * nikudBaseLetters.length)];
}

// ── Game ──────────────────────────────────────────────────────────────────

export async function startGame(container) {
  const { shell } = await bootstrapGame(container, {
    gameId: 'nikud-match',
    title: 'לִמּוּד נִיקּוּד',
    preloadTexts: STATIC_TEXTS,
    loadingMessage: 'טוֹעֵן נִיקּוּד...',
    totalRounds: ROUNDS,
    editor: {
      type: 'drag-match',
      title: 'לימוד ניקוד',
      restartGame: startGame,
    },
  });

  const roundNikud = randomNikud(ROUNDS);

  injectHeaderButton(container, '⚙️', 'הגדרות', () => showNikudSettingsDialog(container, startGame));

  let progressBar = null;
  let roundIndex = 0;
  let answered = false;

  function buildRoundUI(targetNikud) {
    answered = false;
    shell.bodyEl.innerHTML = '';

    const letter = pickLetter();
    const distractor = pickDistractor(targetNikud, nikudList);
    const correctOnRight = Math.random() < 0.5;
    const leftNikud = correctOnRight ? distractor : targetNikud;
    const rightNikud = correctOnRight ? targetNikud : distractor;

    // ── Arena ──
    const arena = document.createElement('div');
    arena.className = 'nm-arena';

    // Left zone
    const leftZone = document.createElement('div');
    leftZone.className = 'nm-zone nm-zone--left';
    leftZone.style.setProperty('--zone-color', leftNikud.color);
    leftZone.appendChild(createNikudBox(leftNikud));
    const leftLabel = document.createElement('div');
    leftLabel.className = 'nm-zone__name';
    leftLabel.textContent = stripNikud(leftNikud.name);
    leftZone.appendChild(leftLabel);
    arena.appendChild(leftZone);

    // Center: letter with target nikud
    const centerArea = document.createElement('div');
    centerArea.className = 'nm-center';

    const letterEl = document.createElement('div');
    letterEl.className = 'nm-letter';
    letterEl.textContent = letterWithNikud(letter, targetNikud.symbol);

    centerArea.appendChild(letterEl);
    arena.appendChild(centerArea);

    // Right zone
    const rightZone = document.createElement('div');
    rightZone.className = 'nm-zone nm-zone--right';
    rightZone.style.setProperty('--zone-color', rightNikud.color);
    rightZone.appendChild(createNikudBox(rightNikud));
    const rightLabel = document.createElement('div');
    rightLabel.className = 'nm-zone__name';
    rightLabel.textContent = stripNikud(rightNikud.name);
    rightZone.appendChild(rightLabel);
    arena.appendChild(rightZone);

    shell.bodyEl.appendChild(arena);

    // גרירה היא אופן האינטראקציה העיקרי: הילד גורר את האות לאזור הניקוד הנכון.
    const correctZone = leftNikud.id === targetNikud.id ? leftZone : rightZone;

    createDragSource(letterEl, { letter, targetNikud });

    createDropTarget(leftZone, ({ data }) => {
      handleAnswer(
        leftNikud.id === data.targetNikud.id,
        data.letter, data.targetNikud, letterEl, leftZone, correctZone,
      );
    });

    createDropTarget(rightZone, ({ data }) => {
      handleAnswer(
        rightNikud.id === data.targetNikud.id,
        data.letter, data.targetNikud, letterEl, rightZone, correctZone,
      );
    });
  }

  async function handleAnswer(isCorrect, letter, targetNikud, letterEl, zone, correctZone) {
    if (answered) return;

    if (isCorrect) {
      answered = true;
      zone.classList.add('nm-zone--correct');
      letterEl.classList.add('nm-letter--correct');

      // Animate letter toward the zone
      const zoneRect = zone.getBoundingClientRect();
      const letterRect = letterEl.getBoundingClientRect();
      const dx = zoneRect.left + zoneRect.width / 2 - (letterRect.left + letterRect.width / 2);
      const dy = zoneRect.top + zoneRect.height / 2 - (letterRect.top + letterRect.height / 2);
      letterEl.style.transition = 'transform 0.3s ease';
      letterEl.style.transform = `translate(${dx}px, ${dy}px) scale(0.7)`;

      animate(zone, 'bounce');
      sounds.correct();
      tts.speakNikud(letter, targetNikud.symbol);

      shell.state.addScore(1);
      progressBar?.update(shell.state.currentRound);

      setTimeout(() => {
        roundIndex++;
        const hasMore = shell.state.nextRound();
        if (hasMore && roundIndex < ROUNDS) {
          buildRoundUI(roundNikud[roundIndex]);
        } else {
          showCompletionScreen(container, shell.state.score, ROUNDS, () => startGame(container));
        }
      }, 1800);
    } else {
      // עידוד חיובי בלבד: פעימה עדינה של האות לאישור הלחיצה,
      // ולאחריה רמז עדין על האזור הנכון. ללא סימון שלילי או צליל שגוי.
      animate(letterEl, 'pulse');
      setTimeout(() => {
        if (!answered) animate(correctZone, 'pulse');
      }, 700);
    }
  }

  // ── Lifecycle ──
  shell.on('start', () => {
    shell.footerEl.innerHTML = '';
    progressBar = createProgressBar(shell.footerEl, ROUNDS);
    progressBar.update(0);
    roundIndex = 0;
    buildRoundUI(roundNikud[0]);
  });

  shell.start();
}
