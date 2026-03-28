# Steelmind MCP: Low-Level Design

## File Structure

```
steelmind-mcp/
├── src/
│   ├── index.ts           # Server entry point, tool registration
│   └── descriptions.ts    # Tool descriptions + system prompt (THE product)
├── .kiro/
│   ├── hld.md
│   └── lld.md
├── .github/workflows/
│   └── publish.yml        # CI/CD: build, npm publish, Docker push
├── package.json
├── tsconfig.json
├── Dockerfile
├── smithery.yaml
├── eslint.config.js
├── .prettierrc.json
├── .gitignore
├── .dockerignore
├── LICENSE
└── README.md
```

## Tool Specifications

### `think` Tool

```typescript
name: "think"
description: ~95 words, encodes Socratic questioning + Polya's method
inputSchema: { thought: string } // required
handler: returns thought unchanged
```

**Final description text:**
> Use this tool to record a structured reasoning step. It will not obtain new information or change any state — it appends your thought to the log. Use it when you need to: process results from previous tool calls before acting, plan your approach to a multi-step task, analyze a complex situation before deciding, or navigate environments with detailed policies. Do NOT use for simple single-step tasks or restating without analysis. When thinking, ask yourself: What am I assuming? What evidence supports this? What's my plan, and what could go wrong?

### `verify` Tool

```typescript
name: "verify"
description: ~100 words, encodes steel-manning + dialectical challenge
inputSchema: { concern: string } // required — NOT "thought"
handler: returns concern unchanged
```

**Final description text:**
> Use this tool to challenge and evaluate your reasoning before committing to an action. It will not obtain new information or change any state — it logs your critical self-assessment. Use it when you need to: check if your planned action complies with all requirements, validate reasoning before committing, assess edge cases, or evaluate tool results for correctness. Do NOT use to confirm what you're already confident about. When verifying, steel-man the opposition: What is the strongest argument that your conclusion is wrong? If you can't defeat it, reconsider.

### Why `concern` not `thought`

- Different field name = different cognitive mode (generation → evaluation)
- "Concern" implies uncertainty — scaffolds metacognitive awareness
- Think2 paper: explicit error diagnosis (58.3%) is the key bottleneck vs baseline (27.9%)

## System Prompt (~280 tokens)

Exposed as MCP prompt resource. Contains:
1. Workflow guidance (when to use think vs verify)
2. Positive think example (rule enumeration, risk identification)
3. Positive verify example (steel-manning, edge case detection)
4. Contrastive bad example (tokens without insight)

## Description Design Principles

| # | Principle | Evidence |
|---|-----------|----------|
| 1 | Purpose first | Primacy effect (ACL 2025) |
| 2 | When NOT to use | ToolACE: 6.99%→83.81% irrelevance detection |
| 3 | Socratic questioning in think | Chang 2023, Princeton SocraticAI |
| 4 | Steel-manning in verify | SIEV (ICML), MetaCrit |
| 5 | Conciseness (~100 words) | EasyTool: 70-97% token reduction → better perf |
| 6 | No "think harder" | OpenAI: degrades reasoning model performance |
| 7 | Contrastive example | Contrastive CoT (ACL 2024): valid+invalid > valid alone |

## Publishing

- **npm:** `@stabgan/steelmind-mcp` via OIDC trusted publishing on tag push
- **Docker:** `ghcr.io/stabgan/steelmind-mcp` + DockerHub `stabgan/steelmind-mcp`
- **Smithery:** stdio transport, zero config (no env vars needed)
