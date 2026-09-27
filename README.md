# Ravanan Kudil

A public construction journal for an owner-managed home in Tamil Nadu. The site begins with the two dates confirmed by its owner: paperwork started in December 2024, and construction started on 6 March 2026. Spending, attendance, material quantities and photographs remain unpublished until their records are reviewed.

The current public release is the plain HTML, CSS and JavaScript site in `dist/`. A new React application is being developed locally on the `local/react-studio` branch. The public release remains unchanged; no local app work is being published to GitHub.

## Local application

The local app uses React 19, TypeScript, Vite, Inter Variable via Fontsource, Zod for public-record validation, Lucide icons and Motion for brief view transitions. It has no backend or admin interface: the owner and coding assistant review changes to `data/public-records.json`, and the app derives its views from that file. Equipment is an additional empty record collection in the local model. No equipment activity has been inferred.

Run `npm install` and `npm run dev` from the repository root, then open the local address printed by Vite. `npm run build` writes to ignored `build/`; it does not replace or deploy `dist/`. The local branch is the design and engineering work area until the owner accepts a public release.

## Updating the record

The owner gives a daily note and any supporting evidence to their coding assistant. The assistant proposes changes to the local `data/public-records.json`, checks what is actually established, and lets the owner review the exact diff before any publication. Backfilled history uses the same process. A description such as “two people worked on the porch; roof quotation received” can establish one dated work entry and two worker-days if confirmed; the quotation does not increase spend.

The local JSON uses schema version 2. Its `project` object holds the two confirmed milestone dates and approximate area estimates. The overview calculates elapsed calendar days from the construction start to `publishedAt`; that figure is not attendance or construction progress. Its five event lists are:

- `entries`: dated prose for meaningful project events. Use a full `YYYY-MM-DD` date when known or `YYYY-MM` when only the month is known. Each entry has `id`, `date`, `title`, `body` and a public source.
- `finance`: individual `quote`, `invoice`, `payment` or `refund` entries. Each has a stable `id`, `YYYY-MM-DD` date, `kind`, `description`, `category`, nonnegative integer `amountPaise`, and a public source. Optional `relatedId` connects a payment to its bill or quote. Only payments minus refunds count as recorded spend.
- `attendance`: at most one entry per `YYYY-MM-DD` date, with `id`, `date`, `state` (`worked`, `no_work` or `unknown`) and a public source. A worked date may have an integer `workers` headcount; optional `note` describes the work. A missing date remains unknown. Workdays count dates marked `worked`; worker-days sum known daily headcounts.
- `materials`: separate `purchased`, `delivered`, `used` and `returned` events, each with `id`, date, `action`, `name`, positive numeric `quantity`, `unit` and public `source`. Use `specification` for details such as steel diameter. Do not add unlike units or treat a purchase as installed material.
- `equipment`: separate `hired`, `used` and `returned` events, with date, name, quantity, unit and public source. Days and trips remain distinct units. The current list is empty.

Every entry is public. Its `source` object has a `kind` (`owner_report`, `site_note`, `document`, `photo` or `other`) and its own `date`, which may be month-only when that is all that is known. This is the date of the source, distinct from the event date. An optional `description` can identify the evidence in public-safe terms. If a published record is corrected, append a dated explanation to its `corrections` array; keep earlier correction notes and review the Git diff rather than silently replacing history. Keep raw bills, payment screenshots, worker names, the exact location, detailed floor plans and wiring outside this repository and its Git history. Change `publishedAt` to the date of the approved public update. No sample or hypothetical construction event belongs in the public JSON.

If the JSON is invalid, the local app hides derived figures and reports that the public record needs correction. Missing lists are never interpreted as zero historical activity.

## Running locally

Use `npm run dev` for the local React application. To inspect the existing public release locally, serve `dist/` with a static HTTP server; that version fetches `dist/data/public-records.json`.

## License

Site code is MIT licensed. The owner's construction records, written journal entries, and future photographs are not covered by that software license; permission is required to reuse them outside this site.
