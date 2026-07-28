# XYZ Travellers Host Portal Step 11 Plan

## Step Name

Chunk 11: Workflow Parity And Remaining Scope Closure

## Purpose

This document covers only the eleventh implementation step after reviewing:

- `HOST_PORTAL_FULL_PLAN.md`
- `HOST_PORTAL_CHUNKED_PLAN.md`
- the current host portal implementation

This is not a new product direction.

It exists because a few parts of the original host-portal scope are still either missing or only partially represented, even after Chunk 10 polish and QA.

## Why Chunk 11 Exists

The original chunked plan stopped at Chunk 10 because it assumed the full planned scope would already be represented by then.

After comparing the current codebase against the original full plan, there are still some genuine parity gaps:

- onboarding is still a status page, not a real draft/edit/submit host application flow
- property deletion is still missing from the listing workspace
- property verification uploads still do not capture document-specific metadata expected by the backend contract
- reviews still stop at visibility, while the full plan also expects host-side guest-review actions where allowed
- operations filtering and sidebar IA still fall short of the original plan’s fuller route and workflow parity

So Chunk 11 should be treated as:

- the remaining-scope completion pass
- not another polish-only chunk
- not a broad redesign
- not a rewrite of already-correct portal foundations

## Objective

Finish the host portal features that were part of the original product shape but are still missing or underimplemented after Chunks 1 through 10.

This step should:

- turn onboarding into a real host application workflow instead of status-only guidance
- complete the missing listing lifecycle controls that still exist in the backend contract
- bring verification uploads closer to the backend’s real document requirements
- complete the review workflow so the portal supports both visibility and host-side action where allowed
- add the most useful route and filter parity that is still missing from the planned operations workspace
- align the sidebar information architecture more closely with the original portal plan

## Remaining Scope Confirmed From The Original Plans

### Gap 1: Real onboarding workflow is still missing

The full plan expects:

- identity verification draft creation
- editable draft state
- document-based verification flow
- final host request submission
- rejected-state correction and resubmission

Current state:

- onboarding mostly reads and displays status
- there is no full draft create/edit/submit host application workflow yet

### Gap 2: Property lifecycle parity is incomplete

The full plan and API surface already account for:

- create
- edit
- delete
- verification upload
- submit and status

Current state:

- create, edit, verification, submit, and status exist
- delete is still missing from the host listing UI and shared host data layer

### Gap 3: Property verification proof is still simplified

The verification flow already exists, but the backend contract expects richer document payload details.

Current state:

- files can be uploaded
- the uploader remains too simple for document-type-aware verification proof management

### Gap 4: Reviews are visible but not fully actionable

The original full plan expects:

- property review visibility
- guest-review visibility
- guest-review creation flow where allowed
- detail-level list/detail parity patterns

Current state:

- property and guest reviews are displayed
- the host-side creation path is still not represented in the UI

### Gap 5: Operations parity is still thinner than planned

The original plan and API shape support richer filter-driven operations workflows.

Current state:

- core operations routes exist
- filters are still lighter than the backend allows
- sidebar grouping still does not fully match the fuller planned IA

## Scope

Chunk 11 includes:

- real host onboarding draft creation, editing, and submission
- onboarding document upload and rejected-state revision flow
- property delete support in the host portal
- richer property verification document handling
- guest-review creation flow where backend rules allow it
- review detail and review-action handoff improvements where necessary
- useful first-class operations filters for reservations, reviews, earnings, and payout history where they materially improve the workspace
- sidebar IA completion to better match the original host portal structure
- any lightweight verification-status navigation/handoff needed to satisfy the original planned information architecture

Chunk 11 does not include:

- redesigning the host shell again
- rebuilding stable listing, business, or operations pages from scratch
- adding admin review tools
- adding public-site guest booking work
- inventing product scope that was not already implied by the original host plans or backend APIs

## Product Goal For This Step

After Chunk 11, the host portal should no longer feel like it has any meaningful missing pieces from the original full plan.

The result should be:

- onboarding-to-approval flow is real, not placeholder-like
- the listing lifecycle includes the expected destructive control where allowed
- verification is closer to actual backend document requirements
- reviews support both reading and host-side follow-up actions where the backend allows them
- operations pages behave more like true management tools rather than read-mostly summaries
- navigation structure more honestly reflects the product model from the original full plan

