// Mira v1 — multi-funnel 50/50 split with sticky cookie persistence.
// First production deployment of the Sellmore split-testing primitive.
// Linear: SELL-220
//
// Behavior:
//   1. Request to /mira-v1/ (campaign root)
//   2. Read cookie `mira-v1-funnel`. If set ∈ {a, b}, redirect to that funnel's presell.
//   3. If unset, randomly assign 50/50, set cookie (30-day Max-Age), redirect to chosen funnel.
//   4. Querystring (incl. ?currency=USD|GBP, ?utm_*, etc.) is preserved in the redirect.
//   5. Direct visits to /mira-v1/presell-a/ or /mira-v1/presell-b/ bypass this function entirely
//      (Netlify path matcher only fires on the campaign root).
//
// Why -a/-b not subdirectories: page-kit's campaign-build collapses funnel
// subdirectories during the source → _site transform. Flat filenames with
// suffixes are the cleanest workaround. See SELL-220 + the campaign-build
// "single-funnel-only" gap noted on the issue.

import type { Config, Context } from "https://edge.netlify.com/";

// Funnels are flat-suffixed pages within a single page-kit campaign:
//   "a" = Advertorial path (presell-a → landing-a → checkout-a → upsell-a → receipt-a)
//   "b" = Listicle path    (presell-b → landing-b → checkout-b → upsell-b → receipt-b)
type Funnel = "a" | "b";
const FUNNELS: readonly Funnel[] = ["a", "b"] as const;
const COOKIE_NAME = "mira-v1-funnel";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function parseCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return rest.join("=");
  }
  return null;
}

function pickFunnel(): Funnel {
  // 50/50 — Math.random() is fine for non-security distribution.
  return Math.random() < 0.5 ? "listicle" : "advertorial";
}

export default async (request: Request, _context: Context): Promise<Response> => {
  const url = new URL(request.url);
  const cookieHeader = request.headers.get("cookie");
  let funnel = parseCookie(cookieHeader, COOKIE_NAME) as Funnel | null;

  let setCookie = false;
  if (!funnel || !FUNNELS.includes(funnel)) {
    funnel = pickFunnel();
    setCookie = true;
  }

  // Preserve querystring (?currency=, ?utm_*, etc.) on the redirect.
  // Page-kit transforms `presell-a.html` → `_site/mira-v1/presell-a/index.html`,
  // so the entry URL is `/mira-v1/presell-a/`.
  const target = `/mira-v1/presell-${funnel}/${url.search}`;

  const headers = new Headers({ Location: target });
  if (setCookie) {
    headers.append(
      "Set-Cookie",
      `${COOKIE_NAME}=${funnel}; Path=/mira-v1/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax`,
    );
  }
  // Brief diagnostics for QA verification.
  headers.set("x-mira-funnel", funnel);
  headers.set("x-mira-funnel-source", setCookie ? "fresh" : "sticky");

  return new Response(null, { status: 302, headers });
};

export const config: Config = {
  // Match only the campaign root. Direct hits to /mira-v1/listicle/* or
  // /mira-v1/advertorial/* skip this function (no redirect loop).
  path: "/mira-v1/",
};
