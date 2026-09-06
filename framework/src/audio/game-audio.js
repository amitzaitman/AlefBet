import { tts } from './tts.js';
import { mountAudioStatusBanner } from '../ui/audio-status-banner.js';

/**
 * חיבור שמע למשחק; הסיום מסיר מאזינים ומבטל דיבור ממתין.
 * @param {import('../core/game-shell.js').GameShell} shell
 * @param {{ banner?: boolean }} [options]
 */
export function attachGameAudio(shell, { banner = true } = {}) {
  const status = banner ? mountAudioStatusBanner(shell.container) : null;
  const unlock = () => {
    shell.container.removeEventListener('pointerdown', unlock, true);
    shell.container.removeEventListener('keydown', unlock, true);
    tts.unlock();
  };
  shell.container.addEventListener('pointerdown', unlock, { once: true, capture: true });
  shell.container.addEventListener('keydown', unlock, { once: true, capture: true });
  shell.on('end', () => {
    shell.container.removeEventListener('pointerdown', unlock, true);
    shell.container.removeEventListener('keydown', unlock, true);
    status?.destroy();
    tts.cancel();
  });
}
