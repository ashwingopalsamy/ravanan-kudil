import { illustrativeScenario } from "./scenario";

export type ScenarioRecordCategory = "finance" | "labour" | "materials" | "equipment";
export type ScenarioSelection = {
  month?: string;
  costCategory?: string;
  day?: string;
  recordCategory: ScenarioRecordCategory;
};
export type ScenarioSelectionPatch = {
  month?: string | null;
  costCategory?: string | null;
  day?: string | null;
  recordCategory?: ScenarioRecordCategory | null;
};

const months = new Set(illustrativeScenario.spendByMonth.map(({ month }) => month));
const costCategories = new Set(illustrativeScenario.allocations.map(({ category }) => category));
const recordCategories = new Set<ScenarioRecordCategory>(["finance", "labour", "materials", "equipment"]);
const dates = new Set(illustrativeScenario.attendance.map(({ date }) => date));

export function readScenarioSelection(search: string, mode: "scenario" | "record" = "scenario"): ScenarioSelection {
  const params = new URLSearchParams(search);
  const recordCategory = params.get("register") as ScenarioRecordCategory | null;
  const validRecordCategory = recordCategory && recordCategories.has(recordCategory) ? recordCategory : "finance";
  if (mode === "record") return { recordCategory: validRecordCategory };
  const month = params.get("month") ?? undefined;
  const costCategory = params.get("cost") ?? undefined;
  const day = params.get("day") ?? undefined;
  const validDay = day && dates.has(day) ? day : undefined;

  const validMonth = month && months.has(month) ? month : undefined;
  const dayMatchesMonth = Boolean(validDay && (!validMonth || validDay.slice(0, 7) === validMonth));

  return {
    month: validMonth ?? (dayMatchesMonth ? validDay?.slice(0, 7) : undefined),
    costCategory: costCategory && costCategories.has(costCategory) ? costCategory : undefined,
    day: dayMatchesMonth ? validDay : undefined,
    recordCategory: validRecordCategory
  };
}

export function writeScenarioSelection(search: string, patch: ScenarioSelectionPatch): string {
  const params = new URLSearchParams(search);
  const keys = { month: "month", costCategory: "cost", day: "day", recordCategory: "register" } as const;
  for (const key of Object.keys(keys) as (keyof typeof keys)[]) {
    if (!(key in patch)) continue;
    const value = patch[key];
    const param = keys[key];
    if (value) params.set(param, value);
    else params.delete(param);
  }
  const selectedMonth = params.get("month");
  const selectedDay = params.get("day");
  if (selectedMonth && selectedDay && selectedMonth !== selectedDay.slice(0, 7)) params.delete("day");
  return params.toString();
}
