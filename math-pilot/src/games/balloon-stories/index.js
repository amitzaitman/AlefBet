import Round from './BalloonStoriesRound.svelte';
import { DESCRIPTION, TITLE, createRounds, pauseAfter } from './logic.js';

/**
 * After a correct answer the next round waits until the closing sentence has been read.
 * @type {import('../../games.js').GameDefinition}
 */
export const balloonStories = {
  id: 'balloon-stories', title: TITLE, description: DESCRIPTION, icon: '🎈', createRounds, Round, transitionMs: pauseAfter,
};
