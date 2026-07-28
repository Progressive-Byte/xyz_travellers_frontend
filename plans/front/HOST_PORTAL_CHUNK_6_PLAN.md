# XYZ Travellers Host Portal Step 6 Plan

## Step Name

Chunk 6: Units, Calendar, And Pricing

## Purpose

This document covers only the sixth implementation step from `HOST_PORTAL_CHUNKED_PLAN.md`.

It does not plan the full host portal.

It only plans the operational listing layer that lets an approved host create and manage property units, configure stay rules, block and unblock dates, and set unit pricing so a property can move closer to being actually bookable.

## Objective

Build the next real property-management routes inside the host portal so an approved host can:

- create one or more units under a property
- edit unit details such as capacity and room counts
- activate or deactivate units
- configure minimum and maximum stay rules
- block and unblock dates in a unit calendar
- view unit availability data when the API provides it
- manage pricing values for each unit

This step should introduce the unit manager, pricing setup, and calendar management routes that continue the add-property workflow after media.

This step should not try to build property verification uploads, final review and submission, commercial business linkage, reservations, messages, or other operations pages yet.

## Why This Is Step 6

Chunk 1 created the reusable host shell.

Chunk 2 created the onboarding split between non-host users and approved hosts.

Chunk 3 added host profile and payout setup so the portal has real account depth.

Chunk 4 created the listing draft foundation for basics and location.

Chunk 5 added property media management so listings can carry real visual content.

Now the listing workflow needs the operational inventory layer, because a property still is not functionally bookable until it has units, stay rules, blocked-date handling, and pricing.

This step matters now because:

- media alone does not make a listing operable for bookings
- units are the first place where the host defines what is actually being sold
- pricing and calendar rules are direct prerequisites for later submission confidence
- later verification and review flows should validate a listing that already has real operational setup
- the host needs the workflow to move from `nice-looking draft` into `bookable inventory configuration`

Without this step:

- the listing workflow still stops before bookability
- hosts cannot define rooms or inventory for a property
- submission readiness would still be weak because pricing and stay rules are missing
- later verification and submit steps would have to validate an incomplete operating model

So this step exists to turn the listing workflow from `visual listing draft` into `operationally configured listing`.

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
- `components/host/HostShell.tsx`
- `components/host/HostSidebar.tsx`
- `components/host/HostRouteGate.tsx`
- `components/host/HostDashboardShell.tsx`
- property listing and media components inside `components/host/properties/*`
- host navigation metadata in `components/host/hostNavigation.ts`
- property foundation and media helpers in `lib/host.ts`

Current behavior:

- approved hosts can open the real portal
- the listing workflow already supports basics, location, and media
- the property editor stepper already suggests later workflow stages such as units and pricing
- hosts can create draft listings and move into media management

Current limitation:

- there is no `app/host/properties/[propertyId]/units/page.tsx`
- there is no `app/host/properties/[propertyId]/calendar/page.tsx`
- there is no `app/host/properties/[propertyId]/pricing/page.tsx`
- there are no unit-specific host components yet
- there are no pricing or calendar management components yet
- there are no `lib/host.ts` helpers yet for host units, calendar rules, blocked dates, or pricing
- the add-property flow still cannot configure actual inventory or bookability rules

## Scope

This step includes:

- building the dedicated property units route
- building the dedicated property pricing route
- building the dedicated property calendar route
- fetching property units
- creating units
- editing units
- deleting units
- toggling unit active state when supported by the API
- loading unit pricing
- saving unit pricing
- loading unit calendar rules
- saving unit calendar rules
- blocking dates
- unblocking dates
- loading unit availability data if available
- connecting the media workflow forward into units, pricing, and calendar stages
- showing clear empty, loading, error, and populated states across all three route families

This step does not include:

- property verification document upload
- final property review and submit flow
- admin-facing moderation states
- business selection and commercial document linkage
- reservations, messages, reviews, earnings, or payout history
- guest-facing booking UI

## Product Behavior Model For This Step

This step applies only to approved hosts inside the portal.

### Units expectation

Behavior:

- host can open a units workspace for one property
- host can see whether the property has zero, one, or multiple units
- host can create at least one unit so the listing has real inventory
- host can edit capacity and room-related fields for existing units
- host can remove units when they are no longer needed

