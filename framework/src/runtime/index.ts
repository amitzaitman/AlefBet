/**
 * AlefBet Framework
 * מסגרת משחקים חינוכיים לקריאה וכתיבה בעברית
 */
import '../styles/alefbet.css';

// ===== Core =====
export { EventBus }          from '../core/events.js';
export { GameState }         from '../core/state.js';
export { GameShell }         from '../core/game-shell.js';
export { endGame }           from '../core/game-shell.js';
export { attachGameAudio }   from '../audio/game-audio.js';
export { shuffle }           from '../utils/shuffle.js';
export { createRoundManager } from '../core/round-manager.js';
export { createLocalState }  from '../core/local-state.js';
export { bootstrapGame }     from '../core/bootstrap.js';
export { runGame }           from '../core/bootstrap.js';
export { createHintTracker } from '../core/hints.js';
export { starsFor, recordGameResult, getGameProgress, getAllProgress } from '../core/progress.js';

// ===== Audio =====
export { tts }    from '../audio/tts.js';
export { sounds } from '../audio/sounds.js';
export { createVowelDetector, matchNikudVowel, classifyFormants, extractFormantsFromSpectrum, VOWEL_TEMPLATES, NIKUD_VOWEL } from '../audio/vowel-detector.js';
export { createVoiceRecorder, isVoiceRecordingSupported } from '../audio/voice-recorder.js';
export { saveVoice, loadVoice, deleteVoice, listVoiceKeys, playVoice, hasVoice } from '../audio/voice-store.js';
export { getAudioContext, unlockAudioOutput, ensureAudioRunning, playBlob } from '../audio/audio-context.js';
export { isSynthSupported, vowelFormantSpec, consonantOnsetSpec, synthesizeVowel, synthesizeSyllable } from '../audio/phoneme-synth.js';
export {
  SOUND_BANK_ID, letterKey, nikudKey, syllableKey, wordKey,
  standardSoundKeys, keyLabel, isOffline, recordedKeys,
  speakLetter, speakNikudSound, speakSyllable, speakWord,
} from '../audio/hebrew-audio.js';
export { resolveTtsProxyUrl, compileTextForKey, compileSoundBank } from '../audio/sound-bank-compiler.js';

// ===== Data =====
export { hebrewLetters, getLetter, getLettersByGroup, randomLetters } from '../data/hebrew-letters.js';
export { nikudList, nikudBaseLetters, letterWithNikud, randomNikud }  from '../data/nikud.js';
export { PRAISE_PHRASES, RETRY_HINTS, randomPraise, randomRetryHint } from '../data/encouragement.js';

// ===== UI =====
export { createOptionCards }       from '../ui/option-cards.js';
export { createProgressBar }       from '../ui/progress-bar.js';
export { createFeedback }          from '../ui/feedback.js';
export { showCompletionScreen }    from '../ui/completion-screen.js';
export { showNikudSettingsDialog } from '../ui/nikud-settings.js';
export { createZone }              from '../ui/interactive-zones.js';
export { createZonePlayer }        from '../ui/zone-player.js';
export { showLoadingScreen, hideLoadingScreen } from '../ui/loading-screen.js';
export { injectHeaderButton }      from '../ui/header-button.js';
export { createNikudBox }          from '../ui/nikud-box.js';
export { nikudGlyphSvg, NIKUD_GLYPH_IDS } from '../ui/nikud-glyphs.js';
export { createVoiceRecordButton } from '../ui/voice-record-button.js';
export { mountAudioStatusBanner } from '../ui/audio-status-banner.js';
export { installGlobalErrorScreen } from '../ui/error-screen.js';

// ===== Render =====
export { animate } from '../render/animations.js';

// ===== Input =====
export { createDragSource, createDropTarget } from '../input/drag.js';

// ===== Utils =====
export { addNikud, getNikud, preloadNikud, isVowelized } from '../utils/nakdan.js';
