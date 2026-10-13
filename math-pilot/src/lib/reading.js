/**
 * The pilot has no audio, so every text a child must read waits for reading,
 * at one pace. First graders read pointed Hebrew at roughly 30 to 60 words a
 * minute: 1 s to find the line and 0.9 s a word gives about 50 words a minute
 * for a four-word sentence. Check it with real children.
 */
export const READ_BASE_MS = 1000;
export const READ_WORD_MS = 900;
/** A text stays this much longer than its reading time, so it does not go as the last word is read. */
export const HOLD_MS = 1000;

/**
 * The words a child reads: anything with a letter or a digit, not '−', '=' or an emoji.
 * @param {string} text
 * @returns {number}
 */
export const wordCount = text => text.split(/\s+/).filter(word => /[א-ת0-9]/.test(word)).length;

/**
 * How long a child who is learning to read needs for `text`.
 * @param {string} text
 * @returns {number} milliseconds
 */
export const readingMs = text => READ_BASE_MS + wordCount(text) * READ_WORD_MS;
