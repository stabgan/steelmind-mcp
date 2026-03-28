# Think MCP v2: Improvement Plan

## Research-Grounded Redesign for Frontier Models (Claude Opus 4.6 / GPT-5.4)

**Date:** 2026-03-28
**Status:** Research Complete → Design Phase
**Papers Analyzed:** 30+
**Sources:** Anthropic Engineering, OpenAI Cookbooks, HuggingFace Papers, arxiv (2024-2026)

---

## 1. Executive Summary

The current Think MCP server is a 97-line Python file that exposes an identity function (`think`) as an MCP tool. Research shows this pattern still helps in multi-turn agentic workflows, but frontier models (Opus 4.6, GPT-5.4) now have native extended thinking, adaptive effort controls, and 1M+ token contexts. The identity function alone is no longer sufficient.

This plan proposes a redesign grounded in 30+ research papers that transforms the server from a simple scratchpad into a **structured metacognitive toolkit** — providing cognitive scaffolding that frontier models cannot give themselves.

### Core Thesis
> The value of external reasoning tools has shifted from "enabling thinking" to "enabling *structured metacognition*" — categorized thoughts, separated monitoring from critique, adaptive effort allocation, and working memory management.

---

## 2. Research Findings

### 2.1 Primary Papers (Full Analysis)

| Paper | Key Finding | Implication |
|-------|-------------|-------------|
| **STC** (arxiv 2512.15662v3) | Interleaved reasoning + self-critique with hybrid RL yields better reasoning AND interpretability | Tools should support interleaved think-critique patterns |
| **MetaCrit** (arxiv 2507.15015v3) | Separating monitoring (validity) from control (critique) yields 94.12% on TruthfulQA; raw critique degrades performance by up to 76% | MUST separate monitor and critique tools |
| **Think2** (arxiv 2602.18806v1) | Ann Brown's Plan→Monitor→Evaluate cycle yields 3x self-correction improvement; structured metacognition helps native reasoning models but hurts standard models | Target frontier models specifically; use structured phases |
| **Scaling TTC** (arxiv 2408.03314) | Difficulty-adaptive compute allocation improves efficiency >4x; easy→sequential revision, hard→parallel exploration | Include complexity assessment tool |
| **GenPRM** (arxiv 2504.00891) | Generative verification (CoT + code) outperforms discriminative scoring; 1.5B GenPRM beats GPT-4o | Critique tool should generate verification reasoning, not just scores |
| **PaCoRe** (arxiv 2601.05593) | Parallel coordinated reasoning with message compaction; 8B model achieves 94.5% on HMMT surpassing GPT-5 | Support parallel reasoning with compaction |
| **ThinkPRM** (arxiv 2504.16828) | Generative PRMs trained on 1% of data outperform discriminative PRMs trained on 100%; out-of-domain generalization | Minimal, high-quality tool descriptions suffice |
| **DAPO** (arxiv 2503.14476) | Entropy management prevents reasoning collapse; emergent self-verification behavior from RL | Tools should maintain reasoning diversity |

### 2.2 HuggingFace Papers (New Findings)

| Paper | Key Finding | Implication |
|-------|-------------|-------------|
| **Cognitive Foundations** (arxiv 2511.16660) | Taxonomy of 28 cognitive elements; models under-utilize metacognitive controls (only 16% research focus); scaffolding improves performance up to 72% | External metacognitive scaffolding is empirically validated |
| **HILA** (OpenReview 2025) | Metacognitive MDP with EVAL/CREATE/DEFER actions; +17pp on GSM8K, +24pp on AMC | Three-action metacognitive space is a proven pattern |
| **Agent-RRM** (arxiv 2601.22154) | Multi-faceted feedback: reasoning trace + focused critique + score | Tool output should be structured multi-faceted feedback |
| **iGRPO** (arxiv 2602.09000) | Self-feedback using model's own best attempt as conditioning; SOTA on AIME | Support "reflect on best attempt" pattern |
| **AgentPRM** (arxiv 2502.10325) | Process rewards for agents via Monte Carlo rollouts; small 3B models outperform GPT-4o | Per-step quality signals are feasible and effective |

