---
inclusion: always
---

# Product: Steelmind MCP

Steelmind MCP is a Model Context Protocol server that provides research-grounded metacognitive reasoning tools for LLM agents. It exposes two tools — `think` and `verify` — that are identity functions (they return their input unchanged). The value is entirely in the tool descriptions, which encode cognitive science frameworks (Socratic self-questioning, steel-manning, dialectical challenge) to scaffold better reasoning in AI agents.

Key insight: the code does nothing; the descriptions do everything. Tool descriptions account for ~80% of performance improvement per Anthropic τ-bench research.

The server also exposes a `steelmind` prompt containing a system prompt with contrastive examples of good and bad thinking patterns.

Published as `@stabgan/steelmind-mcp` on npm. Distributed via npx, Docker, and Smithery.
