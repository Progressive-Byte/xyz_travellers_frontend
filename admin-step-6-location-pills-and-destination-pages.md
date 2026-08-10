# Admin Step 6 Plan: Location Pills + Public Destination Pages (Listings / Transport / Food)

## Purpose

This step adds a **curated location layer** that starts from the top of the **public homepage/search bar area** and ends on **destination landing pages** with three sections:

1. Apartment / House listings for that location
2. A curated **Transportation Services** section for that location
3. A curated **Food & Restaurant** section for that location

The content flow the product wants is:

- Above the public search bar, show **horizontally scrollable small pills**.
- Each pill shows a **location name**.
- An **Admin** can **add / remove / modify / reorder** these pill locations.
- When a **user clicks a pill**, they navigate to a **new location page** bound to that location.
- On the location page:
  1. **Section 1:** property/unit listings for that location
  2. **Section 2:** static, backend-controlled **Transportation Services** block
     - Title + Subtitle
     - Left hero image
     - Right card list (Name, Contact Number)
     - Pagination at **5 items per page**
  3. **Section 3:** static, backend-controlled **Food & Restaurant** block
     - Title + Subtitle
     - Left hero image
     - Right card list (Restaurant Name, Phone Number, Location)
     - Pagination at **5 items per page**

This plan is split into **two halves**:

- **Part A: API / Backend** — data models, Admin CRUD, Public read endpoints, validation, docs
- **Part B: Frontend** — pill strip UX, location landing page, 3-section layout, pagination, routing

---

## Why This Step Now

The repo already has:

- Property discovery foundation (approved properties, homepage curation model, booking flow)
- Admin CRUD conventions (`admin.routes.ts` / `admin.controller.ts` / `admin.service.ts` / `admin.validation.ts`)
- Documentation structure (`docs/api/admin/...`, `docs/api/front/...`, `src/docs/openapi.yaml`)
- Embedded-item pattern in `HomepageSection` for curating related content

But it still lacks:

1. A curatable list of **destination locations** shown as homepage pills
2. Destination pages with:
   - properties filtered by a concrete location
   - curated transport / restaurant info blocks
3. Admin content management for transport listings and food listings per location

Without this step, those pages would need to be hand-rolled per location or live outside the normal admin content pipeline.

---

## Scope Of This Step

### In Scope

#### Admin APIs
- Admin CRUD for **Location Pills** (name, slug, city, country, hero image optional, isActive, sortOrder)
- Admin CRUD for **Transportation Services** bound to a location
- Admin CRUD for **Food & Restaurant** listings bound to a location
- Admin reorder / activate / deactivate controls for pills and section items
- Admin list filters for:
  - location pills by active state
  - transport/food items by location or active state

#### Public APIs
- **Public** endpoint to read **active location pills** (for the pill strip above search)
- **Public** endpoint to read a **location page bundle**:
  - location metadata (for title, SEO, hero)
  - paginated property/unit listing filtered by that location
  - paginated transport services for that location (pageSize = 5)
  - paginated food & restaurants for that location (pageSize = 5)
- **Public** endpoint to separately read paginated transport / food lists if frontend wants lazy loading

#### Frontend
- Add **horizontally scrollable pill strip** above homepage/search bar, populated from Public API
- On pill click, **navigate** to a new route, e.g. `/destination/:locationSlug`
- On the destination page, render three sections matching the requested layout
- Implement **left image + right cards** section frame with pagination
- Wire **5-items-per-page pagination** controls for both static sections
- Handle empty states, loading states, and scroll behavior for the pill strip

### Out Of Scope

- Booking checkout or payments changes
- Review, messages, notifications changes
- Automatic location recommendations or ranking
- Dynamic property filtering widgets beyond location binding (price filters, amenity filters, etc.) — those can layer on later
- Translation / i18n content variants (v1 stores single-language strings)
- Image upload pipeline implementation details beyond where URLs are stored (assume existing media pattern)

---

## Current Repository State

Relevant files and patterns already in the project:

- Admin routing, controller, service, validation layers under:
  - `src/modules/admin/admin.routes.ts`
  - `src/modules/admin/admin.controller.ts`
  - `src/modules/admin/admin.service.ts`
  - `src/modules/admin/admin.validation.ts`
- Embedded curation pattern under:
  - `src/modules/admin/homepageSection.model.ts`
- Property data already exposes location fields in `src/modules/properties/property.model.ts`:
  - `address`
  - `city`
  - `country`
  - `lat`
  - `lng`
- Public docs folder:
  - `docs/api/front/front-homepage.md`
  - `docs/api/front/front-search.md`
  - `docs/api/front/front-property-details.md`
- Admin docs folder under `docs/api/admin/`
- OpenAPI spec at `src/docs/openapi.yaml`

What is missing today:

1. A Location / destination model
2. Location pill admin endpoints
3. Per-location transport company list model + endpoints
4. Per-location food/restaurant list model + endpoints
5. Public endpoints to:
   - list active pills
   - read a destination page with the three sections
6. Frontend pill strip and destination page layouts

---

# Part A — API / Backend Plan

## Goal (Backend)

By the end of Part A, the backend should support:

1. Admin can create, list, get, update, delete, activate, reorder **location pills**.
2. Admin can create, list, get, update, delete, activate, reorder **transport services** inside a location.
3. Admin can create, list, get, update, delete, activate, reorder **food / restaurant** listings inside a location.
4. Public can read **active pills** for the homepage pill strip.
5. Public can read a **destination page payload** for a location slug, with:
   - location details
   - paginated approved property/unit listing
   - paginated transport (pageSize = 5)
   - paginated food (pageSize = 5)
