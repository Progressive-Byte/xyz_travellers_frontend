# Guest Booking Flow Plan: Admin-Mediated Frontend

## Purpose

This plan defines the **frontend changes only** for the new guest booking flow, based on the backend lifecycle described in `guest-step-2-booking-engine-admin-mediated.md`.

The goal is to shift the guest-facing product from the current:

`pending -> accepted -> pay -> completed`

model to the new Admin-mediated lifecycle:

`pending -> host_confirmed -> confirmed -> paid -> completed`

with `rejected` and `cancelled` as terminal states.

This document is intentionally a UI/product execution plan for the current Next.js frontend. It does **not** include implementation yet.

## Source Plan

Primary source:

- `plans/guest/guest-step-2-booking-engine-admin-mediated.md`

This frontend plan should stay aligned with that lifecycle and should not invent a different status model.

## Why This Frontend Plan Is Needed

The referenced source plan is backend- and API-oriented. The current frontend still reflects the older host-driven booking journey:

- guests create a booking request from the property page
- booking detail assumes `accepted` is the payable state
- guest UI copy says the host accepts or rejects the booking
- host reservation pages still expose operational actions
- there is no admin booking workspace yet for the new phone-based mediation flow

So we need a dedicated frontend plan that translates the new lifecycle into:

- updated guest journey copy
- updated status mapping
- updated payment entry rules
- a new admin booking workspace
- reduced host-side mutation responsibilities

## Current Frontend State

### Guest booking entry and request flow

Current booking handoff already exists through:

- `components/property/PropertyBookingCard.tsx`
- `app/guest/bookings/new/page.tsx`
- `components/guest/bookings/GuestBookingCreatePage.tsx`
- `lib/guest.ts`

The current create page already:

- receives `propertyId`, `unitId`, dates, and guest counts from the public property page
- loads fresh property detail before submit
- creates bookings through `createGuestBooking(...)`
- redirects to guest booking detail after success

### Guest bookings workspace

Current guest booking surfaces already exist:

- `app/guest/bookings/page.tsx`
- `app/guest/bookings/[bookingId]/page.tsx`
- `components/guest/bookings/GuestBookingsPage.tsx`
- `components/guest/bookings/GuestBookingDetailPage.tsx`
- `components/guest/bookings/GuestBookingStatusPill.tsx`
- `components/guest/dashboard/GuestDashboardPage.tsx`
- `app/guest/payments/page.tsx`

### Current assumptions that must change

Current frontend logic still assumes:

- booking status enum is only `pending | accepted | rejected | cancelled | completed`
- guest can pay when booking status is `accepted`
- guest-facing text says the **host** reviews and responds
- cancellation is allowed from `pending` and `accepted`
- host reservation UI can still perform booking lifecycle actions

These assumptions now conflict with the Admin-mediated plan.

## Product Goal

After this plan is implemented, the guest booking experience should feel like this:

1. Guest selects a unit from the public property page.
2. Guest submits a booking request.
3. Guest sees a clear “under review by our team” state instead of a host-managed state.
4. Admin handles host phone confirmation, then guest phone confirmation, from the Admin portal.
5. Guest only sees the booking become payable once Admin moves it to `confirmed`.
6. Payment completion updates the booking to `paid`.
7. Host can still view reservation details, but host no longer drives the booking lifecycle from the portal.

## Frontend Principles

- Keep the public-to-guest booking handoff intact. The current booking entry pattern is already correct and should be preserved.
- Hide internal operational complexity from guests where possible.
- Prefer clear guest-facing labels over raw backend status names.
- Keep the guest flow visually consistent with the current guest portal patterns.
- Keep the admin flow list-first and table-based, matching the user's preferred management pattern.
- Remove host-side action affordances once Admin becomes the operational owner.

## New Frontend Status Model

### Backend status values to support

The frontend should be prepared for:

- `pending`
- `host_confirmed`
- `confirmed`
- `paid`
- `rejected`
- `cancelled`
- `completed`

### Guest-facing display model

The guest UI should not necessarily expose every backend state literally.

Recommended guest presentation:

