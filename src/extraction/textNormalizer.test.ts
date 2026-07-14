import { describe, it, expect } from 'vitest';
import { normalizeText } from './textNormalizer.js';

describe('normalizeText', () => {
  it('collapses duplicate spaces', () => {
    expect(normalizeText('hello   world')).toBe('hello world');
  });

  it('normalizes unicode currency symbols', () => {
    expect(normalizeText('₹58 LPA')).toContain('₹58 LPA');
  });

  it('preserves paragraph boundaries', () => {
    const input = 'line one\n\nline two';
    expect(normalizeText(input)).toBe(input);
  });

  it('replaces non-breaking spaces', () => {
    expect(normalizeText('hello\u00A0world')).toBe('hello world');
  });
});
