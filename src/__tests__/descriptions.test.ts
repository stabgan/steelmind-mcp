import { describe, it, expect } from 'vitest';
import { THINK_DESCRIPTION, VERIFY_DESCRIPTION, SYSTEM_PROMPT } from '../descriptions.js';

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

describe('THINK_DESCRIPTION', () => {
  it('is between 80-130 words', () => {
    const count = wordCount(THINK_DESCRIPTION);
    expect(count).toBeGreaterThanOrEqual(80);
    expect(count).toBeLessThanOrEqual(130);
  });

  it('leads with purpose (primacy effect)', () => {
    expect(THINK_DESCRIPTION).toMatch(/^Use this tool to/);
  });

  it('includes "when NOT to use" guidance (ToolACE)', () => {
    expect(THINK_DESCRIPTION).toMatch(/Do NOT use/i);
  });

  it('embeds Socratic self-questioning', () => {
    expect(THINK_DESCRIPTION).toMatch(/What am I assuming/);
    expect(THINK_DESCRIPTION).toMatch(/What evidence supports/);
  });

  it('does NOT instruct to "think harder" (DC-4)', () => {
    expect(THINK_DESCRIPTION.toLowerCase()).not.toMatch(/think harder/);
  });

  it('frames as recording, not commanding', () => {
    expect(THINK_DESCRIPTION).toMatch(/record/i);
  });

  it('mentions no state change', () => {
    expect(THINK_DESCRIPTION).toMatch(/not.*change any state/i);
  });

  it('references adjustable totalThoughts', () => {
    expect(THINK_DESCRIPTION).toMatch(/totalThoughts/);
  });

  it('cross-references verify tool', () => {
    expect(THINK_DESCRIPTION).toMatch(/verify tool/i);
  });

  it('mentions nextThoughtNeeded transition', () => {
    expect(THINK_DESCRIPTION).toMatch(/nextThoughtNeeded/);
  });
});

describe('VERIFY_DESCRIPTION', () => {
  it('is between 80-130 words', () => {
    const count = wordCount(VERIFY_DESCRIPTION);
    expect(count).toBeGreaterThanOrEqual(80);
    expect(count).toBeLessThanOrEqual(130);
  });

  it('leads with purpose (primacy effect)', () => {
    expect(VERIFY_DESCRIPTION).toMatch(/^Use this tool to/);
  });

  it('includes "when NOT to use" guidance (ToolACE)', () => {
    expect(VERIFY_DESCRIPTION).toMatch(/Do NOT use/i);
  });

  it('embeds steel-manning prompt (SIEV, MetaCrit)', () => {
    expect(VERIFY_DESCRIPTION).toMatch(/steel-man/i);
    expect(VERIFY_DESCRIPTION).toMatch(/strongest argument/i);
  });

  it('does NOT instruct to "think harder" (DC-4)', () => {
    expect(VERIFY_DESCRIPTION.toLowerCase()).not.toMatch(/think harder/);
  });

  it('mentions no state change', () => {
    expect(VERIFY_DESCRIPTION).toMatch(/not.*change any state/i);
  });

  it('cross-references think tool', () => {
    expect(VERIFY_DESCRIPTION).toMatch(/think tool/i);
  });
});

describe('SYSTEM_PROMPT', () => {
  it('is under 500 tokens (~375 words)', () => {
    expect(wordCount(SYSTEM_PROMPT)).toBeLessThanOrEqual(375);
  });

  it('contains workflow guidance for both tools', () => {
    expect(SYSTEM_PROMPT).toMatch(/think tool/i);
    expect(SYSTEM_PROMPT).toMatch(/verify tool/i);
  });

  it('contains think, verify, and bad examples', () => {
    expect(SYSTEM_PROMPT).toMatch(/think_example/);
    expect(SYSTEM_PROMPT).toMatch(/verify_example/);
    expect(SYSTEM_PROMPT).toMatch(/bad_example/);
  });

  it('bad example explains WHY it is bad', () => {
    expect(SYSTEM_PROMPT).toMatch(/adds tokens without insight/i);
  });

  it('mentions totalThoughts adjustment', () => {
    expect(SYSTEM_PROMPT).toMatch(/totalThoughts/i);
  });

  it('mentions nextThoughtNeeded transition to verify', () => {
    expect(SYSTEM_PROMPT).toMatch(/nextThoughtNeeded.*false/i);
  });
});

describe('description separation (DC-3)', () => {
  it('think and verify descriptions are different strings', () => {
    expect(THINK_DESCRIPTION).not.toBe(VERIFY_DESCRIPTION);
  });

  it('think uses "thought" terminology, verify uses "concern"', () => {
    expect(THINK_DESCRIPTION).toMatch(/thought/i);
    expect(VERIFY_DESCRIPTION).toMatch(/concern|self-assessment/i);
  });
});
