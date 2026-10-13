/**
 * Motion that explains something (a cell filling, a hint arriving) and
 * nothing else. When the device asks for less motion, every duration is 0.
 */
const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** @param {number} value milliseconds @returns {number} */
export const ms = value => (reduced ? 0 : value);