| Backend status | Guest label | Guest meaning | Primary CTA |
|---|---|---|---|
| `pending` | Under Review | We received your booking request and our team is reviewing it. | Cancel |
| `host_confirmed` | Under Review | Internal operational step; keep same guest-facing label as pending. | Cancel |
| `confirmed` | Confirmed - Payment Pending | Booking is confirmed and ready for payment. | Pay now |
| `paid` | Paid / Upcoming Stay | Payment is complete and the stay is secured. | View booking |
| `rejected` | Declined | The stay could not be confirmed. | None |
| `cancelled` | Cancelled | The booking has been cancelled. | None |
| `completed` | Completed | Stay finished. | Review / View history |

### Admin-facing display model

Admin should see the exact operational lifecycle:

- `pending`
- `host_confirmed`
- `confirmed`
- `paid`
- `rejected`
- `cancelled`
- `completed`

### Host-facing display model

Host should still see reservation status, but without mutation controls. Host pages should become read-only operational visibility surfaces.

## Scope

### In scope

- update guest status types and normalizers in `lib/guest.ts`
- update guest booking create success messaging and “what happens next” copy
- update guest bookings list, detail, dashboard, and payments to the new lifecycle
- add an admin bookings workspace under the Admin portal
- add admin booking detail and admin status action surfaces
- update host reservation pages to remove operational mutation UI
- revise status pills, labels, helper text, and payment rules
- document the file-level implementation order for the frontend

### Out of scope

- backend API implementation
- database migration
- notification system redesign
- refund UX redesign beyond what already exists
- browser verification changes by automation

## Affected Frontend Areas

### Public booking entry

- `components/property/PropertyBookingCard.tsx`

### Guest booking flow

- `app/guest/bookings/new/page.tsx`
- `components/guest/bookings/GuestBookingCreatePage.tsx`
- `app/guest/bookings/page.tsx`
- `components/guest/bookings/GuestBookingsPage.tsx`
- `app/guest/bookings/[bookingId]/page.tsx`
- `components/guest/bookings/GuestBookingDetailPage.tsx`
- `components/guest/bookings/GuestBookingStatusPill.tsx`
- `components/guest/dashboard/GuestDashboardPage.tsx`
- `components/guest/payments/GuestPaymentsPage.tsx`
- `lib/guest.ts`

### Admin portal

Potential new frontend surfaces:

- `app/admin/bookings/page.tsx`
- `app/admin/bookings/[bookingId]/page.tsx`
- `components/admin/bookings/AdminBookingsPage.tsx`
- `components/admin/bookings/AdminBookingDetailPage.tsx`
- `components/admin/adminNavigation.ts`
- `components/admin/AdminDashboardPage.tsx`

### Host portal

- `app/host/reservations/page.tsx`
- `app/host/reservations/[reservationId]/page.tsx`
- `components/host/operations/reservations/HostReservationsPage.tsx`
- `components/host/operations/reservations/HostReservationsList.tsx`
- `components/host/operations/reservations/HostReservationDetailPage.tsx`
- `lib/host.ts`

## Planned UX Changes

## 1. Public Property To Booking Handoff

### Goal

Keep the current booking handoff, but update the promise of what happens next.

### Current issue

The create flow copy currently says the booking request is sent to the host and suggests the host reviews it directly.

### Planned change

Update booking entry and request-page messaging to explain:

- the request is submitted to the platform
- our team reviews it
- the team contacts host and guest by phone
- payment becomes available only after confirmation

### Notes

No structural change is needed to the route handoff itself. The current route shape is already good.

## 2. Guest Booking Create Page

### Goal

Keep the current creation form, but make the post-submit expectation match the new operational flow.

### Planned changes

- keep the same create form structure and data fields
- change the “what happens next” section in the right rail
- remove host-led phrasing
- frame the booking as “awaiting review by our team”
- prepare success handling for bookings that start as `pending` under the new lifecycle

### Copy direction

Replace language like:

- “The host reviews the request and can accept or reject it.”

with language like:

- “Our team reviews your booking request and contacts the property host.”
- “Once both sides confirm, your booking moves to payment.”
- “You will see the payment step in your guest portal when the booking is ready.”

## 3. Guest Status Types And Normalization

### Goal

Make `lib/guest.ts` the single source of truth for the new guest booking status handling.

### Planned changes

