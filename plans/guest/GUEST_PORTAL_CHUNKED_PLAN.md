# XYZ Travellers Guest Portal Chunked Implementation Plan

## Purpose

This document breaks the currently documented guest API scope into smaller implementation chunks so the guest journey can be built step by step without trying to ship the whole system at once.

This is not a separate redesign plan.

It is a detailed execution plan for turning the public booking journey and the guest-only APIs into one connected guest experience while using the existing UI direction as the design reference.

This plan is derived only from these API documents:

- `api/guest/guest-dashboard.md`
- `api/guest/guest-bookings.md`
- `api/guest/guest-payments.md`
- `api/guest/guest-messaging.md`
- `api/guest/guest-profile.md`
- `api/guest/guest-reviews.md`
- `api/guest/guest-trust-and-safety.md`
- `api/guest/guest-wishlist.md`
- `api/guest/guest-notifications.md`

The visual and design-system reference for this guest plan should come from:

- `UI_REDESIGN_PLAN.md`

That means this guest plan should inherit the same core design direction already defined for the public-facing experience instead of inventing a separate portal-specific visual language.

## Design Reference

The guest portal should use `UI_REDESIGN_PLAN.md` as the primary visual reference for the guest-side experience.

That includes:

- keeping the current XYZ Travellers visual identity: Sora + Instrument Sans, lime accent, cream background, and false-black text
- using the same container rhythm built around `max-w-7xl mx-auto px-6`
- preferring softer but intentional surfaces instead of flat default panels
- using a smaller set of reusable patterns for section headers, pills, buttons, cards, and status surfaces
- keeping typography, spacing, shadows, borders, and hover behavior consistent across the public frontend and guest portal
- avoiding random one-off accents, ad hoc shadows, and inconsistent control styling
- making the guest portal feel like a continuation of the booking journey, not a separate product

## Working Principles

- keep the current public frontend as the discovery layer for guests
- keep the current visual direction as the foundation instead of redesigning everything
- use `UI_REDESIGN_PLAN.md` as the guest-side design reference for surfaces, typography, spacing rhythm, and reusable UI patterns
- do not rebuild the whole guest system at once
- keep each chunk independently testable
- finish shared guest routing and shell behavior before deeper guest pages
- fix the current misrouting where normal authenticated users fall into host onboarding even when they are only acting as guests
- treat booking creation as the system anchor because payments, messages, reviews, and trust actions all depend on a booking
- explicitly cover the handoff from public property pages into the guest portal instead of treating booking as a separate disconnected module
- centralize guest-specific types, normalization, and fetchers in `lib/guest.ts`
- reuse shared visual primitives where helpful instead of recreating separate guest-only styling patterns for every page
- do not invent a guest notification inbox because the documented notification scope is email-trigger only

## Recommended Delivery Order

Build in this order:

1. shared guest shell and access routing
2. public-to-guest booking handoff and booking request flow
3. guest dashboard and bookings workspace
4. payments and transactions
5. messaging workspace
6. guest profile and account settings
7. reviews and post-stay actions
8. wishlist and save-for-later flow
9. trust and safety plus notification guidance
10. final polish and QA

This order keeps the public booking path usable early while still moving toward the full guest portal.

## Chunk 1: Shared Guest Shell And Access Routing

### Goal

Create the base guest portal shell and route behavior for guest-only pages.

### Why this chunk comes first

Every later guest route needs:

- the same sidebar or mobile navigation
- the same guest page header style
- the same content container
- the same guest-only access behavior

Without this, dashboard, bookings, payments, and messages would all drift into separate layouts and inconsistent auth rules.

### Scope

- create a reusable `GuestShell`
- create a reusable `GuestSidebar`
- create a reusable `GuestTopbar`
- define guest route guard behavior
- redirect logged-out users to the standard auth flow
- define post-login routing so normal authenticated users stay in guest/public flows by default
- stop redirecting guest-capable users into host onboarding unless they explicitly enter a host route or choose a host-intent flow
- prevent host or admin users from entering guest-only routes
- create the guest portal landing route such as `/guest/dashboard`

### Main files

- `components/guest/GuestShell.tsx`
- `components/guest/GuestSidebar.tsx`
- `components/guest/GuestTopbar.tsx`
- `components/guest/GuestRouteGate.tsx`
- `app/guest/dashboard/page.tsx`
- `context/AuthContext.tsx`
- `app/auth/page.tsx` or the current auth entry route if post-login redirects are controlled there
- shared auth redirect helpers if they already exist

