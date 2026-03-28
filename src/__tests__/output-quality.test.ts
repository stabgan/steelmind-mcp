import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../index.js';
import { SYSTEM_PROMPT } from '../descriptions.js';

describe('Output Quality', () => {
  let client: Client;
  let cleanup: () => Promise<void>;

  async function connect(): Promise<void> {
    const server = createServer();
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    client = new Client({ name: 'test-client', version: '1.0.0' });
    await client.connect(clientTransport);
    cleanup = async () => {
      await client.close();
      await server.close();
    };
  }

  beforeEach(async () => {
    await connect();
  });

  afterEach(async () => {
    await cleanup();
  });

  function extractText(result: Awaited<ReturnType<typeof client.callTool>>): string {
    return (result.content as Array<{ type: string; text: string }>)[0].text;
  }

  function thinkArgs(
    thought: string,
    num = 1,
    total = 1,
    next = true,
  ): { thought: string; thoughtNumber: number; totalThoughts: number; nextThoughtNeeded: boolean } {
    return { thought, thoughtNumber: num, totalThoughts: total, nextThoughtNeeded: next };
  }

  // ─── 1. Think Output Structure ─────────────────────────────────────

  describe('think output structure', () => {
    it('includes step prefix [Thinking N/M]', async () => {
      const text = extractText(
        await client.callTool({ name: 'think', arguments: thinkArgs('test', 2, 5) }),
      );
      expect(text).toMatch(/^\[Thinking 2\/5\]/);
    });

    it('includes thought content after prefix', async () => {
      const text = extractText(
        await client.callTool({ name: 'think', arguments: thinkArgs('my analysis') }),
      );
      expect(text).toContain('my analysis');
    });

    it('includes verify nudge when nextThoughtNeeded=false', async () => {
      const text = extractText(
        await client.callTool({
          name: 'think',
          arguments: thinkArgs('final conclusion', 3, 3, false),
        }),
      );
      expect(text).toMatch(/verify tool/i);
      expect(text).toContain('final conclusion');
    });

    it('does NOT include verify nudge when nextThoughtNeeded=true', async () => {
      const text = extractText(
        await client.callTool({ name: 'think', arguments: thinkArgs('still working', 1, 3) }),
      );
      expect(text).not.toMatch(/verify tool/i);
    });

    it('returns exactly one content item', async () => {
      const result = await client.callTool({
        name: 'think',
        arguments: thinkArgs('test'),
      });
      expect(result.content as unknown[]).toHaveLength(1);
    });

    it('content item has type "text"', async () => {
      const result = await client.callTool({
        name: 'think',
        arguments: thinkArgs('test'),
      });
      expect((result.content as Array<{ type: string }>)[0].type).toBe('text');
    });
  });

  // ─── 2. Think Identity Preservation ────────────────────────────────

  describe('think identity preservation', () => {
    const cases: [string, string][] = [
      ['plain ASCII', 'The quick brown fox jumps over the lazy dog.'],
      ['JSON string', '{"key": "value", "nested": {"arr": [1, 2, 3]}}'],
      ['markdown', '# Heading\n\n- bullet\n- **bold**\n\n```code```'],
      ['HTML/XML tags', '<div class="test">content &amp; more</div>'],
      ['backslashes', 'path\\to\\file and regex \\d+\\.\\d+'],
      ['quotes', 'she said "hello" and \'goodbye\''],
      ['newlines and tabs', 'line1\nline2\n\ttabbed\r\nwindows-style'],
      ['emoji sequences', '👨‍👩‍👧‍👦 family, 🏳️‍🌈 flag, 👋🏽 skin tone'],
      ['CJK characters', '思考する verify 検証 확인하다 验证'],
      ['Arabic RTL', 'التحقق من الاستدلال'],
      ['combining diacritics', 'e\u0301 vs é — n\u0303 vs ñ'],
      ['zero-width chars', 'zero\u200Bwidth\u200Cjoiner\u200Dhere\uFEFFbom'],
      ['surrogate pairs', '𝕳𝖊𝖑𝖑𝖔 𝕎𝕠𝕣𝕝𝕕 — 𝄞 music'],
      ['very long', 'a'.repeat(50_000)],
      ['only whitespace', '   \t\t\n\n   '],
      ['single character', 'x'],
    ];

    for (const [label, input] of cases) {
      it(`preserves: ${label}`, async () => {
        const text = extractText(
          await client.callTool({ name: 'think', arguments: thinkArgs(input) }),
        );
        expect(text).toContain(input);
      });
    }
  });

  // ─── 3. Verify Identity Preservation ───────────────────────────────

  describe('verify identity preservation', () => {
    const cases: [string, string][] = [
      ['plain ASCII', 'Is my assumption about thread safety correct?'],
      ['JSON payload', '{"error": null, "data": [true, false]}'],
      ['code snippet', 'if (x === null) throw new Error("unexpected null");'],
      ['multiline', 'Line 1: assumption\nLine 2: evidence\nLine 3: conclusion'],
      ['emoji + unicode', '⚠️ Edge case: 空の入力 → crash?'],
      ['SQL injection', "'; DROP TABLE users; --"],
      ['regex special chars', '^(?:foo|bar)\\b.*?\\d{3,}$'],
      ['URL with params', 'https://example.com/api?key=val&other=123#fragment'],
    ];

    for (const [label, input] of cases) {
      it(`preserves: ${label}`, async () => {
        const text = extractText(
          await client.callTool({ name: 'verify', arguments: { concern: input } }),
        );
        expect(text).toBe(input);
      });
    }
  });

  // ─── 4. Verify Output Minimality ───────────────────────────────────

  describe('verify output minimality', () => {
    it('verify output is exactly the input string', async () => {
      const input = 'My critical self-assessment';
      const text = extractText(
        await client.callTool({ name: 'verify', arguments: { concern: input } }),
      );
      expect(text).toBe(input);
      expect(text.length).toBe(input.length);
    });

    it('verify does not add timestamps or metadata', async () => {
      const input = 'no metadata please';
      const text = extractText(
        await client.callTool({ name: 'verify', arguments: { concern: input } }),
      );
      expect(text).toBe(input);
    });
  });

  // ─── 5. Prompt Output Quality ──────────────────────────────────────

  describe('prompt output quality', () => {
    it('returns exactly one message with role "user"', async () => {
      const result = await client.getPrompt({ name: 'steelmind' });
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].role).toBe('user');
    });

    it('message text matches SYSTEM_PROMPT exactly', async () => {
      const result = await client.getPrompt({ name: 'steelmind' });
      expect((result.messages[0].content as { text: string }).text).toBe(SYSTEM_PROMPT);
    });

    it('contains structured XML sections for compaction survivability', async () => {
      const result = await client.getPrompt({ name: 'steelmind' });
      const text = (result.messages[0].content as { text: string }).text;
      expect(text).toContain('<think_example>');
      expect(text).toContain('</think_example>');
      expect(text).toContain('<verify_example>');
      expect(text).toContain('</verify_example>');
      expect(text).toContain('<bad_example>');
      expect(text).toContain('</bad_example>');
    });

    it('uses bullet points for compaction survivability', async () => {
      const result = await client.getPrompt({ name: 'steelmind' });
      const text = (result.messages[0].content as { text: string }).text;
      const bulletCount = (text.match(/^- /gm) || []).length;
      expect(bulletCount).toBeGreaterThanOrEqual(4);
    });
  });

  // ─── 6. Concurrent Correctness ─────────────────────────────────────

  describe('concurrent correctness', () => {
    it('parallel think calls return their own input', async () => {
      const inputs = Array.from({ length: 20 }, (_, i) => `thought-${i}-${Math.random()}`);
      const results = await Promise.all(
        inputs.map((thought, i) =>
          client.callTool({
            name: 'think',
            arguments: thinkArgs(thought, i + 1, 20),
          }),
        ),
      );
      for (let i = 0; i < inputs.length; i++) {
        expect(extractText(results[i])).toContain(inputs[i]);
      }
    });

    it('parallel verify calls return their own input', async () => {
      const inputs = Array.from({ length: 20 }, (_, i) => `concern-${i}-${Math.random()}`);
      const results = await Promise.all(
        inputs.map((concern) => client.callTool({ name: 'verify', arguments: { concern } })),
      );
      for (let i = 0; i < inputs.length; i++) {
        expect(extractText(results[i])).toBe(inputs[i]);
      }
    });
  });

  // ─── 7. Tool Listing Output Quality ────────────────────────────────

  describe('tool listing output quality', () => {
    it('each tool has a non-empty description', async () => {
      const { tools } = await client.listTools();
      for (const tool of tools) {
        expect(tool.description).toBeTruthy();
        expect(tool.description!.length).toBeGreaterThan(50);
      }
    });

    it('think requires 4 fields, verify requires 1 (different cognitive modes)', async () => {
      const { tools } = await client.listTools();
      const think = tools.find((t) => t.name === 'think')!;
      const verify = tools.find((t) => t.name === 'verify')!;
      expect(think.inputSchema.required).toHaveLength(4);
      expect(verify.inputSchema.required).toHaveLength(1);
    });

    it('no tool has outputSchema', async () => {
      const { tools } = await client.listTools();
      for (const tool of tools) {
        expect(tool.outputSchema).toBeUndefined();
      }
    });
  });
});
