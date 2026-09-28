import { ArrowRight, BrickWall, CircleCheck, Construction, HardHat, Layers3, Package, ReceiptIndianRupee, UsersRound } from "lucide-react";
import { formatDate, formatLakhsFromPaise, formatMoney, type CurrentStatus } from "../lib/records";
import { formatScenarioQuantity, illustrativeScenario } from "../lib/scenario";
import type { ScenarioSelection, ScenarioSelectionPatch } from "../lib/scenario-url";

export function CurrentBuildStatus({ status }: { status: CurrentStatus }) {
  const roofCast = status.groundFloorRoof === "cast";
  return <section className="scenario-status-panel" aria-labelledby="current-status-title">
    <div className="scenario-status-heading">
      <h2 id="current-status-title">Ground-floor build</h2>
      <HardHat size={21} aria-hidden="true" />
    </div>
    <ol className="scenario-stage-track" aria-label="Current ground-floor stages">
      <li className="scenario-stage-step" data-stage="complete">
        <span className="scenario-stage-symbol"><CircleCheck size={21} aria-hidden="true" /></span>
        <div><strong>Lintel</strong><span>Complete · ≈{status.lintelHeightApproxFeet} ft</span></div>
      </li>
      <li className="scenario-stage-step" data-stage="current">
        <span className="scenario-stage-symbol"><BrickWall size={21} aria-hidden="true" /></span>
        <div><strong>Brickwork</strong><span>Walls to ≈{status.brickworkHeightApproxFeet} ft</span></div>
      </li>
      <li className="scenario-stage-step" data-stage={roofCast ? "complete" : "pending"}>
        <span className="scenario-stage-symbol">{roofCast ? <CircleCheck size={21} aria-hidden="true" /> : <Construction size={21} aria-hidden="true" />}</span>
        <div><strong>RCC roof</strong><span>{roofCast ? "Cast" : "Not cast yet"}</span></div>
      </li>
    </ol>
  </section>;
}

export function ScenarioKeyMeasures({ status, elapsedDays }: { status: CurrentStatus; elapsedDays: number }) {
  return <section className="scenario-summary" aria-label="Construction spend and progress measures">
    <div className="scenario-summary-main">
      <div className="scenario-summary-label"><ReceiptIndianRupee size={19} aria-hidden="true" /><span>Owner-reported spend range</span></div>
      <strong>₹{formatLakhsFromPaise(status.reportedSpendRangePaise[0], 0)}–{formatLakhsFromPaise(status.reportedSpendRangePaise[1], 0)}<small> lakh</small></strong>
      <p>As of {formatDate(status.asOf, "long")} · not an itemised ledger</p>
    </div>
    <div className="scenario-summary-context"><span>{elapsedDays} calendar days since work began</span><small>Calendar time, not days worked</small></div>
  </section>;
}

export function ScenarioLabourSummary() {
  return <section className="scenario-labour-summary" aria-label="Illustrative labour schedule">
    <div><span>Illustrative schedule</span><small>Modelled values · not actual attendance</small></div>
    <dl>
      <div><dt>Assumed work dates</dt><dd>{illustrativeScenario.workedDates}</dd></div>
      <div><dt>Worker-days</dt><dd>{illustrativeScenario.workerDays}</dd><small>Daily crew counts added; not unique people or hours</small></div>
      <div><dt>Average crew</dt><dd>{illustrativeScenario.averageCrew.toFixed(2)}</dd><small>People per assumed work date</small></div>
    </dl>
  </section>;
}