6. OpenAPI and admin/front docs reflect all new requests and responses.

---

## 1. Data Models

### 1.1 Location Pill Model

New file:
- `src/modules/admin/location.model.ts`

Suggested fields:

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `name` | String | Yes | — | Displayed on pill. Example: `"Gulshan"`, `"Cox's Bazar"` |
| `slug` | String | Yes | Generated from `name` if missing | URL-safe, unique. Used in `/destination/:slug` |
| `city` | String | Yes | — | Matches property `city` for listing filter. Case-normalized. |
| `country` | String | Yes | — | Matches property `country`. |
| `description` | String | No | `''` | Short subtitle/description for destination page header. |
| `heroImage` | String | No | `null` | Optional location hero image URL. |
| `isActive` | Boolean | No | `true` | Inactive pills are not shown on public site. |
| `sortOrder` | Number | No | `0` | Pill strip order (ascending). |
| `timestamps` | — | — | Mongo default | `createdAt`, `updatedAt` |

Indexes:
- `{ slug: 1 }` unique
- `{ isActive: 1, sortOrder: 1, createdAt: -1 }` for public pill list
- `{ city: 1, country: 1 }` optional, useful for reporting

Rules:
- `slug` must be **unique across all locations**.
- `name` should be trimmed.
- `city` and `country` should be trimmed and normalized (title-case or lowercase at storage layer) to avoid location mismatches against property city/country.

#### Why normalized city + country matters

Property list filtering will match by:
```
property.city == location.city AND property.country == location.country
```

If admin writes `"Dhaka"` vs `"dhaka"`, properties silently drop out of the section. Normalize both on write.

---

### 1.2 Transport Listing Sub-schema (embedded inside Location)

Embed a `transportServices` array inside `Location`, so each location owns its own list. This matches the current `HomepageSection.items` pattern in `homepageSection.model.ts`.

Shape of each transport item:

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `id` / `_id` | ObjectId | Yes | Auto | For update/delete by id |
| `companyName` | String | Yes | — | Card: Name of transport company |
| `contactNumber` | String | Yes | — | Card: Phone / contact. Store as string to allow `+`, spaces. |
| `description` | String | No | `''` | Optional short note (e.g., "Airport pickup only") |
| `heroImage` | String | No | `null` | URL for the **left image** in Section 2 layout. If none, fallback to Location hero. |
| `sectionTitle` | String | No | `null` | Optional override for Section 2 Title. If absent, use Location defaults. |
| `sectionSubtitle` | String | No | `null` | Optional override for Section 2 Subtitle. If absent, use Location defaults. |
| `sortOrder` | Number | No | `0` | Order of right-hand cards |
| `isActive` | Boolean | No | `true` | Admin can hide without deleting |
| `timestamps per item` | — | — | (Optional) | Not strictly required; keep simple in v1. |

Indexes are implicitly handled via embedding; use `sort` on query.

---

### 1.3 Food / Restaurant Sub-schema (embedded inside Location)

Embed a `foodRestaurants` array inside `Location`.

Shape of each food item:

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `id` / `_id` | ObjectId | Yes | Auto | For update/delete by id |
| `restaurantName` | String | Yes | — | Card: Restaurant name |
| `phoneNumber` | String | Yes | — | Card: Restaurant phone |
| `location` | String | Yes | — | Card: Short address / landmark (user requested: "location") |
| `description` | String | No | `''` | Optional description line |
| `heroImage` | String | No | `null` | URL for left image in Section 3 layout. Fallback: Location hero or item first image. |
| `sectionTitle` | String | No | `null` | Optional override for Section 3 Title |
| `sectionSubtitle` | String | No | `null` | Optional override for Section 3 Subtitle |
| `sortOrder` | Number | No | `0` | Order of right-hand cards |
| `isActive` | Boolean | No | `true` | Admin can hide without deleting |

---

### 1.4 Default Section Titles / Subtitles (on Location model)

To keep the static section configurable from backend **once per location** (not per item), add these on `Location`:

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `transportSectionTitle` | String | No | `"Transportation Services"` | Section 2 title |
| `transportSectionSubtitle` | String | No | `"Local transport companies and contact details"` | Section 2 subtitle |
| `foodSectionTitle` | String | No | `"Food & Restaurant"` | Section 3 title |
| `foodSectionSubtitle` | String | No | `"Recommended restaurants near this location"` | Section 3 subtitle |
| `transportHeroImage` | String | No | `null` | Override Section 2 left image (overrides per-item hero) |
| `foodHeroImage` | String | No | `null` | Override Section 3 left image (overrides per-item hero) |

Fallback priority for the **left image** in each static section (per the requested layout):

For Transport:
1. `location.transportHeroImage`
2. First active transport item's `heroImage`
3. `location.heroImage`
4. Empty / placeholder

For Food:
1. `location.foodHeroImage`
2. First active food item's `heroImage`
3. `location.heroImage`
4. Empty / placeholder

The backend should resolve this in the public response so the frontend does not have to re-implement precedence.

---

## 2. Admin APIs

All Admin endpoints must be protected with:

- `auth` middleware
- `requireRoles(['admin'])`

Base prefix: `/api/v1/admin`

### 2.1 Location Pill CRUD

#### `GET /admin/locations`
List all location pills (including inactive).

Query params:
- `isActive` (optional, boolean)

Sort:
- `sortOrder` ascending, then `createdAt` descending.

