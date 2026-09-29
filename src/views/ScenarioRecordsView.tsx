import { useMemo, useState, type ReactNode } from "react";
import { Boxes, ChevronDown, HardHat, ReceiptText, Search, Truck } from "lucide-react";
import { ScenarioAllocationByCategory, ScenarioAllocationByMonth, ScenarioAttendanceByMonth, ScenarioResourceQuantities } from "../components/ScenarioAnalytics";
import { formatDate, formatLakhsFromPaise, formatMoney, type CurrentStatus } from "../lib/records";
import { formatScenarioQuantity, illustrativeScenario, type ScenarioAllocation, type ScenarioAttendance, type ScenarioEquipment, type ScenarioMaterial } from "../lib/scenario";
import type { ScenarioSelection, ScenarioSelectionPatch } from "../lib/scenario-url";

type Category = "finance" | "labour" | "materials" | "equipment";
const categories: { id: Category; label: string; icon: typeof ReceiptText }[] = [
  { id: "finance", label: "Finance", icon: ReceiptText },
  { id: "labour", label: "Labour", icon: HardHat },
  { id: "materials", label: "Materials", icon: Boxes },
  { id: "equipment", label: "Equipment", icon: Truck }
];
const actionLabel = { purchased: "Purchased", delivered: "Delivered", used: "Used", hired: "Hired" };

function DetailLine({ label, value }: { label: string; value: ReactNode }) {
  return <div className="detail-line"><dt>{label}</dt><dd>{value}</dd></div>;
}

function AllocationRow({ item, selectedMonth }: { item: ScenarioAllocation; selectedMonth: string }) {
  const monthAllocation = item.monthly.find(({ month }) => month === selectedMonth);
  const shownAmount = monthAllocation?.paise ?? item.paise;
  const visibleMonths = item.monthly.filter(({ month }) => selectedMonth === "all" || month === selectedMonth);
  return <details className="data-row scenario-data-row scenario-finance-row"><summary><span className="data-row-main"><strong>{item.category}</strong></span><strong className="data-row-value tabular-nums">{formatMoney(shownAmount)}</strong><ChevronDown className="disclosure-chevron" size={18} aria-hidden="true" /></summary><dl className="data-row-details"><DetailLine label={selectedMonth === "all" ? "Model total" : `${formatDate(selectedMonth)} allocation`} value={formatMoney(shownAmount)} />{selectedMonth !== "all" && <DetailLine label="Category model total" value={formatMoney(item.paise)} />}<DetailLine label="Provenance" value="Synthetic allocation within the owner-reported approximate spend range." /><div className="scenario-monthly-detail"><span>Month-level allocation</span>{visibleMonths.map((month) => <div key={month.month}><time dateTime={month.month}>{formatDate(month.month)}</time><strong className="tabular-nums">{formatMoney(month.paise)}</strong></div>)}</div></dl></details>;
}

function AttendanceRow({ item }: { item: ScenarioAttendance }) {
  const worked = item.state === "worked";
  return <details className="data-row scenario-data-row scenario-ledger-row"><summary><time className="data-row-date" dateTime={item.date}>{formatDate(item.date)}</time><span className="data-row-main"><strong>{worked ? "Assumed workday" : "Assumed day off"}</strong><small>{worked ? "Synthetic crew count" : item.note}</small></span><span className="data-row-event">Model schedule</span><strong className="data-row-value">{worked ? `${item.workers} ${item.workers === 1 ? "worker" : "workers"}` : "—"}</strong><ChevronDown className="disclosure-chevron" size={18} aria-hidden="true" /></summary><dl className="data-row-details"><DetailLine label="Scenario rule" value={item.note} /><DetailLine label="Provenance" value="Synthetic daily schedule generated for the demonstration; no actual attendance source was supplied." /></dl></details>;
}

