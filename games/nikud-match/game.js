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
} from '../../framework/dist/alefbet.js';

// ── Helpers ───────────────────────────────────────────────────────────────

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

/** Build 4 options: one correct nikud + 3 random distractors, each on a different letter */
function buildRound(targetNikud) {
  // Pick 4 different base letters
  const letters = shuffle(nikudBaseLetters).slice(0, 4);

  // Pick 3 distractors (different from target)
  const distractors = shuffle(nikudList.filter(n => n.id !== targetNikud.id)).slice(0, 3);

  // Assign nikud to letters: one correct, three distractor
  const correctIndex = Math.floor(Math.random() * 4);
  const nikudAssigned = distractors.slice();
  nikudAssigned.splice(correctIndex, 0, targetNikud);

  return letters.map((letter, i) => ({
    letter,
    nikud: nikudAssigned[i],
    isCorrect: i === correctIndex,
    display: letterWithNikud(letter, nikudAssigned[i].symbol),
  }));
}

// ── Game ──────────────────────────────────────────────────────────────────

export function startGame(container) {
  // Pick 8 random nikud marks for the rounds (shuffle, take 8, loop if needed)
  const roundNikud = shuffle([...nikudList, ...nikudList]).slice(0, 8);

  const shell = new GameShell(container, {
    totalRounds: 8,
    title: 'לימוד ניקוד',
  });

  let progressBar    = null;
  let feedback       = null;
  let dragSource     = null;
  let dropTargets    = [];
  let roundIndex     = 0;
  let answered       = false;

  function buildRoundUI(targetNikud) {
    answered = false;
    shell.bodyEl.innerHTML = '';

    // Clean up previous drag/drop handlers
    dragSource?.destroy();
    dropTargets.forEach(d => d.destroy());
    dropTargets = [];

    const options = buildRound(targetNikud);

    // ── Left panel: draggable nikud ──
    const leftPanel = document.createElement('div');
    leftPanel.className = 'nikud-panel nikud-panel--source';

    const instruction = document.createElement('p');
    instruction.className = 'game-instruction';
    instruction.textContent = 'גרור לאות עם אותו ניקוד:';
    leftPanel.appendChild(instruction);

    const dragCard = document.createElement('div');
    dragCard.className = 'nikud-drag-card';
    dragCard.style.setProperty('--nikud-color', targetNikud.color);
    dragCard.innerHTML = `
      <div class="nikud-drag-card__symbol">${letterWithNikud('א', targetNikud.symbol)}</div>
      <div class="nikud-drag-card__name">${targetNikud.name}</div>
      <div class="nikud-drag-card__hint">גרור אותי 👆</div>
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
      card.innerHTML = `<span class="nikud-letter-card__text">${opt.display}</span>`;
      card.setAttribute('aria-label', `${opt.letter} עם ${opt.nikud.name}`);

      const dt = createDropTarget(card, () => onDrop(opt, targetNikud, dragCard, card));
      dropTargets.push(dt);

      // Also support click-to-place (for touch)
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

    // Set up drag source
    dragSource = createDragSource(dragCard, { nikudId: targetNikud.id });

    // Speak the nikud name on round start
    tts.speak(`מצא את ${targetNikud.name}`);
  }

  function onDrop(option, targetNikud, dragCard, dropCard) {
    if (answered) return;
    answered = true;

    // Clean up drag
    dragSource?.destroy();
    dragSource = null;
    dropTargets.forEach(d => d.destroy());
    dropTargets = [];

    if (option.isCorrect) {
      // Correct!
      dropCard.classList.add('nikud-letter-card--correct');
      dragCard.classList.add('nikud-drag-card--correct');
      animate(dropCard, 'bounce');
      sounds.correct();
      tts.speak(`!כל הכבוד — ${targetNikud.name} — ${option.display}`);

      setTimeout(() => {
        shell.state.addScore(1);
        progressBar?.update(shell.state.currentRound);
        const hasMore = shell.state.nextRound();
        roundIndex++;
        if (hasMore && roundIndex < roundNikud.length) {
          buildRoundUI(roundNikud[roundIndex]);
        } else {
          showCompletionScreen(container, shell.state.score, 8, () => startGame(container));
        }
      }, 1800);

    } else {
      // Wrong
      dropCard.classList.add('nikud-letter-card--wrong');
      animate(dropCard, 'shake');
      sounds.wrong();
      tts.speak('נסה שוב');

      setTimeout(() => {
        dropCard.classList.remove('nikud-letter-card--wrong');
        answered = false;
        // Re-attach drag source and drop targets
        dragSource = createDragSource(dragCard, { nikudId: targetNikud.id });
        const allCards = shell.bodyEl.querySelectorAll('.nikud-letter-card');
        const options = buildRound(targetNikud); // rebuild to reassign
        allCards.forEach((card, i) => {
          // Re-find option by display text
          const dt = createDropTarget(card, () => {
            const optDisplay = card.querySelector('.nikud-letter-card__text')?.textContent;
            const matchedOpt = options.find(o => o.display === optDisplay);
            if (matchedOpt) onDrop(matchedOpt, targetNikud, dragCard, card);
          });
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
    tts.speak('ברוכים הבאים למשחק הניקוד');
  });

  shell.start();
}
