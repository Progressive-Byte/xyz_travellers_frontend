# Guest Step 2 Plan (Revised): Admin-Mediated Booking Engine

## Purpose

This plan **replaces and supersedes** the earlier `guest-step-2-booking-engine-via-host.md` approach.

The original design handed the booking acceptance / rejection / cancellation / completion decisions directly to the **Host** via `/api/v1/host/reservations/*` endpoints. The revised design instead makes the **Admin** the sole operational mediator of every booking lifecycle decision. Hosts no longer manage booking statuses, but they should still be able to view reservations for their own properties and units with guest/contact/property/unit details. All booking lifecycle transitions are Admin-driven after offline (phone) conversations with host and guest.

### In One Sentence

> Guest submits a booking → Admin picks it up, calls the host by phone, then calls the guest by phone → Admin updates the booking status in the admin portal at each step → Guest sees live status in their dashboard and pays when the booking is ready for payment.

## Why We Are Changing The Flow

The previous direct host-accept model has issues for this product:

1. Hosts on this platform are **not expected to log in constantly** to manage reservation requests.
2. Bookings should be coordinated offline (phone) by the Admin staff so both host and guest are personally reached.
3. A single Admin operator owns the confirmation sequence, which means fewer race conditions and no dependency on host notification deliverability.
4. The Admin portal becomes the **single place of truth** for booking state, while Host reservation APIs remain read-only for visibility.

## New Booking Lifecycle (High Level)

```
Guest submits booking
        │
        ▼
  [ status: pending ]  ◄──────── "Awaiting admin review"
        │
        │  Admin calls HOST (phone) to confirm availability, price, rules
        │  - If host says NO:
        │         Admin rejects (status -> rejected), process ends
        │  - If host says YES:
        │         Admin moves to host_confirmed
        ▼
  [ status: host_confirmed ]  ◄── "Host confirmed, awaiting guest contact"
        │
        │  Admin calls GUEST (phone) to confirm details, price, payment
        │  - If guest declines / no response:
        │         Admin cancels (status -> cancelled)
        │  - If guest verbally confirms:
        │         Admin moves to confirmed
        ▼
  [ status: confirmed ]  ◄─────── "Booking confirmed, awaiting guest payment"
        │
        │  Guest opens dashboard, sees confirmed + pay button, pays online
        ▼
  [ status: paid ]  ◄──────────── "Guest paid, ready for check-in"
        │
        │  After check-out date is reached, Admin marks complete
        ▼
  [ status: completed ]  ◄─────── "Stay finished"

  Terminal statuses from any non-terminal point:
        rejected  (admin rejection, mainly at pending)
        cancelled (admin cancellation, mainly at host_confirmed/confirmed/paid)
```

### Status Set Changes

**Existing statuses (Reservation model today):**
`['pending', 'accepted', 'rejected', 'cancelled', 'completed']`

**New statuses for this plan:**
`['pending', 'host_confirmed', 'confirmed', 'paid', 'rejected', 'cancelled', 'completed']`

Explanation of rename + additions:
- `accepted` is **removed** because "accepted" was ambiguous (accepted by whom? host? admin? guest?).
- `host_confirmed` replaces the semantic part of `accepted` that was "host says yes".
- `confirmed` is the Admin's "both parties OK" marker (after calling guest on phone).
- `paid` is introduced because payment eligibility used to be `status === 'accepted'`; under the new flow, the payable status is explicitly `confirmed`, and once paid, we mark it `paid` (so a guest cannot pay twice and we can gate reviews/completion on `paid` + check-out).

### Transition Owners (Role Matrix)

| Transition | From → To | Who triggers it | API endpoint family |
|------------|-----------|-----------------|---------------------|
| Create | *(new)* → `pending` | Guest (authenticated) | `POST /api/v1/bookings` |
| Reject | `pending` → `rejected` | Admin | `PATCH /api/v1/admin/bookings/:id/status` |
| Host ok | `pending` → `host_confirmed` | Admin | `PATCH /api/v1/admin/bookings/:id/status` |
| Cancel (admin) | `pending`/`host_confirmed`/`confirmed`/`paid` → `cancelled` | Admin | `PATCH /api/v1/admin/bookings/:id/status` |
| Guest ok | `host_confirmed` → `confirmed` | Admin | `PATCH /api/v1/admin/bookings/:id/status` |
| Payment | `confirmed` → `paid` | Guest via payments API | `POST /api/v1/payments/*` (existing, updated gating) |
| Complete | `paid` → `completed` | Admin (after checkout) | `PATCH /api/v1/admin/bookings/:id/status` |
| Cancel (guest) | `pending`/`host_confirmed`/`confirmed` → `cancelled` | Guest (pre-checkin only) | `POST /api/v1/bookings/:id/cancel` (existing, narrowed) |

### Key Design Rule: NO Host Reservation Mutation APIs

