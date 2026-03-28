---
inclusion: always
---

# Project Structure

```
├── src/
│   ├── index.ts          # MCP server entry point — registers tools, prompts, and transport
│   └── descriptions.ts   # Tool descriptions and system prompt text (the core IP)
├── dist/                  # Compiled JS output (generated, do not edit)
├── .kiro/                 # Kiro config, specs, and steering
│   └── steering/          # Steering rules for AI assistants
├── Dockerfile             # Multi-stage Docker build
├── smithery.yaml          # Smithery MCP registry config
├── tsconfig.json          # TypeScript config
├── eslint.config.js       # ESLint flat config
├── vitest.config.ts       # Vitest test config
└── .prettierrc.json       # Prettier formatting rules
```

## Architecture

The server is a single-process stdio MCP server with two request handler categories:

1. Tools (`think`, `verify`) — identity functions that echo input back. Defined in `index.ts`, descriptions in `descriptions.ts`.
2. Prompts (`steelmind`) — a system prompt with contrastive examples for structured reasoning.

`descriptions.ts` is the most important file — it contains all tool descriptions and the system prompt. Changes here directly affect agent reasoning quality. Each description is carefully crafted based on specific research papers (referenced in comments).

`index.ts` handles server setup, request routing, error handling, and transport. It uses the MCP SDK's `Server` class with `StdioServerTransport`.

## Conventions

- Keep tool descriptions in `descriptions.ts`, separate from server wiring in `index.ts`
- The `dist/` entry point has a shebang (`#!/usr/bin/env node`) for CLI execution
- Process-level error handlers (`uncaughtException`, `unhandledRejection`) are set up at the top of `index.ts`
