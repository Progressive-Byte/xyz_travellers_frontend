# XYZ Travellers Host Portal Step 4 Plan

## Step Name

Chunk 4: Properties List And Draft Creation

## Purpose

This document covers only the fourth implementation step from `HOST_PORTAL_CHUNKED_PLAN.md`.

It does not plan the full host portal.

It only plans the first real listing-management layer that lets an approved host view properties, start a draft, and edit the early draft sections for basics and location.

## Objective

Build the first real property-management routes inside the host portal so an approved host can:

- view their properties
- start a new property draft
- open an existing draft or rejected property
- edit the first foundation steps of a listing

This step should introduce the `Properties` index, the `Add Property` start route, and the first version of the draft editor for basics and location.

This step should not try to build media management, units, pricing, calendar, verification upload, business document selection, or final property submission yet.

## Why This Is Step 4

Chunk 1 created the reusable host shell.

Chunk 2 created the onboarding split between non-host users and approved hosts.

Chunk 3 added host profile and payout setup so the portal has real account depth.

Now the host portal needs the first true listing workflow, because the backend product is mostly centered around property creation and management.

This step matters now because:

- the sidebar already implies a broader portal, but listings are still missing
- `Add Property` is the main forward path for an approved host
- later media, units, pricing, and verification flows all depend on a real property draft existing first
- the dashboard becomes more actionable when its quick actions can lead into a real property workflow

Without this step:

- hosts can enter the portal, but cannot create listings
- the `Properties` and `Add Property` areas remain dead or placeholder navigation
- later chunks have no stable property draft foundation to build on
- the portal still feels like an account shell more than a hosting workspace

So this step exists to turn the host portal into a real listing-creation workspace, starting from the draft foundation only.

## Current Starting Point

Right now the project already has:

- `app/host/dashboard/page.tsx`
- `app/host/onboarding/page.tsx`
- `app/host/profile/page.tsx`
- `app/host/payouts/page.tsx`
- `components/host/HostShell.tsx`
- `components/host/HostSidebar.tsx`
- `components/host/HostRouteGate.tsx`
- `components/host/HostDashboardShell.tsx`
- host navigation metadata in `components/host/hostNavigation.ts`
- host dashboard, onboarding, profile, and payout helpers in `lib/host.ts`

Current behavior:

- approved hosts can enter the real portal
- onboarding is separated from portal routes
- profile and payout setup are live routes
- dashboard can already surface setup reminders

Current limitation:

- there is no `app/host/properties/page.tsx`
- there is no `app/host/properties/new/page.tsx`
- there is no `app/host/properties/[propertyId]/edit/page.tsx`
- `Properties` and `Add Property` are still not live in host navigation
- there are no property API helpers yet in `lib/host.ts`
- there is no draft editor shell for listing creation
- dashboard quick actions cannot yet lead into a real property workflow

## Scope

This step includes:

- building the properties index page
- building the add-property start route
- building the draft property edit route for basics and location
- fetching host properties
- creating a draft property
- loading a property draft or rejected property into the editor
- patching draft property basics and location fields
- fetching host reference data needed by the first editor steps
- making `Properties` and `Add Property` live host destinations
- adding dashboard quick links or CTAs into the new property workflow

This step does not include:

- media manager
- cover image selection
- video URL management
- units manager
- pricing setup
- calendar rules
- availability preview
- verification document upload
- final review and submit flow
- full business selector and business-document attachment flow

## Product Behavior Model For This Step

This step applies only to approved hosts inside the portal.

### Properties index expectation

Behavior:

- host can open a listings overview page
- host can see empty, loading, error, and populated states
- host can open an existing draft or rejected property for editing
- host can start a new draft property

### Draft creation expectation

Behavior:

- host can begin the add-property flow from `/host/properties/new`
- the flow should create a real draft property record
- after creation, the host should land in the draft editor for that property

### Draft editing expectation

Behavior:

- host can edit the first sections of the draft
- the editor should focus on basics and location only in this chunk
- rejected properties should be editable again
- the UI should communicate that later steps exist, even if they are not fully active yet

Important rule:

- this chunk creates the property draft foundation, not the full submission flow
- it should move the product from `portal shell` to `real listing workflow`

## Design Direction

This property workflow must follow `UI_REDESIGN_PLAN.md` and stay visually aligned with the host shell language already established in the portal.

### Visual principles

- premium editorial-travel feel, not a generic CMS
- clear page hierarchy and calm form rhythm
- soft borders, strong typography, and restrained lime emphasis
- structured but breathable data-entry layout
- status pills should be readable and compact

