# XYZ Travellers Host Public Landing Page Plan

## Purpose

This document defines the frontend plan for a new **public host landing page** that appears when a logged-out user clicks:

- `Become a host`
- `Earn by Hosting`
- other public hosting entry links

Instead of sending logged-out users directly to the host registration page, the product should first show a full branded landing page that matches the visual language of XYZ Travellers.

This is a **plan only**.

It does not replace the existing host onboarding workspace and it does not include implementation yet.

## Source Context

This plan is based on:

- the current public navigation and footer entry points
- the existing host onboarding route and route-gate behavior
- the current host portal planning documents, especially:
  - `plans/front/HOST_PORTAL_CHUNKED_PLAN.md`
  - `plans/front/HOST_PORTAL_CHUNK_12_PLAN.md`
- the current project branding and front-portal visual system
- the attached landing-page reference image

## Core Product Change

### Current behavior

When the user is logged out and clicks host-entry actions in public surfaces, they are sent directly to:

- `/auth?mode=register&intent=host`

### New behavior

When the user is logged out and clicks host-entry actions in public surfaces, they should be sent to a **public host landing page** first.

From that page, they can then choose to:

- start hosting
- log in for host access
- continue into the existing onboarding/dashboard flows as appropriate

### Important constraint

This new page is **not** the onboarding workflow.

It is a pre-auth public landing experience.

The existing protected host flows should remain intact:

- approved host -> `/host/dashboard`
- authenticated non-host -> `/host/onboarding`
- logged-out user trying to access protected host routes -> `/auth?mode=login&intent=host`

## Objective

Create a marketing-style but product-aligned public landing page for hosting that:

- feels like part of the XYZ Travellers site
- uses the project’s cream, lime, soft neutral, and premium-travel visual language
- prepares users before registration or host login
- explains value, trust, support, and next steps clearly
- removes the abrupt jump from public site to raw auth screen

## High-Level UX Direction

The attached design reference is useful for structure, but the final page should use **XYZ Travellers styling**, not a direct clone.

That means:

- keep the site’s current typography direction
- use the existing soft premium surfaces and border language
- use project brand tokens and spacing rhythm
- keep the page visually aligned with `Navbar`, `Hero`, homepage sections, and `Footer`

## Explicit Content Rule

The new landing page should **not include** a `See How It Works` section.

Any plan or later implementation should exclude:

- video embed section
- tutorial-video block
- `See How It Works` title or equivalent video module

## Recommended Route Strategy

## Canonical public route

Recommended new public route:

- `/host`

Why this is the cleanest option:

- it is intuitive and short
- it sits naturally beside the protected `/host/*` portal routes
- there is currently no public `app/host/page.tsx`
- it becomes the natural public host entry page

## Protected routes that remain unchanged

- `/host/onboarding`
- `/host/dashboard`
- all other existing `/host/*` protected workspace routes

## Redirect / entry behavior

### Logged-out user

When logged out:

- `Become a host` -> `/host`
- `Earn by Hosting` -> `/host`
- footer host resource links that are acting as entry points -> `/host`

### Authenticated non-host user

When authenticated but not yet a host:

- primary host-entry actions may continue directly to `/host/onboarding`
  or
- may land on `/host` and then be routed to onboarding through CTA logic

Recommended behavior:

- top-level public entry buttons should send authenticated non-host users directly to `/host/onboarding`
- the public landing page is primarily for logged-out discovery

### Authenticated approved host

When already approved as host:

- host-entry actions should go directly to `/host/dashboard`

## Recommended Entry-Point Rule

Centralize host-entry link resolution in one shared helper instead of scattering conditional logic across:

- `components/layout/Navbar.tsx`
- `components/layout/Footer.tsx`
- any future homepage CTA sections
- any future blog or service CTA blocks

This prevents redirect drift.

## Scope

This plan includes:

- one new public host landing route
- landing-page content architecture
- entry-point behavior for logged-out users
- CTA routing rules for logged-out, non-host, and approved-host users
- design alignment with the front portal
- implementation sequencing for later work

This plan does not include:

- rebuilding the host onboarding form
- changing host onboarding API contracts
- changing host verification logic
- changing admin moderation flow
- adding video/tutorial content
- redesigning the entire auth system

## Current Relevant Files

### Public entry points

- `components/layout/Navbar.tsx`
- `components/layout/Footer.tsx`

### Existing auth surfaces

- `app/auth/page.tsx`
- `components/auth/AuthLayout.tsx`
- `components/auth/AuthForm.tsx`

### Existing host onboarding and gating

