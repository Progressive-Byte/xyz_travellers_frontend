# XYZ Travellers Host Portal Step 9 Plan

## Step Name

Chunk 9: Operations Workspace

## Purpose

This document covers only the ninth implementation step from `HOST_PORTAL_CHUNKED_PLAN.md`.

It does not plan the full host portal.

It only plans the daily host-operations layer that lets an approved host move beyond setup and listing submission into the live management surfaces for reservations, messages, reviews, earnings, and payout history.

## Objective

Build the first real operations workspace inside the host portal so an approved host can:

- open dedicated pages for reservations, messages, reviews, earnings, and payout history
- understand current hosting activity without relying only on the dashboard summary
- move from high-level overview into list and detail workflows for active operations
- review upcoming and past reservation activity
- read and respond to guest conversations where the API supports messaging actions
- review property and guest-review status where the API exposes review data
- inspect earnings summaries and transaction-level payout information
- keep the operations screens visually aligned with the same premium host shell already established in earlier chunks

This step should turn the host portal into a fuller day-to-day workspace, not just an onboarding and property-submission system.

This step should not rebuild the completed property-creation flow, and it should not collapse all remaining polish work into this chunk.

## Why This Is Step 9

Chunk 1 created the reusable host shell.

Chunk 2 created the onboarding split between non-host users and approved hosts.

Chunk 3 added host profile and payout setup.

Chunk 4 created the property list and listing draft foundation.

Chunk 5 added media management.

Chunk 6 added units, pricing, and calendar controls.

Chunk 7 completed property verification and submission.

Chunk 8 added businesses and commercial ownership support.

Now the portal needs the `live operations` layer, because the full product model is not only about creating listings. It is also about running them after approval through reservations, guest communication, reviews, earnings, and payouts.

This step matters now because:

- the host shell already exists and can now support real operations routes cleanly
- the add-property workflow is mature enough that hosts need somewhere to manage actual hosting activity next
- dashboard cards alone are not enough for dense, ongoing operational work
- the sidebar information architecture already reserves space for these sections
- the full plan explicitly treats reservations, messages, reviews, earnings, and payouts as first-class host areas

Without this step:

- the host portal still feels weighted toward setup rather than ongoing operations
- sidebar sections for core host work remain placeholder-only
- the dashboard remains an overview with nowhere meaningful to drill into
- approved hosts cannot use the portal as a real operational control center yet

So this step exists to convert the host portal from `setup-heavy` into a fuller working host workspace.

## Current Starting Point

Right now the project already has:

- `app/host/dashboard/page.tsx`
- `app/host/onboarding/page.tsx`
- `app/host/profile/page.tsx`
- `app/host/payouts/page.tsx`
- `app/host/properties/page.tsx`
- `app/host/properties/new/page.tsx`
- `app/host/properties/[propertyId]/edit/page.tsx`
- `app/host/properties/[propertyId]/media/page.tsx`
- `app/host/properties/[propertyId]/units/page.tsx`
- `app/host/properties/[propertyId]/pricing/page.tsx`
- `app/host/properties/[propertyId]/calendar/page.tsx`
- `app/host/properties/[propertyId]/verification/page.tsx`
- `app/host/businesses/page.tsx`
- `components/host/HostShell.tsx`
- `components/host/HostSidebar.tsx`
- `components/host/HostRouteGate.tsx`
- `components/host/HostDashboardShell.tsx`
- host setup components for profile, payouts, properties, verification, and businesses
- shared host navigation metadata in `components/host/hostNavigation.ts`
- shared host API helpers in `lib/host.ts`

Current behavior:

- approved hosts can move from onboarding through listing creation, verification, submission, and commercial ownership support
- the sidebar shell and add-property workflow are already live
- the portal already distinguishes setup-state and review-state behavior for property editing
- the businesses layer now gives commercial listings a more honest readiness model

Current limitation:

- reservations still have no real page or details surface
- messages still have no real thread list or conversation view
- reviews still have no review workspace
- earnings still have no real summary page
- payout history still does not exist as a separate operations view
- several sidebar items remain structurally present but functionally incomplete

## Scope

