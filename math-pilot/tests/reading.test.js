import { it, expect } from 'vitest';
import { READ_BASE_MS, READ_WORD_MS, readingMs, wordCount } from '../src/lib/reading.js';

it('counts the words a child reads: words and numbers, not signs or emoji', () => {
  expect(wordCount('לְנוֹעָה יֵשׁ 5 בָּלוֹנִים.')).toBe(4);
  expect(wordCount('5 − 2 = 3')).toBe(3);
  expect(wordCount('עוֹד פַּעַם 🔁')).toBe(2);
  expect(readingMs('לְנוֹעָה יֵשׁ 5 בָּלוֹנִים.')).toBe(READ_BASE_MS + 4 * READ_WORD_MS);
});

it('gives a sentence the time a first grader needs: 30 to 60 words a minute', () => {
  for (const sentence of ['2 בָּלוֹנִים הִתְפּוֹצְצוּ!', 'לְנוֹעָה יֵשׁ 5 בָּלוֹנִים.', 'סָבְתָא הֵבִיאָה לָהּ עוֹד 3 בָּלוֹנִים.']) {
    const perMinute = wordCount(sentence) / (readingMs(sentence) / 60_000);
    expect(perMinute, sentence).toBeGreaterThanOrEqual(30);
    expect(perMinute, sentence).toBeLessThanOrEqual(60);
  }
});
