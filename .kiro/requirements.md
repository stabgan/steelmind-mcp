# Think MCP v2: Requirements Document

## 1. Overview

**Project:** Next-generation Think MCP server for frontier language models
**Target Models:** Claude Opus 4.6, GPT-5.4, o3/o4, DeepSeek-R1, Gemini 3
**Grounding:** 43+ research papers, 10 philosophical frameworks, cross-model analysis
**Design Philosophy:** Simple and advanced — minimal tools, maximum cognitive scaffolding

---

## 2. Functional Requirements

### FR-1: Core Tool — `think`
The server MUST expose a `think` tool that accepts a `thought` string and returns it unchanged (identity function).

**Acceptance Criteria:**
- Input: `{ "thought": string }` (required)
- Output: The input string, unchanged
- No side effects, no state mutation, no external calls
- Compatible with MCP specification 2025-11-25

### FR-2: Core Tool — `verify`
The server MUST expose a `verify` tool that accepts a `concern` string and returns it unchanged (identity function).

**Acceptance Criteria:**
- Input: `{ "concern": string }` (required)
- Output: The input string, unchanged
- No side effects, no state mutation, no external calls
- The field name MUST be `concern` (not `thought` or `reasoning`) to force a cognitive mode shift from generation to evaluation

### FR-3: Tool Descriptions
Each tool MUST have a carefully crafted description that serves as the primary cognitive scaffold.

**`think` description requirements:**
- Lead with purpose (what it does) — primacy effect
- Include "when to use" guidance (processing tool results, planning, analyzing, policy navigation)
- Include "when NOT to use" guidance (simple tasks, non-sequential calls, restating without analysis)
- Embed Socratic self-questioning prompt ("What am I assuming? What evidence supports this?")
- Total length: 80-120 words (conciseness wins per EasyTool evidence)

**`verify` description requirements:**
- Lead with purpose (challenge and evaluate reasoning)
- Include "when to use" guidance (before committing, checking compliance, assessing edge cases)
- Include "when NOT to use" guidance (already confident, simple factual lookups)
- Embed steel-manning prompt ("What is the strongest argument that your conclusion is wrong?")
- Total length: 80-120 words

### FR-4: System Prompt
The server MUST expose an MCP prompt resource containing the metacognitive system prompt.

**System prompt requirements:**
- Workflow guidance: when to use think vs verify
- 2 positive examples showing reasoning PROCESS (not just input/output)
- 1 contrastive (negative) example showing BAD thinking to avoid
- Examples must demonstrate: rule enumeration, completeness checking, steel-manning, plan formation
- Total length: under 500 tokens (context efficiency)

### FR-5: Backward Compatibility — Minimal Mode
The server MUST support a `--minimal` flag that exposes only the `think` tool (identical to current v1 behavior).

### FR-6: Backward Compatibility — Legacy Mode
The server MUST support a `--legacy` flag that exposes the original advanced-mode tools: `think`, `plan`, `criticize`, `search` (with Tavily integration).

### FR-7: Default Mode
When run without flags, the server MUST expose exactly 2 tools: `think` and `verify`.

---

## 3. Non-Functional Requirements

### NFR-1: Cross-Model Compatibility
The tool schemas MUST work with all major frontier model families:
- Claude (Anthropic) — via MCP native
- GPT-5 / o-series (OpenAI) — via MCP client adapters
- DeepSeek-R1 — via MCP client adapters
- Gemini (Google) — via MCP client adapters

**Constraint:** Input schemas must use simple string fields only (no nested objects, no enums). DeepSeek-R1 has weak tool calling — complex schemas break it.

### NFR-2: Token Efficiency
- Tool descriptions: ≤120 words each
- System prompt: ≤500 tokens
- Tool output: minimal confirmation string, not verbose echo
- Total context overhead of both tools + prompt: <1000 tokens

### NFR-3: Compaction Survivability
All tool outputs and system prompt content MUST use structured, labeled formats that survive Anthropic's context compaction:
- Labeled sections (not prose paragraphs)
- Key-value patterns where possible
- Bullet points for checklists

### NFR-4: Installation Simplicity
The server MUST be installable via `uvx think-mcp` (unchanged from v1).

### NFR-5: Zero Dependencies for Default Mode
Default mode (think + verify) MUST NOT require any API keys or external services. Only legacy mode's `search` tool requires a Tavily API key.

### NFR-6: Statelessness
The server MUST be stateless. No session tracking, no persistent memory, no database. Each tool call is independent.

### NFR-7: Performance
Tool response latency MUST be <1ms (identity function — no computation).

---

## 4. Design Constraints

### DC-1: Tool Count
The server MUST expose ≤2 tools in default mode. Evidence: tool count cliff effect at ~20 tools (Speakeasy), GitHub 40→13, Block 30→2.

### DC-2: Description Quality Over Code Complexity
80% of design effort MUST go into tool descriptions and system prompt. The code is an identity function — the descriptions ARE the product.

### DC-3: Separation of Generation and Evaluation
The `think` and `verify` tools MUST be separate tools (not modes of a single tool). The act of choosing between them IS the metacognitive intervention. Evidence: MetaCrit, Think2.

### DC-4: No Reasoning Model Instructions
Tool descriptions MUST NOT instruct the model to "think harder" or "reason more carefully." For reasoning models (o-series, Gemini Deep Think), this degrades performance. Frame as "record your reasoning" and "challenge your conclusion."

### DC-5: Philosophical Framework Encoding
- `think`: Socratic self-questioning + Polya's method
- `verify`: Steel-manning + dialectical challenge
Evidence: SIEV (ICML) — models lose 40+ points under dialectical evaluation despite near-perfect correctness.

---

## 5. Success Criteria

| Metric | Target | Method |
|--------|--------|--------|
| τ-bench airline pass^1 | >0.60 (vs 0.57 best) | Automated benchmark |
| τ-bench retail pass^1 | >0.83 (vs 0.81 best) | Automated benchmark |
| Self-correction rate | >40% (vs ~16% baseline) | Human evaluation |
| Token efficiency | <50% overhead vs v1 | Token counting |
| Cross-model compat | ≥4 model families | Manual testing |
| SIEV process quality | Measurable improvement | SIEV framework |
| Token-matched control | Outperform same-budget baseline | Controlled experiment |

---

## 6. Out of Scope

- Training/fine-tuning models
- External API integrations (except legacy search)
- Persistent memory/state
- Custom model hosting
- UI/frontend
- Process reward model integration (future work)

---

## 7. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Verify causes over-correction | Medium | High | Steel-manning framing; "when NOT to use" |
| Token overhead negates benefits | Low | High | Minimal output; token-matched control |
| Models ignore verify tool | Medium | Medium | System prompt workflow guidance |
| Description changes break users | Low | Medium | --minimal, --legacy modes |
| Models evolve past need | High | Medium | Complement, don't replace native reasoning |

---

## 8. Traceability

| Requirement | Research Source |
|-------------|---------------|
| FR-1 (think) | Anthropic think tool blog (2025) |
| FR-2 (verify) | MetaCrit, Think2 |
| FR-3 (descriptions) | EasyTool, τ-bench, ToolACE |
| FR-4 (system prompt) | τ-bench (54% improvement) |
| FR-7 (2 tools) | GitHub 40→13, Block 30→2, Speakeasy cliff |
| DC-4 (no "think harder") | OpenAI o-series guide |
| DC-5 (frameworks) | SIEV (ICML), Cognitive Foundations |
