<script>
  import Completion from './Completion.svelte';
  import ProgressBar from './ProgressBar.svelte';
  import { RoundRunner } from './round-runner.svelte.js';
  import { HOME_TITLE } from './texts.js';

  /** @type {{ game: import('../games.js').GameDefinition }} */
  let { game } = $props();

  const start = () => new RoundRunner(game.createRounds(), { transitionMs: game.transitionMs });
  let runner = $state.raw(start());

  // A replaced or unmounted runner never moves on to a round nobody sees.
  $effect(() => {
    const current = runner;
    return () => current.destroy();
  });
</script>

{#if runner.finished}
  <Completion total={runner.total} onreplay={() => { runner = start(); }} />
{:else}
  <div class="game">
    <header class="game-header">
      <h1 class="game-title">{game.title}</h1>
      <a class="home-button" href="#/" aria-label={HOME_TITLE}>🏠</a>
    </header>
    <main class="game-body">
      <!-- Each round is a new component: its state, timers and feedback end with it. -->
      {#key runner}
        {#key runner.index}
          <game.Round round={runner.round} {runner} />
        {/key}
      {/key}
    </main>
    <footer class="game-footer">
      <ProgressBar value={runner.solved} total={runner.total} />
    </footer>
  </div>
{/if}

<style>
  .game {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
    padding: clamp(12px, 3dvh, 24px) 16px;
  }
  .game-header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 84px;
    padding-inline: calc(var(--touch) + 8px);
  }
  .game-title {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(26px, 6.4dvmin, 46px);
    font-weight: 900;
    line-height: 1.1;
    text-align: center;
  }
  .home-button {
    position: absolute;
    inset-inline-end: 0;
    display: grid;
    place-items: center;
    width: var(--touch);
    height: var(--touch);
    border: 2px solid var(--border);
    border-radius: var(--radius-sm);
    background: var(--paper);
    box-shadow: var(--paper-shadow);
    font-size: 30px;
    line-height: 1;
    text-decoration: none;
    -webkit-tap-highlight-color: transparent;
  }
  .game-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(10px, 2.4dvmin, 20px);
    padding: clamp(8px, 2dvh, 20px) 0;
    text-align: center;
  }
  .game-footer { flex: none; padding-top: 12px; }
</style>