Response: list summary items.

#### `POST /admin/locations`
Create a location pill.

Body shape:
```json
{
  "name": "Cox's Bazar",
  "slug": "coxs-bazar",
  "city": "Cox's Bazar",
  "country": "Bangladesh",
  "description": "Popular seaside destination in south-east Bangladesh",
  "heroImage": "https://...coxs-bazar.jpg",
  "isActive": true,
  "sortOrder": 1,
  "transportSectionTitle": "Transportation Services",
  "transportSectionSubtitle": "Local transport companies and contact details",
  "foodSectionTitle": "Food & Restaurant",
  "foodSectionSubtitle": "Recommended restaurants near this location",
  "transportHeroImage": null,
  "foodHeroImage": null
}
```

Rules:
- `name`, `city`, `country` are **required**.
- `slug` generated from `name` if not provided.
- `slug` must be unique.
- Normalize `city` and `country` on write.

#### `GET /admin/locations/:locationId`
Get a single location with embedded transport + food lists (including inactive items for admin editing).

#### `PATCH /admin/locations/:locationId`
Partial update on the location pill itself. All metadata fields are patchable:
- `name`, `slug`, `city`, `country`, `description`, `heroImage`, `isActive`, `sortOrder`
- `transportSectionTitle`, `transportSectionSubtitle`
- `foodSectionTitle`, `foodSectionSubtitle`
- `transportHeroImage`, `foodHeroImage`

Rules:
- slug uniqueness still enforced on patch.
- city/country normalization applied after patch.

#### `DELETE /admin/locations/:locationId`
Delete the location and its embedded transport/food lists.

In v1, allow hard delete because embedded transport and food are owned by the location and only consumed by the destination page.

---

### 2.2 Transport Services Admin (per location)

Base: `/api/v1/admin/locations/:locationId/transport`

#### `GET /admin/locations/:locationId/transport`
List transport items for a location (including inactive, order: `sortOrder` then `createdAt`). No pagination in admin list in v1.

#### `POST /admin/locations/:locationId/transport`
Add a transport item.

Body:
```json
{
  "companyName": "Green Line Paribahan",
  "contactNumber": "+880 1700-000000",
  "description": "AC bus service from Dhaka to Cox's Bazar",
  "heroImage": "https://...bus.jpg",
  "sectionTitle": null,
  "sectionSubtitle": null,
  "sortOrder": 1,
  "isActive": true
}
```

Rules:
- location must exist.
- `companyName` and `contactNumber` required.
- Optional per-item section title/subtitle allow future variation, but v1 UI can hide them.

#### `GET /admin/locations/:locationId/transport/:transportId`
Get one transport item inside the location.

#### `PATCH /admin/locations/:locationId/transport/:transportId`
Update a transport item. Updatable:
- `companyName`, `contactNumber`, `description`
- `heroImage`, `sectionTitle`, `sectionSubtitle`
- `sortOrder`, `isActive`

#### `DELETE /admin/locations/:locationId/transport/:transportId`
Remove a transport item from the location.

---

### 2.3 Food / Restaurant Admin (per location)

Base: `/api/v1/admin/locations/:locationId/food`

Same pattern as transport.

#### `GET /admin/locations/:locationId/food`
#### `POST /admin/locations/:locationId/food`
Body:
```json
{
  "restaurantName": "Sea Food Garden",
  "phoneNumber": "+880 1800-000000",
  "location": "Kolatoli Point, Cox's Bazar",
  "description": "Seafood and local cuisine with beach view",
  "heroImage": "https://...food.jpg",
  "sectionTitle": null,
  "sectionSubtitle": null,
  "sortOrder": 1,
  "isActive": true
}
```
Required:
- `restaurantName`
- `phoneNumber`
- `location` (this is the card-level location string the user requested)

#### `GET /admin/locations/:locationId/food/:foodId`
#### `PATCH /admin/locations/:locationId/food/:foodId`
#### `DELETE /admin/locations/:locationId/food/:foodId`

---

## 3. Validation Rules

Add schemas in `admin.validation.ts` or a new co-located `location.validation.ts`.

Recommendation: keep them alongside admin validation initially. Name them:

### Location Pill Schemas
- `adminLocationParamsSchema` — `{ locationId: ObjectId }`
- `adminLocationQuerySchema` — `{ isActive?: boolean }`
- `createAdminLocationBodySchema`
- `updateAdminLocationBodySchema`

Rules:
- `name`: non-empty trimmed string, min length 1
- `slug`: lowercase trimmed alphanumeric + hyphen (or relaxed to `trim + normalize to slug`)
- `city`: non-empty trimmed
- `country`: non-empty trimmed
- `sortOrder`: integer >= 0
- `description`: optional trimmed string
- URLs: optional non-empty trimmed string (do not hard validate external URL format unless the project already does; v1 trust admin for uploads)

### Transport Item Schemas
- `adminTransportParamsSchema` — `{ locationId, transportId }`
- `createAdminTransportBodySchema`
- `updateAdminTransportBodySchema`

Rules:
- `companyName`: non-empty trimmed
- `contactNumber`: non-empty trimmed
- `sortOrder`: integer >= 0

### Food Item Schemas
- `adminFoodParamsSchema` — `{ locationId, foodId }`
- `createAdminFoodBodySchema`
- `updateAdminFoodBodySchema`

Rules:
- `restaurantName`: non-empty trimmed
- `phoneNumber`: non-empty trimmed
- `location`: non-empty trimmed
- `sortOrder`: integer >= 0

