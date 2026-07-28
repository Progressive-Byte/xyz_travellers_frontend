# XYZ Travellers Host Portal Step 5 Plan

## Step Name

Chunk 5: Property Media Manager

## Purpose

This document covers only the fifth implementation step from `HOST_PORTAL_CHUNKED_PLAN.md`.

It does not plan the full host portal.

It only plans the media-management layer that lets an approved host load a property's media, upload gallery images, add video URLs, choose a cover image, and manage captions and sort order.

## Objective

Build the first real media-management route inside the host portal so an approved host can:

- open a property's media workspace
- review existing media items
- upload one or more property images
- add an optional video URL entry if the API supports it
- choose one cover image for the listing
- edit caption and sort order metadata
- delete media items when needed

This step should introduce the dedicated property media route, the first media gallery manager, and the core API helpers needed to keep listing visuals editable before submission.

This step should not try to build units, pricing, calendar rules, property verification uploads, business linking, or final property submission yet.

## Why This Is Step 5

Chunk 1 created the reusable host shell.

Chunk 2 created the onboarding split between non-host users and approved hosts.

Chunk 3 added host profile and payout setup so the portal has real account depth.

Chunk 4 created the first listing-management foundation, including the properties index, draft creation, and basics plus location editing.

Now the listing workflow needs the visual-content layer, because a property cannot feel real or submission-ready without images and other media assets.

This step matters now because:

- the draft editor already exists, but it still stops before the first major content-heavy step
- a property listing needs visual assets before later review and submission steps can feel credible
- media is a natural next step after basics and location in the add-property workflow
- later verification and review flows depend on the property feeling substantively complete
- the host needs feedback that the draft is progressing beyond text fields into a guest-facing listing

Without this step:

- the add-property workflow still feels incomplete right after basics and location
- hosts cannot upload the core images that make a listing usable
- later chunks would have to solve submission readiness without the required visual layer
- the property editor would imply forward progress without a real next step

So this step exists to extend the draft workflow from `listing foundation` into `visual listing content`, while still keeping the workflow intentionally smaller than the full property submission system.

## Current Starting Point

Right now the project already has:

- `app/host/dashboard/page.tsx`
- `app/host/onboarding/page.tsx`
- `app/host/profile/page.tsx`
- `app/host/payouts/page.tsx`
- `app/host/properties/page.tsx`
- `app/host/properties/new/page.tsx`
- `app/host/properties/[propertyId]/edit/page.tsx`
- `components/host/HostShell.tsx`
- `components/host/HostSidebar.tsx`
- `components/host/HostRouteGate.tsx`
- `components/host/HostDashboardShell.tsx`
- property listing components inside `components/host/properties/*`
- host navigation metadata in `components/host/hostNavigation.ts`
- property foundation helpers in `lib/host.ts`

Current behavior:

- approved hosts can open the real portal
- properties list and add-property routes are live
- a host can create a draft property
- a host can edit basics and location for draft and rejected listings
- the dashboard can already point the host into the listing workflow

Current limitation:

- there is no `app/host/properties/[propertyId]/media/page.tsx`
- there are no property media manager components yet
- there are no media-specific helpers in `lib/host.ts`
- there is no host UI for image upload, video URL entry, cover-image selection, caption editing, or sort-order management
- the editor step sequence currently implies later workflow depth without a real media step
- there is no first-class way to tell if a listing has enough visual content to move forward

## Scope

This step includes:

- building the dedicated property media route
- building a media manager page inside the shared host shell
- fetching media items for a property
- uploading property images
- supporting optional video URL creation if the API surface allows it
- editing media metadata such as caption and sort order
- selecting one media item as the listing cover image
- deleting media items
- showing clear empty, loading, error, uploading, and populated states
- connecting the draft editor flow forward into the media route
- making the media step visible in property editor navigation or step framing

This step does not include:

- units CRUD
- pricing configuration
- calendar rules or blocked dates
- property verification document uploads
- final review and submit flow
- business selection and business document linking
- guest-facing listing preview pages
- media moderation workflows beyond what the host API directly supports

## Product Behavior Model For This Step

This step applies only to approved hosts inside the portal.

### Media route expectation

Behavior:

- host can open a media workspace for one property
- the page loads current media items for that property
- the UI shows clear empty, loading, upload-in-progress, error, and populated states
- the host can understand which image is the cover image

### Image upload expectation

Behavior:

- host can upload one or more property images
- upload actions should feel safe and intentional
- the UI should prevent duplicate or confusing upload actions while a request is in flight
- newly uploaded images should appear in the media gallery without forcing the host to leave the page

