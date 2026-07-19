# Public real-estate experience redesign

## Goal

Make the public site feel like a deliberate, local real-estate brand while keeping the main visitor journey simple: discover an appropriate property, inspect the listing, and contact Carla on WhatsApp.

## Non-goals

- No changes to admin authentication, Prisma schema, Cloudflare R2, or property APIs.
- No customer accounts, CRM, checkout, or third-party services.
- No fabricated testimonials, sales figures, or unavailable listings.

## Acceptance criteria

- The homepage establishes Carla Davanso and the property-search action in the first viewport.
- The public navigation, search, featured listings, and WhatsApp paths remain functional.
- The visual system is more distinctive and tailored to residential real estate, with responsive desktop and mobile layouts.
- Public-facing pages retain accessible labels, contrast, focus styles, and semantic navigation.

## Risks and decisions

- Existing images are remote property photography. Reuse them and preserve Next Image handling; do not introduce generated or stock assets without approval.
- The redesign will focus on the homepage and shared property-card presentation. Listing/detail-page rework is a follow-up after visual validation.
- Content remains factual and local to Indaiatuba and region.

## Tasks

| # | Owner | Scope / files | Depends on | Validation | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | Sol | Assess public experience and define art direction | — | Existing routes and components reviewed | Completed |
| 2 | Builder | Homepage composition, search presentation, brand styles | 1 | `npm run lint` | In progress |
| 3 | Builder | Property-card hierarchy and responsive behavior | 1 | `npm run lint` | Planned |
| 4 | Sol | Browser validation, accessibility smoke checks, integration | 2, 3 | `npm run lint`, `npm run build`, browser checks | Planned |

## Final verification

- [ ] `npm run lint`
- [ ] `npm run build` (or documented reason it cannot run)
- [ ] Desktop and mobile browser checks of the homepage and property navigation
- [ ] No secrets or unrelated files included