### Global Rule
Every `PATCH` body must require **at least one field**.

---

## 4. Service Layer Behavior

### 4.1 Location Pill Operations

Create:
1. Trim strings.
2. Normalize city/country.
3. Generate slug if missing:
   - Lowercase, replace spaces with `-`, strip special chars, de-duplicate slugs by appending `-2`, `-3` if collision.
4. Save.

Update:
1. If `city` or `country` changes, re-normalize.
2. If `slug` changes, enforce unique.
3. Return updated record.

Delete:
1. Delete one document.
2. No cross-references in v1, so no foreign cleanup.

---

### 4.2 Embedded Transport / Food Item Operations

Common pattern for both lists:

Add item:
1. Load location by id (or 404).
2. Allocate ObjectId for item.
3. Push new embedded item into the list.
4. Return: `{ locationId, itemId }`.

Update item:
1. Load location.
2. Find item inside the list by `_id` / `id`.
3. Apply patched fields (trim strings, etc.).
4. Save location.

Delete item:
1. Load location.
2. Remove matching embedded item.
3. Save.

Note on reorder: admin just patches `sortOrder` on individual items. Admin list sorts ascending by `sortOrder`.

---

### 4.3 How Section-Level Overrides Resolve

For the Public destination response, always compute and return explicit section meta blocks so the frontend receives **ready-to-render** values.

Example computed blocks:

```js
transportSection: {
  title: location.transportSectionTitle || 'Transportation Services',
  subtitle: location.transportSectionSubtitle || 'Local transport companies and contact details',
  heroImage: location.transportHeroImage
    || firstActiveTransportItem?.heroImage
    || location.heroImage
    || null
}
```

Same pattern for food.

---

## 5. Public APIs

All Public endpoints are **read-only** and unauthenticated.

Base prefix: `/api/v1/public` (create if not present; or use existing public router — check repository conventions). Where the repo mounts public APIs, place these accordingly.

### 5.1 Public Pill List

#### `GET /public/locations/pills`
Purpose: feed the small pill strip above the search bar.

Query:
- none

Behavior:
- only active (`isActive: true`) locations
- sorted by `sortOrder` ascending, `createdAt` descending
- returns minimal pill-shaped payload

Response shape:
```json
{
  "success": true,
  "data": [
    {
      "id": "loc-1",
      "name": "Cox's Bazar",
      "slug": "coxs-bazar",
      "city": "Cox's Bazar",
      "country": "Bangladesh",
      "heroImage": "https://...coxs-bazar.jpg"
    }
  ]
}
```

Note: hero image is optional for small pills; frontend may choose to ignore it and just render small text pills.

---

### 5.2 Public Destination Page Bundle

#### `GET /public/locations/:locationSlug`

This endpoint should **return everything the destination page needs in one call** in v1. This keeps frontend implementation straightforward and avoids three sequential fetches for critical content.

Query params (all optional):
- `listingsPage` (default `1`)
- `listingsLimit` (default `12`, cap at `50`)
- `transportPage` (default `1`, forced page size `5`)
- `foodPage` (default `1`, forced page size `5`)

Behavior:
1. Find active Location by slug.
2. Compute section meta blocks.
3. Fetch approved properties filtered by:
   - `status = 'approved'`
   - `city = normalized(location.city)`
   - `country = normalized(location.country)`
   - paginated with `listingsPage` / `listingsLimit`
   - sorted by `createdAt` desc in v1, or `sortOrder` if future curation is added
4. Fetch active transport embedded items:
   - filter `isActive: true`
   - sort by `sortOrder` asc
   - paginate at page size `5`
5. Fetch active food embedded items:
   - filter `isActive: true`
   - sort by `sortOrder` asc
   - paginate at page size `5`
6. Return all four parts plus computed pagination info.

Response envelope (suggested):

```json
{
  "success": true,
  "data": {
    "location": {
      "id": "loc-1",
      "name": "Cox's Bazar",
      "slug": "coxs-bazar",
      "city": "Cox's Bazar",
      "country": "Bangladesh",
      "description": "...",
      "heroImage": "https://...coxs-bazar.jpg"
    },
    "listingsSection": {
      "items": [
        {
          "id": "prop-1",
          "propertyName": "Sea View Apartment",
          "slug": null,
          "propertyTypeName": "Apartment",
          "city": "Cox's Bazar",
          "country": "Bangladesh",
          "address": "Kolatoli",
          "coverImage": "https://...cover.jpg",
          "pricePerNight": 6500,
          "currency": "BDT",
          "rating": 4.8,
          "reviewsCount": 24,
          "unitSummary": {
            "bedrooms": 2,
            "bathrooms": 2,
            "capacity": 4
          }
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 12,
        "total": 23,
        "totalPages": 2
      }
    },
    "transportSection": {
      "title": "Transportation Services",
      "subtitle": "Local transport companies and contact details",
      "heroImage": "https://...bus.jpg",
      "items": [
        {
          "id": "tx-1",
          "companyName": "Green Line Paribahan",
          "contactNumber": "+880 1700-000000",
          "description": "AC bus service from Dhaka to Cox's Bazar"
        }
      ],
      "pagination": {
        "page": 1,
        "pageSize": 5,
        "total": 7,
        "totalPages": 2
      }
    },
    "foodSection": {
      "title": "Food & Restaurant",
      "subtitle": "Recommended restaurants near this location",
      "heroImage": "https://...food.jpg",
      "items": [
        {
          "id": "fd-1",
          "restaurantName": "Sea Food Garden",
          "phoneNumber": "+880 1800-000000",
          "location": "Kolatoli Point, Cox's Bazar",
          "description": "Seafood and local cuisine with beach view"
        }
      ],
      "pagination": {
        "page": 1,
        "pageSize": 5,
        "total": 8,
        "totalPages": 2
      }
    }
  }
}
```