### Pricing expectation

Behavior:

- host can select a unit and view its pricing data
- host can save pricing values for that unit
- pricing should remain tied to a specific unit, not to the whole property page in a vague way

### Calendar expectation

Behavior:

- host can select a unit and view its calendar rules
- host can update minimum and maximum stay settings when supported
- host can block and unblock dates intentionally
- the UI should make it clear which unit is being configured

### Availability expectation

Behavior:

- if the API returns availability data, the host can see it in a lightweight preview
- the UI should treat availability preview as supportive context, not the main control surface

Important rule:

- this chunk creates the `operational inventory and bookability` layer, not the final property submission system
- it should move the product from `media-ready listing` to `configured listing`

## Design Direction

This units, pricing, and calendar workflow must follow `UI_REDESIGN_PLAN.md` and stay visually aligned with the host shell language already established in the portal.

### Visual principles

- premium editorial-travel feel, not a generic property management dashboard
- clear data-entry hierarchy for dense operational forms
- soft surfaces, subtle borders, and restrained lime emphasis
- unit cards and control panels should feel tidy and readable
- calendars and pricing cards should feel precise without becoming enterprise-heavy

### UX principles

- the host should always know which property and which unit is currently being configured
- units should feel like concrete inventory, not abstract technical records
- pricing and calendar flows should stay focused and avoid mixing too many concerns into one screen
- empty states should guide the host into creating the first usable unit
- future verification and submit steps should remain visible as upcoming, but not distract from this chunk

## Route Coverage In This Step

This step needs to support:

- `/host/properties/[propertyId]/media`
- `/host/properties/[propertyId]/units`
- `/host/properties/[propertyId]/pricing`
- `/host/properties/[propertyId]/calendar`

Behavior rules:

- `/host/properties/[propertyId]/units`:
  - logged out -> redirect to auth
  - non-host -> redirect to onboarding
  - approved host -> allow
- `/host/properties/[propertyId]/pricing`:
  - logged out -> redirect to auth
  - non-host -> redirect to onboarding
  - approved host -> allow
- `/host/properties/[propertyId]/calendar`:
  - logged out -> redirect to auth
  - non-host -> redirect to onboarding
  - approved host -> allow

These routes should use the same shared host portal gate introduced in Chunk 2.

## File Plan

### New files

- `app/host/properties/[propertyId]/units/page.tsx`
- `app/host/properties/[propertyId]/pricing/page.tsx`
- `app/host/properties/[propertyId]/calendar/page.tsx`
- `components/host/properties/units/HostPropertyUnitsPage.tsx`
- `components/host/properties/units/HostPropertyUnitsList.tsx`
- `components/host/properties/units/HostPropertyUnitCard.tsx`
- `components/host/properties/units/HostPropertyUnitForm.tsx`
- `components/host/properties/pricing/HostPropertyPricingPage.tsx`
- `components/host/properties/pricing/HostPropertyPricingForm.tsx`
- `components/host/properties/pricing/HostPropertyPricingUnitSelector.tsx`
- `components/host/properties/calendar/HostPropertyCalendarPage.tsx`
- `components/host/properties/calendar/HostPropertyCalendarRulesForm.tsx`
- `components/host/properties/calendar/HostPropertyBlockDatesForm.tsx`
- `components/host/properties/calendar/HostPropertyBlockedDatesList.tsx`
- `components/host/properties/calendar/HostPropertyCalendarUnitSelector.tsx`

### Updated files

- `components/host/hostNavigation.ts`
- `components/host/properties/HostPropertyEditorShell.tsx`
- `components/host/properties/hostPropertyEditor.ts`
- `components/host/properties/media/HostPropertyMediaPage.tsx`
- `lib/host.ts`

### Optional shared helpers

- `components/host/properties/units/hostPropertyUnits.ts`
- `components/host/properties/pricing/hostPropertyPricing.ts`
- `components/host/properties/calendar/hostPropertyCalendar.ts`

If unit-shape normalization, selected-unit state, or stay-rule mapping grows, extract them into small local helpers.

## Component Responsibilities

### `HostPropertyUnitsPage`

Responsibilities:

- load the property and its units
- handle loading, empty, error, and populated states
- coordinate unit create, update, and delete actions
- keep unit management visually aligned with the property workflow shell