export function ScenarioAllocationByMonth({ selection, onSelectionChange }: { selection: ScenarioSelection; onSelectionChange: (patch: ScenarioSelectionPatch) => void }) {
  const months = illustrativeScenario.spendByMonth;
  const selectedMonth = months.find(({ month }) => month === selection.month) ?? months[months.length - 1];
  const peak = months.reduce((largest, month) => month.paise > largest.paise ? month : largest);
  const total = illustrativeScenario.totalAllocationPaise;
  const plot = { left: 50, right: 700, top: 30, bottom: 235 };
  const step = (plot.right - plot.left) / (months.length - 1);
  const xAt = (index: number) => plot.left + index * step;
  const yForCumulative = (paise: number) => plot.top + (total - paise) / total * (plot.bottom - plot.top);
  const points = months.map((month, index) => `${index ? "L" : "M"}${xAt(index)},${yForCumulative(month.cumulativePaise)}`).join(" ");
  const categorySlices = illustrativeScenario.allocations
    .map(({ category, monthly }) => ({ category, paise: monthly.find(({ month }) => month === selectedMonth.month)?.paise ?? 0 }))
    .filter(({ paise }) => paise > 0)
    .sort((a, b) => b.paise - a.paise);
  const sliceTotal = categorySlices.reduce((sum, item) => sum + item.paise, 0);

  return <section className="scenario-panel" aria-labelledby="scenario-monthly-title">
    <div className="scenario-panel-heading">
      <div className="scenario-heading-label"><ReceiptIndianRupee size={19} aria-hidden="true" /><div><h2 id="scenario-monthly-title">Monthly cost model</h2><p>Illustrative allocations · not dated payments</p></div></div>
    </div>
    <figure className="scenario-month-chart" aria-labelledby="scenario-monthly-title">
      <div className="scenario-chart-legend"><span><i className="scenario-legend-bar" />Monthly allocation</span><span><i className="scenario-legend-line" />Cumulative allocation</span><small>₹ lakh · two independent scales</small></div>
      <svg className="scenario-allocation-svg" viewBox="0 0 800 292" role="group" aria-label="Select a month to inspect modelled monthly and cumulative allocations">
        {[0, 0.5, 1].map((fraction) => {
          const y = plot.bottom - fraction * (plot.bottom - plot.top);
          return <g key={fraction} className="scenario-chart-gridline"><line x1={plot.left} x2={plot.right} y1={y} y2={y} /><text x="3" y={y + 4}>₹{(peak.paise / 10000000 * fraction).toFixed(fraction ? 1 : 0)}L</text><text x="795" y={y + 4} textAnchor="end">₹{(total / 10000000 * fraction).toFixed(fraction ? 1 : 0)}L</text></g>;
        })}
        {months.map((month, index) => {
          const x = xAt(index);
          const barHeight = month.paise / peak.paise * (plot.bottom - plot.top);
          const selected = month.month === selectedMonth.month;
          const y = yForCumulative(month.cumulativePaise);
          return <g key={month.month} className={`scenario-chart-month${selected ? " is-selected" : ""}`} role="button" tabIndex={0} aria-pressed={selected} aria-label={`${formatDate(month.month)}: ₹${formatLakhsFromPaise(month.paise)} lakh modelled, cumulative ₹${formatLakhsFromPaise(month.cumulativePaise)} lakh`} onClick={() => onSelectionChange({ month: month.month, day: null })} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelectionChange({ month: month.month, day: null }); } }}>
            <rect className="scenario-chart-hit" x={x - 42} y="8" width="84" height="274" rx="10" />
            <rect className="scenario-chart-bar" x={x - 17} y={plot.bottom - barHeight} width="34" height={barHeight} rx="7" />
            <text className="scenario-chart-month-value" x={x} y={Math.max(plot.top + 37, plot.bottom - barHeight - 9)} textAnchor="middle">{formatLakhsFromPaise(month.paise)}L</text>
            <text className="scenario-chart-month-label" x={x} y="268" textAnchor="middle">{formatDate(month.month).split(" ")[0].slice(0, 3)}</text>
            <circle className="scenario-chart-point-halo" cx={x} cy={y} r={selected ? 8 : 6} />
            <circle className="scenario-chart-point" cx={x} cy={y} r={selected ? 4 : 3} />
          </g>;
        })}
        <path className="scenario-chart-cumulative" d={points} />
        {months.map((month, index) => <circle key={month.month} className="scenario-chart-cumulative-point" cx={xAt(index)} cy={yForCumulative(month.cumulativePaise)} r={month.month === selectedMonth.month ? 5 : 3} />)}
      </svg>
      <ol className="scenario-allocation-month-labels" aria-hidden="true">{months.map((month) => <li className={month.month === selectedMonth.month ? "is-selected" : undefined} key={month.month}><time dateTime={month.month}>{formatDate(month.month).split(" ")[0].slice(0, 3)}</time><strong>{formatLakhsFromPaise(month.paise)}L</strong></li>)}</ol>
      <figcaption>Bars scale to ₹{formatLakhsFromPaise(peak.paise)} lakh; the cumulative line scales to ₹{formatLakhsFromPaise(total)} lakh. March covers 6–31 Mar and September 1–28 Sep. These are monthly model buckets, not dated payments.</figcaption>
    </figure>
    <div className="scenario-selection-detail"><div><span>{formatDate(selectedMonth.month)} · monthly allocation</span><strong>{formatMoney(selectedMonth.paise)}</strong></div><div><span>Cumulative through {formatDate(selectedMonth.month)}</span><strong>{formatMoney(selectedMonth.cumulativePaise)}</strong></div><p>{sliceTotal === selectedMonth.paise ? "Category allocations reconcile to this month’s total." : "Category allocations do not reconcile; review the model."}</p><ul>{categorySlices.map(({ category, paise }) => <li key={category}><span>{category}</span><strong>{formatMoney(paise)}</strong></li>)}</ul><a className="text-action" href="#records" onClick={(event) => { event.preventDefault(); onSelectionChange({ recordCategory: "finance", month: selectedMonth.month }); }}>Open finance allocations <ArrowRight size={16} aria-hidden="true" /></a></div>
  </section>;
}

