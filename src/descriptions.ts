/**
 * Steelmind MCP: Tool Descriptions and System Prompt
 *
 * These descriptions are the primary cognitive scaffold — they account for
 * ~80% of the performance improvement (per Anthropic τ-bench research).
 *
 * Design principles applied:
 * 1. Purpose first (primacy effect — ACL 2025)
 * 2. When NOT to use (ToolACE: 6.99% → 83.81% irrelevance detection)
 * 3. Socratic self-questioning in think (Chang 2023, Princeton SocraticAI)
 * 4. Steel-manning in verify (SIEV ICML, MetaCrit)
 * 5. Conciseness ~100 words (EasyTool: 70-97% token reduction → better perf)
 * 6. No "think harder" instructions (OpenAI: degrades reasoning models)
 * 7. Contrastive example in system prompt (Contrastive CoT, ACL 2024)
 * 8. Sequential decomposition (Scaling TTC: 4x efficiency with adaptive compute)
 * 9. Cognitive mode separation (MetaCrit: separating generation from evaluation)
 *
 * Key references:
 * - Anthropic τ-bench: 54% improvement from optimized prompting
 * - MetaCrit (2507.15015v3): separating generation from evaluation
 * - Think2 (2602.18806v1): 3x self-correction with structured phases
 * - SIEV (2510.18134, ICML): models lose 40+ pts under dialectical eval
 * - Cognitive Foundations (2511.16660): scaffolding improves perf up to 72%
 * - Scaling TTC (2408.03314): difficulty-adaptive compute improves efficiency >4x
 */

export const THINK_DESCRIPTION =
  'Use this tool to record a structured reasoning step. It will not obtain ' +
  'new information or change any state — it appends your thought to the log. ' +
  'Use it when you need to: process results from previous tool calls before ' +
  'acting, plan your approach to a multi-step task, analyze a complex ' +
  'situation before deciding, or navigate environments with detailed policies. ' +
  'Do NOT use for simple single-step tasks or restating without analysis. ' +
  'When thinking, ask yourself: What am I assuming? What evidence supports ' +
  "this? What's my plan, and what could go wrong? " +
  'You can adjust totalThoughts up or down as your understanding deepens. ' +
  'When you set nextThoughtNeeded to false, use the verify tool to challenge ' +
  'your conclusion before acting.';

export const VERIFY_DESCRIPTION =
  'Use this tool to challenge and evaluate your reasoning before committing ' +
  'to an action. It will not obtain new information or change any state — it ' +
  'logs your critical self-assessment. Use it when you need to: check if your ' +
  'planned action complies with all requirements, validate reasoning before ' +
  'committing, assess edge cases, or evaluate tool results for correctness. ' +
  'Do NOT use to confirm what you are already confident about. ' +
  'When verifying, steel-man the opposition: What is the strongest argument ' +
  "that your conclusion is wrong? If you can't defeat it, reconsider. " +
  'If your verification reveals a flaw, use the think tool to revise your approach.';

export const SYSTEM_PROMPT = `## Using the think and verify tools

Before taking any action or responding after receiving tool results, use the think tool as a scratchpad to:
- List the specific rules or constraints that apply
- Check if all required information is collected
- Verify your planned action makes sense
- Identify what could go wrong
- Adjust totalThoughts as your understanding deepens

After your final thinking step (nextThoughtNeeded: false), use the verify tool to:
- Steel-man the opposing view: build the strongest case against your conclusion
- Check assumptions you haven't validated
- Look for edge cases you may have missed

<think_example>
User wants to cancel order #1234
- thoughtNumber: 1, totalThoughts: 3
- Need to verify: order status, cancellation policy, refund eligibility
- Check: is order already shipped? If so, different policy applies
- Missing info: haven't confirmed the user's identity yet
- Risk: cancelling a shipped order requires return logistics
→ Plan: verify identity first, then check order status, then apply correct policy
</think_example>

<verify_example>
I concluded we should use recursive approach over iterative
- Steel-man for iterative: simpler to debug, no stack overflow risk, same time complexity
- My assumption that recursion is "cleaner" is subjective, not evidence-based
- Edge case: what if input size exceeds stack depth? Recursion fails silently
→ Reconsider: iterative is safer for unknown input sizes
</verify_example>

<bad_example>
"Let me think about this. The user wants X. I should do Y. Yes, Y seems right."
This adds tokens without insight. Be specific: what rules apply? What could go wrong? What are you assuming?
</bad_example>`;