### 2.3 Anthropic Sources

| Source | Key Finding | Implication |
|--------|-------------|-------------|
| **Think Tool Blog** (Mar 2025, updated Dec 2025) | Extended thinking now supersedes think tool in most cases; think tool still helps in multi-turn agentic workflows; optimized prompting yields 54% improvement | Tool descriptions are the primary scaffold |
| **Context Engineering Blog** (Sep 2025) | "Smallest possible set of high-signal tokens"; tool result clearing is safest compaction; just-in-time context retrieval | Tools must produce minimal, high-signal output |
| **Tool Design Blog** (Sep 2025) | "If a human can't say which tool to use, an AI can't either"; fewer tools > more tools; lead with purpose in descriptions | Keep tool count minimal with zero overlap |
| **Opus 4.6 Announcement** (Feb 2026) | Adaptive thinking, effort controls, context compaction, 1M context, agent teams | Design for complementing native capabilities |
| **Adaptive Thinking Docs** | Interleaved thinking is automatic; effort is promptable; thinking blocks don't carry forward | Think tool value = structured persistent artifacts |
| **Compaction Docs** | Auto-summarizes at configurable threshold; custom instructions; pause_after_compaction hook | Tool output must survive compaction |

### 2.4 Cross-Model Analysis

| Model | Native Reasoning | Think Tool Purpose |
|-------|-----------------|-------------------|
| **Claude Opus 4.6** (high effort) | Adaptive extended thinking, interleaved | Structured persistent artifacts, policy compliance |
| **Claude Opus 4.6** (low effort) | Minimal/skipped | Primary reasoning scaffold |
| **GPT-5.4** (high reasoning) | Hidden CoT, encrypted persistence | Transparency, externalized checkpoints |
| **GPT-5.4** (minimal reasoning) | Off | Primary reasoning scaffold |
| **o3/o4-mini** | Native CoT + tool reasoning | Checkpoint between tool calls |
| **DeepSeek-R1** | Visible `<think>` tags, weak tool calling | Tool-use reasoning bridge |
| **Gemini 3** | Deep Think parallel exploration | Structured verification checkpoint |

### 2.5 PRM Research (14 Papers)

**Key trend:** Generative PRMs >> Discriminative PRMs
- 100x more data-efficient (1K labels vs 800K)
- Produce interpretable natural language verification
- Can serve as both verifier AND critic
- Scale more effectively with test-time compute
- **BUT:** Vulnerable to reward hacking (43% of gains from stylistic shortcuts)

**Agentic PRMs emerging:**
- ToolRM: 17.94% higher accuracy for tool-calling, 66% token reduction
- AgentPRM: 8x compute efficiency for multi-turn tasks
- ToolPRMBench: First systematic benchmark for tool-using PRMs

---

## 3. Core Design Principles

Based on all research, these 10 principles guide the redesign:

### P1: Complement, Don't Duplicate Native Reasoning
Opus 4.6 and GPT-5.4 already think natively. The tool's value is in **structured, persistent, labeled** metacognition — not raw reasoning.

### P2: Separate Monitoring from Control (Nelson & Narens)
MetaCrit proved that collapsing validity assessment and critique into one operation causes self-bias. These MUST be separate tools.

### P3: Structured Output > Text Echo
The MCP 2025-11-25 spec supports `outputSchema` and `structuredContent`. Tools should return machine-parseable metacognitive signals.

### P4: Minimal Tools, Zero Overlap
Anthropic's tool design blog: "If a human can't definitively say which tool to use, an AI can't either." Each tool must have an unambiguous, non-overlapping purpose.

### P5: Difficulty-Adaptive Compute
Scaling TTC research shows easy problems need sequential refinement, hard problems need parallel exploration. The tool suite should adapt.

### P6: Smallest High-Signal Tokens
Anthropic's context engineering: every token must earn its place. Tool outputs should be minimal and structured for later retrieval.