### Routing requirements

- a normal logged-in user without host approval should still be able to remain a guest and continue the public or guest journey
- host onboarding should appear only when the user explicitly enters host routes or chooses a host-specific intent
- guest portal entry should not depend on having a host portal
- auth return URLs for booking, wishlist, and guest dashboard should resolve back into guest/public routes instead of falling into host onboarding
- if the product supports both guest and host roles on one account later, the route decision should still respect the user intent of the route they were trying to access

### UI requirements

- keep the portal visually aligned with the public brand rather than using an admin-style dark workspace
- content area keeps `max-w-7xl mx-auto px-6`
- mobile uses drawer or slide-over guest navigation
- sidebar labels should stay compact and task-oriented
- shell must feel consistent with the existing host and admin portal quality level
- shell styling should borrow the stronger surface language, spacing rhythm, and typography discipline described in `UI_REDESIGN_PLAN.md`

### Deliverables

- guest shell exists
- guest dashboard route exists
- guest-only route guard behavior exists
- corrected post-login guest routing rules exist in the plan scope
- desktop and mobile shell behavior works

### Acceptance criteria

- logged-out users do not access guest routes directly
- guest users can access guest routes
- a standard authenticated user without a host portal is not redirected to host onboarding just for logging in
- booking and wishlist auth returns do not send the user into host onboarding
- host or admin users do not fall into broken guest pages
- build still passes

## Chunk 2: Public-To-Guest Booking Handoff And Booking Request Flow

### Goal

Connect the public property details page to the guest booking create flow so a guest can move from discovery into a real booking request.

### Why this chunk matters early

The guest APIs are not useful in isolation.

They assume the frontend already selected:

- `propertyId`
- `unitId`
- `checkInDate`
- `checkOutDate`
- guest counts

That means the public frontend and guest portal must be planned as one connected journey.

### Scope

- define the booking CTA handoff from `/properties/[propertyId]`
- create a guest booking request page such as `/guest/bookings/new`
- carry property, unit, stay dates, and guest counts into the booking form
- require login or register before booking creation if the user is unauthenticated
- submit booking requests through `POST /api/v1/bookings`
- redirect successful creates to booking detail or bookings index
- surface booking-create validation, loading, and success/error states

### Main files

- `app/properties/[propertyId]/page.tsx`
- `components/property/PropertyBookingCard.tsx`
- `app/guest/bookings/new/page.tsx`
- `components/guest/bookings/*`
- `lib/front.ts`
- `lib/guest.ts`
- `context/AuthContext.tsx`

### APIs used

- `POST /api/v1/bookings`
- `GET /api/v1/front/properties/:propertyId`

### Booking request requirements

- booking creation must use the selected `unitId`, not only the property id
- request body must support `adultGuests`, `childGuests`, `specialRequests`, and optional `couponCode`
- frontend must not invent a draft-booking API because none is documented
- booking create should happen only after the guest confirms the final unit and stay details
- if the user is not authenticated, the handoff should preserve a return path back to the booking request screen
- that auth return path must resolve back to the guest booking flow and must not bounce the user into host onboarding
- the booking request page should visually feel like a continuation of the public property page and hero search system, not a hard visual break

### Deliverables

- real booking request page
- authenticated handoff from public property page to guest booking flow
- booking success redirect
- guest booking error handling

### Acceptance criteria

- guest can move from a public property page into a real booking request screen
- booking create sends documented fields only
- successful booking create returns a real booking record and navigates correctly
- unauthenticated users can resume the booking flow after auth

## Chunk 3: Guest Dashboard And Bookings Workspace

### Goal

Build the main guest portal workspace around the dashboard and booking management screens.

### Why this chunk comes before payments and messages

The guest dashboard and bookings module are the primary navigation hub after a booking exists.

They also provide the state model that later modules depend on:

- pending booking
- accepted booking
- rejected booking
- cancelled booking
- completed booking

### Scope

- build guest dashboard page
- build bookings index page
- build booking detail page
- add booking filters by status and date range
- support booking cancellation flow
- show upcoming and recent bookings in dashboard cards or tables
- surface booking status reasons where available

### Main files

- `app/guest/dashboard/page.tsx`
- `app/guest/bookings/page.tsx`
- `app/guest/bookings/[bookingId]/page.tsx`
- `components/guest/dashboard/*`
- `components/guest/bookings/*`
- `lib/guest.ts`