#### Why bundle in v1

The destination page has a fixed 3-section layout. Returning it all together:
- avoids waterfall network calls for first paint
- reduces frontend logic for section meta precedence
- guarantees the page cannot accidentally show transport/food for a different location

If later:
- listings need filters,
- transport/food need infinite scroll,

those can split into separate endpoints **in addition** to this bundle.

---

### 5.3 Individual Public List Endpoints (Optional Helpers)

Optional but recommended to add for pagination-only reloads:

- `GET /public/locations/:locationSlug/transport?page=N` — pageSize forced to 5
- `GET /public/locations/:locationSlug/food?page=N` — pageSize forced to 5

These return only their respective section payloads for use when:
- user clicks page 2 on transport while leaving listings/food untouched

If v1 wants to keep API surface small, bundle endpoint + frontend state-only pagination is enough. The plan recommends **adding the helper endpoints** because pagination UX without full-page refetch is nicer.

---

## 6. Listing Section Data Source (Properties)

Backend rules for what appears in Section 1 (property/unit listings of that location):

### Filter
- `Property.status === 'approved'`
- `property.city === location.city` (normalized)
- `property.country === location.country` (normalized)

### Sort
v1 default: `createdAt DESC` (newest approved first). If product later needs featured ordering, reuse a curation pattern similar to HomepageSection.

### Listings Item Shape
Include a minimal property preview + unit pricing summary suitable for cards. Because a property can have multiple units, the preview should either:

**Recommended Option A (v1 simple): one card per approved property**
- show property name, city/country, address snippet, cover image
- show a summary of the cheapest unit's price per night
- show unit summary (max capacity, bedrooms, bathrooms aggregated or cheapest unit)

This keeps search results consistent with current property-level search.

Return:
- `id`
- `propertyName`
- `propertyTypeId`
- `propertyTypeName`
- `city`, `country`, `address` snippet
- `coverImage` (or first media marked isCover)
- `pricePerNight` (cheapest active unit price per night)
- `currency`
- `rating` (optional)
- `reviewsCount` (optional)
- `unitSummary` (cheapest unit capacity summary)

If the repo already has a public property listing helper / DTO mapper in `front.shared.ts` or similar, reuse it and just add city + country filter.

---

## 7. Pagination Rules

To keep UX consistent:

- Listings: frontend-configurable limit, default 12, max 50; return: `page, limit, total, totalPages`
- Transport: **forced page size = 5**, return: `page, pageSize: 5, total, totalPages`
- Food: **forced page size = 5**, return: `page, pageSize: 5, total, totalPages`

Embeds are arrays, so paginate in service layer after:
- filtering `isActive`
- sorting `sortOrder` asc

Then:
- `skip = (page - 1) * pageSize`
- `slice(skip, skip + pageSize)`
- `total = filtered.length`
- `totalPages = Math.max(1, Math.ceil(total / pageSize))`

Validate page is >= 1. If page exceeds totalPages, return empty items and the meta.

---

## 8. Errors

Handle these explicitly in service layer:

### Location Pill Errors
- Location not found
- Slug already exists
- Slug invalid
- Location name required / empty
- City required / empty
- Country required / empty

### Transport / Food Errors
- Location not found
- Item not found
- Required fields missing
- Pagination invalid (page < 1, etc.)

### Public Errors
- Location not found by slug (404)
- Location is inactive but slug directly requested: recommend 404 to hide unpublished destinations from public

All errors should use the existing project error classes (`BadRequestError`, `NotFoundError`, `ConflictError`, etc.).

---

## 9. Security

- Admin endpoints: `auth` + `requireRoles(['admin'])` always.
- Public endpoints: unauthenticated; do not leak:
  - inactive locations
  - inactive transport items
  - inactive food items
  - non-approved properties
- Validate all ids as ObjectId before service operations.
- Validate slugs before lookups.
- Embedded arrays must not accept unfiltered push operations in controllers; always build the item through validated schemas.

---

## 10. Backend Files To Create Or Update

### New Files
- `src/modules/admin/location.model.ts`
- `docs/api/admin/admin-locations.md` (admin pill + transport + food management docs)
- `docs/api/front/front-destination.md` (public destination page + pills docs)

### Updated Files
- `src/modules/admin/admin.routes.ts` — add new routes under `/admin/locations/*`
- `src/modules/admin/admin.controller.ts` — handler functions
- `src/modules/admin/admin.service.ts` — service functions (or split to `location.service.ts` if too large)
- `src/modules/admin/admin.validation.ts` — location, transport, food validation schemas
- Public routing file (search/front/shared public routes):
  - add `/public/locations/pills`
  - add `/public/locations/:slug`
  - add optional `/public/locations/:slug/transport` and `/public/locations/:slug/food`
- `src/docs/openapi.yaml`:
  - new paths for admin locations + items
  - new paths for public pills and destination page
  - schemas:
    - `LocationPillListItem`
    - `LocationAdminDetails`
    - `TransportItemAdmin`
    - `FoodItemAdmin`
    - `DestinationPageResponse`
    - `PaginationMeta`
- `docs/api/api.md` if it indexes endpoints

---

## 11. Backend Acceptance Criteria