- expand `GuestBookingStatus`
- update `normalizeGuestBookingStatus(...)`
- support new timestamps and fields if the backend returns them, such as:
  - `hostConfirmedAt`
  - `confirmedAt`
  - `paidAt`
- keep normalization backward-safe during rollout where possible

### Important compatibility note

If the frontend is deployed before the backend fully switches over, normalization should fail gracefully rather than breaking the page.

## 4. Guest Booking Status Pill And Labels

### Goal

Refactor the guest status presentation so it is helpful instead of leaking internal workflow details.

### Planned changes

- update `GuestBookingStatusPill.tsx`
- add label mapping helpers
- optionally separate:
  - raw backend status
  - guest-facing label
  - styling token

### Recommendation

Map both `pending` and `host_confirmed` to the same visible guest pill label:

- `Under Review`

This keeps the UI calm and avoids exposing an awkward half-step.

## 5. Guest Bookings List

### Goal

Update filters, counts, and row messaging for the new lifecycle.

### Planned changes

- replace `accepted` filter handling
- support new statuses in the list state model
- keep table layout and scan-first structure already established in the guest workspace
- update empty-state and helper text to reflect admin mediation

### Recommended filter model

- `All`
- `Under Review`
- `Payment Pending`
- `Paid / Upcoming`
- `Completed`
- `Cancelled`
- `Declined`

This can still map internally to one or more backend statuses.

## 6. Guest Booking Detail Page

### Goal

Make booking detail the clearest explanation point in the guest portal.

### Planned changes

- remove host-accept wording
- replace “accepted booking” payment logic
- update the timeline block
- update payment box rules
- update cancellation eligibility messaging
- show status note text more deliberately for rejected/cancelled cases

### State behavior

#### `pending`

- show “Under Review”
- show expectation that the team is checking availability
- allow cancellation if backend allows it

#### `host_confirmed`

- still show “Under Review”
- optionally explain: “We are confirming final details with you”
- keep pay button hidden

#### `confirmed`

- show “Confirmed - Payment Pending”
- show pay button
- show clearer payment explanation than the current host-accepted copy

#### `paid`

- hide pay action
- show paid/success state
- show transaction summary if available

#### `rejected` / `cancelled`

- highlight status reason and next-step expectations

#### `completed`

- keep history view and connect to review flows later

## 7. Guest Dashboard

### Goal

Make dashboard summaries align with the new lifecycle.

### Planned changes

- change upcoming booking emphasis from old accepted logic
- treat `confirmed` and `paid` as active high-value bookings
- treat `pending` and `host_confirmed` as “under review” rather than “upcoming”
- update card labels and action language

### Outcome

The dashboard should answer:

- what needs guest attention now
- what is waiting on the admin process
- what is already paid and ready

## 8. Guest Payments Flow

### Goal

Move payment eligibility from `accepted` to `confirmed`.

### Planned changes

- update payment CTA rules in booking detail
- update any payment helper copy in the guest payments page
- reflect that `confirmed` is the only pre-payment actionable state
- reflect that payment success transitions the booking to `paid`

### Important UX rule

Do not show payment as available during:

- `pending`
- `host_confirmed`

Only show it for:

- `confirmed`

## 9. Admin Booking Workspace

### Goal

Create the new operational workspace where Admin actually manages booking lifecycle transitions.

### Why this matters

The backend plan makes Admin the system operator. Without a proper admin UI, the new flow is incomplete from a product standpoint.

### Recommended routes

- `/admin/bookings`
- `/admin/bookings/[bookingId]`

### Recommended workspace structure

#### Admin bookings list

List-first table view with:

- booking reference
- property and unit
- guest name and phone
- host name and phone
- stay dates
- amount / pricing summary
- current status
- quick action to open detail

#### Admin booking detail

Operational detail page with:

- guest contact block
- host contact block
- property and unit context
- pricing snapshot
- timeline/status history
- status note / reason history
- action buttons based on current status

### Recommended admin actions by state

#### From `pending`

- `Reject`
- `Host Confirmed`
- `Cancel`

#### From `host_confirmed`

- `Confirm Booking`
- `Cancel`

#### From `paid`

- `Cancel`
- `Mark Complete`

