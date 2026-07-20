# XYZ Travellers Admin Portal Chunked Implementation Plan

## Purpose

This document breaks the currently available admin-facing API scope into smaller implementation chunks so the admin portal can be planned and delivered in a controlled order.

This is not a new product direction.

It is an execution plan derived only from these API documents:

- `api/admin/admin-auth.md`
- `api/admin/admin-host-applications.md`
- `api/admin/admin-homepage-curation.md`

## Working Principles

- keep the scope limited to the currently documented admin APIs
- do not design speculative admin modules outside the available backend contracts
- keep each chunk independently testable
- build secure admin access before protected admin workflows
- finish host-application review before homepage curation because access control and decision actions are more foundational
- keep admin UI operational, compact, and table-first where appropriate

## Admin Design Direction

The admin portal design should follow the same operational direction used as reference in the host portal redesign work:

- compact by default
- list-first workspaces
- low scrolling overhead
- table-first management views where the task is operational
- focused detail pages instead of oversized card stacks
- clear separation between login, shell, moderation, and curation workflows

This means the admin portal should not feel like a marketing dashboard.

It should feel like a compact control workspace.

## Why A Design Plan Is Needed Here Too

Even with a small initial admin API scope, the admin portal still needs a clear visual and workflow direction.

Without that design direction, the portal would risk:

- oversized cards and tall layouts
- inconsistent page anatomy across auth, moderation, and curation
- unclear ownership between section lists and section detail pages
- repeated helper text and decorative spacing instead of operational density
- admin tools that look like generic dashboards instead of working control panels

So this plan should guide not only feature order, but also workspace shape.

## Admin UX Principles

### 1. Compact By Default

Every admin page should use tight vertical spacing and surface more useful information above the fold.

This means:

- shorter headers
- smaller cards
- fewer decorative gaps
- concise helper text
- denser operational rows and controls

Compact does not mean cramped.

It means:

- strong alignment
- clear hierarchy
- faster scanning
- less wasted space

### 2. List First

Operational admin menus should start with an index or list view before any detail workflow.

The default admin pattern should be:

1. open the menu
2. see the list
3. filter or search if needed
4. open an item
5. perform the relevant action

This should apply especially to:

- host applications review
- homepage sections management
- homepage section item management

### 3. Add Belongs To The Workspace

Creation actions should live inside the relevant admin workspace, not as separate top-level navigation.

That means:

- `Homepage Curation` owns `Create section`
- section detail owns `Add property to section`

This keeps the admin sidebar smaller and keeps each workspace responsible for its own actions.

### 4. One Menu, One Job

Each admin menu should have one clear responsibility.

The early admin portal should avoid mixed-purpose menus like:

- one page trying to be both moderation queue and editorial curation center
- homepage curation mixing section settings and global admin settings

### 5. Standardized Page Anatomy

Admin list pages should follow:

1. compact page header
2. optional one-line status strip
3. toolbar with search, filter, and primary action
4. list or table body
5. pagination or footer actions when needed

Admin detail pages should follow:

1. compact header with key actions
2. main detail content
3. operational side panels only when they help decisions

### 6. Distinct Admin Login

Admin authentication should use its own dedicated entry route and page instead of sharing the general user or host login surface.

Required route:

- `/admin/login`

Reason:

- admin access is operationally different from host access
- the admin token contract is different
- route protection becomes clearer
- accidental user confusion is reduced

## Proposed Admin Information Architecture

## Main

- Dashboard
- Host Applications
- Homepage Curation

## Secondary

- Logout

## Important Navigation Notes

### Keep Admin Login Outside The Protected Shell

The admin login route should be its own page and should not render inside the admin shell.

Use:

- `/admin/login`

Then redirect authenticated admins into:

- `/admin`
  or
- `/admin/dashboard`

### Keep Homepage Section Creation Inside Homepage Curation

Do not add `Create Section` as a separate sidebar item.

New rule:

