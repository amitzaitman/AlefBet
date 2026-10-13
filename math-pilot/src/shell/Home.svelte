<script>
  import { HOME_PROMPT, HOME_TITLE } from './texts.js';

  /** @type {{ games: import('../games.js').GameDefinition[] }} */
  let { games } = $props();
</script>

<main class="home">
  <header class="home__header">
    <h1 class="home__title">{HOME_TITLE}</h1>
    <p class="home__prompt">{HOME_PROMPT}</p>
  </header>
  <ul class="home__games">
    {#each games as game (game.id)}
      <li>
        <a class="game-card" href="#/{game.id}">
          <span class="game-card__icon" aria-hidden="true">{game.icon}</span>
          <span class="game-card__text">
            <span class="game-card__title">{game.title}</span>
            <span class="game-card__description">{game.description}</span>
          </span>
        </a>
      </li>
    {/each}
  </ul>
</main>

<style>
  .home {
    max-width: 760px;
    margin: 0 auto;
    padding: clamp(16px, 4dvh, 40px) 16px;
  }
  .home__header { text-align: center; margin-bottom: clamp(16px, 4dvh, 32px); }
  .home__title {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(30px, 7dvmin, 48px);
    font-weight: 900;
  }
  .home__prompt { margin: 8px 0 0; color: var(--muted); font-size: clamp(18px, 4dvmin, 24px); }
  .home__games {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(300px, 100%), 1fr));
    gap: clamp(12px, 3dvmin, 24px);
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .game-card {
    display: flex;
    align-items: center;
    gap: 16px;
    min-height: 112px;
    padding: 16px 20px;
    border-radius: var(--radius-lg);
    background: var(--paper);
    color: var(--ink);
    text-decoration: none;
    box-shadow: var(--paper-shadow);
    -webkit-tap-highlight-color: transparent;
    transition: transform var(--ease), box-shadow var(--ease);
  }
  .game-card:hover { transform: translateY(-3px); box-shadow: var(--paper-shadow-lifted); }
  .game-card:active { transform: scale(0.98); }
  .game-card__icon {
    display: grid;
    place-items: center;
    flex: none;
    width: 72px;
    height: 72px;
    border-radius: var(--radius-md);
    background: #e8f7f1;
    font-size: 40px;
  }
  .game-card__text { display: grid; gap: 4px; }
  .game-card__title { font-family: var(--font-display); font-size: clamp(22px, 5dvmin, 28px); font-weight: 900; }
  .game-card__description { color: var(--ink-soft); font-size: clamp(16px, 3.6dvmin, 19px); line-height: 1.4; }
</style>
