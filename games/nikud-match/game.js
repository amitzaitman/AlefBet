/**
 * משחק לימוד ניקוד - גרסה פשוטה לילדים
 * אות עם ניקוד במרכז, שני סמלי ניקוד בצדדים - גוררים את האות לצד הנכון
 * 8 סיבובים
 */
import {
  runGame,
  nikudList,
  nikudBaseLetters,
  letterWithNikud,
  animate,
  sounds,
  randomNikud,
  showNikudSettingsDialog,
  injectHeaderButton,
  createNikudBox,
  createDragSource,
  createDropTarget,
  speakSyllable,
} from '../../framework/dist/runtime.js';

const ROUNDS = 8;

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
  return runGame(container, {
    gameId: 'nikud-match',
    title: 'לִמּוּד נִיקּוּד',
    preloadTexts: STATIC_TEXTS,
    loadingMessage: 'טוֹעֵן נִיקּוּד...',
    defaultRounds: randomNikud(ROUNDS).map(n => ({ target: pickLetter(), correct: n.id, correctEmoji: '' })),
    transitionMs: 800,
    playCorrectSound: false,
    onReplay: () => startGame(container),
    onStart: () => injectHeaderButton(container, '⚙️', 'הגדרות', () => showNikudSettingsDialog(container, startGame)),
    editor: {
      type: 'drag-match',
      content: {
        version: 1,
        createRound: () => ({ target: nikudBaseLetters[0], correct: nikudList[0].id, correctEmoji: '' }),
        validateRound: round => nikudBaseLetters.includes(round.target)
          && nikudList.some(n => n.id === round.correct || n.name === round.correct),
      },
      title: 'לימוד ניקוד',
      restartGame: startGame,
    },
    buildRound: ({ shell, round, onCorrect, isAnswered, subscribeAnswered, scope }) => {
      const targetNikud = nikudList.find(n => n.id === round.correct || n.name === round.correct) || randomNikud(1)[0];
      const letter = round.target || pickLetter();
      const distractor = pickDistractor(targetNikud, nikudList);
      const choices = Math.random() < 0.5 ? [targetNikud, distractor] : [distractor, targetNikud];
      let selected = false;
      let cancelDemo = () => {};

      const stage = document.createElement('div');
      stage.className = 'nm-stage';
      const instruction = document.createElement('p');
      instruction.className = 'game-instruction';
      instruction.textContent = 'בַּחֲרוּ אֶת הָאוֹת וְאָז אֶת הַנִּיקּוּד';
      stage.appendChild(instruction);

      const help = document.createElement('button');
      help.type = 'button';
      help.className = 'nm-help';
      help.textContent = 'אֶפְשָׁר גַּם לִגְרֹר — הַרְאוּ לִי';
      stage.appendChild(help);

      const status = document.createElement('p');
      status.className = 'nm-status';
      status.setAttribute('role', 'status');
      status.textContent = 'לַחֲצוּ עַל הָאוֹת';
      stage.appendChild(status);

      const arena = document.createElement('div');
      arena.className = 'nm-arena';
      stage.appendChild(arena);
      shell.bodyEl.appendChild(stage);

      const letterEl = document.createElement('button');
      letterEl.type = 'button';
      letterEl.className = 'nm-letter';
      letterEl.textContent = letterWithNikud(letter, targetNikud.symbol);
      letterEl.setAttribute('aria-label', `בְּחִירַת הָאוֹת ${letterEl.textContent}`);
      letterEl.setAttribute('aria-pressed', 'false');
      const center = document.createElement('div');
      center.className = 'nm-center';
      center.appendChild(letterEl);

      const zones = choices.map((nikud, i) => {
        const zone = document.createElement('button');
        zone.type = 'button';
        zone.className = `nm-zone nm-zone--${i === 0 ? 'left' : 'right'}`;
        zone.dataset.nikud = nikud.id;
        zone.setAttribute('aria-label', nikud.nameNikud || nikud.name);
        zone.style.setProperty('--zone-color', nikud.color);
        zone.appendChild(createNikudBox(nikud));
        return zone;
      });
      arena.append(zones[0], center, zones[1]);
      const correctZone = zones[choices.findIndex(n => n.id === targetNikud.id)];

      function selectLetter() {
        if (isAnswered()) return;
        cancelDemo();
        selected = !selected;
        letterEl.setAttribute('aria-pressed', String(selected));
        status.textContent = selected ? 'עַכְשָׁיו בַּחֲרוּ אֶת הַנִּיקּוּד' : 'לַחֲצוּ עַל הָאוֹת';
      }

      function answer(zone) {
        if (isAnswered()) return;
        cancelDemo();
        if (zone === correctZone) {
          void onCorrect(() => {
            status.textContent = 'כָּל הַכָּבוֹד!';
            zone.classList.add('nm-zone--correct');
            letterEl.classList.add('nm-letter--correct');
            if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
              const from = letterEl.getBoundingClientRect();
              const to = zone.getBoundingClientRect();
              letterEl.style.transition = 'transform 0.3s ease';
              letterEl.style.transform = `translate(${to.left + to.width / 2 - from.left - from.width / 2}px, ${to.top + to.height / 2 - from.top - from.height / 2}px) scale(0.7)`;
            }
            animate(zone, 'bounce');
            sounds.correct();
            void speakSyllable(letter, targetNikud.id, { signal: scope.signal });
          });
        } else {
          status.textContent = 'נַסּוּ אֶת הַנִּיקּוּד הָאַחֵר';
          animate(letterEl, 'pulse');
          scope.schedule(() => { if (!isAnswered()) animate(correctZone, 'pulse'); }, 700);
        }
      }

      scope.use(createDragSource(letterEl, { letter, targetNikud }, { onTap: selectLetter }));
      // Pointer taps are handled by the drag helper; native keyboard/AT clicks have detail=0.
      scope.listen(letterEl, 'click', event => { if (event.detail === 0) selectLetter(); });
      scope.listen(letterEl, 'pointerdown', () => cancelDemo());
      zones.forEach(zone => {
        scope.use(createDropTarget(zone, () => answer(zone)));
        scope.listen(zone, 'click', () => {
          if (isAnswered()) return;
          if (selected) answer(zone);
          else { status.textContent = 'קֹדֶם בַּחֲרוּ אֶת הָאוֹת'; animate(letterEl, 'pulse'); }
        });
      });
      subscribeAnswered(locked => {
        letterEl.disabled = locked;
        help.disabled = locked;
        zones.forEach(zone => { zone.disabled = locked; });
      });

      scope.listen(help, 'click', () => {
        if (isAnswered()) return;
        cancelDemo();
        status.textContent = 'גִּרְרוּ אֶת הָאוֹת לַנִּיקּוּד הַמַּתְאִים';
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
          correctZone.focus();
          return;
        }
        const from = letterEl.getBoundingClientRect();
        const to = correctZone.getBoundingClientRect();
        const ghost = letterEl.cloneNode(true);
        ghost.disabled = true;
        ghost.setAttribute('aria-hidden', 'true');
        ghost.removeAttribute('aria-pressed');
        ghost.className = 'nm-letter nm-demo';
        Object.assign(ghost.style, {
          position: 'fixed', left: `${from.left}px`, top: `${from.top}px`,
          width: `${from.width}px`, height: `${from.height}px`,
        });
        document.body.appendChild(ghost);
        const animation = ghost.animate([
          { transform: 'translate(0, 0)', opacity: 0.8 },
          { transform: `translate(${to.left + to.width / 2 - from.left - from.width / 2}px, ${to.top + to.height / 2 - from.top - from.height / 2}px) scale(0.7)`, opacity: 0 },
        ], { duration: 1200, easing: 'ease-in-out', fill: 'forwards' });
        const cancelTimer = scope.schedule(() => cancelDemo(), 1250);
        cancelDemo = () => { cancelTimer(); animation.cancel(); ghost.remove(); };
      });
      scope.use(() => cancelDemo());
    },
  });
}
