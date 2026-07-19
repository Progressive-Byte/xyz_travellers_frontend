# XYZ Travellers Host Portal Step 12 Plan

## Step Name

Chunk 12: Verification Status And Final Information Architecture Closure

## Purpose

This document covers only the twelfth implementation step after reviewing:

- `HOST_PORTAL_FULL_PLAN.md`
- `HOST_PORTAL_CHUNKED_PLAN.md`
- the existing Chunk 1 through Chunk 11 plan files
- the current host portal route tree and navigation structure

This is not a new product direction.

It exists because one small but still real parity gap remains between the original host portal plan and the live implementation:

- the planned `Verification Status` destination is still not represented as a first-class host route and navigation item

## Why Chunk 12 Exists

After comparing the current implementation against the two master host-planning documents, the host portal is already functionally complete through onboarding, setup, listing creation, businesses, submission, and operations.

Chunks 10 and 11 already closed the major parity gaps:

- Chunk 10 handled final polish and QA
- Chunk 11 handled the remaining full-plan parity gaps like onboarding workflow completion, property delete, richer verification proof handling, guest-review creation, and stronger operations filters

So there is no large missing feature family left to plan.

However, the original full plan still described a `Verification Status` item inside the host portal setup information architecture, and that destination is still not represented clearly in the live host workspace.

Current state:

- onboarding status exists inside `/host/onboarding`
- property submission and verification status exist inside the property workflow
- dashboard and property list pages show some status information
- sidebar navigation does not yet expose a dedicated verification-status destination

That means hosts can see status information in several places, but the portal still lacks one explicit status-focused route that matches the original IA.

So Chunk 12 should be treated as:

- a very small final parity chunk
- an information-architecture closure step
- not a new feature expansion
- not a redesign
- not a rewrite of existing host flows

## Objective

Create a small, dedicated host verification-status workspace that makes the original planned IA complete and gives hosts one clear place to understand:

- host application or account verification state
- property review and submission state
- rejection reasons where available
- the correct next route when action is required

This chunk should:

- add a first-class `Verification Status` route to the host area
- add a matching navigation destination in the shared host sidebar
- centralize the most important status signals that are currently scattered across onboarding, properties, and verification screens
- keep all existing route guards and workflow rules intact
- avoid reopening already-correct flows just to move logic around

## Remaining Gap Confirmed From The Original Plans

### Gap 1: Setup IA still lacks a dedicated verification-status destination

The original full plan described the host sidebar with:

- `Dashboard`
- `Add Property`
- `Properties`
- `Reservations`
- `Messages`
- `Earnings`
- `Payouts`
- `Reviews`
- `Host Profile`
- `Businesses`
- `Verification Status`

Current live implementation already includes the rest of that navigation family in some form.

What is still missing is:

- a first-class `Verification Status` destination
- a dedicated page that explains status across the host lifecycle in one place

### Gap 2: Status signals are present, but still fragmented

Today the host can find status in multiple places:

- onboarding status on `/host/onboarding`
- listing status on `/host/properties`
- verification and submission status inside `/host/properties/[propertyId]/verification`
- some quick guidance from the dashboard

What is still missing is:

- one route whose primary job is to answer `what is waiting, what is approved, what was rejected, and what should I do next`

## Scope

Chunk 12 includes:

- a new host-facing verification-status route
- sidebar navigation parity for `Verification Status`
- a status summary for host application or host-account verification
- a status summary for property submission and review pipeline
- rejection-reason surfacing where already available from existing APIs
- action links that send the host to the correct route for recovery or continuation
- lightweight dashboard and onboarding handoffs only if needed to make the new route discoverable

Chunk 12 does not include:

- rebuilding the onboarding form flow
- rebuilding property verification upload flows
- inventing a new approval process
- adding admin moderation tools
- replacing existing status surfaces that already work inside the property workflow
- adding new backend scope not already implied by the existing host APIs and master plans

## Product Goal For This Step

After Chunk 12, the host portal should have no meaningful information-architecture gap left against the original master plans.

The result should be:

- the sidebar matches the originally intended host workspace more closely
- hosts have one dedicated place to check approval and submission progress
- rejection reasons and next steps are easier to find
- status handling feels deliberate instead of scattered
- the portal can be considered structurally complete against the original plan set

## Internal Execution Sections

Chunk 12 is still one official plan file, but the work should be executed in a few tightly scoped internal sections.

### Internal Section A: Verification-status route foundation

Focus:

- create the route
- define the page purpose clearly
- load the minimum status data needed for the page
- keep shell usage and route gating aligned with the current host architecture

Why this comes first:

- the biggest remaining gap is simply that this destination does not exist yet

### Internal Section B: Status aggregation and next-action design

Focus:

- host application or account verification summary
- property review pipeline summary
- rejected-state visibility
- actionable links to the correct follow-up route

Why this matters:

- a status page is only useful if it helps the host understand what to do next

### Internal Section C: Navigation and handoff completion

Focus:

- sidebar item
- page metadata
- optional dashboard or onboarding CTA links
- final parity review against the original information architecture

Why this matters:

- the original plan gap is partly about route existence and partly about discoverability

Important rule:

- keep Chunk 12 small and targeted
- do not expand this into a generic cleanup bucket

## Detailed Scope

### Area 1: Verification-status hub

#### Goal

Create a dedicated route whose primary purpose is to communicate host verification and submission state clearly.

#### Proposed route

- `app/host/verification/page.tsx`

#### Main files

- `app/host/verification/page.tsx`
- `components/host/verification/*`
- `components/host/hostNavigation.ts`
- `components/host/HostRouteGate.tsx` only if route-access rules need a small adjustment
- `lib/host.ts`

