# XYZ Travellers Host Portal Chunked Implementation Plan

## Purpose

This document breaks `HOST_PORTAL_FULL_PLAN.md` into smaller implementation chunks so the host portal can be built step by step without trying to ship the whole system at once.

This is not a new direction.

It is a more detailed execution plan derived from the full host portal plan.

## Working Principles

- keep the current host dashboard work as the starting foundation
- do not rebuild everything at once
- keep each chunk independently testable
- finish shared layout and access control before deeper feature pages
- prioritize the `add property` workflow because the API is mostly centered around listing creation and host operations
- keep UI aligned with `UI_REDESIGN_PLAN.md`

## Recommended Delivery Order

Build in this order:

1. shared host shell and sidebar
2. host access routing and onboarding state
3. host profile and payout setup
4. properties list and add-property draft foundation
5. property media
6. units, calendar, and pricing
7. property verification and submit flow
8. businesses and commercial ownership support
9. operations pages: reservations, messages, reviews, earnings, payouts
10. final polish and QA

This order keeps the portal usable early while still moving toward the full backend workflow.

## Chunk 1: Shared Host Shell

### Goal

Turn the current dashboard page into the base layout for the entire host portal.

### Why this chunk comes first

Every later host route needs:

- the same sidebar
- the same page header style
- the same content container
- the same access-aware shell behavior

### Scope

- create a reusable `HostShell`
- create a reusable `HostSidebar`
- create a small `HostTopbar` for mobile toggle, title, and utility actions
- move the current dashboard into this shell
- keep the existing host-only guard behavior

### Main files

- `components/host/HostShell.tsx`
- `components/host/HostSidebar.tsx`
- `components/host/HostTopbar.tsx`
- `components/host/HostDashboardShell.tsx`
- `app/host/dashboard/page.tsx`

### UI requirements

- light sidebar, not dark admin panel
- active route highlight uses lime accent carefully
- content area keeps `max-w-7xl mx-auto px-6`
- mobile uses drawer or slide-over sidebar
- reusable section cards match current dashboard surfaces

### Deliverables

- dashboard renders inside host shell
- sidebar contains placeholder links for later routes
- shell works on desktop and mobile
- existing dashboard visuals still work inside new layout

### Acceptance criteria

- `/host/dashboard` uses the new host shell
- sidebar is visible on desktop
- mobile navigation opens and closes correctly
- build still passes

## Chunk 2: Access Routing And Host Onboarding Entry

### Goal

Separate approved hosts from non-host authenticated users and give each one the right route experience.

### Why this chunk matters early

The API clearly distinguishes:

- logged out users
- authenticated but non-approved users
- approved hosts

Without this split, later pages create confusing dead ends.

### Scope

- keep redirect to `/auth?mode=login&intent=host` for logged out users
- route authenticated non-host users to host onboarding
- allow approved hosts into the real portal
- create onboarding landing page with status-aware UI

### Main files

- `app/host/onboarding/page.tsx`
- `components/host/onboarding/*`
- `components/host/HostRouteGate.tsx`
- `context/AuthContext.tsx` only if small access helpers are useful
- `lib/host.ts`

### APIs used

- `GET /api/v1/host/verifications/identity`
- `POST /api/v1/host/verifications/identity`
- `PATCH /api/v1/host/verifications/identity`
- `POST /api/v1/host/enable`

### UI states needed

- no verification draft yet
- draft exists
- submitted and waiting
- rejected with rejection reason
- approved but stale local session guidance

### Deliverables

- onboarding landing page for non-host users
- route guard behavior split by real role
- initial verification status fetch

### Acceptance criteria

- logged-out users do not access host pages
- non-host users land on onboarding instead of dashboard
- approved hosts still reach dashboard
- onboarding page renders correct empty, draft, submitted, and rejected states

## Chunk 3: Host Profile And Payout Setup

### Goal

Let approved hosts complete the account setup fields that support their portal identity and future payouts.

### Why this chunk comes before listing expansion

Dashboard and add-property pages become stronger when the host account already has:

- profile identity
- bio and contact details
- payout readiness

### Scope

- build host profile page
- build payout profile page
- add setup reminders on dashboard if these records are incomplete

### Main files

- `app/host/profile/page.tsx`
- `app/host/payouts/page.tsx`
- `components/host/profile/*`
- `components/host/payouts/*`
- `lib/host.ts`

### APIs used

- `GET /api/v1/host/me`
- `PATCH /api/v1/host/profile`
- `GET /api/v1/host/payout-profile`
- `PUT /api/v1/host/payout-profile`

### Form requirements

Profile:

- first name
- last name
- phone
- address
- profile photo URL
- bio

Payout:

- account holder name
- payout method
- conditional fields for bank transfer or mobile wallet
- billing address
- country
- currency

### Deliverables

- editable profile screen
- editable payout screen
- validation and success/error states
- dashboard quick links to these pages

### Acceptance criteria

- host can load and save profile
- host can load and save payout profile
- conditional payout field validation works correctly
- UI stays aligned with portal shell design

