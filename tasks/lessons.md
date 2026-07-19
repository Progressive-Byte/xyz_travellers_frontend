# Lessons

## Font And Color Summary

- Headline font: `Sora`
- Body font: `Instrument Sans`
- Primary color: `#D9F14B` (lime green)
- Primary hover: `#CDE243`
- Primary light: `#F5FBE0`
- Secondary/background color: `#EFEDE6` (cream white)
- Main text color: `#1A1B12` (false black)
- Secondary text color: `#6C6D66`
- Card color: `#FFFFFF`
- Border color: `#D9D8D0`
- Footer background: `#1A1B12`

## Usage Notes

- Use lime green for CTAs, active states, badges, and highlight accents.
- Use cream white for the main page background and soft surfaces.
- Use false black for headings, primary text, and dark sections like the footer.
- Keep `Sora` for headings and `Instrument Sans` for body/UI text for consistency.

## Regression Notes

- Do not hide `react-datepicker` custom inputs with `className="hidden"` when using `customInput`; it can remove the visible trigger and break open/click behavior.
- When redesigning the Hero search bar, preserve enough layout space for the guest dropdown so it does not visually overlap the category row in a broken way.
- Avoid leaving browser-default focus outlines on custom pill/segment buttons inside the Hero search bar; use intentional focus styling instead.
- Keep Hero search helper copy short enough to stay on one line when possible; wrapped helper text makes the whole bar feel too tall and heavy.
- Trim Hero segment vertical padding carefully; small padding increases compound quickly across the full search bar.
- For this project, the Hero search bar should favor a compact desktop height; default to smaller segment paddings and tighter helper text unless the user explicitly asks for a roomier style.
- When the user says the Hero search bar is still too tall, reduce both shell padding and type scale together; trimming only one of them is usually not enough.
- For a truly compact hero bar in this project, remove secondary/helper lines entirely instead of trying to preserve them at tiny sizes.

## Brand Notes

- The main brand name for this project is `XYZ Travellers`; replace any old brand-name occurrences with that canonical name in UI text, metadata, docs, and obvious code references.

## Interaction Notes

- In the Hero search bar, `Where` must remain a real text input. `Search destinations` is placeholder text, not static copy.
- During UI polish passes, explicitly verify cursor behavior on interactive elements; clickable controls should show a pointer, while true text-entry fields should keep the text cursor.
- In this Hero search bar, the `Search destinations` placeholder should use the same black text tone as the other search values instead of a faded placeholder color.
- If the user asks to strip the Hero down, remove the marketing badge/headline/stats entirely and keep only the search box plus a real tab row underneath; those tabs should drive the listings content below, not behave like isolated visual chips.
- When the Hero uses tabs to control listings, keep the transition tight: avoid extra empty gap under the tabs and remove any separate selected-tab heading block above the listings rail unless the user explicitly asks for it.

## Property Page Notes

- For the single-property page, avoid over-designed nested gradient boxes inside content cards; prefer cleaner `surface-card` sections with one strong inner block and simpler hierarchy.

## Listing Card Notes

- Do not show the property address as a pill overlay on the listing thumbnail; keep location details in the card body only and reserve the image overlay for badges like `New`.

## Planning Notes

- For host portal planning, treat `plans/HOST_PORTAL_CHUNKED_PLAN.md` as the source of truth for official chunk numbering; do not renumber chunks based on what feels next in the full plan.
- Create one detailed `HOST_PORTAL_CHUNK_X_PLAN.md` per official chunk by default, and only introduce sub-chunk plan files when a single official chunk is clearly too wide for one safe implementation pass.
- If sub-chunks are needed, keep the parent official chunk number and split under it consistently, for example `CHUNK_6A`, `CHUNK_6B`, or `CHUNK_6_STEP_1`, instead of inventing a new top-level chunk order.
- Before creating a new chunk plan or re-implementing a chunk, check the repo state first; if that official chunk already appears fully implemented, call that out instead of silently recreating it.

## Host Portal Workflow Notes

- When a host portal workflow stage is implemented as a real route, expose it through the visible stepper UI from earlier property-edit stages as well; do not leave a finished stage reachable only from one narrow handoff point.
- Final review pages like property verification must degrade gracefully when some downstream unit-level data is still incomplete or partially unavailable; show the page with honest checklist gaps instead of collapsing the whole workspace into a generic load failure.
