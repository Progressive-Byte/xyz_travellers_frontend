# XYZ Travellers Host Portal Step 8 Plan

## Step Name

Chunk 8: Businesses And Commercial Ownership Support

## Purpose

This document covers only the eighth implementation step from `HOST_PORTAL_CHUNKED_PLAN.md`.

It does not plan the full host portal.

It only plans the business-management and commercial-ownership layer that lets an approved host create and manage business profiles, maintain reusable business documents, connect commercial properties to a selected business, and keep the add-property workflow honest for non-personal ownership types.

## Objective

Build the business-management routes and property-linkage behavior inside the host portal so an approved host can:

- open a dedicated businesses workspace
- create, edit, and delete business profiles
- upload and manage reusable business documents
- reuse those documents across commercial properties instead of re-uploading them every time
- connect a commercial property to one business profile
- attach selected business documents to a commercial property where the API supports that linkage
- understand when a commercial property is missing required business support before submission

This step should introduce the businesses route family and the commercial-ownership bridge that connects host setup depth into the existing add-property workflow.

This step should not try to rebuild the already-completed property verification flow, and it should not implement reservations, messages, reviews, earnings, or payouts-history operations pages yet.

## Why This Is Step 8

Chunk 1 created the reusable host shell.

Chunk 2 created the onboarding split between non-host users and approved hosts.

Chunk 3 added host profile and payout setup so the portal has real account depth.

Chunk 4 created the listing draft foundation for basics and location.

Chunk 5 added media management so a listing can carry real visual content.

Chunk 6 added units, pricing, and calendar controls so the property can move from `content-ready` into `operationally configured`.

Chunk 7 completed property verification and submission so the listing can now move into admin review.

Now the portal needs the missing business layer, because the full product model already distinguishes personal ownership from commercial ownership, and commercial properties should not keep pretending they can be prepared cleanly without business selection and reusable business-document support.

This step matters now because:

- commercial ownership exists in the backend and the current frontend only captures the ownership type label
- approved hosts need a place to manage businesses outside of one-off property editing
- reusable business documents should behave like a shared library, not a property-specific duplicate upload pattern
- the commercial branch of the add-property flow still lacks the business and document linkage described in the full plan
- later operations pages should rest on listings whose ownership model is represented more faithfully

Without this step:

- commercial properties remain only partially modeled in the portal
- hosts cannot manage businesses as first-class setup records
- the add-property flow stays biased toward personal ownership only
- the submission checklist cannot honestly account for commercial business readiness

So this step exists to turn commercial ownership from a plain field choice into a real host workflow.

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
- `components/host/HostShell.tsx`
- `components/host/HostSidebar.tsx`
- `components/host/HostRouteGate.tsx`
- `components/host/HostDashboardShell.tsx`
- property workflow components inside `components/host/properties/*`
- verification and submit components inside `components/host/properties/verification/*` and `components/host/properties/review-submit/*`
- host navigation metadata in `components/host/hostNavigation.ts`
- property, media, units, pricing, calendar, verification, and submission helpers in `lib/host.ts`

Current behavior:

- approved hosts can complete the end-to-end personal-property path through verification and submission
- the property workflow already supports a visible stepper model across edit, media, units, pricing, calendar, and verification
- listing editability already distinguishes `draft` and `rejected` from more locked statuses
- the host shell now has enough route structure to absorb one more setup area cleanly

Current limitation:

- there is no `app/host/businesses/page.tsx`
- there is no dedicated business-management UI in the portal
- there are no reusable business-document library components yet
- commercial ownership in the property flow is still only a field value, not a linked business workflow
- the property submission checklist currently cannot enforce or explain commercial business linkage honestly

## Scope

This step includes:

- building the dedicated businesses route
- building create, edit, and delete business-profile flows
- loading and managing reusable business documents per business
- supporting business document upload and metadata updates when the API allows them
- showing a clean business library state with loading, empty, error, and populated behaviors
- connecting commercial properties to a selected business
- supporting selected business-document linkage for commercial properties where the backend exposes it
- updating the property workflow and submission logic so commercial properties can reflect business readiness honestly
- adding host navigation entry points for businesses

