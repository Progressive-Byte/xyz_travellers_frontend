# XYZ Travellers Host Portal Full Plan

## Objective

Create one unified host portal plan that covers the full host product represented by the API suite, not only the dashboard.

This portal should:

- follow the visual direction in `UI_REDESIGN_PLAN.md`
- keep the existing XYZ Travellers identity: Sora + Instrument Sans, lime accent, cream background, soft elevated cards, restrained editorial-travel feel
- treat the current dashboard as the entry point of a larger host workspace
- support the real backend workflow from host onboarding through property submission and day-to-day host operations
- avoid a generic SaaS admin look while still solving dense operational tasks cleanly

## What The API Folder Represents

After reviewing the full `api/host/` suite, the backend is best understood as a staged host operating system with these layers:

1. host onboarding and approval
2. host profile and payout setup
3. business profile and business-document library
4. property creation and submission
5. property media, units, availability, and pricing
6. post-approval host operations like reservations, messages, reviews, earnings, and payouts

This means the main product story is:

- a guest becomes a host applicant
- submits identity verification
- gets approved by admin
- enters the host portal
- adds one or more properties
- uploads media and verification documents
- configures units, calendars, and pricing
- submits the property for admin review
- later manages bookings, guests, messages, reviews, and payouts

So yes, the API is mostly centered around an `add property and manage hosting` process, with the dashboard acting as the overview layer above it.

## Product Model

The host portal should be designed as a workspace with three major states:

### 1. Pre-host state

The user is authenticated but does not yet have the approved `host` role.

Relevant APIs:

- `POST /api/v1/host/verifications/identity`
- `GET /api/v1/host/verifications/identity`
- `PATCH /api/v1/host/verifications/identity`
- `POST /api/v1/host/enable`

Frontend meaning:

- this is a host application flow
- it is not the full portal yet
- the user needs a clean onboarding flow with progress and status messaging

### 2. Approved host setup state

The user has the `host` role and can access portal tools, but may still need setup work.

Relevant APIs:

- `GET/PATCH /api/v1/host/profile`
- `GET/PUT /api/v1/host/payout-profile`
- `GET/POST/PATCH/DELETE /api/v1/host/businesses`
- business document library endpoints
- host reference data endpoints

Frontend meaning:

- complete host profile
- add payout info
- optionally create business profiles for commercial properties
- fetch reference data needed for listing creation

### 3. Active host operations state

The user is an approved host and is actively creating listings or operating them.

Relevant APIs:

- dashboard
- properties
- property verification
- media
- units, calendar, availability, pricing
- reservations
- messages
- reviews
- earnings
- payouts

Frontend meaning:

- this is the real host workspace
- the dashboard should only be the first stop inside a larger route family

## Core UX Recommendation

The host portal should shift from a single-page dashboard approach to a `sidebar shell`.

Reason:

- the API surface is too broad for top-level cards alone
- hosts need persistent orientation while moving between dashboard, listings, reservations, messages, and payouts
- a sidebar creates a more stable portal mental model without abandoning the public-site design language

The sidebar should be:

- soft, light, and premium
- not a dark enterprise admin panel
- built from the same surface, radius, border, and typography system used on the public site
- collapsible on smaller screens

## Recommended Route Family

Build the host area as a scalable route group under `app/host/`.

### Primary routes

- `app/host/dashboard/page.tsx`
- `app/host/onboarding/page.tsx`
- `app/host/profile/page.tsx`
- `app/host/payouts/page.tsx`
- `app/host/properties/page.tsx`
- `app/host/properties/new/page.tsx`
- `app/host/properties/[propertyId]/edit/page.tsx`
- `app/host/properties/[propertyId]/media/page.tsx`
- `app/host/properties/[propertyId]/verification/page.tsx`
- `app/host/properties/[propertyId]/units/page.tsx`
- `app/host/properties/[propertyId]/pricing/page.tsx`
- `app/host/properties/[propertyId]/calendar/page.tsx`
- `app/host/reservations/page.tsx`
- `app/host/reservations/[reservationId]/page.tsx`
- `app/host/messages/page.tsx`
- `app/host/messages/[threadId]/page.tsx`
- `app/host/reviews/page.tsx`
- `app/host/earnings/page.tsx`
- `app/host/businesses/page.tsx`

### Optional nested route groups

