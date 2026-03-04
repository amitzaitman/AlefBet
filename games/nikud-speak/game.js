/**
 * משחק "אמור את הניקוד"
 * הילד שומע ורואה ניקוד ומדבר אותו למיקרופון
 * 8 סיבובים עם ניקוד שונה בכל פעם
 */
import {
  GameShell,
  tts,
  nikudList,
  letterWithNikud,
  createFeedback,
  createProgressBar,
  showCompletionScreen,
  animate,
  sounds,
  createSpeechListener,
  matchNikudSound,
  preloadNikud,
  getNikud,
  randomNikud,
} from '../../framework/dist/alefbet.js';

// ── Texts to preload ──────────────────────────────────────────────────────
const STATIC_TEXTS = [
  'בְּרוּכִים הַבָּאִים! אֱמוֹר אֶת הַנִּיקּוּד',
  'כָּל הַכָּבוֹד',
  'נַסֵּה שׁוּב! הַקְשֵׁב לַצְּלִיל',
  'הַמִּשְׂחָק דּוֹרֵשׁ דַּפְדְּפָן Chrome',
  ...nikudList.map(n => n.name),
];

// ── Settings Dialog ───────────────────────────────────────────────────────
function showSettingsDialog(container) {
  let modal = document.getElementById('nikud-settings');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'nikud-settings';
    Object.assign(modal.style, {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 9999,
      display: 'flex', justifyContent: 'center', alignItems: 'center',
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
  container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:100dvh;font-family:Heebo,Arial;font-size:1.2rem;color:#4f67ff;direction:rtl;">טוֹעֵן נִיקּוּד...</div>';

  await preloadNikud(STATIC_TEXTS);

  // ── Check speech recognition availability ──
  const listener = createSpeechListener();
  if (!listener.available) {
    container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;min-height:100dvh;font-family:Heebo,Arial;font-size:1.4rem;color:#e53e3e;direction:rtl;text-align:center;padding:2rem;">
        ${getNikud('הַמִּשְׂחָק דּוֹרֵשׁ דַּפְדְּפָן Chrome')}
      </div>
    `;
    return;
  }

  container.innerHTML = '';

  const roundNikud = randomNikud(8);

  const shell = new GameShell(container, {
    totalRounds: 8,
    title: 'אֱמוֹר אֶת הַנִּיקּוּד',
  });

  // Inject Settings button into header spacer
  const spacer = container.querySelector('.game-header__spacer');
  if (spacer) {
    spacer.innerHTML = '<button style="background:none;border:none;font-size:1.5rem;cursor:pointer;" aria-label="הגדרות">⚙️</button>';
    spacer.querySelector('button').onclick = () => showSettingsDialog(container);
  }

  let progressBar = null;
  let feedback = null;
  let roundIndex = 0;
  let failCount = 0;
  let listening = false;

  function buildRoundUI(nikud) {
    failCount = 0;
    listening = false;
    shell.bodyEl.innerHTML = '';

    // ── Main panel ──
    const panel = document.createElement('div');
    panel.className = 'nikud-speak-panel';

    // ── Nikud card ──
    const card = document.createElement('div');
    card.className = 'nikud-speak-card';
    card.style.setProperty('--nikud-color', nikud.color);
    card.innerHTML = `
      <div class="nikud-speak-card__symbol">${letterWithNikud('א', nikud.symbol)}</div>
      <div class="nikud-speak-card__name">${nikud.nameNikud}</div>
    `;
    panel.appendChild(card);

    // ── Demo button (speaker) ──
    const demoBtn = document.createElement('button');
    demoBtn.className = 'demo-btn';
    demoBtn.setAttribute('aria-label', 'הַשְׁמַע צְלִיל');
    demoBtn.innerHTML = '<span class="demo-btn__icon">🔊</span><span class="demo-btn__text">הַקְשֵׁב</span>';
    demoBtn.onclick = () => {
      tts.speak(letterWithNikud('א', nikud.symbol));
    };
    panel.appendChild(demoBtn);

    // ── Mic button ──
    const micBtn = document.createElement('button');
    micBtn.className = 'mic-btn';
    micBtn.setAttribute('aria-label', 'הַקְלֵט');
    micBtn.innerHTML = '<span class="mic-btn__icon">🎤</span><span class="mic-btn__text">לְחַץ וּדְבַּר</span>';
    micBtn.onclick = () => onMicPress(nikud, micBtn);
    panel.appendChild(micBtn);

    // ── Feedback area ──
    const feedbackContainer = document.createElement('div');
    feedbackContainer.className = 'nikud-speak-feedback';
    panel.appendChild(feedbackContainer);
    feedback = createFeedback(feedbackContainer);

    shell.bodyEl.appendChild(panel);

    // Animate card entry
    animate(card, 'fadeIn');

    // Speak the nikud name
    tts.speak(`${nikud.nameNikud}`);
  }

  async function onMicPress(nikud, micBtn) {
    if (listening) return;
    listening = true;

    micBtn.disabled = true;
    micBtn.classList.add('mic-btn--recording');

    const result = await listener.listen(4000);

    micBtn.classList.remove('mic-btn--recording');

    const isMatch = matchNikudSound(result.text, nikud.id);

    if (isMatch) {
      // Correct!
      feedback.correct();
      sounds.correct();
      const card = shell.bodyEl.querySelector('.nikud-speak-card');
      if (card) animate(card, 'bounce');

      shell.state.addScore(1);
      progressBar?.update(shell.state.currentRound);

      setTimeout(() => {
        roundIndex++;
        const hasMore = shell.state.nextRound();
        if (hasMore && roundIndex < roundNikud.length) {
          buildRoundUI(roundNikud[roundIndex]);
        } else {
          showCompletionScreen(container, shell.state.score, 8, () => startGame(container));
        }
      }, 1600);

    } else {
      // Wrong — use hint, never wrong()
      failCount++;

      if (failCount >= 3) {
        // Auto-advance after 3 fails
        feedback.hint(getNikud('הַצְּלִיל הַנָּכוֹן הוּא:'));
        await tts.speak(letterWithNikud('א', nikud.symbol));

        progressBar?.update(shell.state.currentRound);

        setTimeout(() => {
          roundIndex++;
          const hasMore = shell.state.nextRound();
          if (hasMore && roundIndex < roundNikud.length) {
            buildRoundUI(roundNikud[roundIndex]);
          } else {
            showCompletionScreen(container, shell.state.score, 8, () => startGame(container));
          }
        }, 1600);

      } else {
        feedback.hint(getNikud('נַסֵּה שׁוּב! הַקְשֵׁב לַצְּלִיל 🔊'));
        micBtn.disabled = false;
        listening = false;
      }
    }
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────
  shell.on('start', () => {
    shell.footerEl.innerHTML = '';
    progressBar = createProgressBar(shell.footerEl, 8);
    progressBar.update(0);
    roundIndex = 0;
    tts.speak(getNikud('בְּרוּכִים הַבָּאִים! אֱמוֹר אֶת הַנִּיקּוּד'));
    buildRoundUI(roundNikud[0]);
  });

  shell.start();
}
