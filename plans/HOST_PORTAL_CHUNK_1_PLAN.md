# XYZ Travellers Host Portal Step 1 Plan

## Step Name

Chunk 1: Shared Host Shell

## Purpose

This document covers only the first implementation step from `HOST_PORTAL_CHUNKED_PLAN.md`.

It does not plan the full host portal.

It only plans the shared shell layer that the later host pages will reuse.

## Objective

Refactor the current host dashboard into a reusable host portal shell with:

- a light premium sidebar
- a mobile host topbar
- a reusable content layout
- route-aware host navigation
- the existing dashboard content rendered inside that shell

This step should create the visual and structural base for all later host routes without trying to implement onboarding, properties, reservations, or other deeper portal pages yet.

## Why This Is Step 1

Every later host page needs the same framing:

- sidebar navigation
- content padding and container width
- mobile menu behavior
- page header rhythm
- host-only portal feel that matches the redesign language

If this shell is not built first, later pages will either:

- duplicate layout code
- feel inconsistent
- need to be refactored again later

So this step exists to stabilize the portal structure before feature expansion.

## Current Starting Point

Right now the project already has:

- `app/host/dashboard/page.tsx`
- `components/host/HostDashboardShell.tsx`
- host-only access behavior inside the dashboard shell
- a public `Navbar` and `Footer`
- dashboard cards and overview sections already rendering real API data

Current limitation:

- the dashboard is still a standalone page, not a reusable host workspace layout
- there is no persistent sidebar
- there is no shared host portal shell for future routes

## Scope

This step includes:

- creating a reusable `HostShell`
- creating a reusable `HostSidebar`
- creating a reusable `HostTopbar`
- refactoring `HostDashboardShell` to render inside `HostShell`
- adding placeholder navigation items for future routes
- preserving current dashboard functionality and access states

This step does not include:

- onboarding pages
- host profile page
- payout setup page
- properties list or add-property flow
- businesses flow
- reservations, messages, reviews, earnings, or payout history pages

## Design Direction

This shell must follow `UI_REDESIGN_PLAN.md`.

### Visual principles

- cream or soft background
- subtle border and shadow treatment
- restrained lime accent for active state only
- clean editorial-travel feel, not enterprise admin styling
- compact but calm spacing

### Sidebar rules

- light surface
- readable sections
- small but clear active state
- premium hover feedback
- no dark left rail

### Layout rules

- keep `max-w-7xl mx-auto px-6` for main content rhythm where useful
- sidebar should feel like part of the product, not a third-party dashboard template
- mobile should use a drawer or slide-over interaction

## Route Coverage In This Step

This step only needs to fully support:

- `/host/dashboard`

The sidebar can contain placeholder links for future routes such as:

- `/host/properties`
- `/host/reservations`
- `/host/messages`
- `/host/earnings`
- `/host/profile`

But those routes do not need full implementations yet.

## File Plan

### New files

- `components/host/HostShell.tsx`
- `components/host/HostSidebar.tsx`
- `components/host/HostTopbar.tsx`

### Updated files

- `components/host/HostDashboardShell.tsx`
- `app/host/dashboard/page.tsx`

### Optional shared helpers

- `components/host/hostNavigation.ts`

If the navigation model needs to be reused cleanly, extract nav items into a shared local module.

## Component Responsibilities

### `HostShell`

Responsibilities:

- render overall two-column portal layout
- coordinate sidebar and mobile menu state
- render topbar on smaller screens
- provide consistent page spacing and content frame
- accept page title or header content as props if useful

Suggested props:

- `children`
- `title`
- `subtitle`
- `activePath` if needed, though `usePathname()` inside shell or sidebar is likely cleaner

### `HostSidebar`

Responsibilities:

- render host portal navigation
- show route-aware active item
- group links under simple labels if needed
- render secondary actions like homepage link and logout
- support desktop fixed view and mobile drawer view

Suggested nav groups for this first step:

- Main
- Setup

Initial links:

- Dashboard
- Add Property
- Properties
- Reservations
- Messages
- Earnings
- Host Profile

Only `Dashboard` must be treated as fully implemented in this step.

### `HostTopbar`

Responsibilities:

- mobile menu toggle
- current page title
- optional quick action slot
- keep layout light and uncluttered

### `HostDashboardShell`

Responsibilities after refactor:

- keep auth gating
- keep dashboard data loading
- keep error, access-denied, and loading states
- render dashboard content inside `HostShell`

Important note:

