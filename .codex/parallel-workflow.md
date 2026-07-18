# Parallel workflow rules

Parallel work is valuable only when the tasks are independent. The orchestrator
must assign file ownership before starting builders.

## Safe parallel combinations

| Initiative | Parallel task A | Parallel task B | Parallel task C |
| --- | --- | --- | --- |
| R2 uploads | Signed-upload API and validation | Admin upload UI | Review storage security/configuration |
| Property management | Edit/update API and validation | Admin list/manage UI | Public listing/detail regression review |
| Launch hardening | Deployment/env documentation | Error and empty states | Auth and security review |
| Public polish | Listing/card visual work | WhatsApp enquiry UX | Metadata/accessibility review |

## Never parallelize these without explicit file separation

- Prisma schema changes and code that depends on the new schema.
- `src/auth.ts`, login UX, and authorization guards.
- The same admin form or API route.
- Package/dependency changes.
- Deployment environment configuration.

## Completion contract for every task

Each agent returns:

1. Files changed and purpose.
2. Validation run and result.
3. Assumptions or open risks.
4. A note if it touched authentication, data, storage, or secrets.

Do not commit, deploy, rotate secrets, modify production data, or apply database
migrations unless the user explicitly requests it.