- `Homepage Curation` is the sidebar item
- `Create section` is the primary action inside that workspace

## Recommended Delivery Order

Build in this order:

1. admin auth and protected admin shell
2. host applications review workspace
3. homepage curation workspace
4. admin polish and QA

This order keeps the admin portal safe first, then useful for moderation, then useful for editorial curation.

## Chunk 1: Admin Auth And Protected Shell

### Goal

Create a secure admin entry path and a reusable admin layout that all later admin routes can share.

### Why this chunk comes first

Every other admin route depends on:

- authenticated admin access
- admin-only route protection
- a stable admin shell
- a reusable session-aware navigation pattern

Without this foundation, later admin pages would either be publicly reachable or repeated inconsistently.

### Scope

- build a dedicated admin login page at `/admin/login`
- call admin login endpoint
- store admin token safely in the frontend session layer
- protect admin routes by role and auth state
- create reusable admin shell, sidebar, and topbar
- create an initial admin landing route after login

### Main files

- `app/admin/login/page.tsx`
- `app/admin/page.tsx` or `app/admin/dashboard/page.tsx`
- `components/admin/*`
- `context/AuthContext.tsx` only if the current auth system can be extended cleanly
- `lib/admin.ts` or equivalent admin API helper layer

### APIs used

- `POST /api/v1/auth/admin/login`

### UI requirements

- admin login is visually distinct from host login
- admin login lives on its own dedicated route: `/admin/login`
- failed login states are clearly surfaced
- protected admin routes redirect unauthenticated users back to admin login
- authenticated non-admin users are denied access cleanly
- shared admin shell is compact, task-focused, and ready for list-heavy screens
- admin shell should follow the compact workspace design rules defined in this plan

### Deliverables

- working admin login page on `/admin/login`
- protected admin shell
- session-aware admin route guard
- placeholder navigation for later admin modules

### Acceptance criteria

- valid admin credentials log in successfully
- non-admin users cannot access admin routes
- logged-out users are redirected to `/admin/login`
- protected admin routes render inside the admin shell
- build still passes

## Chunk 2: Host Applications Review Workspace

### Goal

Give admins a practical review workspace to approve or reject host applications.

### Why this chunk comes before homepage curation

Host approval is a more foundational operational workflow than homepage curation because it affects:

- who becomes a host
- who can enter the host portal
- whether new listings can exist at all

### Scope

- create host applications review page
- show application identity verification details
- show submitted verification documents
- support approve and reject actions
- require rejection reason when rejecting
- show post-action status clearly
- surface re-login guidance when approval changes user roles

### Main files

- `app/admin/host-applications/page.tsx`
- `components/admin/host-applications/*`
- `lib/admin.ts`

### APIs used

- `PATCH /api/v1/admin/host-applications/:userId/review`

### Required UI states

- ready to review
- action in progress
- approved
- rejected
- failure state when review action is rejected by the API

### Data requirements to surface

- target user identity
- submitted verification documents
- verification status
- submitted timestamp
- rejection reason if present
- resulting user roles after approval

### UX requirements

- review actions must be explicit and hard to trigger accidentally
- rejection action must reveal a reason input
- success state should explain that approved users need to log in again to receive updated roles
- the page should read like an operational moderation screen, not a marketing page

### Deliverables

- host application review workspace
- approve action flow
- reject action flow with required reason
- clear success and error feedback

### Acceptance criteria

- admin can approve a host request
- admin can reject a host request with a reason
- API validation errors are surfaced clearly
- updated verification status is visible after the action
- host-role refresh guidance is visible after approval

## Chunk 3: Homepage Curation Workspace

### Goal

Give admins the ability to manage public homepage sections and curate approved properties into them.

### Why this chunk is separated

Homepage curation is editorial and operationally distinct from account review. It deserves its own chunk because it includes two related but separate layers:

- section management
- section item management

### Scope