- access logic should stay here or in a small host guard helper
- layout logic should move into `HostShell`

## Navigation Plan

### Desktop

- sidebar visible on the left
- content area on the right
- current dashboard content becomes the first page inside the shell

### Mobile

- topbar visible at top
- menu button opens sidebar drawer
- drawer closes on navigation or explicit close action

### Active state behavior

- highlight only the current route
- no permanent visual emphasis on inactive items
- reuse the lesson already learned from the public navbar active-state issue

## Layout Structure

Suggested structure:

1. portal root wrapper
2. sidebar column
3. content column
4. mobile topbar inside content column
5. page header block
6. page body sections

Suggested page composition for dashboard after refactor:

1. `HostShell`
2. dashboard header section
3. metric cards grid
4. dashboard content grid

The existing dashboard sections can largely stay as they are, but they should sit inside the new shell cleanly.

## Styling Plan

### Sidebar styling

- background closer to `surface-card` or a slightly stronger surface
- soft border between sidebar and main content
- rounded inner navigation pills or cards
- active item uses lime-tinted surface and stronger text

### Content styling

- keep existing dashboard cards and sections
- reduce any spacing that feels too much once sidebar is added
- preserve the clean card rhythm already used in the current dashboard

### Footer and navbar decision

For this step:

- remove dependency on the public page-like framing inside the dashboard layout if needed
- prefer a portal-first shell over stacking public `Navbar` + dashboard + `Footer`

Reason:

- a real host shell should feel like a workspace, not a marketing page with dashboard content inserted between public site sections

If full removal feels too abrupt in this step, a transitional approach is acceptable:

- keep the top public header temporarily only if necessary
- but the target direction for this step should be a real host shell

## Access And State Behavior

This step must preserve the current behavior for:

- loading state
- logged-out redirect
- non-host access denied state
- dashboard API error state
- successful dashboard render state

Required rule:

- do not weaken any existing host access protections while refactoring layout

## Step-By-Step Build Checklist

### Part 1: Shared navigation model

- define host nav items
- mark which items are live vs placeholder
- define labels and hrefs

### Part 2: Build sidebar

- create desktop sidebar layout
- add grouped nav items
- add active route matching
- add homepage and logout actions

### Part 3: Build mobile topbar

- add page title
- add menu toggle
- add drawer open/close state

### Part 4: Build `HostShell`

- combine sidebar and content area
- wire mobile drawer behavior
- ensure content area scroll and spacing feel correct

### Part 5: Refactor dashboard into shell

- wrap current dashboard content in `HostShell`
- preserve API loading and access behavior
- remove duplicated layout responsibilities from dashboard page if possible

### Part 6: Polish

- tune spacing
- tune active states
- verify desktop and mobile behavior

## Risks

### Risk 1: Overbuilding the shell

If too many abstractions are introduced now, the shell may become harder to use for the next steps.

Guardrail:

- keep the shell simple
- only extract what later routes will clearly reuse

### Risk 2: Breaking access logic during layout refactor

Moving structure around may accidentally weaken host gating.

Guardrail:

- keep auth checks intact first
- change layout second

### Risk 3: Making the portal feel like a generic admin panel

Sidebar layouts often drift toward dark enterprise UI patterns.

Guardrail:

- stay close to the project’s existing light premium surface language

### Risk 4: Too many dead links in sidebar

Showing too many future routes may feel broken.

Guardrail:

- either label future items as coming soon
- or keep only a short set of placeholders

## Acceptance Criteria

This step is complete when:

1. `/host/dashboard` renders inside a reusable host shell
2. desktop sidebar is visible and styled in the project’s design language
3. mobile topbar and sidebar drawer work correctly
4. active route highlighting is correct
5. existing dashboard loading, error, and access states still work
6. no deeper host features are required to make this step complete
7. `npm.cmd run build` passes

## Verification Plan

After implementation:

1. open `/host/dashboard` on desktop and verify sidebar layout
2. open `/host/dashboard` on mobile width and verify drawer behavior
3. verify logged-out redirect still works
4. verify non-host access state still works
5. verify approved host dashboard data still renders
6. confirm placeholder sidebar items do not visually look broken
7. run `npm.cmd run build`

## Final Recommendation For Step 1

Treat this step as a `layout refactor with portal framing`, not as a feature expansion step.

If this is done well:

- every later host page becomes easier to build
- the portal immediately feels more real
- the add-property flow in Step 4 can plug into an already-finished workspace shell
