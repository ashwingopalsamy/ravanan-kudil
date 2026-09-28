import { ArrowRight, ClipboardList, Ruler } from "lucide-react";
import { JournalPreview } from "../components/Journal";
import { elapsedCalendarDays, formatArea, formatDate, sortedEntries, type PublicRecords } from "../lib/records";

export function OverviewView({ records }: { records: PublicRecords }) {
  const entries = sortedEntries(records);
  const milestoneEntries = records.entries
    .filter((entry) => entry.id === "paperwork-began" || entry.id === "construction-began")
    .sort((a, b) => a.date.localeCompare(b.date));
  const latestEntry = entries.find((entry) => entry.id !== "paperwork-began" && entry.id !== "construction-began");
  const { project } = records;
  const daysElapsed = elapsedCalendarDays(project.constructionStarted, records.publishedAt);

  return <>
    <header className="view-intro overview-intro">
      <h1>Ravanan Kudil</h1>
      <p>A public record of an owner-managed home build in Tamil Nadu.</p>
    </header>

    <div className="overview-lead">
      <section className="surface-card chronology-card" aria-labelledby="chronology-title">
        <div className="card-heading">
          <div>
            <h2 id="chronology-title">Milestones</h2>
            <p>Owner-reported start dates.</p>
          </div>
        </div>
        <div className="chronology-elapsed">
          <strong className="tabular-nums">{daysElapsed}</strong>
          <span>calendar days since construction began<small>As of {formatDate(records.publishedAt, "long")} · not days worked</small></span>
        </div>
        <JournalPreview entries={milestoneEntries} previewTextById={{
          "paperwork-began": "The individual documents and their dates have not yet been added to this public record.",
          "construction-began": "Dated work notes, attendance and costs will appear as their sources are reconciled."
        }} />
        <div className="chronology-footer">
          <a className="button button--primary" href="#journey">Full journey <ArrowRight size={17} aria-hidden="true" /></a>
        </div>
      </section>

      <aside className="overview-context" aria-label="Home and record summary">
        <section className="surface-card context-card" aria-labelledby="scope-title">
          <div className="card-heading">
            <div>
              <h2 id="scope-title">Home profile</h2>
              <p>Early owner-reported area estimate.</p>
            </div>
            <Ruler size={20} strokeWidth={1.7} aria-hidden="true" />
          </div>
          <div className="context-facts">
            <div><span>Ground floor</span><strong>≈ {formatArea(project.areasSqFt.groundFloor)} sq ft</strong></div>
            <div><span>Construction</span><strong>RCC · steel · red brick</strong></div>
          </div>
          <p className="context-note-copy">The porch range is still being reconciled. Detailed plans remain private.</p>
          <a className="text-action" href="#home">Home details <ArrowRight size={16} aria-hidden="true" /></a>
        </section>
        <section className="surface-card coverage-card" aria-labelledby="coverage-title">
          <div className="card-heading">
            <h2 id="coverage-title">Record coverage</h2>
            <ClipboardList size={20} strokeWidth={1.7} aria-hidden="true" />
          </div>
          <dl className="coverage-list">
            <div><dt>Finance</dt><dd>{records.finance.length} {records.finance.length === 1 ? "entry" : "entries"}</dd></div>
            <div><dt>Attendance</dt><dd>{records.attendance.length} {records.attendance.length === 1 ? "date" : "dates"}</dd></div>
            <div><dt>Materials</dt><dd>{records.materials.length} {records.materials.length === 1 ? "event" : "events"}</dd></div>
            <div><dt>Equipment</dt><dd>{records.equipment.length} {records.equipment.length === 1 ? "event" : "events"}</dd></div>
          </dl>
        </section>
      </aside>
    </div>

    {latestEntry && <section className="surface-card latest-entry-card" aria-labelledby="latest-entry-title">
      <div className="card-heading">
        <h2 id="latest-entry-title">Latest dated update</h2>
        <a className="text-action" href="#journey">All entries <ArrowRight size={16} aria-hidden="true" /></a>
      </div>
      <JournalPreview entries={[latestEntry]} />
    </section>}
  </>;
}
