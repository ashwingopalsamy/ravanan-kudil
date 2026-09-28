export type ScenarioAttendance = {
  id: string;
  date: string;
  state: "worked" | "no_work";
  workers?: number;
  note: string;
};

export type ScenarioMonth = {
  month: string;
  paise: number;
  cumulativePaise: number;
};

export type ScenarioAllocation = {
  id: string;
  category: string;
  paise: number;
  monthly: { month: string; paise: number }[];
};

export type ScenarioMaterial = {
  id: string;
  month: string;
  action: "purchased" | "delivered" | "used";
  name: string;
  specification?: string;
  quantity: number;
  unit: string;
};

export type ScenarioEquipment = {
  id: string;
  month: string;
  action: "hired" | "used";
  name: string;
  quantity: number;
  unit: string;
  note: string;
};

export type ScenarioAttendanceMonth = {
  month: string;
  workedDates: number;
  workerDays: number;
  noWorkDates: number;
};

const startDate = "2026-03-06";
const asOf = "2026-09-28";
const millisecondsPerDay = 86_400_000;
const allocationUnitPaise = 1_000_000; // ₹0.1 lakh
const months = ["2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09"];

// Rows are categories and columns are month buckets, in ₹0.1 lakh units.
// The single matrix supplies both category totals and month totals.
const allocationMatrix: { category: string; units: number[] }[] = [
  { category: "Labour", units: [2, 4, 6, 8, 5, 8, 7] },
  { category: "TMT steel rods", units: [4, 8, 9, 12, 9, 12, 11] },
  { category: "Cement", units: [2, 4, 5, 7, 4, 6, 5] },
  { category: "Red bricks", units: [2, 4, 5, 5, 4, 5, 5] },
  { category: "M-sand", units: [1, 2, 3, 3, 2, 2, 2] },
  { category: "P-sand", units: [1, 1, 1, 2, 2, 1, 1] },
  { category: "20 mm jalli", units: [1, 1, 1, 3, 2, 2, 2] },
  { category: "40 mm jalli", units: [0, 0, 0, 2, 1, 2, 1] },
  { category: "Centering and formwork", units: [1, 2, 2, 3, 3, 4, 3] },
  { category: "Equipment", units: [0, 0, 1, 1, 2, 2, 2] },
  { category: "Other associated costs", units: [1, 2, 2, 2, 1, 3, 3] }
];

const materials: ScenarioMaterial[] = [
  { id: "tmt-delivered-apr", month: "2026-04", action: "delivered", name: "TMT steel rods", specification: "Mixed diameters; not a structural schedule", quantity: 4, unit: "tonnes" },
  { id: "tmt-used-jul", month: "2026-07", action: "used", name: "TMT steel rods", specification: "Mixed diameters", quantity: 2, unit: "tonnes" },
  { id: "cement-delivered-apr", month: "2026-04", action: "delivered", name: "Cement", quantity: 250, unit: "bags" },
  { id: "cement-used-aug", month: "2026-08", action: "used", name: "Cement", quantity: 180, unit: "bags" },
  { id: "bricks-delivered-jun", month: "2026-06", action: "delivered", name: "Red bricks", quantity: 8000, unit: "bricks" },
  { id: "bricks-used-sep", month: "2026-09", action: "used", name: "Red bricks", quantity: 6000, unit: "bricks" },
  { id: "msand-delivered-may", month: "2026-05", action: "delivered", name: "M-sand", quantity: 8, unit: "loads" },
  { id: "msand-used-jul", month: "2026-07", action: "used", name: "M-sand", quantity: 5, unit: "loads" },
  { id: "psand-delivered-jun", month: "2026-06", action: "delivered", name: "P-sand", quantity: 4, unit: "loads" },
  { id: "psand-used-aug", month: "2026-08", action: "used", name: "P-sand", quantity: 2, unit: "loads" },
  { id: "jalli20-delivered-may", month: "2026-05", action: "delivered", name: "20 mm jalli", quantity: 5, unit: "loads" },
  { id: "jalli20-used-jul", month: "2026-07", action: "used", name: "20 mm jalli", quantity: 3, unit: "loads" },
  { id: "jalli40-delivered-mar", month: "2026-03", action: "delivered", name: "40 mm jalli", quantity: 2, unit: "loads" },
  { id: "jalli40-used-apr", month: "2026-04", action: "used", name: "40 mm jalli", quantity: 1, unit: "loads" }
];