export function ScenarioAllocationByCategory({ selection, onSelectionChange }: { selection: ScenarioSelection; onSelectionChange: (patch: ScenarioSelectionPatch) => void }) {
  const largest = Math.max(...illustrativeScenario.allocations.map((item) => item.paise));
  const allocations = [...illustrativeScenario.allocations].sort((a, b) => b.paise - a.paise);
  const highest = allocations[0];
  const selected = allocations.find(({ category }) => category === selection.costCategory) ?? highest;
  return <section className="scenario-panel" aria-labelledby="scenario-category-title">
    <div className="scenario-panel-heading">
      <div className="scenario-heading-label"><Layers3 size={19} aria-hidden="true" /><div><h2 id="scenario-category-title">Allocation mix</h2><p>Modelled share by cost group</p></div></div>
    </div>
    <ol className="scenario-category-list">{allocations.map((item) => <li className="scenario-category-row" key={item.id}>
      <button type="button" aria-pressed={selected.category === item.category} onClick={() => onSelectionChange({ costCategory: item.category })}>
        <span>{item.category}</span>
        <span className="scenario-bar-track" aria-hidden="true"><span style={{ width: `${item.paise / largest * 100}%` }} /></span>
        <strong>₹{formatLakhsFromPaise(item.paise)}L <small>{(item.paise / illustrativeScenario.totalAllocationPaise * 100).toFixed(1)}%</small></strong>
      </button>
    </li>)}</ol>
    <div className="scenario-selection-detail scenario-category-detail"><div><span>{selected.category} · model allocation</span><strong>₹{formatLakhsFromPaise(selected.paise)}L</strong></div><p>{formatMoney(selected.paise)} of the illustrative ₹{formatLakhsFromPaise(illustrativeScenario.totalAllocationPaise)} lakh model.</p><ol className="scenario-category-months" aria-label={`${selected.category} allocation by month`}>{illustrativeScenario.spendByMonth.map(({ month }) => {
      const paise = selected.monthly.find((entry) => entry.month === month)?.paise ?? 0;
      return <li key={month}><button type="button" aria-pressed={selection.month === month} onClick={() => onSelectionChange({ month, day: null, costCategory: selected.category })}><span>{formatDate(month).slice(0, 3)}</span><i><b style={{ width: `${selected.paise ? paise / selected.paise * 100 : 0}%` }} /></i><strong>₹{formatLakhsFromPaise(paise)}L</strong></button></li>;
    })}</ol><a className="text-action" href="#records" onClick={(event) => { event.preventDefault(); onSelectionChange({ recordCategory: "finance", costCategory: selected.category }); }}>Open this allocation <ArrowRight size={16} aria-hidden="true" /></a></div>
  </section>;
}

