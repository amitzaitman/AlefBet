import { readingMs } from '../../lib/reading.js';
import { shuffle } from '../../lib/shuffle.js';
import {
  COUNT_HINTS, COUNT_MS, LOOK_MS, MATCH_HINT, NUMBER_HINT, STAGGER_MS, STORY_AGAIN_HINT, STORY_HINT,
  answerChoices, answerFor, finalStates, matchOptions, resultFor, scenePlan, storyFor,
} from './logic.js';

/**
 * One balloon on the screen. `key` changes with every change of state, so the
 * view makes a new element and plays its `motion` ('none' when the picture
 * jumps to the end); `count` is its number while the picture is counted.
 * @typedef {{ key: number, owner: import('./logic.js').Owner, state: import('./logic.js').BalloonState, motion: import('./logic.js').Motion | 'none', count: number }} Balloon
 * @typedef {{ key: number, text: string, result: boolean, motion: 'appear' | 'none' }} Line
 * @typedef {number | import('./logic.js').StoryCard['id']} Choice - a number, or a story card's id
 * @typedef {import('./logic.js').StoryCard & { kind: 'take' | 'add', balloons: Balloon[] }} PictureCard
 */

/**
 * A story card with its finished picture: balloons that popped or arrived.
 * @param {import('./logic.js').StoryCard} card
 * @returns {PictureCard}
 */
function withPicture(card) {
  const kind = card.op === '-' ? 'take' : 'add';
  const plan = scenePlan({ kind, a: card.a, b: card.b });
  const balloons = finalStates(plan).map((state, k) => ({ key: k, owner: plan.owners[k], state, motion: /** @type {const} */ ('none'), count: 0 }));
  return { ...card, kind, balloons };
}

/**
 * The flow of one balloon-stories round: the story told one sentence at a
 * time while the picture and the exercise build with it, the choices that open
 * with the question, and the help after each wrong answer (the story again,
 * then counting on the picture, then the answer marked).
 * The view only draws this state and calls `play` and `choose`.
 */
export class StoryRound {
  /** @type {Line[]} the sentences told so far; they stay on the screen while the round lasts */
  lines = $state([]);
  /** The line being read: the newest one, or the one the story has reached when it is told again. */
  now = $state(0);
  /** The exercise as far as the story has written it. */
  equation = $state('');
  /** @type {Balloon[]} */
  balloons = $state([]);
  /** Comparing: each of Dani's balloons stands under a partner once the question is asked. */
  paired = $state(false);
  /** The choices open with the question and stay open when the story is read again. */
  asked = $state(false);
  /** @type {Choice[]} */
  tried = $state([]);
  /** @type {Choice | null} the choice the last hint marks */
  marked = $state(null);
  /** @type {Choice | null} the correct choice, once it is found */
  picked = $state(null);
  #misses = 0;
  /** Counts story runs; a newer run, a hint or an answer stops an older one. */
  #run = 0;
  #keys = 0;