### Metadata editing expectation

Behavior:

- host can edit caption and sort order for media items
- host can mark one image as the cover image
- host can remove media items that are no longer wanted
- media edits should show clear save feedback and recovery paths on error

### Video URL expectation

Behavior:

- if the API supports a video-style media entry through the same media endpoints, the host can add an optional video URL
- the UI should treat video as supplemental, not as a replacement for required listing images
- if backend support is uncertain, the plan should keep this feature explicitly guarded and optional

Important rule:

- this chunk creates the `property media manager`, not the full listing completion system
- it should move the product from `text-only property draft` to `real visual listing workflow`

## Design Direction

This media workflow must follow `UI_REDESIGN_PLAN.md` and stay visually aligned with the host shell language already established in the portal.

### Visual principles

- premium editorial-travel feel, not a generic asset dashboard
- large enough previews to make image quality and composition easy to judge
- calm hierarchy with soft surfaces, subtle borders, and restrained lime emphasis
- media controls should feel precise and tidy, not overloaded
- cover-image treatment should be very obvious without becoming noisy

### UX principles

- media management should feel like a guided listing step, not like a raw file-storage tool
- the cover image must be easy to identify and change
- empty states should encourage progress instead of feeling like failure
- upload and save feedback should be immediate and trustworthy
- later listing steps should remain visible as upcoming, but not distract from finishing media work

## Route Coverage In This Step

This step needs to support:

- `/host/properties`
- `/host/properties/[propertyId]/edit`
- `/host/properties/[propertyId]/media`

Behavior rules:

- `/host/properties/[propertyId]/media`:
  - logged out -> redirect to auth
  - non-host -> redirect to onboarding
  - approved host -> allow
- media route should use the same shared host portal gate introduced in Chunk 2
- media route should be reachable from the existing add-property workflow after draft basics and location are available

## File Plan

### New files

- `app/host/properties/[propertyId]/media/page.tsx`
- `components/host/properties/media/HostPropertyMediaPage.tsx`
- `components/host/properties/media/HostPropertyMediaGallery.tsx`
- `components/host/properties/media/HostPropertyMediaCard.tsx`
- `components/host/properties/media/HostPropertyMediaUploader.tsx`
- `components/host/properties/media/HostPropertyVideoUrlForm.tsx`
- `components/host/properties/media/HostPropertyMediaEmptyState.tsx`

### Updated files

- `components/host/hostNavigation.ts`
- `components/host/properties/HostPropertyEditorShell.tsx`
- `components/host/properties/hostPropertyEditor.ts`
- `components/host/properties/HostPropertyEditorPage.tsx`
- `lib/host.ts`

### Optional shared helpers

- `components/host/properties/media/hostPropertyMedia.ts`
- `components/host/properties/media/hostPropertyMediaValidation.ts`

If media-state logic, preview mapping, or upload constraints grow, extract them into small local helpers.

## Component Responsibilities

### `HostPropertyMediaPage`

Responsibilities:

- load one property and its media collection
- render the media workflow inside the host shell
- handle loading, error, empty, and populated states
- coordinate upload, edit, delete, and cover-image actions

### `HostPropertyMediaGallery`

Responsibilities:

- render the collection of media items
- preserve readable spacing and scannable card hierarchy
- handle populated-state layout for images and any supported video entries

### `HostPropertyMediaCard`

Responsibilities:

- show a media preview
- surface caption, sort order, type, and cover-image state
- expose item-level actions such as save metadata, set cover, and delete

### `HostPropertyMediaUploader`

Responsibilities:

- let the host select files for upload
- explain any file constraints or expectations
- show uploading state clearly
- prevent accidental repeated submissions while uploading

### `HostPropertyVideoUrlForm`

Responsibilities:

- support optional video URL entry if the backend supports that flow
- validate the input lightly and practically
- save the URL through the same media workflow if possible

### `HostPropertyMediaEmptyState`

Responsibilities:

- explain why listing media matters
- encourage the first image upload
- make the empty state feel like a progress milestone, not a dead end

### `HostPropertyEditorShell`

Responsibilities after this chunk:

- keep the visible multi-step property workflow aligned with the real route family
- treat media as the next true active stage after basics and location
- show later steps as upcoming rather than already complete

### `HostPropertyEditorPage`

Responsibilities after this chunk:

- keep basics and location editing focused
- provide a clear path into the media route
- avoid trying to absorb media management directly into the Chunk 4 editor page

