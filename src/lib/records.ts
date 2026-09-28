import { z } from "zod";
import publicData from "../../data/public-records.json";

function isDay(value: string): boolean {
  if (!/^\d{4}-(0[1-9]|1[0-2])-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function isMonth(value: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

const day = z.string().refine(isDay, "Expected a valid YYYY-MM-DD date");
const entryDate = z.string().refine((value) => isDay(value) || isMonth(value), "Expected a valid month or day");
const text = z.string().trim().min(1);
const id = z.string().regex(/^[a-z0-9][a-z0-9-]*$/);
const safeAmount = z.number().int().nonnegative().refine(Number.isSafeInteger, "Amount exceeds safe integer range");
const estimatedArea = z.number().int().positive().refine(Number.isSafeInteger, "Area exceeds safe integer range");
const sourceSchema = z.strictObject({
  kind: z.enum(["owner_report", "site_note", "document", "photo", "other"]),
  date: entryDate,
  description: text.optional()
});
const correctionSchema = z.strictObject({ date: day, note: text });
const provenance = { source: sourceSchema, corrections: z.array(correctionSchema).optional() };

const entrySchema = z.strictObject({
  id,
  date: entryDate,
  title: text,
  body: text,
  ...provenance
});

const financeSchema = z.strictObject({
  id,
  date: day,
  kind: z.enum(["quote", "invoice", "payment", "refund"]),
  description: text,
  category: text,
  amountPaise: safeAmount,
  ...provenance,
  note: text.optional(),
  relatedId: id.optional()
});

const attendanceSchema = z.strictObject({
  id,
  date: day,
  state: z.enum(["worked", "no_work", "unknown"]),
  workers: z.number().int().positive().refine(Number.isSafeInteger, "Worker count exceeds safe integer range").optional(),
  ...provenance,
  note: text.optional()
}).refine((record) => record.workers === undefined || record.state === "worked", {
  message: "Worker counts require a worked date"
});

const materialSchema = z.strictObject({
  id,
  date: day,
  action: z.enum(["purchased", "delivered", "used", "returned"]),
  name: text,
  specification: text.optional(),
  quantity: z.number().positive().finite(),
  unit: text,
  ...provenance
});

const equipmentSchema = z.strictObject({
  id,
  date: day,
  action: z.enum(["hired", "used", "returned"]),
  name: text,
  quantity: z.number().positive().finite(),
  unit: text,
  ...provenance,
  note: text.optional()
});

const publicRecordsSchema = z.strictObject({
  schemaVersion: z.literal(2),
  publishedAt: day,
  project: z.strictObject({
    paperworkStarted: entryDate,
    constructionStarted: day,
    areasSqFt: z.strictObject({
      groundFloor: estimatedArea,
      firstFloor: estimatedArea,
      porchMin: estimatedArea,
      porchMax: estimatedArea
    })
  }),
  entries: z.array(entrySchema),
  finance: z.array(financeSchema),
  attendance: z.array(attendanceSchema),
  materials: z.array(materialSchema),
  equipment: z.array(equipmentSchema)
}).superRefine((records, context) => {
  const { project } = records;
  if (project.paperworkStarted > project.constructionStarted || project.constructionStarted > records.publishedAt) {
    context.addIssue({ code: "custom", message: "Project milestones must be chronological and no later than publication" });
  }
  if (project.areasSqFt.porchMin > project.areasSqFt.porchMax) {
    context.addIssue({ code: "custom", message: "Porch area minimum exceeds maximum" });
  }
  for (const [id, date] of [["paperwork-began", project.paperworkStarted], ["construction-began", project.constructionStarted]]) {
    const milestone = records.entries.find((entry) => entry.id === id);
    if (!milestone || milestone.date !== date) {
      context.addIssue({ code: "custom", message: `Project milestone and journal entry disagree: ${id}` });
    }
  }
  for (const collection of ["entries", "finance", "attendance", "materials", "equipment"] as const) {
    const ids = new Set<string>();
    for (const record of records[collection]) {
      if (ids.has(record.id)) context.addIssue({ code: "custom", message: `Duplicate ${collection} ID: ${record.id}` });
      ids.add(record.id);
      const recordDate = record.date.length === 7 ? `${record.date}-01` : record.date;
      if (recordDate > records.publishedAt) context.addIssue({ code: "custom", message: `${collection} record is dated after publication: ${record.id}` });
      const sourceDate = record.source.date.length === 7 ? `${record.source.date}-01` : record.source.date;
      if (sourceDate > records.publishedAt) context.addIssue({ code: "custom", message: `${collection} source is dated after publication: ${record.id}` });
      let previousCorrectionDate = "";
      for (const correction of record.corrections ?? []) {
        if (correction.date > records.publishedAt) {
          context.addIssue({ code: "custom", message: `${collection} correction is dated after publication: ${record.id}` });
        }
        if (correction.date < previousCorrectionDate) {
          context.addIssue({ code: "custom", message: `${collection} corrections are out of order: ${record.id}` });
        }
        previousCorrectionDate = correction.date;
      }
    }
  }
  const financeIds = new Set(records.finance.map((record) => record.id));
  for (const record of records.finance) {
    if (record.relatedId && (!financeIds.has(record.relatedId) || record.relatedId === record.id)) {
      context.addIssue({ code: "custom", message: `Invalid related finance record: ${record.id}` });
    }
  }
  const attendanceDates = new Set<string>();
  for (const record of records.attendance) {
    if (attendanceDates.has(record.date)) context.addIssue({ code: "custom", message: `Duplicate attendance date: ${record.date}` });
    attendanceDates.add(record.date);
  }
  const workerDays = records.attendance.reduce((total, record) => total + BigInt(record.workers ?? 0), 0n);
  if (workerDays > BigInt(Number.MAX_SAFE_INTEGER)) {
    context.addIssue({ code: "custom", message: "Recorded worker-days exceed safe integer range" });
  }
  const spend = records.finance.reduce((total, record) => {
    if (record.kind === "payment") return total + BigInt(record.amountPaise);
    if (record.kind === "refund") return total - BigInt(record.amountPaise);
    return total;
  }, 0n);
  if (spend > BigInt(Number.MAX_SAFE_INTEGER) || spend < BigInt(Number.MIN_SAFE_INTEGER)) {
    context.addIssue({ code: "custom", message: "Recorded spend exceeds safe integer range" });
  }
  const months = new Map<string, bigint>();
  for (const record of records.finance) {
    if (record.kind !== "payment" && record.kind !== "refund") continue;
    const month = record.date.slice(0, 7);
    months.set(month, (months.get(month) ?? 0n) + BigInt(record.kind === "payment" ? record.amountPaise : -record.amountPaise));
  }
  for (const [month, value] of months) {
    if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < BigInt(Number.MIN_SAFE_INTEGER)) {
      context.addIssue({ code: "custom", message: `Monthly spending exceeds safe integer range: ${month}` });
    }
  }
});

export type PublicRecords = z.infer<typeof publicRecordsSchema>;
export type JournalEntry = PublicRecords["entries"][number];
export type FinanceRecord = PublicRecords["finance"][number];
export type AttendanceRecord = PublicRecords["attendance"][number];
export type MaterialRecord = PublicRecords["materials"][number];
export type EquipmentRecord = PublicRecords["equipment"][number];
export type PublicSource = z.infer<typeof sourceSchema>;

export const parsedRecords = publicRecordsSchema.safeParse(publicData);

export function formatDate(value: string, format: "short" | "long" = "short"): string {
  const monthOnly = value.length === 7;
  const date = new Date(`${monthOnly ? `${value}-01` : value}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-IN", {
    day: monthOnly ? undefined : "numeric",
    month: format === "long" ? "long" : "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
}

const sourceKindLabel: Record<PublicSource["kind"], string> = {
  owner_report: "Owner report",
  site_note: "Site note",
  document: "Document",
  photo: "Photograph",
  other: "Other source"
};

export function sourceTypeLabel(source: PublicSource): string {
  return sourceKindLabel[source.kind];
}

export function formatSource(source: PublicSource): string {
  return `${sourceTypeLabel(source)} · ${formatDate(source.date)}${source.description ? ` · ${source.description}` : ""}`;
}

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

export function formatMoney(paise: number): string {
  if (!Number.isSafeInteger(paise)) throw new RangeError("Money must be a safe integer number of paise");
  const amount = BigInt(paise);
  const absolute = amount < 0n ? -amount : amount;
  const rupees = absolute / 100n;
  const remainder = absolute % 100n;
  return `${amount < 0n ? "-" : ""}${currency.format(Number(rupees))}${remainder ? `.${String(remainder).padStart(2, "0")}` : ""}`;
}

const areaNumber = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

export function formatArea(squareFeet: number): string {
  return areaNumber.format(squareFeet);
}

export function elapsedCalendarDays(start: string, end: string): number {
  const startTime = Date.parse(`${start}T00:00:00Z`);
  const endTime = Date.parse(`${end}T00:00:00Z`);
  return Math.round((endTime - startTime) / 86_400_000);
}

export function recordedSpend(records: PublicRecords): number | null {
  const payments = records.finance.filter((item) => item.kind === "payment" || item.kind === "refund");
  if (payments.length === 0) return null;
  const sum = payments.reduce((total, item) => total + (item.kind === "payment" ? BigInt(item.amountPaise) : -BigInt(item.amountPaise)), 0n);
  return Number(sum);
}

export function workSummary(records: PublicRecords): { workdays: number | null; workerDays: number | null; incomplete: boolean } {
  if (records.attendance.length === 0) return { workdays: null, workerDays: null, incomplete: false };
  const worked = records.attendance.filter((day) => day.state === "worked");
  const counted = worked.filter((day) => day.workers !== undefined);
  const workerDays = counted.reduce((total, day) => total + (day.workers ?? 0), 0);
  return {
    workdays: worked.length,
    workerDays: counted.length > 0 || worked.length === 0 ? workerDays : null,
    incomplete: counted.length < worked.length
  };
}

export type AttendanceMonth = {
  month: string;
  recordedDates: number;
  workdays: number;
  knownWorkerDays: number;
  missingHeadcounts: number;
};

export function attendanceByMonth(records: PublicRecords): AttendanceMonth[] {
  const months = new Map<string, AttendanceMonth>();
  for (const entry of records.attendance) {
    const month = entry.date.slice(0, 7);
    const summary = months.get(month) ?? { month, recordedDates: 0, workdays: 0, knownWorkerDays: 0, missingHeadcounts: 0 };
    summary.recordedDates += 1;
    if (entry.state === "worked") {
      summary.workdays += 1;
      if (entry.workers === undefined) summary.missingHeadcounts += 1;
      else summary.knownWorkerDays += entry.workers;
    }
    months.set(month, summary);
  }
  return [...months.values()].sort((left, right) => right.month.localeCompare(left.month));
}

export function sortedEntries(records: PublicRecords): JournalEntry[] {
  return [...records.entries].sort((left, right) => right.date.localeCompare(left.date));
}

export function monthlySpend(records: PublicRecords): { month: string; paise: number }[] {
  const months = new Map<string, bigint>();
  for (const record of records.finance) {
    if (record.kind !== "payment" && record.kind !== "refund") continue;
    const month = record.date.slice(0, 7);
    months.set(month, (months.get(month) ?? 0n) + (record.kind === "payment" ? BigInt(record.amountPaise) : -BigInt(record.amountPaise)));
  }
  return [...months].sort(([left], [right]) => left.localeCompare(right)).map(([month, paise]) => ({ month, paise: Number(paise) }));
}