This step does not include:

- rebuilding personal-property flows that are already complete
- reservation or messaging pages
- reviews, earnings, or payouts-history pages
- guest-facing publishing or booking UI
- admin-side business review tooling

## Product Behavior Model For This Step

This step applies only to approved hosts inside the portal.

### Businesses expectation

Behavior:

- host can open a businesses workspace
- host can see whether no business exists yet or one or more businesses are already saved
- host can create and update business records cleanly
- host can remove a business where the API allows it

### Business documents expectation

Behavior:

- host can manage reusable supporting documents under one business
- document actions should feel like maintaining a reusable library, not a one-off property upload area
- the UI should make it clear which documents are available for later commercial property selection

### Commercial ownership expectation

Behavior:

- personal properties should continue to work without business linkage
- commercial properties should guide the host to choose a business and, where required, selected documents
- the UI should explain missing commercial prerequisites directly instead of hiding them behind submit failure

Important rule:

- this chunk creates the `businesses and commercial ownership` layer, not the daily operations workspace
- it should deepen the property flow only where commercial ownership truly needs business linkage

## Design Direction

This business-management workflow must follow `UI_REDESIGN_PLAN.md` and stay visually aligned with the host shell and property workflow language already established in the portal.

### Visual principles

- keep business setup premium and calm, not like a tax portal or harsh compliance dashboard
- make reusable document management feel organized and trustworthy
- use stronger emphasis for missing commercial requirements without turning the screen into a warning-heavy admin console
- keep the same cream, lime, surface-card, and soft-elevation language already used in the portal

### UX principles

- the host should always understand whether they are working on reusable business records or one specific property
- commercial branching should feel additive, not like a surprise detour
- missing business linkage should be explained in practical language
- business document reuse should reduce duplicate work instead of adding new friction

## Route Coverage In This Step

This step needs to support:

- `/host/businesses`
- `/host/properties/[propertyId]/edit`
- `/host/properties/[propertyId]/verification`

Behavior rules:

- `/host/businesses`:
  - logged out -> redirect to auth
  - non-host -> redirect to onboarding
  - approved host -> allow

- commercial property editing:
  - personal ownership -> business UI stays hidden or inactive
  - commercial ownership -> business selection and document-linkage UI becomes available

These routes should use the same shared host portal gate introduced in Chunk 2.

## File Plan

### New files

- `app/host/businesses/page.tsx`
- `components/host/businesses/HostBusinessesPage.tsx`
- `components/host/businesses/HostBusinessForm.tsx`
- `components/host/businesses/HostBusinessesList.tsx`
- `components/host/businesses/HostBusinessCard.tsx`
- `components/host/businesses/documents/HostBusinessDocumentsPanel.tsx`
- `components/host/businesses/documents/HostBusinessDocumentUploader.tsx`
- `components/host/businesses/documents/HostBusinessDocumentsList.tsx`
- `components/host/properties/ownership/HostPropertyBusinessSelector.tsx`
- `components/host/properties/ownership/HostPropertyBusinessDocumentsSelector.tsx`

### Updated files

- `components/host/hostNavigation.ts`
- `components/host/properties/HostPropertyEditorPage.tsx`
- `components/host/properties/HostPropertyEditorShell.tsx` only if workflow framing needs clearer commercial guidance
- `components/host/properties/review-submit/HostPropertyReviewChecklist.tsx`
- `components/host/properties/verification/HostPropertyVerificationPage.tsx` only if the commercial checklist summary or guidance needs to surface there
- `lib/host.ts`

### Optional shared helpers

- `components/host/businesses/hostBusinesses.ts`
- `components/host/properties/ownership/hostPropertyOwnership.ts`

If business normalization, selected-document shaping, or commercial checklist mapping grows, extract them into small local helpers.

## Component Responsibilities

### `HostBusinessesPage`