## Internal Execution Sections

Chunk 11 is still one official plan file, but the work should be executed in focused internal sections.

### Internal Section A: Host onboarding completion

Focus:

- identity verification draft creation
- identity verification draft editing
- onboarding document upload flow
- final `host enable` submission
- rejected-state resubmission support

Why this comes first:

- the full plan treats onboarding as a real product flow, not only a gated waiting room
- this is the clearest remaining gap against the original product model

### Internal Section B: Listing lifecycle parity

Focus:

- property delete support
- verification document metadata improvements
- clearer verification-status handoffs where needed

Why this matters:

- the property workflow is the center of the host product
- a missing lifecycle control or simplified verification flow leaves the listing system incomplete

### Internal Section C: Reviews, filters, and IA completion

Focus:

- guest-review creation flow
- review-detail and reservation-to-review handoffs
- richer operations filters
- sidebar grouping parity
- verification-status navigation parity

Why this matters:

- the original full plan expected a more complete operational control panel
- these gaps are smaller than onboarding, but still visible against the master plan

Important rule:

- keep this as one Chunk 11 plan
- do not invent sub-chunk numbers unless the user explicitly asks for sub-plans

## Detailed Scope

### Area 1: Host onboarding completion

#### Goal

Turn `/host/onboarding` from a status-aware holding page into a real host application workspace.

#### Main files

- `app/host/onboarding/page.tsx`
- `components/host/onboarding/*`
- `components/host/HostRouteGate.tsx`
- `lib/host.ts`

#### APIs used

- `GET /api/v1/host/verifications/identity`
- `POST /api/v1/host/verifications/identity`
- `PATCH /api/v1/host/verifications/identity`
- `POST /api/v1/host/enable`

#### Required behaviors

- create a new identity verification draft when none exists
- edit an existing draft
- upload one or more identity documents as part of the application
- show draft, submitted, rejected, and approved-on-backend states
- allow resubmission after rejection where the backend flow supports it
- keep the route-gate behavior intact so approved hosts still move into the real portal

#### Deliverables

- onboarding form workspace inside the host onboarding shell
- editable document-aware draft flow
- final review and submission action
- clearer rejected-state recovery path

### Area 2: Listing lifecycle completion

#### Goal

Close the remaining listing workflow gaps still expected by the original plan and API contracts.

#### Main files

- `components/host/properties/HostPropertiesPage.tsx`
- `components/host/properties/*`
- `components/host/properties/verification/*`
- `lib/host.ts`

#### APIs used

- `DELETE /api/v1/host/properties/:propertyId`
- property verification endpoints already used in Chunk 7

#### Required behaviors

- expose property delete action only where lifecycle rules allow it
- show clear confirmation before destructive delete
- keep submitted and approved listing protections intact
- extend verification upload flow to capture the document-level metadata the backend expects
- keep the verification and checklist flow honest after richer proof capture is added

#### Deliverables

- delete control on the properties workspace where valid
- delete helper in `lib/host.ts`
- richer verification uploader with document-aware metadata
- updated verification save flow that matches the backend contract more closely

### Area 3: Review workflow completion

#### Goal

Move the reviews workspace from read-mostly visibility to fuller plan parity.

#### Main files

- `app/host/reviews/page.tsx`
- `components/host/operations/reviews/*`
- `components/host/operations/reservations/*` if reservation handoff is the cleanest place to trigger review creation
- `lib/host.ts`

#### APIs used

- `GET /api/v1/host/reviews/property`
- `GET /api/v1/host/reviews/property/:reviewId`
- `GET /api/v1/host/reviews/guest`
- `POST /api/v1/host/reviews/guest`

#### Required behaviors

- show when a host can create a guest review
- connect guest-review creation to valid reservation context
- avoid exposing a generic review form without real eligibility context
- preserve existing property-review visibility
- improve review detail access where useful

#### Deliverables

- guest-review creation flow
- review-action handoff from eligible reservation context or a clearly scoped review panel
- detail-aware review rendering where it materially improves clarity

### Area 4: Operations filter and navigation parity

#### Goal

Bring the operations workspace closer to the richer, more navigable version implied by the original plan and backend filters.

#### Main files

