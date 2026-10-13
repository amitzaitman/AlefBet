<script>
  import GameShell from './shell/GameShell.svelte';
  import Home from './shell/Home.svelte';
  import { HOME_TITLE } from './shell/texts.js';
  import { games } from './games.js';

  // Hash routes (#/make-ten) work from any folder the build is copied to.
  // A mangled link ('#/%') opens the math home instead of a blank page.
  function routeFromHash() {
    try {
      return decodeURIComponent(location.hash.replace(/^#\/?/, ''));
    } catch {
      return '';
    }
  }
  let route = $state(routeFromHash());
  const game = $derived(games.find(entry => entry.id === route));

  function followHash() {
    route = routeFromHash();
    scrollTo(0, 0);
  }
</script>

<svelte:window onhashchange={followHash} />
<svelte:head><title>{game?.title ?? HOME_TITLE}</title></svelte:head>

{#if game}
  {#key game.id}
    <GameShell {game} />
  {/key}
{:else}
  <Home {games} />
{/if}
