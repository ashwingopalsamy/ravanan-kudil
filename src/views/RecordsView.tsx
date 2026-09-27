import { useMemo, useState, type ReactNode } from "react";
import { Boxes, CalendarDays, ChevronDown, ClipboardList, HardHat, ReceiptText, Search, Truck } from "lucide-react";
import { MonthlyAttendance } from "../components/MonthlyAttendance";
import { MonthlySpend } from "../components/MonthlySpend";
import { formatDate, formatMoney, recordedSpend, sourceTypeLabel, workSummary, type AttendanceRecord, type EquipmentRecord, type FinanceRecord, type MaterialRecord, type PublicRecords } from "../lib/records";

type Category = "finance" | "labour" | "materials" | "equipment";

const categories: { id: Category; label: string; icon: typeof ReceiptText }[] = [
  { id: "finance", label: "Finance", icon: ReceiptText },
  { id: "labour", label: "Labour", icon: HardHat },
  { id: "materials", label: "Materials", icon: Boxes },
  { id: "equipment", label: "Equipment", icon: Truck }
];

const emptyCopy: Record<Category, { title: string; text: string; note: string }> = {
  finance: { title: "No financial entries have been published.", text: "The register will separate quotations, bills, payments and refunds when their dates and amounts are established.", note: "A quotation does not become spending. The spend total starts with documented payments and subtracts documented refunds." },
  labour: { title: "No attendance dates have been published.", text: "Workday and worker counts will appear here when dated attendance is established.", note: "An unrecorded date is unknown. A date with confirmed work and two workers counts as one workday and two worker-days." },
  materials: { title: "No material quantities have been published.", text: "Purchases, deliveries and use will appear here as separate dated events with their units.", note: "Purchase, delivery and use are separate events. A supplier mention never establishes a quantity." },
  equipment: { title: "No equipment events have been published.", text: "JCB, tractor and other equipment entries will appear here when their dates and units are established.", note: "Equipment events keep their own date, action, quantity and unit, such as days or trips." }
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
  return <details className="data-row"><summary><span className="data-row-icon"><Boxes size={19} aria-hidden="true" /></span><span className="data-row-main"><span className="data-row-title"><strong>{item.name}</strong><span className="event-action">{eventActionLabel[item.action]}</span></span>{item.specification && <small>{item.specification}</small>}</span><time dateTime={item.date}>{formatDate(item.date)}</time><strong className="data-row-value"><span className="tabular-nums">{item.quantity}</span>{" "}<span className="data-row-unit">{item.unit}</span></strong><ChevronDown className="disclosure-chevron" size={18} aria-hidden="true" /></summary><dl className="data-row-details"><DetailLine label="Event" value={eventActionLabel[item.action]} /><ProvenanceLines item={item} />{item.specification && <DetailLine label="Specification" value={item.specification} />}</dl></details>;
}

