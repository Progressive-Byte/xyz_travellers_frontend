# XYZ Travellers Host Portal Step 3 Plan

## Step Name

Chunk 3: Host Profile And Payout Setup

## Purpose

This document covers only the third implementation step from `HOST_PORTAL_CHUNKED_PLAN.md`.

It does not plan the full host portal.

It only plans the approved-host account setup layer that should sit inside the host portal after onboarding access is already working.

## Objective

Build the first real approved-host account setup tools so hosts can manage:

- their host profile identity
- their contact and presentation details
- their payout profile readiness

This step should introduce dedicated profile and payout pages, plus lightweight dashboard reminders when either setup area is incomplete.

This step should not try to build properties, add-property steps, businesses, reservations, messages, reviews, or earnings history yet.

## Why This Is Step 3

Chunk 1 created the shared host shell.

Chunk 2 created the route split between onboarding and approved-host access.

Now the approved host needs usable account setup tools inside the real portal.

This step matters before listing expansion because:

- the host dashboard becomes more useful when setup gaps are visible
- the host profile should exist before the user starts presenting listings publicly
- payout readiness should exist before the host moves deeper into operational flows
- later property flows become easier when core host identity and payout records already exist

Without this step:

- the portal has access but not enough account depth
- hosts have no place to edit their profile details
- hosts have no clear payout readiness path
- the dashboard cannot surface meaningful setup prompts

So this step exists to make the approved-host workspace feel real before the property workflow expands.

## Current Starting Point

Right now the project already has:

- `app/host/dashboard/page.tsx`
- `app/host/onboarding/page.tsx`
- `components/host/HostShell.tsx`
- `components/host/HostSidebar.tsx`
- `components/host/HostRouteGate.tsx`
- `components/host/HostDashboardShell.tsx`
- auth user session fields in `lib/auth.ts`
- dashboard and onboarding API helpers in `lib/host.ts`

Current behavior:

- approved hosts can enter `/host/dashboard`
- non-host authenticated users are routed to `/host/onboarding`
- the session user already contains some identity data such as first name, last name, email, phone, address, profile photo, and bio

Current limitation:

- there is no `app/host/profile/page.tsx`
- there is no `app/host/payouts/page.tsx`
- there are no host API helpers yet for `GET /api/v1/host/me`, `PATCH /api/v1/host/profile`, `GET /api/v1/host/payout-profile`, or `PUT /api/v1/host/payout-profile`
- the dashboard does not yet surface profile or payout setup completion prompts
- approved hosts can access the portal, but not yet complete core account setup inside it

## Scope

This step includes:

- building a host profile page
- building a payout setup page
- fetching and saving host profile data
- fetching and saving payout profile data
- adding validation and status feedback for both forms
- surfacing setup reminders or quick links on the dashboard when profile or payout data is incomplete
- adding profile and payout destinations into the host navigation where appropriate

This step does not include:

- business profile management
- business document library
- properties list or add-property flow
- property media, units, calendar, pricing, or verification
- reservations, messages, reviews, earnings, or payout history operations

## Product Behavior Model For This Step

This step applies only to approved hosts inside the portal.

### Approved host expectation

Behavior:

- host can open and edit a profile screen
- host can open and edit a payout setup screen
- dashboard can point the host to missing setup areas

### Incomplete setup expectation

Behavior:

- host should still be allowed into the portal
- portal should guide the host toward finishing setup
- missing data should not feel like a hard access block

### Complete setup expectation

Behavior:

- host sees that profile and payout data are already ready
- dashboard prompts should reduce or disappear once data is complete
- later listing flows can rely on these records being easier to reference

Important rule:

- this chunk improves setup readiness, not route authorization
- `roles.includes("host")` remains the real access rule for portal entry

## Design Direction

This account setup experience must follow `UI_REDESIGN_PLAN.md` and stay visually aligned with the host shell language established in Chunks 1 and 2.

### Visual principles

- light premium surfaces, not generic settings pages
- strong but calm editorial hierarchy
- soft borders and elevated cards
- restrained lime for CTA, saved state, and completion emphasis
- forms should feel refined and trustworthy, not enterprise-heavy

### UX principles

- profile and payout should feel like setup tools, not bureaucratic forms
- use clear grouping and conditional form behavior
- show save success and error states clearly
- keep hosts oriented with simple page headers and structured sections
- make incomplete setup visible on the dashboard without blocking progress harshly

## Route Coverage In This Step

This step needs to support:

- `/host/dashboard`
- `/host/profile`
- `/host/payouts`

Behavior rules:

- `/host/profile`:
  - logged out -> redirect to auth
  - non-host -> redirect to onboarding
  - approved host -> allow