  /**
   * @param {import('./logic.js').Round} round
   * @param {{
   *   scope: import('../../shell/scope.js').Scope,
   *   runner: import('../../shell/round-runner.svelte.js').RoundRunner<import('./logic.js').Round>,
   *   feedback: import('../../shell/feedback.svelte.js').Feedback,
   * }} parts
   */
  constructor(round, { scope, runner, feedback }) {
    this.round = round;
    this.scope = scope;
    this.runner = runner;
    this.feedback = feedback;
    this.matching = round.kind === 'match';
    this.beats = storyFor(round);
    this.answer = answerFor(round);
    // Chosen once, so the round looks the same until it is answered.
    this.choices = this.matching ? [] : answerChoices(round);
    this.cards = this.matching ? shuffle(matchOptions(round)).map(withPicture) : [];
    this.plan = this.matching ? null : scenePlan(round);
    this.balloons = this.plan ? this.plan.owners.map(owner => this.#balloon(owner, 'hidden', 'none')) : [];
  }

  /** The answer written into the exercise, once it is found. */
  get solved() {
    return this.picked !== null;
  }

  /** @param {Choice} choice */
  isOpen(choice) {
    return this.asked && !this.runner.locked && !this.tried.includes(choice);
  }

  /**
   * Tells the story from the start: one sentence at a time, with the picture
   * and the exercise. Told again, every sentence stays on the screen, so the
   * child can read at their own pace; only the highlight and the picture move.
   */
  async play() {
    const run = ++this.#run;
    const live = () => run === this.#run && this.scope.active();
    /** @param {number} ms */
    const wait = async ms => (await this.scope.wait(ms)) && live();
    this.paired = false;
    if (this.plan) this.balloons = this.plan.owners.map(owner => this.#balloon(owner, 'hidden', 'none'));
    for (const [k, beat] of this.beats.entries()) {
      if (k === this.lines.length) this.lines.push(this.#line(beat.text));
      this.now = k;
      // The setting and the question come with their sentence. A change happens
      // once its sentence has been read, and its part of the exercise with it.
      const change = beat.scene === 'change';
      if (change && !await wait(readingMs(beat.text))) return;
      this.equation = beat.equation;
      if (beat.scene === 'question') this.asked = true;
      await this.#step(beat.scene, live);
      if (beat.scene === 'question' || !await wait(change ? LOOK_MS : readingMs(beat.text))) return;
    }
  }

  /** @param {Choice} choice */
  choose(choice) {
    if (!this.isOpen(choice)) return;
    const correct = this.matching ? choice === 'right' : choice === this.answer;
    if (!correct) {
      void this.runner.wrong(() => {
        this.#misses += 1;
        this.tried.push(choice);
        this.#help();
      });
      return;
    }
    void this.runner.correct(() => {
      this.picked = choice;
      this.#settle();
      // The exercise is completed on the picture, and the story closes with its answer.
      // That sentence is the feedback, so no praise competes with it for reading time.
      if (this.matching) this.equation = `${this.beats[0].equation} = ?`;
      else {
        // The missing balloons fill in, in the missing part's colour, as in make-ten.
        if (this.round.kind === 'missing') {
          for (const index of this.plan?.counted ?? []) this.balloons[index] = this.#balloon('added', 'shown', 'fill');
        }
        this.lines.push(this.#line(resultFor(this.round), 'appear', true));
        this.now = this.lines.length - 1;
      }
      this.feedback.clear();
    });
  }

  /** The help goes back to the picture: the story again, then counting, then the answer. */
  #help() {
    if (this.matching) {
      if (this.#misses >= 2) {
        this.marked = 'right';
        this.feedback.hint(STORY_HINT);
      } else {
        this.feedback.hint(MATCH_HINT);
        void this.play();
      }
      return;
    }
    if (this.#misses === 1) {
      this.feedback.hint(STORY_AGAIN_HINT);
      void this.play();
    } else if (this.#misses === 2) {
      this.feedback.hint(COUNT_HINTS[/** @type {keyof typeof COUNT_HINTS} */ (this.round.kind)]);
      void this.#count();
    } else {
      this.marked = this.answer;
      this.feedback.hint(NUMBER_HINT);
    }
  }

  /**
   * Plays one story step on the picture.
   * @param {import('./logic.js').Beat['scene']} scene
   * @param {() => boolean} live
   */
  async #step(scene, live) {
    const plan = this.plan;
    if (!plan) return;
    if (scene === 'start') {
      this.balloons = plan.owners.map((owner, k) => this.#balloon(owner, plan.start[k], 'appear'));
    } else if (scene === 'change') {
      // One balloon after another, so each one can be followed and counted.
      for (const [k, index] of plan.change.entries()) {
        if (k && !await this.scope.wait(STAGGER_MS)) return;
        if (!live()) return;
        this.balloons[index] = this.#balloon(plan.owners[index], plan.changeTo, plan.motion);
      }
    } else {
      this.paired = this.round.kind === 'compare';
    }
  }

  /** Shows the whole story at once, when a hint or an answer interrupts it. */
  #settle() {
    this.#run += 1;
    this.lines = this.beats.map((beat, k) => this.lines[k] ?? this.#line(beat.text, 'none'));
    this.now = this.beats.length - 1;
    this.equation = this.beats[this.beats.length - 1].equation;
    const plan = this.plan;
    if (!plan) return;
    const end = finalStates(plan);
    this.balloons = plan.owners.map((owner, k) => this.#balloon(owner, end[k], 'none'));
    this.paired = this.round.kind === 'compare';
  }

  /** Numbers the balloons that answer the question, one at a time, on the finished picture. */
  async #count() {
    this.#settle();
    const run = this.#run;
    for (const [k, index] of (this.plan?.counted ?? []).entries()) {
      if (run !== this.#run || !this.scope.active()) return;
      this.balloons[index].count = k + 1;
      if (!await this.scope.wait(COUNT_MS)) return;
    }
  }

  /**
   * @param {import('./logic.js').Owner} owner
   * @param {import('./logic.js').BalloonState} state
   * @param {Balloon['motion']} motion
   * @returns {Balloon}
   */
  #balloon(owner, state, motion) {
    return { key: ++this.#keys, owner, state, motion, count: 0 };
  }

  /**
   * @param {string} text
   * @param {Line['motion']} [motion]
   * @param {boolean} [result]
   * @returns {Line}
   */
  #line(text, motion = 'appear', result = false) {
    return { key: ++this.#keys, text, result, motion };
  }
}