## Chunk 4: Properties List And Draft Creation

### Goal

Create the first real listing management screens so a host can start the add-property flow.

### Scope

- build properties index page
- build add property start page
- build edit draft page for basics and location
- fetch host reference data
- create draft property
- patch draft property details

### Main files

- `app/host/properties/page.tsx`
- `app/host/properties/new/page.tsx`
- `app/host/properties/[propertyId]/edit/page.tsx`
- `components/host/properties/*`
- `lib/host.ts`

### APIs used

- `GET /api/v1/host/properties`
- `POST /api/v1/host/properties`
- `GET /api/v1/host/properties/:propertyId`
- `PATCH /api/v1/host/properties/:propertyId`
- `DELETE /api/v1/host/properties/:propertyId`
- `GET /api/v1/host/reference/property-types`
- `GET /api/v1/host/reference/amenities`
- `GET /api/v1/host/reference/commission`

### First version form scope

Basics:

- property name
- description
- property type
- ownership type
- amenities

Location and rules:

- address
- city
- country
- lat
- lng
- house rules

### UI pattern

- use a visible multi-step editor shell even if only first steps are active
- provide `Save draft` and `Continue` actions
- show status pill for `draft`, `submitted`, `approved`, `rejected`

### Deliverables

- properties list page with status cards or rows
- add-property CTA from dashboard and sidebar
- draft property can be created and edited

### Acceptance criteria

- host can create a draft property
- host can revisit and edit draft basics
- reference data loads correctly
- rejected listings can be edited again

## Chunk 5: Property Media Manager

### Goal

Let hosts add the visual content required before a property can be submitted.

### Scope

- media management page per property
- image upload
- video URL entry
- cover image selection
- caption and sort order editing
- delete and update media items

### Main files

- `app/host/properties/[propertyId]/media/page.tsx`
- `components/host/properties/media/*`
- `lib/host.ts`

### APIs used

- `GET /api/v1/host/properties/:propertyId/media`
- `POST /api/v1/host/properties/:propertyId/media`
- `PATCH /api/v1/host/properties/:propertyId/media/:mediaId`
- `DELETE /api/v1/host/properties/:propertyId/media/:mediaId`

### UX requirements

- clearly show which item is cover
- show upload constraints
- preview media grid in a premium but practical layout
- disable edit actions if property is not editable

### Deliverables

- property media gallery manager
- add image modal or panel
- add video URL form
- cover photo controls

### Acceptance criteria

- host can upload at least one image
- host can set cover photo
- host can add a video URL
- host can edit caption/sort order and delete media

## Chunk 6: Units, Calendar, And Pricing

### Goal

Support the operational data needed to make a property actually bookable.

### Scope

- units manager
- unit create/edit/delete
- calendar rules page
- block and unblock dates
- pricing setup page

### Main files

- `app/host/properties/[propertyId]/units/page.tsx`
- `app/host/properties/[propertyId]/calendar/page.tsx`
- `app/host/properties/[propertyId]/pricing/page.tsx`
- `components/host/properties/units/*`
- `components/host/properties/calendar/*`
- `components/host/properties/pricing/*`
- `lib/host.ts`

### APIs used

- `GET /api/v1/host/properties/:propertyId/units`
- `POST /api/v1/host/properties/:propertyId/units`
- `GET /api/v1/host/properties/:propertyId/units/:unitId`
- `PATCH /api/v1/host/properties/:propertyId/units/:unitId`
- `DELETE /api/v1/host/properties/:propertyId/units/:unitId`
- `GET /api/v1/host/units/:unitId/calendar`
- `PUT /api/v1/host/units/:unitId/calendar/rules`
- `POST /api/v1/host/units/:unitId/calendar/block`
- `POST /api/v1/host/units/:unitId/calendar/unblock`
- `GET /api/v1/host/units/:unitId/availability`
- `GET /api/v1/host/units/:unitId/pricing`
- `PUT /api/v1/host/units/:unitId/pricing`

### Suggested implementation order inside this chunk

1. units CRUD
2. pricing form
3. calendar rules
4. block/unblock date actions
5. availability preview

### Deliverables

- one property can have one or more units
- each unit can be priced
- each unit can have stay rules and blocked dates

### Acceptance criteria

- host can create and edit units
- pricing saves and reloads
- blocked dates update correctly
- UI explains which unit is currently being configured

## Chunk 7: Property Verification And Submission

### Goal

Finish the add-property workflow so a host can submit a property for admin review.

### Scope

- verification documents page
- review-and-submit page
- completion checklist
- status page or status panel

### Main files

- `app/host/properties/[propertyId]/verification/page.tsx`
- `components/host/properties/verification/*`
- `components/host/properties/review-submit/*`
- `lib/host.ts`

### APIs used

- `GET /api/v1/host/properties/:propertyId/verification`
- `PUT /api/v1/host/properties/:propertyId/verification`
- `POST /api/v1/host/properties/:propertyId/submit`
- `GET /api/v1/host/properties/:propertyId/status`