### UX principles

- the add-property flow should feel guided, not like one long uncontrolled form
- the properties index should help hosts understand listing status quickly
- saving draft work should feel safe and predictable
- the editor should clearly show progress, even though only the first steps are active
- rejected property editing should feel like a recovery path, not an error dead-end

## Route Coverage In This Step

This step needs to support:

- `/host/dashboard`
- `/host/properties`
- `/host/properties/new`
- `/host/properties/[propertyId]/edit`

Behavior rules:

- `/host/properties`:
  - logged out -> redirect to auth
  - non-host -> redirect to onboarding
  - approved host -> allow
- `/host/properties/new`:
  - logged out -> redirect to auth
  - non-host -> redirect to onboarding
  - approved host -> allow
- `/host/properties/[propertyId]/edit`:
  - logged out -> redirect to auth
  - non-host -> redirect to onboarding
  - approved host -> allow

These routes should use the same shared host portal gate introduced in Chunk 2.

## File Plan

### New files

- `app/host/properties/page.tsx`
- `app/host/properties/new/page.tsx`
- `app/host/properties/[propertyId]/edit/page.tsx`
- `components/host/properties/HostPropertiesPage.tsx`
- `components/host/properties/HostPropertiesList.tsx`
- `components/host/properties/HostPropertyCard.tsx`
- `components/host/properties/HostPropertyStatusPill.tsx`
- `components/host/properties/HostPropertyEditorPage.tsx`
- `components/host/properties/HostPropertyEditorShell.tsx`
- `components/host/properties/HostPropertyBasicsForm.tsx`
- `components/host/properties/HostPropertyLocationForm.tsx`
- `components/host/properties/HostPropertyStartPage.tsx`

### Updated files

- `components/host/hostNavigation.ts`
- `components/host/HostDashboardShell.tsx`
- `lib/host.ts`

### Optional shared helpers

- `components/host/properties/hostPropertyEditor.ts`
- `components/host/properties/hostPropertyStatus.ts`

If draft-state logic, editor step metadata, or reference-data mapping grows, extract it into small local helpers.

## Component Responsibilities

### `HostPropertiesPage`

Responsibilities:

- fetch the host property list
- handle loading, empty, error, and populated states
- render properties inside the host shell
- expose clear actions for `Add Property` and `Edit draft`

### `HostPropertiesList`

Responsibilities:

- render status-aware property rows or cards
- surface lightweight summary fields
- support empty-state fallback cleanly

### `HostPropertyCard`

Responsibilities:

- show property title, type, ownership type, and status
- show short metadata like city or last update if available
- expose action links such as `Continue draft` or `Edit`

### `HostPropertyStatusPill`

Responsibilities:

- render compact status treatment for `draft`, `submitted`, `approved`, and `rejected`
- keep styling consistent between the list and editor

### `HostPropertyStartPage`

Responsibilities:

- introduce the add-property flow
- explain what the first editor step covers
- let the host begin draft creation
- redirect into the draft editor once a draft is created

### `HostPropertyEditorPage`

Responsibilities:

- load a property by `propertyId`
- validate that the property is editable for this chunk
- render the basics and location editor sections
- handle save/update states

### `HostPropertyEditorShell`

Responsibilities:

- provide shared property editor framing
- render page header, draft status, and visible stepper
- show current step and future-step placeholders
- keep the editor visually aligned with later add-property stages

### `HostPropertyBasicsForm`

Responsibilities:

- edit basic listing fields
- use reference data for property types and amenities
- support ownership type selection
- submit patch payload for basics

Suggested basics fields:

- property name
- description
- property type
- ownership type
- amenities

### `HostPropertyLocationForm`

Responsibilities:

- edit location and rules fields for the draft
- submit patch payload for location-related fields

Suggested location fields:

- address
- city
- country
- lat
- lng
- house rules

### `HostDashboardShell`

Responsibilities after refactor:

- keep existing dashboard loading and summary behavior
- add stronger quick links into `Add Property` and `Properties`
- optionally surface listing-focused prompts once property routes are live

Important note:

- dashboard should direct hosts into the new listing workflow
- dashboard should not replace the actual property pages

## API Plan

This step should extend `lib/host.ts` with listing foundation helpers.

### APIs used in this step

