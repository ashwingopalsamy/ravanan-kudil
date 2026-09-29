import { useMemo, useState, type ReactNode } from "react";
import { Boxes, CalendarDays, ChevronDown, HardHat, ReceiptText, Search, Truck } from "lucide-react";
import { MonthlyAttendance } from "../components/MonthlyAttendance";
import { MonthlySpend } from "../components/MonthlySpend";
import type { DataMode } from "../components/DataModeControl";
import { ScenarioRecordsView } from "./ScenarioRecordsView";
import { formatDate, formatMoney, recordedSpend, sourceTypeLabel, workSummary, type AttendanceRecord, type EquipmentRecord, type FinanceRecord, type MaterialRecord, type PublicRecords } from "../lib/records";
import type { ScenarioSelection, ScenarioSelectionPatch } from "../lib/scenario-url";

type Category = "finance" | "labour" | "materials" | "equipment";

const categories: { id: Category; label: string; icon: typeof ReceiptText }[] = [
  { id: "finance", label: "Finance", icon: ReceiptText },
  { id: "labour", label: "Labour", icon: HardHat },
  { id: "materials", label: "Materials", icon: Boxes },
  { id: "equipment", label: "Equipment", icon: Truck }
];

const emptyCopy: Record<Category, { title: string; text: string; note: string }> = {
  finance: { title: "No financial entries yet", text: "Quotes, bills, payments and refunds will appear when dated.", note: "Only payments less refunds count as recorded spending; quotes and bills do not." },
  labour: { title: "Attendance unrecorded", text: "Dated work and crew counts will appear here.", note: "Unrecorded dates are unknown, not days off. Two workers on one date count as two worker-days." },
  materials: { title: "Material quantities unrecorded", text: "Purchases, deliveries and use will appear as dated events.", note: "A purchase is not proof of delivery or use; units remain separate." },
  equipment: { title: "Equipment use unrecorded", text: "Dated JCB and tractor events will appear here.", note: "Days and trips remain separate units." }
};

const kindLabel: Record<FinanceRecord["kind"], string> = { quote: "Quotation", invoice: "Bill", payment: "Payment", refund: "Refund" };
const attendanceLabel: Record<AttendanceRecord["state"], string> = { worked: "Work recorded", no_work: "No work recorded", unknown: "Unconfirmed" };
const eventActionLabel: Record<MaterialRecord["action"] | EquipmentRecord["action"], string> = { purchased: "Purchased", delivered: "Delivered", used: "Used", returned: "Returned", hired: "Hired" };

function DetailLine({ label, value, correction = false }: { label: string; value: ReactNode; correction?: boolean }) {
  return <div className={`detail-line${correction ? " detail-line--correction" : ""}`}><dt>{label}</dt><dd>{value}</dd></div>;
}

function ProvenanceLines({ item }: { item: Pick<FinanceRecord, "source" | "corrections"> }) {
  return <><DetailLine label="Source type" value={sourceTypeLabel(item.source)} /><DetailLine label="Source dated" value={<time dateTime={item.source.date}>{formatDate(item.source.date, "long")}</time>} />{item.source.description && <DetailLine label="Source note" value={item.source.description} />}{item.corrections?.map((correction, index) => <DetailLine key={`${correction.date}-${index}`} label="Correction" correction value={<><time dateTime={correction.date}>{formatDate(correction.date, "long")}</time> · {correction.note}</>} />)}</>;
}

function FinanceRow({ item }: { item: FinanceRecord }) {
  return <details className="data-row"><summary><span className="data-row-icon"><ReceiptText size={19} aria-hidden="true" /></span><span className="data-row-main"><strong>{item.description}</strong><small>{kindLabel[item.kind]} · {item.category}</small></span><time dateTime={item.date}>{formatDate(item.date)}</time><strong className="data-row-value tabular-nums">{formatMoney(item.kind === "refund" ? -item.amountPaise : item.amountPaise)}</strong><ChevronDown className="disclosure-chevron" size={18} aria-hidden="true" /></summary><dl className="data-row-details"><DetailLine label="Type" value={kindLabel[item.kind]} /><DetailLine label="Category" value={item.category} /><ProvenanceLines item={item} /><DetailLine label="Spend total" value={item.kind === "payment" || item.kind === "refund" ? "Included" : "Not included"} />{item.relatedId && <DetailLine label="Related record" value={item.relatedId} />}{item.note && <DetailLine label="Note" value={item.note} />}</dl></details>;
}

