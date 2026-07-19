# Client-first public journey

## Goal

Make the public real-estate experience clearer and less repetitive for people
buying, renting, or selling property in Indaiatuba and the surrounding region.
The landing page should guide visitors to one of four actions: browse homes,
choose sale or rental, offer a property for sale, or start a WhatsApp enquiry.
Use `carladestro@yahoo.com.br` as the only displayed public email address.

## Non-goals

- Public registration, customer accounts, favourites, saved searches, CRM,
  analytics provider, checkout, or lead persistence.
- Changes to Prisma, R2, authentication, admin routes, environment variables,
  or deployment.
- Invented testimonials, statistics, valuations, or service guarantees.
- Changing the confirmed phone number, WhatsApp number, Instagram, CRECI, or
  property data model.

## Acceptance criteria

- Desktop and mobile public navigation offer the same client-facing routes;
  the shared public header does not expose the administrative panel.
- Every public email display and `mailto:` link uses
  `carladestro@yahoo.com.br`.
- The landing page has one curated property section rather than repeating the
  same catalogue across sale, rental, featured, and launch carousels.
- The landing page has clear paths for buying, renting, and selling, with an
  owner CTA that opens WhatsApp using a concise prefilled message.
- Homepage discovery exposes only high-value criteria: transaction, property
  type, neighbourhood, and price range. Detailed condominium and specification
  filters remain available only in the catalogue.
- Catalogue filters keep all current capabilities but display essential filters
  first and detailed controls under an accessible “Mais filtros” disclosure.
- `npm run lint` and `npx tsc --noEmit` pass. Run `npm run build` before final
  integration if the required production environment is available; otherwise
  report the exact missing configuration.

## Risks and decisions

- Keep the product boundary: a public catalogue that converts enquiries through
  WhatsApp, managed by one broker-admin. Do not add a CRM or customer accounts.
- `src/components/site-header.tsx` is shared by all public routes. Its mobile
  menu must be keyboard-accessible, close when a link is selected, and preserve
  the existing Portuguese public routes.
- Do not create testimonials or claims of sales volume without approved source
  content. Trust copy may use existing facts only: Indaiatuba and region,
  consultative service, WhatsApp, and CRECI 210872-F.
- Preserve the existing uncommitted change in
  `src/components/admin/property-form.tsx`; it is outside this initiative.
- Before any implementation, the Builder must read `AGENTS.md`, this plan,
  the relevant component files, and the applicable Next.js 16 guidance under
  `node_modules/next/dist/docs/`.

## Tasks

| # | Owner | Scope / files | Depends on | Validation | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Sol | Confirm copy and interaction decisions: owner CTA wording must not promise a free appraisal; define homepage query parameter names only if needed. Review the existing `.codex` workflow and inspect current working-tree changes. | — | Review this plan; `git diff --check` | Complete |
| 2 | Experience specialist | Public header and contact consistency. Own `src/components/site-header.tsx`, `src/app/contato/page.tsx`, `src/components/site-footer.tsx`, and optionally a small shared public-contact constant. Build accessible mobile navigation, remove public `/admin` access, retain client links, and standardize the Yahoo email. | 1 | Manual desktop/390px keyboard check; `npm run lint`; `npx tsc --noEmit` | Complete |
| 3 | Experience specialist | Landing-page hierarchy. Own `src/app/page.tsx`, `src/components/property-search.tsx`, and `src/components/property-carousel.tsx` only if required. Replace four overlapping carousels with one curated featured section; add clear Comprar, Alugar, and Quero vender meu imóvel paths; limit homepage search to transaction, type, neighbourhood, and price. Do not render a second six-card results grid on the homepage. | 1 | Manual desktop/390px check; no empty sections; all CTA destinations work; `npm run lint`; `npx tsc --noEmit` | Complete |
| 4 | Builder | Progressive full-catalogue filters. Own `src/components/property-listing.tsx` and `src/app/imoveis/[categoria]/page.tsx` only if Task 3 requires validated query-based initial state. Keep type, neighbourhood, price, bedrooms, and sort visible; place city when needed, condominium, gated status, bathrooms, and parking under accessible “Mais filtros”. Preserve filtering, sorting, reset, and empty-state behavior. | 3 | Manual essential/advanced/combined/empty-state checks at desktop and 390px; `npm run lint`; `npx tsc --noEmit` | Complete |
| 5 | Reviewer | Read-only review of Tasks 2–4. Check Brazilian Portuguese, mobile keyboard navigation, focus behavior, public/admin boundary, contact consistency, route/query safety, no fabricated claims, and no regression in WhatsApp property enquiries. | 2–4 | Reviewer report: blocking / important / suggestion with file and line references | Complete |
| 6 | Sol | Reconcile review findings, ensure no task overwrote another’s owned files, run final checks, and report completed work plus any environment limitation preventing `npm run build`. | 5 | `npm run lint`; `npx tsc --noEmit`; `npm run build` or documented constraint | Complete |

## Final verification

- [x] `rg -n "contato@carladavanso\.com\.br" src` returns no matches.
- [x] All public email displays and `mailto:` links use
  `carladestro@yahoo.com.br`.
- [ ] The public header has no `/admin` link and works at 390px and desktop
  widths by keyboard and pointer.
- [x] Homepage presents buyer/renter and seller routes, one curated property
  section, and no fabricated trust claims.
- [x] Homepage discovery has no condominium-name or gated-condominium filter.
- [x] Full catalogue retains advanced controls under “Mais filtros”, including
  reset, sorting, and an empty-state recovery action.
- [x] `npm run lint` and `npx tsc --noEmit` pass.
- [x] `npm run build` passes, or the exact unavailable environment constraint
  is recorded.
- [x] Reviewer reports no blocking issue.
- [x] No secrets, production configuration, admin/data/storage/auth changes,
  or unrelated files are included.

The header and responsive catalogue behavior passed static accessibility review
and rendered-route checks. A live 390px/desktop pointer and keyboard pass could
not run because the in-app browser exposed no available browser instance.