function MaterialRow({ item }: { item: ScenarioMaterial }) {
  return <details className="data-row scenario-data-row scenario-ledger-row"><summary><time className="data-row-date" dateTime={item.month}>{formatDate(item.month)}</time><span className="data-row-main"><strong>{item.name}</strong>{item.specification && <small>{item.specification}</small>}</span><span className="data-row-event">{actionLabel[item.action]}</span><strong className="data-row-value tabular-nums">{formatScenarioQuantity(item.quantity, item.unit)}</strong><ChevronDown className="disclosure-chevron" size={18} aria-hidden="true" /></summary><dl className="data-row-details"><DetailLine label="Event" value={actionLabel[item.action]} /><DetailLine label="Quantity" value={formatScenarioQuantity(item.quantity, item.unit)} /><DetailLine label="Date precision" value="Illustrative month only; no exact transaction or use date is claimed." />{item.specification && <DetailLine label="Specification" value={item.specification} />}<DetailLine label="Provenance" value="Round synthetic example quantity; not measured, reconciled stock or a bill of quantities." /></dl></details>;
}

function EquipmentRow({ item }: { item: ScenarioEquipment }) {
  return <details className="data-row scenario-data-row scenario-ledger-row"><summary><time className="data-row-date" dateTime={item.month}>{formatDate(item.month)}</time><span className="data-row-main"><strong>{item.name}</strong></span><span className="data-row-event">{actionLabel[item.action]}</span><strong className="data-row-value tabular-nums">{formatScenarioQuantity(item.quantity, item.unit)}</strong><ChevronDown className="disclosure-chevron" size={18} aria-hidden="true" /></summary><dl className="data-row-details"><DetailLine label="Event" value={actionLabel[item.action]} /><DetailLine label="Quantity" value={formatScenarioQuantity(item.quantity, item.unit)} /><DetailLine label="Date precision" value="Illustrative month only; no exact hire or use date is claimed." /><DetailLine label="Note" value={item.note} /><DetailLine label="Provenance" value="Synthetic equipment example; no actual hire or use record was supplied." /></dl></details>;
}

function searchableText(item: ScenarioAllocation | ScenarioAttendance | ScenarioMaterial | ScenarioEquipment): string {
  if ("category" in item) return `${item.category} ${item.monthly.map(({ month, paise }) => `${month} ${formatDate(month)} ${formatMoney(paise)}`).join(" ")} ${formatMoney(item.paise)}`.toLocaleLowerCase();
  if ("state" in item) return `${item.date} ${formatDate(item.date)} ${item.state} ${item.workers ?? ""} ${item.note}`.toLocaleLowerCase();
  const specification = "specification" in item ? item.specification ?? "" : "";
  return `${item.month} ${formatDate(item.month)} ${item.action} ${item.name} ${specification} ${item.quantity} ${item.unit} ${"note" in item ? item.note : ""}`.toLocaleLowerCase();
}

