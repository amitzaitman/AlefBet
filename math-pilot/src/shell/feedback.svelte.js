import { randomPraise } from '../lib/praise.js';
import { HOLD_MS, readingMs } from '../lib/reading.js';

/**
 * The line under a round: praise after a correct answer, a hint after a
 * wrong one. There is no "wrong" message. Each message clears itself once
 * it has had time to be read, since the children read it and do not hear it.
 */
export class Feedback {
  text = $state('');
  /** @type {'' | 'correct' | 'hint'} */
  tone = $state('');
  /** Counts messages, so the same hint twice still arrives as a new message. */
  count = $state(0);
  #cancel = () => {};

  /** @param {import('./scope.js').Scope} scope */
  constructor(scope) {
    this.scope = scope;
  }

  /** @param {string} [text] */
  correct(text = randomPraise()) {
    this.#show(text, 'correct');
  }

  /** @param {string} text */
  hint(text) {
    this.#show(text, 'hint');
  }

  /** Takes the message away now, for a round whose own picture says enough. */
  clear() {
    this.#cancel();
    this.text = '';
    this.tone = '';
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
    }, readingMs(text) + HOLD_MS);
  }
}
