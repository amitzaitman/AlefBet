<script>
  import { PROGRESS } from './texts.js';

  /** @type {{ value: number, total: number }} */
  let { value, total } = $props();
</script>

<div class="progress" role="progressbar" aria-label={PROGRESS} aria-valuemin="0" aria-valuemax={total} aria-valuenow={value}>
  <div class="progress__track">
    <div class="progress__fill" style:width="{(value / total) * 100}%"></div>
  </div>
  <span class="progress__label" dir="ltr">{value} / {total}</span>
</div>

<style>
  .progress { display: flex; align-items: center; gap: clamp(12px, 2.6dvmin, 22px); padding: 4px 6px; }
  .progress__track {
    flex: 1;
    height: clamp(14px, 2.4dvmin, 22px);
    overflow: hidden;
    border: 2px solid var(--border);
    border-radius: 999px;
    background: var(--paper-3);
  }
  .progress__fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, var(--tomato), var(--ochre));
    transition: width 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
  }
  .progress__label {
    min-width: 56px;
    color: var(--ink-soft);
    font-family: var(--font-display);
    font-size: clamp(15px, 3.3dvmin, 20px);
    font-weight: 700;
    text-align: center;
    white-space: nowrap;
  }
</style>
