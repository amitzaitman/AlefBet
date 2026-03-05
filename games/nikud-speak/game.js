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
  showNikudSettingsDialog,
  showLoadingScreen,
  hideLoadingScreen,
  injectHeaderButton,
} from '../../framework/dist/alefbet.js';

// ── Texts to preload ──────────────────────────────────────────────────────
const STATIC_TEXTS = [
  'בְּרוּכִים הַבָּאִים! אֱמוֹר אֶת הַנִּיקּוּד',
  'כָּל הַכָּבוֹד',
  'נַסֵּה שׁוּב! הַקְשֵׁב לַצְּלִיל',
  'הַמִּשְׂחָק דּוֹרֵשׁ דַּפְדְּפָן Chrome',
  ...nikudList.map(n => n.name),
];

// ── Game ──────────────────────────────────────────────────────────────────

export async function startGame(container) {
  showLoadingScreen(container, 'טוֹעֵן נִיקּוּד...');

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

  hideLoadingScreen(container);

  const roundNikud = randomNikud(8);

  const shell = new GameShell(container, {
    totalRounds: 8,
    title: 'אֱמוֹר אֶת הַנִּיקּוּד',
  });

  // Inject Settings button into header spacer
  injectHeaderButton(container, '⚙️', 'הגדרות', () => showNikudSettingsDialog(container, startGame));

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
    card.className = 'nikud-speak-card anim-appear';
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
