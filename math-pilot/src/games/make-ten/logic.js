/**
 * Make ten: how much is missing up to ten? The child sees a ten frame with
 * some cells full, the exercise `given + ? = 10`, and four number cards.
 * Ported from games/make-ten with the same rounds, choices and hint.
 */
import { shuffle } from '../../lib/shuffle.js';

export const TITLE = 'מַשְׁלִימִים לְעֶשֶׂר';
export const DESCRIPTION = 'סוֹפְרִים מִשְׁבָּצוֹת וּבוֹחֲרִים כַּמָּה חָסֵר עַד עֶשֶׂר';
export const INSTRUCTION = 'כַּמָּה חָסֵר עַד עֶשֶׂר?';
/** The help after every wrong answer: back to the picture. */
export const HINT = 'סִפְרוּ אֶת הַמִּשְׁבָּצוֹת הָרֵיקוֹת';
export const WHOLE = 10;
export const ROUND_COUNT = 6;

/** @typedef {{ given: number, choices: number[] }} Round */

/** @param {{ given: number }} round @returns {number} */
export const answerFor = ({ given }) => WHOLE - given;

/**
 * The answer and three other numbers from 0 to 10, in random order.
 * @param {number} given
 * @returns {number[]}
 */
export function choicesFor(given) {
  const answer = WHOLE - given;
  const others = shuffle(Array.from({ length: WHOLE + 1 }, (_, n) => n).filter(n => n !== answer)).slice(0, 3);
  return shuffle([answer, ...others]);
}

/**
 * Six rounds, each with a different number of full cells from 0 to 10.
 * @returns {Round[]}
 */
export function createRounds() {
  return shuffle(Array.from({ length: WHOLE + 1 }, (_, given) => given))
    .slice(0, ROUND_COUNT)
    .map(given => ({ given, choices: choicesFor(given) }));
}

/**
 * What a screen reader says about the ten frame.
 * @param {number} given
 * @returns {string}
 */
export const frameLabel = given => (given === 1
  ? `מִשְׁבֶּצֶת אַחַת מְלֵאָה מִתּוֹךְ ${WHOLE}`
  : `${given} מִשְׁבָּצוֹת מְלֵאוֹת מִתּוֹךְ ${WHOLE}`);
