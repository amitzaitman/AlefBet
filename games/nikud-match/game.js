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
    transitionMs: 1800,
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
    buildRound: ({ shell, round, onCorrect, isAnswered, schedule }) => {
      const resources = [];
      function buildRoundUI(targetNikud) {
        shell.bodyEl.innerHTML = '';

        const letter = round.target || pickLetter();
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
        arena.appendChild(rightZone);

        shell.bodyEl.appendChild(arena);

        // גרירה היא אופן האינטראקציה העיקרי: הילד גורר את האות לאזור הניקוד הנכון.
        const correctZone = leftNikud.id === targetNikud.id ? leftZone : rightZone;

        resources.push(createDragSource(letterEl, { letter, targetNikud }));

        resources.push(createDropTarget(leftZone, ({ data }) => {
          handleAnswer(
            leftNikud.id === data.targetNikud.id,
            data.letter, data.targetNikud, letterEl, leftZone, correctZone,
          );
        }));

        resources.push(createDropTarget(rightZone, ({ data }) => {
          handleAnswer(
            rightNikud.id === data.targetNikud.id,
            data.letter, data.targetNikud, letterEl, rightZone, correctZone,
          );
        }));
      }

      async function handleAnswer(isCorrect, letter, targetNikud, letterEl, zone, correctZone) {
        if (isAnswered()) return;

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
          // שרשרת אופליין-תחילה: הקלטת מורה -> קול מערכת -> סינתזת פונמות.
          // חשוב במיוחד באייפון/Safari, שלרוב אין בו קול עברי מותקן כברירת מחדל.
          speakSyllable(letter, targetNikud.id);

          await onCorrect();
        } else {
          // עידוד חיובי בלבד: פעימה עדינה של האות לאישור הלחיצה,
          // ולאחריה רמז עדין על האזור הנכון. ללא סימון שלילי או צליל שגוי.
          animate(letterEl, 'pulse');
          schedule(() => {
            if (!isAnswered()) animate(correctZone, 'pulse');
          }, 700);
        }
      }

      const targetNikud = nikudList.find(n => n.id === round.correct || n.name === round.correct) || randomNikud(1)[0];
      buildRoundUI(targetNikud);
      return () => resources.forEach(resource => resource.destroy());
    },
  });
}