### P7: Compaction-Survivable Output
All tool outputs must use structured formats (labeled sections, key-value pairs) that survive context compaction faithfully.

### P8: Tool Descriptions as Primary Scaffold
Anthropic's τ-bench results: optimized prompting yields 54% improvement. The tool description IS the cognitive scaffold.

### P9: Cross-Model Compatibility
The tool suite must work across Claude, GPT-5, o-series, DeepSeek-R1, and Gemini. Keep schemas simple (string inputs preferred).

### P10: Emergent Metacognition Amplification
DAPO and PaCoRe show that RL training naturally produces self-verification. Tools should amplify these emergent behaviors, not replace them.

---

## 4. Proposed Tool Suite

### 4.1 Design Validation: Why 2 Tools, Not 5

**Initial proposal was 5 tools.** After deeper research into tool count effects, this was revised down to 2.

**Evidence that changed the design:**

| Source | Finding |
|--------|---------|
| **GitHub Copilot** | Cut from 40→13 tools, saw 2-5pp benchmark improvement + 400ms latency reduction |
| **Block (Linear integration)** | Went from 30+ tools to **2 tools** after 3 iterations |
| **Speakeasy study** | At 107 tools: total failure. At 20: large models score 19/20. At 10: perfect. Performance is a **cliff**, not a slope. |
| **Phil Schmid (HuggingFace)** | "5-15 tools per server. One server, one job." |
| **MCPAgentBench** (arxiv 2512.24565v3) | All models show >10 point TEFS decline as alternative tool count increases |
| **Semantic Tool Selection study** | 94% accuracy at ~50 tools → 0-20% at ~740 tools. 79-100% degradation for most models. |
| **MCP Tool Design article** (dev.to, Mar 2026) | "97.1% of MCP tool descriptions have quality issues. Description quality matters MORE than tool count." |

**Key insight:** The original 5-tool design (think, assess, plan, monitor, critique) violated the "outcome-oriented" principle. The model's metacognitive OUTCOMES are only two:
1. **Generate reasoning** (think, plan, analyze, decide — all the same outcome)
2. **Evaluate reasoning** (monitor, critique, verify — all the same outcome)

Everything else (assess, plan, monitor) is a sub-type of these two outcomes and belongs in the tool DESCRIPTION, not as a separate tool.

### 4.2 Final Tool Architecture: 2 Core Tools

| Tool | Metacognitive Function | Maps To |
|------|----------------------|---------|
| `think` | Generate structured reasoning | Nelson & Narens object-level; Ann Brown Planning + Monitoring; MetaCrit brainstorming agent |
| `verify` | Evaluate and critique reasoning | Nelson & Narens meta-level; Ann Brown Evaluation; MetaCrit monitoring + control agents; STC critique |

**Why `verify` and not `critique`?**
- "Verify" implies checking against criteria (more structured)
- "Critique" implies finding fault (can trigger over-correction — MetaCrit showed raw critique degrades performance by up to 76%)
- "Verify" naturally encompasses both monitoring (is this valid?) and control (what should change?)

**Why the ACT of choosing between 2 tools matters:**
The model must decide "should I be generating or evaluating right now?" This choice IS the metacognitive intervention. It forces a cognitive mode shift that a single tool with a mode parameter cannot achieve as effectively. MetaCrit proved that separating generation from evaluation prevents self-bias.

### 4.3 What About the Other Tools?

| Dropped Tool | Where It Went | Why |
|-------------|---------------|-----|
| `assess` | First use of `think` | "Think about how complex this task is" — complexity assessment is just a type of thinking |
| `plan` | A use of `think` | "Think about your approach" — planning is just a type of thinking |
| `monitor` | Folded into `verify` | Monitoring is the read-only part of verification |
| `critique` | Folded into `verify` | Critique is the active part of verification |
| `search` | **Removed entirely** | Not metacognition. "One server, one job." Use a dedicated search MCP server. |

### 4.4 Tool Interaction Patterns

