---
inclusion: always
---

# Tech Stack

- Language: TypeScript (strict mode)
- Runtime: Node.js >= 18, ES2022 target
- Module system: ESM (`"type": "module"`, NodeNext resolution)
- Core dependency: `@modelcontextprotocol/sdk` (MCP SDK)
- Build: `tsc` (TypeScript compiler), output to `dist/`
- Test: Vitest with `--experimental-vm-modules` flag (required for ESM)
- Lint: ESLint 9 flat config with `typescript-eslint` + `eslint-config-prettier`
- Format: Prettier (single quotes, semicolons, trailing commas, 100 char width)
- Containerization: Docker multi-stage build (node:20-alpine)
- Registry: Smithery for MCP server distribution

## Common Commands

```bash
npm run build       # Compile TypeScript and chmod +x dist files
npm test            # Run tests (vitest run with ESM support)
npm run lint        # Lint src/ with ESLint
npm run format      # Format source files with Prettier
npm run format:check # Check formatting without writing
npm start           # Run the compiled server (node dist/index.js)
```

## Code Style

- Prettier handles all formatting — do not override with manual style choices
- Unused variables prefixed with `_` are allowed (ESLint rule: `argsIgnorePattern: '^_'`)
- Use `as const` assertions for MCP schema type literals
- Import from `.js` extensions (NodeNext module resolution requires this even for .ts source files)