Part A is done only when all of these are true:

1. Admin can:
   - create a location pill
   - list all location pills (including inactive)
   - get one location pill with transport + food embedded
   - patch location metadata
   - delete a location pill
2. Admin can:
   - add / list / get / patch / delete transport items inside a location
   - add / list / get / patch / delete food items inside a location
3. Public pill endpoint returns:
   - only active locations
   - ordered correctly
   - correct slug / name / city / country
4. Public destination endpoint for an active slug returns:
   - location details
   - approved properties filtered by city+country
   - transport paginated at 5 items per page
   - food paginated at 5 items per page
   - section title / subtitle / hero computed correctly
5. Public destination endpoint for inactive slug returns 404.
6. OpenAPI + admin/front docs describe the real shapes.
7. Non-admin users receive 403 for all Admin endpoints.
8. City/country normalization ensures existing properties show up even if admin casing differs.

---

# Part B — Frontend Plan

## Goal (Frontend)

By the end of Part B, the frontend should implement:

1. A **horizontally scrollable pill strip** directly **above the public search bar**.
2. Pills populated from `GET /api/v1/public/locations/pills`.
3. Clicking a pill navigates to `/destination/:locationSlug` (or equivalent route decided by FE framework).
4. The destination page renders:
   - Header / hero for the location
   - Section 1: property/unit listing cards for that location
   - Section 2: **Transportation Services** layout with
     - Title + Subtitle
     - Left Hero Image
     - Right Card List (Name + Contact)
     - Pagination (5 cards per page)
   - Section 3: **Food & Restaurant** layout with
     - Title + Subtitle
     - Left Hero Image
     - Right Card List (Restaurant Name + Phone + Location)
     - Pagination (5 cards per page)

---

## 1. Public Page Surface Changes

### 1.1 Homepage / Search Header: Pill Strip Above Search Bar

Place the pill strip **directly above the existing search bar** on pages where the global search UI is visible (homepage, at minimum).

Visual ordering in page flow (top to bottom):

1. Site header / nav
2. Hero banner (if any)
3. **Location Pills strip** (horizontally scrollable)
4. Search Bar (existing)
5. Homepage curated sections (existing)

Pill strip visuals:
- Small pills (compact, minimal padding, not full-width cards)
- Each pill displays the location `name` only
- Optional: subtle active state if currently on that destination page
- Horizontally scrollable with:
  - CSS overflow-x auto
  - optional gradient fade masks on left/right edges
  - optional arrow navigation buttons if user flow requires, but not mandatory in v1

Interaction:
- Click pill → router push to `/destination/:locationSlug`
- Keyboard: Enter triggers navigation, arrow keys scroll the strip

Empty state:
- If Public API returns zero pills: hide the pill strip entirely rather than showing an empty row.

---

### 1.2 New Route: Destination Page

Add a new public route, for example:
- `/destination/:locationSlug`

Route behaviors:
- Route param `locationSlug` matches backend Location slug.
- Initial data load: call `GET /api/v1/public/locations/:locationSlug`.
- If 404 (inactive / slug missing): show 404 page.
- Update document `<title>` and meta description using the location details for basic SEO in v1.

---

## 2. Destination Page Layout (3 Sections)

Overall page sections stack vertically.

### 2.1 Page Header / Hero (Optional but recommended)

Before the 3 mandated sections, render a simple location header:

- Location name (`name`)
- Short description (`description`) if available
- Hero image background or top banner (`heroImage`) if present

This gives the page visual anchor and allows the 3 content sections to sit below a consistent title frame.

---

### 2.2 Section 1: Apartment / House Listing For That Location

#### Purpose
Shows the stays available in this location.

#### Data source
Use `listingsSection.items` and `listingsSection.pagination` from the destination response bundle.

#### Layout
Standard listing grid (reuse the same card component the project already uses for property cards in search results / homepage sections).

Sorting / filtering in v1:
- no UI filters (stay bounds, amenities etc.)
- pagination controls at bottom of grid using `listingsSection.pagination`

#### Behavior
- On pagination change, update URL query param `listingsPage`, then refetch either:
  - the bundle endpoint with new listingsPage, OR
  - a dedicated listings helper if added later
- Keep transport/food pages stable unless their pagination widgets are also clicked.

#### Empty state
If no approved properties in this location yet:
- show a clear message like "No stays are available for this location yet."
- still keep Transport and Food sections visible.

---

### 2.3 Section 2: Transportation Services (Static Section)