function LabourRow({ item }: { item: AttendanceRecord }) {
  return <details className="data-row"><summary><span className="data-row-icon"><CalendarDays size={19} aria-hidden="true" /></span><span className="data-row-main"><strong>{attendanceLabel[item.state]}</strong><small>{item.note ?? "Attendance record"}</small></span><time dateTime={item.date}>{formatDate(item.date)}</time><strong className="data-row-value tabular-nums">{item.state === "worked" && item.workers ? `${item.workers} ${item.workers === 1 ? "worker" : "workers"}` : "—"}</strong><ChevronDown className="disclosure-chevron" size={18} aria-hidden="true" /></summary><dl className="data-row-details"><DetailLine label="Attendance" value={attendanceLabel[item.state]} /><ProvenanceLines item={item} />{item.note && <DetailLine label="Work noted" value={item.note} />}</dl></details>;
}

function MaterialRow({ item }: { item: MaterialRecord }) {
  return <details className="data-row"><summary><span className="data-row-icon"><Boxes size={19} aria-hidden="true" /></span><span className="data-row-main"><strong>{item.name}</strong><small>{eventActionLabel[item.action]}{item.specification ? ` · ${item.specification}` : ""}</small></span><time dateTime={item.date}>{formatDate(item.date)}</time><strong className="data-row-value"><span className="tabular-nums">{item.quantity}</span>{" "}<span className="data-row-unit">{item.unit}</span></strong><ChevronDown className="disclosure-chevron" size={18} aria-hidden="true" /></summary><dl className="data-row-details"><DetailLine label="Event" value={eventActionLabel[item.action]} /><ProvenanceLines item={item} />{item.specification && <DetailLine label="Specification" value={item.specification} />}</dl></details>;
}

function EquipmentRow({ item }: { item: EquipmentRecord }) {
  return <details className="data-row"><summary><span className="data-row-icon"><Truck size={19} aria-hidden="true" /></span><span className="data-row-main"><strong>{item.name}</strong><small>{eventActionLabel[item.action]}</small></span><time dateTime={item.date}>{formatDate(item.date)}</time><strong className="data-row-value"><span className="tabular-nums">{item.quantity}</span>{" "}<span className="data-row-unit">{item.unit}</span></strong><ChevronDown className="disclosure-chevron" size={18} aria-hidden="true" /></summary><dl className="data-row-details"><DetailLine label="Event" value={eventActionLabel[item.action]} /><ProvenanceLines item={item} />{item.note && <DetailLine label="Note" value={item.note} />}</dl></details>;
}

function searchableText(item: FinanceRecord | AttendanceRecord | MaterialRecord | EquipmentRecord): string {
  return [
    ...Object.values(item).filter((value) => typeof value === "string" || typeof value === "number"),
    formatDate(item.date),
    sourceTypeLabel(item.source),
    item.source.date,
    formatDate(item.source.date),
    item.source.description,
    ...(item.corrections ?? []).flatMap((correction) => [correction.date, formatDate(correction.date), correction.note]),
    "kind" in item ? kindLabel[item.kind] : undefined
  ].filter((value) => value !== undefined).join(" ").toLocaleLowerCase();
}

