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
export { VOWEL_TEMPLATES, NIKUD_VOWEL } from '../data/vowels.js';
export { saveVoice, loadVoice, deleteVoice, listVoiceKeys, playVoice, hasVoice } from '../audio/voice-store.js';
export { isSynthSupported, vowelFormantSpec, consonantOnsetSpec, synthesizeVowel, synthesizeSyllable } from '../audio/phoneme-synth.js';
export {
  SOUND_BANK_ID, letterKey, nikudKey, syllableKey, wordKey,
  standardSoundKeys, keyLabel, isOffline, recordedKeys,
  speakLetter, speakNikudSound, speakSyllable, speakWord,
} from '../audio/hebrew-audio.js';

// ===== Data =====
export { hebrewLetters, getLetter, getLettersByGroup, randomLetters } from '../data/hebrew-letters.js';
export { nikudList, nikudBaseLetters, letterWithNikud, randomNikud }  from '../data/nikud.js';

// ===== UI =====
export { showNikudSettingsDialog } from '../ui/nikud-settings.js';

// ===== Render =====

// ===== Input =====

// ===== Utils =====
