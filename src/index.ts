#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { THINK_DESCRIPTION, VERIFY_DESCRIPTION, SYSTEM_PROMPT } from './descriptions.js';

/**
 * Creates and configures the Steelmind MCP server with all tool and prompt handlers.
 * Exported for testing — the server is fully functional but not yet connected to a transport.
 */
export function createServer(): Server {
  const server = new Server(
    { name: 'steelmind-mcp', version: '2.0.0' },
    { capabilities: { tools: {}, prompts: {} } },
  );

  server.onerror = (error) => console.error('[MCP Error]', error);

  // --- Tools ---

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'think',
        description: THINK_DESCRIPTION,
        inputSchema: {
          type: 'object' as const,
          properties: {
            thought: {
              type: 'string' as const,
              description: 'Your current thinking step.',
            },
            thoughtNumber: {
              type: 'integer' as const,
              description: 'Current thought number in the sequence.',
            },
            totalThoughts: {
              type: 'integer' as const,
              description:
                'Estimated total thoughts needed. Can be adjusted up or down as you progress.',
            },
            nextThoughtNeeded: {
              type: 'boolean' as const,
              description: 'Whether another thinking step is needed after this one.',
            },
          },
          required: ['thought', 'thoughtNumber', 'totalThoughts', 'nextThoughtNeeded'],
        },
      },
      {
        name: 'verify',
        description: VERIFY_DESCRIPTION,
        inputSchema: {
          type: 'object' as const,
          properties: {
            concern: {
              type: 'string' as const,
              description: 'Your critical assessment or concern to verify.',
            },
          },
          required: ['concern'],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case 'think': {
        const { thought, thoughtNumber, totalThoughts, nextThoughtNeeded } = args as {
          thought: string;
          thoughtNumber: number;
          totalThoughts: number;
          nextThoughtNeeded: boolean;
        };

        const prefix = `[Thinking ${thoughtNumber}/${totalThoughts}]`;

        if (!nextThoughtNeeded) {
          return {
            content: [
              {
                type: 'text',
                text:
                  `${prefix}\n\n${thought}\n\n` +
                  '---\nThinking complete. Before acting on this conclusion, ' +
                  'use the verify tool to challenge it.',
              },
            ],
          };
        }

        return {
          content: [{ type: 'text', text: `${prefix}\n\n${thought}` }],
        };
      }

      case 'verify':
        return {
          content: [{ type: 'text', text: (args as { concern: string }).concern }],
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });

  // --- Prompts ---

  server.setRequestHandler(ListPromptsRequestSchema, async () => ({
    prompts: [
      {
        name: 'steelmind',
        description:
          'Metacognitive system prompt for structured thinking and steel-manning verification',
      },
    ],
  }));

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    if (request.params.name !== 'steelmind') {
      throw new Error(`Unknown prompt: ${request.params.name}`);
    }
    return {
      description:
        'Metacognitive system prompt for structured thinking and steel-manning verification',
      messages: [{ role: 'user' as const, content: { type: 'text', text: SYSTEM_PROMPT } }],
    };
  });

  return server;
}