## API Plan

This step should extend `lib/host.ts` with media-management helpers.

### APIs used in this step

- `GET /api/v1/host/properties/:propertyId/media`
- `POST /api/v1/host/properties/:propertyId/media`
- `PATCH /api/v1/host/properties/:propertyId/media/:mediaId`
- `DELETE /api/v1/host/properties/:propertyId/media/:mediaId`

### Minimum recommended API scope for this chunk

Required:

- fetch property media list
- upload image media
- update caption and sort order
- mark one image as cover if the API supports a cover field or equivalent metadata flag
- delete media items

Optional:

- create a video URL entry through the media creation endpoint if supported
- support explicit media-type handling if the API distinguishes image vs video records

Guardrail:

- keep API integration focused on media management only
- do not mix units, pricing, verification, or submission APIs into this chunk

## Data Model Plan

### Property media item model

Frontend should be prepared to represent:

- media id
- property id
- media type
- file URL or preview URL
- caption
- sort order
- cover-image flag
- created timestamp
- updated timestamp

The UI should help the host understand what the guest-facing media order will look like.

### Media collection model

Frontend should be prepared to represent:

- all media items for one property
- whether at least one image exists
- whether a cover image exists
- whether video content is present

### Upload request model

Frontend should be prepared to represent:

- selected file input
- upload-in-progress state
- upload success state
- upload failure state

## Media Behavior Plan

### Media page behavior

- load the property record and its media collection on page open
- show property title and status so the host stays oriented
- keep the page honest about editability if the property is not currently editable
- allow the host to remain on the media page while making multiple item changes

### Upload behavior

- allow image uploads without forcing a full page reload
- disable duplicate upload actions while upload is running
- show a success state once upload completes
- explain failures clearly when upload does not complete

### Cover-image behavior

- make the current cover image visually obvious
- allow the host to promote another image to cover
- prevent multiple items from appearing to be cover at once in the UI

### Metadata save behavior

- allow item-level saves for caption and sort order
- disable item save while a request is in flight
- show success feedback after metadata updates
- preserve unsaved local edits carefully when possible

### Delete behavior

- keep deletion intentional and clearly scoped to the selected media item
- reflect the deleted state quickly after success
- ensure cover-image changes remain understandable if the current cover image is deleted

### Video URL behavior

- keep video optional
- validate that the URL looks plausible
- explain that video is supplemental while images remain primary listing media

## Status And Editability Plan

### Media route status treatment

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

- keep unsupported edit states honest
- do not imply that post-submission media editing is already fully supported if it is not

## Cover Image Plan

### Required behavior

- clearly mark one media item as the cover image
- let the host change the cover image without confusing the rest of the gallery
- surface a clear empty state if no cover image exists yet

### Guardrail

- do not overbuild advanced drag-and-drop sorting or crop tools unless the API already expects them
- keep cover-image selection simple, visible, and reliable

## Gallery And Empty State Plan

### Empty state goals

- explain that the property has no media yet
- encourage the host to upload the first property image
- reinforce that the listing needs visuals before later submission stages

### Populated state goals

- give a clean visual overview of all listing media
- make the cover image immediately visible
- keep caption, sort order, and delete actions readable
- support multiple media items without the layout feeling crowded or admin-heavy

## Content Plan

### Media page header

Recommended content:

- badge like `Property Media`
- title focused on listing visuals
- short explanation that this step prepares the guest-facing visual layer before later submission steps

### Empty state content

Recommended content:

- explain that strong property photos are essential for trust and conversion
- point directly to image upload
- keep the tone encouraging instead of punitive

### Upload helper content

Recommended patterns:

- `Add the images guests should see first`
- `Choose one image as your cover photo once uploads finish`
- `Video is optional and should support, not replace, your image gallery`

### Save feedback content

Recommended patterns:

- `Media uploaded successfully`
- `Media details updated successfully`
- `Cover image updated successfully`
- `We couldn't update this media item right now`

## Layout Structure

Suggested media route composition:

1. media route page
2. host route gate in portal mode
3. host shell
4. property-aware page header block
5. media upload panel
6. optional video URL panel
7. media gallery or empty state
8. future-step guidance or next-step CTA

Suggested media gallery composition:

1. gallery wrapper
2. media preview card grid
3. cover-image treatment
4. item metadata form
5. item actions

## Validation Plan

### Upload validation

- require at least one file for file-based upload
- keep file validation practical and aligned with backend constraints
- surface upload errors clearly without overcomplicating the form

### Video URL validation

