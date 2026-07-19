# XYZ Travellers Host Portal Step 7 Plan

## Step Name

Chunk 7: Property Verification And Submission

## Purpose

This document covers only the seventh implementation step from `HOST_PORTAL_CHUNKED_PLAN.md`.

It does not plan the full host portal.

It only plans the final listing-readiness layer that lets an approved host upload property verification documents, review submission readiness, submit a property for admin review, and understand the resulting status or rejection guidance.

## Objective

Build the final property-submission routes inside the host portal so an approved host can:

- open a dedicated verification workspace for one property
- upload or update property verification documents
- attach notes to the verification payload if the API supports them
- review listing completeness before submission
- see whether basics, location, media, units, pricing, and calendar setup are complete enough
- submit a property for admin review
- view the resulting submission state and any rejection reason if the backend returns one

This step should introduce the verification route and the review-and-submit route behavior that continue the add-property workflow after units, pricing, and calendar.

This step should not try to build commercial business linkage, reservations, messages, reviews, earnings, payouts history, or other operations pages yet.

## Why This Is Step 7

Chunk 1 created the reusable host shell.

Chunk 2 created the onboarding split between non-host users and approved hosts.

Chunk 3 added host profile and payout setup so the portal has real account depth.

Chunk 4 created the listing draft foundation for basics and location.

Chunk 5 added media management so a listing can carry real visual content.

Chunk 6 added units, pricing, and calendar controls so the property can move from `content-ready` into `operationally configured`.

Now the add-property workflow needs its final host-facing checkpoint, because a property still is not ready for moderation until the host can attach verification proof, review completion state, and explicitly submit the listing for admin review.

This step matters now because:

- the property workflow still stops before admin-review handoff
- hosts need a clear submission gate instead of guessing whether the listing is complete
- verification documents are part of the backend product model, not an optional nice-to-have
- the portal needs a real `draft -> submitted -> rejected -> resubmitted` lifecycle
- later business/commercial support and operations pages depend on listings being able to enter the review pipeline cleanly

Without this step:

- the listing workflow remains incomplete
- there is no host-facing submission moment
- rejection and resubmission logic has nowhere to live in the UI
- the portal cannot fully represent the backend property lifecycle

So this step exists to turn the add-property workflow from `configured draft` into `submission-ready listing`.

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
- `components/host/HostShell.tsx`
- `components/host/HostSidebar.tsx`
- `components/host/HostRouteGate.tsx`
- `components/host/HostDashboardShell.tsx`
- property workflow components inside `components/host/properties/*`
- host navigation metadata in `components/host/hostNavigation.ts`
- property foundation, media, units, pricing, and calendar helpers in `lib/host.ts`

Current behavior:

- approved hosts can complete basics, location, media, units, pricing, and calendar stages
- the property stepper already supports a visible workflow model
- listing editability already distinguishes `draft` and `rejected` from more locked statuses
- the portal can now create a much more complete property draft before review

Current limitation:

- there is no `app/host/properties/[propertyId]/verification/page.tsx`
- there is no review-and-submit workspace yet
- there are no `lib/host.ts` helpers yet for property verification docs, property submission, or status fetching
- there is no completeness checklist in the UI
- there is no explicit submit action for hosts
- there is no host-facing rejection reason presentation tied to the property workflow yet

## Scope

This step includes:

- building the dedicated property verification route
- building the verification document upload UI
- supporting verification notes when the API allows them
- loading the property's current verification submission data
- saving verification document changes
- building the review-and-submit area inside the verification stage
- surfacing a completion checklist for submission readiness
- showing whether required listing fields, cover image, verification docs, and operational setup appear ready
- submitting the property for admin review
- loading property submission status
- showing current property status and rejection reason when present
- connecting the calendar workflow forward into verification and submission
- showing clear loading, empty, error, checklist, submitted, and rejected states

This step does not include:

- commercial business selection and business-document linkage
- admin review tools
- reservation or messaging pages
- earnings, payouts history, or reviews pages
- guest-facing property publishing or booking UI

## Product Behavior Model For This Step

This step applies only to approved hosts inside the portal.

### Verification expectation

Behavior:

- host can open a verification workspace for one property
- host can see whether verification documents are already attached or still missing
- host can upload or replace verification proof
- host can leave supporting notes if the API supports them

### Review expectation

Behavior:

- host can see a checklist that reflects submission readiness
- the UI should explain missing pieces directly instead of only showing a generic error on submit
- the review area should feel like the final preparation step before moderation

### Submission expectation

Behavior:

- host can submit a valid listing to admin review
- after submission, the UI should stop pretending the property is still an ordinary editable draft
- the resulting submitted state should be visible immediately
- if a rejection exists, the host should understand that the listing can be corrected and resubmitted where allowed

Important rule:

- this chunk creates the `verification and submission` layer, not the businesses/commercial ownership system
- it should complete the host-facing draft-to-review lifecycle without trying to solve every commercial edge case yet

## Design Direction

This verification and submission workflow must follow `UI_REDESIGN_PLAN.md` and stay visually aligned with the host shell and property workflow language already established in the portal.

### Visual principles

- keep the final review step calm, premium, and trustworthy
- use stronger emphasis for readiness and warnings without turning the page into a loud admin console
- checklist items should feel readable and honest, not decorative
- submission status should feel consequential without becoming visually heavy

### UX principles

- the host should always know which property is being verified and submitted
- missing requirements should be explained in direct, concrete language
- submission should feel intentional and final enough for admin review handoff
- rejection reasons should be surfaced clearly when present
- the review area should reduce uncertainty, not add it

## Route Coverage In This Step

This step needs to support:

- `/host/properties/[propertyId]/calendar`
- `/host/properties/[propertyId]/verification`

Behavior rules:

- `/host/properties/[propertyId]/verification`:
  - logged out -> redirect to auth
  - non-host -> redirect to onboarding
  - approved host -> allow

This route should use the same shared host portal gate introduced in Chunk 2.

## File Plan

### New files

- `app/host/properties/[propertyId]/verification/page.tsx`
- `components/host/properties/verification/HostPropertyVerificationPage.tsx`
- `components/host/properties/verification/HostPropertyVerificationUploader.tsx`
- `components/host/properties/verification/HostPropertyVerificationList.tsx`
- `components/host/properties/verification/HostPropertyVerificationNotesForm.tsx`
- `components/host/properties/review-submit/HostPropertyReviewChecklist.tsx`
- `components/host/properties/review-submit/HostPropertySubmitPanel.tsx`
- `components/host/properties/review-submit/HostPropertySubmissionStatusCard.tsx`

### Updated files

- `components/host/properties/HostPropertyEditorShell.tsx`
- `components/host/properties/hostPropertyEditor.ts`
- `components/host/properties/calendar/HostPropertyCalendarPage.tsx`
- `components/host/hostNavigation.ts`
- `lib/host.ts`

### Optional shared helpers

- `components/host/properties/verification/hostPropertyVerification.ts`
- `components/host/properties/review-submit/hostPropertyReview.ts`

If checklist mapping, verification-document normalization, or submission-state shaping grows, extract them into small local helpers.

## Component Responsibilities

### `HostPropertyVerificationPage`

Responsibilities:

- load the property and its verification data
- load any submission status data needed for the page
- handle loading, error, empty, checklist, and submitted/rejected states
- coordinate verification saves and property submit actions

### `HostPropertyVerificationUploader`

Responsibilities:

- upload verification files for the property
- explain upload expectations clearly
- prevent accidental duplicate uploads while requests are in flight

### `HostPropertyVerificationList`

Responsibilities:

- render the current verification documents cleanly
- show whether proof is already attached
- allow replacement or deletion only if the API supports it in this chunk

### `HostPropertyVerificationNotesForm`

Responsibilities:

- edit any verification note or supporting explanation field
- keep the note practical and submission-oriented

### `HostPropertyReviewChecklist`

Responsibilities:

- render a clear checklist of readiness items
- distinguish complete vs incomplete requirements honestly
- explain what still blocks submission

### `HostPropertySubmitPanel`

Responsibilities:

- hold the final submit CTA
- explain what submission means
- disable submit when required conditions are not met

### `HostPropertySubmissionStatusCard`

Responsibilities:

- show current submission state
- surface rejection reason when present
- make the transition between `draft`, `submitted`, `approved`, and `rejected` understandable

### `HostPropertyEditorShell`

Responsibilities after this chunk:

- keep verification as the final real host-facing workflow stage before future business/commercial depth
- make the property workflow feel complete through submission readiness

## API Plan

This step should extend `lib/host.ts` with verification and submission helpers.

### APIs used in this step

- `GET /api/v1/host/properties/:propertyId/verification`
- `PUT /api/v1/host/properties/:propertyId/verification`
- `POST /api/v1/host/properties/:propertyId/submit`
- `GET /api/v1/host/properties/:propertyId/status`

### Minimum recommended API scope for this chunk

Required:

- fetch current property verification data
- save verification document data
- submit property for review
- fetch property status and rejection reason if available

