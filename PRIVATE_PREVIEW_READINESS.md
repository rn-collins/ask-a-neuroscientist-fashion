# Private-preview readiness

**Status:** technically ready for private preview at this commit.

## Closed

- All public clean routes return HTTP 200 in the local static-route smoke test; unknown routes return the project 404.
- Objects and Evidence remain directly visible in the compact mobile global navigation.
- Every public route receives a route-specific title, description, canonical URL, Open Graph metadata and Twitter card declaration at runtime.
- Static response headers include a scoped CSP, `frame-ancestors 'none'`, MIME-sniffing protection, deny framing, strict-origin referrer policy and restrictive permissions policy.
- CSP permits the current real dependencies: Met Open Access images, Google Fonts CSS/files, local scripts/styles and inline scripts already used by the static exhibition.
- Evidence Fitting Room filtering/reset behavior, claim-to-manifest coverage, canonical Met accessions, rights fields, production status language, navigation structure, hostname rewrite and HTTP routing are tested.
- The corrections page publishes no fabricated address and directs reports to repository-owned, public GitHub correction and takedown forms with a sensitive-information warning.

## Remaining external gates

1. The GitHub repository and Vercel project are connected through RN’s authenticated accounts.
2. GitHub Issues are enabled so the correction and takedown forms resolve publicly.
3. The deployed preview is checked once on its real hostname before promotion.

This record concerns technical private-preview readiness. Scientific review, interviews and finished media remain editorial production stages and are not represented as complete.
