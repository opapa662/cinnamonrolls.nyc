# PROCESS.md — How We Work Together

Read this, `SPEC.md`, and `tasks/todo.md` at the start of every session.

---

## Three Files. That's It.

| File | Purpose |
|---|---|
| `SPEC.md` | What we're building, why, and how (product + technical) |
| `PROCESS.md` | How we work together (this file) |
| `tasks/todo.md` | Task tracker, session handoffs, and lessons learned |

---

## Core Rules

1. **Clarity over speed.** If something is ambiguous, ask — don't guess.
2. **Scope is sacred.** If it's not in `SPEC.md`, flag it before building it.
3. **Simplicity wins.** The simplest solution that works is the right one. Resist the urge to over-engineer.
4. **Each session is ephemeral.** The documents are the continuity, not your memory. Update them.

---

## Two Modes

Every task falls into one of two modes. Pick the right one and follow its rules.

### Light Mode
**For:** bug fixes, config changes, small features, scaffolding, refactoring, docs.

```
1. Build it
2. Test it (if it touches logic)
3. Diff before commit — confirm you only touched what's needed
4. Commit
```

No plan needed. No review gate. Just ship good code.

### Heavy Mode
**For:** new features with multiple moving parts, architectural changes, core business logic, anything touching data models or auth.

```
1. Write a brief plan in todo.md (what you'll do, what files you'll touch, expected outcome)
2. Run the review gate (see below)
3. Get approval if needed
4. Build + test together
5. Before presenting: gut-check your own work — look for bugs, missed edge cases, scope creep
6. Diff before commit
7. Commit
8. Update todo.md
```

**When in doubt about which mode:** start Light. If it gets complicated, switch to Heavy.

---

## Review Gate

The review gate is for Heavy Mode tasks only.

1. **Spawn a Claude subagent** to review the plan against `SPEC.md`. Ask it: is this over-engineered? Are there simpler alternatives? What could go wrong?
2. **Call `scripts/review-plan.py`** to get ChatGPT's independent take.
3. **Present a quick synthesis:** where they agree, where they disagree, any red flags.

**Routing:**
- Both approve + task is Autonomous/Delegated → proceed.
- Either flags architecture, security, or scope concerns → check with Olivia.
- Synchronous tasks → always go through Olivia.

---

## Testing

Write tests for anything that matters. Skip tests for glue code, config, and obvious wiring.

- **Core logic:** test-first when practical.
- **Everything else:** test alongside. At minimum, one test proving it works and one proving it handles bad input.
- **Don't test for the sake of testing.** Coverage theater is worse than no tests.

---

## Quality Bar

Before presenting work, ask yourself:
- Does this only touch what it should? (`git diff`)
- Would a strong engineer approve this PR?
- Did I actually think about edge cases, or just check a mental box?

For Heavy Mode tasks, briefly state what you reviewed and what you found. Example: "Reviewed for edge cases — empty input returns empty array, null user throws 401. Diff shows 2 files changed, both in `/lib/auth/`."

---

## Git

- Commit after every working state.
- Diff before every commit — only touch what's related.
- If something breaks: revert the last commit. Multi-commit resets need Olivia's approval.
- List changed files in your commit message.

---

## Principles

1. **Simplicity first.** Don't reach for complex solutions.
2. **No laziness.** Find root causes. No temporary fixes.
3. **Minimal blast radius.** Tight scope, small changes.
4. **One thing at a time.** Build, test, commit, then move on.
5. **Staff engineer quality bar.** If it's not clearly approvable, it's not done.
6. **Track dependencies.** New packages get added to `SPEC.md` Environment Setup with a reason.

---

## Protected Files

Some files are load-bearing. The list lives in `SPEC.md` under `## Protected Files`. Never modify or delete a protected file without explicit approval.

---

## When Things Break

- **Three strikes.** Three failed attempts → stop, note what went wrong, start fresh.
- **Don't patch broken code.** Starting over beats wrestling with a mess.
- **Corrections become lessons.** Add non-obvious corrections to the Lessons section of `tasks/todo.md`.

---

## Communication

- Detailed explanations, small incremental changes.
- If asked "why are you doing this?" — simplify.
- When in doubt, ask. A quick question beats a wrong implementation.

---

## Session Boundaries

**Start:** Read all three files (including Current State and Lessons in todo.md).

**End:** Update `## Current State` in `tasks/todo.md`:
- What got done
- What's in progress
- Blockers
- What to do next

Write it so the next instance can pick up immediately.

---

## Subagents

Use subagents to keep the main context clean. Offload research, exploration, and parallel work. One task per subagent.
