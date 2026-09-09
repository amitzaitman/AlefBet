export { attachGameAudio }   from '../audio/game-audio.js';
export { tts }    from '../audio/tts.js';
export * from './common.js';
/**
 * AlefBet Framework
 * מסגרת משחקים חינוכיים לקריאה וכתיבה בעברית
 */
import '../styles/alefbet.css';

// ===== Core =====

// ===== Audio =====
export { createVowelDetector, matchNikudVowel, classifyFormants, extractFormantsFromSpectrum, VOWEL_TEMPLATES, NIKUD_VOWEL } from '../audio/vowel-detector.js';
export { createVoiceRecorder, isVoiceRecordingSupported } from '../audio/voice-recorder.js';
export { saveVoice, loadVoice, deleteVoice, listVoiceKeys, playVoice, hasVoice } from '../audio/voice-store.js';
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

// ===== UI =====
export { showNikudSettingsDialog } from '../ui/nikud-settings.js';
export { createZonePlayer }        from '../ui/zone-player.js';
export { createNikudBox }          from '../ui/nikud-box.js';
export { nikudGlyphSvg, NIKUD_GLYPH_IDS } from '../ui/nikud-glyphs.js';
export { createVoiceRecordButton } from '../ui/voice-record-button.js';

// ===== Render =====

// ===== Input =====

// ===== Utils =====
export { addNikud, getNikud, preloadNikud, isVowelized } from '../utils/nakdan.js';
