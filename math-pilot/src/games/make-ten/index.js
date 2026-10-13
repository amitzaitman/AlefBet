import Round from './MakeTenRound.svelte';
import { DESCRIPTION, TITLE, createRounds } from './logic.js';

/** @type {import('../../games.js').GameDefinition} */
export const makeTen = { id: 'make-ten', title: TITLE, description: DESCRIPTION, icon: '🔟', createRounds, Round };
