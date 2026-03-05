/**
 * משחק לימוד ניקוד — גרסה חדשה
 * אות עם ניקוד במרכז, שני סמלי ניקוד בצדדים — גרור או הקש על הצד הנכון
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
} from '../../framework/dist/alefbet.js';

const STATIC_TEXTS = [
  'גְּרֹור אֶת הָאוֹת לַנִּיקּוּד הַנָּכוֹן',
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

function hitTest(el, x, y) {
  const r = el.getBoundingClientRect();
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
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
    } else {
      url.searchParams.delete('allowedNikud');
    }
    url.searchParams.delete('excludedNikud');

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
    spacer.querySelector('button').onclick = () => showSettingsDialog(container);
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

    // Center letter (draggable)
    const centerArea = document.createElement('div');
    centerArea.className = 'nm-center';

    const instruction = document.createElement('p');
    instruction.className = 'nm-instruction';
    instruction.textContent = getNikud('גְּרֹור אֶת הָאוֹת לַנִּיקּוּד הַנָּכוֹן');
    centerArea.appendChild(instruction);

    const letterEl = document.createElement('div');
    letterEl.className = 'nm-letter';
    letterEl.textContent = letterWithNikud(letter, targetNikud.symbol);
    centerArea.appendChild(letterEl);
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

    // ── Drag logic (pointer events) ──
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let letterStartRect = null;

    letterEl.addEventListener('pointerdown', (e) => {
      if (answered) return;
      e.preventDefault();
      letterEl.setPointerCapture(e.pointerId);
      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      letterStartRect = letterEl.getBoundingClientRect();
      letterEl.classList.add('nm-letter--dragging');
    });

    letterEl.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      e.preventDefault();
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      letterEl.style.transform = `translate(${dx}px, ${dy}px)`;

      // Highlight zone under pointer
      const overLeft = hitTest(leftZone, e.clientX, e.clientY);
      const overRight = hitTest(rightZone, e.clientX, e.clientY);
      leftZone.classList.toggle('nm-zone--hover', overLeft);
      rightZone.classList.toggle('nm-zone--hover', overRight);
    });

    letterEl.addEventListener('pointerup', (e) => {
      if (!dragging) return;
      dragging = false;
      letterEl.classList.remove('nm-letter--dragging');
      leftZone.classList.remove('nm-zone--hover');
      rightZone.classList.remove('nm-zone--hover');

      // Check which zone the pointer is over
      const overLeft = hitTest(leftZone, e.clientX, e.clientY);
      const overRight = hitTest(rightZone, e.clientX, e.clientY);

      if (overLeft) {
        const isCorrect = leftNikud.id === targetNikud.id;
        handleDrop(isCorrect, letter, targetNikud, letterEl, leftZone);
      } else if (overRight) {
        const isCorrect = rightNikud.id === targetNikud.id;
        handleDrop(isCorrect, letter, targetNikud, letterEl, rightZone);
      } else {
        // Snap back
        snapBack(letterEl);
      }
    });

    letterEl.addEventListener('pointercancel', () => {
      dragging = false;
      letterEl.classList.remove('nm-letter--dragging');
      snapBack(letterEl);
      leftZone.classList.remove('nm-zone--hover');
      rightZone.classList.remove('nm-zone--hover');
    });

    // Tap-to-select fallback for zones
    leftZone.addEventListener('click', () => {
      if (answered || dragging) return;
      const isCorrect = leftNikud.id === targetNikud.id;
      handleDrop(isCorrect, letter, targetNikud, letterEl, leftZone);
    });

    rightZone.addEventListener('click', () => {
      if (answered || dragging) return;
      const isCorrect = rightNikud.id === targetNikud.id;
      handleDrop(isCorrect, letter, targetNikud, letterEl, rightZone);
    });

    tts.speak(targetNikud.nameNikud);
  }

  function snapBack(letterEl) {
    letterEl.style.transition = 'transform 0.3s ease';
    letterEl.style.transform = '';
    setTimeout(() => { letterEl.style.transition = ''; }, 300);
  }

  async function handleDrop(isCorrect, letter, targetNikud, letterEl, zone) {
    if (answered) return;
    answered = true;

    if (isCorrect) {
      zone.classList.add('nm-zone--correct');
      letterEl.classList.add('nm-letter--correct');
      // Animate letter into the zone
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
      await new Promise(r => setTimeout(r, 300));
      snapBack(letterEl);
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
