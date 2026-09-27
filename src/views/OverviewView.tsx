import { ArrowRight, ArrowUpRight, CalendarDays, Check, CircleHelp, HardHat, ReceiptText, Ruler, Truck } from "lucide-react";
import { JournalPreview } from "../components/Journal";
import { elapsedCalendarDays, formatArea, formatDate, sortedEntries, type PublicRecords } from "../lib/records";

export function OverviewView({ records }: { records: PublicRecords }) {
  const entries = sortedEntries(records);
  const { project } = records;
  const daysElapsed = elapsedCalendarDays(project.constructionStarted, records.publishedAt);
  const recordedTransactions = records.finance.filter((item) => item.kind === "payment" || item.kind === "refund").length;
  return (
    <>
      <section className="overview-hero" aria-labelledby="overview-title">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-mark" aria-hidden="true" /> The home / Tamil Nadu</div>
          <h1 id="overview-title">Ravanan Kudil<span className="title-period">.</span></h1>
          <p>An owner-managed home taking shape on its owner’s farmland. This is the public record of the work, the people and the spending, as the evidence is brought together.</p>
          <div className="hero-actions"><a className="button button--primary" href="#journey">Explore the journey <ArrowUpRight size={17} aria-hidden="true" /></a><a className="button button--quiet" href="#records">View records <ArrowRight size={17} aria-hidden="true" /></a></div>
        </div>
        <div className="hero-history" aria-label="Project dates">
          <div className="hero-history-header"><span className="overline">Project status</span><span className="status-pill status-pill--active"><span className="status-pulse" /> Under construction</span></div>
          <div className="history-step"><span className="history-step-icon"><CalendarDays size={18} strokeWidth={1.8} aria-hidden="true" /></span><div><span>Paperwork began</span><strong>{formatDate(project.paperworkStarted, "long")}</strong></div><Check size={17} strokeWidth={1.9} aria-hidden="true" /></div>
          <div className="history-step"><span className="history-step-icon"><HardHat size={18} strokeWidth={1.8} aria-hidden="true" /></span><div><span>Physical build began</span><strong>{formatDate(project.constructionStarted, "long")}</strong></div><span className="history-step-current" aria-hidden="true" /></div>
          <div className="history-elapsed"><strong className="tabular-nums">{daysElapsed}</strong><div><span>Calendar days elapsed</span><small>To {formatDate(records.publishedAt)} · not days worked</small></div></div>
          <p>Dates reported by the owner. Detailed records are added when confirmed.</p>
        </div>
      </section>

      <div className="overview-columns">
        <section className="surface-card latest-card" aria-labelledby="latest-title">
          <div className="card-heading"><div><span className="overline">The journal</span><h2 id="latest-title">From the record</h2><p>Dated milestones currently published by the owner.</p></div><a className="text-action" href="#journey">All entries <ArrowUpRight size={16} aria-hidden="true" /></a></div>
          <JournalPreview entries={entries.slice(0, 3)} />
        </section>
        <aside className="overview-context" aria-label="Home context">
          <section className="surface-card context-card" aria-labelledby="scope-title"><div className="card-heading"><div><span className="overline">The home</span><h2 id="scope-title">Built with local hands</h2></div><Ruler size={20} strokeWidth={1.7} aria-hidden="true" /></div><p>RCC concrete, steel rods and red brick. Its approximate floor areas are part of the public record; detailed plans remain private.</p><div className="context-facts"><div><span>Ground floor</span><strong>≈ {formatArea(project.areasSqFt.groundFloor)} sq ft</strong></div><div><span>First floor</span><strong>≈ {formatArea(project.areasSqFt.firstFloor)} sq ft</strong></div><div><span>RCC porch</span><strong>≈ {formatArea(project.areasSqFt.porchMin)}–{formatArea(project.areasSqFt.porchMax)} sq ft</strong></div></div><a className="text-action" href="#home">About the home <ArrowUpRight size={16} aria-hidden="true" /></a></section>
          <section className="context-note"><CircleHelp size={19} strokeWidth={1.8} aria-hidden="true" /><p>Unpublished costs or attendance are shown as unknown. No missing day is counted as a day off.</p></section>
        </aside>
      </div>

      <section className="coverage-section" aria-labelledby="coverage-title"><div className="section-line"><div><span className="overline">At this point</span><h2 id="coverage-title">What the record can show</h2></div><span className="section-line-meta">Updated {formatDate(records.publishedAt)}</span></div><div className="coverage-list"><div className="coverage-item"><ReceiptText size={19} strokeWidth={1.7} aria-hidden="true" /><div><h3>Spending</h3><p>Payments and refunds, separate from quotes and bills.</p></div><span className="state-label">{recordedTransactions ? `${recordedTransactions} ${recordedTransactions === 1 ? "transaction" : "transactions"}` : "Awaiting records"}</span></div><div className="coverage-item"><HardHat size={19} strokeWidth={1.7} aria-hidden="true" /><div><h3>Labour</h3><p>Confirmed work dates and worker-days.</p></div><span className="state-label">{records.attendance.length ? `${records.attendance.length} ${records.attendance.length === 1 ? "date" : "dates"}` : "Awaiting records"}</span></div><div className="coverage-item"><Ruler size={19} strokeWidth={1.7} aria-hidden="true" /><div><h3>Materials</h3><p>Purchases, deliveries and use, each with its own unit.</p></div><span className="state-label">{records.materials.length ? `${records.materials.length} ${records.materials.length === 1 ? "entry" : "entries"}` : "Awaiting records"}</span></div><div className="coverage-item"><Truck size={19} strokeWidth={1.7} aria-hidden="true" /><div><h3>Equipment</h3><p>Hires and use, with days and trips kept separate.</p></div><span className="state-label">{records.equipment.length ? `${records.equipment.length} ${records.equipment.length === 1 ? "entry" : "entries"}` : "Awaiting records"}</span></div></div></section>
    </>
  );
}
