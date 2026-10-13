<script>
  import { fly } from 'svelte/transition';
  import { ms } from '../lib/motion.js';

  /** @type {{ feedback: import('./feedback.svelte.js').Feedback }} */
  let { feedback } = $props();
</script>

<!-- Keeps its height when empty, so nothing on the screen jumps when a message comes or goes. -->
<p class={['feedback', feedback.tone && `feedback--${feedback.tone}`]} role="status" aria-live="polite">
  {#key feedback.count}
    <span in:fly={{ y: 10, duration: ms(220) }}>{feedback.text}</span>
  {/key}
</p>

<style>
  .feedback {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 4.5rem;
    margin: 0;
    padding: 8px 12px;
    font-family: var(--font-display);
    font-size: clamp(20px, 5dvmin, 28px);
    font-weight: 900;
    line-height: 1.4;
  }
  .feedback--correct { color: var(--solved); }
  .feedback--hint { color: var(--hint); }
</style>
