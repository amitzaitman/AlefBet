import { randomPraise } from '../lib/praise.js';

/**
 * The line under a round: praise after a correct answer, a hint after a
 * wrong one. There is no "wrong" message. Each message clears itself.
 */
export class Feedback {
  text = $state('');
  /** @type {'' | 'correct' | 'hint'} */
  tone = $state('');
  /** Counts messages, so the same hint twice still arrives as a new message. */
  count = $state(0);
  #cancel = () => {};

  /**
   * @param {import('./scope.js').Scope} scope
   * @param {number} [durationMs]
   */
  constructor(scope, durationMs = 1800) {
    this.scope = scope;
    this.durationMs = durationMs;
  }

  /** @param {string} [text] */
  correct(text = randomPraise()) {
    this.#show(text, 'correct');
  }

  /** @param {string} text */
  hint(text) {
    this.#show(text, 'hint');
  }

  /** @param {string} text @param {'correct' | 'hint'} tone */
  #show(text, tone) {
    this.#cancel();
    this.text = text;
    this.tone = tone;
    this.count += 1;
    this.#cancel = this.scope.schedule(() => {
      this.text = '';
      this.tone = '';
    }, this.durationMs);
  }
}
