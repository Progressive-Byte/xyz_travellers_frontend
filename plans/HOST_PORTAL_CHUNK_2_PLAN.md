# XYZ Travellers Host Portal Step 2 Plan

## Step Name

Chunk 2: Access Routing And Host Onboarding Entry

## Purpose

This document covers only the second implementation step from `HOST_PORTAL_CHUNKED_PLAN.md`.

It does not plan the full host portal.

It only plans the routing split and onboarding entry experience that should sit between public auth and the approved host portal.

## Objective

Refactor the current host access flow so the app correctly separates:

- logged-out users
- authenticated users without the `host` role
- approved hosts with the `host` role

This step should introduce a proper onboarding route and status-aware onboarding landing page so non-host authenticated users stop hitting a dead-end access screen when they try to enter the host area.

This step should not try to build profile setup, payout setup, properties, businesses, or operations pages yet.

## Why This Is Step 2

Chunk 1 created the shared host shell and established the structural base for the host portal.

But the current route behavior is still incomplete:

- logged-out users are redirected to host login correctly
- approved hosts can reach the dashboard
- authenticated non-host users still hit an access-denied style page instead of a real onboarding flow

That creates a product gap because the backend clearly supports a staged host application flow before the user becomes an approved host.

Without this split:

- non-host users do not get a useful next step
- future onboarding work has no stable route entry
- host access logic stays mixed into page-level fallback UI

So this step exists to turn host access from a dead-end gate into a real routed journey.

## Current Starting Point

Right now the project already has:

- `app/host/dashboard/page.tsx`
- `components/host/HostDashboardShell.tsx`
- `components/host/HostShell.tsx`
- `components/host/HostSidebar.tsx`
- `components/host/HostTopbar.tsx`
- session hydration and auth role access in `context/AuthContext.tsx`
- dashboard API helper in `lib/host.ts`

Current behavior:

- logged-out users are redirected to `/auth?mode=login&intent=host`
- authenticated users with `roles.includes("host")` can enter `/host/dashboard`
- authenticated users without the `host` role see a fallback access-required screen inside the dashboard shell

Current limitation:

- there is no `app/host/onboarding/page.tsx`
- there is no shared host route gate for splitting onboarding vs portal routes
- there is no status-aware onboarding landing page for draft, submitted, approved, or rejected application states
- the current non-host flow does not match the backend product model

## Scope

This step includes:

- adding a dedicated onboarding route at `/host/onboarding`
- introducing host route-gating logic that distinguishes logged-out, non-host, and approved-host users
- routing authenticated non-host users to onboarding instead of the dashboard dead-end state
- building the onboarding landing page shell and status-aware states
- fetching the user’s host identity verification status
- preserving approved-host access to the real portal

This step does not include:

- full identity verification form implementation
- document upload UI beyond lightweight planning placeholders if needed
- host profile editing
- payout profile editing
- properties list or add-property flow
- businesses flow
- reservations, messages, reviews, earnings, or payouts pages

## Product Behavior Model For This Step

This step should enforce three user states clearly.

### State 1: Logged out

Behavior:

- user cannot access host routes
- redirect to `/auth?mode=login&intent=host`

### State 2: Logged in but not approved host

Behavior:

- user can access onboarding route
- user cannot access approved host portal routes like `/host/dashboard`
- if user opens a portal route directly, send them to `/host/onboarding`

### State 3: Approved host

Behavior:

- user can access dashboard and later portal routes
- user should not stay trapped on onboarding if already approved
- if approved host opens onboarding route, redirect to `/host/dashboard`

Important rule:

- `intent=host` is just auth-entry preference
- `roles.includes("host")` remains the real authorization check

## Design Direction

This onboarding entry experience must still follow `UI_REDESIGN_PLAN.md` and the host portal language established in Chunk 1.

### Visual principles

- light premium surfaces, not generic empty-state screens
- clear page hierarchy with one focused primary action
- status states should feel calm and explanatory, not error-heavy
- use lime carefully for progress, CTA, and approved state emphasis
- maintain cream background and soft card rhythm

### UX principles

- onboarding should feel like the start of a journey, not a rejection
- explain why host access is unavailable and what to do next
- surface progress or status simply
- make route outcomes predictable
- keep onboarding separate from the approved host workspace

## Route Coverage In This Step

This step needs to support:

- `/host/dashboard`
- `/host/onboarding`

Behavior rules:

- `/host/dashboard`:
  - logged out -> redirect to auth
  - non-host -> redirect to onboarding
  - approved host -> allow
- `/host/onboarding`:
  - logged out -> redirect to auth
  - non-host -> allow
  - approved host -> redirect to dashboard

