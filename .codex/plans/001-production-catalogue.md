# Production-ready property catalogue

## Goal

Complete the smallest production-ready catalogue for one broker: Vercel hosts the
Next.js application, Neon stores property metadata, Cloudflare R2 stores images,
and one environment-configured administrator can create and manage properties.

## Non-goals

- Public registration, customer accounts, OAuth, or multiple admin roles.
- CRM, checkout, payments, saved properties, or lead persistence.
- A monorepo, separate backend, queue, or Cloudflare Worker.
- Advanced image processing or automatic background orphan cleanup in the first release.

## Acceptance criteria

- There is no registration path and only the configured admin can access every
  admin page and mutation endpoint.
- Production uses Neon through `DATABASE_URL`; schema changes are represented by
  committed Prisma migrations and applied with `npm run db:migrate`.
- The browser uploads JPEG, PNG, or WebP files directly to R2 using authenticated,
  short-lived signed URLs. R2 credentials never reach client code.
- Uploads enforce server-side MIME, count, size, and generated object-key rules.
- Image metadata stores the R2 object key as well as its public URL and order.
- The admin can create, list, edit, publish/unpublish, reorder images, and remove a
  property. Destructive image behavior is explicit and reports partial failures.
- Every property card opens a real detail page with its gallery, facts, price,
  description, and a WhatsApp message containing the property title and code.
- Production database failures show an honest error state and never silently show
  sample properties.
- The configured R2 custom domain is accepted by `next/image` using a narrow remote pattern.
- Vercel, Neon, and R2 environment/setup documentation matches the application.

## Risks and decisions

- Keep Auth.js with JWT sessions, but use only the environment-configured admin.
  Remove the database-user fallback and unused Auth.js adapter models so a second
  login path cannot appear accidentally. Prefer `ADMIN_PASSWORD_HASH` over a raw
  production password and compare it with bcrypt.
- The current `/imoveis/[categoria]` route occupies the same URL shape used by card
  links. Use `/imovel/[slug]` for details and update card links; keep category URLs unchanged.
- Store an R2 `objectKey` on each `PropertyImage`. Do not trust a client-submitted
  public URL; derive the URL server-side from an approved object key.
- Direct uploads can leave an object behind if property creation is abandoned.
  Accept this bounded first-release risk and document a manual cleanup procedure;
  do not add a queue or scheduled worker yet.
- R2 deletion and PostgreSQL deletion cannot share one transaction. Unpublish first,
  delete R2 objects with explicit result handling, then delete metadata only under a
  documented policy. Never hide a storage deletion failure.
- Preserve existing uncommitted `package.json`, `package-lock.json`, and `.codex/`
  work unless its owner explicitly replaces it.

## Tasks

| # | Owner | Scope / files | Depends on | Validation | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Sol | Confirm the final data/auth contract; inspect `prisma/schema.prisma`, `src/auth.ts`, existing package changes, and migration state. Define required env names without values. | — | Plan review; `git diff --check` | Planned |
| 2 | Builder | Establish production persistence and single-admin auth: `prisma/schema.prisma`, new `prisma/migrations/**`, `src/auth.ts`, `package.json`, lockfile, and a committed `.env.example` allowlist. Remove the database login fallback and unused adapter schema/dependencies; add `PropertyImage.objectKey`. | 1 | `npx prisma validate`; `npx prisma generate`; `npm run lint`; `npx tsc --noEmit` | Planned |
| 3 | Reviewer | Review task 2 for migration safety, exactly-one-admin behavior, password hashing, session configuration, server-side authorization, dependency changes, and secret hygiene. Read-only. | 2 | Reviewer report with blocking/important/suggestion classification | Planned |
| 4 | Builder | Implement R2 primitives and signed-upload API in `src/lib/s3.ts`, storage validation modules, and `src/app/api/admin/uploads/route.ts`. Generate keys server-side, sign only approved uploads, and add deletion support without exposing credentials. | 3 | Focused validation tests; `npm run lint`; `npx tsc --noEmit` | Planned |
| 5 | Builder | Replace pasted image URLs in `src/components/admin/property-form.tsx` with direct browser-to-R2 file uploads, progress/error states, previews, removal, and ordering. Submit approved object keys to the property API. | 4 | Manual upload failure/success checks; `npm run lint`; `npx tsc --noEmit` | Planned |
| 6 | Reviewer | Review tasks 4–5 for auth on the signing route, MIME/size/count policy, server-generated keys, short expiry, R2 CORS assumptions, credential leakage, orphan behavior, and client error recovery. Read-only. | 5 | Reviewer sign-off before property mutation integration | Planned |
| 7 | Builder | Complete property data APIs and admin management: update shared Zod contracts, make creation transactional in `src/app/api/admin/properties/route.ts`, add authenticated item routes under `src/app/api/admin/properties/[id]/`, and add an admin list/edit/publish/remove UI. | 6 | API validation tests; `npm run lint`; `npx tsc --noEmit` | Planned |
| 8 | Builder | Complete the public catalogue: add `src/app/imovel/[slug]/page.tsx`, add a single-property query, update `src/components/property-card.tsx`, build gallery/details/metadata, and include property title/code in WhatsApp links. | 7 | Known/unknown slug checks; responsive manual check; `npm run lint`; `npx tsc --noEmit` | Planned |
| 9 | Builder | Harden runtime and deployment: stop production sample-data fallback in `src/lib/properties.ts`, add honest error/empty states, narrowly allow the R2 custom image domain in `next.config.ts`, and update `README.md` plus `.env.example` for Vercel/Neon/R2 and migrations. | 8 | Missing-DB and bad-image-config checks; `npm run lint`; `npm run build` | Planned |
| 10 | Reviewer | Final review of auth, data, storage, deletion lifecycle, public regressions, deployment configuration, and accessibility. Read-only. | 9 | Reviewer sign-off; no blocking findings | Planned |
| 11 | Sol | Integrate findings, run final verification, and report any production-console steps that still require explicit user action. Do not deploy, create cloud resources, set secrets, or migrate production data without authorization. | 10 | Final verification checklist | Planned |

## Final verification

- [ ] `npx prisma validate`
- [ ] `npx prisma generate`
- [ ] `npm run lint`
- [ ] `npx tsc --noEmit`
- [ ] `npm run build` (or documented reason it cannot run)
- [ ] Authenticated admin create/edit/publish/unpublish/remove flow verified
- [ ] Direct R2 upload and rejected invalid upload verified
- [ ] Public category, property detail, image, and WhatsApp flows verified
- [ ] Production database failure does not display sample listings
- [ ] Reviewer sign-off for auth/data/storage/deployment changes
- [ ] No secrets or unrelated files included