- `GET /api/v1/host/properties`
- `POST /api/v1/host/properties`
- `GET /api/v1/host/properties/:propertyId`
- `PATCH /api/v1/host/properties/:propertyId`
- `DELETE /api/v1/host/properties/:propertyId` only if lightweight draft cleanup is included
- `GET /api/v1/host/reference/property-types`
- `GET /api/v1/host/reference/amenities`
- `GET /api/v1/host/reference/commission`

### Minimum recommended API scope for this chunk

Required:

- fetch property list
- create draft property
- fetch one property by id
- patch draft property basics and location
- fetch property types
- fetch amenities
- fetch commission/reference data if it is needed for editor context

Optional:

- delete draft property

Guardrail:

- keep API integration focused on list, draft creation, and early draft editing only
- do not pull media, units, pricing, or verification APIs into this chunk

## Data Model Plan

### Properties list model

Frontend should be prepared to represent:

- property id
- property name
- status
- property type
- ownership type
- address or city summary
- updated timestamp

The list view should help the host quickly identify which listings are drafts, rejected, approved, or submitted.

### Draft property editor model

Frontend should be prepared to represent:

- name
- description
- property type
- ownership type
- amenities
- address
- city
- country
- lat
- lng
- house rules
- editable status

### Reference data model

Frontend should be prepared to represent:

- property types for select input
- amenities for multi-select or checklist input
- commission information if it helps explain listing economics early

## Editor Behavior Plan

### Add-property start route behavior

- show a short explanation of the flow
- expose a primary CTA to create a draft
- prevent duplicate accidental submissions while the draft is being created
- redirect to `/host/properties/[propertyId]/edit` after success

### Draft editor behavior

- load the property record on page open
- allow editing of supported basics and location fields
- show visible step structure even if later steps are locked or inactive
- support save/update feedback clearly
- keep rejected listings editable if the API allows it

### Save behavior

- disable save while requests are in flight
- show success feedback after patch
- show clear error states when save fails
- avoid losing local work due to route transitions or repeated submissions

## Status Plan

### List status treatment

The UI should clearly represent:

- `draft`
- `submitted`
- `approved`
- `rejected`

### Editability rule

For this chunk:

- `draft` should be editable
- `rejected` should be editable again
- `submitted` and `approved` may be viewable or restricted depending on API behavior, but this chunk should not overbuild those flows

Guardrail:

- keep unsupported edit states honest
- do not imply that full post-submission editing is already available if it is not

## Ownership And Business Guardrail

The basics form includes `ownership type`, but this chunk still comes before the dedicated businesses flow.

### Required behavior

- allow the host to choose ownership type
- persist that value in the draft
- if commercial ownership creates later dependency on business records, communicate that later steps will handle it

### Guardrail

- do not try to fully implement business linking in this chunk
- keep commercial support foundational, not complete

## Properties Index Plan

### Empty state goals

- explain that no listings exist yet
- point the host directly to `Add Property`
- make the empty state feel encouraging, not like an error

### Populated state goals

- give a quick portfolio overview
- make draft continuation obvious
- make rejected property recovery obvious
- keep the page readable even with multiple properties

## Dashboard CTA Plan

The dashboard should become more listing-oriented once property routes are live.

### CTA goals

- add direct path to `Add Property`
- add direct path to `Properties`
- connect the overview screen to the real listing workflow

### CTA approach

- add one strong listing creation CTA near the dashboard header or setup area
- keep the action compact and aligned with the existing dashboard rhythm
- avoid turning the dashboard into a second property index

## Content Plan

### Properties index header

Recommended content:

- badge like `Properties`
- title focused on listings overview
- short explanation of draft, submitted, approved, and rejected status visibility

### Add-property start header

Recommended content:

- badge like `Add Property`
- title focused on starting a new listing draft
- short explanation of the first editor steps and save-draft safety

### Editor page header

Recommended content:

- badge like `Draft Listing`
- property title or `Untitled property`
- status pill
- short guidance about current step and remaining future steps

### Save feedback content

Recommended patterns:

- `Draft created successfully`
- `Draft updated successfully`
- `We couldn't save your listing changes right now`

## Layout Structure

Suggested properties index composition:

1. properties route page
2. host route gate in portal mode
3. host shell
4. page header block
5. properties summary / CTA area
6. property list or empty state

Suggested add-property start composition:

1. add-property route page
2. host route gate in portal mode
3. host shell
4. page header block
5. start-flow explanation card
6. primary draft creation CTA

Suggested draft editor composition:

1. edit route page
2. host route gate in portal mode
3. host shell
4. property editor shell
5. visible stepper
6. basics form card
7. location form card
8. lightweight future-step preview or locked steps

## Validation Plan

### Basics validation