### UI behavior notes

- show destructive actions carefully with explicit confirmation
- keep action area compact and high-clarity
- use descriptive labels, not raw IDs
- keep the page consistent with the existing admin workspace styling

## 10. Admin Navigation And Dashboard Entry

### Goal

Make bookings a first-class admin workspace.

### Planned changes

- add a Bookings item to `components/admin/adminNavigation.ts`
- add a dashboard shortcut or CTA in `components/admin/AdminDashboardPage.tsx`

### Recommendation

Bookings should sit near other operational areas, not under homepage curation.

## 11. Host Portal De-Operationalization

### Goal

Keep host reservation visibility while removing lifecycle control from host pages.

### Planned changes

- remove respond / cancel / complete actions from host reservation detail
- update copy to explain that booking coordination is handled by Admin
- keep reservation detail as a read-only visibility page
- update host list summaries if they still rely on `accepted`

### Important note

This is not a host portal removal. It is a responsibility change.

## 12. Frontend Copy Rewrite Checklist

The following phrases should be audited and replaced where needed:

- “host accepted”
- “host will review”
- “host can accept or reject”
- “finish payment after host approval”
- any wording that implies the guest is waiting on host portal actions

Replace with language centered on:

- team review
- confirmation by our team
- payment unlock after confirmation
- admin-mediated coordination

## Implementation Order

## Phase 1: Status contract and guest state model

1. Update `lib/guest.ts`
2. Update guest status pill mapping
3. Update guest dashboard logic
4. Update guest bookings list logic

## Phase 2: Guest booking detail and payment logic

1. Update `GuestBookingDetailPage.tsx`
2. Move payment visibility to `confirmed`
3. Update cancellation logic and status-specific copy
4. Update timeline presentation

## Phase 3: Guest booking create messaging

1. Update `GuestBookingCreatePage.tsx`
2. Update public booking CTA helper copy if needed
3. Keep current route handoff intact

## Phase 4: Admin workspace

1. Add admin navigation entry
2. Build admin bookings list
3. Build admin booking detail
4. Add admin action surfaces for valid transitions

## Phase 5: Host cleanup

1. Remove host booking mutation UI
2. Update host reservation labels and copy
3. Preserve read-only visibility

## Acceptance Criteria

- guest booking request flow still starts from the public property page without breaking route handoff
- guest create page explains the new admin-mediated review path
- guest status types support `host_confirmed`, `confirmed`, and `paid`
- guest never sees payment unlocked at `pending` or `host_confirmed`
- guest sees payment unlocked at `confirmed`
- guest booking detail no longer talks about host acceptance
- admin has a dedicated bookings workspace to drive the lifecycle
- host reservation pages no longer expose lifecycle mutation controls
- guest dashboard and bookings list reflect the new lifecycle cleanly
- UI labels use descriptive wording rather than raw backend terminology wherever practical

## Risks And Watchouts

### Mixed rollout risk

If backend and frontend roll out at different times, status handling may briefly be mixed. The frontend should be defensive during the transition.

### Guest confusion risk

If `host_confirmed` is shown literally to guests, the experience will feel technical and awkward. It should be abstracted behind a calmer guest-facing label.

### Admin overload risk

If the admin list view is not compact and scan-friendly, the operational flow will become cumbersome. The admin bookings page should start as a table-first workspace.

### Host portal inconsistency risk

If host mutation buttons remain visible while the backend has already shifted to Admin control, the host experience will become misleading. Host cleanup needs to be part of the same execution wave.

## Open Questions To Resolve Before Implementation

1. Should guest cancellation remain allowed in `confirmed`, or should that become an admin-assisted action only in the UI?
2. Should the guest list filters expose `Under Review` as one merged filter for `pending` + `host_confirmed`, or allow both separately in advanced filtering?
3. Should the admin booking list show both guest and host phone numbers directly in the table, or only in detail view plus compact secondary text?
4. Should the host reservations list keep all statuses visible, or visually de-emphasize non-actionable ones now that hosts are no longer operators?

## Deliverable

Implementation should follow this plan by treating the frontend as three connected surfaces:

- public booking entry
- guest booking and payment experience
- admin-operated booking management

with host reservation pages retained as visibility-only pages.
