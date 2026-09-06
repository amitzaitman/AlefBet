import { it, expect, vi } from 'vitest';
import { shuffle } from '../utils/shuffle.js';

it('permutes every element without mutating the input', () => {
  const random = vi.spyOn(Math, 'random').mockReturnValue(0);
  try {
    const input = ['a', 'b', 'c'];
    expect(shuffle(input)).toEqual(['b', 'c', 'a']);
    expect(input).toEqual(['a', 'b', 'c']);
    expect(shuffle([])).toEqual([]);
    expect(shuffle(['a'])).toEqual(['a']);
  } finally {
    random.mockRestore();
  }
});