Optional:

- support replacing or deleting previously attached verification files if the backend contract clearly supports it
- support a richer document list shape if the API returns document metadata

Guardrail:

- keep API integration focused on property verification and submission only
- do not mix business/commercial linking into this chunk

## Data Model Plan

### Verification document model

Frontend should be prepared to represent:

- verification document id
- property id
- file url or file reference
- document type if returned
- note or label if returned
- created timestamp
- updated timestamp

### Verification payload model

Frontend should be prepared to represent:

- one or more verification documents
- optional host note
- any backend readiness metadata returned with the verification resource

### Submission status model

Frontend should be prepared to represent:

- property id
- current status
- raw backend status
- rejection reason
- submitted timestamp
- updated timestamp

### Review checklist model

Frontend should be prepared to represent:

- basics complete
- location complete
- cover image exists
- media exists
- units exist
- pricing exists
- calendar/stay rules exist enough for submission
- verification documents exist
- any backend-provided completeness summary if available

## Workflow Structure For This Step

Chunk 7 is still one official chunk from `HOST_PORTAL_CHUNKED_PLAN.md`, but it is wide enough that implementation should be executed in internal sections.

### Internal Section A: Verification data and upload

Focus:

- verification route
- verification fetch/save helpers
- document upload and notes UI

Reason:

- submission and checklist behavior depend on current verification data being visible first

### Internal Section B: Review checklist

Focus:

- readiness checklist
- missing-item explanations
- submission gating logic

Reason:

- hosts need a reliable explanation of what still blocks submission before the final CTA appears actionable

### Internal Section C: Submit and status lifecycle

Focus:

- submit action
- submitted-state treatment
- rejection reason display
- resubmission guidance where appropriate

Reason:

- the main product outcome of this chunk is the draft-to-review transition

Important rule:

- keep these as internal execution sections inside the same official `Chunk 7`
- do not renumber them into a new top-level chunk order unless the user explicitly asks for separate sub-chunk files

## Verification Behavior Plan

### Verification page behavior

- load the property and current verification state on page open
- show whether proof documents already exist
- allow draft and rejected properties to update verification data
- reflect saved changes without forcing the host out of the page

### Verification upload behavior

- support at least one verification proof upload
- keep file actions deliberate and understandable
- show direct feedback after save

### Notes behavior

- if notes are supported, keep them concise and tied to proof context
- avoid turning the note area into a long free-form admin message field

## Review Checklist Behavior Plan

### Checklist page behavior

- explain which requirements are ready
- explain which requirements are still missing
- link the host back to earlier workflow stages where useful
- keep checklist logic honest when a dependency is not yet complete

### Submission gating behavior

- disable submit when blocking requirements are missing
- avoid vague generic wording like `something is incomplete`
- make checklist items concrete and actionable

## Submission Status Behavior Plan

### Submit behavior

- submit should be an intentional action
- keep the CTA disabled while the request is in flight
- update the visible property status after successful submission

### Submitted behavior

- make it clear the property is now under review
- reduce or restrict editing where appropriate according to the backend lifecycle

### Rejected behavior

- surface rejection reason when the backend provides it
- explain that the host can correct the listing and resubmit where the product allows it

### Approved behavior

- show approved state clearly without pretending this page is still a draft checklist

## Status And Editability Plan

### Route status treatment

The UI should work cleanly with:

- `draft`
- `submitted`
- `approved`
- `rejected`

### Editability rule

For this chunk:

- `draft` should allow verification edits and submission
- `rejected` should allow verification edits and resubmission preparation
- `submitted` should mostly behave as a review-state or read-only status surface
- `approved` should primarily behave as a status surface unless the backend explicitly supports further edits

Guardrail:

- keep unsupported post-submission edit states honest
- do not imply that approved or submitted listings remain fully editable if the backend does not permit it

## Empty State Plan

### Verification empty state goals

- explain that submission still needs property proof
- point directly to the verification upload action

### Checklist empty/incomplete state goals

- explain which earlier setup stage is still missing
- point back to the relevant workflow step when possible

### Submitted state goals

- confirm that the property is in review
- remove ambiguity about whether more action is needed immediately

## Content Plan

### Verification page header

Recommended content:

- badge like `Property Verification`
- title focused on proving listing legitimacy
- short explanation that verification plus review checklist are the final preparation stage before admin review

### Checklist content

Recommended content:

- simple, explicit checklist labels
- short helper copy for missing items
- stronger emphasis on what blocks submission

### Submission panel content

Recommended content:

- explain that submission sends the property to admin review
- explain that rejected listings may return for correction