- `/host/payouts`:
  - logged out -> redirect to auth
  - non-host -> redirect to onboarding
  - approved host -> allow

These routes should use the same shared host portal gate introduced in Chunk 2.

## File Plan

### New files

- `app/host/profile/page.tsx`
- `app/host/payouts/page.tsx`
- `components/host/profile/HostProfilePage.tsx`
- `components/host/profile/HostProfileForm.tsx`
- `components/host/payouts/HostPayoutPage.tsx`
- `components/host/payouts/HostPayoutForm.tsx`
- `components/host/HostSetupPromptCard.tsx`

### Updated files

- `components/host/hostNavigation.ts`
- `components/host/HostDashboardShell.tsx`
- `lib/host.ts`

### Optional shared helpers

- `components/host/profile/hostProfile.ts`
- `components/host/payouts/hostPayouts.ts`

If profile completeness logic or payout method field mapping grows, extract it into small local helpers.

## Component Responsibilities

### `HostProfilePage`

Responsibilities:

- fetch host profile data
- handle loading, error, and save states
- render profile form inside the host shell
- surface save confirmation cleanly

### `HostProfileForm`

Responsibilities:

- manage editable host profile fields
- validate required fields
- support profile photo URL and bio
- submit patch payload cleanly

Suggested form fields:

- first name
- last name
- phone
- address
- profile photo URL
- bio

### `HostPayoutPage`

Responsibilities:

- fetch payout profile data
- handle empty, loading, error, and save states
- render payout form inside the host shell
- explain payout readiness clearly

### `HostPayoutForm`

Responsibilities:

- manage payout method selection
- render conditional fields by payout method
- validate required billing and payout fields
- submit full payout profile payload

Suggested form fields:

- account holder name
- payout method
- conditional bank transfer fields
- conditional mobile wallet fields
- billing address
- country
- currency

### `HostSetupPromptCard`

Responsibilities:

- render dashboard reminders for incomplete host setup
- link to profile or payout pages directly
- stay small, clear, and action-oriented

### `HostDashboardShell`

Responsibilities after refactor:

- keep existing dashboard loading and summary behavior
- optionally fetch setup readiness inputs if needed
- render small setup reminder blocks without overwhelming the dashboard

Important note:

- dashboard should guide setup completion
- dashboard should not become a substitute for the dedicated forms

## API Plan

This step should extend `lib/host.ts` with host account setup helpers.

### APIs used in this step

- `GET /api/v1/host/me`
- `PATCH /api/v1/host/profile`
- `GET /api/v1/host/payout-profile`
- `PUT /api/v1/host/payout-profile`

### Minimum recommended API scope for this chunk

Required:

- fetch host profile
- save host profile
- fetch payout profile
- save payout profile

Optional:

- derive lightweight completeness helpers in the frontend based on fetched records

Guardrail:

- keep API integration focused on profile and payout setup only
- do not mix business or property setup into this chunk

## Data Model Plan

### Host profile model

Frontend should be prepared to represent:

- first name
- last name
- email if returned for display
- phone
- address
- profile photo URL
- bio

The profile page should use API data as the source of truth, while still staying compatible with existing auth session identity fields where useful for initial display.

### Payout profile model

Frontend should be prepared to represent:

- account holder name
- payout method
- method-specific payout details
- billing address
- country
- currency

Conditional payout behavior should be explicit and easy to follow.

## Form Behavior Plan

### Host profile form behavior

- load existing values on page open
- allow editing of supported fields
- disable save while request is in flight
- show success feedback after save
- show inline or section-level errors when save fails

### Payout profile form behavior

- load existing payout profile if present
- support empty state when no payout profile exists yet
- switch visible fields based on payout method
- validate required method-specific fields before submit
- show success feedback after save

## Dashboard Reminder Plan

The dashboard should start helping the host complete setup.

### Reminder goals

- show whether profile setup looks incomplete
- show whether payout setup looks incomplete
- provide clear links to the right page
- keep the dashboard calm and summary-first

### Reminder approach

- use one or two compact setup cards or alerts near the dashboard header or summary area
- avoid large warning blocks that overpower the dashboard metrics
- remove or soften the prompts once data looks complete

## Content Plan

### Profile page header

Recommended content:

- badge like `Host Profile`
- title focused on how the host appears in the portal
- short explanation of identity, contact, and presentation details

### Payout page header

Recommended content:

- badge like `Payout Setup`
- title focused on getting paid smoothly
- short explanation of payout readiness and billing details

### Save feedback content

Recommended patterns:

- `Profile updated successfully`
- `Payout profile saved`
- `We couldn't save your changes right now`

## Layout Structure

Suggested profile page composition:

