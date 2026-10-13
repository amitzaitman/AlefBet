<script>
  import { fly, scale } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import { ms } from '../../lib/motion.js';

  /**
   * The picture of a story: balloons (or plain circles) in rows of five from
   * the left, or, when comparing, one column per balloon of Noa's with Dani's
   * balloon under it. It only draws; StoryRound decides what each balloon is.
   * Spans only, so a small picture can sit inside a story card's button.
   * @type {{
   *   kind: 'take' | 'add' | 'compare' | 'missing',
   *   look: 'balloons' | 'dots',
   *   balloons: import('./story-round.svelte.js').Balloon[],
   *   paired?: boolean,
   *   mini?: boolean,
   *   label?: string,
   * }}
   */
  let { kind, look, balloons, paired = false, mini = false, label = '' } = $props();

  /** Rows of five, like a ten frame. */
  const rows = $derived(Array.from({ length: Math.ceil(balloons.length / 5) }, (_, row) => balloons.slice(row * 5, row * 5 + 5)));
  const noa = $derived(balloons.filter(balloon => balloon.owner === 'noa'));
  const dani = $derived(balloons.filter(balloon => balloon.owner === 'dani'));

  /**
   * How a balloon comes into its new state; every motion is the story's event.
   * @param {Element} node
   * @param {import('./story-round.svelte.js').Balloon['motion']} motion
   */
  function enter(node, motion) {
    if (motion === 'appear') return fly(node, { y: 8, duration: ms(320) });
    if (motion === 'arrive') return fly(node, { y: -56, duration: ms(480) });
    if (motion === 'pop') return scale(node, { start: 1.5, opacity: 0.3, duration: ms(280) });
    if (motion === 'fill') return scale(node, { start: 0.4, duration: ms(360), easing: backOut });
    return { duration: 0 };
  }
</script>

{#snippet balloon(/** @type {import('./story-round.svelte.js').Balloon} */ item)}
  {#key item.key}
    <span
      class="balloon balloon--{item.owner}"
      class:balloon--counted={item.count > 0}
      data-state={item.state}
      in:enter={item.motion}
    ><span class="balloon__mark">{#if item.count}<span in:scale={{ start: 0.4, duration: ms(200) }}>{item.count}</span>{/if}</span></span>
  {/key}
{/snippet}

<span
  class={['scene', `scene--${kind}`, look === 'dots' && 'scene--dots', mini && 'scene--mini']}
  dir="ltr"
  role={mini ? undefined : 'img'}
  aria-label={mini ? undefined : label}
  aria-hidden={mini ? 'true' : undefined}
>
  {#if kind === 'compare'}
    <span class="pairs">
      <span class="pair who" aria-hidden="true"><span class="face">👧</span><span class="face">👦</span></span>
      {#each noa as top, k (k)}
        <span class={['pair', k === 5 && 'pair--group', paired && k < dani.length && 'pair--matched']}>
          {@render balloon(top)}
          {#if dani[k]}{@render balloon(dani[k])}{:else}<span class="balloon balloon--none"></span>{/if}
        </span>
      {/each}
    </span>
  {:else}
    {#each rows as row, r (r)}
      <span class="row">
        {#each row as item, k (k)}{@render balloon(item)}{/each}
      </span>
    {/each}
  {/if}
</span>

<style>
  .scene {
    --size: clamp(28px, 10vw, 52px);
    --dani: #783952;
    display: grid;
    justify-content: center;
    gap: 8px;
    margin: 4px auto;
  }
  .scene--compare { --size: clamp(22px, 7vw, 44px); }
  .row { display: flex; gap: clamp(6px, 2vw, 12px); }
  .pairs { display: flex; align-items: flex-start; gap: clamp(4px, 1.6vw, 10px); }
  .pair { display: grid; gap: 6px; justify-items: center; padding: 4px 2px; border-radius: 12px; transition: background var(--ease); }
  .pair--group { margin-left: clamp(4px, 2vw, 12px); }
  .pair--matched { background: #e7eef7; }
  .who { padding-inline: 0; }
  .face {
    display: grid;
    place-items: start center;
    height: calc(var(--size) * 1.18);
    margin-bottom: calc(var(--size) * 0.5);
    font-size: calc(var(--size) * 0.8);
    line-height: 1.2;
  }

  .balloon {
    --color: var(--part-given);
    position: relative;
    display: grid;
    place-items: center;
    width: var(--size);
    height: calc(var(--size) * 1.18);
    margin-bottom: calc(var(--size) * 0.5);
    border-radius: 50% 50% 46% 46% / 56% 56% 44% 44%;
    background: radial-gradient(circle at 32% 28%, rgba(255, 255, 255, 0.55) 0 10%, transparent 11%), var(--color);
    color: #fff;
    font-size: calc(var(--size) * 0.5);
    font-weight: 700;
  }
  /* The knot and the string. */
  .balloon::before {
    content: '';
    position: absolute;
    top: calc(100% - 2px);
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top: 0;
    border-bottom-color: var(--color);
  }
  .balloon::after {
    content: '';
    position: absolute;
    top: calc(100% + 3px);
    left: calc(50% - 1px);
    width: 2px;
    height: calc(var(--size) * 0.42);
    border-radius: 1px;
    background: #8c96a8;
  }
  .balloon--added { --color: var(--part-added); }
  .balloon--dani { --color: var(--dani); }
  .balloon__mark { line-height: 1; }

  /* Plain circles: the same story, one step closer to the exercise. */
  .scene--dots .balloon, .scene--dots .face { height: var(--size); margin-bottom: 0; }
  .scene--dots .balloon { border-radius: 50%; background: var(--color); }
  .scene--dots .balloon::before, .scene--dots .balloon::after { display: none; }
  .scene--dots .face { place-items: center; }

  .balloon[data-state='hidden'], .balloon--none { visibility: hidden; }
  /* A popped balloon leaves its outline and string, so it can still be counted. */
  .balloon[data-state='popped'] { background: none; box-shadow: inset 0 0 0 2px #c7cfdb; }
  .balloon[data-state='popped']::before { display: none; }
  .balloon[data-state='popped'] .balloon__mark {
    position: absolute;
    inset: 45% -10%;
    border-radius: 2px;
    background: var(--tomato);
    transform: rotate(-45deg);
  }
  .balloon[data-state='empty'] { background: none; border: 2px dashed #9aa6b8; color: var(--hint); }
  .balloon[data-state='empty']::before, .balloon[data-state='empty']::after { display: none; }
  .balloon--counted { box-shadow: 0 0 0 4px rgba(120, 57, 82, 0.35); }

  .scene--mini { --size: clamp(14px, 4vw, 20px); gap: 4px; margin: 0; }
  .scene--mini .row { gap: 4px; }
  .scene--mini .balloon[data-state='popped'] { box-shadow: inset 0 0 0 1.5px #9aa6b8; }
</style>
