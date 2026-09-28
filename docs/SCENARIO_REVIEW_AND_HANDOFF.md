# Scenario review and continuation handoff

**Scope:** Historical review of the 28 September scenario fixture, followed by the 29 September interior redesign. The current deployment state is determined by the GitHub Pages workflow and live site.

This note records the synthetic dashboard scenario requested on 28 September 2026. It is not evidence about the actual build. Keep the fixture separate from `data/public-records.json`, which remains the canonical owner-reported record. Every view, chart, total, and exported value derived from the fixture must remain clearly labelled **Illustrative data** (or equivalent) so a public visitor cannot mistake it for actual attendance, spending, purchases, or construction history.

## Confirmed owner-reported facts

- Physical construction began **6 March 2026**. Paperwork began in **December 2024**.
- As reported on 28 September 2026, the **ground floor**, approximately **2,000 sq ft**, has reached lintel level at about **8 ft**. Red-brick walls have since been raised to about **11 ft**. The ground-floor RCC roof pour has not happened yet.
- The owner estimates actual spending so far at **₹24–26 lakh**, including labour and associated materials such as cement, TMT steel, M-sand, P-sand, 20 mm and 40 mm stone aggregate (“jalli”), and other construction costs.
- Approximate project areas from earlier owner context: first floor about **500 sq ft**, extendable RCC porch about **500–600 sq ft**, and total about **3,050–3,100 sq ft**. How the porch is included in the total remains unresolved.
- The owner wants the tracker to reflect a slow-moving, locally appropriate South Indian RCC, steel, and red-brick build. No actual dated attendance, worker identities, labour payments, material quantities, supplier bills, or equipment logs were supplied in this request.

The date range for this illustrative view is **6 March–28 September 2026**, inclusive. It contains 207 calendar dates. The stage description is owner-reported as of 28 September; its exact completion date is unknown. Do not invent historical milestone dates or infer an overall completion percentage from the current stage.

## Synthetic fixture targets

These values are deliberately generated for demonstrating useful charts. They must not be described as reconstructed, measured, invoiced, paid, delivered, or installed facts.

### Attendance

- Generate 118 illustrative worked dates, restricted to **Monday, Tuesday, Thursday, and Friday** in the inclusive date range. Treat this as a sparse assumed work pattern, not a claim that other dates lacked work.
- Set all 30 Sundays in the range to illustrative scheduled days off. Classify the other 59 non-Sunday dates outside the selected pattern as illustrative assumed no-work days.
- For each illustrative worked date, assign 3 workers on even UTC day ordinals and 2 on odd UTC day ordinals. The fixture target is **296 worker-days** across **118 calendar workdays** (mean about 2.51 workers per worked date).
- Do not show labour hours: the owner said they are difficult to track. Keep calendar workdays distinct from worker-days. Fixture “no-work” and “scheduled off” must never be conflated with missing real attendance, which remains unknown.

### Spending

Use **₹25.0 lakh** as the midpoint of the owner's reported ₹24–26 lakh range for the illustrative budget view. Allocate the mock total across these fixture-only buckets:

| Category | Illustrative amount |
| --- | ---: |
| Labour | ₹4.0 lakh |
| TMT steel | ₹6.5 lakh |
| Cement | ₹3.3 lakh |
| Red brick | ₹3.0 lakh |
| M-sand | ₹1.5 lakh |
| P-sand | ₹0.9 lakh |
| 20 mm jalli | ₹1.2 lakh |
| 40 mm jalli | ₹0.6 lakh |
| Formwork / centering | ₹1.8 lakh |
| Equipment | ₹0.8 lakh |
| Other | ₹1.4 lakh |
| **Total** | **₹25.0 lakh** |

Illustrative monthly totals, which must reconcile exactly to that category total:

| Month | Illustrative amount |
| --- | ---: |
| March 2026 (from the 6th) | ₹1.5 lakh |
| April 2026 | ₹2.8 lakh |
| May 2026 | ₹3.5 lakh |
| June 2026 | ₹4.8 lakh |
| July 2026 | ₹3.5 lakh |
| August 2026 | ₹4.7 lakh |
| September 2026 (through the 28th) | ₹4.2 lakh |
| **Total** | **₹25.0 lakh** |

The category and month tables are two views of the same illustrative ₹25 lakh target; do not add them together. No category-level or month-level split was supplied by the owner. They are display assumptions only, not local market-price guidance. Do not label a bucket as a verified payment, quote, invoice, or purchase. Do not calculate a committed budget, overrun, or cost per square foot from these inputs.

### Materials, equipment, and construction stage

- Use materials and equipment only as clearly labelled mock chart values if needed to make those visualizations demonstrable. State their quantities and units as synthetic assumptions and do not imply that materials were used, delivered, or purchased on particular dates.
- Do not infer Tata Tiscon rod sizes, counts, lengths, or weights. A past example about a steel discussion and a roof quotation was explicitly hypothetical in the product brief.
- Show the current ground-floor state as a named stage: lintel at about 8 ft; brickwork extended to about 11 ft; RCC roof pour pending. Mark the status date as **reported 28 Sep 2026** if the UI needs a date. Do not assign a historical stage date or a numerical progress percentage.
- No government subsidy, loan, or construction scheme was reported. Do not create scheme participation data.

## Astra pre-review

**Review basis:** conversation requirements, current `PRODUCT_BRIEF.md`, `AGENTS.md`, `README.md`, and `data/public-records.json`, before the requested fixture implementation.

1. **Why the dashboard appeared empty:** the current canonical record has two dated entries (paperwork month and construction start) and empty finance, attendance, materials, and equipment arrays. Charts based only on those lists cannot truthfully show the requested cost and labour analysis.
2. **Data integrity boundary:** the existing brief says not to fabricate historical facts and the site is public. The new request authorizes mock data for demonstration, but does not turn it into construction history. Therefore, isolate the fixture from canonical owner records and label every derived figure and visualization as illustrative.
3. **Financial meaning:** the ₹24–26 lakh range is owner-reported as total spending to date, but there are no source transactions or category splits. The ₹25 lakh midpoint and all category/month amounts above are scenario assumptions; they cannot be presented as audited or traced spending.
4. **Labour meaning:** the requested average of about 2–3 people per day is a scenario target. Workday counts and worker-days are separate measures. Only the fixture can call generated dates worked, no-work, or scheduled off; absent canonical attendance remains unknown.
5. **Progress meaning:** the latest stage is now owner-reported, but its historical date and the total completion denominator are not. Showing the ground-floor lintel and brickwork state is appropriate; a whole-home percentage or finish date is not supported.
6. **Privacy and provenance:** do not add a detailed plan, exact site location, worker identities, receipts, payment screenshots, or private source evidence. Do not imply synthetic material quantities or stage dates are sourced.

## Implementation and post-review

- [x] Keep owner-reported milestones and approximate areas in canonical data; the latest stage is dated only as reported 28 September, with no invented stage-completion date.
- [x] Keep generated attendance and finance in a separate scenario fixture and expose the scenario/record switch.
- [x] Reconcile the fixture to 118 worked dates, 296 worker-days, 30 Sundays scheduled off, and 59 other assumed no-work dates.
- [x] Reconcile category and month views independently to ₹25.0 lakh; partial March and September periods are identified.
- [x] Correct finance ordering language and remove the duplicate rupee marker found during audit.
- [x] Preserve source semantics, unknown real attendance, the current stage description, and the public privacy boundary.

**Sol post-audit:** Identified three presentation/data-label issues: March and September are partial months and needed explicit scope; a finance value displayed a duplicate ₹ marker; the finance ordering label was inaccurate. All three were corrected before acceptance.

**Astra post-review:** Astra gave conditional acceptance before the final UI fixes. The subsequent fixes satisfied its listed conditions, as confirmed in the final root review: scenario data remains distinct from owner records, synthetic figures reconcile, partial periods are explicit, and finance labels are corrected. This is a review of the local implementation; it is not approval to publish.

