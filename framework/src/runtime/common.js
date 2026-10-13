/**
 * API כללי למשחקים: מחזור חיים, קלט ומשוב, ללא תוכן לימודי.
 * מייצא רק מה שמשחקים משתמשים בו או מה שהמדריך מתעד. קוד פנימי
 * (מעטפת, מנהל סיבובים, מסכי טעינה ושגיאה) נשאר מאחורי runGame ו-bootstrapGame.
 */
export { runGame, bootstrapGame }               from '../core/bootstrap.js';
export { createRoundScope }                     from '../core/round-scope.js';
export { createChoiceRound }                    from '../core/choice-round.js';
export { createHintTracker }                    from '../core/hints.js';
export { createFeedback }                       from '../ui/feedback.js';
export { createProgressBar }                    from '../ui/progress-bar.js';
export { showCompletionScreen }                 from '../ui/completion-screen.js';
export { injectHeaderButton }                   from '../ui/header-button.js';
export { animate }                              from '../render/animations.js';
export { sounds }                               from '../audio/sounds.js';
export { getAudioContext }                      from '../audio/audio-context.js';
export { randomPraise, randomRetryHint }        from '../data/encouragement.js';
export { createDragSource, createDropTarget }   from '../input/drag.js';
export { lockPageZoom }                         from '../input/zoom-lock.js';
export { shuffle }                              from '../utils/shuffle.js';