function EquipmentRow({ item }: { item: EquipmentRecord }) {
  return <details className="data-row"><summary><span className="data-row-icon"><Truck size={19} aria-hidden="true" /></span><span className="data-row-main"><span className="data-row-title"><strong>{item.name}</strong><span className="event-action">{eventActionLabel[item.action]}</span></span></span><time dateTime={item.date}>{formatDate(item.date)}</time><strong className="data-row-value"><span className="tabular-nums">{item.quantity}</span>{" "}<span className="data-row-unit">{item.unit}</span></strong><ChevronDown className="disclosure-chevron" size={18} aria-hidden="true" /></summary><dl className="data-row-details"><DetailLine label="Event" value={eventActionLabel[item.action]} /><ProvenanceLines item={item} />{item.note && <DetailLine label="Note" value={item.note} />}</dl></details>;
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

export function RecordsView({ records }: { records: PublicRecords }) {
  const [category, setCategory] = useState<Category>("finance");
  const [search, setSearch] = useState("");
  const EmptyCategoryIcon = categories.find(({ id }) => id === category)!.icon;
  const counts: Record<Category, number> = { finance: records.finance.length, labour: records.attendance.length, materials: records.materials.length, equipment: records.equipment.length };
  const spent = recordedSpend(records);
  const work = workSummary(records);
  const filtered = useMemo(() => {
    const data = { finance: records.finance, labour: records.attendance, materials: records.materials, equipment: records.equipment }[category];
    const query = search.trim().toLocaleLowerCase();
    return [...data].filter((item) => !query || searchableText(item).includes(query)).sort((a, b) => b.date.localeCompare(a.date));
  }, [category, records, search]);

  return <>
    <header className="view-intro"><div className="eyebrow"><span className="eyebrow-mark" /> The evidence / Public record</div><div className="view-intro-line"><div><h1>Every figure has a source.</h1><p>Money, labour, materials and equipment are recorded as separate dated events. Totals only use the entries that support them.</p></div><span className="count-pill">{Object.values(counts).reduce((sum, count) => sum + count, 0)} itemised records</span></div></header>
    <div className="record-metrics" aria-label="Recorded measures"><div><span>Recorded spend</span><strong className="tabular-nums">{spent === null ? "Not recorded" : formatMoney(spent)}</strong><small>Payments less refunds</small></div><div><span>Dates with work</span><strong className="tabular-nums">{work.workdays === null ? "Not recorded" : work.workdays}</strong><small>Confirmed attendance dates</small></div><div><span>Worker-days</span><strong className="tabular-nums">{work.workerDays === null ? "Not recorded" : `${work.incomplete ? "At least " : ""}${work.workerDays}`}</strong><small>Sum of known daily headcounts</small></div></div>
    <section className="records-surface" aria-labelledby="register-title"><div className="records-header"><div><span className="overline">Itemised source data</span><h2 id="register-title">Record register</h2></div><span className="records-header-note"><ClipboardList size={16} aria-hidden="true" /> Public entries only</span></div>
      <div className="category-tabs" role="group" aria-label="Record type">{categories.map(({ id, label, icon: Icon }) => <button className="category-tab" type="button" key={id} aria-pressed={category === id} onClick={() => { setCategory(id); setSearch(""); }}><Icon size={17} strokeWidth={1.8} aria-hidden="true" /><span>{label}</span><small>{counts[id]}</small></button>)}</div>
      {counts[category] > 0 && <div className="records-toolbar"><label className="record-search"><Search size={17} aria-hidden="true" /><span className="sr-only">Search {category} records</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${category} records`} /></label><span>Newest first</span></div>}
      <div className="records-body">{filtered.length ? filtered.map((item) => {
        if (category === "finance") return <FinanceRow key={item.id} item={item as FinanceRecord} />;
        if (category === "labour") return <LabourRow key={item.id} item={item as AttendanceRecord} />;
        if (category === "materials") return <MaterialRow key={item.id} item={item as MaterialRecord} />;
        return <EquipmentRow key={item.id} item={item as EquipmentRecord} />;
      }) : counts[category] ? <div className="empty-record empty-record--search"><Search size={24} strokeWidth={1.6} aria-hidden="true" /><h3>No matching records.</h3><p>Try a different search term.</p></div> : <div className="empty-record"><span className="empty-record-icon"><EmptyCategoryIcon size={21} strokeWidth={1.7} aria-hidden="true" /></span><div className="empty-record-copy"><h3>{emptyCopy[category].title}</h3><p>{emptyCopy[category].text}</p></div><div className="empty-record-rule"><span className="overline">How this is counted</span><p>{emptyCopy[category].note}</p></div></div>}</div>
    </section>
    {category === "finance" && <MonthlySpend records={records} />}
    {category === "labour" && <MonthlyAttendance records={records} />}
    {counts[category] > 0 && <section className="record-method" aria-label="How the record is counted"><div><span className="overline">Calculation notes</span><h2>Measured, not inferred.</h2></div><div><p><strong>Spending</strong> includes payments and refunds only. Bills and quotations stay visible without being counted twice.</p><p><strong>Workdays</strong> and <strong>worker-days</strong> use attendance dates, never payment dates. Unlisted dates stay unknown.</p><p><strong>Material and equipment events</strong> retain their units and actions. A purchase is not proof of delivery or use.</p></div></section>}
  </>;
}