### Checklist rules to surface in UI

- required listing fields completed
- at least one cover image exists
- verification documents uploaded
- unit and pricing setup completed enough for submission
- commercial listings have business and document linkage if needed

### Deliverables

- verification upload screen
- final review screen
- submit CTA
- post-submit status display

### Acceptance criteria

- host can upload verification docs
- host can submit a valid property
- submitted status shows correctly
- rejected reason can be surfaced when available

## Chunk 8: Businesses And Commercial Ownership

### Goal

Support commercial properties properly instead of treating business ownership as an afterthought.

### Why this is separated from Chunk 4

The business flow is important, but it should not block early delivery of personal-property draft flows.

### Scope

- businesses index page
- create/edit/delete business
- business document library
- connect selected business documents to commercial property forms

### Main files

- `app/host/businesses/page.tsx`
- `components/host/businesses/*`
- `components/host/businesses/documents/*`
- `lib/host.ts`

### APIs used

- `GET /api/v1/host/businesses`
- `POST /api/v1/host/businesses`
- `GET /api/v1/host/businesses/:businessId`
- `PATCH /api/v1/host/businesses/:businessId`
- `DELETE /api/v1/host/businesses/:businessId`
- `GET /api/v1/host/businesses/:businessId/documents`
- `POST /api/v1/host/businesses/:businessId/documents`
- `PATCH /api/v1/host/businesses/:businessId/documents/:documentId`
- `DELETE /api/v1/host/businesses/:businessId/documents/:documentId`

### Deliverables

- business list and create flow
- document library manager
- business selector in commercial property forms
- selected business documents saved to property draft

### Acceptance criteria

- host can manage businesses and documents
- commercial property editor can select a business
- selected business documents persist correctly

## Chunk 9: Operations Workspace

### Goal

Add the daily host management screens after the add-property system is stable.

### Scope

- reservations list and detail
- messages threads and thread detail
- reviews hub
- earnings summary and transactions
- payouts list and payout detail

### Main files

- `app/host/reservations/page.tsx`
- `app/host/reservations/[reservationId]/page.tsx`
- `app/host/messages/page.tsx`
- `app/host/messages/[threadId]/page.tsx`
- `app/host/reviews/page.tsx`
- `app/host/earnings/page.tsx`
- `app/host/payouts/page.tsx` or split if payout setup and payout history are separate
- `components/host/operations/*`
- `lib/host.ts`

### APIs used

- reservations endpoints
- messaging endpoints
- reviews endpoints
- earnings endpoints
- payouts endpoints

### Suggested order inside this chunk

1. reservations
2. messages
3. earnings and payouts history
4. reviews

### Deliverables

- operational list/detail pages
- filters where useful
- status actions where supported by API

### Acceptance criteria

- host can view reservation pipeline
- host can read and send messages
- host can view earnings and payouts
- host can view property reviews and create guest reviews where allowed

## Chunk 10: Portal Polish And QA

### Goal

Make the portal feel like one system and verify that the full route family works well.

### Scope

- unify loading states
- unify empty states
- unify error states
- improve sidebar labels and grouping
- review mobile layouts
- remove any one-off hard-coded styling

### Files touched

- `components/host/*`
- `app/host/**/*`
- `app/globals.css` only if token refinement is needed

### QA checklist

- logged out flow
- non-host onboarding flow
- approved host dashboard flow
- add property draft flow
- media flow
- units/pricing/calendar flow
- verification and submit flow
- business flow
- reservation and message flow
- build verification

### Acceptance criteria

- host portal feels visually unified
- route guards behave correctly
- no obviously inconsistent host page styling remains
- `npm.cmd run build` passes

## Detailed Dependency Map

### Hard dependencies

- Chunk 1 before every other portal chunk
- Chunk 2 before onboarding and non-host routing work
- Chunk 4 before Chunks 5, 6, and 7
- Chunk 6 before full property submit confidence
- Chunk 8 before complete commercial property support

### Soft dependencies

- Chunk 3 can ship before or alongside Chunk 4
- Chunk 9 can begin after Chunk 4 if dashboard and core shell are already stable

## Suggested MVP Cut

If you want the fastest meaningful host MVP, ship this reduced path first:

1. Chunk 1: Shared Host Shell
2. Chunk 2: Access Routing And Host Onboarding Entry
3. Chunk 4: Properties List And Draft Creation
4. Chunk 5: Property Media Manager
5. Chunk 6: Units, Calendar, And Pricing
6. Chunk 7: Property Verification And Submission

This gives you:

- host shell
- onboarding path
- real add-property workflow
- draft to submit lifecycle

Then add:

- Chunk 3 for stronger host setup
- Chunk 8 for commercial ownership depth
- Chunk 9 for full operations workspace

## Final Recommendation

Use `HOST_PORTAL_FULL_PLAN.md` as the strategy document.

Use this file as the execution document.

That means:

- the full plan explains the product shape
- this chunked plan explains the build order
- each chunk can now be implemented one at a time without losing the larger structure