- `app/host/onboarding/page.tsx`
- `components/host/HostRouteGate.tsx`
- `components/host/onboarding/HostOnboardingPage.tsx`
- `components/host/onboarding/hostOnboarding.ts`

### Public style references

- `sections/Hero.tsx`
- `sections/WhyChooseUs.tsx`
- `sections/AboutXYZTravellers.tsx`
- `components/layout/Footer.tsx`
- `components/branding/BrandLogo.tsx`

## Content Architecture

The public host landing page should be a structured marketing page with strong action clarity.

## Section 1: Hero

### Purpose

This section should immediately answer:

- what hosting is here
- why it is valuable
- what the next action is

### Content direction

- bold value proposition around earning from apartments, rooms, hotels, and short-stay properties
- short supporting copy emphasizing trust, support, and platform guidance
- strong primary CTA
- secondary CTA for existing users

### Recommended CTAs

- Primary: `Start hosting`
- Secondary: `Host sign in`

### CTA behavior

- `Start hosting`
  - logged out -> `/auth?mode=register&intent=host`
  - authenticated non-host -> `/host/onboarding`
  - approved host -> `/host/dashboard`

- `Host sign in`
  - logged out -> `/auth?mode=login&intent=host`
  - authenticated non-host -> `/host/onboarding`
  - approved host -> `/host/dashboard`

### Visual direction

- strong brand-aligned hero, not a generic SaaS block
- project background tones, lime accents, soft gradients, premium cards
- likely keep a clean centered composition similar to the reference
- no heavy dark theme unless it clearly matches current project tokens

## Section 2: Why Host With XYZ Travellers

### Purpose

Translate the reference’s benefit-grid area into the current project’s design language.

### Content direction

A 4 to 6 card benefit grid covering themes like:

- flexible hosting
- trusted guest handling
- marketing support
- booking coordination
- clear onboarding support
- fast setup path

### Important note

This section should feel like a continuation of the front portal card language, not a separate host portal UI.

## Section 3: Hosting Categories / Property Types

### Purpose

Show what kinds of spaces or stays can be hosted on the platform.

### Recommended content sources

Use existing project context such as:

- `data/homeCategories.ts`
- current public inventory language

Suggested positioning:

- apartments
- rooms
- hotels
- optionally villas or resorts if the public brand language already supports them elsewhere

### Why this section matters

It makes the page feel specific to the product rather than generic hosting marketing copy.

## Section 4: Support And Trust Section

### Purpose

Replace the reference’s generic trust claims with product-grounded support messaging.

### Recommended themes

- onboarding guidance from start to submission
- availability and pricing setup help
- guest communication and booking flow support
- platform-led visibility and listing exposure

### Optional detail

For commercial/business hosts, this section can lightly reference business verification support without turning into a compliance-heavy form explanation.

Relevant future implementation context:

- `components/host/businesses/documents/businessDocumentTypes.ts`

This is useful only as a supporting detail, not as the main story.

## Section 5: Contact / Start Earning CTA Block

### Purpose

Keep the reference’s “ready to start” momentum, but expressed in current brand language.

### Recommended content

- one clean CTA panel rather than multiple unrelated cards
- support contact methods if they already align with the public site
- final `Start hosting` action
- optional `Talk to us` / `Contact support` secondary link

### Recommendation

Keep this section more compact than the reference.

The key job is conversion, not information overload.

## Section 6: Hosting Made Simple / Process Summary

### Purpose

Replace the reference’s later informational block with a concise step summary that fits the existing onboarding model.

### Recommended steps

1. create or log into your account
2. complete host onboarding and identity verification
3. add property details, media, units, pricing, and verification
4. submit for review and go live after approval

### Important note

This section should summarize the existing host flow.

It should not invent a different onboarding model from the live portal and host plans.

## Sections To Exclude

Do not include:

- `See How It Works`
- embedded YouTube/video section
- tutorial reel
- duplicate FAQ wall unless later requested
- testimonial slider unless later requested

## Route And Behavior Matrix

## Entry sources that should point to the new landing page when logged out

At minimum:

- navbar `Become a host`
- footer `Earn by Hosting`
- footer `Host Resources`
- footer `Responsible Hosting`

Potential future sources:

- homepage CTA
- blog CTA
- service-detail CTA if hosting is promoted there

## Behavior matrix

### Logged-out

- public host entry click -> `/host`
- on landing page:
  - `Start hosting` -> `/auth?mode=register&intent=host`
  - `Host sign in` -> `/auth?mode=login&intent=host`

### Authenticated, not host yet

