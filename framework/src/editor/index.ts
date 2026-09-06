// ===== Editor =====
export { GameEditor }    from './game-editor.js';
export { GameData }      from './game-data.js';
export { saveGameData, loadGameData, clearGameData, exportGameDataAsJSON } from './editor-storage.js';
export { showAudioManager } from './audio-manager.js';
export { createZoneEditor } from './zone-editor.js';
export type { DrawTool }   from './zone-editor.js';
export { showTemplatePicker, ACTIVITY_TEMPLATES, generateZonesFromTemplate } from './activity-templates.js';
export type { ActivityTemplate } from './activity-templates.js';

// ===== Editor: schemas + field utilities (TypeScript consumers) =====
export {
  PointSchema,
  ZoneSchema,
  BaseRoundSchema,
  MultipleChoiceRoundSchema,
  DragMatchRoundSchema,
  ZoneTapRoundSchema,
  GameMetaSchema,
  GameDataSchema,
  BUILTIN_ROUND_SCHEMAS,
} from './schemas.js';
export type {
  Point, Zone, BaseRound, MultipleChoiceRound, DragMatchRound, ZoneTapRound,
  GameMeta, GameDataJson, RoundRecord,
} from './schemas.js';
export { schemaToFields }  from './schema-to-fields.js';
export type { FieldSpec, FieldType } from './schema-to-fields.js';