#### Strict Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ Title: Transportation Services                                    │
│ Subtitle: Local transport companies and contact details          │
├───────────────────────────────┬──────────────────────────────────┤
│                               │  ┌────────────────────────────┐ │
│                               │  │ Card 1                     │ │
│  Left Hero Image              │  │ • Company Name             │ │
│                               │  │ • Contact Number           │ │
│                               │  └────────────────────────────┘ │
│                               │  ┌────────────────────────────┐ │
│                               │  │ Card 2                     │ │
│                               │  │ • Company Name             │ │
│                               │  │ • Contact Number           │ │
│                               │  └────────────────────────────┘ │
│                               │  ... up to 5 cards / page      │
├───────────────────────────────┴──────────────────────────────────┤
│                   [«] 1  2  3  [»]                               │
└──────────────────────────────────────────────────────────────────┘
```

#### Data source
Use `transportSection.title`, `transportSection.subtitle`, `transportSection.heroImage`, `transportSection.items`, `transportSection.pagination`.

#### Card content
Each right-side card must show exactly:
1. **Name of the transport company**
2. **Contact number**

Optional extras (if backend returns them and UX is not crowded):
- Description line (subtle text)

#### Interaction
- Click contact number: `tel:+...` link if valid, else plain text.
- Pagination controls below the section block when totalPages > 1.

#### Empty state
If no transport items exist:
- Still render title/subtitle.
- In the card area, show:
  - "No transport services curated for this location yet."

#### Pagination rules
- Page size fixed at **5**.
- UI only needs Prev / Next / Page N buttons.
- When changing transport page:
  - update URL query param `transportPage`
  - refetch either the destination bundle endpoint OR optional helper endpoint
  - keep listings + food on their current page

---

### 2.4 Section 3: Food & Restaurant (Same Layout Pattern)

Use the identical two-column layout as Section 2.

#### Strict Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ Title: Food & Restaurant                                          │
│ Subtitle: Recommended restaurants near this location             │
├───────────────────────────────┬──────────────────────────────────┤
│                               │  ┌────────────────────────────┐ │
│                               │  │ Card 1                     │ │
│  Left Hero Image              │  │ • Restaurant Name          │ │
│                               │  │ • Phone Number             │ │
│                               │  │ • Location                 │ │
│                               │  └────────────────────────────┘ │
│                               │  ... up to 5 cards / page      │
├───────────────────────────────┴──────────────────────────────────┤
│                   [«] 1  2  3  [»]                               │
└──────────────────────────────────────────────────────────────────┘
```

#### Data source
Use `foodSection.title`, `foodSection.subtitle`, `foodSection.heroImage`, `foodSection.items`, `foodSection.pagination`.

#### Card content
Each card must show exactly:
1. **Restaurant name**
2. **Phone number**
3. **Location** (free text field describing the address/landmark)

Optional: description line.

#### Interaction
- Phone number: `tel:+...` link.
- Location: plain text (do not deep-link to maps unless specifically requested).

#### Pagination rules
- Page size fixed at **5**.
- Query param: `foodPage`.

#### Empty state
"No food/restaurant recommendations curated for this location yet."

---

## 3. Visual / UX Guidelines

### 3.1 Pill Strip
- Height: small (match existing compact chip style of the UI framework)
- Rounded corners (typical pill shape)
- Spacing: gap between pills, horizontal padding inside strip equal to page container padding
- Scroll:
  - native browser scroll behavior (no custom scrollbar unless design requires)
  - no scroll in mobile; allow swipe/scroll.

### 3.2 Static Section Containers (Transport & Food)
- Max width: same container as listings grid
- Responsive behavior:
  - **Desktop:** 2 columns (left image ~40%, right cards ~60%)
  - **Tablet:** optional 2 columns if width permits, else stack:
    - 1) image
    - 2) title/subtitle
    - 3) cards
  - **Mobile:** stack image on top then cards below.

Left image:
- keep aspect ratio consistent (e.g., 4:5 or 1:1)
- fit/cover appropriate per design system
- fallback to placeholder if `heroImage === null`.

Cards in right column:
- Consistent padding and hover states
- Wrap contact text (no overflow).
- Avoid long truncation for phone numbers; allow wrapping.

### 3.3 Pagination Controls
Use project-standard pagination UI if one exists. If not:
- Prev/Next buttons
- Page buttons centered
- Disabled Prev on first, Next on last.

---

## 4. State Management & Data Fetching

The destination page has three pagination axes (`listingsPage`, `transportPage`, `foodPage`). Recommendation:

- Use the URL query string as the source of truth.
  - `/destination/coxs-bazar?listingsPage=2&transportPage=1&foodPage=3`
- On route change with the same slug but different params, trigger targeted fetches.
- First visit fetches the **bundle endpoint**.
- On pagination change for individual sections, either:
  1. Re-fetch bundle with updated params
  2. (If backend helper endpoints exist) fetch only the section’s list.
  Prefer **(1) bundle re-fetch** in v1 to keep code simple and aligned, unless latency becomes a real issue.

Loading states:
- Skeleton / shimmer placeholders for:
  - listing cards
  - transport cards
  - food cards
  - destination header

Error states:
- Network error → inline retry banner per section (or page-level banner + retry).
- Slug not found → 404 page.

---

## 5. Routing / Navigation

### Routes to add

1. Home page does not change route, but now shows pills component.
2. New route: `/destination/:locationSlug`

### Active pill highlight
When inside `/destination/coxs-bazar`:
- the pill strip on home/global search header may highlight the matching slug by id or slug comparison (optional v1 nice-to-have).

### Back navigation
A back link or breadcrumb to “Home” or “All destinations” is not strictly required by the input, but should be considered in layout review. v1 minimum: router’s back button and header nav work.

---

## 6. Accessibility

- Pill strip:
  - pills are focusable
  - arrow keys scroll the strip
  - pills have visible focus ring
- Pagination:
  - buttons labeled with page numbers and aria-labels for prev/next
- Cards:
  - semantic lists (`<ul>` + `<li>`) for card grids
  - tel links use `href="tel:..."`
- Images:
  - alt text for left hero image (alt can be empty if purely decorative, use composed section title otherwise)
  - listing property cover alt text (property name)

---

## 7. Empty / Edge Cases

Cover all of these explicitly:

1. **No pills exist** → hide pill strip component on homepage/search.
2. **Location slug inactive / invalid** → 404 page.
3. **No listings yet** → Section 1 empty message.
4. **No transport yet** → Section 2 message, title/subtitle still visible.
5. **No food yet** → Section 3 message, title/subtitle still visible.
6. **Only 1 page** → hide pagination controls for that section (or disable them).
7. **Invalid pagination query params** → reset invalid values to defaults before request.
8. **Long location names** → text truncation on pill with tooltip if needed.

