# Ravanan Kudil

**v0.0.1** is a public, read-only construction record for an owner-managed home in Tamil Nadu. The canonical record includes an owner report dated 28 September 2026: ground-floor lintel at approximately 8 ft, red-brick walls to approximately 11 ft, the RCC roof not yet cast, and overall estimated spending of ₹24–26 lakh. Itemised payments, attendance, material quantities and equipment use remain unsourced. The separate ₹25 lakh allocation and 118-date/296-worker-day scenario is synthetic demonstration data and is not stored in the canonical public records JSON.

The site is a responsive React application built with TypeScript, Vite, Inter Variable, Lucide icons, Motion and Zod. It has no backend or admin interface. The owner reviews changes to `data/public-records.json`; the app derives its views from that file. GitHub Pages builds from source and deploys the generated `build/` artifact on updates to `main`.

Run `npm ci` and `npm run dev` from the repository root, then open the local address printed by Vite. `npm run build` creates the deployable static site in `build/`.

## Updating the record

The owner gives a dated note and any supporting evidence to their coding assistant. The assistant proposes changes to `data/public-records.json`, checks what the evidence establishes, and lets the owner review the exact diff before publication. Backfilled history uses the same process.

The JSON uses schema version 2. Its `project` object holds the two confirmed milestone dates and approximate area estimates; `currentStatus` holds the later source-dated owner report and spend range. The overview calculates elapsed calendar days from the construction start to `publishedAt`; that figure is not attendance or construction progress. Its five event lists are:

- `entries`: dated prose for meaningful project events. Use a full `YYYY-MM-DD` date when known or `YYYY-MM` when only the month is known. Each entry has `id`, `date`, `title`, `body` and a public source.
- `finance`: individual `quote`, `invoice`, `payment` or `refund` entries. Each has a stable `id`, `YYYY-MM-DD` date, `kind`, `description`, `category`, nonnegative integer `amountPaise`, and a public source. Optional `relatedId` connects a payment to its bill or quote. Only payments minus refunds count as recorded spend.
- `attendance`: at most one entry per `YYYY-MM-DD` date, with `id`, `date`, `state` (`worked`, `no_work` or `unknown`) and a public source. A worked date may have an integer `workers` headcount; optional `note` describes the work. A missing date remains unknown. Workdays count dates marked `worked`; worker-days sum known daily headcounts.
- `materials`: separate `purchased`, `delivered`, `used` and `returned` events, each with `id`, date, `action`, `name`, positive numeric `quantity`, `unit` and public `source`. Use `specification` for details such as steel diameter. Do not add unlike units or treat a purchase as installed material.
- `equipment`: separate `hired`, `used` and `returned` events, with date, name, quantity, unit and public source. Days and trips remain distinct units. The current list is empty.

Every entry is public. Its `source` object has a `kind` (`owner_report`, `site_note`, `document`, `photo` or `other`) and its own `date`, which may be month-only when that is all that is known. This is the date of the source, distinct from the event date. An optional `description` can identify the evidence in public-safe terms. If a published record is corrected, append a dated explanation to its `corrections` array; keep earlier correction notes and review the Git diff rather than silently replacing history. Keep raw bills, payment screenshots, worker names, the exact location, detailed floor plans and wiring outside this repository and its Git history. Change `publishedAt` to the date of the approved public update. No sample or hypothetical construction event belongs in the public JSON.

If the JSON is invalid, the app hides derived figures and reports that the public record needs correction. Missing lists are never interpreted as zero historical activity. The illustrative scenario is generated in application code with explicit synthetic provenance and never supplies facts to the confirmed-record view.

## Running locally

Use `npm run dev` for the local application. The Pages workflow runs the production build on pull requests and deploys it after changes reach `main`.

## Reading the site

The first screen leads with the owner's approximate spending range and current build stage. The **Owner record / Illustrative model** choice on Overview and Records separates sourced statements from synthetic examples. Charts, the attendance calendar, and model registers are labelled illustrative even when viewed alone. The owner record has no itemised finance, attendance, material, equipment or photo entries yet; missing records appear as unrecorded, never as zero activity. The site does not calculate work completion, a finish date, cost per square foot or material stock.

The URL preserves the selected model month, cost category, record type and date. Selecting a chart value updates its detail area; opening Records carries the relevant filter. Back and Forward restore the route and its shareable selection.

## License

Site code is MIT licensed. The owner's construction records, written journal entries, and future photographs are not covered by that software license; permission is required to reuse them outside this site.
