[OPEN] New Property Route Debug

## Session

- sessionId: `new-property-route`
- user symptom: clicking `Add property` lands on `/host/properties/new`, but that page immediately submits and fails before showing the actual form

## Falsifiable Hypotheses

1. `/host/properties/new` is still wired to a pre-form draft creator instead of a real create form component.
2. The route auto-calls `POST /api/v1/host/properties` on mount with an empty body, so the backend returns validation failure before the user can enter any data.
3. The host properties API does not support creating an empty draft record and expects actual property fields on create.
4. The current property editor architecture assumes an existing `propertyId`, so the shortcut route tried to fabricate that ID too early instead of offering a creation form first.

## Evidence

- Screenshot/network evidence shows `POST /api/v1/host/properties` returning `400 Bad Request` with `Validation failed` from `/host/properties/new`.
- `components/host/properties/HostPropertyStartPage.tsx` currently calls `createHostPropertyDraft()` during page load.
- `lib/host.ts` currently sends `body: {}` in `createHostPropertyDraft()`.
- `api/host/host-properties.md` documents `POST /api/v1/host/properties` as a JSON create endpoint with real property fields, not an empty draft bootstrap.

## Decision

- Replace the auto-submit bootstrap route with a real property creation form at `/host/properties/new`.
- Only submit to `POST /api/v1/host/properties` when the user submits the form.