export function ScenarioAttendanceByMonth({ selection, onSelectionChange }: { selection: ScenarioSelection; onSelectionChange: (patch: ScenarioSelectionPatch) => void }) {
  const largest = Math.max(...illustrativeScenario.attendanceMonths.map((month) => month.workerDays));
  const selectedMonth = illustrativeScenario.attendanceMonths.find(({ month }) => month === selection.month) ?? illustrativeScenario.attendanceMonths.at(-1)!;
  const selectedDay = illustrativeScenario.attendance.find(({ date }) => date === selection.day);
  const year = Number(selectedMonth.month.slice(0, 4));
  const monthNumber = Number(selectedMonth.month.slice(5, 7));
  const monthAttendance = new Map(illustrativeScenario.attendance.filter(({ date }) => date.startsWith(selectedMonth.month)).map((item) => [Number(item.date.slice(8, 10)), item]));
  const leadingDays = new Date(year, monthNumber - 1, 1).getDay();
  const daysInMonth = new Date(year, monthNumber, 0).getDate();
  return <section className="scenario-panel" aria-labelledby="scenario-attendance-title">
    <div className="scenario-panel-heading">
      <div className="scenario-heading-label scenario-heading-label--labour"><HardHat size={19} aria-hidden="true" /><div><h2 id="scenario-attendance-title">Labour schedule</h2><p>Illustrative worker-days and assumed dates</p></div></div>
      <div className="scenario-chart-insight scenario-chart-insight--labour"><UsersRound size={17} aria-hidden="true" /><span><strong>{illustrativeScenario.averageCrew.toFixed(2)}</strong> per assumed work date</span></div>
    </div>
    <figure className="scenario-month-chart scenario-attendance-chart" aria-labelledby="scenario-attendance-title">
      <ol className="scenario-month-bars">
        {illustrativeScenario.attendanceMonths.map((month) => <li key={month.month} className={selectedMonth.month === month.month ? "is-selected" : undefined}>
          <button type="button" aria-pressed={selectedMonth.month === month.month} aria-label={`${formatDate(month.month)}: ${month.workerDays} worker-days across ${month.workedDates} assumed work dates`} onClick={() => onSelectionChange({ month: month.month, day: null })}>
            <strong>{month.workerDays}</strong>
            <span className="scenario-month-bar-track" aria-hidden="true"><span style={{ height: `${month.workerDays / largest * 100}%` }} /></span>
            <time dateTime={month.month}>{formatDate(month.month).split(" ")[0]}</time>
            <small>{month.workedDates} dates</small>
          </button>
        </li>)}
      </ol>
      <figcaption>Mon, Tue, Thu and Fri assumed as workdays. Sundays and other weekdays shown as assumed non-workdays.</figcaption>
    </figure>
    <section className="scenario-calendar" aria-label={`${formatDate(selectedMonth.month)} illustrative work calendar`}>
      <div className="scenario-calendar-heading"><h3>{formatDate(selectedMonth.month)} calendar</h3><span>Tap a date for the model assumption</span></div>
      <div className="scenario-calendar-grid" role="group" aria-label={`Dates in ${formatDate(selectedMonth.month)}`}>
        {[["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => <span className="scenario-calendar-weekday" key={label}>{label}</span>), ...Array.from({ length: leadingDays }, (_, index) => <span className="scenario-calendar-empty" key={`empty-${index}`} aria-hidden="true" />), ...Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;
          const item = monthAttendance.get(day);
          const date = `${selectedMonth.month}-${String(day).padStart(2, "0")}`;
          const worked = item?.state === "worked";
          const selected = selection.day === date;
          return item
            ? <button className={`scenario-calendar-date${worked ? " is-worked" : " is-assumed-off"}${selected ? " is-selected" : ""}`} type="button" key={date} aria-pressed={selected} aria-label={`${formatDate(date, "long")}: ${worked ? `assumed workday, ${item.workers} workers` : "assumed non-workday"}`} title={worked ? `Assumed workday · ${item.workers} workers` : item.note} onClick={() => onSelectionChange({ month: selectedMonth.month, day: date })}>{day}</button>
            : <span className="scenario-calendar-date is-outside" key={date} aria-label={`${formatDate(date, "long")}: outside model range`} title="Outside the illustrative model range">{day}</span>;
        })]}
      </div>
      <div className="scenario-calendar-legend"><span><i className="is-worked" />Assumed workday</span><span><i className="is-assumed-off" />Assumed non-workday</span><span><i className="is-outside" />Outside model range</span></div>
      {selectedDay && <div className="scenario-day-detail"><div><strong>{formatDate(selectedDay.date, "long")}</strong><span>{selectedDay.state === "worked" ? `Assumed workday · ${selectedDay.workers} workers` : "Assumed non-workday"}</span></div><p>{selectedDay.note} These figures are not actual attendance records.</p><a className="text-action" href="#records" onClick={(event) => { event.preventDefault(); onSelectionChange({ recordCategory: "labour", month: selectedMonth.month, day: selectedDay.date }); }}>Open this day in Records <ArrowRight size={16} aria-hidden="true" /></a></div>}
    </section>
  </section>;
}

