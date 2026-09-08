import { it, expect } from 'vitest';
import { GameShell } from '../../core/game-shell.js';
import { getAdultTools } from '../../ui/adult-tools.js';
import { injectHeaderButton } from '../../ui/header-button.js';

it('keeps adult controls in one closed menu and supports Escape and settings', () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  new GameShell(host);
  const panel = getAdultTools(host);
  expect(getAdultTools(host)).toBe(panel);
  const editor = document.createElement('button');
  panel.appendChild(editor);
  let opened = false;
  const settings = injectHeaderButton(host, '⚙️', 'הגדרות', () => { opened = true; });
  expect(panel.contains(editor)).toBe(true);
  const menu = host.querySelector('details');
  expect(menu.open).toBe(false);
  menu.open = true;
  settings.click();
  expect(opened).toBe(true);
  expect(menu.open).toBe(false);
  menu.open = true;
  menu.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  expect(menu.open).toBe(false);
  expect(document.activeElement).toBe(menu.querySelector('summary'));
});