const equipment: ScenarioEquipment[] = [
  { id: "jcb-used-mar", month: "2026-03", action: "used", name: "JCB backhoe loader", quantity: 2, unit: "days", note: "Assumed demo quantity; no work task or real hire date is asserted." },
  { id: "tractor-used-apr", month: "2026-04", action: "used", name: "Tractor", quantity: 5, unit: "trips", note: "Trip capacity and route are not specified." },
  { id: "jcb-used-jun", month: "2026-06", action: "used", name: "JCB backhoe loader", quantity: 1, unit: "days", note: "Assumed demo quantity; no work task or real hire date is asserted." },
  { id: "tractor-used-aug", month: "2026-08", action: "used", name: "Tractor", quantity: 3, unit: "trips", note: "Trip capacity and route are not specified." }
];

function buildAttendance(): ScenarioAttendance[] {
  const start = Date.parse(`${startDate}T00:00:00Z`);
  const end = Date.parse(`${asOf}T00:00:00Z`);
  const workedWeekdays = new Set([1, 2, 4, 5]); // Mon, Tue, Thu, Fri; Sundays are off.
  const attendance: ScenarioAttendance[] = [];

  for (let timestamp = start; timestamp <= end; timestamp += millisecondsPerDay) {
    const date = new Date(timestamp);
    const dateString = date.toISOString().slice(0, 10);
    const weekday = date.getUTCDay();
    const ordinal = Math.round((timestamp - start) / millisecondsPerDay);
    if (workedWeekdays.has(weekday)) {
      attendance.push({
        id: `scenario-work-${dateString}`,
        date: dateString,
        state: "worked",
        workers: ordinal % 2 === 0 ? 3 : 2,
        note: "Synthetic crew count; no task or actual attendance is claimed."
      });
    } else {
      attendance.push({
        id: `scenario-off-${dateString}`,
        date: dateString,
        state: "no_work",
        note: weekday === 0 ? "Sunday off in this illustrative schedule." : "Assumed non-workday in this illustrative schedule."
      });
    }
  }
  return attendance;
}

const attendance = buildAttendance();
const allocations: ScenarioAllocation[] = allocationMatrix.map(({ category, units }, rowIndex) => ({
  id: `scenario-allocation-${rowIndex}`,
  category,
  paise: units.reduce((total, amount) => total + amount, 0) * allocationUnitPaise,
  monthly: units.flatMap((amount, monthIndex) => amount > 0 ? [{ month: months[monthIndex], paise: amount * allocationUnitPaise }] : [])
}));

const spendByMonth: ScenarioMonth[] = months.map((month, monthIndex) => {
  const paise = allocationMatrix.reduce((total, category) => total + category.units[monthIndex], 0) * allocationUnitPaise;
  return { month, paise, cumulativePaise: 0 };
}).map((entry, index, rows) => ({
  ...entry,
  cumulativePaise: rows.slice(0, index + 1).reduce((total, month) => total + month.paise, 0)
}));

const attendanceMonths: ScenarioAttendanceMonth[] = months.map((month) => {
  const entries = attendance.filter((entry) => entry.date.slice(0, 7) === month);
  return {
    month,
    workedDates: entries.filter((entry) => entry.state === "worked").length,
    workerDays: entries.reduce((total, entry) => total + (entry.workers ?? 0), 0),
    noWorkDates: entries.filter((entry) => entry.state === "no_work").length
  };
});