The following existing **Host** reservation mutation endpoints must be **removed**:

- `POST   /api/v1/host/reservations/:reservationId/respond`  (accept/reject)
- `PATCH  /api/v1/host/reservations/:reservationId/status`   (cancel/complete)

These Host read-only endpoints stay available:

- `GET    /api/v1/host/reservations`
- `GET    /api/v1/host/reservations/:reservationId`

Correspondingly, only the mutation-oriented service + controller exports are retired, while the read-only host reservation handlers stay in place and are updated to the new status model and detail payloads.

The Host dashboard "upcoming reservations" counter should remain, but it must align with the new lifecycle (`confirmed` / `paid`) and may link to the read-only Host reservation view later.

## Scope Of This Plan

### In Scope

- Rename / extend `reservationStatuses` enum to the new 7-status set.
- Update Reservation model enum + add any DB migration note for existing docs.
- Introduce a new `paidAt` timestamp field on the Reservation model.
- **Guest-side**: keep `POST /bookings`, `GET /bookings`, `GET /bookings/:id`, `POST /bookings/:id/cancel` but update status gating and response labelling.
- **Guest dashboard**: make sure "upcoming stays" uses `confirmed` OR `paid` (not just `accepted` like today in `guest.service.ts`).
- **Admin-side**: NEW booking management APIs under `/api/v1/admin/bookings/*`.
  - Admin booking list (filterable by status, property, unit, host, date).
  - Admin booking detail with **host contact info** + **guest contact info** inline (so admin can make the phone calls from the same detail view).
  - Admin status PATCH endpoint for all Admin-owned transitions with strict guards.
