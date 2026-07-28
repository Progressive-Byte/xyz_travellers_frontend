# XYZ Travellers Front Portal Chunked Implementation Plan

## Purpose

This document breaks the currently documented public frontend API scope into smaller implementation chunks so the public-facing site can be converted from static/mock-driven content into a fully dynamic frontend.

This is not a redesign plan.

The visual direction already exists.

This is a frontend data-integration and execution plan derived only from these API documents:

- `api/front/front-homepage.md`
- `api/front/front-search.md`
- `api/front/front-property-details.md`

## Working Principles

- keep the existing public design direction as-is
- do not redesign homepage, listing cards, or property detail presentation unless the API contract forces small UI adjustments
- replace static and mock-driven public data with real API-driven rendering
- keep each chunk independently testable
- centralize public API contracts, normalization, and route mapping before wiring multiple pages
- prioritize shared listing-card data reuse because homepage, search, and similar properties all use the same card contract
- avoid inventing undocumented backend dependencies
- treat `propertyId` as the documented canonical public identifier unless a slug lookup API is later documented

## Frontend Dynamic Direction

The current public frontend already has a visual system and public page structure.

The main problem is not missing design.

The main problem is that the public experience is still largely powered by local mock data and static assumptions.

So this plan focuses on:

- making the homepage rails dynamic
- making the hero search hand off to a real search results page
- making property detail pages fetch real property data
- making similar properties and reusable cards use real API responses
- preserving the existing polish while replacing hard-coded content

## Important API Constraints

### 1. Homepage Is Not Search

`GET /api/v1/front/homepage/listings` is a curated homepage feed.

It must drive:

- the top property-type tabs
- the curated homepage section rails

It must not be treated like a search endpoint.

### 2. Search Is Its Own Workflow

`GET /api/v1/front/search/properties` is the public search API.

It must drive:

- keyword destination search
- stay-date filtering
- guest filtering
- paginated search results

### 3. Property Details Are Keyed By `propertyId`

The documented property details endpoint is:

- `GET /api/v1/front/properties/:propertyId`

The current frontend route is slug-based:

- `app/properties/[slug]/page.tsx`

Based only on the documented APIs, there is no public slug lookup endpoint.

So the safest plan is:

- switch the public property details route to use `propertyId`
  or
- support a transition route that still ends in a documented `propertyId`

This plan should not assume undocumented slug resolution.

## Recommended Delivery Order

Build in this order:

1. shared public API layer and route strategy
2. dynamic homepage tabs and curated rails
3. dynamic search results flow
4. dynamic property details page
5. public polish and QA

This order keeps the public site usable early while steadily replacing the current static frontend with real API-driven behavior.

## Chunk 1: Shared Public API Layer And Route Strategy

### Goal

Create the shared frontend foundation needed to power homepage cards, search results, and property details from the documented front APIs.

### Why this chunk comes first

Every later public page depends on:

- one shared API helper layer
- one shared listing card normalization shape
- one consistent image URL handling strategy
- one documented property route strategy

Without this foundation, homepage, search, and details would each invent their own mapping logic and drift quickly.

### Scope

- create a public API helper layer such as `lib/front.ts`
- normalize the shared listing card contract used by homepage, search, and similar properties
- define shared frontend types for homepage tabs, homepage sections, search results, and property details
- reuse the existing media URL strategy for public images so API-hosted files render correctly
- decide and document the canonical property details route around `propertyId`
- identify current mock-data dependencies that must be replaced in public pages and components

### Main files

- `lib/front.ts`
- `lib/api.ts`
- `app/page.tsx`
- `app/properties/[slug]/page.tsx` or a replacement `app/properties/[propertyId]/page.tsx`
- `components/ui/ListingCard.tsx`
- `components/property/*`
- `sections/Listings.tsx`
- `sections/Hero.tsx`
- `data/properties.ts`
- `data/homeCategories.ts`

### APIs used

- `GET /api/v1/front/homepage/listings`
- `GET /api/v1/front/search/properties`
- `GET /api/v1/front/properties/:propertyId`

### Shared contract requirements

- homepage cards and search cards should use one normalized public listing-card type
- `price.displayLabel` should be preferred over frontend price string formatting
- `rating.displayLabel` should be used when rating exists
- image URLs should be normalized for public rendering
- `badge === "New"` should drive the new-listing chip
- property detail normalization should preserve host, gallery, units, amenities, pricing, availability, reviews, and similar properties

