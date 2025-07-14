import { describe, it, expect } from 'vitest';

describe('Example Test', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle basic math', () => {
    expect(2 * 3).toBe(6);
    expect(10 / 2).toBe(5);
  });
});