### Status card content

Recommended patterns:

- `Draft listing`
- `Submitted for review`
- `Approved listing`
- `Changes needed before resubmission`

## Layout Structure

Suggested verification route composition:

1. verification route page
2. host route gate in portal mode
3. host shell
4. property-aware page header block
5. verification upload area
6. verification notes / current proof list
7. review checklist
8. submit panel
9. current status / rejection reason card

## Validation Plan

### Verification validation

- require at least one verification proof if the backend requires it for submission
- validate notes only as lightly as necessary

### Checklist validation

- checklist logic should not fabricate completion
- if a requirement cannot be confirmed yet, treat it as incomplete rather than guessing

### Submission validation

- prevent submit when the property is clearly missing blocking requirements
- keep final gating aligned with both frontend-known state and any backend response

Guardrail:

- validation should reduce accidental bad submissions, not create hidden magic rules the host cannot understand

## Styling Plan

### Verification styling

- use calm evidence-oriented UI blocks
- avoid looking like a legal/admin upload portal

### Checklist styling

- clear complete/incomplete distinction
- readable scan pattern
- no heavy enterprise dashboard visuals

### Submission styling

- final CTA should feel important but not alarming
- submitted and rejected states should be visually distinct and easy to understand

### State styling

- loading states should match existing host portal skeleton patterns
- error states should explain recovery paths cleanly
- submitted/rejected cards should feel informative, not punitive

## Step-By-Step Build Checklist

### Part 1: API helper preparation

- add verification document types to `lib/host.ts`
- add submission status types to `lib/host.ts`
- add fetch/update helpers for property verification
- add submit helper for property review
- add property status helper for submission lifecycle display

### Part 2: Stepper and workflow updates

- update property editor step framing so verification becomes a real route stage
- add clear path forward from calendar into verification

### Part 3: Verification route

- create `/host/properties/[propertyId]/verification`
- build loading, empty, error, checklist, and populated states
- support verification upload and notes save

### Part 4: Review and submit behavior

- build checklist rendering
- build submit panel and final CTA
- update visible status after submission

### Part 5: Rejection and status treatment

- surface rejection reason when returned
- keep submitted and approved states visually honest

### Part 6: Polish

- tune checklist clarity
- tune final submit messaging
- verify the verification route feels like the natural end of the current add-property workflow

## Risks

### Risk 1: Submission checklist becomes guesswork

The frontend should not invent false confidence if the backend contract is incomplete.

Guardrail:

- prefer explicit checklist rules based on known data and backend responses

### Risk 2: Verification upload contract is more complex than expected

The endpoint may expect a different file shape or document metadata structure.

Guardrail:

- keep upload handling defensive and align to the actual API response envelope used elsewhere in the project

### Risk 3: Submitted and rejected states are treated too casually

Submission changes the lifecycle meaning of the listing.

Guardrail:

- make the status treatment feel more final than an ordinary draft edit page

### Risk 4: Businesses/commercial logic leaks into this chunk

Commercial ownership support belongs to the next chunk.

Guardrail:

- keep this chunk focused on property verification and submission only
- defer business linkage depth to Chunk 8

## Acceptance Criteria

This step is complete when:

1. `/host/properties/[propertyId]/verification` exists and approved hosts can open it
2. host can upload or save property verification data
3. the UI surfaces a review checklist for submission readiness
4. host can submit a valid property for admin review
5. submitted status shows correctly after submission
6. rejection reason can be surfaced when available
7. verification becomes a real stage in the add-property workflow
8. the UI remains aligned with the host shell and redesign language
9. `npm.cmd run build` passes after implementation

## Verification Plan

After implementation:

1. open `/host/properties/[propertyId]/verification` as an approved host and verify loading, empty, error, and populated states
2. upload verification proof and verify the saved result reloads correctly
3. save verification notes if supported and verify they reload correctly
4. confirm the checklist reflects missing vs complete requirements honestly
5. submit a ready property and verify status updates to submitted
6. verify submitted-state UI no longer behaves like an ordinary draft-edit surface
7. if rejection data is available, verify the rejection reason is surfaced clearly
8. verify non-host users still cannot access the verification route
9. verify the path from calendar into verification feels natural
10. run `npm.cmd run build`

## Final Recommendation For Step 7

Treat this step as the `trust, readiness, and submission` layer of the add-property workflow.

If this is done well:

- the listing workflow finally reaches a real moderation handoff point
- hosts can understand exactly what still blocks submission
- the portal can represent the true `draft -> submitted -> rejected -> approved` property lifecycle much more faithfully
