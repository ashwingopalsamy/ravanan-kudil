# Ravanan Kudil

A public construction journal for an owner-managed home in Tamil Nadu. The site begins with the two dates confirmed by its owner: paperwork started in December 2024, and construction started on 6 March 2026. Spending, attendance, material quantities and photographs remain unpublished until their records are reviewed.

The site is plain HTML, CSS and JavaScript in `dist/`. It has no package dependencies or build step. GitHub Pages publishes that directory when `main` changes. The public records are in `dist/data/public-records.json`; the page derives its figures from that file.

## Updating the record

The owner gives a daily note and any supporting evidence to their coding assistant. The assistant proposes changes to the public JSON and journal, checks what is actually established, and lets the owner review the exact diff before publishing. Backfilled history uses the same process. A description such as “two people worked on the porch; roof quotation received” can establish one dated work entry and two worker-days if confirmed; the quotation does not increase spend.

The JSON has four lists:

- `entries`: dated prose for meaningful project events. Use a full `YYYY-MM-DD` date when known or `YYYY-MM` when only the month is known. Each entry has `id`, `date`, `title`, `body` and a public `source` description.
- `finance`: individual `quote`, `invoice`, `payment` or `refund` entries. Each has a stable `id`, `YYYY-MM-DD` date, `kind`, `description`, `category`, nonnegative integer `amountPaise`, and public `source`. Optional `relatedId` connects a payment to its bill or quote. Only payments minus refunds count as recorded spend.
- `attendance`: at most one entry per `YYYY-MM-DD` date, with `id`, `date`, `state` (`worked`, `no_work` or `unknown`) and public `source`. A worked date may have an integer `workers` headcount; optional `note` describes the work. A missing date remains unknown. Workdays count dates marked `worked`; worker-days sum known daily headcounts.
- `materials`: separate `purchased`, `delivered`, `used` and `returned` events, each with `id`, date, `action`, `name`, positive numeric `quantity`, `unit` and public `source`. Use `specification` for details such as steel diameter. Do not add unlike units or treat a purchase as installed material.

Every entry is public. Keep raw bills, payment screenshots, worker names, the exact location, detailed floor plans and wiring outside this repository and its Git history. Use only a safe public description in a `source` field. Change `publishedAt` to the date of the approved public update. No sample or hypothetical construction event belongs in the public JSON.

If the JSON is invalid, the site hides derived figures and reports that the public record needs correction. Missing lists are never interpreted as zero historical activity.

## Running locally

Serve `dist/` with any local static HTTP server and open its root URL. A server is needed because the site fetches `data/public-records.json`.

## License

Site code is MIT licensed. The owner's construction records, written journal entries, and future photographs are not covered by that software license; permission is required to reuse them outside this site.