- build homepage sections index page
- build create/edit section form
- build section detail workspace
- add approved properties into a section
- update section item metadata
- remove properties from a section
- delete sections

### Main files

- `app/admin/homepage/page.tsx` or `app/admin/homepage-sections/page.tsx`
- `app/admin/homepage-sections/[sectionId]/page.tsx`
- `components/admin/homepage/*`
- `lib/admin.ts`

### APIs used

- `GET /api/v1/admin/homepage-sections`
- `POST /api/v1/admin/homepage-sections`
- `GET /api/v1/admin/homepage-sections/:sectionId`
- `PATCH /api/v1/admin/homepage-sections/:sectionId`
- `DELETE /api/v1/admin/homepage-sections/:sectionId`
- `POST /api/v1/admin/homepage-sections/:sectionId/items`
- `PATCH /api/v1/admin/homepage-sections/:sectionId/items/:propertyId`
- `DELETE /api/v1/admin/homepage-sections/:sectionId/items/:propertyId`

### Section form requirements

- title
- slug
- description
- isActive
- sortOrder

### Section item requirements

- propertyId
- sortOrder
- isActive

### UX requirements

- sections list should be table-first and operational
- active and inactive sections should both be visible
- section detail should clearly separate section metadata from curated items
- add-property-to-section flow must explain that only approved properties are valid
- duplicate-property and invalid-property API failures should be surfaced directly

### Suggested implementation order inside this chunk

1. sections list
2. create and edit section form
3. section detail page
4. add property to section
5. update section item metadata
6. remove property from section
7. delete section

### Deliverables

- homepage sections index
- section create and edit flow
- curated items management inside a section
- active/inactive state controls

### Acceptance criteria

- admin can create a homepage section
- admin can edit section metadata
- admin can add an approved property to a section
- admin can update item sort order and item active state
- admin can remove a property from a section
- admin can delete a section without affecting the underlying property

## Chunk 4: Admin Polish And QA

### Goal

Make the admin routes feel like one system and verify that the currently documented admin scope works reliably.

### Scope

- unify admin loading states
- unify admin empty states
- unify admin error states
- review compact desktop layouts
- review mobile admin behavior where needed
- confirm that auth handling is consistent across all admin routes
- confirm API validation messaging is usable in moderation and curation flows

### Files touched

- `components/admin/*`
- `app/admin/**/*`
- `lib/admin.ts`
- shared auth files only if needed for consistency

### QA checklist

- admin login success
- admin login failure
- admin route protection for logged-out users
- admin route protection for non-admin users
- host application approve flow
- host application reject flow with reason
- homepage sections list
- create, edit, and delete section flow
- add, edit, and remove section item flow
- build verification

### Acceptance criteria

- admin portal feels visually unified
- route guards behave correctly
- core error and success feedback is consistent
- no obviously inconsistent admin page styling remains
- `npm.cmd run build` passes

## Detailed Dependency Map

### Hard dependencies

- Chunk 1 before every other admin chunk
- Chunk 2 before any production admin moderation workflow is considered complete
- Chunk 3 depends on Chunk 1 because every curation endpoint is protected

### Soft dependencies

- Chunk 2 and Chunk 3 can share the same admin shell and auth foundation once Chunk 1 is complete
- Chunk 4 should happen after both operational admin workspaces are stable

## Suggested MVP Cut

If you want the fastest meaningful admin MVP, ship this reduced path first:

1. Chunk 1: Admin Auth And Protected Shell
2. Chunk 2: Host Applications Review Workspace
3. Chunk 3: Homepage Curation Workspace

This gives you:

- secure admin access
- host approval and rejection control
- homepage editorial curation control

Then add:

- Chunk 4 for admin polish and QA hardening

## Final Recommendation

Use the three admin API documents as the source of truth for current admin scope.

Use this file as the execution document.

That means:

- the API docs define what the admin portal can do right now
- this chunked plan defines the safest build order
- each chunk can be implemented independently without expanding beyond the documented backend surface