Responsibilities:

- load host businesses and reference any needed empty-state guidance
- coordinate create, edit, delete, and selected-business flows
- host the business document management area

### `HostBusinessForm`

Responsibilities:

- create and edit a business profile
- validate business details only as much as the backend contract actually requires
- keep the form practical and reusable

### `HostBusinessesList`

Responsibilities:

- render the business collection cleanly
- support edit and delete actions
- communicate the currently selected business for document management when useful

### `HostBusinessDocumentsPanel`

Responsibilities:

- load and manage the current business's document library
- coordinate upload, update, and delete actions
- make document reuse intent clear

### `HostBusinessDocumentUploader`

Responsibilities:

- upload business documents
- explain what these documents are used for
- prevent accidental duplicate actions while requests are in flight

### `HostBusinessDocumentsList`

Responsibilities:

- render reusable business documents cleanly
- show metadata such as title, type, note, or timestamp when returned
- allow edit or delete only where the backend supports it in this chunk

### `HostPropertyBusinessSelector`

Responsibilities:

- render only for commercial properties
- let the host choose one existing business for the property
- explain what to do when no business exists yet

### `HostPropertyBusinessDocumentsSelector`

Responsibilities:

- render only for commercial properties where the backend supports selected document linkage
- let the host choose reusable business documents for the property
- make the difference between reusable business documents and property-specific verification documents clear

## API Plan

This step should extend `lib/host.ts` with business and commercial-ownership helpers.

### APIs used in this step

- `GET /api/v1/host/businesses`
- `POST /api/v1/host/businesses`
- `GET /api/v1/host/businesses/:businessId`
- `PATCH /api/v1/host/businesses/:businessId`
- `DELETE /api/v1/host/businesses/:businessId`
- `GET /api/v1/host/businesses/:businessId/documents`
- `POST /api/v1/host/businesses/:businessId/documents`
- `PATCH /api/v1/host/businesses/:businessId/documents/:documentId`
- `DELETE /api/v1/host/businesses/:businessId/documents/:documentId`

### Minimum recommended API scope for this chunk

Required:

- fetch businesses list
- create and update a business
- delete a business if supported
- fetch business documents
- upload at least one business document
- attach commercial-property business linkage where the backend supports it

Optional:

- support richer business metadata if the API returns it
- support selected document linkage directly on property resources if contract details are already clear
- support document metadata editing such as labels, notes, or document types where available

Guardrail:

- keep API integration focused on businesses, business documents, and commercial property linkage only
- do not leak reservations, messages, reviews, earnings, or payouts logic into this chunk

## Data Model Plan

### Business profile model

Frontend should be prepared to represent:

- business id
- business name
- registration number if returned
- country
- address
- status if returned
- created timestamp
- updated timestamp

### Business document model

Frontend should be prepared to represent:

- document id
- business id
- file url or file reference
- title or label if returned
- document type if returned
- note if returned
- created timestamp
- updated timestamp

### Property business-linkage model

Frontend should be prepared to represent:

- property id
- ownership type
- selected business id
- selected business documents if the backend supports that linkage in property payloads

### Commercial readiness model

Frontend should be prepared to represent:

- whether a commercial property has a linked business
- whether required reusable business documents exist
- whether selected business documents are attached where required
- whether the current property can honestly move toward submission as a commercial listing

## Workflow Structure For This Step

Chunk 8 is still one official chunk from `HOST_PORTAL_CHUNKED_PLAN.md`, but it is wide enough that implementation should be executed in internal sections.

### Internal Section A: Businesses workspace

Focus:

- businesses route
- business list
- create, edit, and delete business profiles

Reason:

- the reusable business record needs to exist before any document library or property linkage can make sense

### Internal Section B: Business document library

Focus:

- business document fetch helpers
- document upload UI
- document list and maintenance actions

Reason:

- reusable documents are the practical value of the businesses system and should land before property linkage depends on them

### Internal Section C: Commercial property linkage

Focus:

- property business selection
- selected business-document linkage
- submission checklist honesty for commercial ownership

Reason:

- the main product outcome of this chunk is connecting reusable business setup back into the existing add-property workflow

Important rule:

- keep these as internal execution sections inside the same official `Chunk 8`
- do not renumber them into a new top-level chunk order unless the user explicitly asks for separate sub-chunk files

## Businesses Behavior Plan

### Businesses page behavior

- load all host businesses on page open
- show clean empty, loading, error, and populated states
- allow one business to be created without leaving the workspace
- allow edits without forcing the host into a separate admin-feeling CRUD flow

### Business form behavior

- keep fields practical and directly tied to reusable identity or registration data
- support create and edit modes cleanly
- show direct success and error feedback after save

### Business delete behavior

- support delete only if the backend contract clearly allows it
- explain failure cleanly if a business cannot be deleted because of downstream usage

## Business Documents Behavior Plan

### Document library behavior

- load documents per business
- explain that these documents support commercial-property reuse
- show whether no documents exist yet or a reusable library is already available

### Document upload behavior

- support at least one supporting file upload
- keep file actions deliberate and understandable
- avoid duplicate uploads while requests are in flight

### Document maintenance behavior

- allow update and delete only where the API clearly supports those actions
- show useful metadata without over-designing the document list

## Commercial Ownership Behavior Plan

### Property editor behavior

- if `ownershipType = personal`, keep the property flow unchanged
- if `ownershipType = commercial`, show business-selection guidance inside the property editor
- explain when the host should go create a business first

### Property linkage behavior

- allow one business to be linked to the current commercial property
- allow reusable business documents to be selected where the backend supports it
- keep property verification documents distinct from reusable business documents

### Checklist behavior

- commercial business readiness should not be guessed
- if the linkage cannot be confirmed, treat the commercial requirement as incomplete instead of pretending it is satisfied

## Status And Editability Plan

### Route status treatment

The UI should work cleanly with:

- `draft`
- `submitted`
- `approved`
- `rejected`

### Editability rule

For this chunk:

- `draft` should allow commercial business selection and reusable document linkage
- `rejected` should allow business corrections and resubmission preparation
- `submitted` should mostly behave as review-state or read-only status surface
- `approved` should primarily behave as a status surface unless the backend explicitly supports further edits

Guardrail:

- keep post-submission commercial edits honest
- do not imply that submitted or approved commercial listings remain fully editable if the backend does not permit it

## Empty State Plan

### Businesses empty state goals

- explain why reusable business records matter
- point directly to the create-business action

### Business documents empty state goals

- explain that reusable business documents support later commercial property linkage
- point directly to the document upload action

### Commercial property empty/incomplete goals

- explain that commercial ownership needs a linked business before submission can be considered ready
- point back to the businesses workspace or selector when possible

## Content Plan

### Businesses page header

Recommended content:

- badge like `Businesses`
- title focused on reusable commercial identity and documents
- short explanation that these records support commercial properties across the host workflow

### Business document content

Recommended content:

- simple, explicit labels
- short helper copy explaining reuse
- clear separation between library documents and property-specific verification files

### Commercial property guidance content

Recommended content:

- direct explanation when business linkage is required
- clear CTA to create or select a business
- short helper copy describing why a personal property does not need this step

## Layout Structure

Suggested businesses route composition:

1. businesses route page
2. host route gate in portal mode
3. host shell
4. businesses page header block
5. create/edit business area
6. businesses list
7. selected business document library panel

Suggested commercial property integration:

1. existing property edit route
2. ownership-type-aware guidance block
3. business selector for commercial properties
4. selected reusable business-documents area where supported
5. verification/review steps reflecting commercial readiness honestly

## Validation Plan

### Business validation

- validate only the fields that materially matter to the backend contract
- keep required-field feedback direct and practical

### Document validation

- require at least one valid file when uploading
- keep metadata validation light unless the API requires more

### Commercial-linkage validation