export function RecordsView({ records, mode, selection, onSelectionChange }: { records: PublicRecords; mode: DataMode; selection: ScenarioSelection; onSelectionChange: (patch: ScenarioSelectionPatch) => void }) {
  const category: Category = selection.recordCategory;
  const [search, setSearch] = useState("");
  const EmptyCategoryIcon = categories.find(({ id }) => id === category)!.icon;
  const counts: Record<Category, number> = { finance: records.finance.length, labour: records.attendance.length, materials: records.materials.length, equipment: records.equipment.length };
  const hasAnyRecord = Object.values(counts).some((count) => count > 0);
  const spent = recordedSpend(records);
  const work = workSummary(records);
  const filtered = useMemo(() => {
    const data = { finance: records.finance, labour: records.attendance, materials: records.materials, equipment: records.equipment }[category];
    const query = search.trim().toLocaleLowerCase();
    return [...data].filter((item) => !query || searchableText(item).includes(query)).sort((a, b) => b.date.localeCompare(a.date));
  }, [category, records, search]);

  if (mode === "scenario") return <ScenarioRecordsView status={records.currentStatus} selection={selection} onSelectionChange={onSelectionChange} />;

  return <>
    <header className="view-intro"><h1>Records</h1></header>
    <div className="records-primary">
      <section className="records-surface" aria-labelledby="owner-register-title"><h2 className="sr-only" id="owner-register-title">Owner register</h2>
        <div className="category-tabs" role="group" aria-label="Record type">{categories.map(({ id, label }) => <button className="category-tab" type="button" key={id} aria-pressed={category === id} onClick={() => { onSelectionChange({ recordCategory: id }); setSearch(""); }}><span>{label}</span></button>)}</div>
        {counts[category] > 0 && <div className="records-toolbar"><label className="record-search"><Search size={17} aria-hidden="true" /><span className="sr-only">Search {category} records</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${category} records`} /></label><span>Newest first</span></div>}
        <div className="records-body">{filtered.length ? filtered.map((item) => {
          if (category === "finance") return <FinanceRow key={item.id} item={item as FinanceRecord} />;
          if (category === "labour") return <LabourRow key={item.id} item={item as AttendanceRecord} />;
          if (category === "materials") return <MaterialRow key={item.id} item={item as MaterialRecord} />;
          return <EquipmentRow key={item.id} item={item as EquipmentRecord} />;
        }) : counts[category] ? <div className="empty-record empty-record--search"><Search size={24} strokeWidth={1.6} aria-hidden="true" /><h3>No matching records.</h3><p>Try a different search term.</p></div> : <div className="empty-record owner-empty-record"><span className="empty-record-icon"><EmptyCategoryIcon size={21} strokeWidth={1.7} aria-hidden="true" /></span><div className="empty-record-copy"><h3>{emptyCopy[category].title}</h3><p>{emptyCopy[category].text}</p></div><details className="empty-record-rule"><summary>How this is counted</summary><p>{emptyCopy[category].note}</p></details></div>}</div>
      </section>
      {hasAnyRecord && <div className="record-metrics" aria-label="Recorded measures"><div><span>Itemised recorded spend</span><strong className="tabular-nums">{spent === null ? "Not recorded" : formatMoney(spent)}</strong><small>{spent === null ? `Owner-reported overall range: ${formatMoney(records.currentStatus.reportedSpendRangePaise[0])}–${formatMoney(records.currentStatus.reportedSpendRangePaise[1])}; payments are not itemised.` : "Payments less refunds"}</small></div><div><span>Dates with work</span><strong className="tabular-nums">{work.workdays === null ? "Not recorded" : work.workdays}</strong><small>Confirmed attendance dates</small></div><div><span>Worker-days</span><strong className="tabular-nums">{work.workerDays === null ? "Not recorded" : `${work.incomplete ? "At least " : ""}${work.workerDays}`}</strong><small>Sum of known daily headcounts</small></div></div>}
    </div>
    {category === "finance" && <MonthlySpend records={records} />}
    {category === "labour" && <MonthlyAttendance records={records} />}
    {counts[category] > 0 && <section className="record-method" aria-label="How the record is counted"><div><span className="overline">Calculation notes</span><h2>Measured, not inferred.</h2></div><div><p><strong>Spending</strong> includes payments and refunds only. Bills and quotations stay visible without being counted twice.</p><p><strong>Workdays</strong> and <strong>worker-days</strong> use attendance dates, never payment dates. Unlisted dates stay unknown.</p><p><strong>Material and equipment events</strong> retain their units and actions. A purchase is not proof of delivery or use.</p></div></section>}
  </>;
}