### APIs used

- `GET /api/v1/guest/dashboard`
- `GET /api/v1/bookings`
- `GET /api/v1/bookings/:bookingId`
- `POST /api/v1/bookings/:bookingId/cancel`

### UI requirements

- dashboard should show upcoming booking focus first
- bookings page should follow the list-first pattern with search-ready filters, date filters, and pagination-ready layout even if the first API version is simple
- booking detail should surface property, unit, dates, pricing snapshot, special requests, and status history fields cleanly
- cancellation should use a confirmation flow and reason input
- dashboard cards, pills, filters, and detail sections should reuse the same premium-but-clean surface language from `UI_REDESIGN_PLAN.md`

### Deliverables

- guest dashboard
- bookings list
- booking detail page
- booking cancel action

### Acceptance criteria

- dashboard loads real guest summary data
- bookings list can filter by status and date range
- booking detail renders live booking data
- guest can cancel eligible bookings with a reason

## Chunk 4: Payments And Transactions

### Goal

Let guests review payment summaries, complete the first-version payment flow, and inspect transaction history.

### Why this chunk follows bookings

The payments APIs depend on existing guest-owned bookings and payable booking states.

Without real booking pages, the payment flow has no meaningful entry points.

### Scope

- create payment entry points from booking detail pages
- build checkout summary screen
- build payment confirmation step
- build transactions history page
- build refund request flow from eligible paid bookings
- surface payment state clearly in both booking and payment pages

### Main files

- `app/guest/payments/page.tsx`
- `app/guest/payments/[bookingId]/page.tsx` or `app/guest/bookings/[bookingId]/payment/page.tsx`
- `components/guest/payments/*`
- `components/guest/bookings/*`
- `lib/guest.ts`

### APIs used

- `POST /api/v1/payments/checkout`
- `POST /api/v1/payments/confirm`
- `POST /api/v1/payments/refund-request`
- `GET /api/v1/payments/my-transactions`

### Payment requirements

- checkout summary is a computed UI step, not a separate long-lived cart
- payment confirm should be treated as the first-version successful payment action
- frontend must explain that refunds are review requests, not instant automatic refunds
- duplicate paid states and duplicate refund requests should surface clear messages
- booking detail should reflect settled or unpaid states where the API makes them inferable
- payment surfaces should clearly distinguish primary CTA, secondary CTA, and passive information using the same visual hierarchy rules from `UI_REDESIGN_PLAN.md`

### Deliverables

- checkout summary screen
- payment confirm action
- refund request form
- transactions history page

### Acceptance criteria

- guest can open checkout from an eligible accepted booking
- guest can confirm payment successfully
- guest can see transactions history
- guest can request a refund for eligible settled payments

## Chunk 5: Messaging Workspace

### Goal

Create the guest messaging area for reservation-linked host communication.

### Why this chunk comes after payments

Messaging depends on reservation-linked thread context and should plug into real bookings rather than being built as a generic disconnected inbox.

### Scope

- build message threads list
- build thread detail page
- send new messages inside a thread
- mark host messages as read
- show unread counts in dashboard and guest navigation
- link threads back to the related booking or reservation context

### Main files

- `app/guest/messages/page.tsx`
- `app/guest/messages/[threadId]/page.tsx`
- `components/guest/messages/*`
- `components/guest/dashboard/*`
- `lib/guest.ts`

### APIs used

- `GET /api/v1/messages/threads`
- `GET /api/v1/messages/threads/:threadId`
- `POST /api/v1/messages/threads/:threadId/messages`
- `POST /api/v1/messages/threads/:threadId/read`

### Messaging requirements

- guest threads should show property and reservation context when available
- unread counts should be visible without crowding the UI
- read-state actions should be tied to guest-owned threads only
- blocked-user cases from trust and safety later chunks must be considered in the component structure
- message rows and thread surfaces should avoid default app-like styling and instead follow the cleaner editorial-travel aesthetic from `UI_REDESIGN_PLAN.md`

### Deliverables

- threads list page
- thread detail page
- send message form
- unread badge integration

### Acceptance criteria

- guest can load own message threads
- guest can open a thread and read messages
- guest can send messages in a thread
- unread counts update correctly after read actions

## Chunk 6: Guest Profile And Account Settings

