/**
 * ה-API של המשחקים, כניסה אחת לכל משחק: מחזור חיים, קלט ומשוב, ובנוסף שמע
 * עברי, נתוני אותיות וניקוד, ובנק הצלילים של אולפן ההקלטה.
 * מייצא רק מה שמשחקים משתמשים בו או מה שהמדריך מתעד. קוד פנימי
 * (מעטפת, מנהל סיבובים, מסכי טעינה ושגיאה) נשאר מאחורי runGame ו-bootstrapGame.
 */
import '../styles/alefbet.css';
import '../styles/story.css';

export { runGame, bootstrapGame }               from '../core/bootstrap.js';
export { createRoundScope }                     from '../core/round-scope.js';
export { createChoiceRound }                    from '../core/choice-round.js';
export { createStoryRound }                     from '../core/story-round.js';
export { createNarrator, needsTap }             from '../audio/narrator.js';
export { createHintTracker }                    from '../core/hints.js';
export { createFeedback }                       from '../ui/feedback.js';
export { createProgressBar }                    from '../ui/progress-bar.js';
export { showCompletionScreen }                 from '../ui/completion-screen.js';
export { injectHeaderButton }                   from '../ui/header-button.js';
export { animate }                              from '../render/animations.js';
export { sounds }                               from '../audio/sounds.js';
export { getAudioContext }                      from '../audio/audio-context.js';
export { randomPraise, randomRetryHint }        from '../data/encouragement.js';
export { numberWord, countNoun, exerciseWords, countingSteps } from '../data/hebrew-numbers.js';
export { createDragSource, createDropTarget }   from '../input/drag.js';
export { lockPageZoom }                         from '../input/zoom-lock.js';
export { shuffle }                              from '../utils/shuffle.js';

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
