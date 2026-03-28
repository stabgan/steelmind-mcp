# Steelmind MCP: High-Level Design

## Architecture

```
┌──────────────────────────────────────────────┐
│              MCP Client                       │
│  (Claude, Cursor, Windsurf, Claude Code)      │
├──────────────────────────────────────────────┤
│                                               │
│  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │  think    │  │  verify   │  │  system    │ │
│  │  tool     │  │  tool     │  │  prompt    │ │
│  └────┬─────┘  └────┬─────┘  └────────────┘ │
│       │              │                        │
│       ▼              ▼                        │
│  ┌──────────────────────────────────────┐    │
│  │     Steelmind MCP Server (Node.js)   │    │
│  │     Transport: stdio                 │    │
│  │     Tools: identity functions        │    │
│  │     Innovation: descriptions + prompt│    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
```

## Core Concept

Two identity-function tools whose descriptions encode research-grounded cognitive frameworks:

- `think` — Structured reasoning (Socratic questioning + Polya's method)
- `verify` — Critical self-assessment (Steel-manning + dialectical challenge)

The code does nothing. The descriptions do everything. 80% of value is in the text.

## Data Flow

```
Model receives task
  → calls think(thought="...") — structured pause, Socratic self-questioning
  → server returns thought unchanged — re-injected as fresh context
  → model processes, forms conclusion
  → calls verify(concern="...") — cognitive mode shift to evaluation
  → server returns concern unchanged
  → model decides: proceed or revise
```

## Why 2 Tools

| Evidence | Finding |
|----------|---------|
| GitHub Copilot | 40→13 tools = benchmark improvement |
| Block (Linear) | 30→2 tools after 3 iterations |
| Speakeasy study | Cliff effect at ~20 tools |
| MetaCrit paper | Separating generation from evaluation prevents self-bias |
| Anthropic | "If a human can't say which tool to use, an AI can't either" |

## Cross-Model Behavior

| Model | think purpose | verify purpose |
|-------|--------------|----------------|
| Claude Opus 4.6 | Structured persistent artifacts | Policy compliance |
| GPT-5.4 | Externalized reasoning checkpoint | Transparency |
| DeepSeek-R1 | Tool-use reasoning bridge | Structured verification |
| Gemini 3 | Verification checkpoint | Dialectical challenge |