Future host routes should follow the same rule family once they are implemented.

## File Plan

### New files

- `app/host/onboarding/page.tsx`
- `components/host/HostRouteGate.tsx`
- `components/host/onboarding/HostOnboardingShell.tsx`
- `components/host/onboarding/HostOnboardingStatusCard.tsx`
- `components/host/onboarding/HostOnboardingEmptyState.tsx`

### Updated files

- `components/host/HostDashboardShell.tsx`
- `lib/host.ts`

### Optional shared helpers

- `components/host/onboarding/hostOnboarding.ts`

If onboarding status mapping grows, extract label, copy, and badge logic into a small shared helper.

## Component Responsibilities

### `HostRouteGate`

Responsibilities:

- centralize host route access logic
- wait for auth hydration before deciding
- distinguish logged-out, non-host, and approved-host users
- redirect based on route type and user role
- reduce duplication across host pages

Suggested props:

- `mode` with values like `portal` or `onboarding`
- `children`
- optional `fallback` for hydration/loading state

### `HostOnboardingShell`

Responsibilities:

- provide shared onboarding page framing
- keep onboarding visually related to the host portal without using the full portal sidebar
- render page title, subtitle, and primary action area
- support status-based content blocks

Suggested props:

- `children`
- `title`
- `subtitle`
- optional `status`

### `HostOnboardingStatusCard`

Responsibilities:

- render the current onboarding state summary
- display state-specific messaging
- show next step guidance
- optionally show rejection reason when present

### `HostOnboardingEmptyState`

Responsibilities:

- handle the no-draft-yet state
- explain what host onboarding is
- provide CTA to start the verification/application flow

### `HostDashboardShell`

Responsibilities after refactor:

- keep dashboard data loading for approved hosts
- stop owning non-host fallback UI directly
- rely on shared route-gate behavior for access splits where practical

Important note:

- role split behavior should move toward `HostRouteGate`
- dashboard rendering should stay focused on approved host states

## API Plan

This step should prepare and use onboarding-related host API helpers in `lib/host.ts`.

### APIs used in this step

- `GET /api/v1/host/verifications/identity`
- `POST /api/v1/host/verifications/identity` only if a lightweight start action is included
- `PATCH /api/v1/host/verifications/identity` only if draft-resume behavior is minimally supported
- `POST /api/v1/host/enable` only if submit-entry CTA is included in the scope

### Minimum recommended API scope for this chunk

Required:

- fetch current identity verification/application state

Optional:

- create draft
- resume draft
- submit application

Guardrail:

- it is acceptable for this chunk to focus on route split plus status-aware onboarding entry, without fully finishing the verification editor itself

## Onboarding UI States

The onboarding landing page should be able to represent at least these states.

### 1. No draft yet

Meaning:

- user is authenticated
- no host verification/application draft exists yet

UI should show:

- short explanation of the host approval process
- primary CTA to start application
- concise list of what the user will prepare

### 2. Draft exists

Meaning:

- verification or onboarding draft already exists
- user has not fully submitted yet

UI should show:

- progress-oriented messaging
- CTA to continue application
- summary that draft is saved

### 3. Submitted and waiting

Meaning:

- user has submitted application
- approval is pending

UI should show:

- calm waiting state
- no misleading edit CTA unless supported
- expectation-setting copy about review status

### 4. Rejected

Meaning:

- prior application was rejected
- user may need to edit and resubmit

UI should show:

- rejection status clearly but calmly
- rejection reason if API provides it
- CTA to review and update application

### 5. Approved but stale session guidance

Meaning:

- backend status indicates approval but local session role does not yet reflect `host`

UI should show:

- explanation that access may require refreshing session or signing in again
- CTA that helps user refresh path back into portal

## Content Plan

### Onboarding page header

Recommended content:

- badge like `Host Onboarding`
- title focused on becoming a host
- short explanation of approval-based access

### Progress and state block

Recommended content:

- current status label
- short next-step summary
- optional reason or note block

### Action area

Recommended CTA patterns:

- `Start host application`
- `Continue application`
- `Review application`
- `Back to homepage`
- `Go to dashboard` only for approved-state recovery guidance

## Layout Structure

Suggested onboarding composition:

1. onboarding route page
2. route gate wrapper for onboarding mode
3. onboarding shell
4. page header block
5. primary status card
6. optional guidance / next-steps / process cards

Suggested dashboard route composition after Chunk 2:

1. portal route page
2. route gate wrapper for portal mode
3. `HostDashboardShell`
4. dashboard content for approved hosts only

## Access Logic Plan

