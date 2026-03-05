/**
 * דיאלוג לבחירת ניקוד פעיל
 * [נוסף על ידי: nikud-match ו-nikud-speak]
 */

import { nikudList } from '../data/nikud.js';

/**
 * מציג דיאלוג הגדרות לבחירת ניקוד מותר.
 * שומר את הבחירה ב-URL (query parameter: allowedNikud) ומפעיל את הפונקציה onSave(container).
 * 
 * @param {HTMLElement} container - אלמנט המשחק, מועבר כפרמטר ל-onSave
 * @param {Function} onSave - פונקציה להפעלה מחדש של המשחק (למשל: startGame)
 */
export function showNikudSettingsDialog(container, onSave) {
    let modal = document.getElementById('nikud-settings');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'nikud-settings';
        Object.assign(modal.style, {
            position: 'fixed', top: 0, left: 0, right: '0px', bottom: '0px',
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
        if (onSave) onSave(container);
    };

    document.getElementById('close-settings-btn').onclick = () => {
        modal.style.display = 'none';
    };
}