### `HostPropertyUnitsList`

Responsibilities:

- render the collection of units for a property
- keep the list readable whether the property has one or several units
- support clean empty-state fallback behavior

### `HostPropertyUnitCard`

Responsibilities:

- show the unit summary clearly
- surface capacity, bedrooms, bathrooms, beds, active state, and amenities
- expose edit and delete controls in a tidy way

### `HostPropertyUnitForm`

Responsibilities:

- create and edit unit records
- validate required unit fields
- keep unit inputs practical without overbuilding advanced scheduling here

### `HostPropertyPricingPage`

Responsibilities:

- load property units and pricing data
- keep the pricing page anchored to a selected unit
- handle loading, empty, error, and saved states

### `HostPropertyPricingForm`

Responsibilities:

- edit pricing values for one selected unit
- validate currency and price fields practically
- save pricing changes clearly

### `HostPropertyPricingUnitSelector`

Responsibilities:

- let the host choose which unit's pricing is being edited
- make current context obvious

### `HostPropertyCalendarPage`

Responsibilities:

- load units, calendar rules, blocked dates, and availability context
- keep the calendar page anchored to a selected unit
- coordinate rules updates and date block/unblock actions

### `HostPropertyCalendarRulesForm`

Responsibilities:

- edit minimum and maximum stay rules
- save rules for the selected unit

### `HostPropertyBlockDatesForm`

Responsibilities:

- block or unblock dates intentionally
- keep actions focused and understandable

### `HostPropertyBlockedDatesList`

Responsibilities:

- show blocked dates clearly
- support unblock actions

### `HostPropertyCalendarUnitSelector`

Responsibilities:

- let the host choose which unit calendar is currently active
- keep unit context explicit

### `HostPropertyEditorShell`

Responsibilities after this chunk:

- keep the multi-step workflow aligned with the real route family
- treat units, pricing, and calendar as real stages rather than placeholder steps
- preserve clear upcoming distinction for verification and submission work that comes later

## API Plan

This step should extend `lib/host.ts` with unit, pricing, and calendar helpers.

### APIs used in this step

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

### Minimum recommended API scope for this chunk

Required:

- fetch units by property
- create units
- edit units
- delete units
- fetch unit pricing
- update unit pricing
- fetch calendar rules or calendar state
- update stay rules
- block dates
- unblock dates

Optional:

- fetch unit availability preview
- fetch single-unit detail separately if it simplifies edit behavior

Guardrail:

- keep API integration focused on units, pricing, and calendar only
- do not mix verification, submission, or commercial business APIs into this chunk

## Data Model Plan

### Unit model

Frontend should be prepared to represent:

- unit id
- property id
- unit name or title
- capacity
- bedrooms
- bathrooms
- beds
- amenities
- active state
- created timestamp
- updated timestamp

### Pricing model

Frontend should be prepared to represent:

- unit id
- base price
- discounted price
- currency
- any summary note or display fields the API returns

### Calendar model

Frontend should be prepared to represent:

- unit id
- minimum stay
- maximum stay
- blocked dates
- unblock action target
- any rule notes returned by the backend

### Availability model

Frontend should be prepared to represent:

- currently blocked dates
- lightweight availability preview data when returned

## Workflow Structure For This Chunk

Chunk 6 is still one official chunk from `HOST_PORTAL_CHUNKED_PLAN.md`, but it is wide enough that implementation should be executed in internal phases.

### Internal Phase A: Units foundation

Focus:

- property units route
- units list
- create/edit/delete units
- unit selection model for later pricing and calendar pages

Reason:

- pricing and calendar both depend on units existing first

### Internal Phase B: Pricing setup

Focus:

- pricing route
- selected-unit pricing editor
- save and reload pricing data cleanly

Reason:

- pricing should build on real units, not placeholder inventory

### Internal Phase C: Calendar rules and blocked dates

Focus:

- calendar route
- minimum and maximum stay rules
- block and unblock dates
- optional availability preview

Reason:

- calendar controls are easiest to reason about after units and pricing context already exist

Important rule:

- keep these as internal execution phases inside the same official `Chunk 6`
- do not renumber them into a new top-level chunk order unless the user explicitly asks for separate sub-chunk files

## Units Behavior Plan

### Units page behavior