- `components/host/hostNavigation.ts`
- `components/host/HostSidebar.tsx`
- `components/host/operations/reservations/*`
- `components/host/operations/reviews/*`
- `components/host/operations/earnings/*`
- `components/host/payouts/*`

#### APIs used

- reservation filter params
- review filter params
- earnings filter params
- payout filter params

#### Required behaviors

- add useful filters where the backend already supports them and where they improve real host workflows
- avoid decorative filters that do not change outcomes
- reorganize sidebar groupings to better match `Main`, `Operations`, and `Setup`
- add a lightweight verification-status navigation surface if needed for parity with the original IA

#### Deliverables

- stronger reservations filtering
- stronger review filtering
- stronger earnings and payout-history filtering
- improved sidebar grouping and route labeling parity

## UX Principles For Chunk 11

### Principle 1: Finish real workflows, not decorative gaps

If a missing feature affects the host’s ability to complete a real backend-supported workflow, prioritize it.

### Principle 2: Keep destructive or sensitive actions deliberate

Property delete and submission-related flows must be explicit, protected, and honest.

### Principle 3: Keep review actions contextual

Guest-review creation should come from a valid reservation or a clearly eligible state, not from a disconnected generic form.

### Principle 4: Keep filters useful

Only expose filters that improve how a host manages real information overload.

## Data And State Notes

### Onboarding state

The onboarding route must handle:

- no draft yet
- editable draft
- submitted and waiting
- rejected and editable again
- approved on backend but stale local session

### Property lifecycle state

Delete must respect the same listing-state honesty already present elsewhere:

- draft listings can be safely managed
- rejected listings may still be manageable depending on business rules
- submitted and approved listings should remain protected unless the backend explicitly allows otherwise

### Review state

Guest-review creation must be gated by the same completed-reservation rules used by the backend.

### Filter state

Prefer URL-backed filter state where the view benefits from shareability or refresh persistence.

## Risks

### Risk 1: Chunk 11 becomes a miscellaneous cleanup bucket

Guardrail:

- only include scope that is genuinely missing from the original full plan

### Risk 2: Onboarding document flow may be more complex than the current route shell implies

Guardrail:

- start with the backend-supported minimum viable application editor and keep the route-state model simple

### Risk 3: Property delete could conflict with current lifecycle protections

Guardrail:

- only expose delete where backend rules and product honesty make it safe
- do not weaken submitted/approved protections to force parity

### Risk 4: Review creation could feel disconnected if placed poorly

Guardrail:

- anchor the review action to completed reservation context wherever possible

### Risk 5: Extra filters can add clutter

Guardrail:

- implement only the highest-value backend-supported filters

## Acceptance Criteria

Chunk 11 is complete when:

1. `/host/onboarding` supports real draft creation, editing, document upload, and final host-request submission
2. rejected onboarding records have a believable recovery path instead of status-only messaging
3. host properties support delete where lifecycle rules genuinely allow it
4. property verification uploads capture richer document metadata expected by the backend
5. hosts can create guest reviews where backend eligibility allows it
6. review visibility and review-action handoffs feel complete and context-aware
7. operations pages expose useful additional filters where the backend already supports them
8. sidebar grouping more closely matches the original full-plan information architecture
9. the host portal still respects all existing route guards and listing-state protections
10. `npm.cmd run build` passes after implementation

## Verification Plan

After implementation:

1. verify logged-out and non-host access behavior still works correctly
2. verify onboarding draft creation from an empty state
3. verify onboarding draft edit and resubmission behavior
4. verify final onboarding submission flow
5. verify property delete only appears when allowed and is properly confirmed
6. verify verification uploads save the richer document payload correctly
7. verify guest-review creation appears only for valid reservation contexts
8. verify existing review visibility still works
9. verify added operations filters produce real filtered results
10. verify sidebar IA changes still preserve clear navigation
11. run `npm.cmd run build`

## Final Recommendation For Step 11

Treat Chunk 11 as the `remaining full-plan parity` step.

If this step is implemented well:

- the host portal will finally match the original product model more completely
- onboarding will become a real application flow instead of a status checkpoint
- listing, verification, reviews, and operations will close the last meaningful gaps left from the original plan
- the portal can then be considered functionally complete against both `HOST_PORTAL_FULL_PLAN.md` and `HOST_PORTAL_CHUNKED_PLAN.md`
