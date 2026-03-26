/**
 * AlefBet Framework
 * מסגרת משחקים חינוכיים לקריאה וכתיבה בעברית
 */
import './styles/alefbet.css';

// ===== Core =====
export { EventBus }          from './core/events.js';
export { GameState }         from './core/state.js';
export { GameShell }         from './core/game-shell.js';
export { createRoundManager } from './core/round-manager.js';
export { createLocalState }  from './core/local-state.js';

// ===== Audio =====
export { tts }    from './audio/tts.js';
export { sounds } from './audio/sounds.js';
export { createSpeechListener, matchNikudSound } from './audio/speech-recognition.js';
export { createVoiceRecorder, isVoiceRecordingSupported } from './audio/voice-recorder.js';
export { saveVoice, loadVoice, deleteVoice, listVoiceKeys, playVoice, hasVoice } from './audio/voice-store.js';

// ===== Data =====
export { hebrewLetters, getLetter, getLettersByGroup, randomLetters } from './data/hebrew-letters.js';
export { nikudList, nikudBaseLetters, letterWithNikud, randomNikud }  from './data/nikud.js';

// ===== UI =====
export { createOptionCards }       from './ui/option-cards.js';
export { createProgressBar }       from './ui/progress-bar.js';
export { createFeedback }          from './ui/feedback.js';
export { showCompletionScreen }    from './ui/completion-screen.js';
export { showNikudSettingsDialog } from './ui/nikud-settings.js';
export { createZone }              from './ui/interactive-zones.js';
export { createZonePlayer }        from './ui/zone-player.js';
export { showLoadingScreen, hideLoadingScreen } from './ui/loading-screen.js';
export { injectHeaderButton }      from './ui/header-button.js';
export { createNikudBox }          from './ui/nikud-box.js';
export { createAppShell }          from './ui/app-shell.js';
export { createVoiceRecordButton } from './ui/voice-record-button.js';

// ===== Render =====
export { animate } from './render/animations.js';

// ===== Input =====
export { createDragSource, createDropTarget } from './input/drag.js';

// ===== Utils =====
export { addNikud, getNikud, preloadNikud } from './utils/nakdan.js';

// ===== Editor =====
export { GameEditor }    from './editor/game-editor.js';
export { GameData }      from './editor/game-data.js';
export { saveGameData, loadGameData, clearGameData, exportGameDataAsJSON } from './editor/editor-storage.js';
export { showAudioManager } from './editor/audio-manager.js';
export { createZoneEditor } from './editor/zone-editor.js';

// ===== Editor: schemas + field utilities (TypeScript consumers) =====
export {
  ZoneSchema,
  BaseRoundSchema,
  MultipleChoiceRoundSchema,
  DragMatchRoundSchema,
  ZoneTapRoundSchema,
  GameMetaSchema,
  GameDataSchema,
  BUILTIN_ROUND_SCHEMAS,
} from './editor/schemas.js';
export type {
  Zone, BaseRound, MultipleChoiceRound, DragMatchRound, ZoneTapRound,
  GameMeta, GameDataJson, RoundRecord,
} from './editor/schemas.js';
export { schemaToFields }  from './editor/schema-to-fields.js';
export type { FieldSpec, FieldType } from './editor/schema-to-fields.js';