1. profile route page
2. host route gate in portal mode
3. host shell
4. page header block
5. main profile form card
6. optional supporting guidance card

Suggested payout page composition:

1. payouts route page
2. host route gate in portal mode
3. host shell
4. page header block
5. main payout form card
6. optional setup guidance / payout method info card

Suggested dashboard composition after Chunk 3:

1. existing dashboard summary content
2. small setup prompt area for profile and payout readiness
3. rest of dashboard metrics and operational summary

## Validation Plan

### Profile validation

- require sensible core identity fields
- trim values before submit
- allow optional long-form bio
- avoid over-validating fields not required by the backend

### Payout validation

- require account holder name
- require payout method
- require method-specific details only when that method is selected
- require billing address, country, and currency if the API expects them

Guardrail:

- validation should protect submission quality without making setup frustrating

## Styling Plan

### Form styling

- use premium section cards and grouped fields
- keep spacing compact but calm
- make conditional form areas feel intentional, not bolted on
- use consistent button hierarchy with the rest of the portal

### State styling

- loading states should match host portal skeleton rhythm
- error states should be informative, not dramatic
- saved states should use restrained positive feedback

### Dashboard reminder styling

- keep setup prompts lighter than error banners
- use small action cards or understated highlight blocks
- stay visually consistent with dashboard cards already in the portal

## Step-By-Step Build Checklist

### Part 1: API helper preparation

- add host profile types to `lib/host.ts`
- add payout profile types to `lib/host.ts`
- add fetch and save helpers for both resources

### Part 2: Host profile page

- create `/host/profile`
- build profile page shell and form
- connect profile fetch and patch behavior
- add loading, error, and success states

### Part 3: Host payout page

- create `/host/payouts`
- build payout page shell and form
- connect payout fetch and put behavior
- add conditional payout method fields

### Part 4: Navigation updates

- add profile destination to host navigation
- add payouts destination to host navigation
- keep labels aligned with the portal information architecture

### Part 5: Dashboard setup prompts

- define profile completeness heuristics
- define payout completeness heuristics
- add compact reminder cards or quick links to dashboard

### Part 6: Polish

- tune form grouping and copy
- tune success and error feedback
- verify profile and payout pages feel like part of the same portal system

## Risks

### Risk 1: Treating session user data as the full host profile source

The auth session already contains some identity fields, but the real editable host profile should come from the host profile API.

Guardrail:

- use `GET /api/v1/host/me` as the source of truth
- use session fields only as helpful fallback context if needed

### Risk 2: Overbuilding payout logic too early

Trying to support every possible payout edge case could slow down the core setup flow.

Guardrail:

- keep the first version focused on the required payout methods and conditional fields the API actually supports

### Risk 3: Making setup prompts feel like blockers

If dashboard reminders look too severe, hosts may think they cannot continue using the portal.

Guardrail:

- keep reminders action-oriented and lightweight
- reserve hard blocks for later flows only when truly necessary

### Risk 4: Mixing business setup into payout setup

Business ownership support belongs to a later chunk and can complicate this step if pulled in too early.

Guardrail:

- keep Chunk 3 limited to personal host profile and payout readiness

### Risk 5: Inconsistent conditional payout validation

If payout method switching is not handled cleanly, hidden fields may still cause bad validation or confusing saves.

Guardrail:

- define method-specific validation rules explicitly
- reset or ignore irrelevant hidden fields when method changes

## Acceptance Criteria

This step is complete when:

1. `/host/profile` exists and approved hosts can load and save profile data
2. `/host/payouts` exists and approved hosts can load and save payout profile data
3. payout method conditional validation behaves correctly
4. host navigation includes access to profile and payout setup destinations
5. dashboard surfaces setup reminders or quick links when profile or payout data looks incomplete
6. the UI remains aligned with the host shell and redesign language
7. `npm.cmd run build` passes after implementation

## Verification Plan

After implementation:

1. open `/host/profile` as an approved host and verify profile data loads
2. edit and save profile fields, then verify the saved values reload correctly
3. open `/host/payouts` as an approved host and verify empty or existing payout data loads correctly
4. switch payout methods and verify conditional fields update correctly
5. save payout data and verify the saved values reload correctly
6. verify dashboard prompts appear when setup data is incomplete
7. verify dashboard prompts reduce or disappear when setup looks complete
8. verify non-host users still cannot access profile or payout routes
9. run `npm.cmd run build`

## Final Recommendation For Step 3

Treat this step as an `approved-host account setup` step, not as a listing-management step.

If this is done well:

- the host portal gains real account depth after onboarding
- the dashboard becomes more actionable through setup prompts
- later property and operations work can build on stronger host identity and payout readiness
