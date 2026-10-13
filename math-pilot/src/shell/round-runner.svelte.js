/**
 * The flow of a round-based game: one answer lock, the count of solved
 * rounds, the pause before the next round, and the end.
 * A game decides what is correct and what feedback to show; the runner
 * makes sure a round is answered once and moves on by itself.
 * @template Round
 */
export class RoundRunner {
  index = $state(0);
  solved = $state(0);
  /** True while an answer is handled and after a correct one, until the next round. */
  locked = $state(false);
  finished = $state(false);
  #timer = /** @type {ReturnType<typeof setTimeout> | undefined} */ (undefined);
  #destroyed = false;

  /**
   * @param {Round[]} rounds
   * @param {{ transitionMs?: number | ((round: Round) => number) }} [options] -
   *   the pause after a correct answer; a function gives each round its own
   */
  constructor(rounds, { transitionMs = 800 } = {}) {
    if (!rounds.length) throw new Error('A game needs at least one round');
    this.rounds = rounds;
    this.transitionMs = transitionMs;
  }

  get total() {
    return this.rounds.length;
  }

  get round() {
    return this.rounds[this.index];
  }

  /**
   * A correct answer: locks the round, runs the game's action, counts it and
   * moves on after the pause.
   * @param {() => void | Promise<void>} [action]
   * @returns {Promise<boolean>} false when the answer was ignored
   */
  async correct(action) {
    if (this.locked || this.finished || this.#destroyed) return false;
    this.locked = true;
    try {
      await action?.();
    } catch (error) {
      this.locked = false;
      throw error;
    }
    if (this.#destroyed) return false;
    this.solved += 1;
    const pause = typeof this.transitionMs === 'function' ? this.transitionMs(this.round) : this.transitionMs;
    this.#timer = setTimeout(() => this.#advance(), pause);
    return true;
  }

  /**
   * A wrong answer: the round stays locked while the game shows its help,
   * then opens again.
   * @param {() => void | Promise<void>} [action]
   * @returns {Promise<boolean>} false when the answer was ignored
   */
  async wrong(action) {
    if (this.locked || this.finished || this.#destroyed) return false;
    this.locked = true;
    try {
      await action?.();
    } finally {
      this.locked = false;
    }
    return true;
  }

  #advance() {
    if (this.#destroyed) return;
    if (this.index + 1 < this.total) {
      this.index += 1;
      this.locked = false;
    } else {
      this.finished = true;
    }
  }

  /** Stops the pending move to the next round (replay, leaving the game). */
  destroy() {
    this.#destroyed = true;
    clearTimeout(this.#timer);
  }
}
