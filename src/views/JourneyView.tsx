import { useEffect } from "react";
import { JournalDetail } from "../components/Journal";
import type { DataMode } from "../components/DataModeControl";
import { sortedEntries, type JournalEntry, type PublicRecords } from "../lib/records";

function groupByYear(entries: JournalEntry[]): [string, JournalEntry[]][] {
  const groups = new Map<string, JournalEntry[]>();
  for (const entry of entries) {
    const year = entry.date.slice(0, 4);
    groups.set(year, [...(groups.get(year) ?? []), entry]);
  }
  return [...groups.entries()];
}

export function JourneyView({ records, mode, selectedEntryId }: { records: PublicRecords; mode: DataMode; selectedEntryId?: string }) {
  const entries = sortedEntries(records);
  useEffect(() => {
    if (!selectedEntryId) return;
    const entry = document.getElementById(`journal-${selectedEntryId}`);
    entry?.scrollIntoView({ block: "start" });
    entry?.querySelector<HTMLElement>("summary")?.focus({ preventScroll: true });
  }, [selectedEntryId]);
  return (
    <>
      <header className="view-intro"><div className="view-intro-line"><div><h1>The journey</h1><p>{mode === "scenario" ? "The chronology contains owner-reported dates only; the synthetic daily schedule does not assign tasks or stage completion dates." : "Each entry keeps its original date and source. Month-only dates stay at month-level precision."}</p></div></div></header>
      <div className="journey-layout"><div className="timeline-surface">
        <div className="timeline-heading"><span>{entries.length} {entries.length === 1 ? "entry" : "entries"}</span><span>Newest first</span></div>
        {entries.length ? groupByYear(entries).map(([year, items]) => <section className="timeline-year" key={year} aria-label={`${year} entries`}><div className="timeline-year-label">{year}<span>{items.length} {items.length === 1 ? "event" : "events"}</span></div><div className="timeline-year-items">{items.map((entry) => <JournalDetail entry={entry} key={entry.id} selected={entry.id === selectedEntryId} latest={entry.id === entries[0].id} />)}</div></section>) : <div className="empty-record"><h3>No dated entries have been published.</h3><p>The first journal notes will appear here after their source dates are confirmed.</p></div>}
      </div></div>
    </>
  );
}