### Goal

Let guests manage their own profile data inside the portal.

### Why this chunk is separate

The profile API is straightforward and important, but it should not block the booking, dashboard, payment, and messaging core.

### Scope

- build guest profile page
- load current guest profile
- edit guest profile fields
- surface account identity and completion cues in the dashboard or shell if useful

### Main files

- `app/guest/profile/page.tsx`
- `components/guest/profile/*`
- `lib/guest.ts`

### APIs used

- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`

### Form requirements

- first name
- last name
- email display if returned
- phone
- address
- profile photo URL
- bio if provided in the API shape

### Deliverables

- editable guest profile screen
- guest profile fetch and save states
- reusable profile summary card if useful for dashboard or shell

### Acceptance criteria

- guest can load profile data
- guest can save profile changes
- validation and error states are clear
- profile UI matches the shared guest portal shell

## Chunk 7: Reviews And Post-Stay Actions

### Goal

Support the guest actions that happen after a stay completes.

### Why this chunk comes after bookings

Review eligibility depends on booking completion state.

That means the UI must be built around real booking history instead of isolated review forms.

### Scope

- build guest review submission flow from eligible completed bookings
- build guest review history page
- surface one-review-per-reservation rules in UI
- add post-stay prompts from bookings and dashboard

### Main files

- `app/guest/reviews/page.tsx`
- `app/guest/bookings/[bookingId]/review/page.tsx` or integrated booking-detail action
- `components/guest/reviews/*`
- `components/guest/bookings/*`
- `lib/guest.ts`

### APIs used

- `POST /api/v1/reviews/property`
- `GET /api/v1/reviews/mine`

### Review requirements

- review CTA should appear only for completed bookings
- booking-linked review forms should preserve `reservationId` and `propertyId`
- frontend should explain when a guest is not yet eligible to review
- review history should be easy to scan and tied back to the related stay when possible

### Deliverables

- review submission action
- review history page
- completed-booking post-stay prompts

### Acceptance criteria

- guest can submit a review for eligible completed stays
- guest cannot create duplicate or ineligible reviews through the normal UI
- guest can see previously submitted reviews

## Chunk 8: Wishlist And Save-For-Later Flow

### Goal

Add lightweight save-for-later behavior that connects the public frontend to the guest portal.

### Why this chunk is separate

Wishlist is valuable, but it is not the core booking dependency chain like bookings, payments, or messaging.

It can be layered in after the main guest portal becomes stable.

### Scope

- build wishlist page
- add save and remove actions from public listing cards and property details
- reflect saved state for authenticated guest users
- hydrate saved properties through public property/listing data where necessary
- connect dashboard wishlist count carefully, respecting the documented safe-zero behavior

### Main files

- `app/guest/wishlist/page.tsx`
- `components/guest/wishlist/*`
- `components/ui/ListingCard.tsx`
- `app/properties/[propertyId]/page.tsx`
- `lib/guest.ts`
- `lib/front.ts`

### APIs used

- `GET /api/v1/users/me/wishlist`
- `POST /api/v1/users/me/wishlist`
- `DELETE /api/v1/users/me/wishlist/:propertyId`
- `GET /api/v1/guest/dashboard`

### Wishlist requirements

- wishlist should store and act on `propertyId`
- public cards should not require a guest portal route change just to save a property
- saved items should still display human-readable property information by combining guest wishlist ids with public listing data
- UI should stay robust even if dashboard wishlist total is temporarily zero-heavy in the first version
- saved-property cards should reuse the same listing-card hierarchy and visual consistency established in the public redesign direction

### Deliverables

- guest wishlist page
- save/remove wishlist actions on public property surfaces
- saved-state feedback

### Acceptance criteria

- guest can save a property from public pages
- guest can remove a property from wishlist
- guest can view saved properties inside the guest portal
- wishlist data stays consistent with public property identifiers

## Chunk 9: Trust And Safety Plus Notification Guidance

### Goal

Add the guest safety actions and handle the documented notification scope realistically.

### Why this chunk is separated

Trust and safety is important, but it is usually used less often than bookings, payments, messages, and reviews.

Notifications also do not have a real guest inbox API yet, so the UI needs careful scope control.

### Scope

- build report listing flow
- build report user flow
- build blocked users management page or panel
- surface block-user effects in messaging UX
- add notification guidance or status messaging in the guest portal without inventing an inbox
- show email-notification expectation copy near relevant workflows

### Main files

- `app/guest/safety/page.tsx`
- `components/guest/safety/*`
- `components/guest/messages/*`
- `components/guest/bookings/*`
- `lib/guest.ts`

### APIs used

- `POST /api/v1/trust/report-listing`
- `POST /api/v1/trust/report-user`
- `POST /api/v1/trust/block-user`
- `DELETE /api/v1/trust/block-user/:blockedUserId`

### Scope guardrails

- do not create a fake notifications center
- do not invent websocket or inbox behaviors that are not documented
- treat notification UI as informational support around email-triggered events
- trust actions should use booking, property, and host context when available for cleaner reporting forms
- safety and reporting flows should still follow the same polished shared design language instead of falling back to raw utility forms

### Deliverables

- listing report flow
- user report flow
- blocked users manager
- guest-facing notification guidance states

### Acceptance criteria

- guest can report a listing
- guest can report or block a user
- guest can unblock a previously blocked user
- messaging UI can respond appropriately when a block state affects communication

## Chunk 10: Guest Portal Polish And QA

### Goal

Make the guest portal and the public booking handoff feel like one unified system.

### Scope

- unify guest loading states
- unify guest empty states
- unify guest error states
- review responsive behavior across dashboard, bookings, payments, messages, and wishlist
- review public-to-guest route handoff behavior
- remove any one-off styling that breaks the portal feel
- validate booking-status-driven action visibility

### Files touched

- `components/guest/*`
- `app/guest/**/*`
- `app/properties/**/*`
- `components/property/*`
- `components/ui/*`
- `lib/guest.ts`
- `lib/front.ts`
- `context/AuthContext.tsx`

### QA checklist

- logged-out booking handoff
- guest auth return flow into booking request
- booking create flow
- dashboard summary load
- bookings filter and detail flow
- cancel booking flow
- payment checkout and confirm flow
- refund request flow
- messages thread list and thread detail flow
- profile load and save flow
- review submission from completed booking
- wishlist save and remove flow
- trust and safety actions
- build verification

### Acceptance criteria

- public booking handoff feels connected to the guest portal
- guest pages feel visually unified
- booking-driven actions appear only in the correct states
- guest shell, forms, lists, cards, and detail pages visibly align with the design direction in `UI_REDESIGN_PLAN.md`
- no obviously inconsistent guest page styling remains
- `npm.cmd run build` passes

## Detailed Dependency Map

### Hard dependencies

- Chunk 1 before every other guest-portal chunk
- Chunk 2 before the guest journey is considered fully connected from public frontend to guest portal
- Chunk 1 must fix the current host-onboarding misrouting before later guest flows are considered reliable
- Chunk 3 before Chunks 4, 5, and 7 because bookings drive payments, messages, and reviews
- Chunk 4 before refund workflows can be considered complete
- Chunk 9 should respect the messaging and booking context created in earlier chunks

### Soft dependencies

- Chunk 6 can ship before or alongside Chunk 3
- Chunk 8 can begin after Chunk 2 if public property identifiers and guest auth handoff are stable
- Chunk 9 can begin after Chunk 5 if messaging structure is already stable

## Suggested MVP Cut

If you want the fastest meaningful guest MVP, ship this reduced path first:

1. Chunk 1: Shared Guest Shell And Access Routing
2. Chunk 2: Public-To-Guest Booking Handoff And Booking Request Flow
3. Chunk 3: Guest Dashboard And Bookings Workspace
4. Chunk 4: Payments And Transactions
5. Chunk 5: Messaging Workspace

This gives you:

- a real guest portal shell
- a real public booking handoff
- booking create and booking management
- first-version payment handling
- reservation-linked messaging

Then add:

- Chunk 6 for guest profile depth
- Chunk 7 for post-stay reviews
- Chunk 8 for wishlist
- Chunk 9 for trust and safety depth

## Final Recommendation

Use this file as the execution document for the guest portal and booking-connected guest journey.

That means:

- the public frontend remains the discovery layer
- the guest portal becomes the post-auth booking and account workspace
- the booking flow is planned from public property page to guest booking detail, not as two separate systems
- normal authenticated users should not be forced into host onboarding when they are acting as guests
- the design direction should be inherited from `UI_REDESIGN_PLAN.md` so the guest portal feels like part of the same product family
- each chunk can now be implemented one at a time without inventing undocumented backend scope