- load the property and its units on page open
- encourage first-unit creation when no units exist yet
- allow one or more units to be configured under a property
- reflect saved unit changes without forcing the host out of the page

### Unit creation behavior

- support a clear first-unit create path
- keep form validation practical
- prevent duplicate submissions while requests are in flight

### Unit edit behavior

- allow editing of supported unit fields
- keep item-level save feedback clear
- keep delete actions intentional and understandable

## Pricing Behavior Plan

### Pricing page behavior

- require at least one unit to exist before pricing can be configured meaningfully
- show a selected unit clearly
- load pricing for that unit and save back to the correct endpoint

### Pricing save behavior

- disable save while requests are in flight
- show success feedback clearly
- show direct recovery messaging on failure

## Calendar Behavior Plan

### Calendar page behavior

- require at least one unit to exist before calendar configuration is meaningful
- keep a visible selected-unit context
- show current stay rules and blocked dates
- make block and unblock actions easy to follow

### Rules behavior

- support minimum and maximum stay settings when the API returns them
- keep the form focused on practical control inputs

### Blocked date behavior

- allow intentionally blocking dates
- allow intentionally unblocking dates
- keep the UI honest about the dates currently restricted

### Availability preview behavior

- show lightweight preview only if it is returned reliably by the API
- keep it secondary to the actual rule and block controls

## Status And Editability Plan

### Route status treatment

The UI should work cleanly with:

- `draft`
- `rejected`
- `submitted`
- `approved`

### Editability rule

For this chunk:

- `draft` should be editable
- `rejected` should be editable again
- `submitted` and `approved` may be viewable or restricted depending on API behavior

Guardrail:

- keep unsupported post-submission edit states honest
- do not imply that every approved or submitted listing can still be fully reconfigured if the backend does not allow it

## Empty State Plan

### Units empty state goals

- explain that the property has no units yet
- point directly to the first unit creation action
- make it clear that pricing and calendar steps depend on units

### Pricing empty state goals

- explain that pricing needs at least one unit first
- point back to units when the property has no inventory

### Calendar empty state goals

- explain that stay rules and blocked dates are unit-based
- point back to units when there is nothing to configure yet

## Content Plan

### Units page header

Recommended content:

- badge like `Property Units`
- title focused on listing inventory
- short explanation that units define the actual bookable structure of the property

### Pricing page header

Recommended content:

- badge like `Unit Pricing`
- title focused on rates and currency
- short explanation that pricing is configured per unit

### Calendar page header

Recommended content:

- badge like `Unit Calendar`
- title focused on stay rules and blocked dates
- short explanation that rules and date restrictions are configured per unit

### Save feedback content

Recommended patterns:

- `Unit saved successfully`
- `Pricing updated successfully`
- `Calendar rules updated successfully`
- `Blocked dates updated successfully`
- `We couldn't save these unit changes right now`

## Layout Structure

Suggested units route composition:

1. units route page
2. host route gate in portal mode
3. host shell
4. property-aware page header block
5. unit create / edit panel
6. units list or empty state

Suggested pricing route composition:

1. pricing route page
2. host route gate in portal mode
3. host shell
4. property-aware page header block
5. selected-unit control
6. pricing form or empty state

Suggested calendar route composition:

1. calendar route page
2. host route gate in portal mode
3. host shell
4. property-aware page header block
5. selected-unit control
6. rules form
7. block-date form
8. blocked-dates list or empty state
9. optional availability preview

## Validation Plan

### Unit validation

- require a unit name if the API expects it
- require practical capacity and room fields only as far as the backend requires
- keep unit creation approachable instead of over-validating early

### Pricing validation

- require base price
- validate numeric values practically
- require currency if the backend expects it

### Calendar validation

- keep stay-rule validation practical and numeric
- ensure blocked-date actions use valid dates
- keep unblock actions scoped to known blocked entries when possible

Guardrail:

- validation should protect obvious errors without turning operational setup into a bureaucratic form sequence

## Styling Plan

### Units styling

- use clear inventory cards or rows
- keep each unit easy to scan
- make active state readable without shouting

### Pricing styling

- keep the pricing form focused and calm
- make selected-unit context obvious
- avoid over-decorating simple price controls

### Calendar styling

