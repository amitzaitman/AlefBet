import { balloonStories } from './games/balloon-stories/index.js';
import { makeTen } from './games/make-ten/index.js';

/**
 * One pilot game: its home-page card and how to play it.
 * @typedef {object} GameDefinition
 * @property {string} id - the hash route, #/<id>
 * @property {string} title
 * @property {string} description - one line on the home page
 * @property {string} icon
 * @property {() => any[]} createRounds - new rounds for every start and replay
 * @property {import('svelte').Component<any>} Round - draws one round; gets `round` and `runner`
 * @property {number} [transitionMs] - pause after a correct answer, before the next round
 */

/**
 * The pilot's game list. The math home page shows these, in this order,
 * the same order as the site's catalog.
 * @type {GameDefinition[]}
 */
export const games = [balloonStories, makeTen];
