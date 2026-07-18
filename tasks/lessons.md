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

## Property Page Notes

- For the single-property page, avoid over-designed nested gradient boxes inside content cards; prefer cleaner `surface-card` sections with one strong inner block and simpler hierarchy.
