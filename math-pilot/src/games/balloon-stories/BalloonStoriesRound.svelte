<script>
  import { onMount, untrack } from 'svelte';
  import { fly, scale } from 'svelte/transition';
  import FeedbackLine from '../../shell/FeedbackLine.svelte';
  import { Feedback } from '../../shell/feedback.svelte.js';
  import { useScope } from '../../shell/scope.js';
  import { ms } from '../../lib/motion.js';
  import Scene from './Scene.svelte';
  import { StoryRound } from './story-round.svelte.js';
  import { AGAIN, AGAIN_LABEL, storyCaption } from './logic.js';

  /**
   * @type {{
   *   round: import('./logic.js').Round,
   *   runner: import('../../shell/round-runner.svelte.js').RoundRunner<import('./logic.js').Round>,
   * }}
   */
  let { round, runner } = $props();

  const scope = useScope();
  // GameShell makes a new component for every round, so round and runner never change here.
  const story = untrack(() => new StoryRound(round, { scope, runner, feedback: new Feedback(scope) }));
  // No audio, so nothing waits for a first tap: the story starts by itself.
  onMount(() => { void story.play(); });

  const tokens = $derived(story.equation.split(' ').filter(Boolean));
  const label = $derived(story.lines.map(line => line.text).join(' '));

  /** @param {import('./story-round.svelte.js').Choice} choice */
  const pick = choice => [
    story.tried.includes(choice) && 'pick--tried',
    story.marked === choice && 'pick--hint',
    story.picked === choice && 'pick--correct',
  ];
</script>

<section class="game">
  <div class="story" aria-live="polite">
    {#each story.lines as line, k (line.key)}
      <p
        class={['line', line.result && 'line--result', k === story.now && 'line--now']}
        in:fly={{ y: 8, duration: line.motion === 'none' ? 0 : ms(320) }}
      >{line.text}</p>
    {/each}
    <!-- The sentences still to come hold their place, so the picture and the choices
         below never move, least of all when the question opens the choices. -->
    {#each story.beats.slice(story.lines.length) as beat, k (k)}
      <p class="line-space" aria-hidden="true">{beat.text}</p>
    {/each}
  </div>

  {#if round.kind !== 'match'}
    <Scene kind={round.kind} look={round.look} balloons={story.balloons} paired={story.paired} {label} />
  {/if}

  <!-- The exercise builds with the story; each new part slides in, and the answer takes the place of '?'. -->
  <p class="equation" dir="ltr">{#each tokens as token, k (k)}{#if k}{' '}{/if}<span
      class={['token', token === '?' && !story.solved && 'unknown']}
      in:fly={{ y: 6, duration: ms(240) }}
    >{#if token === '?' && story.solved}<span class={['solved', round.kind === 'missing' && 'solved--part']} in:scale={{ start: 0.5, duration: ms(240) }}>{story.answer}</span>{:else}{token}{/if}</span>{/each}</p>

  {#if story.matching}
    <div class="cards">
      {#each story.cards as card (card.id)}
        <button
          type="button"
          class={['card', ...pick(card.id)]}
          data-id={card.id}
          data-op={card.op}
          data-a={card.a}
          data-b={card.b}
          aria-label={storyCaption(card)}
          disabled={!story.isOpen(card.id)}
          onclick={() => story.choose(card.id)}
        >
          <span class="card__caption">{storyCaption(card)}</span>
          <Scene kind={card.kind} look="dots" balloons={card.balloons} mini />
        </button>
      {/each}
    </div>
  {:else}
    <!-- Ascending from the left, each number with its dots in rows of five. -->
    <div class="choices" dir="ltr">
      {#each story.choices as value (value)}
        <button
          type="button"
          class={['choice', ...pick(value)]}
          data-value={value}
          aria-label={String(value)}
          disabled={!story.isOpen(value)}
          onclick={() => story.choose(value)}
        >
          <span class="choice__number">{value}</span>
          <span class="choice__dots" aria-hidden="true">{#each { length: value }}<span></span>{/each}</span>
        </button>
      {/each}
    </div>
  {/if}

  <FeedbackLine feedback={story.feedback} />

  <button type="button" class="button again" aria-label={AGAIN_LABEL} disabled={story.solved} onclick={() => story.play()}>{AGAIN}</button>
</section>

<style>
  .game {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: min(100%, 640px);
    margin-inline: auto;
  }

  /* The story so far: earlier sentences stay, the one being read is dark. */
  .story {
    display: grid;
    align-content: center;
    gap: 2px;
    width: 100%;
    margin: 0 0 8px;
    font-size: clamp(19px, 4.6dvmin, 26px);
    line-height: 1.45;
  }
  .line, .line-space { margin: 0; color: var(--muted); font-weight: 600; }
  .line--now, .line-space { color: var(--ink); font-weight: 700; }
  .line-space { visibility: hidden; }
  .line--result { color: var(--solved); }

  .equation { min-height: 1.3em; margin: 6px 0; font-size: clamp(30px, 7vw, 44px); font-weight: 700; }
  .token { display: inline-block; }
  .unknown { color: var(--hint); }
  .solved { display: inline-block; padding: 0 8px; border-radius: var(--radius-sm); background: var(--solved); color: #fff; }
  /* Completing: the answer is the missing part, in its colour, as in make-ten. */
  .solved--part { background: var(--part-added); color: var(--ink); }

  .choices { display: flex; flex-wrap: wrap; justify-content: center; gap: clamp(6px, 2vw, 12px); margin: 8px 0 4px; }
  .choice {
    display: grid;
    justify-items: center;
    align-content: center;
    gap: 6px;
    min-width: var(--touch);
    min-height: 84px;
    padding: 6px 4px;
    border: 3px solid var(--part-given);
    border-radius: var(--radius-md);
    background: #fff;
    color: #174774;
    font: inherit;
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition: opacity var(--ease), background var(--ease), border-color var(--ease);
  }
  .choice__number { font-size: clamp(28px, 7vw, 36px); font-weight: 700; line-height: 1; }
  .choice__dots { display: grid; grid-template-columns: repeat(5, 7px); gap: 3px; min-height: 7px; }
  .choice__dots span { width: 7px; height: 7px; border-radius: 50%; background: var(--part-given); }

  .cards { display: grid; gap: 10px; width: min(100%, 440px); margin: 8px auto 4px; }
  .card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 72px;
    padding: 10px 14px;
    border: 3px solid var(--part-given);
    border-radius: var(--radius-md);
    background: #fff;
    color: var(--ink);
    font: inherit;
    font-size: clamp(18px, 4dvmin, 22px);
    font-weight: 700;
    text-align: start;
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition: opacity var(--ease), background var(--ease), border-color var(--ease);
  }

  .pick--tried { opacity: 0.35; border-style: dashed; }
  .pick--hint { border-color: var(--hint); background: #f0e4eb; box-shadow: 0 0 0 4px rgba(120, 57, 82, 0.25); }
  .pick--correct { border-color: var(--solved); background: #dcefe9; }
  .choice:disabled, .card:disabled { cursor: default; }
  .choice:disabled:not(.pick--tried, .pick--correct), .card:disabled:not(.pick--tried, .pick--correct) { opacity: 0.6; }
  .choice:focus-visible, .card:focus-visible { outline: 3px solid var(--ochre); outline-offset: 3px; }

  .again { min-height: var(--touch); font-size: clamp(18px, 4dvmin, 22px); }
  .again:disabled { opacity: 0.45; cursor: default; transform: none; }
</style>