- **Payments gating change**: `ensureGuestReservationPayable` must accept `status === 'confirmed'` (instead of today's `accepted`). After successful payment, payments service must set reservation `status = 'paid'` and stamp `paidAt`.
- **Availability overlap check**: keep blocking only on `status === 'paid'` OR `status === 'confirmed'`? → Strategy: `confirmed` + `paid` BOTH block inventory, because once the Admin has confirmed both parties, nobody else should book those dates. `pending` and `host_confirmed` do NOT block.
- **Reviews gating change**: reviews currently require `completed`. Keep that but also require that the reservation reached `paid` at some point (i.e., completed bookings that were never paid can't be reviewed, because they never actually happened financially).
- **Unit deletion guard**: today blocks on `pending` + `accepted`. Change to `confirmed` + `paid` + `host_confirmed`? → Block on `confirmed` and `paid` (active inventory-blocking statuses). Do NOT block on `pending` because a pending booking is not yet guaranteed.
- **Homepage/Public search availability checks**: align with overlap rule — exclude dates blocked by `confirmed` and `paid` reservations.
- **API documentation**:
  - Update OpenAPI `openapi.yaml` reservation/booking schemas and status enums.
  - Update `docs/api/guest/guest-bookings.md` with the new status names and lifecycle.
  - Update `docs/api/payments/*` if a separate payments doc exists.
  - Update/Create `docs/api/admin/admin-bookings.md` with all Admin booking endpoints.
  - Remove/update Host reservations doc in `docs/api/host/host-reservations.md`.
- **Notification emails**:
  - Today `sendBookingConfirmedEmail` triggers when Host accepts. Now trigger it when Admin transitions to `confirmed` (or at `host_confirmed`? → Trigger at `confirmed`, because that is after BOTH parties are contacted).
  - Add Admin-side informational emails if product needs them later (TBD; this plan doesn't require them for v1 unless explicitly requested).

### Out Of Scope

- Host notification push/SMS channels.
- Guest in-app realtime notifications beyond email (sockets / push).
- Auto-complete of `paid` bookings after checkout date (no cron in repo; Admin clicks complete manually).
- Auto-reject of `pending` bookings after a timeout (Admin manages that manually).
- Bulk Admin status actions.
- Additional Guest UI states beyond status labels (admin can add them in the portal later).
- Refunds — covered by a separate refund step (`guest-step-10-refund-request.md`); this plan only ensures `paid` and `cancelled` exist so refunds have anchor statuses.

## Current Repository State — What Already Exists

Files / modules already in the repo and reused here:

### Booking Layer (Guest-facing)
- `src/modules/bookings/booking.routes.ts`
- `src/modules/bookings/booking.controller.ts`
- `src/modules/bookings/booking.service.ts`
- `src/modules/bookings/booking.validation.ts`

### Reservation Model + Host-facing Reservation Layer
- `src/modules/reservations/reservation.model.ts`  → **source of truth for status enum**
- `src/modules/reservations/reservation.service.ts` → contains host APIs that must be removed
- `src/modules/reservations/reservation.controller.ts` → host controller exports to remove
- `src/modules/reservations/reservation.validation.ts` → host-only validation schemas to partially remove
- `src/modules/host/host.routes.ts` → lines 397–424, 81–82 imports + routes for host reservations, to be deleted

### Admin Module (Must Be Extended)
- `src/modules/admin/admin.routes.ts`      → add `/bookings/*` routes here
- `src/modules/admin/admin.controller.ts`  → add admin booking handlers
- `src/modules/admin/admin.service.ts`     → add admin booking service functions
- `src/modules/admin/admin.validation.ts`  → add admin booking list/status validation schemas

### Cross-module gating that references `accepted` status

These must be audited and updated to the new status names:

| File / Location | Current Reference | New Reference |
|-----------------|-------------------|---------------|
| `payments.service.ts` line 198 | `status === 'accepted'` blocks payment | `status === 'confirmed'` makes it payable; after success → `paid` |
| `booking.service.ts` `createGuestBooking` overlap check | counts `accepted` | counts `confirmed` + `paid` |
| `calendar.service.ts` (inventory) | only `accepted` block dates | `confirmed` + `paid` both block |
| `reservations/reservation.service.ts` `ensureNoAcceptedReservationOverlap` (used by host respond) | counts `accepted` | function itself becomes UNUSED because host respond is removed; keep duplicate copy in shared or move to booking/shared.ts for Admin gating |
| `host/dashboard.service.ts` line 81 | "upcoming" counts `accepted` | Host dashboard upcoming should use `confirmed` + `paid`; this plan keeps host reservation visibility |
| `guest/guest.service.ts` lines 75–77 | "upcoming stays" filters `accepted` | filter `confirmed` + `paid` (anything the guest should prepare for) |
| `reviews/reviews.service.ts` lines 74–76 + 104–106 | review requires `completed` | review requires `completed` AND ensure booking had `paid` at some point OR is `completed` (recommend keep simple: `completed` only; if never paid it shouldn't reach `completed`) |
| `properties/unit.service.ts` lines 138–145 (unit delete guard) | blocks if any reservations `pending` OR `accepted` | block on `confirmed` OR `paid` OR `host_confirmed` (decision: host_confirmed not blocking delete but admin might want it → choose `confirmed` + `paid` only so that host_confirmed doesn't become a weird zombie-lock) |
| `reservation.model.ts` indexes | `{ hostId: 1, status: 1, createdAt: -1 }` | keep index; hostId still useful for Admin listing even without host self-service |

### User Model Contact Fields (for Admin detail view)

`User` model in `src/modules/users/user.model.ts` already exposes:
- `firstName`
- `lastName`
- `email`
- `phone`
- `profilePhoto`

Admin booking detail endpoint will populate `hostId` (via Property → hostId → User) and `guestId` to return both contact summaries inline.

### Property Model Contact Chain

Reservations have `hostId` stored directly on the Reservation document. Admin detail endpoint should populate:
- `guestId` → contact info
- `hostId`  → contact info
- `propertyId` → basic property metadata (name, address, city, propertyType)
- `unitId` → unit metadata (name, capacity)

All without requiring extra joins at the UI layer.

## Goal

At the end of implementing this plan, the following user journeys work end-to-end through the Admin portal + Guest dashboard:

1. **Guest creates a booking through the app.** Status becomes `pending`.
2. **Admin opens admin booking list** and sees the new `pending` booking at the top.
3. **Admin opens booking detail** and immediately sees:
   - Host full name, phone, email, profile photo.
   - Guest full name, phone, email, profile photo.
   - Property + unit + dates + pricing snapshot.
4. **Admin calls host** on the phone number shown. If host says NO, Admin clicks "Reject" (or similar CTA backed by the status PATCH) → booking becomes `rejected`, process ends.
5. If host says YES, Admin clicks "Host confirmed" → booking becomes `host_confirmed`.
6. **Admin calls guest** on the phone number shown. If guest declines → Admin cancels (→ `cancelled`).
7. If guest verbally confirms → Admin clicks "Confirm Booking" → becomes `confirmed`. At this point inventory is locked (dates are blocked for this unit across `confirmed` + `paid`). Also send the confirmation email at this transition.
8. **Guest opens dashboard**, sees booking status = `confirmed` with a "Pay Now" button.
9. **Guest pays** via existing payments flow → backend marks booking = `paid` and stamps `paidAt`.
10. After guest stays and checks out, **Admin clicks "Mark Complete"** on the booking in admin portal → `completed`.
11. At any point before check-in, Admin or Guest (guest with limited allowed starting states) can Cancel → `cancelled`.

## Proposed Implementation (Step-By-Step Order)

### Step 1: Update Reservation Status Model + Fields

**Files:**
- `src/modules/reservations/reservation.model.ts`
- `src/constants/bookingStatus.ts` (currently empty — if still unused, deprecate note; if any later file imports it, keep in sync)
- Migration SQL/JSON note (no migration file unless MongoDB doc update script is added for existing `accepted` records)

**What to do:**

1. Change the canonical enum:
   ```
   reservationStatuses = ['pending', 'host_confirmed', 'confirmed', 'paid', 'rejected', 'cancelled', 'completed'] as const;
   ```
2. **Add** a new optional timestamp field `paidAt: Date | null` with `default: null` on the schema.
3. Add an index on `paidAt` if reporting queries need it later (nice-to-have, not required for v1).
4. Add or update `guestId` index and `status` index if missing (indexes already exist, just re-check enum value compatibility with Mongoose).
5. For any existing records in `accepted` state during rollout: manually or via one-off script rename `accepted` → `confirmed` (since semantically "accepted" in the old model meant something close to the new `confirmed`). Add a note in the plan about this one-off migration step.

### Step 2: Remove Host Reservation Mutation Endpoints

**Files:**
- `src/modules/reservations/reservation.service.ts`
  - Keep / update: `listHostReservations`, `getHostReservation` as read-only host visibility endpoints.
  - Delete: `respondHostReservation`, `patchHostReservationStatus`.
  - Also delete any host-only internal helpers that make sense ONLY in mutation context.
  - Keep or re-export any truly shared helpers into a new `reservations.shared.ts` or into `bookings/booking.service.ts`:
    - `ensureReservationDatesValid`
    - `ensureNoAcceptedReservationOverlap` → rename to `ensureNoConfirmedOrPaidReservationOverlap` with new logic
    - `enumerateStayDates`
    - `toReservationListItem` / `toBookingListItem`
    - `toReservationDetails` / `toBookingDetails`
    - The `toId` utility and normalizeDate / todayDateString already exist in booking.service.ts as well, consolidate.
- `src/modules/reservations/reservation.controller.ts`
  - Keep / update: `listMyReservations`, `getMyReservation`.
  - Delete: `respondMyReservation`, `patchMyReservationStatus`.
- `src/modules/reservations/reservation.validation.ts`
  - Keep shared validation for both Admin and Host:
    - `reservationParamsSchema`
    - `listReservationsQuerySchema`
  - Remove host-only mutation schemas:
    - `respondReservationSchema`
    - `patchReservationStatusSchema`
- `src/modules/host/host.routes.ts` (lines 81–82, 397–424)
  - Keep imports and routes for `listMyReservations`, `getMyReservation`.
  - Remove only host mutation route registrations.

### Step 3: Consolidate Booking / Reservation Shared Logic

**Files (suggested):**
- Create `src/modules/reservations/reservations.shared.ts` OR rename/use existing `front.shared.ts` style.
- Move helpers listed above into shared module, including the renamed overlap function.
- Update `booking.service.ts` and later `admin.service.ts` to import shared helpers.

### Step 4: Update Guest Booking APIs + Gating + Dashboard

**Files:**
- `src/modules/bookings/booking.service.ts`
- `src/modules/bookings/booking.validation.ts`
- `src/modules/bookings/booking.routes.ts` (routes unchanged, but update comments/docs)
- `src/modules/bookings/booking.controller.ts`
- `src/modules/guest/guest.service.ts` (dashboard upcoming filter)

**What to do:**

1. **createGuestBooking:**
   - Keep creating with `status: 'pending'` (same).
   - Overlap guard renamed `ensureNoConfirmedOrPaidReservationOverlap` — counts status IN `['confirmed','paid']` only.
2. **listGuestBookings / getGuestBooking:**
   - No route changes; but label fields in response need updating.
   - In `toBookingDetails` / `toBookingListItem`:
     - Keep existing `status` field. The Guest UI uses this to colour-code / show CTAs (see labelling section below).
3. **cancelGuestBooking:**
   - Currently allows cancelling from `pending` or `accepted`.
   - Update allowed starting states to: `['pending', 'host_confirmed', 'confirmed']`.
   - Still block cancellation if today >= checkIn date.
   - Do NOT allow Guest to cancel from `paid` — only Admin can cancel a paid booking (triggers refund flow later).
4. **Guest dashboard "upcoming stays"** in `guest.service.ts`:
   - Change filter from today's `accepted` → `['confirmed', 'paid']`.
   - Guest only sees actionable/imminent bookings here (confirmed but not yet paid, plus paid but not yet checked in).

### Step 5: Build Admin Booking Management APIs

**Files:**
- `src/modules/admin/admin.routes.ts`
- `src/modules/admin/admin.controller.ts`
- `src/modules/admin/admin.service.ts`
- `src/modules/admin/admin.validation.ts`

Add 4 new endpoints under `/api/v1/admin/bookings`:

#### 5a. Admin Booking List

`GET /api/v1/admin/bookings`

Auth: `auth` + `requireRoles(['admin'])`

Query filters:
- `status` — enum of any of the 7 statuses (optional, single; or allow comma-separated array if Zod supports it nicely)
- `hostId` — ObjectId (optional)
- `guestId` — ObjectId (optional)
- `propertyId` — ObjectId (optional)
- `unitId` — ObjectId (optional)
- `fromDate` / `toDate` — ISO date string, filters on overlapping checkIn/checkOut like guest list
- `page` / `limit` — optional pagination (use existing pagination utility in `utils/pagination.ts`)

Response is a lightweight list item per booking:
- `id`, `status`, `hostId`, `guestId`, `propertyId`, `unitId`
- `checkInDate`, `checkOutDate`
- small pricing summary (`subtotal`, `currency`)
- `createdAt`, `paidAt` if applicable
- host + guest mini-contact (name + phone) for quick inline reference so admin can scan the list and dial directly.

#### 5b. Admin Booking Detail

`GET /api/v1/admin/bookings/:bookingId`

Auth: `auth` + `requireRoles(['admin'])`

This is the most important Admin view for the phone workflow. Populate everything the admin needs on ONE screen:

- `id`, `status`, timestamps of all transitions:
  - `createdAt`, `respondedAt` (existing — reuse? see below), `cancelledAt`, `completedAt`, add `paidAt`.
  - Decide on transition-timestamp fields: the model already has `respondedAt`, `responseReason`, `cancelledAt`, `completedAt`, `statusReason`. Add: `hostConfirmedAt`, `confirmedAt`, `paidAt` as new fields OR use a simpler strategy: `respondedAt` and `responseReason` can be repurposed to store the Admin's first-response (host confirmed) timestamp. Cleaner option below in the data model extension.
- **host** full contact:
  - `id, firstName, lastName, email, phone, profilePhoto`
- **guest** full contact:
  - `id, firstName, lastName, email, phone, profilePhoto`
- **property** summary:
  - `id, propertyName, address, city, country, propertyTypeId, propertyTypeName`
- **unit** summary:
  - `id, name, capacity, bedrooms, bathrooms, sizeSqFt` (as available on unit model)
- stay details: dates, adult/child count, special requests, coupon code
- full pricing snapshot (base/discount/applied/nights/subtotal/currency)
- last 3 payment statuses or latest transaction summary if any

Populate via Mongoose `.populate` chain on the Reservation query using paths: `guestId`, `hostId`, `propertyId`, `unitId`, and then inside property, `propertyTypeId` for property type name if needed.

#### 5c. Admin Booking Status Patch (Core of the new flow)

`PATCH /api/v1/admin/bookings/:bookingId/status`

Auth: `auth` + `requireRoles(['admin'])`

Body:
- `status` (required) — target status from the 7-status enum
- `reason` (optional, string) — stored in `statusReason` for cancel / reject / complete

**Strict status transition guards + allowed admin transitions:**

| From | To | Validation Rule |
|------|----|-----------------|
| `pending` | `host_confirmed` | None extra. Admin just marked host said yes. Set `hostConfirmedAt`. |
| `pending` | `rejected` | Must provide reason (recommended but optional?). Require reason because Admin should record WHY host declined. Set `respondedAt` + `responseReason` OR `statusReason` (pick one consistently). |
| `pending` | `cancelled` | Admin cancelled before contacting anyone. |
| `host_confirmed` | `confirmed` | Core transition after guest phone OK. Set `confirmedAt`, send booking confirmation email, apply inventory lock via status. |
| `host_confirmed` | `cancelled` | Guest declined after host confirmed. |
| `host_confirmed` | `pending` | Admin undo / mistake? → **Allow once** but log; simpler: disallow undo and force admin to cancel + guest re-book. Plan recommendation: **NO rollback transitions** (simpler, clean audit trail). |
| `confirmed` | `paid` | **DO NOT allow Admin to set `paid` via this endpoint.** Payment status is ONLY settable via the payments success callback. So if `status === 'confirmed'` and Admin tries to PATCH to `paid`, return a 400 explaining to use the payment flow. |
| `confirmed` | `cancelled` | Guest backed out verbally before paying. Inventory lock is released. |
| `paid` | `cancelled` | Admin can cancel paid booking (e.g., property emergency). Triggers the refund flow UI later (NOT implemented here; just set status + allow refund step to pick it up). Inventory lock released. |
| `paid` | `completed` | Admin action ONLY after checkout date passes. Guard: `today >= checkOutDate`. |
| `rejected` | anything | NO transitions out of terminal status. Same for `cancelled`, `completed`. |

For transitions that "touch" a reason field:
- Decide ONE canonical free-text field to store status-change reasons (recommend using the existing `statusReason` everywhere, since `responseReason` was host-specific and we're removing host response). Set `responseReason` to deprecated / ignored for admin writes. `respondedAt` can become unused or repurposed as `statusChangedAt` if needed. Plan: keep fields in DB for backward compatibility, but only WRITE to `statusReason` and new specific timestamp fields (`hostConfirmedAt`, `confirmedAt`, `paidAt`, etc.)

#### 5d. Admin Service DTOs + Validation

- Create Zod schemas in `admin.validation.ts`:
  - `adminBookingListQuerySchema` (mirrors the filters above)
  - `adminBookingParamsSchema` (bookingId as ObjectId string)
  - `adminBookingStatusPatchSchema` (`status` + optional `reason`)
- Export service-level types for Admin booking list/detail/status.
- In `admin.service.ts` add:
  - `listBookingsForAdmin(query)`
  - `getBookingForAdmin(bookingId)` → populates everything detailed in 5b.
  - `patchBookingStatusForAdmin(bookingId, { status, reason })` → implements strict transition matrix above. Sets appropriate timestamps, sends confirmation email for `confirmed` transition, releases / locks inventory via the status itself (the lock is implicit via the overlap check counting `confirmed`+`paid`).

### Step 6: Update Payments Gating + Paid Transition Stamp

**Files:**
- `src/modules/payments/payments.service.ts`
- `src/modules/payments/payments.validation.ts` (if status enum duplicated here)
- Any payments doc / openapi.yaml

**What to do:**

1. In `ensureGuestReservationPayable`, change the payable check from:
   - `status !== 'accepted' → not payable`
   → to:
   - `status !== 'confirmed' → not payable`
2. After successful payment callback / confirmation inside payments create flow:
   - `reservation.status = 'paid'`
   - `reservation.paidAt = new Date()`
   - `await reservation.save()`
3. Audits: Make sure payment flow still validates pricing snapshot fields, currency, nights, subtotal all still non-null (same check as today).
4. Idempotency: If the same payment confirm is retried, don't error if status already = `paid` and `paidAt` matches. Simply return the same result. This protects against duplicate webhook calls.

### Step 7: Audit Every Cross-Module Reference to Old Status Names

Listed in the Scope table. Walk through each and update:

1. Overlap checks (booking creation, Admin confirm step when locking) → `['confirmed', 'paid']`
2. Calendar availability query (guest property details) → same statuses
3. Unit deletion guard → `['confirmed', 'paid']`
4. Guest dashboard upcoming → `['confirmed', 'paid']`
5. Host dashboard upcoming booking count → remove metric OR replace with property revenue/occupancy metric later (this plan does not require it).
6. Reviews gating → reviews allowed only after `completed`.

Because the reservation model `status` field controls everything, the grep list for `accepted` in the whole `src/` tree is the checklist for Step 7 work items.

### Step 8: Guest Booking Status Labels + UI Contract

Do not change APIs only to rename labels. But document in this section what each status means to the Guest dashboard:

| Status shown to Guest | UI Label | Guest-facing description | CTA shown |
|------------------------|----------|---------------------------|-----------|
| `pending` | "Awaiting Confirmation" or "Under Review" | Your booking is being reviewed by our team. We will contact you shortly. | None except Cancel |
| `host_confirmed` | "Awaiting Confirmation" or "Under Review" | Same — internal step, hide from guest or use same label. Do NOT expose internal host_contacted step to guests to avoid confusion. | None except Cancel |
| `confirmed` | "Confirmed — Payment Pending" | Great news! Your booking is confirmed. Complete your payment to secure your stay. | **Pay Now** button → payments checkout |
| `paid` | "Upcoming Stay" / "Paid" | Your booking is fully paid. We look forward to welcoming you! | View itinerary / Cancel (if before check-in, admin-processed) |
| `rejected` | "Declined" | Unfortunately, we were unable to confirm this booking. Reason: [statusReason if available] | None |
| `cancelled` | "Cancelled" | This booking has been cancelled. Reason: [statusReason if available] | None |
| `completed` | "Completed" | We hope you had a wonderful stay! Leave a review. | Review CTA (handled in reviews step) |

Recommended simplification for Guest: `pending` and `host_confirmed` are both presented to the Guest as the same generic "Under Review — we will contact you". This hides the internal phone-sequence state machine from the Guest UX (they don't need to know if admin has called the host yet). If the product team wants to expose the step later, the backend already emits the correct status so frontend can decide.

### Step 9: API Documentation Updates

**Files to update/create:**

1. **`src/docs/openapi.yaml`**
   - Update `ReservationStatus` enum (or wherever booking status is defined) to the new 7 values.
   - Update all request/response schemas that reference statuses:
     - `GuestBookingListResponse`
     - `GuestBookingDetailResponse`
     - `CreateBookingRequest` / response (statuses in example fields)
     - Host reservation schemas — REMOVE those paths entirely from OpenAPI since the endpoints are removed: `/host/reservations`, `/host/reservations/{id}`, `/host/reservations/{id}/respond`, `/host/reservations/{id}/status`.
   - Add NEW Admin booking paths + schemas:
     - `GET    /admin/bookings` → list with filters
     - `GET    /admin/bookings/{bookingId}` → detail with host/guest contact
     - `PATCH  /admin/bookings/{bookingId}/status` → status transition body + strict allowed transitions in the description text
   - Add NEW fields: `paidAt`, `hostConfirmedAt`, `confirmedAt` to `Reservation` schema if exposed.

2. **`docs/api/guest/guest-bookings.md`**
   - Rewrite lifecycle section with the 7 statuses.
   - Update the allowed guest operations (which statuses can cancel from).
   - Update the Status UI label table from Step 8.
   - Add a section explaining that after "Confirmed — Payment Pending", the Guest pays through the payments flow (link to guest-payments.md).

3. **NEW: `docs/api/admin/admin-bookings.md`**
   - Purpose: Admin-mediated booking lifecycle reference.
   - Sections:
     1. Overview: Admin calls host → calls guest → drives the status machine.
     2. Endpoint catalog: 3 endpoints (list/detail/patch-status).
     3. Required headers: Authorization (admin JWT), Content-Type.
     4. Filters for list: each filter explained.
     5. Detail view: what contact fields are shown for host + guest.
     6. Status transition matrix: full table like Step 5c.
     7. Examples:
        - Example request/response for list.
        - Example detail response.
        - 3 PATCH examples: host_confirmed → confirmed, pending → rejected with reason, paid → completed.
     8. Notes on inventory locking (confirmed + paid lock inventory).
     9. Notes on email trigger (confirmed sends confirm email).

4. **`docs/api/host/host-reservations.md`**
   - Mark file as DEPRECATED. Replace content with: "Host reservation management has been retired. All booking lifecycle decisions are now handled by the Admin. See admin-bookings.md. Hosts still own property/unit/calendar/pricing content via the regular Host APIs."
   - Or remove the file entirely if nothing else links to it. Check cross-references first.

5. **`docs/api/guest/guest-payments.md` / `docs/api/payments/*` if separate doc tree exists**
   - Update payable status to `confirmed`.
   - Note that payment success moves booking to `paid` and stamps `paidAt`.
   - Note idempotency behavior.

### Step 10: Test Plan

**Existing test files to update / run (from tests/):**

- `tests/guest-step-2.test.ts` → this is the booking engine test. Update:
  - Remove any host-respond scenarios (no longer exist).
  - Add scenarios for:
    - Admin list/detail via admin routes (mock admin auth).
    - Admin status transitions matrix (each row of Step 5c table as its own `it()` block).
    - Overlap rule: `confirmed` + `paid` blocks, `pending` + `host_confirmed` doesn't.
    - Guest cancel allowed from `pending`, `host_confirmed`, `confirmed`; blocked from `paid`.
    - Payment success: `confirmed` → `paid`, `paidAt` stamped, idempotency OK on retry.
- `tests/host-reservation-details.test.ts` → Mark obsolete or delete the reservation-specific parts (host contact detail for host self-serve is gone). Keep any shared models/util tests that pass through.
- `tests/guest-hardening.test.ts` → ensure booking ownership still works for Guest-only detail access, and that a Guest CANNOT set status directly (no endpoint for it).
- NEW: `tests/admin-bookings.test.ts` if we want dedicated admin booking tests that mirror admin-commission.test.ts and admin-homepage-curation.test.ts patterns.
- Run `npm run test` + `npm run typecheck` before marking step done.

### Step 11: One-Off Data Migration Note (for existing deployments)

If there is already a live DB with records in `accepted` status:

- One-time script: update all `status = 'accepted'` → `status = 'confirmed'` in the `reservations` collection.
- `accepted` no longer exists in enum; Mongoose will otherwise reject reads/writes to those documents (or mark them as invalid).
- For documents currently in `respondedAt` set (because host accepted them): stamp them with `confirmedAt = respondedAt` (clean history, no data loss).
- Keep `respondedAt` but stop writing to it going forward.
- If there are test data fixtures using `accepted`, update all fixtures to `confirmed` or other correct statuses.

## Files Affected Summary (At A Glance)

### Modified / Deleted
- `src/modules/reservations/reservation.model.ts` — status enum + new timestamps
- `src/modules/reservations/reservation.service.ts` — DELETE host-only exports, MOVE shared to bookings/shared
- `src/modules/reservations/reservation.controller.ts` — DELETE host-only controller exports
- `src/modules/reservations/reservation.validation.ts` — DELETE host-only schemas, keep/migrate shared
- `src/modules/host/host.routes.ts` — DELETE /reservations/* routes lines 397–424 + imports on lines 81–82
- `src/modules/bookings/booking.service.ts` — update status gating, overlap rules, cancel allowed states
- `src/modules/bookings/booking.validation.ts` — status enum in list query filter (update values)
- `src/modules/guest/guest.service.ts` — dashboard upcoming filter
- `src/modules/payments/payments.service.ts` — payable = confirmed; on success → paid + paidAt
- `src/modules/properties/*` (calendar / unit deletion guard) — `accepted` → confirmed/paid
- `src/modules/reviews/reviews.service.ts` (if needed) — tighten gating
- `src/modules/admin/admin.routes.ts` + `.controller.ts` + `.service.ts` + `.validation.ts` — NEW admin booking APIs
- `src/docs/openapi.yaml` — enum values + new admin paths + delete host paths
- `docs/api/guest/guest-bookings.md` — rewrite lifecycle
- `docs/api/admin/admin-bookings.md` — NEW file
- `docs/api/host/host-reservations.md` — deprecate / remove
- `docs/api/guest/guest-payments.md` or payments equivalent — update payable status
- `tests/guest-step-2.test.ts`, `tests/host-reservation-details.test.ts` — update / prune

### New Files
- `src/modules/reservations/reservations.shared.ts` (optional — if consolidating shared helpers instead of leaving them spread across booking + reservation service)
- `docs/api/admin/admin-bookings.md`
- (Potentially) `tests/admin-bookings.test.ts`

## Success Criteria / Verification Checklist

When implementation is done, verify EACH item:

- [ ] TypeScript compiles cleanly: `npm run typecheck` — no errors.
- [ ] Jest passes: `npm run test` — no regressions.
- [ ] In Admin portal (manual test via Postman / Swagger):
  - [ ] Admin booking list returns pending bookings first (sorted by `createdAt: -1` default).
  - [ ] Admin booking detail returns host.phone and guest.phone (the critical info for the phone workflow).
  - [ ] Admin can PATCH pending → host_confirmed → confirmed → (guest pays) → paid → completed.
  - [ ] Admin PATCH status correctly rejects invalid transitions (e.g., cannot go completed before checkout).
  - [ ] Admin cannot manually set booking to `paid` via status PATCH; must go through payment flow.
- [ ] In Guest flow:
  - [ ] Guest POST booking returns `pending`.
  - [ ] Guest dashboard shows "Under Review" for pending/host_confirmed, "Confirmed — Payment Pending" for confirmed, "Paid" / "Upcoming" for paid.
  - [ ] Guest CAN cancel from pending/host_confirmed/confirmed.
  - [ ] Guest CANNOT cancel from paid.
  - [ ] Guest pay button only appears when status is `confirmed`.
  - [ ] After successful payment booking shows `paid` + `paidAt` is set.
- [ ] Inventory / overlap:
  - [ ] Two separate guests can create `pending` bookings on the same dates without blocking each other.
  - [ ] Once ONE booking reaches `confirmed`, no NEW bookings can be created on those dates (overlap check fails).
  - [ ] Unit cannot be deleted while it has `confirmed` or `paid` bookings.
- [ ] Documentation:
  - [ ] openapi.yaml has all new status values + admin booking endpoints + no stale host reservation endpoints.
  - [ ] guest-bookings.md reflects new lifecycle.
  - [ ] admin-bookings.md exists and explains the phone workflow with examples.
  - [ ] host-reservations.md is deprecated or removed with clear migration note.

## Risk / Edge Cases To Watch

1. **Race between Admin confirmation of two different `pending` bookings on the same unit/dates:** Use optimistic locking OR make the confirmed→paid and confirmed status save run the overlap check inside a transaction (MongoDB transactions on replica set). If transactions not available, run overlap check immediately before save AND as a DB-level `countDocuments` with the new status set applied. Plan: run `ensureNoConfirmedOrPaidReservationOverlap(unitId, checkIn, checkOut)` inside the Admin status PATCH handler right before saving, same pattern used in old `respondHostReservation`.

2. **Double-payment on `confirmed` booking:** Payments flow MUST already guard with idempotency keys / payment transaction unique-per-booking. Ensure second payment attempt returns 400 with "already paid" friendly message. Also ensure the status update to `paid` only happens once atomically.

3. **Admin mistakenly clicks `confirmed` instead of `host_confirmed`:** Strategy: No rollback transitions. If admin makes a mistake, they must cancel the booking and ask the guest to re-book. This trade-off favours audit trail simplicity over operational flexibility. If product later requires undo, introduce explicit `pending ← host_confirmed ← confirmed` rollbacks with audit logs. The plan intentionally forbids them in v1 to keep the matrix small.

4. **`rejected` vs `cancelled` semantics for Admin:** Both are terminal states. Educate Admin UI to use:
   - **Reject** → only from `pending`, when the HOST says no on the phone call.
   - **Cancel** → all other terminal-abort flows (guest bails, administrative problem, cannot reach either party after timeout).

5. **Host reservation visibility must remain intact:** Host mutation routes are removed, but the host still needs read access to reservation data so they know which property/unit is booked and by whom. Any Host dashboard or Host reservation screen should use the read-only reservation endpoints instead of relying on the old host-managed workflow.

---

End of plan.