- keep rule controls and blocked-date actions visually separate
- avoid building a heavy calendar application if the API only needs rules plus block/unblock actions
- use availability preview only as supporting context

### State styling

- loading states should match existing host portal skeleton patterns
- empty states should feel guided and action-oriented
- error states should explain recovery paths cleanly

## Step-By-Step Build Checklist

### Part 1: API helper preparation

- add unit types to `lib/host.ts`
- add pricing types to `lib/host.ts`
- add calendar and blocked-date types to `lib/host.ts`
- add fetch/create/update/delete helpers for units
- add fetch/update helpers for pricing
- add fetch/update/block/unblock helpers for calendar

### Part 2: Stepper and workflow updates

- update property editor step framing so units, pricing, and calendar become real workflow stages
- add clear path forward from media into units

### Part 3: Units route

- create `/host/properties/[propertyId]/units`
- build loading, empty, error, and populated states
- support create/edit/delete unit actions

### Part 4: Pricing route

- create `/host/properties/[propertyId]/pricing`
- build unit selector behavior
- build pricing form and saved-state feedback

### Part 5: Calendar route

- create `/host/properties/[propertyId]/calendar`
- build rules form
- build block and unblock actions
- show blocked dates and optional availability preview

### Part 6: Polish

- tune selected-unit clarity across pricing and calendar pages
- tune inventory readability and empty states
- verify the new operational routes feel like a natural continuation of the add-property workflow

## Risks

### Risk 1: Treating Chunk 6 like one giant undifferentiated feature

Units, pricing, and calendar are closely related, but still distinct enough to become messy if planned as one flat blob.

Guardrail:

- keep one official chunk file, but execute it in internal phases: units first, pricing second, calendar third

### Risk 2: Building pricing or calendar before units are stable

Those flows depend on a real selected unit.

Guardrail:

- make units the first internal phase and treat it as the dependency for the rest of the chunk

### Risk 3: Overbuilding a full booking calendar UI too early

The API surface may only require stay rules and block/unblock actions, not a complete calendar application.

Guardrail:

- stay close to the actual API controls and keep availability preview lightweight

### Risk 4: Unit context becomes unclear across pages

Hosts can get lost if pricing and calendar screens do not make the selected unit obvious.

Guardrail:

- keep selected-unit context explicit in both page header area and selector controls

### Risk 5: Verification and submission concerns bleed into this chunk

It is tempting to start validating final submission readiness here, but that belongs in the next chunk.

Guardrail:

- keep this chunk focused on operational setup only
- reserve validation of submission completeness for the verification and submit chunk

## Acceptance Criteria

This step is complete when:

1. `/host/properties/[propertyId]/units` exists and approved hosts can manage units
2. `/host/properties/[propertyId]/pricing` exists and approved hosts can configure unit pricing
3. `/host/properties/[propertyId]/calendar` exists and approved hosts can configure stay rules and blocked dates
4. host can create and edit at least one unit for a property
5. pricing saves and reloads correctly for the selected unit
6. blocked dates update correctly for the selected unit
7. the UI keeps selected-unit context clear on pricing and calendar routes
8. the units, pricing, and calendar stages feel connected to the existing property workflow
9. the UI remains aligned with the host shell and redesign language
10. `npm.cmd run build` passes after implementation

## Verification Plan

After implementation:

1. open `/host/properties/[propertyId]/units` as an approved host and verify loading, empty, error, and populated states
2. create a unit and verify it reloads correctly in the units list
3. edit a unit and verify the saved values reload correctly
4. delete a unit and verify the units list updates correctly
5. open `/host/properties/[propertyId]/pricing` and verify selected-unit context works clearly
6. update pricing values and verify they reload correctly
7. open `/host/properties/[propertyId]/calendar` and verify rules, blocked-date actions, and blocked-date display behave correctly
8. if availability preview is included, verify it loads without taking over the page
9. verify non-host users still cannot access units, pricing, or calendar routes
10. verify the path from media into units, pricing, and calendar feels natural
11. run `npm.cmd run build`

## Final Recommendation For Step 6

Treat this step as an `inventory, pricing, and calendar configuration` step, not as the final submission layer.

If this is done well:

- the host workflow moves from listing presentation into real bookability setup
- later verification and submission steps can validate a much more complete listing
- the add-property system starts to look like a real hosting workspace instead of a staged form sequence