- if a property is personal, business validation should not block submission
- if a property is commercial, only confirmed business linkage should satisfy the commercial requirement

Guardrail:

- validation should reduce confusion, not invent hidden compliance rules the host cannot understand

## Styling Plan

### Businesses styling

- use calm, organized account-management blocks
- avoid making the page feel like a corporate legal back office

### Documents styling

- keep the file library readable and reusable
- show status and metadata clearly without clutter

### Commercial-linkage styling

- business selection inside property editing should feel like a natural branch of the existing workflow
- warnings about missing commercial setup should be informative, not punitive

### State styling

- loading states should match existing host portal skeleton patterns
- error states should explain recovery paths cleanly
- empty states should feel constructive and guided

## Step-By-Step Build Checklist

### Part 1: API helper preparation

- add business profile types to `lib/host.ts`
- add business document types to `lib/host.ts`
- add CRUD helpers for businesses
- add document fetch/upload/update/delete helpers for business documents
- add any property business-linkage helpers needed by the commercial flow

### Part 2: Businesses workspace

- create `/host/businesses`
- build loading, empty, error, and populated states
- support create and edit business flows
- support delete flow if available

### Part 3: Business document library

- build selected-business document management area
- support document upload
- render reusable document list and maintenance actions

### Part 4: Commercial property linkage

- update the property editor to branch on commercial ownership
- add business selector for commercial properties
- add selected business-document linkage where supported

### Part 5: Checklist and submission honesty

- update commercial readiness handling in review surfaces
- ensure commercial properties do not look submission-ready without confirmed business support

### Part 6: Polish

- tune businesses-page clarity
- tune commercial guidance messaging
- verify the businesses workspace feels like a natural setup area in the host shell

## Risks

### Risk 1: Business contract shape is richer than expected

The backend may return more fields or more nuanced statuses than the initial frontend needs.

Guardrail:

- normalize business data defensively and keep the first UI pass focused on the fields that materially matter

### Risk 2: Property business-linkage contract is unclear

The backend may expose selected business or selected business documents in a shape that is not yet obvious from current frontend usage.

Guardrail:

- design the plan around explicit, confirmable linkage and treat anything uncertain as incomplete rather than guessing

### Risk 3: Business documents get confused with property verification

Hosts could mistake reusable business documents for property-specific verification proof.

Guardrail:

- separate the language, layout, and helper text clearly between reusable business documents and property verification documents

### Risk 4: Commercial rules leak too deeply into personal-property flows

Personal ownership should stay simple.

Guardrail:

- keep personal-property behavior unchanged unless a real shared improvement is needed
- only branch into business linkage when `ownershipType = commercial`

## Acceptance Criteria

This step is complete when:

1. `/host/businesses` exists and approved hosts can open it
2. host can create, edit, and where supported delete businesses
3. host can upload and manage reusable business documents
4. commercial properties can link to a selected business in the property workflow
5. the UI can reflect commercial business readiness honestly before submission
6. personal properties remain unaffected by business-only requirements
7. the businesses workspace and commercial linkage remain aligned with the host shell and redesign language
8. `npm.cmd run build` passes after implementation

## Verification Plan

After implementation:

1. open `/host/businesses` as an approved host and verify loading, empty, error, and populated states
2. create a business and verify it reloads correctly
3. edit a business and verify changes persist
4. upload one or more business documents and verify the library reloads correctly
5. if delete is supported, delete a business document and verify the UI updates correctly
6. open a commercial property and verify business selection appears only for commercial ownership
7. verify a personal property does not get blocked by business-only requirements
8. confirm commercial readiness messaging is honest when no business or documents are linked
9. verify non-host users still cannot access the businesses route
10. run `npm.cmd run build`

## Final Recommendation For Step 8

Treat this step as the `reusable commercial identity and document library` layer of the host portal.

If this is done well:

- the portal will support both personal and commercial ownership more faithfully
- hosts will stop duplicating business proof work across multiple listings
- the add-property workflow will stay simple for personal listings while becoming much more honest for commercial ones
