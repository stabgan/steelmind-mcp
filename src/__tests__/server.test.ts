import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../index.js';
import { THINK_DESCRIPTION, VERIFY_DESCRIPTION, SYSTEM_PROMPT } from '../descriptions.js';

describe('Steelmind MCP Server', () => {
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

  // ─── Server Identity ───────────────────────────────────────────────

  describe('server identity', () => {
    it('reports correct name and version', () => {
      const info = client.getServerVersion();
      expect(info?.name).toBe('steelmind-mcp');
      expect(info?.version).toBe('2.0.0');
    });

    it('advertises tools and prompts capabilities', () => {
      const caps = client.getServerCapabilities();
      expect(caps?.tools).toBeDefined();
      expect(caps?.prompts).toBeDefined();
    });
  });

  // ─── Tool Listing ──────────────────────────────────────────────────

  describe('listTools', () => {
    it('exposes exactly 2 tools', async () => {
      const { tools } = await client.listTools();
      expect(tools).toHaveLength(2);
    });

    it('exposes think and verify by name', async () => {
      const { tools } = await client.listTools();
      const names = tools.map((t) => t.name);
      expect(names).toContain('think');
      expect(names).toContain('verify');
    });

    it('think tool has correct input schema with step tracking', async () => {
      const { tools } = await client.listTools();
      const think = tools.find((t) => t.name === 'think')!;
      expect(think.inputSchema.type).toBe('object');
      expect(think.inputSchema.required).toEqual([
        'thought',
        'thoughtNumber',
        'totalThoughts',
        'nextThoughtNeeded',
      ]);
      expect(think.inputSchema.properties).toHaveProperty('thought');
      expect(think.inputSchema.properties).toHaveProperty('thoughtNumber');
      expect(think.inputSchema.properties).toHaveProperty('totalThoughts');
      expect(think.inputSchema.properties).toHaveProperty('nextThoughtNeeded');
    });

    it('verify tool has concern field (not thought)', async () => {
      const { tools } = await client.listTools();
      const verify = tools.find((t) => t.name === 'verify')!;
      expect(verify.inputSchema.required).toEqual(['concern']);
      expect(verify.inputSchema.properties).toHaveProperty('concern');
      expect(verify.inputSchema.properties).not.toHaveProperty('thought');
    });

    it('think description matches descriptions.ts export', async () => {
      const { tools } = await client.listTools();
      const think = tools.find((t) => t.name === 'think')!;
      expect(think.description).toBe(THINK_DESCRIPTION);
    });

    it('verify description matches descriptions.ts export', async () => {
      const { tools } = await client.listTools();
      const verify = tools.find((t) => t.name === 'verify')!;
      expect(verify.description).toBe(VERIFY_DESCRIPTION);
    });
  });

  // ─── Think Tool ────────────────────────────────────────────────────

  describe('think tool (structured output)', () => {
    it('returns thought with step prefix when nextThoughtNeeded=true', async () => {
      const result = await client.callTool({
        name: 'think',
        arguments: {
          thought: 'What assumptions am I making here?',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
        },
      });
      const text = (result.content as Array<{ text: string }>)[0].text;
      expect(text).toContain('[Thinking 1/3]');
      expect(text).toContain('What assumptions am I making here?');
    });

    it('includes verify nudge when nextThoughtNeeded=false', async () => {
      const result = await client.callTool({
        name: 'think',
        arguments: {
          thought: 'My conclusion is X.',
          thoughtNumber: 3,
          totalThoughts: 3,
          nextThoughtNeeded: false,
        },
      });
      const text = (result.content as Array<{ text: string }>)[0].text;
      expect(text).toContain('[Thinking 3/3]');
      expect(text).toContain('My conclusion is X.');
      expect(text).toMatch(/verify tool/i);
    });

    it('does NOT include verify nudge when nextThoughtNeeded=true', async () => {
      const result = await client.callTool({
        name: 'think',
        arguments: {
          thought: 'Still thinking...',
          thoughtNumber: 1,
          totalThoughts: 5,
          nextThoughtNeeded: true,
        },
      });
      const text = (result.content as Array<{ text: string }>)[0].text;
      expect(text).not.toMatch(/verify tool/i);
    });

    it('preserves unicode and special characters in thought', async () => {
      const input = '思考: émojis 🧠 & "quotes" <tags> \n\tnewlines';
      const result = await client.callTool({
        name: 'think',
        arguments: {
          thought: input,
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: true,
        },
      });
      const text = (result.content as Array<{ text: string }>)[0].text;
      expect(text).toContain(input);
    });

    it('handles very long input', async () => {
      const longThought = 'x'.repeat(100_000);
      const result = await client.callTool({
        name: 'think',
        arguments: {
          thought: longThought,
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: true,
        },
      });
      const text = (result.content as Array<{ text: string }>)[0].text;
      expect(text).toContain(longThought);
    });

    it('is not marked as an error', async () => {
      const result = await client.callTool({
        name: 'think',
        arguments: {
          thought: 'test',
          thoughtNumber: 1,
          totalThoughts: 1,
          nextThoughtNeeded: false,
        },
      });
      expect(result.isError).toBeFalsy();
    });

    it('supports adjustable totalThoughts', async () => {
      const r1 = await client.callTool({
        name: 'think',
        arguments: {
          thought: 'initial plan',
          thoughtNumber: 1,
          totalThoughts: 3,
          nextThoughtNeeded: true,
        },
      });
      expect((r1.content as Array<{ text: string }>)[0].text).toContain('[Thinking 1/3]');

      const r2 = await client.callTool({
        name: 'think',
        arguments: {
          thought: 'this is more complex than expected',
          thoughtNumber: 2,
          totalThoughts: 7,
          nextThoughtNeeded: true,
        },
      });
      expect((r2.content as Array<{ text: string }>)[0].text).toContain('[Thinking 2/7]');
    });
  });

  // ─── Verify Tool ───────────────────────────────────────────────────

  describe('verify tool (identity function)', () => {
    it('returns the concern unchanged', async () => {
      const result = await client.callTool({
        name: 'verify',
        arguments: { concern: 'Am I sure the recursive approach is safe?' },
      });
      expect(result.content).toEqual([
        { type: 'text', text: 'Am I sure the recursive approach is safe?' },
      ]);
    });

    it('handles empty string', async () => {
      const result = await client.callTool({
        name: 'verify',
        arguments: { concern: '' },
      });
      expect(result.content).toEqual([{ type: 'text', text: '' }]);
    });

    it('preserves unicode and special characters', async () => {
      const input = 'Vérification: 検証 🔍 & "edge cases" <xml/>';
      const result = await client.callTool({
        name: 'verify',
        arguments: { concern: input },
      });
      expect(result.content).toEqual([{ type: 'text', text: input }]);
    });

    it('is not marked as an error', async () => {
      const result = await client.callTool({
        name: 'verify',
        arguments: { concern: 'test' },
      });
      expect(result.isError).toBeFalsy();
    });
  });

  // ─── Unknown Tool ──────────────────────────────────────────────────

  describe('unknown tool', () => {
    it('throws for unknown tool name', async () => {
      await expect(client.callTool({ name: 'nonexistent', arguments: {} })).rejects.toThrow();
    });
  });

  // ─── Prompts ───────────────────────────────────────────────────────

  describe('prompts', () => {
    it('exposes exactly 1 prompt named steelmind', async () => {
      const { prompts } = await client.listPrompts();
      expect(prompts).toHaveLength(1);
      expect(prompts[0].name).toBe('steelmind');
    });

    it('returns the system prompt content', async () => {
      const result = await client.getPrompt({ name: 'steelmind' });
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].role).toBe('user');
      expect(result.messages[0].content).toEqual({ type: 'text', text: SYSTEM_PROMPT });
    });

    it('throws for unknown prompt name', async () => {
      await expect(client.getPrompt({ name: 'nonexistent' })).rejects.toThrow();
    });
  });

  // ─── Statelessness ─────────────────────────────────────────────────

  describe('statelessness', () => {
    it('interleaved think and verify calls are independent', async () => {
      const t1 = await client.callTool({
        name: 'think',
        arguments: {
          thought: 'plan approach',
          thoughtNumber: 1,
          totalThoughts: 2,
          nextThoughtNeeded: true,
        },
      });
      const v1 = await client.callTool({
        name: 'verify',
        arguments: { concern: 'is this safe?' },
      });
      const t2 = await client.callTool({
        name: 'think',
        arguments: {
          thought: 'revised plan',
          thoughtNumber: 2,
          totalThoughts: 2,
          nextThoughtNeeded: false,
        },
      });

      expect((t1.content as Array<{ text: string }>)[0].text).toContain('plan approach');
      expect(v1.content).toEqual([{ type: 'text', text: 'is this safe?' }]);
      expect((t2.content as Array<{ text: string }>)[0].text).toContain('revised plan');
      expect((t2.content as Array<{ text: string }>)[0].text).toMatch(/verify tool/i);
    });
  });
});
