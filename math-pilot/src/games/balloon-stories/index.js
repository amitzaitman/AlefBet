import Round from './BalloonStoriesRound.svelte';
import { DESCRIPTION, TITLE, createRounds } from './logic.js';

/**
 * 2600 ms after a correct answer: time to read the story's closing sentence.
 * @type {import('../../games.js').GameDefinition}
 */
export const balloonStories = {
  id: 'balloon-stories', title: TITLE, description: DESCRIPTION, icon: '🎈', createRounds, Round, transitionMs: 2600,
};