**Verification recorded by the implementation reviewer:** `npm run check`, `npm run build`, and `git diff --check` succeeded. Scenario invariants were checked: 118 worked dates, 296 worker-days, 30 Sundays off, 59 other assumed no-work dates, and ₹25.0 lakh for both category and monthly totals. In Chrome at **1440×900**, the compact charcoal rail, inset rounded white workspace, scenario banner, KPI row, monthly allocation, and owner-status view rendered with a clean layout. At **390×844** and **320×740**, there was no horizontal overflow; bottom-navigation labels stayed on one line and the bottom navigation remained fixed. Switching between owner-record and illustrative-scenario views was verified. These checks do not validate synthetic assumptions as real construction history.

## Post-review and continuation handoff

**Continuation handoff:**

- At the end of the 28 September scenario phase, implementation and review were local only. The subsequent interior redesign is documented below.
- Next step: continue from the reviewed local tree. Keep future owner-supplied records separate from the illustrative fixture and review any public data change for privacy before release.
- Remaining limitation: mock allocations and attendance demonstrate the interface only; the actual ₹24–26 lakh estimate still has no transaction-level reconciliation, and real attendance/material/equipment records remain unsupplied.

## 29 September interior redesign and release handoff

The approved interior redesign retains the black frame, desktop rail and fixed mobile navigation. The continuous white workspace now opens with the owner-reported ₹24–26 lakh range, the ground-floor stage, and a clearly synthetic 296 worker-days/118 assumed dates. The illustrative mode provides monthly bars and a cumulative spending line with independent scales, a cost-category ranking, a separate labour chart and attendance calendar, and material/equipment examples. Journey is a dated reading column; Records is a filterable register; Home presents approximate areas and heights without a floor plan. The owner mode keeps absent registers explicitly unrecorded.

**Astra rendered review:** The first pass found mobile SVG text too small, a cramped 320 px update strip, unclear filtered material counts/scope, and excess mobile Records height. These were corrected. The final pass checked Overview at 320, 390 and 1440 px plus Records, Journey and Home on mobile and desktop. Its remaining desktop cost-chart axis collision was resolved by reserving a right plot gutter; the last bar and right-axis labels were measured separately afterward.

**Sol semantic review:** Cost categories and months derive from one ₹25 lakh allocation matrix. The 296 worker-days are summed daily crew counts, not distinct workers or hours. The September and March partial periods, independent chart scales, month-only material/equipment examples, and unknown actual attendance remain explicit. Final review found no P1 arithmetic, privacy, provenance or owner/scenario leakage issue. The review's P2 findings were addressed: roof wording follows canonical status, empty register copy follows the active filters, `publishedAt` reflects the 29 September public update while the owner report stays dated 28 September, and in-page chart selections replace history while chart-to-record drilldowns create a Back-restorable entry.

**Rendered acceptance:** Both modes and Overview, Journey, Records and Home were inspected at 320, 390, 768 and 1440 px without page or content horizontal overflow. The first 320 and 390 px viewport contains the spend, stage and properly labelled labour measure. A temporary 200% root-font simulation at 390 px found overflow in navigation and dense chart headings; these were fixed, and all eight page/mode combinations then had no page overflow. Checked interactions include chart selection and Records drilldown, Back/Forward restoration, month and category filters, one-day labour inspection, row disclosure, source-dated Journey links, owner empty registers and keyboard focus. Reduced-motion rules were reviewed in CSS; the operating-system preference was not toggled. The final source check/build and exact-commit Pages deployment remain release gates; do not infer them from this design review.

Continue future updates from `data/public-records.json`: review each public source for privacy, preserve month-only dates when that is all that is known, and keep synthetic assumptions in `src/lib/scenario.ts`. A real transaction, attendance day or material quantity should enter the owner record only after its evidence is supplied and reviewed.