export function ScenarioRecordsView({ status, selection, onSelectionChange }: { status: CurrentStatus; selection: ScenarioSelection; onSelectionChange: (patch: ScenarioSelectionPatch) => void }) {
  const category: Category = selection.recordCategory;
  const [search, setSearch] = useState("");
  const monthFilter = selection.month ?? "all";
  const selected = categories.find((item) => item.id === category)!;
  const rows = { finance: illustrativeScenario.allocations, labour: illustrativeScenario.attendance, materials: illustrativeScenario.materials, equipment: illustrativeScenario.equipment }[category];
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return [...rows].filter((item) => {
      const inMonth = monthFilter === "all" || ("monthly" in item
        ? item.monthly.some(({ month }) => month === monthFilter)
        : "date" in item ? item.date.startsWith(monthFilter) : item.month === monthFilter);
      const inDay = category !== "labour" || (!!selection.day && "date" in item && item.date === selection.day);
      const inCostCategory = category !== "finance" || !selection.costCategory || !("category" in item) || item.category === selection.costCategory;
      return inMonth && inDay && inCostCategory && (!query || searchableText(item).includes(query));
    }).sort((a, b) => {
      const dateA = "date" in a ? a.date : "month" in a ? a.month : "";
      const dateB = "date" in b ? b.date : "month" in b ? b.month : "";
      return dateB.localeCompare(dateA) || a.id.localeCompare(b.id);
    });
  }, [category, monthFilter, rows, search, selection.day, selection.costCategory]);
  const counts: Record<Category, number> = { finance: illustrativeScenario.allocations.length, labour: illustrativeScenario.attendance.length, materials: illustrativeScenario.materials.length, equipment: illustrativeScenario.equipment.length };
  const Icon = selected.icon;

  return <>
    <header className="view-intro"><h1>Records</h1></header>
    <div className="category-tabs scenario-record-tabs" role="group" aria-label="Record type">{categories.map(({ id, label }) => <button className="category-tab" type="button" key={id} aria-pressed={category === id} onClick={() => { onSelectionChange({ recordCategory: id, ...(id !== "finance" ? { costCategory: null } : {}), ...(id !== "labour" ? { day: null } : {}) }); setSearch(""); }}><span>{label}</span></button>)}</div>
    <div className="records-toolbar scenario-records-toolbar"><label className="record-search"><Search size={17} aria-hidden="true" /><span className="sr-only">Search {category} model records</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" /></label><div className="record-month-filter"><label className="sr-only" htmlFor="scenario-record-month">Filter by month</label><select id="scenario-record-month" value={monthFilter} onChange={(event) => onSelectionChange({ month: event.target.value === "all" ? null : event.target.value, day: null })}><option value="all">All months</option>{illustrativeScenario.attendanceMonths.map(({ month }) => <option value={month} key={month}>{formatDate(month)}</option>)}</select></div>{(search || selection.month || selection.day || selection.costCategory) && <button className="records-reset" type="button" onClick={() => { setSearch(""); onSelectionChange({ month: null, day: null, costCategory: null }); }}>Clear filters</button>}</div>
    {selection.day && <p className="records-active-date">Selected date · {formatDate(selection.day, "long")}</p>}
    {category === "labour" && <ScenarioAttendanceByMonth selection={selection} onSelectionChange={onSelectionChange} />}
    <div className="records-primary">
      <section className="records-surface" aria-labelledby="register-title"><div className="records-header"><div><h2 id="register-title">{category === "finance" ? "Illustrative cost categories" : `${selected.label} entries`}</h2><p>{category === "labour" ? selection.day ? "One selected assumed date" : "Select a date above to inspect its schedule assumption." : category === "finance" ? `${filtered.length} of ${counts.finance} categories · ${monthFilter === "all" ? "Mar–Sep 2026" : formatDate(monthFilter)}` : `${filtered.length} of ${counts[category]} illustrative events`}</p></div></div>
        <div className="records-body">{filtered.length ? filtered.map((item) => {
          if (category === "finance") return <AllocationRow key={item.id} item={item as ScenarioAllocation} selectedMonth={monthFilter} />;
          if (category === "labour") return <AttendanceRow key={item.id} item={item as ScenarioAttendance} />;
          if (category === "materials") return <MaterialRow key={item.id} item={item as ScenarioMaterial} />;
          return <EquipmentRow key={item.id} item={item as ScenarioEquipment} />;
        }) : category === "labour" && !selection.day ? <div className="empty-record"><span className="empty-record-copy"><h3>Choose a date from the calendar.</h3><p>Daily rows stay hidden until a date is selected.</p></span></div> : <div className="empty-record empty-record--search"><Icon size={23} aria-hidden="true" /><h3>No matching illustrative entries.</h3><p>{search.trim() ? "No entries match this search and filter selection." : monthFilter !== "all" ? `No ${selected.label.toLowerCase()} examples were assigned to ${formatDate(monthFilter)} in this model.` : "No examples match the selected filters."}</p></div>}</div>
      </section>
    </div>
    {category === "materials" && <ScenarioResourceQuantities kind="materials" />}
    {category === "equipment" && <ScenarioResourceQuantities kind="equipment" />}
    {category === "finance" && <div className="scenario-record-analytics"><ScenarioAllocationByMonth selection={selection} onSelectionChange={onSelectionChange} /><ScenarioAllocationByCategory selection={selection} onSelectionChange={onSelectionChange} /></div>}
    <section className="scenario-method" aria-label="Scenario assumptions"><h2>How to read these examples</h2><p>The owner reports {formatMoney(status.reportedSpendRangePaise[0])}–{formatMoney(status.reportedSpendRangePaise[1])} overall spent; the ₹{formatLakhsFromPaise(illustrativeScenario.totalAllocationPaise)} lakh breakdown is synthetic, not dated payments. Attendance dates follow an assumed schedule; the 59 non-Sunday off-days are not proof of absence. Material actions and units remain separate; loads have unspecified capacity.</p></section>
  </>;
}
