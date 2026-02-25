/**
 * משחק לימוד ניקוד
 * גרור (או הקש) את סמל הניקוד לאות שיש לה אותו ניקוד
 * 8 סיבובים עם ניקוד שונה בכל פעם
 */
import {
  GameShell,
  tts,
  nikudList,
  nikudBaseLetters,
  letterWithNikud,
  createFeedback,
  createProgressBar,
  showCompletionScreen,
  animate,
  sounds,
  createDragSource,
  createDropTarget,
  preloadNikud,
  getNikud,
} from '../../framework/dist/alefbet.js';

// ── Texts to preload ──────────────────────────────────────────────────────

const STATIC_TEXTS = [
  'גרור לאות עם אותו ניקוד:',
  'גרור אותי',
  'ברוכים הבאים למשחק הניקוד',
  'כל הכבוד',
  'נסה שוב',
  'מצא את',
  ...nikudList.map(n => n.name),
];

// ── Helpers ───────────────────────────────────────────────────────────────

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function buildRound(targetNikud) {
  const letters     = shuffle(nikudBaseLetters).slice(0, 4);
  const distractors = shuffle(nikudList.filter(n => n.id !== targetNikud.id)).slice(0, 3);
  const correctIndex = Math.floor(Math.random() * 4);
  const assigned = [...distractors];
  assigned.splice(correctIndex, 0, targetNikud);

  return letters.map((letter, i) => ({
    letter,
    nikud: assigned[i],
    isCorrect: i === correctIndex,
    display: letterWithNikud(letter, assigned[i].symbol),
  }));
}

// ── Game ──────────────────────────────────────────────────────────────────

export async function startGame(container) {
  container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:100dvh;font-family:Heebo,Arial;font-size:1.2rem;color:#4f67ff;direction:rtl;">טוֹעֵן נִיקּוּד...</div>';

  await preloadNikud(STATIC_TEXTS);

  container.innerHTML = '';

  const roundNikud = shuffle([...nikudList, ...nikudList]).slice(0, 8);

  const shell = new GameShell(container, {
    totalRounds: 8,
    title: 'לִמּוּד נִיקּוּד',
  });

  let progressBar = null;
  let feedback    = null;
  let dragSource  = null;
  let dropTargets = [];
  let roundIndex  = 0;
  let answered    = false;

  function buildRoundUI(targetNikud) {
    answered = false;
    shell.bodyEl.innerHTML = '';

    dragSource?.destroy();
    dropTargets.forEach(d => d.destroy());
    dropTargets = [];

    const options = buildRound(targetNikud);

    // ── Left panel: draggable nikud card ──
    const leftPanel = document.createElement('div');
    leftPanel.className = 'nikud-panel nikud-panel--source';

    const instruction = document.createElement('p');
    instruction.className = 'game-instruction';
    instruction.textContent = getNikud('גרור לאות עם אותו ניקוד:');
    leftPanel.appendChild(instruction);

    const dragCard = document.createElement('div');
    dragCard.className = 'nikud-drag-card';
    dragCard.style.setProperty('--nikud-color', targetNikud.color);
    dragCard.innerHTML = `
      <div class="nikud-drag-card__symbol">${letterWithNikud('א', targetNikud.symbol)}</div>
      <div class="nikud-drag-card__name">${targetNikud.nameNikud}</div>
      <div class="nikud-drag-card__hint">${getNikud('גרור אותי')} 👆</div>
    `;
    leftPanel.appendChild(dragCard);
    shell.bodyEl.appendChild(leftPanel);

    // ── Right panel: letter drop targets ──
    const rightPanel = document.createElement('div');
    rightPanel.className = 'nikud-panel nikud-panel--targets';

    const grid = document.createElement('div');
    grid.className = 'nikud-options-grid';

    options.forEach(opt => {
      const card = document.createElement('div');
      card.className = 'nikud-letter-card';
      card.setAttribute('aria-label', `${opt.letter} עם ${opt.nikud.nameNikud}`);
      card.innerHTML = `<span class="nikud-letter-card__text">${opt.display}</span>`;

      const dt = createDropTarget(card, () => onDrop(opt, targetNikud, dragCard, card));
      dropTargets.push(dt);

      card.addEventListener('click', () => {
        if (answered) return;
        onDrop(opt, targetNikud, dragCard, card);
      });

      grid.appendChild(card);
    });

    rightPanel.appendChild(grid);

    const feedbackContainer = document.createElement('div');
    rightPanel.appendChild(feedbackContainer);
    feedback = createFeedback(feedbackContainer);

    shell.bodyEl.appendChild(rightPanel);

    dragSource = createDragSource(dragCard, { nikudId: targetNikud.id });

    // Speak the nikud name using nikud'd pronunciation
    tts.speak(`${getNikud('מצא את')} ${targetNikud.nameNikud}`);
  }

  function onDrop(option, targetNikud, dragCard, dropCard) {
    if (answered) return;
    answered = true;

    dragSource?.destroy();
    dragSource = null;
    dropTargets.forEach(d => d.destroy());
    dropTargets = [];

    if (option.isCorrect) {
      dropCard.classList.add('nikud-letter-card--correct');
      dragCard.classList.add('nikud-drag-card--correct');
      animate(dropCard, 'bounce');
      sounds.correct();
      tts.speak(`${getNikud('כל הכבוד')}! ${targetNikud.nameNikud} — ${option.display}`);

      setTimeout(() => {
        shell.state.addScore(1);
        progressBar?.update(shell.state.currentRound);
        roundIndex++;
        const hasMore = shell.state.nextRound();
        if (hasMore && roundIndex < roundNikud.length) {
          buildRoundUI(roundNikud[roundIndex]);
        } else {
          showCompletionScreen(container, shell.state.score, 8, () => startGame(container));
        }
      }, 1800);

    } else {
      dropCard.classList.add('nikud-letter-card--wrong');
      animate(dropCard, 'shake');
      sounds.wrong();
      tts.speak(getNikud('נסה שוב'));

      setTimeout(() => {
        dropCard.classList.remove('nikud-letter-card--wrong');
        answered = false;

        // Re-attach drag/drop
        dragSource = createDragSource(dragCard, { nikudId: targetNikud.id });
        const allCards = shell.bodyEl.querySelectorAll('.nikud-letter-card');
        const fresh = buildRound(targetNikud);
        allCards.forEach((card, i) => {
          const opt = fresh[i];
          const dt = createDropTarget(card, () => onDrop(opt, targetNikud, dragCard, card));
          dropTargets.push(dt);
        });
      }, 1000);
    }
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────

  shell.on('start', () => {
    shell.footerEl.innerHTML = '';
    progressBar = createProgressBar(shell.footerEl, 8);
    progressBar.update(0);
    roundIndex = 0;
    buildRoundUI(roundNikud[0]);
    tts.speak(getNikud('ברוכים הבאים למשחק הניקוד'));
  });

  shell.start();
}
