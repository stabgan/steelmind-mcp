# Steelmind MCP — Structured Thinking & Verification for AI Agents

[![npm version](https://img.shields.io/npm/v/@stabgan/steelmind-mcp)](https://www.npmjs.com/package/@stabgan/steelmind-mcp)
[![Docker](https://img.shields.io/docker/v/stabgan/steelmind-mcp?label=docker)](https://hub.docker.com/r/stabgan/steelmind-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**The research-grounded reasoning MCP server for AI agents.** Combines step-by-step sequential thinking with steel-manning verification — backed by 43+ cognitive science and AI research papers.

Steelmind gives your AI agent two tools:

- **`think`** — Record structured reasoning steps with sequential decomposition. Embeds Socratic self-questioning and Polya's problem-solving method.
- **`verify`** — Challenge conclusions with steel-manning before committing. Embeds dialectical evaluation from MetaCrit and SIEV research.

The code is minimal. The descriptions do the heavy lifting — tool descriptions account for ~80% of reasoning improvement per [Anthropic τ-bench research](https://www.anthropic.com/engineering/claude-think-tool).

## Why Steelmind?

| Feature                        | Think MCP | Sequential Thinking | **Steelmind** |
| ------------------------------ | --------- | ------------------- | ------------- |
| Step tracking                  | ✗         | ✓                   | ✓             |
| Adjustable step count          | ✗         | ✓                   | ✓             |
| Cognitive mode separation      | ✗         | ✗                   | ✓             |
| Steel-manning verification     | ✗         | ✗                   | ✓             |
| Socratic self-questioning      | ✗         | ✗                   | ✓             |
| Research-grounded descriptions | ✗         | ✗                   | ✓             |
| Verify nudge on completion     | ✗         | ✗                   | ✓             |
| Tool count                     | 1         | 1                   | 2             |

**Key research insight:** MetaCrit (arxiv 2507.15015) proved that separating reasoning generation from reasoning evaluation prevents self-bias and improves accuracy by up to 76%. Sequential-thinking uses one tool for both. Steelmind separates them.

## Quick Start

### npx (no install)

```json
{
  "mcpServers": {
    "steelmind": {
      "command": "npx",
      "args": ["-y", "@stabgan/steelmind-mcp"]
    }
  }
}
```

### Docker

```json
{
  "mcpServers": {
    "steelmind": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "stabgan/steelmind-mcp"]
    }
  }
}
```

### npm global install

```bash
npm install -g @stabgan/steelmind-mcp
```

```json
{
  "mcpServers": {
    "steelmind": {
      "command": "steelmind-mcp"
    }
  }
}
```

## How It Works

### The `think` tool

Records a structured reasoning step with sequential tracking.

**Input:**

```json
{
  "thought": "What are the dependencies? Need to check imports before refactoring.",
  "thoughtNumber": 1,
  "totalThoughts": 3,
  "nextThoughtNeeded": true
}
```

**Output (mid-sequence):**

```
[Thinking 1/3]

What are the dependencies? Need to check imports before refactoring.
```

**Output (final step — includes verify nudge):**

```
[Thinking 3/3]

My conclusion: use the adapter pattern for backward compatibility.

---
Thinking complete. Before acting on this conclusion, use the verify tool to challenge it.
```

The verify nudge appears in the tool result (not just the description), making it far more likely the model will actually call `verify`. Tool results get different attention treatment than descriptions — they're processed as fresh context.

### The `verify` tool

Challenges your reasoning with steel-manning before you commit.

**Input:**

```json
{
  "concern": "The adapter pattern adds complexity. Is the simpler approach actually better?"
}
```

**Output:**

```
The adapter pattern adds complexity. Is the simpler approach actually better?
```

Pure identity function — returns your concern unchanged. The value is in the description, which prompts: _"Steel-man the opposition: What is the strongest argument that your conclusion is wrong?"_

### The workflow

```
think(step 1/3) → think(step 2/3) → think(step 3/3) → [verify nudge] → verify → act
                                          ↑
                                  adjust totalThoughts if needed
```

## Research Foundation

Steelmind's design is grounded in 43+ research papers. Key findings:

| Paper                                        | Finding                                                  | How Steelmind Uses It                                    |
| -------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- |
| **MetaCrit** (arxiv 2507.15015)              | Separating generation from evaluation prevents self-bias | Two separate tools: think (generate) + verify (evaluate) |
| **Anthropic τ-bench**                        | Optimized tool descriptions yield 54% improvement        | Descriptions are the primary scaffold, not code          |
| **Think2** (arxiv 2602.18806)                | Structured metacognition yields 3x self-correction       | Sequential step tracking + Socratic questioning          |
| **SIEV** (ICML)                              | Models lose 40+ points under dialectical evaluation      | Steel-manning prompt in verify description               |
| **Scaling TTC** (arxiv 2408.03314)           | Difficulty-adaptive compute improves efficiency 4x       | Adjustable totalThoughts                                 |
| **EasyTool** (NAACL 2025)                    | Concise descriptions outperform verbose ones             | ~100 word descriptions                                   |
| **ToolACE**                                  | "When NOT to use" improves irrelevance detection 6→84%   | Negative guidance in both descriptions                   |
| **Cognitive Foundations** (arxiv 2511.16660) | External scaffolding improves performance up to 72%      | Research-grounded cognitive frameworks                   |

## Compatible Clients

Works with any MCP-compatible client:

- Claude Desktop / Claude Code
- Cursor
- Windsurf
- Kiro
- Cline
- Any client supporting MCP stdio transport

## Compatible Models

Designed for frontier models but works across families:

- Claude (Opus, Sonnet) — native MCP
- GPT-5 / GPT-4o / o-series — via MCP adapters
- Gemini — via MCP adapters
- DeepSeek — via MCP adapters

## Development

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript
npm test             # Run 90 tests
npm run lint         # ESLint
npm run format       # Prettier
npm start            # Run the server
```

## License

MIT
