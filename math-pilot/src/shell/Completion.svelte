<script>
  import { fade } from 'svelte/transition';
  import { ms } from '../lib/motion.js';
  import { CHOOSE_GAME, REPLAY, WELL_DONE, completedText } from './texts.js';

  /** @type {{ total: number, onreplay: () => void }} */
  let { total, onreplay } = $props();
</script>

<main class="completion">
  <section class="completion__card" in:fade={{ duration: ms(300) }}>
    <h2 class="completion__title">{WELL_DONE}</h2>
    <p class="completion__summary">{completedText(total)}</p>
    <div class="completion__actions">
      <button type="button" class="button button--primary" onclick={onreplay}>{REPLAY}</button>
      <a class="button" href="#/">{CHOOSE_GAME}</a>
    </div>
  </section>
</main>

<style>
  .completion {
    display: grid;
    place-items: center;
    min-height: 100dvh;
    padding: 16px;
  }
  .completion__card {
    display: grid;
    justify-items: center;
    gap: clamp(14px, 3dvmin, 28px);
    width: min(100%, 440px);
    padding: clamp(28px, 5dvh, 56px) clamp(20px, 5dvw, 48px);
    border-radius: var(--radius-lg);
    background: var(--paper);
    box-shadow: var(--paper-shadow-lifted);
    text-align: center;
  }
  .completion__title {
    margin: 0;
    color: var(--tomato);
    font-family: var(--font-display);
    font-size: clamp(28px, 7dvmin, 46px);
    font-weight: 900;
  }
  .completion__summary { margin: 0; color: var(--ink-soft); font-size: clamp(17px, 4dvmin, 24px); }
  .completion__actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; }
</style>
