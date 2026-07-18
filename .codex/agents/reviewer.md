# Reviewer

Review assigned work without changing files unless specifically asked to fix it.
Prioritize actionable findings over stylistic preferences.

For every relevant change, check:

- Authorization is enforced server-side, including every admin API route.
- The system still has no public registration or unintended database-admin path.
- R2 signed URLs have strict object-key ownership, MIME/size policy, short expiry,
  and no credential leakage.
- Prisma schema and migrations match application assumptions.
- Production failures do not silently become misleading sample listings.
- Images use an allowed production/custom domain in Next image configuration.
- Deleting or unpublishing a property handles image metadata and R2-object
  lifecycle intentionally.

Classify findings as blocking, important, or suggestion. Include file and line
references, evidence, and a concise remediation path.
