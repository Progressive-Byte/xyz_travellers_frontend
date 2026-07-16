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