This step includes:

- building reservations list and detail pages
- building messages thread list and thread detail pages
- building a reviews workspace page
- building an earnings summary page
- building a payout-history view if payout setup and payout history are distinct
- extending `lib/host.ts` for operations-facing data models and helpers
- wiring the sidebar sections so live operations routes feel like first-class areas
- creating practical loading, empty, error, and populated states for these operations screens

This step does not include:

- rebuilding onboarding
- reworking the already-completed property creation and submission flows
- redesigning the overall host shell from scratch
- final portal-wide polish and cleanup across all host pages
- guest-facing booking or public listing experiences
- admin-side tooling

## Product Behavior Model For This Step

This step applies only to approved hosts inside the portal.

### Reservations expectation

Behavior:

- host can open a reservations workspace
- host can review upcoming, ongoing, and completed reservations where the backend provides those distinctions
- host can open an individual reservation detail page
- the UI should prioritize clarity around stay timing, guest identity, status, and next actions

### Messages expectation

Behavior:

- host can open a messages workspace
- host can browse message threads
- host can open one thread and read the conversation clearly
- host can send or reply where the backend supports it
- unread and active-conversation states should be easy to identify

### Reviews expectation

Behavior:

- host can review listing-related and guest-related review activity where the backend exposes it
- the page should surface the most important status information first
- the UI should not imply review actions that the backend does not actually support

### Earnings and payouts expectation

Behavior:

- host can review earnings summary information
- host can inspect transaction-level history if the backend provides it
- payout setup remains separate from payout history when those concerns are different
- money screens should feel trustworthy, readable, and operational rather than decorative

Important rule:

- this chunk creates the `operations workspace` layer, not a final polish pass
- it should focus on usable operational list/detail screens and honest API integration

## Design Direction

These operations screens must follow `UI_REDESIGN_PLAN.md` and stay visually aligned with the host shell and premium travel-editorial direction already established in the portal.

### Visual principles

- keep dense operational data calm and readable
- avoid a generic dark SaaS admin look
- use lime accent carefully for status emphasis, active filters, and important calls to action
- keep cards compact but breathable for data-heavy screens
- make tables or row lists feel premium and structured, not raw back-office dumps

### UX principles

- the host should always understand what needs attention now
- operations pages should privilege readability over decorative complexity
- filters and list/detail transitions should feel obvious and low-friction
- empty states should guide the host without feeling like dead ends
- operational pages should scale from zero-state to busy-state without changing their mental model

## Route Coverage In This Step

This step needs to support:

- `/host/reservations`
- `/host/reservations/[reservationId]`
- `/host/messages`
- `/host/messages/[threadId]`
- `/host/reviews`
- `/host/earnings`
- payout-history route if needed beyond the existing payout-setup route

Behavior rules:

- all routes use the existing host route gate in portal mode
- logged out users redirect to auth
- non-host authenticated users redirect to onboarding
- approved hosts can access the operations pages

Important routing note:

- if the current `/host/payouts` route is still dedicated to payout setup, keep payout history separate in this chunk instead of overloading one page with two unrelated jobs
- if the backend or current UX proves payout setup and payout history can coexist cleanly, document that clearly during implementation rather than assuming it up front

## File Plan

### New files

- `app/host/reservations/page.tsx`
- `app/host/reservations/[reservationId]/page.tsx`
- `app/host/messages/page.tsx`
- `app/host/messages/[threadId]/page.tsx`
- `app/host/reviews/page.tsx`
- `app/host/earnings/page.tsx`
- `components/host/operations/reservations/HostReservationsPage.tsx`
- `components/host/operations/reservations/HostReservationDetailPage.tsx`
- `components/host/operations/reservations/HostReservationsList.tsx`
- `components/host/operations/reservations/HostReservationCard.tsx`
- `components/host/operations/messages/HostMessagesPage.tsx`
- `components/host/operations/messages/HostMessageThreadPage.tsx`
- `components/host/operations/messages/HostMessagesList.tsx`
- `components/host/operations/messages/HostConversationPanel.tsx`
- `components/host/operations/reviews/HostReviewsPage.tsx`
- `components/host/operations/earnings/HostEarningsPage.tsx`
- `components/host/operations/payouts/HostPayoutHistorySection.tsx` if payout history stays inside the existing route