- public host entry click -> `/host/onboarding`
- if they somehow land on `/host`, the page can either:
  - still render and show `Continue onboarding`
  - or redirect to `/host/onboarding`

Recommended implementation direction:

- direct them to `/host/onboarding` from the entry-point helper

### Authenticated host

- public host entry click -> `/host/dashboard`

## Design Principles

### Principle 1: Public page first, portal page second

This page should feel like a public landing experience, not a disguised dashboard or onboarding form.

### Principle 2: Reuse the front portal design system

Use the same visual family as the public homepage:

- premium soft surfaces
- consistent spacing rhythm
- existing typography system
- current lime/cream/neutral palette

### Principle 3: Keep the page conversion-focused

The page should guide users to a clear next action quickly.

It should not become a long, noisy marketing page.

### Principle 4: Stay truthful to the actual host flow

The landing page should describe the real onboarding and listing setup journey already defined by the host portal.

## Main Files Likely To Be Touched Later

### New route and page composition

- `app/host/page.tsx`
- `components/host/public/*` or similar new host-marketing component folder

### Entry-point logic

- `components/layout/Navbar.tsx`
- `components/layout/Footer.tsx`
- optional shared helper file for host entry resolution

### Auth CTA handoff

- `components/auth/AuthForm.tsx` only if CTA copy or return-flow needs a small alignment tweak

### Optional shared content/data support

- `data/homeCategories.ts`
- `data/frontServices.ts` only if cross-linking or support positioning is useful

## Recommended Implementation Phases

## Phase 1: Route foundation and entry-point rules

### Goals

- create canonical public host route
- define entry-point resolution helper
- update navbar and footer host links

### Deliverables

- `/host` public route exists
- logged-out users land there first
- logged-in users still go to onboarding or dashboard correctly

## Phase 2: Landing page hero and conversion surface

### Goals

- build hero section
- add primary and secondary CTA logic
- align layout with public portal visual language

### Deliverables

- page has strong first-screen conversion behavior
- CTA routing reflects real auth/host states

## Phase 3: Benefit and trust sections

### Goals

- add benefit grid
- add property-type relevance section
- add support/trust messaging

### Deliverables

- page explains why hosting with XYZ Travellers is valuable
- content is specific to the platform

## Phase 4: Final CTA and process summary

### Goals

- add final conversion block
- summarize onboarding flow
- ensure no unnecessary sections remain

### Deliverables

- page closes clearly with action
- no `See How It Works` section exists

## Acceptance Criteria

This work should be considered complete when:

1. logged-out users clicking public host-entry actions land on a public host landing page instead of the host registration page
2. the new landing page uses the XYZ Travellers front-portal design language instead of feeling like a separate theme
3. the page contains a clear hero, benefits, support/trust content, and final CTA
4. the page does not include a `See How It Works` section or video block
5. authenticated non-host users still reach `/host/onboarding`
6. approved hosts still reach `/host/dashboard`
7. host-entry logic is centralized enough to avoid inconsistent routing across navbar/footer/future CTAs
8. the plan does not weaken the existing protected host route model

## Risks And Watchouts

### Risk 1: Mixing marketing and onboarding into one page

Guardrail:

- keep `/host` public and discovery-focused
- keep `/host/onboarding` protected and workflow-focused

### Risk 2: Redirect inconsistency across entry points

Guardrail:

- use one shared entry-resolution helper later

### Risk 3: Visual drift from the main public site

Guardrail:

- reuse existing front tokens and section patterns
- avoid introducing a separate color system for hosting

### Risk 4: Overbuilding the landing page

Guardrail:

- keep the page concise
- exclude video/tutorial sections
- prioritize conversion clarity over adding more blocks

## Verification Plan For Later Implementation

After implementation:

1. verify logged-out navbar `Become a host` opens the public host landing page
2. verify logged-out footer hosting links open the public host landing page
3. verify `Start hosting` goes to host registration
4. verify `Host sign in` goes to host login
5. verify authenticated non-host users still reach `/host/onboarding`
6. verify approved hosts still reach `/host/dashboard`
7. verify the new page visually matches the rest of the front portal
8. verify no `See How It Works` or video section exists
9. run `npm.cmd run build`

## Final Recommendation

Treat this as a **front-portal conversion and entry-flow improvement**, not a host-portal rewrite.

The cleanest product model is:

- public host discovery at `/host`
- protected onboarding at `/host/onboarding`
- approved host workspace at `/host/dashboard`

That keeps the user journey clearer:

- discover hosting first
- authenticate second
- onboard third
- operate from the portal after approval
