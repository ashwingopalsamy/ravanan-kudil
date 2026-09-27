import { CalendarRange, Info, MoveUpRight } from "lucide-react";
import { JournalDetail } from "../components/Journal";
import { sortedEntries, type JournalEntry, type PublicRecords } from "../lib/records";

function groupByYear(entries: JournalEntry[]): [string, JournalEntry[]][] {
  const groups = new Map<string, JournalEntry[]>();
  for (const entry of entries) {
    const year = entry.date.slice(0, 4);
    groups.set(year, [...(groups.get(year) ?? []), entry]);
  }
  return [...groups.entries()];
}

export function JourneyView({ records }: { records: PublicRecords }) {
  const entries = sortedEntries(records);
  return (
    <>
      <header className="view-intro"><div className="eyebrow"><span className="eyebrow-mark" /> The project / Timeline</div><div className="view-intro-line"><div><h1>From first papers to site work.</h1><p>Each entry has a date and a public source. Older events can be added later with their original dates and supporting notes.</p></div><span className="count-pill">{entries.length} {entries.length === 1 ? "entry" : "entries"} on record</span></div></header>
      <div className="journey-layout"><div className="timeline-surface">
        <div className="timeline-heading"><div><CalendarRange size={20} strokeWidth={1.7} aria-hidden="true" /><h2>Project timeline</h2></div><span>Newest first</span></div>
        {entries.length ? groupByYear(entries).map(([year, items]) => <section className="timeline-year" key={year} aria-label={`${year} entries`}><div className="timeline-year-label">{year}<span>{items.length} {items.length === 1 ? "event" : "events"}</span></div><div className="timeline-year-items">{items.map((entry) => <JournalDetail entry={entry} key={entry.id} />)}</div></section>) : <div className="empty-record"><h3>No dated entries have been published.</h3><p>The first journal notes will appear here after their source dates are confirmed.</p></div>}
      </div><aside className="journey-sidebar" aria-label="Timeline guidance"><div className="aside-panel"><span className="aside-panel-icon"><Info size={18} strokeWidth={1.7} aria-hidden="true" /></span><h2>Reading the dates</h2><p>A month-only date records what is known without assigning an invented day. Open any entry for its source and full note.</p></div><div className="aside-panel"><span className="overline">Next in the record</span><h2>More detail, over time</h2><p>Site visits, labour and purchases can be added as the owner reconciles their dates and supporting evidence.</p><a className="text-action" href="#records">How records are counted <MoveUpRight size={16} aria-hidden="true" /></a></div></aside></div>
    </>
  );
}