- allow video only if the endpoint supports it
- validate format lightly enough to avoid blocking valid provider URLs unnecessarily

### Metadata validation

- allow caption to remain optional unless the backend requires it
- keep sort-order validation numeric and simple

Guardrail:

- validation should protect obvious errors without making media management feel bureaucratic

## Styling Plan

### Media page styling

- use larger previews than standard data cards so hosts can judge imagery properly
- preserve the same host shell card language and spacing rhythm
- keep controls secondary to the image itself

### Gallery styling

- use clean cards with one strong preview area
- make cover-image treatment visible through a badge, label, or accent outline
- keep metadata controls compact and readable

### State styling

- loading states should match existing host portal skeleton patterns
- empty states should feel aspirational and action-oriented
- error states should explain recovery paths cleanly
- upload states should feel active but not chaotic

## Step-By-Step Build Checklist

### Part 1: API helper preparation

- add property media types to `lib/host.ts`
- add fetch, create, update, and delete helpers for property media
- normalize media response shapes defensively

### Part 2: Route and stepper updates

- create `/host/properties/[propertyId]/media`
- update property step framing so media becomes a real active stage
- add clear path from basics and location into media management

### Part 3: Media page shell

- build the media route page
- load property and media records
- handle loading, empty, error, and populated states

### Part 4: Upload flow

- add image upload UI
- support upload-in-progress feedback
- refresh the gallery after successful upload

### Part 5: Gallery actions

- add caption editing
- add sort-order editing
- add cover-image selection
- add delete actions

### Part 6: Optional video support

- add video URL form only if the API surface supports it cleanly
- keep the feature clearly optional and secondary

### Part 7: Polish

- tune preview sizing and spacing
- tune cover-image clarity
- tune upload and save feedback
- verify the media route feels like a natural continuation of the add-property workflow

## Risks

### Risk 1: Overbuilding a full digital asset manager too early

Trying to solve advanced cropping, drag-and-drop ordering, moderation, or rich preview tooling now would make this chunk too wide.

Guardrail:

- keep this chunk limited to practical host media management tied directly to listing creation

### Risk 2: Unclear cover-image handling

If the UI does not make the cover image obvious, the host may not trust which image guests will see first.

Guardrail:

- define cover-image treatment early
- keep gallery state and cover action visually explicit

### Risk 3: Upload flow feels fragile or opaque

Media uploads are one of the easiest places for hosts to lose confidence if progress and error states are weak.

Guardrail:

- show clear in-flight state
- provide direct success and failure feedback
- avoid ambiguous disabled states

### Risk 4: Video URL support is assumed without backend confirmation

The chunked plan mentions video URL entry, but the actual endpoint behavior may vary.

Guardrail:

- keep video support optional
- implement it only if the media endpoint and response model support it cleanly

### Risk 5: Media route breaks the existing property workflow rhythm

If the media manager feels visually disconnected from the basics and location editor, the whole add-property flow will feel stitched together.

Guardrail:

- reuse the same shell, step framing, typography, and card language already established in the portal

## Acceptance Criteria

This step is complete when:

1. `/host/properties/[propertyId]/media` exists and approved hosts can open it
2. the media page supports loading, empty, error, and populated states
3. host can upload at least one property image
4. host can update media metadata such as caption and sort order
5. host can choose a cover image when the API supports it
6. host can delete media items
7. optional video URL support is implemented only if the backend supports it cleanly
8. the media step feels connected to the existing property editor workflow
9. the UI remains aligned with the host shell and redesign language
10. `npm.cmd run build` passes after implementation

## Verification Plan

After implementation:

1. open `/host/properties/[propertyId]/media` as an approved host and verify loading, empty, error, and populated states
2. upload one or more images and verify they appear in the gallery
3. update caption and sort order for a media item and verify values reload correctly
4. set one image as the cover image and verify the UI reflects the change clearly
5. delete a media item and verify the gallery updates correctly
6. if video URL support is included, add a valid video URL and verify it renders correctly in the collection
7. verify non-host users still cannot access the media route
8. verify the path from basics and location into the media route feels natural
9. verify the media page remains consistent with the host portal shell and stepper language
10. run `npm.cmd run build`

## Final Recommendation For Step 5

Treat this step as a `listing visuals and media management` step, not as the full property completion system.

If this is done well:

- the add-property workflow moves from text-only drafting into a real guest-facing content stage
- hosts can build trust into listings earlier through strong visual content
- later units, pricing, verification, and submission work can plug into a more credible listing workflow
