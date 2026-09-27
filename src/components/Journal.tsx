import { ArrowUpRight, ChevronDown } from "lucide-react";
import { formatDate, type JournalEntry } from "../lib/records";

export function JournalPreview({ entries }: { entries: JournalEntry[] }) {
  return (
    <div className="journal-preview-list">
      {entries.map((entry) => (
        <a className="journal-preview-row" href="#journey" key={entry.id}>
          <div className="journal-date"><time dateTime={entry.date}>{formatDate(entry.date)}</time><span>{entry.date.length === 7 ? "Month known" : "Dated entry"}</span></div>
          <div className="journal-copy"><h3>{entry.title}</h3><p>{entry.body}</p><span className="source-line">{entry.source}</span></div>
          <ArrowUpRight className="journal-arrow" size={18} aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}

export function JournalDetail({ entry }: { entry: JournalEntry }) {
  return (
    <details className="journal-detail">
      <summary>
        <span className="journal-detail-date"><time dateTime={entry.date}>{formatDate(entry.date, "long")}</time><small>{entry.date.length === 7 ? "Month-level date" : "Day-level date"}</small></span>
        <span className="journal-detail-title">{entry.title}<small>Owner-reported record</small></span>
        <ChevronDown size={18} aria-hidden="true" className="disclosure-chevron" />
      </summary>
      <div className="journal-detail-content"><p>{entry.body}</p><div className="record-source"><span>Source</span><strong>{entry.source}</strong></div></div>
    </details>
  );
}