### Deliverables

- shared public API helpers
- normalized public frontend types
- documented property route strategy based on available APIs
- reduced dependency on `data/properties.ts` for public listing content

### Acceptance criteria

- public API helpers exist for homepage, search, and property details
- listing-card data can be rendered from one shared normalized shape
- no later chunk needs to guess image formatting or price formatting rules
- the route strategy does not depend on undocumented slug APIs

## Chunk 2: Dynamic Homepage Tabs And Curated Rails

### Goal

Replace the homepage’s current static category and listing rails with the real homepage listings API while keeping the current homepage design intact.

### Why this chunk comes before search

The homepage is the first public impression and already has the main tab-to-listing relationship in the design.

The homepage API also defines the most reusable public listing-card payload.

That makes it the best first real page to connect.

### Scope

- replace local homepage category assumptions with backend `tabs`
- replace static listing rails with backend `sections`
- make top tab switching call the homepage API with `tab`
- map the existing `Hero` active category state to the backend tab keys
- render homepage section titles from API data
- render each section item using the normalized shared listing card shape
- handle loading, empty, and error states for the homepage rails

### Main files

- `app/page.tsx`
- `sections/Hero.tsx`
- `sections/Listings.tsx`
- `components/ui/ListingCard.tsx`
- `data/homeCategories.ts`
- `lib/front.ts`

### APIs used

- `GET /api/v1/front/homepage/listings`

### UI requirements

- keep the current homepage visual design
- tabs should highlight from `activeTab`
- homepage tabs should be driven from the backend payload, not hard-coded labels
- multiple curated sections should render as separate rails or grouped listing blocks
- the existing listing card visual language should remain the same
- homepage should show useful empty states if a tab returns no items

### Deliverables

- dynamic homepage tabs
- dynamic curated listing sections
- real homepage card content
- homepage loading and error handling

### Acceptance criteria

- switching tabs loads the correct homepage feed
- homepage sections render from the API response
- listing cards show real title, location, image, price, rating, and badge data
- no homepage rail depends on `data/properties.ts`

## Chunk 3: Dynamic Search Results Flow

### Goal

Create the real public search workflow by connecting the hero search controls to a dedicated search results page powered by the documented search API.

### Why this chunk is separate from homepage

Search has a different contract and different user intent than homepage browsing.

It includes:

- keyword search
- check-in and check-out logic
- guest count
- pagination

That deserves its own chunk and route.

### Scope

- create a public search results route such as `app/search/page.tsx`
- connect the hero search form to URL query parameters
- submit destination, dates, and guests into the search route
- load paginated results from the search API
- reuse the shared listing card component for search results
- show current query state, result count, page controls, and no-result states
- validate documented date rules before calling the API

### Main files

- `app/search/page.tsx`
- `sections/Hero.tsx`
- `components/ui/ListingCard.tsx`
- `components/layout/Navbar.tsx` only if search entry points are added there
- `lib/front.ts`

### APIs used

- `GET /api/v1/front/search/properties`

### Search requirements

- `q` should search destination text
- `checkIn` and `checkOut` must be submitted together
- `checkOut` must be greater than `checkIn`
- guests should be sent as an integer
- `page` and `limit` should drive pagination UI
- the frontend should not invent a sort control because the documented API has no public sort parameter

### UX requirements

- keep the current hero form design language
- move users from the homepage hero into a real results page
- search state should be reflected in the URL so results are shareable and refresh-safe
- results should reuse the same card look as the homepage
- empty states should explain whether the issue is filters, dates, or no matches

### Deliverables

- real public search route
- hero-to-search navigation
- paginated API-driven results
- search validation and error handling

### Acceptance criteria

- entering a destination and submitting reaches the search page
- dates and guests are carried into the search API call
- pagination works from API response fields
- search results no longer depend on local mock property data

## Chunk 4: Dynamic Property Details Page

### Goal

Convert the public property page from local mock content to the real property details API while preserving the current premium detail-page design.

### Why this chunk comes after homepage and search

Once listing cards and route strategy are already real, the property detail page can receive traffic from actual homepage and search clicks.

This makes the details conversion more realistic and easier to verify.

### Scope