export function ScenarioRecordsLink({ label }: { label: string }) {
  return <a className="text-action" href="#records">{label}<ArrowRight size={16} aria-hidden="true" /></a>;
}

export function ScenarioResourceSnapshot({ onSelectionChange }: { onSelectionChange: (patch: ScenarioSelectionPatch) => void }) {
  const groupedMaterials = groupScenarioMaterials();
  const allMaterialNames = [...new Set(illustrativeScenario.materials.map((item) => item.name))];
  const materialNames = allMaterialNames.slice(0, 3);
  const equipment = groupScenarioEquipment();

  return <section className="scenario-panel scenario-resource-panel" aria-labelledby="scenario-resource-title">
    <div className="scenario-panel-heading">
      <div className="scenario-heading-label"><Package size={19} aria-hidden="true" /><div><h2 id="scenario-resource-title">Materials &amp; equipment</h2><p>{materialNames.length} of {allMaterialNames.length} material types · illustrative quantities</p></div></div>
      <a className="scenario-resource-action" href="#records" aria-label="Open the illustrative materials register" title="Open the illustrative materials register" onClick={(event) => { event.preventDefault(); onSelectionChange({ recordCategory: "materials", month: null, costCategory: null, day: null }); }}><ArrowRight size={19} aria-hidden="true" /></a>
    </div>
    <div className="scenario-resource-snapshot-list">
      {materialNames.map((name) => {
        const entries = groupedMaterials.filter((item) => item.name === name);
        return <div className="scenario-resource-snapshot-item" key={name}>
          <strong>{name}</strong>
          <ul className="scenario-resource-events">{entries.map((item) => <li key={`${item.action}-${item.specification ?? ""}-${item.unit}`}><span>{item.action}{item.specification ? ` · ${item.specification}` : ""}</span><strong>{formatScenarioQuantity(item.quantity, item.unit)}</strong><small>{[...new Set(item.months)].map((month) => formatDate(month).split(" ")[0]).join(" · ")}</small></li>)}</ul>
        </div>;
      })}
    </div>
    <div className="scenario-equipment-snapshot">
      <h3>Equipment use examples</h3>
      <ul>{equipment.map((item) => <li key={`${item.name}-${item.unit}`}><span>{item.name} · {item.action.toLowerCase()}</span><strong>{formatScenarioQuantity(item.quantity, item.unit)}</strong></li>)}</ul>
    </div>
    <p className="scenario-method-note">Separate delivery and use examples do not show stock. No equipment cost or productivity is inferred.</p>
  </section>;
}

