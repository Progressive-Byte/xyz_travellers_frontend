# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

XYZ Travellers frontend — a Next.js (App Router) booking platform for Bangladesh covering four portals: public/front, guest, host, and admin. This repo is UI-only; the API is a separate sibling repo.

## Commands

```
npm run dev      # start dev server
npm run build    # production build — treat this as the test suite; there is no test runner configured
npm run start    # run a production build
npm run lint     # eslint (eslint-config-next core-web-vitals)
```

There is no test framework in this repo. After any non-trivial change, run `npm run build` to verify the route tree compiles and typechecks (`strict` TypeScript, `noEmit`). Import repo files via the `@/*` path alias (`tsconfig.json`), not relative `../../..` chains.

## Architecture

### Portals and route gating

The app is split into four independent portals, each with its own shell, sidebar/topbar, navigation config, and route-gate component:

- Public/front: `app/(home, destinations, properties, services, blogs, search, auth)`, `sections/*`
- Guest: `app/guest/**` — gated by `components/guest/GuestRouteGate.tsx`, shell in `components/guest/GuestShell.tsx`
- Host: `app/host/**` — gated by `components/host/HostRouteGate.tsx`, shell in `components/host/HostShell.tsx`
- Admin: `app/admin/**` — gated by `components/admin/AdminRouteGate.tsx`, shell in `components/admin/AdminShell.tsx`

Every protected page follows the same pattern: the route file in `app/` is a thin wrapper that renders `<XRouteGate><XSomePage /></XRouteGate>`, where the actual page UI lives in `components/<portal>/...`. Route gates redirect based on `user.roles` from `AuthContext` (e.g. an admin hitting a guest route gets redirected to `/admin/...`). When adding a new protected page, follow this wrapper pattern rather than putting gate logic inline in `app/`.

### Auth

- `context/AuthContext.tsx` is the single source of truth for the authenticated user/token (`useAuth()`), hydrated client-side from `localStorage` via `lib/auth.ts` (`AUTH_TOKEN_KEY` / `AUTH_USER_KEY`). Check `isHydrated` before making auth-based redirect decisions to avoid flashing a logged-out state.
- `AuthUser.roles` (`string[]`) drives which portal a user can access; a single account can hold multiple roles.

### Data layer — one file per portal

All backend calls are centralized in `lib/`, one file per portal, each exporting typed request functions built on `lib/api.ts`:

- `lib/front.ts` — public homepage/search/property-details endpoints
- `lib/guest.ts` — guest bookings, dashboard, messaging, payments, profile, reviews, wishlist
- `lib/host.ts` — largest file (~4000 lines): properties, media, units/pricing/calendar, verification, businesses, reservations, messages, reviews, earnings, payouts
- `lib/admin.ts` — admin auth, homepage curation, host/property application moderation, bookings, commission, locations

`lib/api.ts` provides the shared primitives: `apiRequest<T>` (throws `ApiError` on failure or on a missing `data` envelope) and `apiRequestOptional<T>` (same, but returns `null` instead of throwing when `data` is absent — used for endpoints that can legitimately return no payload). Both unwrap a `{ success, message, data }` envelope and auto-handle `FormData` bodies (skip the JSON `Content-Type` header). Prefer these over raw `fetch` for any new backend call.

Every `lib/*.ts` file follows the same normalization convention at the top: `asRecord`, `asString`, `asOptionalString`, `asArray`, `asBoolean`, `asNumber` helpers that defensively coerce untyped API JSON into the file's exported types. Reuse this pattern (don't trust raw API response shapes directly in components).

### API contracts live in a sibling repo

The backend API is documented (not implemented) at `../xyz_travellers_api/docs/api/{admin,front,guest,host,auth,system}/*.md`. **Before adding or changing any `lib/*.ts` request function, read the matching doc there first** — field names, required vs. optional fields, and endpoint shapes must match the doc exactly (e.g. host business documents use multipart field `file` and JSON fields `label`/`notes`/`issuedAt`/`expiresAt`/`isActive`, not generic aliases). If a doc changes, re-read it before assuming existing frontend code is still correct — this repo has real instances of stale UI assumptions after backend endpoints changed.

### Media URLs

Remote media from the API must be resolved through `resolveApiUrl` / `resolveEmbeddableApiUrl` (`lib/api.ts`), which routes same-origin-as-API-base images through `app/api/media-proxy/route.ts`. Don't hardcode or directly `<img src>` a raw API URL — use these helpers so the proxy allowlist (`isAllowedApiUrl`) and caching headers are respected.

### Property applications / locations

`lib/properties-store.ts` and `lib/locations-store.ts` hold store-like helpers layered on top of `lib/admin.ts` for admin property-application review and location management — check these before duplicating similar logic in `lib/admin.ts`.

## Design system

Defined in `app/globals.css` as CSS variables, mapped into Tailwind in `tailwind.config.ts` (`primary`, `text-primary`/`text-secondary`, `background`, `card`, `surface`, `border`, `footer-*`). Fonts are `Sora` (headings, `font-sora`) and `Instrument Sans` (body, default). Key tokens:

- Primary (lime green): `#D9F14B`, hover `#CDE243`, light `#F5FBE0`
- Background (cream): `#EFEDE6`; card `#FFFFFF`
- Text primary (false black) `#1A1B12`; text secondary `#6C6D66`
- Border `#D9D8D0`; footer background `#1A1B12`

Use lime green for CTAs/active states/badges, cream for page background, false black for headings and dark sections (footer). Keep `Sora` for headings and `Instrument Sans` for body/UI text.

## Planning docs

`plans/{admin,front,guest}/*.md` are chunked implementation plans that were used to build out each portal incrementally — note the host portal's plans live under `plans/front/` (e.g. `plans/front/HOST_PORTAL_CHUNKED_PLAN.md` is the source of truth for host portal chunk numbering, with per-chunk detail in `plans/front/HOST_PORTAL_CHUNK_<N>_PLAN.md`). `tasks/todo.md` logs completed chunks with review notes; `tasks/lessons.md` records project-specific regressions and conventions learned during development (fonts/colors, hero search bar behavior, listing card rules, host workflow contract details) — read it before touching areas it covers, and add to it after any user correction, following its existing structure.
