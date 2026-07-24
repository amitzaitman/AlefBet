import { describe, it, expect } from 'vitest';
import { PRAISE_PHRASES, RETRY_HINTS, randomPraise, randomRetryHint } from '../../data/encouragement.js';

describe('encouragement phrase pools', () => {
  it('PRAISE_PHRASES is non-empty and every entry is a non-empty string', () => {
    expect(PRAISE_PHRASES.length).toBeGreaterThan(1);
    for (const phrase of PRAISE_PHRASES) {
      expect(typeof phrase).toBe('string');
      expect(phrase.length).toBeGreaterThan(0);
    }
  });

  it('RETRY_HINTS is non-empty and every entry is a non-empty string', () => {
    expect(RETRY_HINTS.length).toBeGreaterThan(1);
    for (const phrase of RETRY_HINTS) {
      expect(typeof phrase).toBe('string');
      expect(phrase.length).toBeGreaterThan(0);
    }
  });

  it('randomPraise always returns a pool member', () => {
    for (let i = 0; i < 20; i++) {
      expect(PRAISE_PHRASES).toContain(randomPraise());
    }
  });

  it('randomRetryHint always returns a pool member', () => {
    for (let i = 0; i < 20; i++) {
      expect(RETRY_HINTS).toContain(randomRetryHint());
    }
  });
});