const elapsedDays = Math.round((Date.parse(`${asOf}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / millisecondsPerDay);
const sundaysOff = attendance.filter((entry) => entry.state === "no_work" && new Date(`${entry.date}T00:00:00Z`).getUTCDay() === 0).length;
const labourAllocationPaise = allocations.find((entry) => entry.category === "Labour")?.paise ?? 0;

export const illustrativeScenario = {
  kind: "illustrative-scenario" as const,
  startDate,
  asOf,
  elapsedDays,
  inclusiveDays: elapsedDays + 1,
  sundaysOff,
  attendance,
  attendanceMonths,
  workedDates: attendance.filter((entry) => entry.state === "worked").length,
  workerDays: attendance.reduce((total, entry) => total + (entry.workers ?? 0), 0),
  noWorkDates: attendance.filter((entry) => entry.state === "no_work").length,
  nonSundayAssumedOffDates: attendance.filter((entry) => entry.state === "no_work" && new Date(`${entry.date}T00:00:00Z`).getUTCDay() !== 0).length,
  averageCrew: attendance.filter((entry) => entry.state === "worked").reduce((total, entry) => total + (entry.workers ?? 0), 0) /
    attendance.filter((entry) => entry.state === "worked").length,
  allocations,
  totalAllocationPaise: allocations.reduce((total, entry) => total + entry.paise, 0),
  labourAllocationPaise,
  spendByMonth,
  materials,
  equipment,
  scheduleDescription: "Synthetic schedule: Monday, Tuesday, Thursday and Friday worked; Sundays off; other weekdays assumed off.",
  financeDescription: "₹25 lakh midpoint modelled as assumed category and month allocations within the owner's reported ₹24–26 lakh range. These are not payments, invoices or quotes.",
  materialsDescription: "Round sample quantities use native units and month-level labels. They are not measured quantities or a bill of quantities; load capacity is unspecified.",
  provenance: "Illustrative synthetic data, generated deterministically for interface demonstration."
};

export function assertIllustrativeScenario(): void {
  const expectedMonthlyWorkdays = [15, 17, 17, 18, 18, 17, 16];
  const expectedMonthlySpendLakhs = [1.5, 2.8, 3.5, 4.8, 3.5, 4.7, 4.2];
  const actualMonthlySpend = illustrativeScenario.spendByMonth.map((month) => month.paise / 10_000_000);

  if (illustrativeScenario.totalAllocationPaise !== 250_000_000) throw new Error("Scenario allocations must total ₹25 lakh.");
  if (illustrativeScenario.workerDays !== 296 || illustrativeScenario.workedDates !== 118) throw new Error("Scenario attendance totals do not reconcile.");
  if (illustrativeScenario.elapsedDays !== 206 || illustrativeScenario.inclusiveDays !== 207 || illustrativeScenario.sundaysOff !== 30) throw new Error("Scenario date window does not reconcile.");
  if (illustrativeScenario.noWorkDates !== 89) throw new Error("Scenario assumed non-workday total does not reconcile.");
  if (illustrativeScenario.attendanceMonths.some((month, index) => month.workedDates !== expectedMonthlyWorkdays[index])) throw new Error("Scenario monthly workdays do not reconcile.");
  if (actualMonthlySpend.some((amount, index) => amount !== expectedMonthlySpendLakhs[index])) throw new Error("Scenario monthly allocations do not reconcile.");
  if (illustrativeScenario.allocations.reduce((total, entry) => total + entry.paise, 0) !== illustrativeScenario.spendByMonth.reduce((total, entry) => total + entry.paise, 0)) throw new Error("Scenario category and monthly allocation totals differ.");
}

assertIllustrativeScenario();

const scenarioQuantityNumber = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const scenarioSingularUnits: Record<string, string> = {
  bags: "bag",
  bricks: "brick",
  days: "day",
  loads: "load",
  pieces: "piece",
  trips: "trip",
  tonnes: "tonne"
};

export function formatScenarioQuantity(quantity: number, unit: string): string {
  const label = quantity === 1 ? scenarioSingularUnits[unit] ?? unit : unit;
  return `${scenarioQuantityNumber.format(quantity)} ${label}`;
}