function groupScenarioMaterials() {
  const groups = new Map<string, { name: string; specification?: string; action: string; quantity: number; unit: string; months: string[] }>();
  const labels = { purchased: "Purchased", delivered: "Delivered", used: "Used" };
  for (const item of illustrativeScenario.materials) {
    const action = labels[item.action];
    const key = [item.name, item.specification ?? "", action, item.unit].join("|");
    const current = groups.get(key) ?? { name: item.name, specification: item.specification, action, quantity: 0, unit: item.unit, months: [] };
    current.quantity += item.quantity;
    current.months.push(item.month);
    groups.set(key, current);
  }
  return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name) || a.action.localeCompare(b.action));
}

function groupScenarioEquipment() {
  const groups = new Map<string, { name: string; action: string; quantity: number; unit: string; months: string[] }>();
  const labels = { hired: "Hired", used: "Used" };
  for (const item of illustrativeScenario.equipment) {
    const action = labels[item.action];
    const key = [item.name, action, item.unit].join("|");
    const current = groups.get(key) ?? { name: item.name, action, quantity: 0, unit: item.unit, months: [] };
    current.quantity += item.quantity;
    current.months.push(item.month);
    groups.set(key, current);
  }
  return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name) || a.action.localeCompare(b.action));
}

export function ScenarioResourceQuantities({ kind }: { kind: "materials" | "equipment" }) {
  const materialMode = kind === "materials";
  const materials = groupScenarioMaterials();
  const equipment = groupScenarioEquipment();
  return <section className="scenario-panel scenario-quantity-panel" aria-labelledby={`scenario-${kind}-summary-title`}>
    <div className="scenario-panel-heading"><div><h2 id={`scenario-${kind}-summary-title`}>{materialMode ? "Material quantity examples" : "Equipment use examples"}</h2><p>{materialMode ? "All months · grouped by item, action and native unit; delivery and use stay separate." : "All months · grouped by equipment, action and unit; totals do not measure utilization."}</p></div></div>
    <div className="scenario-table-wrap"><table className="scenario-table scenario-quantity-table"><thead><tr><th scope="col">{materialMode ? "Material and action" : "Equipment and action"}</th><th scope="col">Illustrative quantity</th><th scope="col">Month(s)</th></tr></thead><tbody>
      {materialMode ? materials.map((item) => <tr key={`${item.name}-${item.action}-${item.unit}`}><th scope="row">{item.name}<small>{item.action}{item.specification ? ` · ${item.specification}` : ""}</small></th><td className="tabular-nums">{formatScenarioQuantity(item.quantity, item.unit)}</td><td>{[...new Set(item.months)].sort().map((month) => formatDate(month)).join(", ")}</td></tr>) : equipment.map((item) => <tr key={`${item.name}-${item.action}-${item.unit}`}><th scope="row">{item.name}<small>{item.action}</small></th><td className="tabular-nums">{formatScenarioQuantity(item.quantity, item.unit)}</td><td>{[...new Set(item.months)].sort().map((month) => formatDate(month)).join(", ")}</td></tr>)}
    </tbody></table></div>
    <p className="scenario-method-note">Synthetic sample values only. {materialMode ? "Loads have unspecified capacity; quantities are not a bill of quantities or measured installed stock." : "No hire cost, machine capacity or productivity is inferred."}</p>
  </section>;
}

export function ScenarioResourceQuantitiesBoth() {
  return <div className="scenario-resource-grid"><ScenarioResourceQuantities kind="materials" /><ScenarioResourceQuantities kind="equipment" /></div>;
}
