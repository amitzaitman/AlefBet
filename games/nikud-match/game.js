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
  randomNikud,
} from '../../framework/dist/alefbet.js';

// ── Texts to preload ──────────────────────────────────────────────────────

const STATIC_TEXTS = [
  'גְּרֹוֽר לְאוֹת עִם אוֹתוֹ נִיֽקּוּד:',
  'גְּרֹוֽר אוֹתִי',
  'בְּרוּכִים הַבָּאִים לְמִשְׂחַק הַנִּיֽקּוּד',
  'כָּל הַכָּבוֹד',
  'נַסֵּה שׁוּב',
  'מָצָא אֶת',
  ...nikudList.map(n => n.name),
];

// ── Helpers ───────────────────────────────────────────────────────────────

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function buildRound(targetNikud) {
  const letters = shuffle(nikudBaseLetters).slice(0, 4);

  // Create distractors using the CURRENT filtered pool, or global pool
  // It's better to distract with the currently selected pool or the whole list.
  // We'll use the whole list so options are varied, but correct is always from filtered pool.
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

// ── Settings Dialog ───────────────────────────────────────────────────────
function showSettingsDialog(container) {
  let modal = document.getElementById('nikud-settings');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'nikud-settings';
    Object.assign(modal.style, {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 9999,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    });
    document.body.appendChild(modal);
  }

  const searchParams = new URLSearchParams(window.location.search);
  const allowed = searchParams.get('allowedNikud') ? searchParams.get('allowedNikud').split(',') : [];

  let content = `
    <div style="background:white; padding:1.5rem; border-radius:1rem; min-width:300px; text-align:center; color:#333; font-family:Heebo,Arial; direction:rtl;">
      <h2 style="margin-top:0">בחר ניקוד</h2>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin:1rem 0; text-align:right;">
  `;

  nikudList.forEach(n => {
    const isChecked = allowed.length === 0 || allowed.includes(n.id) || allowed.includes(n.name);
    content += `
      <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
        <input type="checkbox" value="${n.id}" class="nikud-filter-cb" ${isChecked ? 'checked' : ''} style="width:1.2rem;height:1.2rem;">
        <span>${n.nameNikud}</span>
      </label>
    `;
  });

  content += `
      </div>
      <button id="save-settings-btn" style="padding:0.5rem 1rem; border-radius:0.5rem; background:#4f67ff; color:white; border:none; font-size:1.1rem; cursor:pointer;">שמור והתחל מחדש</button>
      <button id="close-settings-btn" style="padding:0.5rem 1rem; border-radius:0.5rem; background:#ddd; color:#333; border:none; font-size:1.1rem; cursor:pointer; margin-right:0.5rem;">ביטול</button>
    </div>
  `;

  modal.innerHTML = content;
  modal.style.display = 'flex';

  document.getElementById('save-settings-btn').onclick = () => {
    const checked = Array.from(modal.querySelectorAll('.nikud-filter-cb'))
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    const url = new URL(window.location);
    if (checked.length > 0 && checked.length < nikudList.length) {
      url.searchParams.set('allowedNikud', checked.join(','));
      url.searchParams.delete('excludedNikud');
    } else {
      url.searchParams.delete('allowedNikud');
      url.searchParams.delete('excludedNikud');
    }

    modal.style.display = 'none';
    window.history.replaceState({}, '', url);
    startGame(container);
  };

  document.getElementById('close-settings-btn').onclick = () => {
    modal.style.display = 'none';
  };
}

// ── Game ──────────────────────────────────────────────────────────────────

export async function startGame(container) {
  container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:100dvh;font-family:Heebo,Arial;font-size:1.2rem;color:#4f67ff;direction:rtl;">טוֹעֵן נִיֽקּוּד...</div>';

  await preloadNikud(STATIC_TEXTS);

  container.innerHTML = '';

  const roundNikud = randomNikud(8);

  const shell = new GameShell(container, {
    totalRounds: 8,
    title: 'לִמּוּד נִיֽקּוּד',
  });

  // Inject Settings button into header spacer
  const spacer = container.querySelector('.game-header__spacer');
  if (spacer) {
    spacer.innerHTML = '<button style="background:none;border:none;font-size:1.5rem;cursor:pointer;" aria-label="הגדרות">⚙️</button>';
    spacer.querySelector('button').onclick = () => showSettingsDialog(container);
  }

  let progressBar = null;
  let feedback = null;
  let dragSource = null;
  let dropTargets = [];
  let roundIndex = 0;
  let answered = false;

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
    instruction.textContent = getNikud('גְּרֹוֽר לְאוֹת עִם אוֹתוֹ נִיֽקּוּד:');
    leftPanel.appendChild(instruction);

    const dragCard = document.createElement('div');
    dragCard.className = 'nikud-drag-card';
    dragCard.style.setProperty('--nikud-color', targetNikud.color);
    dragCard.innerHTML = `
      <div class="nikud-drag-card__symbol">${letterWithNikud('א', targetNikud.symbol)}</div>
      <div class="nikud-drag-card__name">${targetNikud.nameNikud}</div>
      <div class="nikud-drag-card__hint">${getNikud('גְּרֹוֽר אוֹתִי')} 👆</div>
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
      card.setAttribute('aria-label', `${opt.letter} עַם ${opt.nikud.nameNikud}`);
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
    tts.speak(`${getNikud('מָצָא אֶת')} ${targetNikud.nameNikud}`);
  }

  async function onDrop(option, targetNikud, dragCard, dropCard) {
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
      await tts.speak(letterWithNikud('א', option.nikud.symbol));

      shell.state.addScore(1);
      progressBar?.update(shell.state.currentRound);
      roundIndex++;
      const hasMore = shell.state.nextRound();
      if (hasMore && roundIndex < roundNikud.length) {
        buildRoundUI(roundNikud[roundIndex]);
      } else {
        showCompletionScreen(container, shell.state.score, 8, () => startGame(container));
      }

    } else {
      dropCard.classList.add('nikud-letter-card--wrong');
      animate(dropCard, 'shake');
      sounds.wrong();
      await tts.speak(getNikud('נַסֵּה שׁוּב'));
      await new Promise(r => setTimeout(r, 200));

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
    }
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────

  shell.on('start', () => {
    shell.footerEl.innerHTML = '';
    progressBar = createProgressBar(shell.footerEl, 8);
    progressBar.update(0);
    roundIndex = 0;
    tts.speak(getNikud('בְּרוּכִים הַבָּאִים לְמִשְׂחַק הַנִּיֽקּוּד'));
    buildRoundUI(roundNikud[0]);
  });

  shell.start();
}