### Updated files

- `components/host/hostNavigation.ts`
- `components/host/HostSidebar.tsx` only if icons or grouping need extension
- `components/host/HostDashboardShell.tsx` only if dashboard quick links or summary cards need to point into the new operations pages
- `app/host/payouts/page.tsx` if payout history must share the current payout route
- `lib/host.ts`

### Optional shared helpers

- `components/host/operations/hostOperations.ts`
- `components/host/operations/reservations/hostReservations.ts`
- `components/host/operations/messages/hostMessages.ts`

If list-item normalization, filters, status mapping, or thread shaping grows, extract small local helpers rather than overloading page components.

## Component Responsibilities

### `HostReservationsPage`

Responsibilities:

- load reservation list data
- support useful grouping or filtering states if the API makes them practical
- show quick operational context before a host drills into one reservation

### `HostReservationDetailPage`

Responsibilities:

- load one reservation in detail
- show timing, guest, property, unit, status, and important actions or notes where supported
- keep the page operationally useful without becoming cluttered

### `HostMessagesPage`

Responsibilities:

- load message threads
- support unread or active-thread emphasis
- hand off into a selected thread cleanly

### `HostMessageThreadPage`

Responsibilities:

- load one conversation thread
- render message history clearly
- support reply/send behavior where supported by the backend

### `HostReviewsPage`

Responsibilities:

- surface host-relevant review data clearly
- separate different review types if the backend distinguishes them
- show what is actionable versus what is purely informational

### `HostEarningsPage`

Responsibilities:

- show earnings summary and any useful supporting breakdowns
- surface recent transactions or periods where supported
- keep the screen trustworthy and easy to scan

### `HostPayoutHistorySection`

Responsibilities:

- show payout-history entries if they belong inside the existing payout route
- separate historical payout activity from payout-setup form concerns

## API Plan

This step should extend `lib/host.ts` with operations-facing helpers.

### API groups expected in this step

- reservations endpoints
- messaging endpoints
- reviews endpoints
- earnings endpoints
- payouts endpoints

### Minimum recommended API scope for this chunk

Required:

- fetch reservation list
- fetch reservation detail
- fetch message-thread list
- fetch message-thread detail
- support sending a message only if the backend contract clearly allows it
- fetch reviews data
- fetch earnings summary data
- fetch payout-history data where it is distinct from payout setup

Optional:

- reservation filtering by status if the API supports it cleanly
- reservation actions such as respond or status updates where already defined and safe to expose
- unread message counts or read-state tracking
- richer earnings breakdowns by period, property, or status

Guardrail:

- keep API integration focused on operational readability and direct host actions
- do not invent actions that are not confirmed by the backend contract

## Data Model Plan

### Reservation model

Frontend should be prepared to represent:

- reservation id
- property id and property name
- unit id and unit name if returned
- guest id and guest display identity
- start and end dates
- nights or duration if returned
- booking status
- payout or earnings-related summary fields if returned
- created and updated timestamps

### Message thread model

Frontend should be prepared to represent:

- thread id
- reservation id if linked
- guest identity or counterpart identity
- latest message preview
- unread status or unread count if returned
- created and updated timestamps

### Message item model

Frontend should be prepared to represent:

- message id
- thread id
- sender identity
- message body
- created timestamp
- read state if returned

### Review model

Frontend should be prepared to represent:

- review id
- property id or reservation id where relevant
- guest or host identity where relevant
- rating
- review body
- review type or direction if returned
- created timestamp

### Earnings and payout model

Frontend should be prepared to represent:

- summary totals
- transaction or payout id
- amount and currency
- source reservation or property reference where available
- payout status
- transaction date or payout date

## Workflow Structure For This Step

Chunk 9 is still one official chunk from `HOST_PORTAL_CHUNKED_PLAN.md`, but it is wide enough that implementation should be executed in internal sections.

### Internal Section A: Reservations workspace

Focus:

