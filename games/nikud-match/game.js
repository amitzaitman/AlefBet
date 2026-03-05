/**
 * משחק לימוד ניקוד — גרסה פשוטה לילדים
 * אות עם ניקוד במרכז, שני סמלי ניקוד בצדדים — הקש או גרור לצד הנכון
 * 8 סיבובים
 */
import {
  GameShell,
  tts,
  nikudList,
  nikudBaseLetters,
  letterWithNikud,
  createProgressBar,
  showCompletionScreen,
  animate,
  sounds,
  preloadNikud,
  getNikud,
  randomNikud,
  showNikudSettingsDialog,
  createDragSource,
  createDropTarget,
} from '../../framework/dist/alefbet.js';

const STATIC_TEXTS = [
  'בְּרוּכִים הַבָּאִים לְמִשְׂחַק הַנִּיקּוּד',
  'כָּל הַכָּבוֹד',
  'נַסֵּה שׁוּב',
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
  container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:100dvh;font-family:Heebo,Arial;font-size:1.2rem;color:#4f67ff;direction:rtl;">טוֹעֵן נִיקּוּד...</div>';

  await preloadNikud(STATIC_TEXTS);
  container.innerHTML = '';

  const roundNikud = randomNikud(8);

  const shell = new GameShell(container, {
    totalRounds: 8,
    title: 'לִמּוּד נִיקּוּד',
  });

  const spacer = container.querySelector('.game-header__spacer');
  if (spacer) {
    spacer.innerHTML = '<button style="background:none;border:none;font-size:1.5rem;cursor:pointer;" aria-label="הגדרות">⚙️</button>';
    spacer.querySelector('button').onclick = () => showNikudSettingsDialog(container, startGame);
  }

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
    leftZone.innerHTML = `
      <div class="nm-zone__symbol">◌${leftNikud.symbol}</div>
      <div class="nm-zone__name">${leftNikud.nameNikud}</div>
    `;
    arena.appendChild(leftZone);

    // Center: letter with nikud + hint arrows
    const centerArea = document.createElement('div');
    centerArea.className = 'nm-center';

    const hintLeft = document.createElement('div');
    hintLeft.className = 'nm-hint';
    hintLeft.textContent = '👈';

    const letterEl = document.createElement('div');
    letterEl.className = 'nm-letter';
    letterEl.textContent = letterWithNikud(letter, targetNikud.symbol);

    const hintRight = document.createElement('div');
    hintRight.className = 'nm-hint';
    hintRight.textContent = '👉';

    centerArea.appendChild(hintRight);
    centerArea.appendChild(letterEl);
    centerArea.appendChild(hintLeft);
    arena.appendChild(centerArea);

    // Right zone
    const rightZone = document.createElement('div');
    rightZone.className = 'nm-zone nm-zone--right';
    rightZone.style.setProperty('--zone-color', rightNikud.color);
    rightZone.innerHTML = `
      <div class="nm-zone__symbol">◌${rightNikud.symbol}</div>
      <div class="nm-zone__name">${rightNikud.nameNikud}</div>
    `;
    arena.appendChild(rightZone);

    shell.bodyEl.appendChild(arena);

    // ── Drag support via framework ──
    const dragSource = createDragSource(letterEl, { letter, targetNikud });

    createDropTarget(leftZone, ({ data }) => {
      handleDrop(leftNikud.id === data.targetNikud.id, data.letter, data.targetNikud, letterEl, leftZone);
    });

    createDropTarget(rightZone, ({ data }) => {
      handleDrop(rightNikud.id === data.targetNikud.id, data.letter, data.targetNikud, letterEl, rightZone);
    });

    // Tap-to-select (primary for kids)
    leftZone.addEventListener('click', () => {
      if (answered) return;
      handleDrop(leftNikud.id === targetNikud.id, letter, targetNikud, letterEl, leftZone);
    });

    rightZone.addEventListener('click', () => {
      if (answered) return;
      handleDrop(rightNikud.id === targetNikud.id, letter, targetNikud, letterEl, rightZone);
    });

    tts.speak(targetNikud.nameNikud);
  }

  async function handleDrop(isCorrect, letter, targetNikud, letterEl, zone) {
    if (answered) return;
    answered = true;

    if (isCorrect) {
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

      const combined = letterWithNikud(letter, targetNikud.symbol);
      await tts.speak(combined);

      shell.state.addScore(1);
      progressBar?.update(shell.state.currentRound);
      roundIndex++;
      const hasMore = shell.state.nextRound();
      if (hasMore && roundIndex < 8) {
        buildRoundUI(roundNikud[roundIndex]);
      } else {
        showCompletionScreen(container, shell.state.score, 8, () => startGame(container));
      }
    } else {
      await tts.speak(getNikud('נַסֵּה שׁוּב'));
      answered = false;
    }
  }

  // ── Lifecycle ──
  shell.on('start', () => {
    shell.footerEl.innerHTML = '';
    progressBar = createProgressBar(shell.footerEl, 8);
    progressBar.update(0);
    roundIndex = 0;
    tts.speak(getNikud('בְּרוּכִים הַבָּאִים לְמִשְׂחַק הַנִּיקּוּד'));
    buildRoundUI(roundNikud[0]);
  });

  shell.start();
}
