import { it, expect } from 'vitest';
import { PRAISE_PHRASES, RETRY_HINTS, randomPraise, randomRetryHint } from '../../data/encouragement.js';

it.each([
  ['PRAISE_PHRASES', PRAISE_PHRASES, randomPraise],
  ['RETRY_HINTS', RETRY_HINTS, randomRetryHint],
])('%s holds several non-empty strings, and its random pick always returns a pool member', (_, pool, pick) => {
  expect(pool.length).toBeGreaterThan(1);
  for (const phrase of pool) {
    expect(typeof phrase).toBe('string');
    expect(phrase.length).toBeGreaterThan(0);
  }
  for (let i = 0; i < 20; i++) expect(pool).toContain(pick());
});
