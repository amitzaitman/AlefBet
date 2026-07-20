/**
 * אולפן הצלילים - כלי מורה/הורה להקלטת בנק הצלילים של הפלטפורמה.
 *
 * המורה מקליטה פעם אחת את שמות האותיות, צלילי הניקוד וההברות; ההקלטות
 * נשמרות ב-IndexedDB במכשיר (ללא רשת, ללא שרת) וכל המשחקים משמיעים
 * אותן אוטומטית לפני כל מקור קול אחר. כפתור "האזנה" משמיע את מה
 * שהילד ישמע בפועל כרגע (הקלטה / TTS / סינתזה) כדי שהמורה תדע
 * בדיוק מה חסר.
 */
import {
  SOUND_BANK_ID,
  standardSoundKeys,
  recordedKeys,
  speakLetter,
  speakNikudSound,
  speakSyllable,
  createVoiceRecordButton,
  isVoiceRecordingSupported,
  tts,
} from '../../framework/dist/alefbet.js';

const GROUPS = [
  { id: 'letters',   title: 'שְׁמוֹת הָאוֹתִיּוֹת',  hint: 'הַקְלִיטוּ אֶת שֵׁם הָאוֹת, לְמָשָׁל: "בֵּית"' },
  { id: 'nikud',     title: 'צְלִילֵי הַנִּיקּוּד',  hint: 'הַקְלִיטוּ אֶת צְלִיל הַתְּנוּעָה, לְמָשָׁל: "אָהּ"' },
  { id: 'syllables', title: 'הֲבָרוֹת',            hint: 'הַקְלִיטוּ אֶת הַהֲבָרָה כְּפִי שֶׁקּוֹרְאִים אוֹתָהּ, לְמָשָׁל: "בָּא"' },
];

/**
 * משמיע למורה את מה שהילד ישמע כרגע עבור מפתח נתון,
 * דרך אותה שרשרת ספקים שהמשחקים משתמשים בה.
 * @param {string} key
 */
function previewSound(key) {
  const [kind, a, b] = key.split(':');
  if (kind === 'letter') return speakLetter(a);
  if (kind === 'nikud') return speakNikudSound(a);
  if (kind === 'syllable') return speakSyllable(a, b);
  return Promise.resolve('none');
}

export async function startStudio(container) {
  container.innerHTML = '';
  container.className = 'studio';

  // שחרור אודיו בלחיצה ראשונה (מדיניות autoplay).
  container.addEventListener('pointerdown', () => { try { tts.unlock?.(); } catch { /* noop */ } }, { once: true, capture: true });

  const allKeys = standardSoundKeys();
  let recorded = new Set(await recordedKeys());

  // ── כותרת והתקדמות ──
  const header = document.createElement('header');
  header.className = 'studio__header';
  header.innerHTML = `
    <a class="studio__back" href="../../index.html" aria-label="חזרה לספרייה">→</a>
    <div>
      <h1 class="studio__title">🎙️ אֻלְפַּן הַצְּלִילִים</h1>
      <p class="studio__subtitle">
        הַקְלִיטוּ פַּעַם אַחַת אֶת הַצְּלִילִים בְּקוֹלְכֶם — וְכָל הַמִּשְׂחָקִים יַשְׁמִיעוּ אוֹתָם,
        גַּם לְלֹא אִינְטֶרְנֶט.
      </p>
    </div>
    <div class="studio__progress" role="status"></div>
  `;
  container.appendChild(header);
  const progressEl = header.querySelector('.studio__progress');

  function updateProgress() {
    const done = allKeys.filter(k => recorded.has(k.key)).length;
    progressEl.textContent = `הֻקְלְטוּ ${done} מִתּוֹךְ ${allKeys.length}`;
    progressEl.classList.toggle('studio__progress--done', done === allKeys.length);
  }
  updateProgress();

  if (!isVoiceRecordingSupported()) {
    const note = document.createElement('p');
    note.className = 'studio__unsupported';
    note.textContent = 'הַדַּפְדְּפָן הַזֶּה אֵינוֹ תּוֹמֵךְ בְּהַקְלָטָה. אֶפְשָׁר עֲדַיִן לְהַאֲזִין לַצְּלִילִים הַקַּיָּמִים.';
    container.appendChild(note);
  }

  // ── קבוצות ──
  for (const group of GROUPS) {
    const items = allKeys.filter(k => k.group === group.id);

    const section = document.createElement('section');
    section.className = 'studio__section';

    const groupDone = () => items.filter(i => recorded.has(i.key)).length;
    const heading = document.createElement('div');
    heading.className = 'studio__section-head';
    heading.innerHTML = `
      <h2 class="studio__section-title">${group.title}
        <span class="studio__section-count"></span>
      </h2>
      <p class="studio__section-hint">${group.hint}</p>
    `;
    section.appendChild(heading);
    const countEl = heading.querySelector('.studio__section-count');

    const updateCount = () => { countEl.textContent = `(${groupDone()}/${items.length})`; };
    updateCount();

    const grid = document.createElement('div');
    grid.className = 'studio__grid';
    section.appendChild(grid);

    for (const item of items) {
      const card = document.createElement('div');
      card.className = 'studio__card';
      card.classList.toggle('studio__card--recorded', recorded.has(item.key));

      const label = document.createElement('div');
      label.className = 'studio__card-label';
      label.textContent = item.label;
      card.appendChild(label);

      const listenBtn = document.createElement('button');
      listenBtn.type = 'button';
      listenBtn.className = 'studio__listen';
      listenBtn.title = 'הַאֲזִינוּ לְמַה שֶּׁהַיֶּלֶד יִשְׁמַע';
      listenBtn.setAttribute('aria-label', `האזנה: ${item.label}`);
      listenBtn.textContent = '🔊';
      listenBtn.addEventListener('click', async () => {
        listenBtn.disabled = true;
        const source = await previewSound(item.key);
        listenBtn.disabled = false;
        // חיווי עדין על מקור הצליל: הקלטה שלכם / קול מחשב.
        card.dataset.source = source;
      });
      card.appendChild(listenBtn);

      const recordWrap = document.createElement('div');
      recordWrap.className = 'studio__record';
      card.appendChild(recordWrap);

      createVoiceRecordButton(recordWrap, {
        gameId: SOUND_BANK_ID,
        voiceKey: item.key,
        label: `הקלטה: ${item.label}`,
        onSaved: () => {
          recorded.add(item.key);
          card.classList.add('studio__card--recorded');
          updateCount();
          updateProgress();
        },
        onDeleted: () => {
          recorded.delete(item.key);
          card.classList.remove('studio__card--recorded');
          updateCount();
          updateProgress();
        },
      });

      grid.appendChild(card);
    }

    container.appendChild(section);
  }
}