**Simple task:**
```
think
```

**Standard task:**
```
think → verify → think (revised if needed)
```

**Complex multi-step task:**
```
think (plan approach) → think (execute step 1) → verify → think (step 2) → verify → ...
```

**The pattern is always:** generate → evaluate → generate (if needed). This maps directly to the generate→verify→revise cycle validated by Gemini's Aletheia agent, STC's interleaved reasoning-critique, and MetaCrit's monitoring-control loop.

### 4.5 Modes for Different Users

| Mode | Tools | Use Case |
|------|-------|----------|
| `--minimal` | `think` only | Backward compatible, simple deployments |
| (default) | `think` + `verify` | Recommended for frontier models |
| `--legacy` | `think` + `plan` + `criticize` + `search` | Backward compatible with current `--advanced` |

---

## 5. Key Architectural Decisions

### 5.1 The Real Innovation: Descriptions, Not Code

**The most important finding across all research:** Tool descriptions and system prompts account for ~80% of the performance improvement. The tool's code (identity function) accounts for ~20%.

Evidence:
- Anthropic τ-bench: Optimized prompting yielded 54% improvement over unprompted think tool
- MCP Tool Design study: 97.1% of descriptions have quality issues — fixing descriptions is the highest-leverage intervention
- GitHub Copilot: Description refinements drove benchmark improvements, not code changes
- Think2: The Ann Brown prompting framework (structured descriptions) yielded 3x self-correction improvement

**Implication:** The `think` and `verify` tools are still identity functions. The innovation is entirely in:
1. Tool descriptions (what the tool does, when to use it, when NOT to use it)
2. System prompt (workflow templates, domain-adaptive examples)
3. Input schema design (structured fields that force metacognitive decomposition)

### 5.2 Subtle Design: Why the Identity Function Works

The identity function pattern works because of THREE mechanisms:

1. **Structured pause (primary):** The tool call mechanism forces the model to commit to a discrete thought before continuing. This is a "cognitive forcing function" — the model can't skip ahead.

2. **Context re-injection (secondary):** The thought re-appears as a "tool result" in the conversation, which gets different attention treatment than inline text. It becomes "new information" that the model processes fresh.

3. **Schema-driven decomposition (tertiary):** The input schema forces the model to structure its reasoning into specific fields, preventing the "rigid sequential processing" identified by the Cognitive Foundations paper.

**What this means for output design:** Returning the input unchanged is fine. Returning structured JSON adds marginal value (easier for the model to reference later). Returning nothing would lose mechanism #2. The current identity function is close to optimal.

### 5.3 Input Schema Design (The Subtle Part)

**`think` tool input:**
```json
{
  "thought": "string (required) — The reasoning step to record"
}
```
Simple. One field. Maximum compatibility across all models (including DeepSeek-R1 with weak tool calling).

**`verify` tool input:**
```json
{
  "concern": "string (required) — What specifically to verify or check"
}
```
NOT "reasoning_to_verify" — that would make the model re-state its previous thought. Instead, "concern" forces the model to articulate WHAT it's uncertain about. This maps to Think2's finding that explicit error diagnosis (58.3% success) is the key bottleneck vs baseline (27.9%).

**Why `concern` and not `thought`?**
- Different field name = different cognitive mode. The model shifts from "generating" to "questioning."
- "Concern" implies uncertainty — it scaffolds the metacognitive skill of recognizing what you don't know.
- Gemini's Aletheia agent's ability to "admit failure" is scaffolded by framing verification as concern-driven.

### 5.4 Output Design

Both tools return the input unchanged (identity function), wrapped in a minimal confirmation:

```
think: "Your thought has been recorded."
verify: "Your verification has been recorded."
```

**Why minimal output?**
- Anthropic context engineering: "Smallest possible set of high-signal tokens"
- Every token the tool adds must earn its place
- The model's OWN formulation (in the input) is the high-signal content
- The tool result is just a confirmation that the pause happened