### Portal route rule

For `/host/dashboard` and later portal routes:

- if auth is not hydrated yet, wait
- if user is logged out, redirect to auth
- if user is logged in but lacks `host`, redirect to onboarding
- if user has `host`, allow render

### Onboarding route rule

For `/host/onboarding`:

- if auth is not hydrated yet, wait
- if user is logged out, redirect to auth
- if user is logged in and lacks `host`, allow onboarding render
- if user has `host`, redirect to dashboard

### Error-handling rule

If onboarding status fetch fails:

- do not pretend user is approved
- show a clear onboarding unavailable state
- allow retry

## Styling Plan

### Onboarding styling

- use wide but focused content container
- keep one strong hero/status card plus smaller supporting cards
- use soft borders and premium shadows
- prefer reassurance over warning-heavy design

### Status treatment

- draft: soft neutral with subtle progress feel
- submitted: quiet informative state
- rejected: still calm, but clearly differentiated
- approved recovery: positive guidance state

### Relationship to host shell

- onboarding should feel part of the host product family
- onboarding should not use the full approved-host sidebar workspace
- visual language should still match the dashboard shell and global redesign

## Step-By-Step Build Checklist

### Part 1: Route split design

- define which routes count as onboarding vs portal
- define redirect matrix for all three auth states
- choose where shared host gate logic lives

### Part 2: API helper preparation

- add verification status types to `lib/host.ts`
- add status fetch helper
- map backend response to usable UI states

### Part 3: Build route gate

- create `HostRouteGate`
- support hydration-safe redirects
- keep logged-out redirect behavior intact

### Part 4: Build onboarding page shell

- create onboarding layout wrapper
- create status card and empty-state primitives
- keep copy aligned with host approval flow

### Part 5: Connect real statuses

- fetch onboarding verification/application status
- render no-draft, draft, submitted, rejected, and approved-recovery states
- add retry path for API failure

### Part 6: Refactor dashboard access path

- remove non-host dead-end behavior from dashboard flow where appropriate
- send non-host authenticated users to onboarding
- preserve approved-host dashboard behavior

### Part 7: Polish

- tune messaging
- tune redirect behavior
- tune loading and error states
- confirm route outcomes feel intentional

## Risks

### Risk 1: Confusing onboarding with the approved portal

If onboarding reuses too much portal UI, users may assume they already have host access.

Guardrail:

- keep onboarding visually related but clearly separate from the real host workspace

### Risk 2: Redirect loops

If route-gate rules are duplicated or conflicting, users may bounce between routes.

Guardrail:

- define one explicit redirect matrix first
- centralize the routing decision in a shared gate

### Risk 3: Treating onboarding API status as role authorization

Approval-related API state can help messaging, but it should not replace session role checks.

Guardrail:

- keep `roles.includes("host")` as real authorization
- use onboarding API status only for onboarding UI logic

### Risk 4: Overbuilding the onboarding flow too early

Trying to fully ship identity verification editing in this step may slow down the essential route split.

Guardrail:

- prioritize access routing and onboarding entry first
- keep deeper verification editing for follow-up work if necessary

### Risk 5: Stale local session after approval

A user may be approved in the backend before their current session reflects the new host role.

Guardrail:

- include an approved-but-session-stale guidance state
- give the user a clear refresh or re-login path

## Acceptance Criteria

This step is complete when:

1. `/host/onboarding` exists as the non-host entry route
2. logged-out users are redirected to `/auth?mode=login&intent=host`
3. authenticated non-host users are routed to onboarding instead of the dashboard dead-end
4. approved hosts still reach `/host/dashboard`
5. onboarding page renders correct no-draft, draft, submitted, rejected, and approved-recovery states
6. route decisions are based on real session role checks
7. `npm.cmd run build` passes after implementation

## Verification Plan

After implementation:

1. open `/host/dashboard` while logged out and verify redirect to auth
2. open `/host/onboarding` while logged out and verify redirect to auth
3. sign in with non-host account and verify `/host/dashboard` redirects to `/host/onboarding`
4. verify non-host account can open `/host/onboarding`
5. verify approved host opening `/host/onboarding` is redirected to `/host/dashboard`
6. verify onboarding renders each expected API status state correctly
7. verify API failure state shows retry and does not grant access incorrectly
8. run `npm.cmd run build`

## Final Recommendation For Step 2

Treat this step as a `route split and onboarding entry` step, not as a full onboarding editor implementation step.

If this is done well:

- the host portal starts matching the real backend product model
- non-host authenticated users get a usable next step instead of a dead-end
- later onboarding, profile, and add-property work can plug into a stable route system
