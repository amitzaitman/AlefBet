/**
 * טעינת כלי העריכה רק בעקבות בקשת המורה; משחק ותוכן שמור זמינים גם בלעדיהם.
 * @param {import('./game-shell.js').GameShell} shell
 * @param {import('./game-data.js').GameData} gameData
 * @param {import('../editor/game-editor.js').GameEditorOptions} options
 */
export function attachLazyEditor(
  shell: import('./game-shell.js').GameShell,
  gameData: import('./game-data.js').GameData,
  options: import('../editor/game-editor.js').GameEditorOptions,
) {
  const host = shell.container.querySelector('.game-header__spacer');
  if (!host) return;
  const toolbar = document.createElement('div');
  toolbar.className = 'ab-lazy-editor';
  const notice = document.createElement('span');
  notice.setAttribute('role', 'status');
  let busy = false;
  let editor = null;

  async function loadStyles() {
    // The compatibility bundle already includes editor styles.
    if (!document.querySelector('link[href$="/runtime.css"]')) return;
    if (document.querySelector('link[data-alefbet-editor]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    const base = new URL('.', import.meta.url);
    link.href = new URL('editor.css', base).href;
    link.dataset.alefbetEditor = '';
    await new Promise<void>((resolve, reject) => {
      link.onload = () => resolve();
      link.onerror = () => { link.remove(); reject(new Error('Editor styles unavailable')); };
      document.head.appendChild(link);
    });
  }

  async function open(mode) {
    if (busy || shell.ended) return;
    busy = true;
    notice.textContent = 'טוֹעֵן...';
    try {
      const [module] = await Promise.all([import('../editor/index.js'), loadStyles()]);
      if (shell.ended) return;
      if (mode === 'audio') {
        module.showAudioManager(gameData.id, gameData);
      } else {
        editor = new module.GameEditor(shell.container, gameData, options);
        // The editor injects its toolbar on the next frame.
        await new Promise(resolve => requestAnimationFrame(resolve));
        if (!shell.ended) editor.enterEditMode();
      }
      notice.textContent = '';
    } catch {
      if (!shell.ended) notice.textContent = 'לֹא הִצְלַחְנוּ לִטְעֹן אֶת הָעוֹרֵךְ. הִתְחַבְּרוּ לָרֶשֶׁת וְנַסּוּ שׁוּב.';
    } finally {
      busy = false;
    }
  }

  for (const [label, mode] of [['✏️ ערוך', 'edit'], ['🎤 קול', 'audio']]) {
    const button = document.createElement('button');
    button.className = 'btn';
    button.textContent = label;
    button.addEventListener('click', () => { void open(mode); });
    toolbar.appendChild(button);
  }
  toolbar.appendChild(notice);
  host.appendChild(toolbar);
  shell.on('end', () => { editor?.destroy(); toolbar.remove(); });
}