---

## 8. Frontend Files To Create Or Update (General)

Exact paths depend on whether this repo has a separate frontend folder or if the UI lives elsewhere. Reference placeholders:

- New component: `components/location/PillStrip.tsx` (or framework equivalent)
- New page: `pages/public/DestinationPage.tsx` or `routes/destination.$slug.tsx`
- New section components:
  - `components/location/ListingsSection.tsx`
  - `components/location/StaticInfoSection.tsx` (generic layout reusable between transport + food)
  - `components/location/TransportCard.tsx`
  - `components/location/FoodCard.tsx`
- API client:
  - `api/public/locations.ts` (or equivalent):
    - `getLocationPills()`
    - `getDestinationPage(params)`
    - `getDestinationTransport(params)` optional
    - `getDestinationFood(params)` optional
- Router config: add `/destination/:locationSlug`
- If homepage/search layout files exist:
  - embed `PillStrip` immediately above search bar
- SEO:
  - add page title / meta tags to destination route from location fields.

---

## 9. Frontend Acceptance Criteria

Part B is done only when:

1. Homepage search header renders a horizontally scrollable pill strip above the search bar when pills exist.
2. Pill strip is empty/hidden when no pills are active.
3. Clicking a pill navigates to `/destination/:locationSlug`.
4. Destination page shows location header.
5. Destination page Section 1 lists approved stays for that location with working pagination.
6. Destination page Section 2 renders exact transport layout:
   - Title + Subtitle
   - Left Image + Right cards (name + contact)
   - Pagination (5/page)
7. Destination page Section 3 renders exact food layout:
   - Title + Subtitle
   - Left Image + Right cards (name + phone + location)
   - Pagination (5/page)
8. Pagination state reflects in URL query params and survives refresh.
9. Mobile/tablet breakpoints do not break section layout.
10. Inactive/missing slug shows 404 instead of broken page.
11. Keyboard focus and aria-labels for pagination and pills are functional.

---

## Suggested Implementation Sequence (Both Halves)

For smooth build order:

1. Backend first: add `Location` model + Admin CRUD for pills.
2. Then: transport/food embedded admin endpoints.
3. Then: public pill list endpoint.
4. Then: public destination bundle endpoint.
5. Then: docs + OpenAPI sync.
6. Then: tests for backend admin + public endpoints.
7. Frontend next:
   - add API client wrappers
   - add `PillStrip` on home/search
   - add destination route + page skeleton
   - add listings section component
   - build generic two-column static section component
   - plug transport + food cards into it
   - add pagination wiring
   - polish responsive behavior, empty states, accessibility.

---

## Risks And How To Mitigate

### Risk 1: City/country normalization mismatch
- **Problem:** Admin types `"Coxs Bazar"` while property records use `"Cox's Bazar"` → no listings appear.
- **Mitigation:**
  - Admin create/update UI should normalize + optionally show matching property count preview.
  - Backend normalizes on save; docs instruct admins to match property city/country spelling exactly.

### Risk 2: Embedded arrays can grow large
- **Problem:** A location accumulates 100+ transport/food entries.
- **Mitigation:** v1 pagination already applies on public reads. Admin list remains unpaginated but can add later; acceptable because admin typically manages moderate lists.

### Risk 3: Destination page bundle latency
- **Problem:** Single bundle call grows slower with more listings.
- **Mitigation:** split into 3 calls later, but keep bundle in v1; ensure proper indexes on property `(city, country, status, createdAt DESC)`.

### Risk 4: Frontend pagination state misalignment
- **Problem:** Transport page 3 reload goes to transport page 1 by default.
- **Mitigation:** use URL query params as canonical state; on mount read `transportPage`/`foodPage`/`listingsPage` and pass to the API.

### Risk 5: Image precedence rules mismatch between API and UI
- **Problem:** Backend returns `transportSection.heroImage` but frontend still tries to override with first item image.
- **Mitigation:** keep backend as source of truth and always render `section.heroImage` directly; let backend compute final image.

---

## Tests

### Backend Tests
Add Jest tests for:
- Admin can create location pill.
- Slug uniqueness (create duplicate slug fails).
- Admin can add / list / patch / delete transport and food items.
- Admin cannot add transport/food to missing location.
- Public pills list only active locations in correct order.
- Public destination page:
  - filters listings by city/country correctly
  - returns transport paginated at 5
  - returns food paginated at 5
  - inactive location slug returns 404
  - section hero/title/subtitle precedence matches rules.
- Non-admin cannot access admin endpoints.

### Frontend Tests (If FE test framework exists)
- Pill strip correctly maps response to chips.
- Clicking a pill updates route.
- Destination page splits response into 3 sections.
- Pagination buttons update page state and params.
- Empty states render correct copy.
- Responsive layout rules match breakpoints.

---

## Final Notes

This step deliberately keeps the static sections (transport and food) as **admin-controlled static cards** rather than attempting to integrate with external transport / restaurant data providers. This gives the product:

- fast content iteration through the admin panel,
- consistent UX layout for every destination,
- clear pagination rules (5 items per card page),
- zero hard dependency on any third-party APIs.

If the product later wants:
- map integration,
- richer filter widgets on listings,
- automatic pill suggestions,

each of those layers cleanly on top of this base without changing data models.
