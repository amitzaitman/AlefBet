/**
 * AlefBet Framework
 * מסגרת משחקים חינוכיים לקריאה וכתיבה בעברית
 * ייצוא כל המודולים הזמינים
 */
import './styles/alefbet.css';

// ===== Core =====
export { EventBus } from './core/events.js';
export { GameState } from './core/state.js';
export { GameShell } from './core/game-shell.js';
export { createRoundManager } from './core/round-manager.js';

// ===== Audio =====
export { tts } from './audio/tts.js';
export { sounds } from './audio/sounds.js';

// ===== Audio: Speech Recognition [נוסף על ידי: nikud-speak game] =====
export { createSpeechListener, matchNikudSound } from './audio/speech-recognition.js';

// ===== Data =====
export {
  hebrewLetters,
  getLetter,
  getLettersByGroup,
  randomLetters,
} from './data/hebrew-letters.js';

export {
  nikudList,
  nikudBaseLetters,
  letterWithNikud,
  randomNikud,
} from './data/nikud.js';

// ===== UI [נוסף על ידי: letter-match game] =====
export { createOptionCards } from './ui/option-cards.js';
export { createProgressBar } from './ui/progress-bar.js';
export { createFeedback } from './ui/feedback.js';
export { showCompletionScreen } from './ui/completion-screen.js';
export { showNikudSettingsDialog } from './ui/nikud-settings.js';
export { createZone } from './ui/interactive-zones.js';
export { showLoadingScreen, hideLoadingScreen } from './ui/loading-screen.js';
export { injectHeaderButton } from './ui/header-button.js';
export { createNikudBox } from './ui/nikud-box.js';

// ===== Render [נוסף על ידי: letter-match game] =====
export { animate } from './render/animations.js';

// ===== Input [נוסף על ידי: nikud-match game] =====
export { createDragSource, createDropTarget } from './input/drag.js';

// ===== Utils [נוסף על ידי: nikud support] =====
export { addNikud, getNikud, preloadNikud } from './utils/nakdan.js';
