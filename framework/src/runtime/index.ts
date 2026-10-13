/**
 * API למשחקי עברית: כל מה שב-common, ובנוסף שמע עברי, נתוני אותיות וניקוד,
 * ובנק הצלילים של אולפן ההקלטה. כמו common, מייצא רק מה שמשחקים משתמשים בו.
 */
import '../styles/alefbet.css';

export * from './common.js';

export { tts }                                  from '../audio/tts.js';
export {
  SOUND_BANK_ID, standardSoundKeys, recordedKeys,
  speakLetter, speakNikudSound, speakSyllable,
} from '../audio/hebrew-audio.js';
export { saveVoice, loadVoice, deleteVoice, playVoice } from '../audio/voice-store.js';
export { isSynthSupported }                     from '../audio/phoneme-synth.js';
export { VOWEL_TEMPLATES, NIKUD_VOWEL }         from '../data/vowels.js';
export { getLetter, getLettersByGroup, randomLetters } from '../data/hebrew-letters.js';
export { nikudList, nikudBaseLetters, letterWithNikud, randomNikud } from '../data/nikud.js';
export { showNikudSettingsDialog }              from '../ui/nikud-settings.js';