- require property name
- require description if the API expects it for a usable draft
- require property type
- require ownership type
- validate amenity selections only as needed

### Location validation

- require address, city, and country when the API expects them
- keep lat/lng validation practical, not overbearing
- allow house rules to be optional if the backend allows it

Guardrail:

- validation should support usable draft quality without making early drafting feel too rigid

## Styling Plan

### Properties index styling

- use premium summary cards or rows
- keep statuses easy to scan
- preserve generous but not oversized spacing

### Editor styling

- use a clear stepper or progress rail
- keep forms structured and sectioned
- make future steps visible but clearly inactive
- use consistent CTA hierarchy with the rest of the host portal

### State styling

- loading states should match host portal skeleton patterns
- empty states should feel aspirational and action-oriented
- error states should explain recovery paths cleanly

## Step-By-Step Build Checklist

### Part 1: API helper preparation

- add property list types to `lib/host.ts`
- add property reference-data types to `lib/host.ts`
- add fetch/create/get/update helpers for listing foundation flows

### Part 2: Navigation updates

- make `Properties` live in host navigation
- make `Add Property` live in host navigation
- update page metadata and labels where needed

### Part 3: Properties index page

- create `/host/properties`
- build list, empty, loading, and error states
- add actions for `Add Property` and `Continue draft`

### Part 4: Add-property start page

- create `/host/properties/new`
- explain the flow
- create a draft property on action
- redirect into the editor route

### Part 5: Draft editor page

- create `/host/properties/[propertyId]/edit`
- build shared editor shell and visible stepper
- add basics and location forms
- connect property fetch and patch behavior

### Part 6: Dashboard CTA updates

- add direct listing creation CTA
- add direct path to properties index
- ensure dashboard now points into the real workflow

### Part 7: Polish

- tune list readability
- tune editor step framing
- tune save and error messaging
- verify the new property routes feel like part of the same portal system

## Risks

### Risk 1: Overbuilding the full add-property workflow too early

Trying to solve media, units, pricing, verification, and submission now would make this chunk too wide.

Guardrail:

- keep this chunk limited to property list, draft creation, and basics/location editing

### Risk 2: Making the editor feel unfinished in a confusing way

If future steps are shown poorly, hosts may think the flow is broken.

Guardrail:

- show future steps intentionally as upcoming or inactive
- keep the current active scope obvious

### Risk 3: Treating business linkage as already solved

Commercial ownership support depends on later business work.

Guardrail:

- persist ownership type now
- defer business linking depth to the dedicated businesses chunk

### Risk 4: Weak property status handling

If draft, rejected, submitted, and approved states are not represented clearly, the property list becomes hard to use.

Guardrail:

- define status mapping early
- keep status pills consistent across list and editor

### Risk 5: Draft loss or accidental duplicate creation

Hosts may create multiple drafts unintentionally or worry that work is not being saved.

Guardrail:

- disable duplicate create actions while requests are running
- show explicit success feedback
- make the redirect into the editor immediate and predictable

## Acceptance Criteria

This step is complete when:

1. `/host/properties` exists and approved hosts can view property list states
2. `/host/properties/new` exists and approved hosts can create a draft property
3. `/host/properties/[propertyId]/edit` exists and approved hosts can edit basics and location for a draft
4. `Properties` and `Add Property` are live in host navigation
5. property reference data loads correctly for the editor
6. rejected listings can be reopened and edited when the API allows it
7. dashboard links or CTAs can route into the real property workflow
8. the UI remains aligned with the host shell and redesign language
9. `npm.cmd run build` passes after implementation

## Verification Plan

After implementation:

1. open `/host/properties` as an approved host and verify empty, loading, error, and populated states
2. open `/host/properties/new` and verify a draft can be created successfully
3. verify successful draft creation redirects to `/host/properties/[propertyId]/edit`
4. open the editor route and verify basics and location data load correctly
5. edit and save basics fields, then verify values reload correctly
6. edit and save location fields, then verify values reload correctly
7. verify property status pills render correctly in the list and editor
8. verify `Properties` and `Add Property` are live and route correctly from the sidebar
9. verify dashboard CTAs route into the property workflow
10. verify non-host users still cannot access property routes
11. run `npm.cmd run build`

## Final Recommendation For Step 4

Treat this step as a `listing foundation and draft creation` step, not as the full add-property system.

If this is done well:

- the host portal becomes a real property workspace
- later media, units, pricing, and verification work can plug into a stable draft editor
- the product moves from portal framing into the core hosting workflow the backend is built around