- reservations list
- reservation detail page
- status framing and useful filters

Reason:

- reservations are the clearest day-to-day host operations entry point after listings go live

### Internal Section B: Messages workspace

Focus:

- thread list
- thread detail
- send/reply behavior if supported

Reason:

- guest communication is another core daily workflow and should land early in operations coverage

### Internal Section C: Reviews, earnings, and payout history

Focus:

- reviews page
- earnings page
- payout history integration

Reason:

- these areas complete the operational shape of the portal, but they can safely follow reservations and messages inside the same official chunk

Important rule:

- keep these as internal execution sections inside the same official `Chunk 9`
- do not renumber them into a new top-level chunk order unless the user explicitly asks for separate sub-chunk files

## Reservations Behavior Plan

### Reservations list behavior

- load all host reservations on page open
- support empty, loading, error, and populated states
- show the most operationally useful summary data first
- make status and timing easy to scan

### Reservation detail behavior

- show one reservation in more detail
- keep important information grouped clearly: stay details, guest, property, status, and notes
- expose direct actions only if the backend clearly supports them

## Messages Behavior Plan

### Messages list behavior

- load threads on page open
- highlight unread or active threads where possible
- make thread previews compact and readable

### Thread detail behavior

- show conversation history cleanly
- keep send/reply interaction simple and direct
- avoid chat-app complexity that the backend does not support

## Reviews Behavior Plan

### Reviews page behavior

- show the host’s review-related data in one readable workspace
- separate review types only if that meaning is real in the backend
- surface missing-review or completed-review states clearly where supported

## Earnings And Payout History Behavior Plan

### Earnings page behavior

- show the host’s earnings summary first
- expose supporting breakdowns or recent transactions where supported
- avoid overloading the screen with finance complexity that the API does not confirm

### Payout history behavior

- show payout-history records distinctly from payout setup
- keep history readable and trustworthy
- if payout history lives in the same route as payout setup, separate the two concerns visually and structurally

## Status And Editability Plan

### Operations status treatment

The UI should be prepared to represent:

- reservation statuses
- message unread/read states
- review availability or completion states
- payout and earnings statuses

### Actionability rule

For this chunk:

- show direct actions only where the backend explicitly supports them
- prefer read-first operational pages over risky partially supported write actions
- if an action is uncertain, show the operational data without pretending the interaction exists

Guardrail:

- do not add fake CTAs that cannot complete successfully against the current API

## Empty State Plan

### Reservations empty state goals

- explain that no reservations exist yet
- point the host back toward listing readiness or published inventory context if useful

### Messages empty state goals

- explain that no guest conversations exist yet
- keep the space calm and informative rather than dead

### Reviews empty state goals

- explain that no reviews are available yet
- clarify whether this is due to no stays, no submissions, or simply no returned data where possible

### Earnings and payout empty state goals

- explain that no earnings or payout records exist yet
- keep the language tied to real booking activity

## Content Plan

### Reservations page header

Recommended content:

- badge like `Operations`
- title focused on active stays and upcoming guest activity
- short explanation that hosts can review booking flow and operational status here

### Messages page header

Recommended content:

- title focused on guest communication
- helper copy that makes thread navigation obvious

### Reviews and earnings content

Recommended content:

- concise and factual
- stronger emphasis on summary totals, ratings, and current operational meaning
- avoid vague placeholder language once real data is available

## Layout Structure

Suggested reservations route composition:

1. reservations route page
2. host route gate in portal mode
3. host shell
4. page header block
5. filters or quick summary strip if useful
6. reservations list or rows

Suggested reservation detail composition:

1. reservation detail route
2. host shell
3. summary header
4. grouped detail cards
5. notes, status, or actions area if supported

Suggested messages route composition:

1. messages route page
2. host shell
3. threads list
4. thread detail handoff or dedicated detail page

Suggested earnings route composition:

1. earnings route page
2. host shell
3. summary metrics
4. supporting transaction or payout sections

## Validation Plan

### Operational validation

- validate only the fields needed for supported actions
- keep filters and selection state practical and low-risk

### Messaging validation

- if sending is supported, require a non-empty message body
- keep message composition minimal unless the API requires more

