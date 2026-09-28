import { ArrowRight } from "lucide-react";
import { JournalPreview } from "../components/Journal";
import { ScenarioAllocationByCategory, ScenarioAllocationByMonth, ScenarioAttendanceByMonth, ScenarioResourceSnapshot } from "../components/ScenarioAnalytics";
import type { DataMode } from "../components/DataModeControl";
import { elapsedCalendarDays, formatArea, formatDate, sortedEntries, type PublicRecords } from "../lib/records";
import type { ScenarioSelection, ScenarioSelectionPatch } from "../lib/scenario-url";
import { illustrativeScenario } from "../lib/scenario";

export function OverviewView({ records, mode, selection, onSelectionChange }: { records: PublicRecords; mode: DataMode; selection: ScenarioSelection; onSelectionChange: (patch: ScenarioSelectionPatch) => void }) {
  const entries = sortedEntries(records);
  const milestoneEntries = records.entries
    .filter((entry) => entry.id === "paperwork-began" || entry.id === "construction-began")
    .sort((a, b) => a.date.localeCompare(b.date));
  const latestEntry = entries.find((entry) => entry.id !== "paperwork-began" && entry.id !== "construction-began");
  const { project } = records;
  const daysElapsed = elapsedCalendarDays(project.constructionStarted, records.publishedAt);
  const lakh = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
  const reportedRange = records.currentStatus.reportedSpendRangePaise
    .map((paise) => lakh.format(paise / 10_000_000))
    .join("–");
  const roofCast = records.currentStatus.groundFloorRoof === "cast";

  return <>
    <header className="view-intro overview-intro">
      <h1>Ravanan Kudil</h1>
      <p>An owner-managed build, documented as it unfolds.</p>
    </header>

    <section className="overview-summary" aria-label="Reported cost, current stage and labour record">
      <div className="overview-summary-row overview-summary-cost"><span>Estimated spent to date<small>Owner report · approximate</small></span><strong>₹{reportedRange} lakh</strong><small>Reported {formatDate(records.currentStatus.asOf, "long")} · itemised payments are not recorded</small></div>
      <div className="overview-summary-row"><span>Reported stage</span><strong>{roofCast ? "Ground-floor RCC roof cast" : `Ground-floor brickwork · ≈${records.currentStatus.brickworkHeightApproxFeet} ft`}</strong><small>Owner report · {formatDate(records.currentStatus.asOf, "long")} · lintel complete at ≈{records.currentStatus.lintelHeightApproxFeet} ft · {roofCast ? "RCC roof cast" : "RCC roof not cast"}</small></div>
      {mode === "scenario" ? <div className="overview-summary-row overview-summary-labour"><span>Illustrative labour model <small>Assumptions only · not actual attendance</small></span><strong>{illustrativeScenario.workerDays} worker-days</strong><small>{illustrativeScenario.workedDates} assumed work dates · 2–3 modelled crew · not unique people or hours</small></div> : <div className="overview-summary-row"><span>Attendance record</span><strong>Not recorded</strong><small>Work dates and worker-days have not yet been established from dated sources.</small></div>}
    </section>

    {latestEntry && <section className="latest-entry-card" aria-label="Latest dated owner update">
      <span className="latest-entry-meta">Latest owner report · {formatDate(latestEntry.source.date, "long")}</span>
      <a className="latest-entry-link" href={`#journey/${latestEntry.id}`}>Read the stage and spend note <ArrowRight size={16} aria-hidden="true" /></a>
    </section>}

    {mode === "scenario" ? <>
      <div className="scenario-dashboard-grid">
        <ScenarioAllocationByMonth selection={selection} onSelectionChange={onSelectionChange} />
        <ScenarioAttendanceByMonth selection={selection} onSelectionChange={onSelectionChange} />
      </div>
      <div className="scenario-dashboard-grid scenario-dashboard-grid--lower">
        <ScenarioAllocationByCategory selection={selection} onSelectionChange={onSelectionChange} />
        <ScenarioResourceSnapshot onSelectionChange={onSelectionChange} />
      </div>
    </> : <section className="overview-owner-context" aria-label="Owner record context">
      <section aria-labelledby="owner-milestones-title">
        <div className="overview-section-heading"><div><h2 id="owner-milestones-title">Journey to date</h2><p>Started {formatDate(project.constructionStarted, "long")} · {daysElapsed} calendar days elapsed</p></div><a className="text-action" href="#journey">All entries <ArrowRight size={16} aria-hidden="true" /></a></div>
        <JournalPreview entries={milestoneEntries} previewTextById={{
          "paperwork-began": "The individual documents and their dates have not yet been added to this public record.",
          "construction-began": "Dated work notes, attendance and costs will appear as their sources are reconciled."
        }} />
      </section>
      <section className="overview-owner-home" aria-labelledby="owner-home-title">
        <h2 id="owner-home-title">Home profile</h2>
        <dl><div><dt>Location</dt><dd>Tamil Nadu</dd></div><div><dt>Ground floor</dt><dd>≈{formatArea(project.areasSqFt.groundFloor)} sq ft</dd></div><div><dt>Construction</dt><dd>RCC · steel · red brick</dd></div></dl>
        <p>The porch estimate is still being reconciled. Detailed plans remain private.</p>
        <a className="text-action" href="#home">Home details <ArrowRight size={16} aria-hidden="true" /></a>
      </section>
    </section>}
  </>;
}