If the structure gets large, split with route groups:

- `app/host/(portal)/...`
- `app/host/(onboarding)/...`

## Sidebar Information Architecture

Recommended sidebar sections:

### Main

- Dashboard
- Add Property
- Properties
- Reservations
- Messages

### Operations

- Earnings
- Payouts
- Reviews

### Setup

- Host Profile
- Businesses
- Verification Status

### Secondary actions

- Back to homepage
- Logout

## Dashboard Role In The New Portal

The current dashboard should remain the landing page after approved host login, but it should become a summary screen inside the host shell.

The dashboard should answer:

- how many listings do I have
- what status are they in
- do I have upcoming reservations
- do I have unread guest communication
- what is my current earnings and payout position
- what should I do next

Recommended additions to the current dashboard:

- sidebar shell
- stronger quick actions
- direct CTA to `Add Property`
- setup completion prompts when profile or payout info is incomplete
- listing pipeline summary focused on draft, submitted, approved, rejected

## Full Add Property Flow

This is the most important product flow in the API and should be planned as a guided multi-step experience.

### Workflow order from the backend

1. fetch reference data
2. create draft property
3. update property details
4. upload property media
5. create units
6. configure unit availability rules
7. configure unit pricing
8. upload property verification documents
9. submit property for review
10. check submission status and rejection reason if needed

### Supporting prerequisites

Depending on ownership type:

- `personal`: property can proceed without business selection
- `commercial`: business profile is required and selected business documents must be attached

### Suggested frontend stepper

Step 1: Property basics

- property name
- description
- property type
- ownership type
- amenities

Step 2: Location and rules

- address
- city
- country
- lat/lng
- house rules

Step 3: Ownership and business

- show only when `ownershipType = commercial`
- choose existing business or create a new one
- choose reusable business documents

Step 4: Media

- upload gallery
- choose one cover image
- optional video URL
- captions and sort order

Step 5: Units

- create one or more units
- set capacity, bedrooms, bathrooms, beds, amenities, active state

Step 6: Availability and pricing

- minimum stay
- maximum stay
- block/unblock dates
- base price
- discounted price
- currency

Step 7: Property verification

- upload ownership or property proof documents
- attach notes

Step 8: Review and submit

- surface completion checklist
- verify required cover image exists
- verify verification docs exist
- verify required listing fields are filled
- submit property to admin review

## Add Property UX Pattern

This should not be a single long form.

Recommended structure:

- sidebar shell for primary navigation
- page header with property title or draft state
- horizontal stepper or vertical progress rail inside content
- sticky action bar for `Save draft`, `Continue`, `Back`, and `Submit`

This keeps the interface aligned with the premium redesign while still solving a dense data-entry workflow.

## Pre-Host Onboarding Flow

The onboarding flow should live separately from the approved host portal routes because the API distinguishes between:

- authenticated user
- submitted host application
- approved host role

Recommended onboarding phases:

### Phase 1: Identity verification draft

Use:

- `POST /api/v1/host/verifications/identity`
- `GET /api/v1/host/verifications/identity`
- `PATCH /api/v1/host/verifications/identity`

Frontend experience:

- simple document-based verification page
- add one or more identity documents
- editable draft state
- clear explanation that approval is required before portal access

### Phase 2: Submit host request

Use:

- `POST /api/v1/host/enable`

Frontend experience:

- final review screen
- submit application CTA
- status messaging for `draft`, `submitted`, `approved`, `rejected`
- if rejected, show rejection reason and allow editing where supported

## Access Control Rules

The frontend must respect three different permission levels:

### 1. Logged out

- redirect to `/auth?mode=login&intent=host`

### 2. Logged in but not approved host

- allow onboarding routes
- block full portal routes
- route to `app/host/onboarding/page.tsx`

### 3. Approved host

- allow dashboard and all host management routes

Important product rule:

- `intent=host` is an entry preference
- `roles.includes("host")` is real authorization

## Design Direction For The Portal

Use `UI_REDESIGN_PLAN.md` as the system reference, but adapt it for denser operational tasks.

### Visual rules

- cream or soft-surface background, not dark panels
- restrained lime accent for active nav, CTAs, and status emphasis
- soft shadows and subtle borders
- compact but breathable cards
- stronger typography hierarchy than generic admin UIs

### Layout rules