### Earnings validation

- do not fabricate finance calculations on the frontend that the backend does not provide

Guardrail:

- validation should support trustworthy operational use, not invent product rules that are not backed by the API

## Styling Plan

### Operations styling

- keep dense data readable with clear hierarchy
- use calm surfaces, subtle borders, and restrained accent color
- prefer compact cards, rows, or panels over oversized marketing-like layouts

### Reservations and messages styling

- make state, timing, and counterpart identity easy to scan
- use whitespace to separate information groups cleanly

### Earnings styling

- prioritize trust and clarity for money screens
- keep totals, status, and supporting detail visually distinct

### State styling

- loading states should match the host portal skeleton language
- empty states should explain next context clearly
- error states should provide recovery paths without overwhelming the host

## Step-By-Step Build Checklist

### Part 1: API helper preparation

- add reservations types and helpers to `lib/host.ts`
- add messages types and helpers to `lib/host.ts`
- add reviews helpers to `lib/host.ts`
- add earnings and payout-history helpers to `lib/host.ts`

### Part 2: Reservations workspace

- create `/host/reservations`
- create `/host/reservations/[reservationId]`
- build loading, empty, error, and populated states

### Part 3: Messages workspace

- create `/host/messages`
- create `/host/messages/[threadId]`
- build threads list and thread detail
- support reply/send only if confirmed by the backend

### Part 4: Reviews, earnings, and payouts history

- create `/host/reviews`
- create `/host/earnings`
- integrate payout history where it belongs

### Part 5: Dashboard and navigation handoff

- ensure sidebar live states are correct
- ensure dashboard quick links or summary cards can route into the new operations pages where useful

### Part 6: Polish

- tune operational page clarity
- tune empty and error messaging
- verify the operations pages feel like a natural expansion of the current host shell

## Risks

### Risk 1: Operations endpoint contracts vary more than expected

Reservations, messages, reviews, earnings, and payouts may each return differently shaped payloads or nested structures.

Guardrail:

- normalize defensively and keep first-pass UI focused on the most reliable operational fields

### Risk 2: Some operational actions are not actually safe to expose yet

Certain endpoints may support reading but not dependable write interactions from the current frontend.

Guardrail:

- start with read-first pages and add actions only where the contract is clearly supported

### Risk 3: Payout setup and payout history become conflated

The existing portal already uses `/host/payouts` for setup.

Guardrail:

- keep setup and historical payout activity conceptually separate even if they must share one route during this chunk

### Risk 4: Operations screens drift into generic admin styling

Data-heavy pages can easily lose the portal’s design language.

Guardrail:

- keep each screen aligned with existing host-shell surfaces, typography, spacing, and status treatment

## Acceptance Criteria

This step is complete when:

1. host can open real reservations, messages, reviews, and earnings operations pages
2. reservation list and reservation detail screens are present and useful
3. messages thread list and thread detail screens are present and readable
4. reviews and earnings data are represented in the portal architecture
5. payout history is represented clearly if it is distinct from payout setup
6. operations pages stay aligned with the host shell and redesign language
7. route guards behave correctly for the new operations routes
8. `npm.cmd run build` passes after implementation

## Verification Plan

After implementation:

1. open `/host/reservations` as an approved host and verify loading, empty, error, and populated states
2. open one reservation detail page and verify key reservation data renders correctly
3. open `/host/messages` and verify thread list states render correctly
4. open one message thread and verify conversation detail renders correctly
5. if sending is supported, send a message and verify the thread updates correctly
6. open `/host/reviews` and verify review states render correctly
7. open `/host/earnings` and verify summary and supporting data render correctly
8. verify payout-history placement is clear if it is distinct from payout setup
9. verify non-host users still cannot access the new operations routes
10. run `npm.cmd run build`

## Final Recommendation For Step 9

Treat this step as the `daily host operations` layer of the portal.

If this is done well:

- the dashboard becomes a true overview instead of the only meaningful host workspace
- approved hosts can operate listings after setup and submission, not just prepare them
- the host portal starts to reflect the full backend story of `create, submit, and run hosting operations`