- replace static property lookup logic with the public property details API
- update the property route to use the documented identifier strategy
- render gallery, summary, host info, location, reviews, units, pricing, and similar listings from the API response
- connect booking-side availability inputs to optional `checkIn`, `checkOut`, and `guests` query parameters
- surface eligible-unit filtering when stay filters are present
- reuse shared listing cards for similar properties
- replace mock metadata generation assumptions with API-driven or route-safe fallback metadata

### Main files

- `app/properties/[slug]/page.tsx` or `app/properties/[propertyId]/page.tsx`
- `components/property/PropertyGallery.tsx`
- `components/property/PropertyBookingCard.tsx`
- `components/ui/ListingCard.tsx`
- `lib/front.ts`
- `data/properties.ts`

### APIs used

- `GET /api/v1/front/properties/:propertyId`

### Detail page requirements

- title, description, property type, and rules should come from `property`
- gallery should use `gallery.coverImageUrl` and `gallery.items`
- pricing summary should use the API labels instead of hard-coded currency formatting
- location display should use `location.locationLabel`
- host section should use `host.displayName`, `profilePhoto`, and `bio`
- amenity display should use the `amenities` array
- review summary and review items should use the API response directly
- similar properties should reuse the shared listing card normalization
- units should respect availability filtering when dates and guests are present

### Route strategy note

Because the documented details endpoint uses `propertyId`, this chunk should not rely on the current local slug model unless a separate slug-to-id API is later documented.

The implementation should either:

- move to `/properties/[propertyId]`
  or
- maintain a compatibility layer only if a real source of slug-to-id mapping exists inside the documented API scope

### Deliverables

- real property detail page
- API-driven booking-side filters
- real similar listings
- real gallery, host, amenities, location, and reviews

### Acceptance criteria

- property pages fetch live data from the public details API
- similar properties render from the API response
- unit/pricing visibility changes correctly when dates and guests are provided
- the page no longer depends on `data/properties.ts` for its core content

## Chunk 5: Public Polish And QA

### Goal

Make the public dynamic frontend feel like one production-ready system after homepage, search, and property details are all live.

### Scope

- unify public loading states
- unify public empty states
- unify public API error states
- review responsive behavior for homepage rails, search results, and property details
- remove leftover mock-data dependencies from public pages
- review image loading behavior for public API-hosted assets
- verify public metadata, route behavior, and refresh behavior where possible

### Files touched

- `app/page.tsx`
- `app/search/page.tsx`
- `app/properties/**/*`
- `components/ui/*`
- `components/property/*`
- `sections/*`
- `lib/front.ts`
- `lib/api.ts`
- `data/properties.ts`
- `data/homeCategories.ts`

### QA checklist

- homepage tab switching
- homepage empty state for a tab with no returned items
- hero search submit
- search with keyword only
- search with keyword plus dates and guests
- invalid date-pair handling
- search pagination
- property details load
- property details with availability query parameters
- similar property links
- public image rendering
- build verification

### Acceptance criteria

- public pages feel visually unified
- public pages are dynamic instead of mock-driven
- no obvious static-property dependency remains in the main public journey
- `npm.cmd run build` passes

## Detailed Dependency Map

### Hard dependencies

- Chunk 1 before every other front-portal chunk
- Chunk 2 before homepage is considered dynamic
- Chunk 3 depends on Chunk 1 because search uses the shared listing-card contract and API layer
- Chunk 4 depends on Chunk 1 because property details need the shared API layer and route decision

### Soft dependencies

- Chunk 3 can begin in parallel with Chunk 2 after the shared public types are stable
- Chunk 5 should happen only after homepage, search, and details are all API-driven

## Suggested MVP Cut

If you want the fastest meaningful public dynamic frontend, ship this reduced path first:

1. Chunk 1: Shared Public API Layer And Route Strategy
2. Chunk 2: Dynamic Homepage Tabs And Curated Rails
3. Chunk 3: Dynamic Search Results Flow
4. Chunk 4: Dynamic Property Details Page

This gives you:

- dynamic homepage browsing
- real search
- real property details
- one shared public card contract

Then finish:

- Chunk 5 for public polish and QA

## Final Recommendation

Use the existing public design as the visual reference.

Use this file as the execution document for making that public design fully dynamic.

That means:

- the design stays largely intact
- the frontend becomes API-driven
- the route strategy follows documented backend contracts
- each chunk can now be implemented one at a time without inventing undocumented scope
