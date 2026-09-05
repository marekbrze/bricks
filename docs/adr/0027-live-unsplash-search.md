# 0027 - Live Unsplash search replaces the bundled mock

**Date**: 2026-09-05
**Module**: vision
**Status**: Accepted — supersedes the "Unsplash search is mocked" decision in ADR 0016

## Context

ADR 0016 kept Unsplash search mocked against twelve bundled photo URLs: good
enough to test the search → pick → add interaction, useless for the thing the
Vision board is actually for — finding *the* photo for a Path. Twelve photos
are the Owner's whole vocabulary, and any query outside their tag list returns
"no results" for reasons that have nothing to do with Unsplash.

The blocker in ADR 0016 was infrastructure: no backend to hold an API key. That
blocker is smaller than it looked. Unsplash's API accepts cross-origin requests
from the browser with the **Access Key** — which is a public `Client-ID`, not a
secret — so a key-less-backend app can call it directly. The remaining question
was only *where the key comes from* for a client-only app that also ships to
GitHub Pages.

## Decision

- **Search the live Unsplash API** (`/search/photos`, and `/photos` for the
  browse-before-you-type state), debounced at 350 ms, paged 24 at a time with
  an explicit "Load more" — superseded requests are aborted.
- **Two key sources, both public-safe**: a `VITE_UNSPLASH_ACCESS_KEY` baked in
  at build time (for a deployment that wants search to just work), or a key the
  Owner pastes into the dialog, stored in their browser under
  `bricks-unsplash-key`. The stored key wins. Same shape as the Dexie Cloud URL
  in `data-sync` (ADR 0023) — configuration the Owner supplies, no backend.
  The **Secret Key** is never used and must never be added.
- **The bundled pool survives as a fallback**, renamed to what it now is
  (`data/unsplash-samples.ts`): it backs the "no key configured" path, the
  "Unsplash is unreachable / rate-limited" escape hatch, and Storybook. Live
  results always win when a key is present.
- **Unsplash's API guidelines are honoured in code, not in prose**: photos are
  hotlinked from `images.unsplash.com` (never re-hosted), every credit link
  carries `utm_source=bricks&utm_medium=referral`, and picking a photo pings
  its `download_location`. The board tile and the markdown export both link the
  photographer *and* Unsplash.
- **Failure has states, not a blank grid**: rejected key, rate limit spent
  (50/hour on a demo key), offline, Unsplash 5xx — each with its own message
  and the right next move (change key / retry / drop to samples).

## Consequences

- A published build without `VITE_UNSPLASH_ACCESS_KEY` still works: the first
  "Search Unsplash" shows a connect panel, and sample photos remain one click
  away. Nothing hard-fails on a missing key.
- A build *with* the key ships that key in the bundle. That is what Unsplash's
  Client-ID is for, but the quota is shared by everyone using the deployment —
  a demo app's 50 requests/hour is spent quickly in public. Prefer the
  Owner-supplied key for a public deploy; treat a baked key as a demo
  convenience.
- Going to production would need Unsplash's app review (demo apps are capped at
  50 requests/hour) — a product step, not a code one.

## Impact

- `src/modules/vision/lib/unsplash-api.ts` (new), `lib/unsplash-config.ts` (new),
  `data/unsplash-samples.ts` (replaces `data/unsplash-mock.ts`).
- `UnsplashSearchDialog` rewritten: search states, paging, key panel, credits.
- `VisionImageAttribution` gains an optional `photoUrl`; older tiles without it
  keep working and fall back to linking Unsplash's home page.
- `.env.example` and `src/vite-env.d.ts` added for the build-time key.
- `docs/modules/vision.md` updated (flow, actions table, edge cases,
  integration points).
