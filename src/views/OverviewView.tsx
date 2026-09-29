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
    </header>

    <section className="overview-summary" aria-label="Reported cost, current stage and labour record">
      <div className="overview-summary-main">
        <div className="overview-measure overview-measure--cost">
          <span className="overview-measure-label">Estimated spent to date</span>
          <strong>₹{reportedRange} <span>lakh</span></strong>
          <span className="overview-measure-source">Owner estimate · {formatDate(records.currentStatus.asOf, "long")}</span>
        </div>
        <div className="overview-measure overview-measure--stage">
          <span className="overview-measure-label">Current stage · ground floor</span>
          <strong>{roofCast ? "RCC roof cast" : `Brickwork to ≈${records.currentStatus.brickworkHeightApproxFeet} ft`}</strong>
          <p>Lintel complete near {records.currentStatus.lintelHeightApproxFeet} ft<span aria-hidden="true"> · </span>{roofCast ? "Roof cast" : "Roof not cast"}</p>
          <span className="overview-measure-source">Owner report · {formatDate(records.currentStatus.asOf, "long")}</span>
        </div>
      </div>
      <div className="overview-labour-line">
        <div className={`overview-measure overview-measure--labour${mode === "record" ? " is-unrecorded" : ""}`}>
          <span className="overview-measure-label">{mode === "scenario" ? "Illustrative labour model" : "Labour · owner record"}</span>
          <strong>{mode === "scenario" ? <>{illustrativeScenario.workerDays} <span>worker-days</span></> : "Unrecorded"}</strong>
        </div>
        {mode === "scenario" && <div className="overview-labour-context"><p>{illustrativeScenario.workedDates} assumed work dates · crew of 2–3</p><details><summary>How this was modelled</summary><p>Worker-days add the daily crew counts. They are not distinct people or hours. Actual attendance has not been recorded.</p></details></div>}
      </div>
    </section>

    {latestEntry && <a className="overview-latest-link" href={`#journey/${latestEntry.id}`}>Read the latest owner note <ArrowRight size={16} aria-hidden="true" /></a>}

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
