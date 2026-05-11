# Meridian Campaigns OS Test Bed

This repository is an optional Sellmore test bed for Campaigns OS campaign builds.
Use it when Vukasin Djacic or the campaign lead asks for a wired repo that can
produce previewable campaign routes without creating a new deployment target.

It is not the source of truth for Campaigns OS tooling. Treat the public
`campaigns-os` repo, the Campaigns OS Guide, Campaign Map, Campaigns App, and the
CampaignSpec/API response as the operating inputs for a new build.

## Expected Workflow

1. Create a feature branch for the campaign or evaluation pass.
2. Bring a CampaignSpec/API key plus prepared HTML and assets, or clearly state
   which existing campaign source should be reused.
3. Choose the closest starter template family and read its agent contract before
   editing checkout, cart, upsell, or receipt surfaces.
4. Replace demo package, shipping, voucher, payment, tracking, footer, and SEO
   values from the CampaignSpec/API. Do not carry placeholder IDs forward.
5. Preserve SDK-controlled commerce surfaces unless the contract says they are
   safe to edit.
6. Register the route in `_data/campaigns.json`.
7. Run `npm run build`, inspect the generated route locally, and hand the preview
   URL to Campaigns OS QA when a deployed preview is available.

## Repo Shape

- `_data/campaigns.json` is the route registry used by page-kit.
- `src/<campaign-slug>/` contains each isolated campaign funnel.
- `campaign-spec-*.json` files are local fixtures for test campaigns. Do not add
  secrets or private production credentials.
- `_site/`, `node_modules/`, and `.gstack/` are generated local output and should
  stay untracked.
- `.campaign-runtime/` files are build-session artifacts. Commit one only when it
  is intentionally useful for review and has been checked for local-only paths or
  sensitive values.

## Campaigns OS Guardrails

- Do not copy Smooche-era test files or failed pilot artifacts into new work.
- Do not blindly copy Olympus-style `shipping_methods` into every family. Use the
  CampaignSpec/API and the chosen template contract.
- `shop-three-step` uses dynamic shipping through
  `window.next.getShippingMethods()`; keep that shape intact.
- Respect contract fields such as `frontmatter.demoOnlyValues`,
  `frontmatter.replaceFromSpecOrApi`, and `frontmatter.removeWhenUnsupported`.
- Keep GTM and Meta Pixel values empty when tracking should be off; placeholder
  non-empty IDs can still inject scripts in non-development builds.
- If `campaign-init` offers to overwrite this file, pass `--keep-ai-context`
  unless the campaign lead explicitly wants a generated replacement.

## Review Expectations

PRs from this repo should make the test purpose obvious: campaign slug, source
HTML/assets, CampaignSpec source, chosen template family, build result, and QA
status. If this repo is being used for dogfooding, keep the feedback concrete:
what worked, what was confusing, what the agent guessed, and what the tools should
make harder to get wrong next time.
