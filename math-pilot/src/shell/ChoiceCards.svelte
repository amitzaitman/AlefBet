<script>
  /**
   * Number cards for a choice round. The runner's lock disables them while
   * an answer is handled; the correct card stays marked after it is chosen.
   * @type {{ choices: number[], locked: boolean, correct?: number | null, onchoose: (value: number) => void }}
   */
  let { choices, locked, correct = null, onchoose } = $props();
</script>

<div class="choices">
  {#each choices as value (value)}
    <button
      type="button"
      class="choice"
      class:choice--correct={value === correct}
      data-value={value}
      disabled={locked}
      onclick={() => onchoose(value)}
    >{value}</button>
  {/each}
</div>

<style>
  .choices {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: clamp(14px, 3dvmin, 28px);
    width: 100%;
    max-width: 540px;
    padding: clamp(6px, 1.5dvmin, 12px);
  }
  .choice {
    min-height: clamp(96px, 19dvmin, 160px);
    border: none;
    border-radius: var(--radius-lg);
    background: var(--paper);
    color: var(--ink);
    font-family: var(--font-display);
    font-size: clamp(32px, 8dvmin, 48px);
    font-weight: 900;
    cursor: pointer;
    box-shadow: var(--paper-shadow);
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition: transform var(--ease), box-shadow var(--ease), background var(--ease);
  }
  .choice:hover:not(:disabled) { transform: translateY(-4px); box-shadow: var(--paper-shadow-lifted); }
  .choice:active:not(:disabled) { transform: translateY(-1px) scale(0.985); }
  .choice:disabled { cursor: default; opacity: 0.78; }
  .choice:focus-visible { outline: 3px solid var(--tomato); }
  .choice--correct,
  .choice--correct:disabled {
    background: #eaf6f0;
    opacity: 1;
    box-shadow: 0 0 0 3px var(--solved), 0 0 0 7px rgba(42, 123, 113, 0.18), var(--paper-shadow-lifted);
    animation: stamp 0.5s ease-out;
  }
  @keyframes stamp {
    35% { transform: scale(1.12); }
    70% { transform: scale(0.97); }
  }
</style>
