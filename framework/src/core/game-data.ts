/**
 * GameData — typed model for editable game rounds.
 * Manages rounds, change events, undo/redo, and JSON serialisation.
 */
import type { GameDataJson, RoundRecord } from '../editor/schemas.js';

/** Game-owned content rules; no editor or schema library is loaded at runtime. */
export interface ContentContract {
  version?: number;
  createRound: () => Record<string, unknown>;
  validateRound: (round: Record<string, unknown>) => boolean;
  migrate?: (data: GameDataJson) => GameDataJson;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function readContent(value: unknown): GameDataJson {
  if (!isRecord(value) || typeof value.id !== 'string' || !value.id
    || !Array.isArray(value.rounds) || !value.rounds.every(isRecord)
    || (value.meta !== undefined && !isRecord(value.meta))
    || (value.distractors !== undefined && !Array.isArray(value.distractors))) {
    throw new Error('Invalid game content');
  }
  const version = value.version ?? 1;
  if (!Number.isInteger(version) || Number(version) < 1) throw new Error('Invalid content version');
  const ids = new Set();
  for (const round of value.rounds) {
    if (round.id !== undefined) {
      if (typeof round.id !== 'string' || !round.id || ids.has(round.id)) throw new Error('Invalid round id');
      ids.add(round.id);
    }
  }
  return { ...value, version } as GameDataJson;
}

let _idCounter = 0;
function generateId(): string {
  return `round-${Date.now()}-${_idCounter++}`;
}

export class GameData {
  private _id:          string;
  private _version:     number;
  private _meta:        Record<string, unknown>;
  private _rounds:      RoundRecord[];
  private _distractors: unknown[];
  private _handlers:    Array<(gd: GameData) => void>;
  private _past:        RoundRecord[][];  // undo stack (oldest first)
  private _future:      RoundRecord[][];  // redo stack

  constructor(schema: Partial<GameDataJson> & { id?: string }, private _contract?: ContentContract) {
    this._id          = schema.id ?? 'game';
    this._version     = schema.version ?? 1;
    this._meta        = { title: '', type: 'multiple-choice', ...(schema.meta as object ?? {}) };
    this._rounds      = ((schema.rounds ?? []) as RoundRecord[])
      .map(r => ({ ...r, id: (r.id as string) || generateId() }));
    this._distractors = schema.distractors ?? [];
    this._handlers    = [];
    this._past        = [];
    this._future      = [];
  }

  // ── Identity ──────────────────────────────────────────────────────────────

  get id():          string                  { return this._id; }
  get meta():        Record<string, unknown> { return { ...this._meta }; }
  get distractors(): unknown[]               { return [...this._distractors]; }

  // ── Rounds (read) ─────────────────────────────────────────────────────────

  get rounds(): RoundRecord[] { return [...this._rounds]; }

  getRound(id: string): RoundRecord | null {
    return this._rounds.find(r => r.id === id) ?? null;
  }

  getRoundIndex(id: string): number {
    return this._rounds.findIndex(r => r.id === id);
  }

  // ── Rounds (write) ────────────────────────────────────────────────────────

  updateRound(id: string, patch: Partial<RoundRecord>): void {
    const idx = this.getRoundIndex(id);
    if (idx === -1) return;
    this._saveHistory();
    this._rounds[idx] = { ...this._rounds[idx], ...patch };
    this._emit();
  }

  addRound(afterId: string | null = null): string {
    this._saveHistory();
    const blank: RoundRecord = { ...this._contract?.createRound(), id: generateId() };
    if (afterId === null) {
      this._rounds.push(blank);
    } else {
      const idx = this.getRoundIndex(afterId);
      this._rounds.splice(idx + 1, 0, blank);
    }
    this._emit();
    return blank.id;
  }

  duplicateRound(id: string): string | null {
    const round = this.getRound(id);
    if (!round) return null;
    this._saveHistory();
    const copy: RoundRecord = { ...round, id: generateId() };
    this._rounds.splice(this.getRoundIndex(id) + 1, 0, copy);
    this._emit();
    return copy.id;
  }

  removeRound(id: string): void {
    const idx = this.getRoundIndex(id);
    if (idx === -1 || this._rounds.length <= 1) return;
    this._saveHistory();
    this._rounds.splice(idx, 1);
    this._emit();
  }

  moveRound(id: string, toIndex: number): void {
    const from = this.getRoundIndex(id);
    if (from === -1) return;
    this._saveHistory();
    const [round] = this._rounds.splice(from, 1);
    this._rounds.splice(Math.max(0, Math.min(toIndex, this._rounds.length)), 0, round);
    this._emit();
  }

  // ── Undo / Redo ───────────────────────────────────────────────────────────

  get canUndo(): boolean { return this._past.length > 0; }
  get canRedo(): boolean { return this._future.length > 0; }

  undo(): void {
    if (!this.canUndo) return;
    this._future.push(this._snapshot());
    this._rounds = this._past.pop()!;
    this._emit();
  }

  redo(): void {
    if (!this.canRedo) return;
    this._past.push(this._snapshot());
    this._rounds = this._future.pop()!;
    this._emit();
  }

  private _saveHistory(): void {
    this._past.push(this._snapshot());
    this._future = [];
    if (this._past.length > 50) this._past.shift();
  }

  private _snapshot(): RoundRecord[] {
    return this._rounds.map(r => ({ ...r }));
  }

  // ── Change events ─────────────────────────────────────────────────────────

  onChange(handler: (gd: GameData) => void): () => void {
    this._handlers.push(handler);
    return () => this.offChange(handler);
  }

  offChange(handler: (gd: GameData) => void): void {
    const idx = this._handlers.indexOf(handler);
    if (idx !== -1) this._handlers.splice(idx, 1);
  }

  private _emit(): void {
    this._handlers.forEach(fn => fn(this));
  }

  // ── Serialisation ─────────────────────────────────────────────────────────

  toJSON(): GameDataJson {
    return {
      id:          this._id,
      version:     this._version,
      meta:        { ...this._meta } as GameDataJson['meta'],
      rounds:      this._snapshot() as GameDataJson['rounds'],
      distractors: [...this._distractors],
    };
  }

  validate(): boolean {
    return !this._contract || this._rounds.every(round => this._contract.validateRound(round));
  }

  static fromJSON(value: unknown, contract?: ContentContract): GameData {
    let json = readContent(value);
    const version = contract?.version ?? 1;
    if (json.version < version && contract?.migrate) {
      const id = json.id;
      json = readContent(contract.migrate(json));
      if (json.id !== id) throw new Error('Migration changed game identity');
    }
    if (json.version !== version) throw new Error('Unsupported content version');
    const data = new GameData(json, contract);
    if (!data.validate()) throw new Error('Invalid round content');
    return data;
  }

  static fromRoundsArray(
    gameId: string,
    rounds: RoundRecord[],
    meta:   Record<string, unknown> = {},
    distractors: unknown[] = [],
    contract?: ContentContract,
  ): GameData {
    return new GameData({ id: gameId, meta: meta as GameDataJson['meta'], rounds: rounds as GameDataJson['rounds'], distractors, version: contract?.version ?? 1 }, contract);
  }
}
