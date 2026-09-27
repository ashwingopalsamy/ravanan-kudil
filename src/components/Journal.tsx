import { ArrowUpRight, ChevronDown } from "lucide-react";
import { formatDate, formatSource, sourceTypeLabel, type JournalEntry } from "../lib/records";

export function JournalPreview({ entries, previewTextById, siteWorkElapsed }: { entries: JournalEntry[]; previewTextById?: Record<string, string>; siteWorkElapsed?: { days: number; asOf: string } }) {
  return (
    <div className="journal-preview-list">
      {entries.map((entry) => (
        <a className="journal-preview-row" href={`#journey/${entry.id}`} key={entry.id}>
          <div className="journal-date"><time dateTime={entry.date}>{formatDate(entry.date, "long")}</time><span>{entry.date.length === 7 ? "Month known" : "Dated entry"}</span></div>
          <div className="journal-copy"><h3>{entry.title}</h3><p>{previewTextById?.[entry.id] ?? entry.body}</p><span className="source-line">{formatSource(entry.source)}{entry.corrections?.length ? ` · corrected ${formatDate(entry.corrections[entry.corrections.length - 1].date)}` : ""}</span>{siteWorkElapsed && entry.id === "construction-began" && <span className="journal-elapsed"><strong className="tabular-nums">{siteWorkElapsed.days}</strong> calendar days since site work began · as of {formatDate(siteWorkElapsed.asOf, "long")} · not days worked</span>}</div>
          <ArrowUpRight className="journal-arrow" size={18} aria-hidden="true" />
        </a>
      ))}
    </div>
  );
}

export function JournalDetail({ entry, selected = false }: { entry: JournalEntry; selected?: boolean }) {
  return (
    <details className="journal-detail" id={`journal-${entry.id}`} open={selected}>
      <summary>
        <span className="journal-detail-title">{entry.title}</span>
        <span className="journal-detail-date"><time dateTime={entry.date}>{formatDate(entry.date, "long")}</time><small>{entry.date.length === 7 ? "Month-level date" : "Day-level date"}</small></span>
        <ChevronDown size={18} aria-hidden="true" className="disclosure-chevron" />
      </summary>
      <div className="journal-detail-content"><p>{entry.body}</p><dl className="record-source"><div><dt>Source type</dt><dd>{sourceTypeLabel(entry.source)}</dd></div><div><dt>Source dated</dt><dd><time dateTime={entry.source.date}>{formatDate(entry.source.date, "long")}</time></dd></div>{entry.source.description && <div><dt>Source note</dt><dd>{entry.source.description}</dd></div>}{entry.corrections?.map((correction, index) => <div className="record-correction" key={`${correction.date}-${index}`}><dt>Correction</dt><dd><time dateTime={correction.date}>{formatDate(correction.date, "long")}</time> · {correction.note}</dd></div>)}</dl></div>
    </details>
  );
}
