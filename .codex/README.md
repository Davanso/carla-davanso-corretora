# Carla Davanso — AI delivery workflow

This folder provides a small, repeatable workflow for using multiple AI agents on
this repository without turning a simple real-estate catalogue into an
over-engineered product.

## Product boundary

- Public property catalogue with WhatsApp enquiries.
- One broker-admin only. There is no public registration, customer login, CRM,
  marketplace checkout, or multi-user permissions system.
- Vercel hosts the Next.js application; Neon is PostgreSQL; Cloudflare R2 stores
  property images.

## Agent roles

| Role | Model guidance | Owns |
| --- | --- | --- |
| Sol — orchestrator | GPT-5.6 Sol / strongest reasoning model | Scope, plan, task separation, technical decisions, final integration review |
| Builder | Fast capable implementation model | One isolated feature at a time, tests, small documentation updates |
| Reviewer | Strong reasoning model | Security, correctness, regressions, schema/API/deploy review; read-only unless asked |
| Experience specialist | Fast visual/UI model | Public listing UX, responsive design, accessibility, Brazilian Portuguese copy |

The current Codex session chooses the actual available models. The role names are
instructions for model selection and responsibility, not a hard runtime binding.

## Standard execution

1. Give Sol the request using `agents/sol-orchestrator.md`.
2. Sol creates a short plan in `plans/` from `templates/plan.md`.
3. Split only independent work into parallel tasks. Each task has distinct file
   ownership; no two builders edit the same files.
4. Builders implement their assigned tasks and run the relevant checks.
5. A reviewer checks every security, database, storage, deployment, or auth
   change before it is considered complete.
6. Sol integrates the results, resolves conflicts, runs the final verification,
   and reports what changed and what remains.

For a small task, use Sol plus one builder or reviewer instead of forcing parallelism.
See `parallel-workflow.md` for safe task combinations.