- keep `max-w-7xl mx-auto px-6` for main content rhythm
- use a host shell with sidebar + content area
- keep mobile behavior simple with a drawer/sidebar toggle
- avoid decorative overload in data-heavy screens

### Reusable host primitives

- `HostShell`
- `HostSidebar`
- `HostTopbar`
- `HostPageHeader`
- `HostMetricCard`
- `HostSectionCard`
- `HostEmptyState`
- `HostStatusPill`
- `HostStepper`
- `HostStickyActionBar`

## API-To-Page Mapping

### Overview and setup

- dashboard -> `GET /api/v1/host/dashboard`
- host profile -> `GET/PATCH /api/v1/host/profile`
- payout profile -> `GET/PUT /api/v1/host/payout-profile`
- verification onboarding -> identity + enable endpoints

### Commercial ownership support

- businesses list/create/edit/delete -> business endpoints
- business document library -> business document endpoints

### Listing creation and management

- properties list -> `GET /api/v1/host/properties`
- property create/edit/delete -> property endpoints
- property verification docs -> property verification endpoints
- media manager -> property media endpoints
- units manager -> property units endpoints
- calendar manager -> unit calendar and availability endpoints
- pricing manager -> unit pricing endpoints
- property submit and status -> submit/status endpoints

### Operations

- reservations list/details/respond/status
- messages threads/details/send/read
- reviews property and guest review flows
- earnings summary and transaction history
- payouts list and detail

## Recommended Implementation Phases

### Phase 1: Portal shell refactor

Files:

- `components/host/HostDashboardShell.tsx`
- new `components/host/HostShell.tsx`
- new `components/host/HostSidebar.tsx`
- `app/host/dashboard/page.tsx`

Tasks:

- convert dashboard into a reusable host shell
- add responsive sidebar
- keep existing access protection
- move dashboard cards into shell-compatible sections

### Phase 2: Host onboarding routes

Files:

- `app/host/onboarding/page.tsx`
- new host onboarding components
- `lib/host.ts`

Tasks:

- build verification draft flow
- build submit-for-review step
- handle submitted and rejected states
- route non-host authenticated users into onboarding instead of dead-end access pages

### Phase 3: Add property foundation

Files:

- `app/host/properties/page.tsx`
- `app/host/properties/new/page.tsx`
- `app/host/properties/[propertyId]/edit/page.tsx`
- `lib/host.ts`

Tasks:

- list host properties
- create and patch draft property
- fetch property types, amenities, commission
- build multi-step listing editor

### Phase 4: Media, units, pricing, and verification

Files:

- media manager components
- units manager components
- calendar and pricing components
- verification upload components

Tasks:

- support file uploads and video URLs
- manage cover image
- manage one-to-many units
- configure availability and pricing
- upload property verification documents
- submit property and show status

### Phase 5: Operations workspace

Files:

- reservations pages
- messages pages
- reviews page
- earnings and payouts pages

Tasks:

- build list/detail patterns
- reuse shell and section cards
- keep MVP focused on readability and direct actions

### Phase 6: Polish and QA

Tasks:

- align host shell with redesign tokens
- remove any one-off styling
- verify responsive sidebar behavior
- verify empty, loading, error, and gated states
- run `npm.cmd run build`

## Acceptance Criteria

The implementation will be considered successful when:

1. the host area works as a coherent portal instead of a single isolated dashboard page
2. approved hosts land in a sidebar-based workspace after login
3. non-host authenticated users are routed into host onboarding, not host-only management pages
4. the add-property flow supports draft creation through final submit
5. commercial property flows can connect to businesses and selected business documents
6. media, units, availability, pricing, and property verification are represented in the UI architecture
7. reservations, messages, reviews, earnings, and payouts have dedicated room in the information architecture
8. the host portal remains visually aligned with `UI_REDESIGN_PLAN.md`
9. `npm.cmd run build` passes after implementation

## Final Recommendation

Do not treat the host API as `dashboard only`.

Treat it as:

- a host onboarding flow
- a property creation and submission workspace
- an operational control panel for active hosts

The right frontend shape is a `host portal with a sidebar shell`, where:

- dashboard is the overview
- add property is the primary creation flow
- properties, reservations, messages, reviews, earnings, and payouts are first-class sections

That structure matches both the backend workflow and the product direction implied by the redesign reference.
