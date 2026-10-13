<script>
  import { scale } from 'svelte/transition';
  import ChoiceCards from '../../shell/ChoiceCards.svelte';
  import FeedbackLine from '../../shell/FeedbackLine.svelte';
  import { Feedback } from '../../shell/feedback.svelte.js';
  import { useScope } from '../../shell/scope.js';
  import { ms } from '../../lib/motion.js';
  import { HINT, INSTRUCTION, WHOLE, answerFor, frameLabel } from './logic.js';

  /**
   * @type {{
   *   round: import('./logic.js').Round,
   *   runner: import('../../shell/round-runner.svelte.js').RoundRunner<import('./logic.js').Round>,
   * }}
   */
  let { round, runner } = $props();

  const feedback = new Feedback(useScope());
  const answer = $derived(answerFor(round));
  let solved = $state(false);

  /** @param {number} value */
  function choose(value) {
    if (value === answer) {
      void runner.correct(() => {
        solved = true;
        feedback.correct();
      });
    } else {
      void runner.wrong(() => feedback.hint(HINT));
    }
  }
</script>

<h2 class="instruction">{INSTRUCTION}</h2>

<p class="ten-equation" dir="ltr">
  {round.given} + {#if solved}<span class="ten-equation__answer" in:scale={{ start: 0.5, duration: ms(240) }}>{answer}</span>{:else}<span class="ten-equation__unknown">?</span>{/if} = {WHOLE}
</p>

<!-- Rows of five, filled from the left like the exercise. After a correct
     answer the empty cells fill one by one: the missing part, in its own colour. -->
<div class="ten-frame" dir="ltr" role="img" aria-label={frameLabel(round.given)}>
  {#each { length: WHOLE }, cell}
    <span class={['ten-cell', cell < round.given && 'ten-cell--given']}>
      {#if solved && cell >= round.given}
        <span
          class="ten-cell__added"
          in:scale={{ start: 0.3, duration: ms(220), delay: ms((cell - round.given) * 60) }}
        ></span>
      {/if}
    </span>
  {/each}
</div>

<ChoiceCards choices={round.choices} locked={runner.locked} correct={solved ? answer : null} onchoose={choose} />
<FeedbackLine {feedback} />

<style>
  .instruction { margin: 0; font-size: clamp(22px, 5.5dvmin, 32px); font-weight: 700; }
  .ten-equation { margin: 0; font-size: clamp(28px, 6vw, 44px); font-weight: 700; }
  .ten-equation__unknown { color: var(--hint); }
  .ten-equation__answer {
    display: inline-block;
    padding: 0 10px;
    border-radius: var(--radius-sm);
    background: var(--part-added);
    color: var(--ink);
  }
  .ten-frame {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
    width: min(340px, 100%);
  }
  .ten-cell {
    position: relative;
    aspect-ratio: 1;
    border: 2px solid #52647c;
    border-radius: var(--radius-sm);
    background: #fff;
  }
  .ten-cell--given { background: var(--part-given); box-shadow: inset 0 0 0 5px #fff; }
  .ten-cell__added { position: absolute; inset: 5px; border-radius: 4px; background: var(--part-added); }
</style>