#### APIs used

- `GET /api/v1/host/verifications/identity`
- `GET /api/v1/host/properties`
- `GET /api/v1/host/properties/:propertyId/status` only if the page needs deeper status detail than the list endpoint already provides

#### Required behaviors

- show the host application or account verification state in a clear summary block
- show whether the host is still in draft, submitted, rejected, or approved state where that distinction is relevant
- surface rejection reasons when the backend already provides them
- show a property verification or submission summary that highlights `draft`, `submitted`, `approved`, and `rejected`
- show the most important follow-up CTA for each state
- keep the UI lightweight and summary-first instead of duplicating full editors inside the page

#### Deliverables

- live `/host/verification` route
- verification-status summary cards or sections
- clear next-action links into onboarding or listing routes

### Area 2: Navigation parity and lifecycle handoffs

#### Goal

Make the new status route discoverable and aligned with the original sidebar model.

#### Main files

- `components/host/hostNavigation.ts`
- `components/host/HostSidebar.tsx`
- `components/host/HostDashboardShell.tsx` only if a dashboard handoff is useful
- `components/host/onboarding/*` only if onboarding should link into the new status destination

#### Required behaviors

- add `Verification Status` to the shared host navigation in the correct group
- ensure active-route matching works correctly
- keep the label aligned with the wording already used in the original full plan
- add a lightweight CTA or handoff from the dashboard or onboarding area if that improves discoverability

#### Deliverables

- sidebar IA updated to include `Verification Status`
- page meta and route matching updated for the new destination
- status route becomes reachable without relying on deep property pages

### Area 3: Status honesty and recovery guidance

#### Goal

Make the page useful by showing honest status and the correct recovery path without inventing duplicate workflow logic.

#### Required behaviors

- if host approval is still pending, explain that clearly and link to the onboarding flow when editing is still allowed
- if host approval is rejected, surface the rejection reason and route the user back toward onboarding correction
- if properties are rejected, link directly to the relevant property editor or verification route
- if properties are submitted, explain that they are waiting for review rather than offering misleading edit actions
- if everything is approved, show a calm completed state instead of an empty or confusing one

#### Deliverables

- actionable rejection-state guidance
- trustworthy read-only messaging for submitted or approved states
- no duplicate forms or fake inline editing inside the status page

## UX Principles For Chunk 12

### Principle 1: Summary first

This page should summarize status and route the host to the right next place.

It should not become another editing workspace.

### Principle 2: One source of truth

Use the existing API-backed status sources and avoid inventing parallel state models.

### Principle 3: Honest action design

Never show edit or recovery actions that conflict with existing status protections for submitted or approved records.

### Principle 4: Complete the IA without adding clutter

The new route should close the remaining structural gap, not add another noisy page that duplicates information without helping the host.

## Data And State Notes

### Host verification state

The page should handle:

- no onboarding draft yet
- editable draft
- submitted and waiting
- rejected with reason
- approved on backend

### Property status state

The page should handle:

- no properties yet
- draft properties that still need work
- submitted properties waiting for review
- rejected properties that need correction
- approved properties that are live or ready

### Route-access note

If the new status route is meant to be useful before host approval, `HostRouteGate` may need a small routing exception or status-aware access rule for `/host/verification`.

If that complicates the current gating model too much, the route can remain approved-host-only and focus on account approval summary plus property review status.

This decision should be made in implementation based on the cleanest route-access behavior, not by forcing a more complex gate than necessary.

## Risks

### Risk 1: Chunk 12 adds a page that duplicates existing workflow screens

Guardrail:

- keep the route summary-oriented and action-linked, not editor-heavy

### Risk 2: The new route complicates host access gating

Guardrail:

- only broaden route access if it materially improves lifecycle clarity
- otherwise keep the page inside the approved host portal and summarize approved-account state plus property review status

### Risk 3: Property-status detail becomes too deep for a small final chunk

Guardrail:

- start with list-level status aggregation and only fetch per-property detail when needed for rejection reason clarity

### Risk 4: The page becomes a miscellaneous dashboard duplicate

Guardrail:

- the dashboard remains the overview
- the verification-status route should focus specifically on approval, review, rejection, and next-action clarity

## Acceptance Criteria

Chunk 12 is complete when:

1. the host portal has a first-class `Verification Status` route
2. the shared sidebar includes `Verification Status` in the correct information-architecture group
3. the new page clearly communicates host verification or approval state
4. the new page clearly communicates property submission and review state
5. rejection reasons are surfaced where existing APIs already provide them
6. next-action links guide the host toward onboarding correction, property editing, or property verification as appropriate
7. the route does not weaken existing host access rules or listing-state protections
8. the page feels like a targeted status hub, not a duplicate editor
9. `npm.cmd run build` passes after implementation

## Verification Plan

After implementation:

1. verify the new navigation item appears in the shared host sidebar
2. verify the new route loads inside the existing host shell as intended
3. verify host verification state renders correctly for the supported lifecycle states
4. verify property status summaries reflect real listing states
5. verify rejected-state guidance links to the correct recovery route
6. verify submitted and approved states do not expose misleading edit actions
7. verify route-gate behavior still works correctly for logged-out users, non-host users, and approved hosts according to the chosen access model
8. run `npm.cmd run build`

## Final Recommendation For Step 12

Treat Chunk 12 as the `final information-architecture closure` step.

It should stay intentionally small.

If implemented well:

- the host portal will keep the functional completeness reached by Chunk 11
- the original master-plan sidebar model will finally be represented cleanly
- hosts will gain one clearer place to understand approval, submission, rejection, and next steps
- the full host portal can then be considered both functionally and structurally complete against the current planning documents