**Alternative considered:** Returning structured JSON with metadata (timestamp, thought_number, etc.). Rejected because it adds tokens without adding signal. The model doesn't need to know it's on thought #7.

### 5.5 System Prompt Design (80% of the Value)

The system prompt is where the real metacognitive scaffolding lives. Key elements:

1. **When to use each tool** — Decision tree, not just descriptions
2. **Workflow templates** — Simple/standard/complex task patterns
3. **Domain-adaptive examples** — Like Anthropic's τ-bench optimized prompts
4. **Anti-patterns** — When NOT to think (simple tasks, non-sequential calls)
5. **Effort awareness** — Terse at low effort, detailed at high effort
6. **Compaction survival** — Label thoughts for later retrieval

### 5.6 Backward Compatibility

The redesign maintains full backward compatibility:
- `think` tool name unchanged
- `think` input schema unchanged (single `thought` string)
- `think` behavior unchanged (identity function)
- New `verify` tool is additive (doesn't break existing configs)
- `--legacy` mode preserves current `--advanced` behavior

---

## 6. Risk Analysis

| Risk | Mitigation |
|------|-----------|
| Tool overload (5 tools may be too many for some models) | Provide `--minimal` mode with just `think` + `monitor` |
| Over-thinking on simple tasks | `assess` tool routes simple tasks to minimal tooling |
| Context pollution from verbose tool outputs | Enforce token budgets per tool; structured minimal output |
| Incompatibility with non-reasoning models | Think2 showed structured metacognition hurts weak models; document minimum model requirements |
| Reward hacking / self-bias in critique | Separate monitor (read-only) from critique (active); MetaCrit's key insight |

---

## 7. Philosophical Frameworks for Steering Reasoning

### 7.1 Tier 1: Strongest Evidence + Most Encodable

| Framework | Core Mechanism | LLM Evidence | How to Encode |
|-----------|---------------|--------------|---------------|
| **Dialectical Thinking** (Hegel) | Thesis → Antithesis → Synthesis | SIEV (ICML): GPT-5-chat loses 40+ points under dialectical eval despite near-perfect correctness. Microsoft Research: Hegelian self-reflection with temperature annealing. | `verify` tool: "Generate the strongest opposing view. Can you synthesize both, or does your position collapse?" |
| **Socratic Method** | 6 question types: clarifying, probing assumptions, probing evidence, questioning viewpoints, probing implications, questioning the question | Chang 2023 (arxiv 2303.08769): systematic mapping to LLM prompting. Princeton SocraticAI: multi-agent Socratic dialogue solves problems single-agent CoT cannot. | `think` tool: "What am I assuming? What evidence supports this? What would someone who disagrees say?" |
| **Steel-manning** | Construct the strongest opposing argument before critiquing | Implicitly validated by SIEV's antithesis generation. Constitutional AI uses similar self-critique. | `verify` tool: "What is the strongest argument that your conclusion is wrong? Can you defeat it?" |
| **Polya's Method** | Understand → Plan → Execute → Review | NeurIPS 2024 (Princeton): LLMs have metacognitive capabilities activated by prompting. UPAR framework (Kantian-inspired). | `think` tool: "What is actually being asked? What's my approach? Does the result make sense?" |

### 7.2 Tier 2: Strong Theoretical Basis

| Framework | Core Mechanism | Encoding |
|-----------|---------------|----------|
| **Paul-Elder Critical Thinking** | 8 Elements of Thought + 9 Intellectual Standards | `verify`: "Is this clear? Accurate? Precise? Relevant? Deep enough? Logical? Fair?" |
| **First Principles** (Aristotle) | Break down to fundamental truths, reason up | `think`: "Am I reasoning from first principles or pattern-matching? Which assumptions might be wrong?" |
| **Kahneman System 1/2** | Fast intuitive vs slow deliberate | `think`: "Am I pattern-matching when I should be analyzing step-by-step?" |
| **Feynman Technique** | Explain simply → identify gaps → re-study | `verify`: "Can I explain this in one simple sentence? If not, where does my understanding break down?" |

### 7.3 The Key Insight: Process Quality > Answer Correctness

The SIEV paper's finding is the single most important result for our design: **models can get correct answers while having terrible reasoning processes.** The think tool shouldn't just help get correct answers — it should improve the QUALITY of reasoning itself.

This means:
- `think` scaffolds PROCESS quality (Socratic questioning, Polya's method, first principles)
- `verify` scaffolds DIALECTICAL challenge (thesis-antithesis-synthesis, steel-manning)
- The system prompt includes contrastive examples (good reasoning vs bad reasoning that happens to get the right answer)

---

## 8. Prompt Engineering Evidence

### 8.1 Tool Description Principles (Ranked by Evidence Strength)

| Principle | Evidence | Impact |
|-----------|----------|--------|
| **Conciseness wins** | EasyTool (NAACL 2025): 70-97% token reduction → better performance across all models | High |
| **Purpose first** | ACL 2025 serial position effects: primacy bias is real. OpenAI: "key rules up front" | High |
| **Include "when NOT to use"** | ToolACE: irrelevance detection 6.99% → 83.81% with negative examples | High |
| **1-2 reasoning examples** | Anthropic τ-bench: 54% improvement with domain-specific examples | High |
| **Contrastive examples** | Contrastive CoT (ACL 2024): valid + invalid examples > valid alone | Medium |
| **Complex guidance in system prompt** | Anthropic: more effective than in tool description | Medium |
| **Natural language > pure JSON** | NLT (2025): +18.4pp accuracy, -70% variance | Medium |
| **Pass the intern test** | OpenAI: if a human can't use it from the description, the model can't either | Medium |

### 8.2 Few-Shot Example Design

**Optimal count:** 2-3 examples (Anthropic used 2; over-prompting degrades performance per Tang et al. 2025)

**Example structure (from Anthropic's τ-bench success):**
1. Show the REASONING PROCESS, not just input/output
2. Include hierarchical decomposition (break complex into steps)
3. Include rule enumeration (list applicable constraints)
4. Include completeness checking (what info is missing?)

**Critical finding for strong models (EMNLP 2025):** For frontier models, examples primarily serve as FORMAT TEMPLATES. The model already knows how to reason — it needs to know WHAT FORMAT you want the reasoning in.

**Contrastive example:** Include one example of BAD thinking to avoid (adds tokens without insight, restates without analyzing, skips verification).

### 8.3 Draft Tool Descriptions

**`think` tool:**
> Use this tool to record a structured reasoning step. It does not change any state or retrieve information — it creates a deliberate pause for thinking.
>
> Use it when you need to: process results from previous tool calls before acting, plan your approach to a multi-step task, analyze a complex situation before deciding, or navigate policy-heavy environments.
>
> Do NOT use it for: simple single-step tasks, non-sequential tool calls, or restating what the user said without adding analysis.
>
> When thinking, challenge yourself: What am I assuming? What evidence supports this? What would I need to verify?

**`verify` tool:**
> Use this tool to challenge and evaluate your reasoning. It does not change any state — it creates a deliberate pause for critical self-assessment.
>
> Use it when you need to: check if your planned action complies with all requirements, validate that your reasoning is sound before committing, assess edge cases, or evaluate tool results for correctness.
>
> Do NOT use it for: confirming something you're already confident about, or simple factual lookups.
>
> When verifying, steel-man the opposition: What is the strongest argument that your conclusion is wrong? If you can't defeat it, reconsider.

### 8.4 Draft System Prompt

```
## Using the think and verify tools

Before taking action after receiving tool results, use the think tool to:
- Identify what rules and constraints apply
- Check if all required information is collected  
- Plan your next steps

After forming a conclusion, use the verify tool to:
- Challenge your reasoning with the strongest counterargument
- Check for assumptions you haven't validated
- Verify compliance with all policies

### Example of good thinking:
<think_example>
User wants to refactor the authentication module
- What are the current dependencies? Need to check imports
- What tests exist? Must not break existing tests  
- What's the simplest change that achieves the goal?
- Risk: changing the token format could break downstream services
→ Plan: read tests first, then identify minimal change surface
</think_example>

### Example of good verification:
<verify_example>
I concluded we should use approach A over approach B
- Steel-man for B: it has better error handling and is more maintainable
- My assumption that A is faster hasn't been measured — it's based on intuition
- Edge case: what happens when the input is empty? A doesn't handle this
→ Revise: add empty input handling to A, or reconsider B
</verify_example>

### Example of BAD thinking (avoid this):
<bad_example>
"I need to think about this problem. Let me consider the options.
Option A seems good. Option B also seems good. I'll go with A."
This adds tokens without adding insight. Be specific and analytical.
</bad_example>
```

---

## 9. Evaluation Strategy

### 9.1 The Critical Control: Token-Matched Baseline

The most important methodological question: does the tool ACTUALLY help, or does it just add tokens?

**Control experiment:** Give the model the same token budget as think+verify uses, but as inline reasoning instruction instead of tool calls. If think+verify still wins, the STRUCTURE matters, not just the tokens.

### 9.2 Benchmarks

| Benchmark | What It Tests | Why It Matters |
|-----------|--------------|----------------|
| **τ-bench** (airline + retail) | Policy compliance in tool chains | Original think tool benchmark; direct comparison |
| **MR-Ben** (NeurIPS 2024) | Meta-reasoning: finding errors in reasoning traces | Directly tests verify tool's purpose |
| **SIEV** (ICML) | Dialectical reasoning quality | Tests process quality, not just correctness |
| **Cognitive Reflection Test** | System 2 override of intuitive errors | Classic trick questions (bat-and-ball etc.) |
| **GSM8K** | Multi-step math reasoning | Standard reasoning benchmark |
| **SWE-bench** | Real-world coding tasks | Practical agentic benchmark |

### 9.3 Conditions (5 minimum)

1. **Baseline:** No tools
2. **Think only:** Think tool available
3. **Verify only:** Verify tool available  
4. **Think + Verify:** Both tools available
5. **Token-matched control:** Same token budget, no structured tools

### 9.4 Metrics

| Metric | What It Measures |
|--------|-----------------|
| **Accuracy** | Basic correctness |
| **pass^k** (k=1..5) | Consistency/reliability (Anthropic's metric) |
| **Tokens used** | Efficiency |
| **Accuracy-per-token** | Pareto efficiency |
| **SIEV scores** | Reasoning process quality |
| **Self-correction rate** | How often verify fixes errors |
| **ECE** | Epistemic calibration |
| **Welch's t-test + Cohen's d** | Statistical significance |

### 9.5 Creative Adversarial Tests

1. **Misleading tool outputs:** Feed incorrect results, see if verify catches them
2. **Policy contradiction traps:** Conflicting requirements — does think help navigate?
3. **Sycophancy probes:** Wrong user assertions — does model agree or reason independently?
4. **Cascading error scenarios:** Early mistake compounds — does verify catch it?
5. **Bat-and-ball problems:** Classic cognitive reflection test items

---

## 8. Implementation Roadmap

### Phase 1: Core Tools (Week 1)
- Implement 5-tool MCP server with structured schemas
- Write tool descriptions (primary scaffold)
- Create system prompt with workflow templates

### Phase 2: State Management (Week 2)
- Add session-based state tracking
- Implement complexity assessment logic in `assess`
- Add plan checkpoint persistence

### Phase 3: Evaluation (Week 3)
- Set up τ-bench evaluation harness
- Run cross-model compatibility tests
- Conduct human evaluation for trustworthiness

### Phase 4: Optimization (Week 4)
- Iterate on tool descriptions based on eval results
- Tune structured output schemas
- Add `--minimal` mode for simpler deployments

---

## 9. References

### Primary Papers
1. STC: Stepwise Think-Critique (arxiv 2512.15662v3, Mar 2026)
2. MetaCrit: Critical Thinking Framework (arxiv 2507.15015v3, Mar 2026)
3. Think2: Grounded Metacognitive Reasoning (arxiv 2602.18806v1, Feb 2026)
4. Scaling LLM Test-Time Compute Optimally (arxiv 2408.03314, Aug 2024)
5. GenPRM: Generative Process Reward Models (arxiv 2504.00891, Apr 2025)
6. PaCoRe: Parallel Coordinated Reasoning (arxiv 2601.05593, Jan 2026)
7. ThinkPRM: Process Reward Models That Think (arxiv 2504.16828, Apr 2025)
8. DAPO: Decoupled Policy Optimization (arxiv 2503.14476, Mar 2025)

### HuggingFace Papers
9. Cognitive Foundations for Reasoning (arxiv 2511.16660, Nov 2025)
10. HILA: Metacognitive Policy Optimization (OpenReview, 2025)
11. Agent-RRM: Reasoning Reward Model for Agents (arxiv 2601.22154, Jan 2026)
12. iGRPO: Self-Feedback-Driven Reasoning (arxiv 2602.09000, Feb 2026)
13. AgentPRM: Process Rewards for LLM Agents (arxiv 2502.10325, Feb 2025)

### PRM Research
14. ToolRM: Tool-Use Reward Modeling (arxiv 2510.26167, Oct 2025)
15. ToolPRMBench (arxiv 2601.12294, Jan 2026)
16. EDU-PRM: Entropy-Driven Uncertainty (arxiv 2503.22233, Mar 2025)
17. VPRM: Verifiable Process Rewards (arxiv 2601.17223, Jan 2026)
18. PRISM: PRM-Guided Deep Thinking (arxiv 2603.02479, Mar 2026)
19. Reward Under Attack (arxiv 2603.06621, Mar 2026)
20. PRL: Process Reward Learning (arxiv 2601.10201, Jan 2026)

### Anthropic Sources
21. The "think" tool blog (anthropic.com/engineering, Mar 2025, updated Dec 2025)
22. Effective Context Engineering for AI Agents (anthropic.com/engineering, Sep 2025)
23. Writing Tools for Agents (anthropic.com/engineering, Sep 2025)
24. Claude Opus 4.6 Announcement (anthropic.com/news, Feb 2026)
25. Adaptive Thinking Documentation (docs.anthropic.com, 2026)
26. Effort Parameter Documentation (docs.anthropic.com, 2026)
27. Context Compaction Documentation (docs.anthropic.com, 2026)
28. Building Effective Agents (anthropic.com/research, 2025)
29. Multi-Agent Research System (anthropic.com/engineering, 2025)

### Cross-Model Sources
30. OpenAI o3/o4-mini Function Calling Guide (developers.openai.com, May 2025)
31. OpenAI GPT-5 New Params and Tools (developers.openai.com, Aug 2025)
32. OpenAI CoT-Control Paper (openai.com, Mar 2026)
33. Gemini Deep Think / Aletheia (deepmind.google, Feb 2026)
34. DeepSeek-R1 (Nature, 2025)
35. MCP Specification 2025-11-25 (modelcontextprotocol.io)

### Tool Count & Design Evidence (Phase 2 Validation)
36. MCPAgentBench (arxiv 2512.24565v3, Dec 2025) — Tool count vs TEFS score
37. Semantic Tool Selection study (vllm-semantic-router.com, Nov 2025) — 94%→0% accuracy cliff
38. MCP Tool Design article (dev.to/aws-heroes, Mar 2026) — Capability Triangle, outcome-oriented design
39. GitHub Copilot tool reduction (github.blog, 2025) — 40→13 tools, 2-5pp improvement
40. Block Linear MCP server (engineering.block.xyz, 2025) — 30→2 tools after 3 iterations
41. Phil Schmid MCP best practices (philschmid.de, 2025) — "5-15 tools per server"
42. MCP Tool Description Quality study (arxiv 2602.14878v1, 2025) — 97.1% have quality issues
43. Speakeasy tool count experiment (speakeasy.com, 2025) — Cliff effect at 20+ tools
