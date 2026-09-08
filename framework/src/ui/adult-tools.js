/** תפריט משותף לכלי המבוגר, מחוץ למסלול המשחק של הילד. */
export function getAdultTools(container) {
  let panel = container.querySelector('.adult-tools__panel');
  if (panel) return panel;
  const header = container.querySelector('.game-header');
  if (!header) return null;
  const menu = document.createElement('details');
  menu.className = 'adult-tools';
  menu.innerHTML = '<summary aria-label="להורים ולמורים">☰<span>למבוגרים</span></summary><div class="adult-tools__panel"><p>להורים ולמורים</p></div>';
  menu.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      menu.open = false;
      menu.querySelector('summary').focus();
      event.stopPropagation();
    }
  });
  header.appendChild(menu);
  return menu.querySelector('.adult-tools__panel');
}
